# El pipeline de render

## Por qué importa

La lección anterior usaba la GPU para calcular. Esta la usa para lo que nació: **dibujar**. El camino es el pipeline gráfico de la lección «CPU y GPU» (vértices, vertex shader, rasterización, fragment shader, mezcla), el mismo que programaste con WebGL 2 en «WebGL desde JavaScript». Cambia la forma: en lugar de activar un programa, enlazar búferes y fijar estados antes de cada dibujo, en WebGPU todo eso se describe **una vez** en un objeto, el *render pipeline*, y cada dibujo es una pasada que lo usa.

La lección hace el recorrido del módulo de WebGL con las piezas nuevas: el triángulo, leer sus píxeles, los vértices desde un búfer, los uniforms con un *bind group*, animar sin calentar la máquina, el tamaño del lienzo, muchas copias en un solo encargo, la transparencia y una imagen como textura. Como allí, cada ejemplo dibuja una vez al cargar y comprueba el resultado leyendo píxeles de la GPU, y el que se anima lo hace con un botón.

## El primer triángulo, paso a paso

| Paso | Llamadas | En WebGL 2 era |
|---|---|---|
| 1. el dispositivo | `requestAdapter`, `requestDevice` | `getContext('webgl2')` |
| 2. el lienzo | `getContext('webgpu')`, `canvas.width/height`, `context.configure({ device, format })` | el tamaño y `gl.viewport` |
| 3. los shaders | `createShaderModule({ code })` | `createShader`, `compileShader` |
| 4. el pipeline | `createRenderPipeline({ vertex, fragment, primitive })` | `linkProgram`, `vertexAttribPointer`, `blendFunc`… |
| 5. la pasada | `beginRenderPass({ colorAttachments })`, `setPipeline`, `draw`, `end` | `clearColor`, `clear`, `useProgram`, `drawArrays` |
| 6. enviar | `queue.submit([encoder.finish()])` | cada llamada ya era un encargo |

El primer ejemplo los hace todos a mano. Los vértices ni siquiera necesitan un búfer: el vertex shader los saca de un array escrito en el propio WGSL, usando `@builtin(vertex_index)`, el número de vértice que la GPU le pasa (0, 1 y 2 para un triángulo).

[[exercise:01-primer-triangulo.md]]

[[exercise:01-primer-triangulo.md-(script.js)]]

```text
el mismo lienzo como 2d → null
enviado → 1 pasada, 1 draw(3), 1 submit
// En el Mac del curso:
formato → bgra8unorm
textura → 480 × 320 · bgra8unorm
```

Las piezas, una a una:

- **El contexto.** `canvas.getContext('webgpu')` convierte el lienzo en un `GPUCanvasContext`, y como en WebGL un lienzo solo tiene **un** tipo de contexto: después, `'2d'` da `null`. `configure()` lo conecta con un dispositivo y fija el **formato** de sus píxeles: el que prefiere la pantalla, `getPreferredCanvasFormat()`. `alphaMode: 'opaque'` (el valor por defecto) dice que el lienzo es opaco: la página no se ve a través de él.
- **El pipeline.** Reúne los dos puntos de entrada del módulo, la **topología** (`'triangle-list'`, cada 3 vértices un triángulo; también hay `'triangle-strip'`, `'line-list'`, `'line-strip'` y `'point-list'`) y los **destinos** del dibujo (`targets`), con su formato. `@location(0)` en la salida del fragment shader es el primer destino de esa lista. Todo se valida al crearlo; si algo no encaja, el error llega aquí, no en cada dibujo.
- **La pasada.** `beginRenderPass` recibe los *color attachments*, las texturas donde se dibuja: aquí, la del lienzo para este fotograma (`getCurrentTexture()`). `loadOp: 'clear'` borra la textura con `clearValue` (de 0 a 1, como en GLSL) al empezar, y `storeOp: 'store'` guarda el resultado al terminar. Con `loadOp: 'load'` se conserva lo que hubiera; con `storeOp: 'discard'`, lo dibujado se tira (útil para texturas intermedias).
- **El envío.** `submit` manda el encargo; cuando la tarea de JavaScript termina, el navegador muestra la textura en el lienzo. No hay `requestAnimationFrame` ni bucle: se dibuja una vez y la imagen se queda.

