# WebGL desde JavaScript

## Por qué importa

En los shaders de las dos lecciones anteriores, LearnWeb hacía por ti todo lo que rodea al fragment shader: pedir la GPU, subir un rectángulo, dar valor a `u_time` y a `u_resolution`, dibujar en cada fotograma. Esta lección lo hace a mano, en una página normal con HTML, CSS y JavaScript. Es la única forma de dibujar **tus** formas (no solo un rectángulo que cubre el lienzo), de pasar tus datos y de combinar varios dibujos.

WebGL es una API de **bajo nivel**: no tiene «dibuja un círculo», sino «aquí tienes unos bytes; trátalos como pares de float; ejecuta este programa sobre cada uno». La ceremonia es larga, pero cada paso corresponde a una etapa del pipeline de la lección «CPU y GPU». Y aquí se cumple la promesa del módulo «Datos binarios»: el `Float32Array` que aprendiste a construir es, literalmente, lo que `gl.bufferData` copia a la memoria de la GPU.

Todos los ejemplos usan **WebGL 2**, con GLSL ES 3.00. Dibujan una sola vez al cargar y comprueban el resultado leyendo píxeles con `readPixels`, menos el último, que anima diez mil partículas cuando pulsas un botón.

## El primer triángulo, paso a paso

Dibujar un triángulo son siete pasos, siempre los mismos:

| Paso | Llamadas | Etapa del pipeline |
|---|---|---|
| 1. pedir el contexto | `canvas.getContext('webgl2')` | — |
| 2. fijar el tamaño | `canvas.width/height`, `gl.viewport` | dónde cae la imagen |
| 3. compilar y enlazar | `createShader`, `compileShader`, `createProgram`, `linkProgram` | los dos shaders |
| 4. subir los vértices | `createBuffer`, `bindBuffer`, `bufferData` | los datos de entrada |
| 5. describirlos | `getAttribLocation`, `enableVertexAttribArray`, `vertexAttribPointer` | cómo leer los bytes |
| 6. dibujar | `clearColor`, `clear`, `useProgram`, `drawArrays` | todo el pipeline |
| 7. comprobar | `readPixels` | leer el framebuffer |

El ejemplo los hace todos a mano, en orden. Los shaders van en el HTML, dentro de `<script type="x-shader/x-vertex">`: un `type` que no es JavaScript hace que el navegador guarde el texto sin ejecutarlo, y el código lo recoge con `textContent`.

[[exercise:01-primer-triangulo.md]]

[[exercise:01-primer-triangulo.md-]]

```text
contexto → WebGL 2.0 (OpenGL ES 3.0 Chromium)
el mismo lienzo como 2d → null
búfer → 24 bytes en la GPU
centro → 225, 29, 72, 255
esquina de abajo a la izquierda → 15, 23, 42, 255
```

Tres detalles del primer paso y del último. `getContext('webgl2')` devuelve `null` si el navegador o la máquina no pueden darlo, y un lienzo solo tiene **un** tipo de contexto: una vez es `webgl2`, pedirle `'2d'` también da `null`. Por eso se comprueba siempre. Y `readPixels` lee el dibujo **en la misma tarea** en que se hizo: por defecto (`preserveDrawingBuffer: false`), cuando el navegador ha mostrado el fotograma, borra el búfer de dibujo, y una lectura después de un `await` o de un `setTimeout` puede devolver ceros. Fíjate también en que `readPixels` cuenta las filas desde **abajo**, como `gl_FragCoord`.

### GLSL ES 3.00

Los shaders de WebGL 2 empiezan por `#version 300 es`, y esa línea tiene que ser **exactamente la primera** del texto. Sin ella, el compilador entiende GLSL ES 1.00, el de los shaders de LearnWeb. Lo que cambia:

