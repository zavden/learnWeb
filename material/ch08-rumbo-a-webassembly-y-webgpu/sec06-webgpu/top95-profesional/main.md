# Ejemplos profesionales: WebGPU

## Por qué importa

Las lecciones del módulo enseñan cada pieza con un ejemplo que calcula o dibuja una vez y lee el resultado. Una aplicación real hace lo mismo durante horas, con el usuario tocándolo todo, y con dos amenazas que los ejemplos pequeños no tienen: el **trabajo repetido** (recompilar, reservar o copiar en cada cambio lo que podía prepararse una vez) y el **dispositivo perdido** (un driver que se reinicia, un portátil que despierta, una pestaña que lleva horas en segundo plano). Esta página reúne diez herramientas escritas como en un proyecto: un editor de fotos, un explorador de fractales, un terreno en 3D, una ordenación de 65 536 números, un producto de matrices, un mapa de calor, un comparador de imágenes, un juguete de partículas y el panel de un almacén.

Todas usan una pequeña biblioteca propia, `assets/gpu/kit.js`, y el terreno usa además `assets/gpu/mat4.js` (las matrices del módulo de WebGL, con la perspectiva de WebGPU). Léelas con «Assets»: no esconden WebGPU, solo le quitan la ceremonia repetida, convierten sus errores silenciosos en excepciones con nombre y recrean todo cuando se pierde el dispositivo. La única imagen es el cuadro de Velasco; todos los datos (sensores, demanda eléctrica, terrenos, números) salen de generadores con semilla, así que cada ejecución da lo mismo. Lee primero el bloque de comentarios del principio de cada script: explica las decisiones de diseño.

## Qué tienen en común

- **Lo caro se prepara una vez.** Pipelines, búferes y bind groups se crean al cargar (`setup`), los pipelines de cómputo con `createComputePipelineAsync`. Un cambio de un control escribe unos pocos bytes con `writeBuffer` y lanza **un** encargo; los cálculos solo se repiten si cambió algo que los afecta (una marca `dirty`).
- **Los datos se quedan en la GPU.** Lo que calcula un compute shader lo lee directamente el render pipeline (búferes de almacenamiento en el vertex o en el fragment shader); JavaScript solo copia lo que necesita leer: un recuento, un píxel para comprobar, el resultado de una ordenación.
- **Lo que se ve se comprueba.** Cada ejemplo repite su cálculo en JavaScript (en enteros cuando se puede, para comparar con `===`) y lo compara con lo que escribió la GPU, leído con una copia o con `readPixels` en el mismo encargo que el dibujo.
- **Los errores tienen nombre.** `checked()` envuelve los pasos dudosos en ámbitos de errores y lanza un `GPUKitError` que dice qué paso falló; un oyente de `uncapturederror` escribe con `console.warn` lo que se escape, nunca en silencio.
- **El dispositivo es un recurso que se pierde.** `createView` escucha `device.lost`, pide un adaptador nuevo (un adaptador da un solo dispositivo), reconfigura el lienzo, vuelve a llamar a `setup` y redibuja.
- **Nada calienta la máquina sin permiso.** Se dibuja al cargar y cuando algo cambia (como mucho una vez por fotograma); lo que se anima arranca con un botón, dura 10 s como mucho, se para al ocultar la página y no arranca con «reducir movimiento». Los bucles de los shaders tienen todos un límite fijo y pequeño, y lo que se mide se lanza con un botón.
- **Accesibles.** Todo lo que se hace con el puntero se puede hacer con el teclado (los lienzos interactivos tienen foco y teclas), cada lienzo tiene `role="img"` y una descripción, y los resultados se dicen en texto: la celda elegida, el sensor bajo el puntero, el reparto de un histograma.

## La biblioteca: GPUKit