### Coordenadas

El vertex shader devuelve **coordenadas de recorte**, igual que en WebGL: de -1 a 1 en los dos ejes, con la y hacia arriba. Pero las coordenadas de las **texturas** y del lienzo (al leer píxeles, en `setViewport`, en `@builtin(position)` dentro del fragment shader) empiezan **arriba** a la izquierda, con la y hacia abajo, como en el canvas 2D y en CSS. En WebGL, `readPixels` contaba desde abajo; en WebGPU, la fila 0 es la de arriba.

```text
 vertex shader (clip space)              textura / lienzo (píxeles)
      (-1, 1) ┌──────────┐ (1, 1)          (0, 0) ┌──────────┐ (ancho, 0)
              │  (0, 0)  │                        │          │
     (-1, -1) └──────────┘ (1, -1)       (0, alto)└──────────┘ (ancho, alto)
        la y sube                               la y baja
```

## WebGL 2 y WebGPU, el mismo triángulo

El ejemplo 01 de «WebGL desde JavaScript» y el de aquí dibujan el mismo triángulo con los mismos colores, y ocupan casi lo mismo: unas 60 líneas cada uno, contando los shaders. WebGPU no es más corto; es más **explícito**:

| | WebGL 2 | WebGPU |
|---|---|---|
| líneas del ejemplo (código y shaders) | unas 60 | unas 60 |
| los shaders | dos textos, uno por etapa, en `<script>` | un módulo con varios puntos de entrada |
| dónde vive el estado | en el contexto: programa en uso, búferes enlazados, viewport | en el pipeline y en los bind groups, que no cambian |
| cómo se leen los vértices | `vertexAttribPointer` sobre el búfer enlazado | `vertex.buffers` del pipeline y `setVertexBuffer` en la pasada |
| borrar | `clearColor` + `clear`, en cualquier momento | `loadOp: 'clear'` al empezar cada pasada |
| errores | `gl.getError()` al final; `getShaderInfoLog` | mensajes con etiquetas; el pipeline se valida entero al crearse |
| cuándo se ejecuta | cada llamada es un encargo | al hacer `submit` |
| el tamaño del dibujo | `gl.viewport`, a mano en cada cambio de tamaño | la pasada cubre la textura entera por defecto |

## Leer un píxel

Para comprobar lo dibujado se copia un píxel de la textura del lienzo a un búfer con `copyTextureToBuffer`, en el mismo encargo que el dibujo. Hacen falta dos cosas: `usage: RENDER_ATTACHMENT | COPY_SRC` en `configure()`, para que la textura del lienzo pueda ser el origen de una copia, y hacer la copia **antes** de que termine la tarea, porque la textura del lienzo caduca en cuanto el navegador la muestra (más abajo, el ejemplo 07). Y aparecen dos trampas:

[[exercise:02-leer-un-pixel.md-(script.js)]]

```text
🐛 bytesPerRow 400, 1.er error → bytesPerRow (400) is not a multiple of 256.
   2.º error → [Invalid CommandBuffer] is invalid due to a previous error.
// En el Mac del curso (formato bgra8unorm):
🐛 los 4 bytes, tal cual → 72, 29, 225, 255 · ¿es 225, 29, 72? false
✅ en orden RGBA (bgra8unorm) → 225, 29, 72, 255
```

[[exercise:02-leer-un-pixel.md]]

### 🐛 `bytesPerRow`, de 256 en 256