| | GLSL ES 1.00 (WebGL 1, shaders de LearnWeb) | GLSL ES 3.00 (WebGL 2) |
|---|---|---|
| primera línea | nada | `#version 300 es` |
| datos de cada vértice | `attribute vec2 a_position;` | `in vec2 a_position;` |
| del vértice al fragmento | `varying` en los dos | `out` en el vertex shader, `in` en el fragment |
| salida del fragment shader | `gl_FragColor` | `out vec4 outColor;` (el nombre lo eliges tú) |
| leer una textura | `texture2D(t, uv)` | `texture(t, uv)` |
| bucles y enteros | límites constantes; sin `%` | cualquier condición; `%`, `&`, `<<`… |

### Coordenadas de recorte

El vertex shader no escribe píxeles, sino **coordenadas de recorte** (*clip space*): de -1 a 1 en los dos ejes, con la y hacia arriba, sea cual sea el tamaño del lienzo. Lo que cae fuera se recorta. El **viewport** convierte esas coordenadas en píxeles: `x` va de -1 a 1 y el píxel de 0 al ancho del viewport.

```text
      (-1, 1) ┌────────────────┐ (1, 1)
              │                │
              │     (0, 0)     │        x en píxeles = (x + 1) / 2 × ancho del viewport
              │                │        y en píxeles = (y + 1) / 2 × alto del viewport
     (-1, -1) └────────────────┘ (1, -1)
```

## Compilar y enlazar: leer los errores

Compilar un shader no lanza excepciones: si falla, `getShaderParameter(shader, gl.COMPILE_STATUS)` es `false` y el motivo está en `getShaderInfoLog(shader)`. Enlazar el programa (comprobar que los dos shaders encajan) tiene su propio registro, `getProgramInfoLog`. Desde aquí, los ejemplos usan las funciones de `assets/webgl/utils.js` (léelo con «Assets»): `createProgram(gl, vertexSource, fragmentSource)` hace los pasos 3 del ejemplo anterior y lanza un `Error` con el registro si algo falla. Este ejemplo le pasa cinco fragment shaders rotos:

[[exercise:02-errores-del-compilador.md-]]

```text
🐛 falta el ; al final de la línea 5:
ERROR: 0:6: 'outColor' : syntax error
🐛 un vec2 donde va un vec3 (línea 5):
ERROR: 0:5: '=' : dimension mismatch
ERROR: 0:5: '=' : cannot convert from 'const 2-component vector of float' to 'highp 3-component vector of float'
🐛 un uniform sin declarar (línea 5):
ERROR: 0:5: 'u_resolution' : undeclared identifier
🐛 una línea en blanco antes de #version:
ERROR: 0:2: '
' : #version directive must occur on the first line of the shader
ERROR: 0:4: 'out' : storage qualifier supported in GLSL ES 3.00 and above only
🐛 un in sin su out en el vertex shader:
FRAGMENT varying v_color does not match any VERTEX varying
```

Dos de ellos engañan. El `;` que falta se señala en la línea **siguiente**: el compilador no sabe que falta nada hasta que encuentra `outColor` donde esperaba un `;`. Y la línea en blanco antes de `#version` es el error clásico de los shaders escritos en un `<script>`: su `textContent` empieza con el salto de línea que hay tras la etiqueta. Sin `trim()`, `#version` queda en la línea 2, el compilador lo rechaza, cae a GLSL ES 1.00 y se queja de todo lo que es de la 3.00. Su mensaje sale partido en dos líneas porque cita, entre comillas, el «token» culpable: el propio salto de línea.

## Búferes y atributos

Un **búfer** es un bloque de memoria de la GPU. `gl.bufferData(gl.ARRAY_BUFFER, datos, uso)` copia ahí los bytes de un typed array: los del `Float32Array` de la lección «Float32 y precisión», tal cual. El tercer argumento es una pista para el driver sobre cómo lo usarás: `STATIC_DRAW` (se escribe una vez y se dibuja muchas: una malla, un mapa), `DYNAMIC_DRAW` (se reescribe a menudo con `bufferSubData`: posiciones que cambian en cada fotograma) o `STREAM_DRAW` (se escribe, se usa una vez y se tira).