| Función | Qué hace | Lección |
|---|---|---|
| `requestDevice({ label, requiredFeatures, requiredLimits })` | comprueba el soporte y las características, pide un adaptador nuevo y su dispositivo, y escucha `uncapturederror` | «¿Qué es WebGPU?» |
| `checked(device, qué, fn)` | ámbitos de validación y de memoria; un fallo es un `GPUKitError` con el nombre del paso | «¿Qué es WebGPU?» |
| `createBuffer(device, { label, data, size, usage })` | tamaño redondeado a 4 bytes y `COPY_DST` si lleva datos | «Búferes y compute» |
| `readBuffer(device, búfer, Tipo)` | copia a un búfer de lectura, `mapAsync`, `slice`, `unmap` | «Búferes y compute» |
| `structLayout(campos)` y `writeStruct(layout, valores)` | el mapa de bytes de un `struct` de WGSL, calculado con sus reglas, y un `ArrayBuffer` lleno según ese mapa | «Búferes y compute» |
| `createView(canvas, { setup, render, depth, onStatus })` | lienzo nítido con `ResizeObserver`, textura de profundidad, `renderNow({ readPixels })`, `invalidate()`, pérdida y recuperación del dispositivo | «El pipeline de render» |
| `createAnimation({ frame, onStop, maxSeconds })` | un bucle con botón, finito, que se para al ocultar la página y respeta «reducir movimiento» | «El bucle de animación» |
| `loadPixels(url)` y `seededRandom(semilla)` | una imagen (con `crossOrigin`) como un `u32` por píxel; números pseudoaleatorios repetibles | «Píxeles», «Búferes y compute» |

## El banco de pruebas del kit

**Objetivo:** ver las piezas de GPUKit una a una antes de usarlas en serio. **Técnicas:** el mapa de bytes de `struct Style { color: vec3f, scale: f32, offset: vec2f }` calculado con `structLayout` (el `f32` llena el hueco del `vec3f`; el `vec2f` empieza en el byte 16) y llenado con `writeStruct`; una vista que dibuja un rombo bajo demanda y lee su centro en el mismo encargo; un búfer imposible dentro de `checked()`; y la pérdida del dispositivo, simulada con `destroy()`. **Fíjate en:** tras la pérdida, la vista pide un adaptador **nuevo** (el anterior ya está consumido), vuelve a crearlo todo y el rombo conserva el color elegido, porque el estado de la aplicación vive en JavaScript y no en la GPU.

[[exercise:01-banco-de-pruebas-del-kit.md]]

```text
Style → color en el byte 0, scale en el byte 12, offset en el byte 16 · 32 bytes
dispositivo 1 listo · centro: 225, 29, 72, 255
Listo: cambia el color, provoca un error o simula la pérdida del dispositivo
// Tras elegir «Ámbar»:
color ámbar · centro: 245, 158, 11, 255
// Tras pulsar «Provocar un error de validación»:
GPUKitError (validation): búfer de resultados: Buffer usages (BufferUsage::(MapRead|Storage)) is invalid. If a buffer usage contains BufferUsage::MapRead the only other allowed usage is BufferUsage::CopyDst.
// Tras pulsar «Simular la pérdida del dispositivo»:
dispositivo 1 perdido (destroyed) → recreando…
dispositivo 2 listo · centro: 245, 158, 11, 255
```

Una pérdida de verdad llega con `reason: 'unknown'`, y el código es el mismo. La regla que lo hace posible: **todo** lo que vive en la GPU se crea en `setup`, y nada en otro sitio. Un búfer creado fuera, al cargar, seguiría apuntando al dispositivo muerto.

## Un editor de fotos

**Objetivo:** el núcleo de un editor de fotos con la GPU como motor, y con una comparación «antes | después». **Técnicas:** brillo, contraste, saturación y desenfoque (de 3 × 3 o 5 × 5) como compute shaders en enteros, encadenados con dos búferes que se turnan y un molde de bind group explícito compartido; el histograma de la foto editada con `atomicAdd` y `atomicMax`; un render pass con dos zonas (`setViewport`): la foto, que un fragment shader pinta leyendo los dos búferes a cada lado de la línea, y las 256 barras con instancias. Cada cambio, un submit. **Fíjate en:** mover «Antes | después» no recalcula ningún filtro (solo cambia un uniform), y «Comprobar con JavaScript» repite la cadena en la CPU, con `Math.trunc` para imitar la división entera de WGSL, y compara los 158 400 píxeles.

[[exercise:02-editor-de-fotos.md]]

