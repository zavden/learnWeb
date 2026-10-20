# Integración: WebGPU

## Por qué importa

Las lecciones del módulo presentan las piezas por separado: el adaptador y el dispositivo, los búferes y los compute shaders, el pipeline de render. Una aplicación las usa a la vez, y casi siempre **en el mismo encargo**: un cálculo que prepara los datos, otro que los resume y un dibujo que los muestra, todo grabado en un codificador y enviado con un solo `submit`, sin que los datos vuelvan a JavaScript más que para comprobarlos.

Los ejemplos de esta página combinan dos, tres o cuatro lecciones cada uno, y también lo que viene de antes: los filtros de la lección «Píxeles», las matrices del módulo de WebGL, los workers y los transferibles, los formularios. Cumplen además dos promesas del capítulo: el **juego de la vida** y la **cadena de filtros** del módulo «Gráficos en la GPU», hechos con compute shaders «sin fingir que son imágenes», y el `OffscreenCanvas` de la lección «Transferibles» dibujando con WebGPU desde un worker. Usan `assets/webgpu/utils.js` (los ayudantes de las lecciones 2 y 3, juntos), `assets/webgpu/mat4.js` (las matrices del módulo de WebGL, con la perspectiva de WebGPU) y el cuadro de Velasco. Calculan y dibujan una vez al cargar; el único que se anima lo hace con un botón.

## Las decisiones que se repiten

| Necesitas… | Usa… | Lección |
|---|---|---|
| varios cálculos seguidos sobre los mismos datos | una pasada de cómputo por paso, dos búferes que se turnan (*ping-pong*) y un solo `submit` | «Búferes y compute» |
| el mismo bind group en varios pipelines | un `GPUBindGroupLayout` explícito y `createPipelineLayout` (con `'auto'`, cada pipeline tiene su molde) | «Búferes y compute» |
| una imagen o una rejilla | grupos de dos dimensiones (`@workgroup_size(8, 8)`) y una guarda para `x` e `y` | «Búferes y compute» |
| dibujar datos que están en la GPU | un vertex o fragment shader que lee el búfer de almacenamiento (`var<storage, read>`) | «El pipeline de render» |
| contar o buscar el máximo entre miles de hilos | `atomicAdd`, `atomicMax` y `encoder.clearBuffer` para empezar de cero | «Búferes y compute» |
| 3D | `mat4x4f` en un uniform, una textura de profundidad y `cullMode: 'back'` | «El pipeline de render» y el módulo de WebGL |
| la GPU sin bloquear la página | un worker con un `OffscreenCanvas` transferido | «Transferibles» |
| saber que la GPU acertó | la misma cuenta en JavaScript, en enteros cuando se pueda, y comparar | todo el módulo |

Dos reglas atraviesan la tabla. **Los datos se quedan en la GPU**: en el histograma, la foto, sus contadores y sus barras nunca pasan por JavaScript para dibujarse; solo se copian al final, para comprobarlos. **Un encargo por cambio**: cada control del formulario termina en un `submit`, nunca en uno por pasada, y nada se recalcula si nada ha cambiado.

## Ejemplos combinados

### Una cadena de filtros

Brillo, desenfoque y enfoque sobre el cuadro de Velasco: los filtros de la lección «Píxeles», ahora como compute shaders. Cada filtro es una pasada que lee un búfer y escribe en otro; dos búferes de trabajo se turnan, y el original nunca se toca. Los tres pipelines comparten un **molde de bind group explícito**, porque con `layout: 'auto'` cada pipeline tendría el suyo y un bind group de uno no valdría para los otros. Todo se calcula en enteros (la media del desenfoque redondea con `(suma + 4) / 9`), así que la misma cadena en JavaScript da exactamente los mismos píxeles:

[[exercise:01-cadena-de-filtros.md]]

```text
foto → 480 × 330 · 1 búfer original + 2 de trabajo que se turnan · grupos de 8 × 8
cadena → brillo +20 → desenfoque → enfoque · 3 pasadas, 1 submit · ¿los mismos 158400 píxeles que en JavaScript? true
Listo: mueve el brillo o activa y desactiva los filtros
// Tras desmarcar «Desenfocar (3 × 3)»:
cadena → brillo +20 → enfoque · 2 pasadas, 1 submit · ¿los mismos 158400 píxeles que en JavaScript? true
```