Los bytes no dicen qué son. Lo dice `vertexAttribPointer`, que conecta un atributo del vertex shader con una parte del búfer:

```js
gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
//                     a_color   3     FLOAT  false       20 bytes  8 bytes
```

| Argumento | Qué es |
|---|---|
| `size` | cuántos valores por vértice: 2 para un `vec2`, 3 para un `vec3` |
| `type` | de qué tipo es cada valor en el búfer: `gl.FLOAT`, `gl.UNSIGNED_BYTE`… |
| `normalized` | si los enteros se pasan a 0..1 (útil con colores en bytes) |
| `stride` | cuántos **bytes** hay del principio de un vértice al del siguiente (0 = seguidos) |
| `offset` | en qué **byte** empieza este atributo dentro del vértice |

Con varios atributos lo habitual es **intercalarlos**: los datos de cada vértice juntos (posición y color, posición y color…), que es como mejor los lee la GPU. Un **VAO** (*vertex array object*) guarda toda esta configuración, para volver a ella con un solo `bindVertexArray` en lugar de repetir las llamadas antes de cada dibujo.

[[exercise:03-atributos-intercalados.md]]

[[exercise:03-atributos-intercalados.md-(index.html|script.js)]]

```text
un vértice → 20 bytes (stride) · el color empieza en el byte 8 (offset)
segundo vértice, desde el byte 20 → 1, -1, 1, 0, 0
centro → 128, 0, 127, 255
```

El color sale del vertex shader por un `out` y entra en el fragment shader por un `in`: es un *varying*, y llega **interpolado** (lección «CPU y GPU»). En el centro del lienzo, a medio camino entre los vértices azules y los rojos, vale 128 de rojo y 127 de azul: el píxel central está medio píxel a la derecha de la mitad exacta. La segunda línea lee el segundo vértice con una vista que empieza en el byte 20, como en la lección «ArrayBuffer y vistas».

> **Desde Python:** en `moderngl`, la misma descripción es una cadena: `ctx.vertex_array(prog, [(vbo, '2f 3f', 'a_position', 'a_color')])`, y los bytes salen de numpy con `np.array(datos, dtype='f4').tobytes()`. El `'2f 3f'` dice lo mismo que los dos `vertexAttribPointer`: 2 floats y 3 floats por vértice, intercalados; moderngl calcula el stride y los offsets por ti.

### 🐛 stride y offset se miden en bytes

Es fácil pensar «5 floats por vértice, el color en el float 2» y escribir `5` y `2`. WebGL los lee como bytes. Un float ocupa 4, y si los números no son múltiplos de 4, WebGL rechaza la llamada con `INVALID_OPERATION`:

[[exercise:04-stride-en-floats.md]]

```text
🐛 vertexAttribPointer(…, 5, 0) y (…, 5, 2) → INVALID_OPERATION, INVALID_OPERATION
🐛 drawArrays → INVALID_OPERATION · centro de la izquierda: 15, 23, 42, 255
✅ vertexAttribPointer(…, 20, 0) y (…, 20, 8) → NO_ERROR, NO_ERROR
✅ drawArrays → NO_ERROR · centro de la derecha: 13, 148, 136, 255
```

[[exercise:04-stride-en-floats.md-(script.js)]]

Las llamadas rechazadas no cambian nada, así que los atributos se quedan sin búfer y `drawArrays` tampoco dibuja. Ninguna de estas llamadas lanza una excepción: los errores de WebGL se apuntan en silencio y se leen con `gl.getError()`, que devuelve un código (1282 es `INVALID_OPERATION`) y lo borra. Chrome escribe además un aviso en la consola de DevTools, pero no en la de LearnWeb: por eso los ejemplos traducen el código a su nombre con `errorName()`. El caso peor es el que sí son múltiplos de 4: un stride de 4 bytes cuando querías 4 floats no da error, y el dibujo sale hecho un amasijo.

## Uniforms