Al copiar entre texturas y búferes, cada fila ocupa en el búfer un múltiplo de **256 bytes**, aunque la fila tenga un solo píxel de 4: es la regla de alineación más grande de WebGPU, la del relleno de las filas de un BMP llevada al extremo. Con `bytesPerRow: 400`, el codificador queda inválido y avisa al cerrarse con `finish()`; después, el `submit` falla porque usa un encargo inválido. Es la cascada de la lección 1: lee el **primer** error. Para leer una región de muchas filas, `bytesPerRow` se calcula redondeando hacia arriba: `Math.ceil(ancho * 4 / 256) * 256`.

### 🐛 El lienzo es BGRA

El fragment shader devolvió `(0.882, 0.114, 0.282, 1)`, el rojo frambuesa `#e11d48` (225, 29, 72). Pero los bytes llegan como `72, 29, 225, 255`: el formato del lienzo en este Mac es `bgra8unorm`, que guarda los canales en el orden **azul, verde, rojo, alfa**. El shader no se entera (escribe un `vec4f` en orden RGBA y la GPU lo coloca), pero quien lee los bytes sí. Pasa lo mismo con los sistemas que usan BGRA internamente (Windows y macOS para la pantalla); en Android, el formato preferido suele ser `rgba8unorm`. Por eso el código mira el formato antes de interpretar los bytes, y `readPixels` de `assets/webgpu/utils.js` los devuelve siempre en orden RGBA.

Otra tentación para comprobar un dibujo es copiar el lienzo de WebGPU a un canvas 2D con `drawImage` y leerlo con `getImageData`. En Chrome, eso da píxeles transparentes (0, 0, 0, 0) aunque el lienzo se vea bien, también fotogramas después: en cuanto se muestra lo dibujado, el lienzo empieza un búfer de dibujo nuevo y vacío. Lee la textura, como aquí.

## 🐛 El `submit` que falta

En WebGL, `drawArrays` encargaba el dibujo. En WebGPU, grabar una pasada **no encarga nada**: el codificador apunta los comandos, `finish()` los cierra y solo `queue.submit()` los manda a la GPU. Sin ese último paso, todo lo anterior es papel mojado, y no hay ningún error:

[[exercise:03-olvidar-submit.md]]

```text
🐛 sin submit → centro: 0, 0, 0, 0 (la textura, sin tocar)
✅ con submit → centro: 225, 29, 72, 255
```

La textura de un lienzo empieza en negro transparente (cuatro ceros), y así se queda. Es fácil olvidarlo en una función auxiliar que «dibuja» y devuelve el encargo, como `recordTriangle` aquí: el nombre ayuda a recordar quién tiene que enviarlo. Fíjate también en que **un dispositivo** sirve a los dos lienzos: cada uno tiene su contexto y su textura, pero comparten el pipeline.

## Vértices desde un búfer

Los arrays escritos en el shader valen para un triángulo; una malla de verdad llega en un **búfer de vértices** (`GPUBufferUsage.VERTEX`). Lo que en WebGL hacía `vertexAttribPointer` aquí va en el pipeline, en `vertex.buffers`: cuántos bytes ocupa cada vértice (`arrayStride`) y, para cada atributo, en qué byte empieza (`offset`), su formato y en qué `@location` del shader entra (`shaderLocation`). Es la lección de stride y offset de WebGL, ahora sin margen para el despiste: todo en bytes, con nombre, y validado al crear el pipeline.

[[exercise:04-bufer-de-vertices.md]]

[[exercise:04-bufer-de-vertices.md-(script.js)]]

```text
un vértice → 20 bytes (arrayStride) · el color empieza en el byte 8 (offset)
búfer de vértices → 120 bytes
centro → 128, 0, 127, 255
esquina de arriba a la izquierda → 15, 23, 42, 255
```