```text
foto → 480 × 330 · 4 filtros en compute shaders + histograma con atómicos · 1 submit por cambio
cadena → brillo +10 → contraste 115 % → saturación 120 % · ¿los mismos 158400 píxeles que en JavaScript? ✅
Listo: ajusta los filtros, mueve «Antes | después» o pulsa «Comprobar con JavaScript»
// Tras elegir «Desenfoque: 5 × 5» y pulsar «Comprobar con JavaScript»:
cadena → brillo +10 → contraste 115 % → saturación 120 % → desenfoque 5 × 5 · ¿los mismos 158400 píxeles que en JavaScript? ✅
```

El desenfoque de 5 × 5 lee 25 vecinos por píxel con un bucle fijo de 25 vueltas que salta los que caen fuera del radio elegido: un shader no debe tener bucles cuyo límite dependa de datos sin tope. Debajo de la foto, el reparto del histograma (sombras, medios, luces) se escribe en texto cada vez que se comprueba. Los filtros no conmutan: con la misma foto, aplicar el contraste antes o después del brillo da números distintos, y la cadena tiene un orden fijo, como las capas de ajuste de un editor.

## Un explorador de fractales

**Objetivo:** explorar el conjunto de Mandelbrot con fluidez, sin dibujar nada que no haya cambiado. **Técnicas:** un fragment shader que itera `z² + c` en cada píxel con un bucle de 128 vueltas como mucho y un `break` (el selector de iteraciones lo acorta); una paleta por bandas de 8 iteraciones con colores exactos; arrastrar con captura del puntero, acercar con botones, con `+` y `-` o con Ctrl + rueda, y moverse con las flechas; `invalidate()` para dibujar como mucho una vez por fotograma. **Fíjate en:** la autocomprobación calcula en JavaScript dos píxeles concretos (uno dentro del conjunto y otro que escapa en la primera vuelta) y los compara byte a byte con lo que leyó de la GPU.

[[exercise:03-explorador-de-fractales.md]]

```text
vista → centro (-0.5, 0) · 0.01 unidades por píxel · 128 iteraciones como mucho
centro del lienzo → dentro del conjunto · 15, 23, 42 ✅
c = (-2.2, 0) → escapa en la iteración 1 · 56, 189, 248 ✅
Listo: arrastra, usa los botones o, con el foco en el fractal, las flechas y + / -
// Tras pulsar «Acercar ×2»:
zoom → 0.005 unidades por píxel
// Tras pulsarlo doce veces más (una línea «zoom →» cada vez; la última):
zoom → 0.000001221 unidades por píxel
// Y una vez más:
límite de float32: con más zoom, float32 ya no distingue bien los píxeles vecinos y el dibujo se volvería de bloques (lección «Float32 y precisión»)
```

El límite es el de la lección «Float32 y precisión»: con unas 7 cifras, hacia una millonésima de unidad por píxel los redondeos de cada vuelta del bucle ya no separan bien a los vecinos. Los exploradores que bajan más hondo calculan el centro en float64 en la CPU y solo pasan a la GPU las diferencias pequeñas (*perturbación*), o emulan más precisión con dos float32 por número. La escala se guarda por píxel CSS y el shader la recibe por píxel físico, así que el fractal se ve igual de nítido con cualquier `devicePixelRatio`.

## Un terreno en 3D

**Objetivo:** un paisaje generado y dibujado entero en la GPU, con una cámara que gira a su alrededor. **Técnicas:** un compute shader calcula 128 × 128 alturas con ruido de valor de 4 octavas sobre un hash de enteros (los `u32` dan la vuelta al desbordarse, como `Math.imul`); el vertex shader construye la malla leyendo ese búfer por `vertex_index`, sin búfer de vértices, con la normal por diferencias centrales; 96 774 índices `uint16`; franjas de color por altura, luz de Lambert, profundidad `depth24plus` y descarte de caras. La cámara orbital se mueve arrastrando, con las flechas o con Ctrl + rueda. **Fíjate en:** «Otra semilla» recalcula el terreno en el mismo encargo que el dibujo, y la autocomprobación repite las 16 384 alturas en JavaScript.

[[exercise:04-terreno-en-3d.md]]