Los uniforms se dan desde JavaScript con una familia de funciones cuyo nombre dice el tipo: `uniform1f` (un `float`), `uniform2f` (un `vec2`), `uniform4f`, `uniform1i` (un `int`, un `bool` o una textura), `uniformMatrix3fv` (una `mat3` desde un array). Todas reciben primero una **location**, que se pide una vez con `gl.getUniformLocation(programa, nombre)`. Y todas actúan sobre el programa **en uso**: el valor se guarda dentro de ese programa y se mantiene entre dibujos. Las dos formas de equivocarse no avisan:

[[exercise:05-uniforms-que-no-llegan.md]]

[[exercise:05-uniforms-que-no-llegan.md-(script.js)]]

```text
🐛 uniform4f antes de useProgram → INVALID_OPERATION
   dibujado con el valor por defecto → 0, 0, 0, 0
✅ uniform4f después de useProgram → NO_ERROR
   dibujado → 225, 29, 72, 255
🐛 getUniformLocation('u_opacity') → null
   uniform1f(null, 0.5) → NO_ERROR
```

Un uniform al que no se ha dado valor vale 0 (aquí, `vec4(0.0)`: negro y transparente, por eso el damero se ve a través del triángulo de la izquierda). Y el compilador **elimina** los uniforms que el shader declara pero no usa: no tienen location, `getUniformLocation` devuelve `null`, y WebGL acepta `null` sin quejarse. Ocurre al comentar una línea mientras depuras: el control deja de hacer efecto y no hay ningún error.

## Viewport y `devicePixelRatio`

Como en el canvas 2D (lección «Canvas 2D»), un lienzo nítido necesita un mapa de bits del tamaño CSS × `devicePixelRatio`. En WebGL hay un paso más: el **viewport**, la zona del lienzo donde se dibuja. WebGL lo fija **al crear el contexto**, con el tamaño que tenga el lienzo en ese momento (300 × 150 si no has tocado `width` y `height`), y no lo vuelve a cambiar solo:

[[exercise:06-viewport-y-tamano.md]]

```text
🐛 viewport → 0, 0, 300, 150 · ¿igual que el lienzo? false
🐛 esquina de arriba a la derecha → 15, 23, 42, 255 (el fondo: ahí no se dibuja)
✅ viewport ajustado en el ResizeObserver · ¿igual que el lienzo? true
✅ esquina de arriba a la derecha → 245, 158, 11, 255
```

El lienzo de la derecha se adapta: un `ResizeObserver` (lección «Observers») avisa cuando cambia su tamaño CSS, y el código ajusta el mapa de bits, llama a `gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)` y redibuja. Cambia el ancho de la vista previa para verlo. Chrome da además `devicePixelContentBoxSize` en las entradas del observer: el tamaño exacto en píxeles físicos, sin redondeos, cuando el lienzo no cae justo en un píxel entero.

[[exercise:06-viewport-y-tamano.md-(script.js)]]

## Dibujar con índices

Los triángulos de una figura comparten vértices: un hexágono son 6 triángulos con un centro común, y en una malla 3D cada vértice lo usan unos 6 triángulos. Con `drawArrays`, cada vértice compartido se repite en el búfer. Con un **búfer de índices** (`ELEMENT_ARRAY_BUFFER`), cada vértice se guarda una vez, y los triángulos se describen con los números de sus vértices en un `Uint16Array`. `drawElements` los recorre:

[[exercise:07-dibujo-con-indices.md-(script.js)]]

```text
sin índices → 18 vértices × 8 bytes = 144 bytes
con índices → 7 vértices × 8 bytes + 18 índices × 2 bytes = 92 bytes
drawElements → NO_ERROR
centro → 245, 158, 11, 255
esquina → 15, 23, 42, 255
```

[[exercise:07-dibujo-con-indices.md]]