[[exercise:01-cadena-de-filtros.md-(script.js)]]

Fíjate en el orden: enfocar después de desenfocar no devuelve la foto original (los detalles finos ya se perdieron), y por eso cada cadena se compara con su propia versión en JavaScript, no con la foto. Los grupos son de 8 × 8 hilos, uno por píxel: 60 × 42 grupos para 480 × 330 píxeles, y la guarda `if (id.x >= params.width || id.y >= params.height)` frena a los de la última fila de grupos, que se sale de la foto.

### El juego de la vida

La promesa del módulo de WebGL, cumplida: el tablero de 128 × 80 células vive en dos búferes de `u32` (no en texturas), una pasada de cómputo calcula la generación siguiente de todas las células a la vez, y un fragment shader pinta el tablero leyendo el **mismo** búfer, sin copiarlo a ningún sitio. JavaScript lleva su propia copia y la avanza a la vez, con el mismo bucle de vecinos; después de cada «Paso», y al terminar la animación, compara las dos:

[[exercise:02-juego-de-la-vida.md]]

```text
tablero → 128 × 80 = 10240 células · generación 0 · vivas 2645
Listo: pulsa «Paso» o «▶ 100 generaciones»
// Tras pulsar «Paso»:
generación 1 · vivas 2987 · ¿igual que en JavaScript? ✅
// Tras pulsar «▶ 100 generaciones» y esperar unos 8 s:
▶ 100 generaciones a 12 por segundo
⏹ terminado: 100 generaciones
generación 101 · vivas 864 · ¿igual que en JavaScript? ✅
```

[[exercise:02-juego-de-la-vida.md-(script.js)]]

El dibujo usa un truco clásico: **un solo triángulo** que cubre el lienzo entero (sus vértices se salen por la derecha y por arriba, y la GPU recorta lo que sobra), más barato que dos triángulos que comparten una diagonal. El fragment shader convierte su `@builtin(position)` en una célula. Con «reducir movimiento», las 100 generaciones se calculan de golpe, en 100 pasadas de un solo `submit`, y se pinta la última; la animación también se para con «Parar» o al ocultar la página.

### Un cubo en 3D

El cubo del módulo de WebGL, en WebGPU. Los vértices llevan posición, normal y color intercalados (36 bytes), los índices van en un búfer `INDEX`, y los uniforms son una estructura de 144 bytes: dos `mat4x4f`, la dirección de la luz (`vec3f`) y la luz ambiente, un `f32` que ocupa justo los 4 bytes que deja libres el `vec3f`. El pipeline lleva `depthStencil` con una textura `depth24plus` y `cullMode: 'back'`. Gira el cubo o quita la profundidad:

[[exercise:03-cubo-en-3d.md]]

```text
cubo → 24 vértices × 36 bytes + 36 índices × 2 bytes · Scene: mvp 0, model 64, light 128, ambient 140 · 144 bytes
X 25° · Y -35° · centro → 152, 20, 49 (cara: delante · calculado: 152, 20, 49 ✅)
Listo: gira el cubo con «Giro Y» (también con las flechas) o quita la profundidad
// Tras desmarcar «Profundidad y descarte de caras»:
X 25° · Y -35° · sin profundidad ni descarte · centro → 37, 17, 71 (cara: detrás · calculado: 37, 17, 71 ✅)
```

[[exercise:03-cubo-en-3d.md-(script.js)]]

Hay una diferencia con WebGL que rompe escenas enteras al portarlas: en WebGPU la profundidad va de **0** (lo más cerca) a **1** (lo más lejos), y no de -1 a 1. La matriz de perspectiva de WebGL, usada tal cual, recorta la mitad cercana de la escena. Por eso `assets/webgpu/mat4.js` cambia `perspective`. Sin profundidad ni descarte manda el orden de dibujo: la cara de detrás se dibuja después que la de delante y la tapa. Su color, 37, 17, 71, es el violeta con solo la luz ambiente (124, 58, 237 × 0,3), porque da la espalda a la luz: el mismo número que en el módulo de WebGL.