En la pasada, `setVertexBuffer(0, búfer)` conecta el búfer con la posición 0 de esa lista. El color pasa del vertex shader al fragment shader dentro de una estructura, con `@location(0)` en el campo: es el *varying* de WebGL, y llega igual de **interpolado**. En el centro del lienzo, a medio camino entre los vértices azules y los rojos, sale `128, 0, 127`: el mismo número que en el ejemplo de WebGL, porque el píxel central está medio píxel a la derecha de la mitad exacta. Los formatos más usados:

| `format` | En el shader | Bytes | Para |
|---|---|---|---|
| `'float32'`, `'float32x2'`, `'float32x3'`, `'float32x4'` | `f32`, `vec2f`, `vec3f`, `vec4f` | 4, 8, 12, 16 | posiciones, normales, coordenadas de textura |
| `'unorm8x4'` | `vec4f` (de 0 a 1) | 4 | colores en bytes: 255 llega como 1.0 |
| `'uint32'`, `'sint32'` | `u32`, `i32` | 4 | identificadores, índices |
| `'float16x2'`, `'float16x4'` | `vec2f`, `vec4f` | 4, 8 | datos que caben en media precisión |

Con índices, como en WebGL, cada vértice compartido se guarda una vez: un búfer `INDEX` con un `Uint16Array`, `pass.setIndexBuffer(búfer, 'uint16')` y `pass.drawIndexed(número de índices)`.

## Uniforms y bind groups

Los datos que valen igual para todos los vértices y píxeles de un dibujo (un color, una escala, el tiempo, una matriz) van en un **búfer de uniforms** (`GPUBufferUsage.UNIFORM`), que el shader declara con `var<uniform>`. Se conecta como los búferes de almacenamiento: con un bind group creado sobre `pipeline.getBindGroupLayout(0)` y `pass.setBindGroup(0, …)` en la pasada. Y sus estructuras siguen las reglas de alineación de la lección anterior:

[[exercise:05-uniforms-y-alineacion.md]]

[[exercise:05-uniforms-y-alineacion.md-(script.js)]]

```text
🐛 búfer de 16 bytes → Binding size (16) of [Buffer "parámetros de 16 bytes"] is smaller than the minimum binding size (32).
🐛 32 bytes sin hueco → centro: 0, 0, 0, 255 (el color leyó ceros)
✅ 32 bytes con hueco → centro: 225, 29, 72, 255
```

### 🐛 La estructura mide 32 bytes

`struct Params { scale: f32, color: vec3f }` parece de 16 bytes (cuatro floats), pero el `vec3f` se alinea a 16: el color empieza en el byte 16 y la estructura mide 32. Hay dos niveles de error. Con un búfer de 16 bytes, WebGPU se da cuenta: con `layout: 'auto'`, el bind group sabe el tamaño mínimo de la estructura y rechaza un búfer más pequeño. Con 32 bytes y los datos sin el hueco, nadie se queja: el color está en los bytes 4 a 15 y el shader lo lee de los bytes 16 a 27, donde no hay más que ceros, y el triángulo sale negro. La solución es escribir siguiendo el mapa (`[escala, 0, 0, 0, r, g, b, 0]`), o reordenar los campos para no dejar huecos.

| | `var<uniform>` | `var<storage>` |
|---|---|---|
| tamaño | pequeño: 64 KiB por binding (`maxUniformBufferBindingSize`) | grande: 128 MiB por binding, por defecto |
| acceso | solo lectura | lectura, o lectura y escritura en los compute shaders |
| para | parámetros de un dibujo: colores, matrices, tiempo | arrays de datos: partículas, píxeles, resultados |

## Dibujar bajo demanda

Las reglas de animación del módulo de WebGL siguen valiendo, y en un portátil sin ventilador más que nunca: un fotograma quieto al cargar, y la animación solo cuando se pide, con un final. En cada fotograma, el bucle hace tres cosas: `writeBuffer` con el tiempo (4 bytes, desde el mismo `Float32Array` de siempre: nada de crear arrays nuevos en cada vuelta, lección «Memoria y recolector de basura»), `getCurrentTexture()` para la textura de **ese** fotograma, y un `submit`.