Con 8 bytes por vértice el ahorro es pequeño; con vértices de 32 bytes (posición, normal, coordenadas de textura) y miles de triángulos, es más de la mitad. Además, la GPU guarda en una caché los vértices que acaba de procesar, y con índices reconoce el repetido y no vuelve a ejecutar el vertex shader. Un `Uint16Array` llega hasta el vértice 65 535; para mallas mayores, `Uint32Array` y `gl.UNSIGNED_INT`.

## Transformaciones con matrices

En la lección «Transformaciones» del capítulo de CSS viste que todo `transform` 2D es una matriz de 3 × 3, `matrix(a, b, c, d, e, f)`, y que componer es multiplicar. En WebGL es igual, pero las matrices las multiplicas tú en JavaScript y las pasas a un uniform `mat3`. El vertex shader multiplica cada vértice por ella: `u_matrix * vec3(a_position, 1.0)`. El `1.0` del final es el truco que permite que una multiplicación también **desplace**.

[[exercise:08-matriz-de-transformacion.md]]

[[exercise:08-matriz-de-transformacion.md-(index.html|script.js)]]

```text
traslación × giro → 0.866025, 0.5, 0, -0.5, 0.866025, 0, 0.5, 0, 1
DOMMatrix de CSS → matrix(0.866025, 0.5, -0.5, 0.866025, 0.5, 0)
✅ por columnas: en (0.5, 0) → 245, 158, 11, 255
🐛 por filas: en (0, 0) → 13, 148, 136, 255
```

WebGL guarda las matrices **por columnas**: los 9 números del array son la primera columna, la segunda y la tercera. Es el mismo orden de `matrix(a, b, c, d, e, f)` de CSS, con el `0, 0, 1` de cada columna que CSS se ahorra. Escrita «como se lee en papel», por filas, la matriz llega traspuesta: el desplazamiento cae en la fila que el shader descarta y el giro se invierte. El cuadrado turquesa se quedó en el centro, girado al revés. El segundo argumento de `uniformMatrix3fv` (`false`) significa «no la traspongas»; en WebGL 1 tiene que ser `false`.

Para 3D, la idea crece una dimensión: matrices de 4 × 4 (`mat4`) para mover, girar y proyectar en perspectiva (la división entre la distancia que viste en «Transformaciones 3D»), `gl.enable(gl.DEPTH_TEST)` para que lo cercano tape lo lejano y `gl.enable(gl.CULL_FACE)` para no dibujar las caras que dan la espalda. El ejemplo profesional de este módulo lo junta en una escena 3D completa.

## Transparencia y mezcla

Por defecto, cada píxel que escribe el fragment shader **sustituye** al que había. Con `gl.enable(gl.BLEND)`, la GPU lo **mezcla** con lo que ya había en el framebuffer según una fórmula que eliges con `gl.blendFunc(factorDelNuevo, factorDelViejo)`: `resultado = nuevo × factor1 + viejo × factor2`, para cada canal, incluido el alfa. La receta de muchos tutoriales tiene una trampa, que aparece cuando el lienzo se compone con la página:

[[exercise:09-transparencia-y-mezcla.md]]

```text
🐛 SRC_ALPHA → 153, 104, 23, 194
✅ premultiplicado → 153, 104, 23, 255
```

[[exercise:09-transparencia-y-mezcla.md-(index.html|script.js)]]

Con `blendFunc(SRC_ALPHA, ONE_MINUS_SRC_ALPHA)`, los colores se mezclan bien (60 % de ámbar, 40 % de fondo: `153, 104, 23`), pero la misma fórmula se aplica al alfa del lienzo: 0.6 × 0.6 + 1 × 0.4 = 0.76, es decir, 194. Y un lienzo WebGL **no es opaco** por defecto: el navegador lo compone con la página como color **premultiplicado** (el formato que viste en la lección «Píxeles», donde un rojo semitransparente volvía con una unidad menos). Con alfa 194, la página se suma al color, y el disco de la izquierda se ve lavado sobre el damero. La solución es trabajar en premultiplicado: el shader multiplica el color por su alfa y la mezcla es `blendFunc(ONE, ONE_MINUS_SRC_ALPHA)`, que deja el alfa en 1. Otra salida es pedir un lienzo sin canal alfa: `getContext('webgl2', { alpha: false })`.