```text
terreno → 128 × 128 = 16384 vértices leídos de un búfer de almacenamiento · 96774 índices · 4 octavas de ruido
semilla 1 · 16384 alturas · de 0.051 a 0.679 · ¿la GPU coincide con JavaScript? (diferencia < 0,0001) ✅
Listo: gira la cámara (arrastra o usa las flechas con el foco), acércala con + y -, o pide otra semilla
// Tras pulsar «Otra semilla»:
semilla 2 · 16384 alturas · de 0.078 a 0.819 · ¿la GPU coincide con JavaScript? (diferencia < 0,0001) ✅
```

Las alturas no coinciden byte a byte, y no tienen por qué: el hash es entero y exacto, pero la interpolación es float32 en la GPU y float64 en JavaScript. Una diferencia por debajo de una diezmilésima es la huella de esa precisión, no un error. El agua es la propia malla aplanada (`max(altura, 0.3)`), con su normal hacia arriba. La perspectiva viene de `mat4.js`, con la profundidad de 0 a 1 de WebGPU.

## Ordenar 65 536 números

**Objetivo:** ordenar en la GPU y medirlo con honestidad frente a la CPU. **Técnicas:** la ordenación bitónica, que compara y cambia parejas de números, todas a la vez, en 136 pasadas iguales; las 136 pasadas van en un solo pase de cómputo y un solo `submit`, y cada una lee sus dos parámetros (`j` y `k`) de un trozo distinto del mismo búfer de uniforms gracias a un bind group con `hasDynamicOffset` y desplazamientos múltiplos de 256 bytes (`minUniformBufferOffsetAlignment`, la regla de alineación de la lección «Búferes y compute»). **Fíjate en:** la comparación es con `Uint32Array.prototype.sort`, que ordena por valor (la de los arrays normales ordenaría como texto).

[[exercise:05-ordenacion-bitonica.md]]

```text
65536 números de 32 bits (semilla 2026) · 136 pasadas, cada una con su desplazamiento dinámico de 256 bytes
Listo: pulsa «Ordenar»
// Tras pulsar «Ordenar». Los tiempos cambian en cada ejecución; en el M1 del curso:
GPU, 136 pasadas en 1 submit (con subir y bajar los datos) → ≈ 5.5 ms
CPU, Uint32Array.prototype.sort → ≈ 3-5 ms
¿el mismo orden? ✅ · el menor: 51012 · el mayor: 4294780828
```

Con 65 536 números, la CPU incluso gana por poco en el M1: el viaje de los datos y las 136 pasadas pesan tanto como ordenar. La GPU compensa con muchos más datos, o cuando los datos ya viven en ella (no hay viaje). La ordenación bitónica no es la más rápida que existe en una GPU (las de tipo *radix* lo son), pero es la más fácil de escribir: todas las pasadas hacen lo mismo, sin decisiones que dependan de los datos, que es justo lo que una GPU hace bien. Entre dos `dispatchWorkgroups` del mismo pase, WebGPU garantiza que la segunda ve lo que escribió la primera.

## Multiplicar matrices

**Objetivo:** el cálculo que mueve las redes neuronales, en su versión clásica para GPU. **Técnicas:** un hilo por elemento del resultado, en grupos de 16 × 16; cada grupo copia trozos de 16 × 16 de las dos matrices a la memoria compartida del grupo (`var<workgroup>`), espera a todos sus hilos con `workgroupBarrier()` y suma desde ahí, así que cada número de A y de B se lee 16 veces menos de la memoria principal. Las matrices son de enteros pequeños, exactos en float32. **Fíjate en:** `workgroupBarrier()` exige que todos los hilos del grupo lleguen a él: por eso no hay ningún `return` antes y el bucle tiene un límite fijo, igual para todos.

[[exercise:06-multiplicar-matrices.md]]

```text
A × B: 256 × 256 (enteros pequeños: exactos en float32) · teselas de 16 × 16 en memoria de grupo
Listo: pulsa «Multiplicar»
// Tras pulsar «Multiplicar». Los tiempos cambian en cada ejecución; en el M1 del curso:
CPU, tres bucles → ≈ 45-140 ms
GPU, 256 grupos de 16 × 16 hilos (con bajar el resultado) → ≈ 2-10 ms
¿C es igual en los dos? ✅ · C[0][0] = 54 · C[255][255] = 44
```