### Un histograma que no pasa por JavaScript

Tres pasadas de cómputo y dos de render en un solo `submit`: ajustar el brillo de la foto, contar los niveles de gris con `atomicAdd`, buscar el más alto con `atomicMax`, pintar la foto (un fragment shader que lee el búfer de píxeles, un píxel de la foto por píxel del lienzo) y pintar el histograma con `draw(6, 256)`: cada instancia es una barra que lee su contador y el máximo directamente del búfer. JavaScript solo recibe una copia del histograma, para comprobarlo y para escribir el resumen en texto:

[[exercise:04-histograma-con-instancias.md]]

```text
foto → 480 × 330 · 256 barras con draw(6, 256), sin pasar los datos por JavaScript
brillo 0 · 3 pasadas de cómputo + 2 de render en 1 submit · ¿el mismo histograma que en JavaScript? true
Listo: mueve «Brillo» (al soltarlo se recalcula todo)
// Tras subir «Brillo» a +40 y soltarlo:
brillo +40 · 3 pasadas de cómputo + 2 de render en 1 submit · ¿el mismo histograma que en JavaScript? true
```

[[exercise:04-histograma-con-instancias.md-(script.js)]]

Los contadores se ponen a cero con `encoder.clearBuffer`, dentro del mismo encargo (el búfer necesita `COPY_DST`). El mismo búfer es `array<atomic<u32>, 256>` en la pasada que cuenta y `array<u32, 256>` de solo lectura en la que busca el máximo y en el vertex shader de las barras: los tipos son de cada shader, la memoria es la misma. Y `unpack4x8unorm` separa los cuatro bytes de un `u32` en un `vec4f` de 0 a 1, el rojo del byte bajo: lo que el fragment shader necesita para pintar un píxel guardado como en la lección «Búferes y compute». Debajo del histograma, el reparto entre sombras, medios y luces se escribe en texto, para quien no ve el gráfico.

### WebGPU en un worker

La lección «Transferibles» contaba que un `OffscreenCanvas` admite también el contexto de WebGPU. Aquí la página transfiere su lienzo a un worker con `transferControlToOffscreen()`, y el worker hace todo lo demás: pide su propio adaptador y su dispositivo (`navigator.gpu` existe también en los workers), configura el contexto, dibuja y lee el píxel central. La página solo envía colores:

[[exercise:05-webgpu-en-un-worker.md]]

```text
el lienzo → transferido al worker con transferControlToOffscreen()
worker → triángulo dibujado · centro: 225, 29, 72, 255 · ¿hay document en el worker? false
Listo: elige otro color; lo dibuja el worker
// Tras pulsar «Ámbar»:
worker → triángulo dibujado · centro: 245, 158, 11, 255 · ¿hay document en el worker? false
```

[[exercise:05-webgpu-en-un-worker.md-(script.js)]]

El tamaño del lienzo se fija **antes** de transferirlo: después, la página ya no puede tocarlo. El WGSL viaja en el primer mensaje, porque el worker no comparte nada con la página, y sus errores también vuelven como mensajes (la consola de un worker no llega a la de LearnWeb). Es la forma de dibujar escenas pesadas sin que el hilo principal note nada: los eventos, el texto y los formularios siguen respondiendo mientras el worker prepara cada fotograma. En una tarjeta de la galería verás «este worker no tiene navigator.gpu»: la tarjeta es una copia aislada, de origen `null`, y Chrome no considera seguro un worker creado desde un `Blob` en ella (`self.isSecureContext` es `false`), así que no le da WebGPU. Ábrelo con ▶.

## Ejercicios

Los cuatro ejercicios se corrigen solos: al cargar, cada comprobación lee un ámbito de errores, un búfer o unos píxeles de la GPU, e imprime `✅` o, en rojo, `❌` con lo esperado y lo obtenido. Al abrirlos, casi todas salen en rojo; las que ya salen en verde comprueban algo que el código de partida hace bien y que tu cambio no debe romper.