## Miles de partículas en un solo encargo

En la lección «El bucle de animación», 200 partículas de confeti eran 200 objetos de JavaScript que se movían en cada fotograma, y dibujarlas por lotes ahorraba encargos al motor gráfico. Aquella lección prometía llevar la idea a la GPU, «donde se dibujan miles de partículas en un solo encargo». Es este ejemplo: los datos de las 10 000 partículas (velocidad de salida y desfase) se suben **una vez**, y en cada fotograma JavaScript solo envía `u_time`, 4 bytes. El vertex shader calcula dónde está cada partícula con la fórmula de la caída libre, y `drawArrays(gl.POINTS, 0, 10000)` las dibuja todas.

[[exercise:10-miles-de-puntos.md]]

```text
Listo: 10000 partículas en un búfer de 120000 bytes; pulsa «Lanzar»
// Tras pulsar «Lanzar» y esperar 10 s:
▶ en marcha: 1 drawArrays por fotograma
⏹ terminado: 10 s
// Si pulsas «⏹ Parar» antes de tiempo:
⏹ parado
```

[[exercise:10-miles-de-puntos.md-(index.html|script.js)]]

Con `gl.POINTS`, cada vértice es un cuadrado de `gl_PointSize` píxeles, y en el fragment shader `gl_PointCoord` dice dónde está el píxel dentro de ese cuadrado: con un `discard` fuera del círculo, los cuadrados se vuelven chispas redondas. El bucle sigue las reglas de siempre: arranca con un botón, no se lanza dos veces, se para solo a los 10 s, con «Parar» o al ocultar la página, y con «reducir movimiento» dibuja un fotograma quieto. Para dibujar muchas copias de una forma con más de un vértice (árboles, letras, asteroides) existe el dibujo por **instancias**: `drawArraysInstanced(gl.TRIANGLES, 0, 3, 10000)` repite un triángulo 10 000 veces, y `vertexAttribDivisor(location, 1)` hace que un atributo avance una vez por instancia en lugar de una vez por vértice.

## Bestiario

- **El error del compilador señala la línea de después.**
  Síntoma: el registro dice `syntax error` en una línea que está bien.
  Causa: un `;` (o un paréntesis) que falta en la línea anterior; el compilador lo descubre al leer el token siguiente.
  Solución: cuando una línea parece correcta, mira la de arriba.
  → [ver ejemplo](02-errores-del-compilador.md)
- **`#version directive must occur on the first line of the shader`.**
  Síntoma: un shader de WebGL 2 escrito en un `<script>` da errores de cosas de GLSL ES 3.00 (`'out' : storage qualifier…`).
  Causa: el texto empieza con un salto de línea, `#version` queda en la línea 2 y el compilador cae a GLSL ES 1.00.
  Solución: `textContent.trim()`, o la plantilla de texto con `#version 300 es` justo después de la comilla.
  → [ver ejemplo](02-errores-del-compilador.md)
- **No se dibuja nada y `getError()` dice `INVALID_OPERATION`.**
  Síntoma: tras describir un búfer intercalado, el dibujo no aparece, o aparece hecho un amasijo.
  Causa: `stride` y `offset` se dieron en floats; `vertexAttribPointer` los mide en bytes.
  Solución: multiplica por `Float32Array.BYTES_PER_ELEMENT` (4): stride `5 * 4`, offset `2 * 4`.
  → [ver ejemplo](04-stride-en-floats.md)
- **El color (o la posición) que pasas no llega.**
  Síntoma: la forma sale negra o transparente, como si el uniform valiera 0.
  Causa: se dio valor al uniform antes de `useProgram` (o con otro programa en uso): `INVALID_OPERATION` y la llamada se ignora.
  Solución: `useProgram` primero; después, los `uniform*`.
  → [ver ejemplo](05-uniforms-que-no-llegan.md)