[[exercise:06-dibujar-bajo-demanda.md]]

```text
Listo: un fotograma dibujado; pulsa «Animar»
// Tras pulsar «▶ Animar» y esperar 10 s:
▶ en marcha: writeBuffer + 1 submit por fotograma
⏹ terminado: 10 s
// Si pulsas «⏹ Parar» antes de tiempo:
⏹ parado
```

El pipeline, el bind group y los búferes se crean una sola vez, al cargar; en cada fotograma solo viajan 4 bytes. Es la idea de las 10 000 partículas de «WebGL desde JavaScript», y el diseño de WebGPU la hace natural: lo caro se prepara antes, y dibujar es barato. El bucle se para solo a los 10 s, con «Parar» o al ocultar la página, y con «reducir movimiento» el triángulo se queda quieto.

## El tamaño del lienzo y la textura de cada fotograma

El lienzo de WebGPU sigue la regla del canvas 2D y de WebGL: su mapa de bits mide el tamaño CSS × `devicePixelRatio`, y un `ResizeObserver` lo mantiene al día. Pero aquí no hay viewport que reajustar: `getCurrentTexture()` da una textura del tamaño **actual** del lienzo, y la pasada la cubre entera por defecto. Eso sí, la textura dura un fotograma:

[[exercise:07-textura-de-cada-fotograma.md]]

```text
¿lienzo = CSS × devicePixelRatio? → true
¿textura = lienzo? → true
Listo: pulsa uno de los dos botones
// Tras pulsar «🐛 Con la textura guardada»:
🐛 textura guardada → Destroyed texture [Texture] used in a submit.
// Tras pulsar «✅ Con getCurrentTexture()»:
✅ getCurrentTexture() → sin errores · ¿la misma que al cargar? false
```

[[exercise:07-textura-de-cada-fotograma.md-(script.js)]]

### 🐛 Guardar la textura del lienzo

Cuando el navegador muestra lo dibujado, **destruye** la textura que se usó y prepara otra para el fotograma siguiente; el siguiente `getCurrentTexture()` la devuelve, con el tamaño que tenga el lienzo entonces. Una textura guardada «para no pedirla cada vez» sirve en el primer fotograma y en ninguno más: el lienzo no cambia y solo queda el error. (El mensaje real nombra la textura con una etiqueta interna del navegador, que en este Mac empieza por `IOSurface(` y cambia de un sistema a otro; el ejemplo la sustituye por `[Texture]`.) La regla: llama a `getCurrentTexture()` al empezar **cada** fotograma, y nunca la guardes entre fotogramas (las texturas propias, las de `createTexture`, sí se guardan y se reutilizan).

## Muchas copias en un encargo: instancias

En «WebGL desde JavaScript» las partículas eran puntos, y para repetir una forma con varios vértices se citaba el dibujo por **instancias**. En WebGPU es el segundo argumento de `draw`: `draw(6, 12)` dibuja 6 vértices (un rectángulo) 12 veces. El vertex shader sabe qué copia está dibujando por `@builtin(instance_index)`, y un búfer con `stepMode: 'instance'` avanza una vez por **copia** en lugar de una vez por vértice (el `vertexAttribDivisor` de WebGL). Un gráfico de barras, en un solo encargo:

[[exercise:08-instancias.md]]

```text
12 barras → draw(6, 12): 6 vértices × 12 instancias
búfer de instancias → 96 bytes (8 por barra)
agosto, la más alta, por dentro → 245, 158, 11, 255
febrero, por dentro → 148, 163, 184, 255
febrero, por encima → 15, 23, 42, 255
```

Cada barra solo aporta 8 bytes (su altura y si va resaltada); la forma está en el shader y la posición sale del número de instancia. Con 12 barras da igual, pero el mismo código dibuja 100 000 (estrellas, árboles, letras de un texto) con el mismo único encargo. El gráfico es una imagen, así que su información está también en texto: la descripción del lienzo y la tabla de datos.