### Los usos que faltan

Un compute shader suma el IVA a cuatro precios, pero el búfer se creó solo con `STORAGE`: ni `writeBuffer` puede escribirlo ni `readBuffer` puede copiarlo para leerlo. Seis comprobaciones: los dos ámbitos de errores y los cuatro precios.

[[exercise:06-ej-los-usos-que-faltan.md]]

```text
❌ writeBuffer, sin error de validación → esperaba true y obtuve false
❌ la copia para leer, sin error de validación → esperaba true y obtuve false
❌ 100 con IVA → esperaba 116.00 y obtuve 0.00
❌ 250 con IVA → esperaba 290.00 y obtuve 0.00
❌ 19.99 con IVA → esperaba 23.19 y obtuve 0.00
❌ 4.5 con IVA → esperaba 5.22 y obtuve 0.00
// En la solución, las seis salen ✅
```

### Cuántos grupos lanzar

Mil temperaturas de un sensor, de °C a °F, con un shader de grupos de 64 hilos; JavaScript calcula los grupos con otro tamaño y redondeando hacia abajo. Cuatro comprobaciones: los hilos lanzados, cuántas lecturas se convirtieron, la primera y la última.

[[exercise:07-ej-cuantos-grupos.md]]

```text
❌ los grupos lanzados cubren las 1000 lecturas → esperaba true y obtuve false
❌ lecturas convertidas → esperaba 1000 y obtuve 192
✅ la primera (-10 °C)
❌ la última (39 °C) → esperaba 102.2 y obtuve 39.0
// En la solución, las cuatro salen ✅
```

### Una estructura con huecos

La insignia del club de ajedrez sale descolocada y de un color raro: sus uniforms van en un `Float32Array` sin huecos, y la estructura `Badge { scale: f32, offset: vec2f, color: vec3f }` los tiene. Cuatro comprobaciones, tres de ellas con píxeles.

[[exercise:08-ej-estructura-con-huecos.md]]

```text
❌ el Float32Array tiene 8 números (32 bytes, como la estructura) → esperaba 8 y obtuve 6
❌ la insignia está en (0.5, 0.3) y es verde azulado → esperaba 13, 148, 136, 255 y obtuve 148, 136, 0, 255
❌ en (-0.05, 0), fuera de la insignia, se ve el fondo → esperaba 15, 23, 42, 255 y obtuve 148, 136, 0, 255
✅ la esquina de abajo a la izquierda sigue siendo fondo
// En la solución, las cuatro salen ✅
```

### Filas de 256 bytes

Para comprobar una bandera de tres franjas, el código copia una columna de la textura del lienzo con `bytesPerRow: 4`, y WebGPU la rechaza. Cuatro comprobaciones: el error de la copia y el color del centro de cada franja.

[[exercise:09-ej-filas-de-256-bytes.md]]

```text
❌ la copia, sin error de validación → esperaba null y obtuve bytesPerRow (4) is not a multiple of 256.
❌ fila 40: la franja de arriba, verde azulado → esperaba 13, 148, 136, 255 y obtuve 0, 0, 0, 0
❌ fila 120: la franja del medio, blanco → esperaba 248, 250, 252, 255 y obtuve 0, 0, 0, 0
❌ fila 200: la franja de abajo, frambuesa → esperaba 225, 29, 72, 255 y obtuve 0, 0, 0, 0
// En la solución, las cuatro salen ✅
```

## Para profundizar

- [WebGPU Fundamentals: procesar imágenes con compute shaders (en inglés)](https://webgpufundamentals.org/webgpu/lessons/webgpu-compute-shaders-histogram.html)
- [Google Codelabs: tu primera aplicación con WebGPU, un juego de la vida (en inglés)](https://codelabs.developers.google.com/your-first-webgpu-app)
- [WebGPU Fundamentals: perspectiva y profundidad (en inglés)](https://webgpufundamentals.org/webgpu/lessons/webgpu-perspective-projection.html)
- [MDN: OffscreenCanvas (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