- **Un control que no hace nada, sin errores.**
  Síntoma: cambias un uniform desde JavaScript y el dibujo no cambia; `getError()` dice `NO_ERROR`.
  Causa: el shader declara el uniform pero no lo usa, el compilador lo elimina y `getUniformLocation` devuelve `null`; los `uniform*` aceptan `null` en silencio.
  Solución: comprueba que las locations no sean `null` al prepararlas, y que el shader use de verdad cada uniform.
  → [ver ejemplo](05-uniforms-que-no-llegan.md)
- **El dibujo ocupa una esquina del lienzo.**
  Síntoma: tras ajustar el tamaño del lienzo (por `devicePixelRatio` o al redimensionar), el dibujo queda pequeño abajo a la izquierda, o recortado.
  Causa: el viewport se fijó al crear el contexto y no sigue al lienzo.
  Solución: `gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)` después de cada cambio de tamaño, en el `ResizeObserver`.
  → [ver ejemplo](06-viewport-y-tamano.md)
- **La transformación hace cosas raras: no se mueve, gira al revés, se deforma.**
  Síntoma: la forma ignora la traslación y gira en sentido contrario.
  Causa: la matriz se pasó por filas; WebGL la lee por columnas y la recibe traspuesta.
  Solución: guarda las matrices por columnas (el orden de `matrix()` de CSS) o traspónlas antes de `uniformMatrix3fv`.
  → [ver ejemplo](08-matriz-de-transformacion.md)
- **Lo semitransparente se ve lavado, o deja ver la página.**
  Síntoma: formas con transparencia sobre un lienzo WebGL se ven más claras de lo esperado, y la página asoma a través.
  Causa: `blendFunc(SRC_ALPHA, ONE_MINUS_SRC_ALPHA)` también rebaja el alfa del lienzo, que el navegador compone como premultiplicado.
  Solución: colores premultiplicados en el shader y `blendFunc(ONE, ONE_MINUS_SRC_ALPHA)`, o un contexto con `alpha: false`.
  → [ver ejemplo](09-transparencia-y-mezcla.md)

## Resumen

- Siete pasos: contexto (comprueba `null`), tamaño y viewport, compilar y enlazar, `bufferData`, `vertexAttribPointer`, dibujar, comprobar con `readPixels` en la misma tarea.
- GLSL ES 3.00: `#version 300 es` en la primera línea, `in`/`out`, una salida declarada y `texture()`.
- Los errores de compilación están en `getShaderInfoLog`; los de WebGL, en `gl.getError()`. Ninguno lanza excepciones.
- `bufferData` copia los bytes de un typed array a la GPU; `vertexAttribPointer` dice cómo leerlos, con stride y offset en bytes; un VAO lo recuerda.
- Uniforms: location con `getUniformLocation` (puede ser `null`), siempre después de `useProgram`.
- Coordenadas de recorte de -1 a 1; el viewport las pasa a píxeles y hay que ajustarlo en cada cambio de tamaño.
- Índices (`ELEMENT_ARRAY_BUFFER` + `drawElements`) para vértices compartidos; matrices `mat3` por columnas, como `matrix()` de CSS.
- Transparencia: `gl.BLEND` con colores premultiplicados; miles de partículas en un `drawArrays(gl.POINTS)` con el movimiento en el vertex shader.

## Para profundizar

- [MDN: tutorial de WebGL](https://developer.mozilla.org/es/docs/Web/API/WebGL_API/Tutorial)
- [WebGL2 Fundamentals: lo básico y las matrices 2D (en inglés)](https://webgl2fundamentals.org/webgl/lessons/webgl-2d-matrices.html)
- [MDN: buenas prácticas de WebGL (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)
- [MDN: vertexAttribPointer (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer)
- [WebGL2 Fundamentals: qué cambia de WebGL 1 a WebGL 2 (en inglés)](https://webgl2fundamentals.org/webgl/lessons/webgl1-to-webgl2.html)