## Transparencia

En WebGL, la mezcla era un estado global (`gl.enable(gl.BLEND)`, `gl.blendFunc`). En WebGPU es parte del pipeline, en cada destino: `targets: [{ format, blend: { color, alpha } }]`, con la misma fórmula, `resultado = nuevo × srcFactor + lo que había × dstFactor`. Un pipeline con mezcla y otro sin ella son dos objetos distintos, y el ejemplo usa uno en cada mitad del lienzo con `pass.setViewport`:

[[exercise:09-mezcla.md]]

```text
sin blend → 147, 95, 7, 153
con blend → 153, 104, 23, 255
```

Sin mezcla, el color premultiplicado sustituye al fondo tal cual: `245 × 0,6 = 147` y alfa 153, y como el lienzo es opaco (`alphaMode: 'opaque'`), se ve un ámbar oscuro. Con `srcFactor: 'one'` y `dstFactor: 'one-minus-src-alpha'` (la receta premultiplicada de la lección «WebGL desde JavaScript»), el 40 % del fondo se suma y el alfa llega a 1: los mismos `153, 104, 23, 255` que allí. Para un lienzo **transparente**, que deje ver la página por detrás, se configura con `alphaMode: 'premultiplied'` y se escriben colores premultiplicados.

## Texturas

Una textura de WebGPU se crea con su tamaño, su formato y sus usos (`createTexture`), y una imagen se sube con `queue.copyExternalImageToTexture`, desde un `ImageBitmap`, un `<canvas>`, un `<video>` o un `VideoFrame`. Lo que en WebGL eran parámetros de la textura (`NEAREST` o `LINEAR`, repetir o estirar) aquí es un objeto aparte, el **sampler**, y el shader recibe los dos y los junta en `textureSample(textura, sampler, uv)`:

[[exercise:10-textura-de-una-imagen.md]]

[[exercise:10-textura-de-una-imagen.md-(script.js)]]

```text
imagen → 16 × 12 · textura rgba8unorm
arriba a la izquierda (cielo) → 125, 211, 252, 255
el sol → 250, 204, 21, 255
abajo a la derecha (hierba) → 22, 163, 74, 255
```

Es la imagen de la lección «Texturas y framebuffers», y allí tenía un 🐛: subida tal cual, salía cabeza abajo, porque WebGL pone la primera fila de la textura en `v = 0`, **abajo**. En WebGPU, la fila 0 de una textura está **arriba**, como en la imagen, así que basta con que la coordenada `v` crezca hacia abajo (`0.5 - p.y * 0.5` en el vertex shader) y no hay que voltear nada. Los colores llegan exactos porque el PNG no tiene perfil de color y el filtro `nearest` no mezcla vecinos. Y la regla de las imágenes de otro origen sigue en pie: sin `crossOrigin = 'anonymous'` (y un servidor con CORS), `copyExternalImageToTexture` lanza un `SecurityError`, y en las tarjetas de LearnWeb toda imagen es de otro origen.

## Bestiario

- **Los colores leídos salen cambiados: el rojo donde va el azul.**
  Síntoma: un píxel que debería ser `225, 29, 72` se lee como `72, 29, 225`.
  Causa: el lienzo usa el formato que prefiere la pantalla, `bgra8unorm` en este Mac, que guarda los bytes en orden azul, verde, rojo, alfa.
  Solución: comprueba el formato (`texture.format`) y ordena los bytes antes de interpretarlos; en tus propias texturas, elige `rgba8unorm`.
  → [ver ejemplo](02-leer-un-pixel.md)