Son 16,7 millones de multiplicaciones y sumas. Con números decimales cualquiera, la GPU y la CPU sumarían en otro orden y el resultado diferiría en las últimas cifras (float32 no es asociativo); con enteros pequeños, todas las sumas parciales son exactas y los dos resultados son idénticos. Las bibliotecas de redes neuronales del navegador hacen esto mismo, con más trucos: teselas más grandes, varios elementos por hilo y números de media precisión (`shader-f16`).

## Un mapa de calor

**Objetivo:** un mapa de calor de datos que se explora y se entiende sin verlo. **Técnicas:** 8760 horas de demanda eléctrica en un búfer de almacenamiento; un compute shader con un hilo por celda calcula las 288 medias de cada mes a cada hora (un bucle de 31 vueltas como mucho); un fragment shader pinta cada celda con una escala de cinco colores y el contorno de la celda elegida; el puntero y las flechas eligen celda, que se anuncia en texto; una tabla con la hora pico de cada mes. **Fíjate en:** la autocomprobación lee de la GPU la media de la celda y el color de su centro, y los compara con la media y la escala calculadas en JavaScript.

[[exercise:07-mapa-de-calor.md]]

```text
datos → 8760 horas de 2025 · medias por mes y hora en un compute shader: 12 × 24 celdas
pico → julio, 19:00 · 54.9 MW · valle → enero, 04:00 · 16.9 MW
selección → julio, 19:00 · 54.9 MW · ¿la media y el color de la GPU coinciden con JavaScript? ✅
Listo: pasa el puntero por el mapa o, con el foco en él, muévete con las flechas
// Tras pulsar → con el foco en el mapa:
selección → julio, 20:00 · 52.5 MW · ¿la media y el color de la GPU coinciden con JavaScript? ✅
```

Elegir otra celda no recalcula nada: cambia un uniform y se redibuja. La escala va de violeta a amarillo pasando por azul y verde, como la *viridis* de matplotlib, porque se lee bien también en gris y con los daltonismos más comunes. El color del centro se compara con un margen de una unidad: la GPU interpola en float32 y JavaScript en float64.

## Un comparador de imágenes

**Objetivo:** la herramienta de las pruebas de regresión visual: ¿qué ha cambiado entre dos capturas? **Técnicas:** un compute shader compara las dos fotos píxel a píxel, escribe una máscara y, con atómicos sobre una estructura de cinco contadores, cuenta los distintos (`atomicAdd`) y calcula la caja que los contiene (`atomicMin` y `atomicMax`); un fragment shader enseña el original, la retocada o las diferencias, y dibuja la caja leyendo los contadores directamente del búfer. **Fíjate en:** el mismo búfer es una estructura de `atomic<u32>` en el compute shader y un `array<u32, 5>` de solo lectura en el fragment shader.

[[exercise:08-comparador-de-imagenes.md]]

```text
fotos → 480 × 330 · la retocada lleva una pegatina de 60 × 40 y 12 píxeles sueltos
distintos → 2412 píxeles · caja: x 15-465, y 30-310 · ¿igual que en JavaScript? ✅
Listo: elige qué ver (original, retocada o diferencias)
// Tras elegir «Retocada»:
vista → retocada
```

La comparación es exacta, sin umbral: la que conviene cuando las dos capturas salen del mismo navegador en la misma máquina. Entre navegadores o sistemas distintos, el suavizado del texto y los perfiles de color cambian algunos píxeles en una o dos unidades, y las herramientas de regresión visual añaden un umbral por canal y un máximo de píxeles distintos. Los mínimos empiezan en `0xffffffff`, el mayor `u32`, para que cualquier coordenada sea menor.

## Un juguete de partículas

**Objetivo:** algo que se toca: 16 384 chispas que siguen al puntero. **Técnicas:** el estado de las chispas (posición y velocidad) vive en un búfer de la GPU desde el principio; cada fotograma es un encargo con una pasada de cómputo (fuerza, rozamiento y bordes) y una de render con instancias que lee el mismo búfer; mezcla aditiva para que brillen donde se juntan; el punto de fuerza se mueve con el puntero o con las flechas, y el espacio cambia entre atraer y repeler. **Fíjate en:** JavaScript solo envía 16 bytes por fotograma, y la fuerza se divide por `sqrt(d² + 0,02)` en lugar de normalizar, para que una chispa justo en el punto no produzca un `NaN`.