- **`bytesPerRow (400) is not a multiple of 256`, seguido de `[Invalid CommandBuffer] is invalid`.**
  Síntoma: una copia entre una textura y un búfer falla, y después falla el envío entero.
  Causa: en esas copias, cada fila ocupa en el búfer un múltiplo de 256 bytes; el error deja inválido el codificador y contagia al `submit`.
  Solución: `bytesPerRow: Math.ceil(ancho * 4 / 256) * 256` y un búfer del tamaño correspondiente; ante una cascada, lee el primer error.
  → [ver ejemplo](02-leer-un-pixel.md)
- **No se dibuja nada y no hay ningún error.**
  Síntoma: el pipeline y la pasada están bien, pero el lienzo se queda vacío.
  Causa: falta `device.queue.submit([encoder.finish()])`: grabar una pasada no la envía.
  Solución: cada codificador termina en un `submit`; que las funciones que graban lo digan en su nombre (`record…`) o lo envíen ellas.
  → [ver ejemplo](03-olvidar-submit.md)
- **Un uniform que no llega, o un bind group rechazado por su tamaño.**
  Síntoma: el color sale negro (ceros) sin errores, o `createBindGroup` dice que el búfer es más pequeño que el mínimo.
  Causa: en una estructura, un `vec3f` empieza en un múltiplo de 16 bytes, y la estructura mide más de lo que suman sus campos.
  Solución: calcula los offsets con las reglas de WGSL (lección 2), deja los huecos en el `Float32Array` y crea el búfer del tamaño de la estructura; o reordena los campos.
  → [ver ejemplo](05-uniforms-y-alineacion.md)
- **`Destroyed texture … used in a submit` al redibujar.**
  Síntoma: el primer fotograma se ve; los siguientes no cambian y aparece este error.
  Causa: la textura del lienzo se destruye al mostrarse; el código guardó la del primer fotograma.
  Solución: `context.getCurrentTexture()` al empezar cada fotograma, nunca guardada entre fotogramas.
  → [ver ejemplo](07-textura-de-cada-fotograma.md)

## Resumen

- El lienzo: `getContext('webgpu')`, tamaño CSS × `devicePixelRatio`, `configure({ device, format: getPreferredCanvasFormat() })`, y `getCurrentTexture()` en cada fotograma.
- Un render pipeline reúne vertex y fragment shader, topología y destinos (con su `blend`); se valida al crearlo.
- Una pasada: `beginRenderPass` con `loadOp: 'clear'`, `clearValue` y `storeOp: 'store'`, `setPipeline`, `setVertexBuffer`/`setBindGroup`, `draw(vértices, instancias)`, `end`; y siempre `submit`.
- Vértices: `vertex.buffers` con `arrayStride`, `attributes` (`offset`, `format`, `shaderLocation`) y `stepMode: 'instance'` para datos por copia.
- Uniforms: `var<uniform>`, un búfer `UNIFORM | COPY_DST` y un bind group; las estructuras siguen la alineación de WGSL (`vec3f` a 16 bytes).
- Las texturas tienen la fila 0 arriba; un sampler aparte dice cómo se leen; las imágenes se suben con `copyExternalImageToTexture` y `crossOrigin`.
- Para leer píxeles: `COPY_SRC` en `configure`, `copyTextureToBuffer` con `bytesPerRow` múltiplo de 256 en el mismo encargo, y ojo con BGRA.

## Para profundizar

- [WebGPU Fundamentals: búferes de vértices (en inglés)](https://webgpufundamentals.org/webgpu/lessons/webgpu-vertex-buffers.html)
- [WebGPU Fundamentals: uniforms (en inglés)](https://webgpufundamentals.org/webgpu/lessons/webgpu-uniforms.html)
- [WebGPU Fundamentals: texturas (en inglés)](https://webgpufundamentals.org/webgpu/lessons/webgpu-textures.html)
- [WebGPU Fundamentals: de WebGL a WebGPU (en inglés)](https://webgpufundamentals.org/webgpu/lessons/webgpu-from-webgl.html)
- [Los ejemplos oficiales de WebGPU (en inglés)](https://webgpu.github.io/webgpu-samples/)