[[exercise:09-juguete-de-particulas.md]]

```text
Listo: 16384 chispas en un búfer de 262144 bytes; pulsa «Soltar las chispas»
// Tras pulsar «▶ Soltar las chispas» y esperar 10 s:
▶ en marcha: 1 pasada de cómputo + 1 de render por fotograma · atraer
⏹ terminado: 10 s
// Si pulsas «Repeler» y después «⏹ Parar»:
modo → repeler
⏹ parado
```

El paso de tiempo se limita a 1/30 s: si la pestaña se atasca un momento, las chispas no dan un salto enorme. Es la misma idea del juego de la vida de la integración, sin rejilla: cada partícula recuerda su estado de un fotograma al siguiente, algo que en WebGL solo se podía hacer disfrazando los datos de textura.

## El panel de un almacén

**Objetivo:** un panel de control con 1200 sensores, legible de un vistazo y usable sin ratón. **Técnicas:** un solo `draw(6, 1200)` con instancias: posición, temperatura, humedad y zona de cada sensor (20 bytes) en un búfer de vértices con `stepMode: 'instance'`; círculos hechos con una función de distancia en el fragment shader, con el borde suavizado y mezcla premultiplicada; color por temperatura y tamaño por humedad; las zonas se filtran con casillas que cambian una máscara de bits en un uniform; el sensor bajo el puntero se busca en la CPU y se describe en texto; las cinco peores alertas son botones que señalan su sensor con un anillo. **Fíjate en:** filtrar no toca los datos de los sensores: el vertex shader saca del lienzo los de las zonas ocultas.

[[exercise:10-panel-de-sensores.md]]

```text
sensores → 1200 en 3 zonas · 1 draw(6, 1200) · 20 bytes por sensor · 11 alertas
sensor A-0764 (zona A, cámara fría) · 14.6 °C · 56 % · su centro, del color de su temperatura ✅
Listo: pasa el puntero por el plano, filtra las zonas o elige una alerta
// Tras desmarcar «Cámara fría (A)»:
zonas visibles → 0b110 · A-0764: su centro, el fondo ✅
// Tras volver a marcarla y pulsar la alerta «B-0341»:
zonas visibles → 0b111 · A-0764: su centro, del color de su temperatura ✅
sensor B-0341 (zona B, almacén seco) · 30.9 °C · 79 % · su centro, del color de su temperatura ✅
```

Las casillas cambian un bit cada una con `^=` (XOR), y el shader pregunta por la zona con `board.zones & (1u << zone)`: los mismos operadores de la lección «Bits y bytes», a ambos lados. El anillo del sensor elegido se pinta en el fragment shader (`d > 0.7`), así que su centro conserva el color de la temperatura y la autocomprobación puede leerlo. Los colores de la escala (azul, lima y rosa) cambian también de luminosidad, para que el frío y el calor se distingan sin depender solo del tono.

## Para seguir

Con esta página termina el módulo, y con él el último tramo técnico del curso. Lo que tienes ya es lo que usan las bibliotecas grandes por dentro: Three.js y Babylon.js crean pipelines y bind groups como estos, transformers.js multiplica matrices con teselas en `var<workgroup>`, y las herramientas de regresión visual comparan capturas con atómicos o algo muy parecido. La lección «Mapa del siguiente paso» recoge adónde ir desde aquí: WebAssembly con Rust, C o AssemblyScript, wgpu para llevar este mismo código fuera del navegador, y proyectos para construir con todo lo aprendido.

## Para profundizar

- [Brandon Jones: buenas prácticas de WebGPU (en inglés)](https://toji.dev/webgpu-best-practices/)
- [WebGPU Fundamentals: memoria de grupo y optimización de compute shaders (en inglés)](https://webgpufundamentals.org/webgpu/lessons/webgpu-compute-shaders.html)
- [WebGPU Fundamentals: desplazamientos dinámicos y cómo organizar los uniforms (en inglés)](https://webgpufundamentals.org/webgpu/lessons/webgpu-uniforms.html)
- [MDN: GPUDevice.lost (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/GPUDevice/lost)
- [Los ejemplos oficiales de WebGPU (en inglés)](https://webgpu.github.io/webgpu-samples/)
