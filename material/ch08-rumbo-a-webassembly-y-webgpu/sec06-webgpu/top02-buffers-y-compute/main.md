# Búferes y compute

## Por qué importa

En la lección «CPU y GPU», un fragment shader era «una función de la posición de un píxel a su color», y la lección avisaba de lo que no podía hacer: un total, una media o un histograma, que necesitan a todos los píxeles a la vez, quedaban para «los *compute shaders* del módulo WebGPU». Un **compute shader** es la misma idea sin el píxel: una función que la GPU ejecuta miles de veces en paralelo, una por elemento, y que lee y escribe **búferes**, bloques de memoria de la GPU.

Esta lección es el viaje completo de unos datos: de un `Float32Array` de JavaScript a un búfer de la GPU, por un compute shader y de vuelta. Y cumple varias promesas del capítulo: las banderas de `GPUBufferUsage` que «Bits y bytes» anunciaba como bits, el `device.queue.writeBuffer` de «Float32 y precisión», las reglas de alineación de «ArrayBuffer y vistas» y «DataView y endianness», y el cálculo en media precisión con `shader-f16`.

Desde aquí los ejemplos usan el dispositivo como en la lección anterior: comprobado, con un oyente de `uncapturederror` que escribe con `console.warn` lo que se escape y destruido al cerrar la página.

## El viaje de los datos

La CPU y la GPU no comparten variables: los datos viajan en búferes. Uno de **trabajo**, que el shader lee y escribe, y otro de **lectura**, el único que JavaScript puede abrir para ver lo que hay dentro:

```text
  JavaScript (CPU)                                   GPU
  Float32Array ── queue.writeBuffer ──▶ búfer «datos» (STORAGE) ◀──▶ compute shader: 64 hilos a la vez
                                             │
                                             │ copyBufferToBuffer
                                             ▼
  Float32Array ◀── mapAsync + slice ──  búfer «lectura» (MAP_READ)
```

Son siete pasos, siempre los mismos:

| Paso | Llamadas | Qué hace |
|---|---|---|
| 1. dispositivo | `requestAdapter`, `requestDevice` | la conexión con la GPU (lección anterior) |
| 2. el shader | `createShaderModule({ code })` | compilar el WGSL |
| 3. los búferes | `createBuffer({ size, usage })`, `queue.writeBuffer` | reservar memoria de la GPU y llenarla |
| 4. el pipeline | `createComputePipeline({ layout: 'auto', compute: { module } })` | el shader validado, listo para lanzar |
| 5. el bind group | `createBindGroup({ layout, entries })` | qué búfer va en cada `@binding` |
| 6. grabar y enviar | `beginComputePass`, `setPipeline`, `setBindGroup`, `dispatchWorkgroups`, `copyBufferToBuffer`, `submit` | el trabajo y la copia de vuelta |
| 7. leer | `mapAsync`, `getMappedRange`, `unmap` | traer los bytes a JavaScript |

El primer ejemplo los hace todos a mano, en orden. El compute shader duplica cada número; cada hilo se ocupa de uno, el que dice su `global_invocation_id`:

[[exercise:01-duplicar-un-array.md-]]

```text
entrada → 1,2,3,4.5,-1
búfer «datos» → 20 bytes en la GPU
resultado → 2,4,6,9,-2
```

Tres piezas nuevas de WGSL. `var<storage, read_write> data: array<f32>` declara un búfer de almacenamiento que el shader puede leer y escribir; `array<f32>` sin tamaño toma el del búfer que se conecte, y `arrayLength(&data)` lo dice (5). `@group(0) @binding(0)` es el «enchufe»: el bind group conecta ahí el búfer `«datos»`. Y `layout: 'auto'` deja que WebGPU deduzca del shader qué enchufes hay y de qué tipo; `pipeline.getBindGroupLayout(0)` devuelve ese molde para crear el bind group. Con `'auto'`, un binding declarado pero **no usado** en el shader desaparece del molde, y conectarle un búfer es un error (el mismo despiste que el uniform sin usar de WebGL, pero esta vez con mensaje).

Desde el ejemplo 02, estos pasos están en `assets/webgpu/utils.js` (léelo con «Assets»): `getDevice`, `createStorageBuffer` (un búfer de trabajo lleno con un typed array), `createComputeJob` (módulo, pipeline y bind group), `dispatch` (grabar y enviar una pasada) y `readBuffer` (copiar, mapear y traer los bytes), además de `validationError`, que ejecuta una función dentro de un ámbito de errores y devuelve la primera línea del error o `null`.

## Los usos de un búfer

Un búfer declara al crearlo **para qué** se va a usar, con las banderas de `GPUBufferUsage`. Son bits, como prometía la lección «Bits y bytes»: cada una es una potencia de 2, se combinan con `|` y se comprueban con `&`. La GPU usa esa lista para elegir dónde guarda el búfer y para rechazar cualquier uso que no esté en ella.

| Bandera | Valor | Para qué |
|---|---|---|
| `MAP_READ` | 1 | JavaScript puede mapearlo para **leer** (solo se combina con `COPY_DST`) |
| `MAP_WRITE` | 2 | JavaScript puede mapearlo para **escribir** (solo se combina con `COPY_SRC`) |
| `COPY_SRC` | 4 | origen de una copia (`copyBufferToBuffer`, `copyBufferToTexture`) |
| `COPY_DST` | 8 | destino de una copia o de `writeBuffer` |
| `INDEX` | 16 | índices de vértices para dibujar (lección 3) |
| `VERTEX` | 32 | datos de vértices (lección 3) |
| `UNIFORM` | 64 | uniforms: pocos datos, de solo lectura, para todos los hilos (lección 3) |
| `STORAGE` | 128 | almacenamiento: los arrays de los compute shaders, de lectura y escritura |

Hay dos más, `INDIRECT` (256) y `QUERY_RESOLVE` (512), para usos avanzados. La regla que más sorprende es la de los búferes mapeables: un búfer `MAP_READ` no puede ser también `STORAGE`, así que el resultado de un shader **nunca** se lee directamente. En una tarjeta gráfica con su propia memoria, el búfer de trabajo vive en la memoria de la tarjeta y el de lectura en memoria que la CPU puede ver; en el M1 la memoria es la misma, pero la API es igual para todas las GPU.

[[exercise:02-usos-de-un-bufer.md-]]

```text
MAP_READ  →   1 = 0b00000001
MAP_WRITE →   2 = 0b00000010
COPY_SRC  →   4 = 0b00000100
COPY_DST  →   8 = 0b00001000
INDEX     →  16 = 0b00010000
VERTEX    →  32 = 0b00100000
UNIFORM   →  64 = 0b01000000
STORAGE   → 128 = 0b10000000
STORAGE | COPY_DST → 136 · ¿lleva STORAGE? true
🐛 MAP_READ | STORAGE → Buffer usages (BufferUsage::(MapRead|Storage)) is invalid. If a buffer usage contains BufferUsage::MapRead the only other allowed usage is BufferUsage::CopyDst.
✅ MAP_READ | COPY_DST → válido
🐛 writeBuffer sin COPY_DST → [Buffer "datos"] usage (BufferUsage::Uniform) doesn't include BufferUsage::CopyDst.
```

El último mensaje nombra el búfer por su etiqueta, `«datos»`, como prometía la lección anterior. `writeBuffer` es una **copia** hacia el búfer, así que el búfer necesita `COPY_DST`; casi todos los búferes que se llenan desde JavaScript lo llevan.

## Escribir: `writeBuffer` o `mappedAtCreation`

Hay dos formas de llenar un búfer desde JavaScript:

| | `queue.writeBuffer(búfer, offset, datos)` | `createBuffer({ …, mappedAtCreation: true })` |
|---|---|---|
| cuándo | en cualquier momento, todas las veces que quieras | solo al crearlo |
| cómo | copia los bytes de un typed array; el navegador los lleva a la GPU por la cola | el búfer nace «mapeado»: `getMappedRange()` da su memoria y escribes en ella; `unmap()` se la entrega a la GPU |
| necesita | `COPY_DST` | nada más (cualquier uso) |
| para | datos que cambian: uniforms de cada fotograma, entradas nuevas | datos fijos de una vez: una malla, una tabla |

`writeBuffer` es la opción por defecto: cómoda y rápida. Copia los datos **en el momento de la llamada**, así que puedes reutilizar el typed array enseguida; los bytes llegan a la GPU antes que cualquier `submit` posterior.

### 🐛 De 4 en 4 bytes

La GPU mueve la memoria en palabras de 4 bytes, y WebGPU lo exige en todas las copias. Un offset de 2 es un error de validación; un tamaño de 6 con `mappedAtCreation` lo detecta el propio navegador, sin preguntar a la GPU, y por eso **lanza** al instante:

[[exercise:03-alineacion-de-4-bytes.md-]]

```text
🐛 writeBuffer(precios, 2, …) → BufferOffset (2) is not a multiple of 4.
✅ writeBuffer(precios, 4, …) → válido
🐛 mappedAtCreation, 6 bytes → RangeError: Failed to execute 'createBuffer' on 'GPUDevice': createBuffer failed, size (6) is not a multiple of 4 when mappedAtCreation == true
✅ mappedAtCreation, 8 bytes → estado mapped
   después de unmap() → estado unmapped
   en la GPU → 19.989999771118164, 4.5
```

Es la alineación de «ArrayBuffer y vistas» (un `Float32Array` tiene que empezar en un múltiplo de 4) y del relleno de las filas de un BMP («DataView y endianness»), ahora como regla de la API. El último valor también es un viejo conocido: 19,99 no cabe exacto en float32. Las reglas de alineación de este módulo, juntas:

| Qué | Múltiplo de |
|---|---|
| offset y tamaño de `writeBuffer` y `copyBufferToBuffer` | 4 bytes |
| tamaño de un búfer con `mappedAtCreation` | 4 bytes |
| offset de `mapAsync` | 8 bytes (y el tamaño, de 4) |
| `bytesPerRow` al copiar entre texturas y búferes | 256 bytes (lección 3) |
| desplazamientos de un bind group con offsets dinámicos | 256 bytes (`minUniformBufferOffsetAlignment`) |
| cada campo de un `struct` de WGSL en un búfer | su alineación: 4, 8 o 16 bytes (más abajo) |

## Leer el resultado

`buffer.mapAsync(GPUMapMode.READ)` pide a la GPU que termine todo lo que tenga pendiente con ese búfer y lo ponga al alcance de JavaScript; es una promesa, y no bloquea el hilo principal. Mientras está mapeado, el búfer es **de JavaScript**: `getMappedRange()` devuelve un `ArrayBuffer` con sus bytes, y la GPU no puede usarlo. `unmap()` lo devuelve a la GPU y **se lleva** esa memoria. El estado se lee en `buffer.mapState`:

```text
 'unmapped' ── mapAsync() ──▶ 'pending' ── (la GPU termina) ──▶ 'mapped' ── unmap() ──▶ 'unmapped'
   de la GPU                                                    de JavaScript
```

Las tres formas habituales de equivocarse, en un ejemplo:

[[exercise:04-leer-la-copia.md-]]

```text
🐛 mapAsync del búfer de trabajo → rechazado: OperationError · ¿error de validación? true
🐛 sin copyBufferToBuffer → 0,0,0,0,0
🐛 la vista tras unmap() → length 0 · view[0] undefined
✅ la copia → 2,4,6,9,-2
```

El búfer de trabajo no se puede mapear (no tiene `MAP_READ`, ni puede tenerlo). El de lectura sin la copia está lleno de ceros: WebGPU borra todo búfer nuevo, así que nunca verás basura de otra página, pero tampoco tu resultado. Y la vista sobre el rango mapeado, después de `unmap()`, queda vacía sin ningún error: es el `ArrayBuffer` **desconectado** (*detached*) de la lección «Transferibles», con `length` 0 y lecturas que dan `undefined`. La regla: copia con `slice()` lo que necesites **antes** de `unmap()`.

### 🐛 Olvidar `unmap()`

El error contrario es no devolver nunca el búfer. Un búfer mapeado no puede aparecer en ningún encargo, y la GPU no rechaza solo la copia: rechaza el `submit` **entero**.

[[exercise:05-olvidar-unmap.md-]]

```text
1.ª vuelta → 2,4,6,9,-2
🐛 2.ª vuelta, sin unmap() → [Buffer "lectura"] used in submit while mapped.
   estado del búfer de lectura → mapped
✅ con unmap(), error → ninguno
✅ 2.ª vuelta → 4,8,12,18,-4
```

Fíjate en la última línea: ×4, no ×8. El envío rechazado no ejecutó nada, ni la copia ni el cálculo, así que los datos de la GPU seguían en ×2. Y los datos **se quedan** en la GPU entre envíos: la segunda vuelta buena duplica lo que dejó la primera, sin volver a subir nada. En una aplicación real, el patrón es un búfer de lectura (o varios, que se turnan) que se mapea, se copia y se desmapea en cada vuelta.

## Estructuras en un búfer

Un shader puede leer búferes de estructuras, `array<Particle>`, y JavaScript tiene que colocar cada número en el byte exacto donde el shader lo busca. Las reglas de WGSL dicen que cada tipo tiene un **tamaño** y una **alineación** (el múltiplo en el que debe empezar):

| Tipo | Tamaño | Alineación |
|---|---|---|
| `f32`, `i32`, `u32` | 4 | 4 |
| `vec2f` | 8 | 8 |
| `vec3f` | **12** | **16** |
| `vec4f` | 16 | 16 |
| `mat4x4f` | 64 | 16 |

Dos reglas más: cada campo empieza en el primer múltiplo de su alineación después del campo anterior, y la estructura entera mide un múltiplo de la mayor alineación de sus campos, para que en un array todos los elementos queden alineados. El `vec3f` es la trampa: mide 12 bytes pero se alinea a 16.

### 🐛 El `vec3f` ocupa 16

```text
struct Particle { mass: f32, pos: vec3f }  → 32 bytes
byte   0      4      8      12     16     20     24     28     32
       │ mass │ ░░░░ │ ░░░░ │ ░░░░ │ pos.x│ pos.y│ pos.z│ ░░░░ │
              └─── hueco: 12 bytes ───┘                └ relleno

struct Particle { pos: vec3f, mass: f32 }  → 16 bytes
byte   0      4      8      12     16
       │ pos.x│ pos.y│ pos.z│ mass │
```

El ejemplo calcula ese mapa con las reglas de la tabla y le pide a la GPU que diga qué ve en cada caso: dos partículas, de masa 7 en (1, 2, 3) y de masa 8 en (4, 5, 6).

[[exercise:06-structs-y-vec3.md-]]

```text
{ mass: f32, pos: vec3f } → mass en el byte 0, pos en el byte 16 · 32 bytes
{ pos: vec3f, mass: f32 } → pos en el byte 0, mass en el byte 12 · 16 bytes
🐛 sin huecos → masa 7 en (8, 4, 5) · masa 0 en (0, 0, 0)
✅ con huecos → masa 7 en (1, 2, 3) · masa 8 en (4, 5, 6)
   los 16 floats → 7,0,0,0,1,2,3,0,8,0,0,0,4,5,6,0
```

Empaquetadas sin huecos, la masa de la primera partícula llega bien (byte 0), pero su posición se lee desde el byte 16, donde JavaScript puso la segunda partícula, y la segunda partícula se busca en el byte 32, donde no hay nada. Ningún error lo avisa: son bytes válidos en el sitio equivocado. Hay dos arreglos: escribir con el mapa de bytes en la mano (con huecos de relleno), o **ordenar los campos** para que no haya huecos: con el `vec3f` primero, la masa ocupa los 4 bytes que sobraban y la partícula mide la mitad. Muchos proyectos usan directamente `vec4f`, y guardan algo útil en la cuarta componente.

> **Desde Python:** `struct.pack('<4f', 7, 1, 2, 3)` y un `np.array(…, dtype='f4')` empaquetan sin huecos, como el caso 🐛. Ni siquiera `np.dtype([('mass', 'f4'), ('pos', 'f4', 3)], align=True)` coincide: alinea como C, a 4 bytes (posición en el byte 4, 16 bytes en total). WGSL es más estricto que C con los vectores de 3, así que el mapa hay que calcularlo con sus reglas.

## Grupos de trabajo

`dispatchWorkgroups(n)` no lanza n hilos: lanza n **grupos** de trabajo (*workgroups*), cada uno con los hilos que diga `@workgroup_size` en el shader. Cada hilo recibe tres números:

```text
dispatchWorkgroups(3) con @workgroup_size(4): 3 grupos × 4 hilos = 12 hilos

              grupo 0              grupo 1              grupo 2        ← workgroup_id
           ┌───┬───┬───┬───┐    ┌───┬───┬───┬───┐    ┌───┬───┬───┬───┐
 local     │ 0 │ 1 │ 2 │ 3 │    │ 0 │ 1 │ 2 │ 3 │    │ 0 │ 1 │ 2 │ 3 │  ← local_invocation_id
           └───┴───┴───┴───┘    └───┴───┴───┴───┘    └───┴───┴───┴───┘
 global      0   1   2   3        4   5   6   7        8   9  10  11     ← global_invocation_id

global_invocation_id = workgroup_id × workgroup_size + local_invocation_id
```

¿Por qué grupos? Porque la GPU reparte el trabajo así: cada grupo se ejecuta entero en un mismo núcleo, y sus hilos pueden compartir una memoria rápida (`var<workgroup>`) y esperarse unos a otros (`workgroupBarrier()`), algo que hilos de grupos distintos no pueden hacer. Un grupo de **64** hilos es un buen valor por defecto: múltiplo de los subgrupos de 32 de la lección anterior y lejos del límite de 256. Para imágenes, los grupos pueden tener dos o tres dimensiones: `@workgroup_size(8, 8)` y `dispatchWorkgroups(Math.ceil(ancho / 8), Math.ceil(alto / 8))`, y el hilo lee `id.x` e `id.y`.

### 🐛 Grupos de menos, hilos de más

El número de grupos se calcula en JavaScript, y es fácil quedarse corto:

[[exercise:07-grupos-de-trabajo.md-]]

```text
🐛 dispatchWorkgroups(1) → 64 hilos · duplicados 64 de 100 · el último vale 100
✅ dispatchWorkgroups(2) → 128 hilos · duplicados 100 de 100 · el último vale 200
```

Con `Math.floor`, los 36 últimos precios no los toca nadie, y ningún error lo dice. Con `Math.ceil` hay siempre un grupo de sobra si la división no es exacta, y ese grupo trae hilos que no tienen elemento: 128 hilos para 100 precios. Para ellos está la **guarda**, `if (id.x < arrayLength(&data))`. Sin ella, esos 28 hilos acceden fuera del array. WebGPU no los deja escribir fuera del búfer (a diferencia de C, nunca pisan otra memoria), pero el resultado de esos accesos no está definido: la especificación permite, por ejemplo, que caigan sobre el último elemento. Pon siempre la guarda.

## Una foto en la GPU: grises e histograma

Ya hay piezas para el ejemplo que esperaba la lección «CPU y GPU». Un hilo por píxel: lee los 4 bytes del píxel como un `u32` (en *little-endian*, el rojo es el byte bajo, lección «DataView y endianness»), los separa con máscaras y desplazamientos (lección «Bits y bytes»), calcula la luminancia de la lección «Píxeles» y escribe el píxel gris. Y además **cuenta**: suma 1 al contador de su nivel de gris, en un array de 256 contadores. Pulsa la tarjeta para verlo con la consola:

[[exercise:08-grises-e-histograma.md]]

```text
imagen → 480 × 330 = 158400 píxeles
¿los mismos grises que en JavaScript? → true
✅ atomicAdd: ¿el mismo histograma? → true · suma 158400
🐛 sin atómicos: ¿suman 158400? → false
```

[[exercise:08-grises-e-histograma.md-(script.js)]]

Los pesos de la luminancia (0,2126, 0,7152, 0,0722) van en **enteros**: multiplicados por 256 y redondeados (54, 183 y 19, que suman 256), con `+ 128` para redondear y `>> 8` para dividir entre 256. Así la GPU y JavaScript hacen exactamente las mismas cuentas, y la comparación puede ser `===` y no «casi igual».

### 🐛 Contar sin atómicos

El contador es el problema de la lección «Memoria compartida»: `racyBins[luma] = racyBins[luma] + 1u` son tres pasos (leer, sumar, escribir), y si dos hilos leen el mismo contador antes de que ninguno escriba, se pierde una suma. Allí la carrera se simulaba con generadores; aquí es de verdad, con miles de hilos a la vez, y el cielo de la foto tiene muchos píxeles vecinos del mismo gris que cuentan a la vez en el mismo contador. El total sale por debajo de 158 400, y distinto en cada ejecución. La solución es la misma que allí: una operación **atómica**. `atomicAdd(&bins[luma], 1u)` sobre un `array<atomic<u32>, 256>` hace los tres pasos en uno, y el histograma sale idéntico al de JavaScript. Los atómicos de WGSL son los de `Atomics`: `atomicAdd`, `atomicSub`, `atomicMax`, `atomicMin`, `atomicAnd`, `atomicOr`, `atomicExchange`, `atomicCompareExchangeWeak`, `atomicLoad` y `atomicStore`, sobre `atomic<u32>` o `atomic<i32>`. Son más lentos que una suma normal cuando muchos hilos chocan en el mismo contador; los programas que cuentan mucho primero cuentan por grupo en `var<workgroup>` y suman al final.

## Media precisión en la GPU

La lección «Float32 y precisión» presentaba `Float16Array` y avisaba de que WebGPU puede calcular en `f16` si la GPU lo admite. Este es el ejemplo: un dispositivo con `requiredFeatures: ['shader-f16']` (lección anterior), `enable f16;` al principio del shader, un `array<f16>` y los bytes de un `Float16Array`, tal cual:

[[exercise:09-media-precision-f16.md-]]

```text
// En el Mac del curso (la GPU tiene shader-f16):
Float16Array → 0.0999755859375, 1.5, 2048, 30000 · 8 bytes (en float32, 16)
×2 en la GPU → 0.199951171875, 3, 4096, 60000
×2 en JavaScript → 0.199951171875, 3, 4096, 60000
```

Los redondeos ocurren al guardar: 2049 no existe en float16 (por encima de 2048 los vecinos van de 2 en 2) y se queda en 2048, y 0,1 se convierte en 0,0999755859375. A partir de ahí, la GPU y JavaScript coinciden. Calcular en `f16` usa la mitad de memoria y de ancho de banda, y en muchas GPU va el doble de rápido: por eso las redes neuronales del navegador lo usan para sus pesos. Pero el máximo es 65504: 30 000 × 2 cabe; 40 000 × 2, no.

## ¿Cuánto gana la GPU?

La lección «CPU y GPU» comparaba un desenfoque en los dos procesadores. Esta compara un cálculo sin imagen: 64 meses de intereses y aportaciones para algo más de medio millón de cuentas de ahorro, 33,5 millones de vueltas de bucle. Pulsa «Comparar» dos veces:

[[exercise:10-cpu-contra-gpu.md]]

```text
Listo: 524288 cuentas × 64 meses; pulsa «Comparar»
// Tras pulsar «Comparar» la primera vez. Los tiempos cambian en cada ejecución; en el M1 del curso:
CPU, un bucle → ≈ 80-170 ms
GPU, 1.ª vez (crear el pipeline y los búferes) → ≈ 17 ms
¿el mismo resultado? (diferencia < 0,01 %) → true
// Tras pulsar otra vez:
CPU, un bucle → ≈ 77 ms
GPU → ≈ 3-4 ms
¿el mismo resultado? (diferencia < 0,01 %) → true
```

[[exercise:10-cpu-contra-gpu.md-(script.js)]]

El tiempo de la GPU se mide como en WebGL: desde que se encarga el trabajo hasta que el resultado está en JavaScript (`mapAsync` espera a que la GPU termine), así que incluye **subir** 2 MB, calcular y **bajar** otros 2 MB. La GPU gana porque cada número que viaja lleva 64 vueltas de cálculo; con una cuenta barata por elemento, como la escala de grises del ejemplo 08, el viaje se come la ventaja y un bucle de JavaScript puede ganar. Y los resultados coinciden, con la tolerancia de siempre entre float32 y float64.

### 🐛 La primera vez no cuenta

La primera pulsación es mucho más lenta para la GPU, y no porque calcule peor: dentro del cronómetro está **crear el pipeline**, que traduce el WGSL al lenguaje de shaders del sistema (en este Mac, el de Metal) y lo compila para la GPU, y reservar los búferes. Es el calentamiento de la lección «Medir antes de optimizar», en versión GPU. En una aplicación se evita creando los pipelines al cargar, con `createComputePipelineAsync()` (que compila sin bloquear el hilo principal) y, si el primer uso tiene que ser rápido, lanzándolo una vez en vacío. Para medir solo lo que tarda la GPU, sin el viaje de los datos, existe la característica opcional `timestamp-query`: cada pasada puede escribir marcas de tiempo de la propia GPU, al empezar y al terminar (`timestampWrites`), en un `GPUQuerySet` que después se copia a un búfer y se lee como los demás.

## Bestiario

- **`If a buffer usage contains BufferUsage::MapRead the only other allowed usage is BufferUsage::CopyDst`.**
  Síntoma: un búfer pensado para que el shader escriba y JavaScript lo lea no se puede crear.
  Causa: un búfer mapeable solo admite copias; `MAP_READ` no se combina con `STORAGE`.
  Solución: un búfer de trabajo (`STORAGE | COPY_SRC`) y otro de lectura (`MAP_READ | COPY_DST`), con un `copyBufferToBuffer` entre los dos.
  → [ver ejemplo](02-usos-de-un-bufer.md)
- **`usage (BufferUsage::Uniform) doesn't include BufferUsage::CopyDst`.**
  Síntoma: `writeBuffer` no escribe nada y aparece este error.
  Causa: `writeBuffer` es una copia hacia el búfer, y el búfer no se creó con `COPY_DST`.
  Solución: añade `GPUBufferUsage.COPY_DST` a todo búfer que se llene desde JavaScript.
  → [ver ejemplo](02-usos-de-un-bufer.md)
- **`is not a multiple of 4`.**
  Síntoma: `writeBuffer` con un offset o un tamaño impar da un error de validación; `createBuffer` con `mappedAtCreation` y un tamaño de 6 lanza un `RangeError`.
  Causa: las copias de WebGPU van de 4 en 4 bytes.
  Solución: offsets y tamaños múltiplos de 4; redondea el tamaño de los búferes hacia arriba (`Math.ceil(bytes / 4) * 4`).
  → [ver ejemplo](03-alineacion-de-4-bytes.md)
- **El resultado sale lleno de ceros, o vacío.**
  Síntoma: `mapAsync` del búfer del shader se rechaza; el búfer de lectura da ceros; la vista de los datos tiene `length` 0 al usarla.
  Causa: el búfer de trabajo no es mapeable; sin `copyBufferToBuffer` el de lectura no recibió nada; `unmap()` desconecta el rango mapeado.
  Solución: copia al búfer de lectura en el mismo encargo, `await mapAsync`, `getMappedRange().slice(0)` y después `unmap()`.
  → [ver ejemplo](04-leer-la-copia.md)
- **`used in submit while mapped`.**
  Síntoma: la segunda vez que se lanza un cálculo no pasa nada, ni siquiera el cálculo.
  Causa: el búfer de lectura se quedó mapeado (falta `unmap()`), y un `submit` que lo usa se rechaza entero.
  Solución: `unmap()` en cuanto hayas copiado los datos; comprueba `buffer.mapState` si dudas.
  → [ver ejemplo](05-olvidar-unmap.md)
- **Los campos de una estructura llegan cambiados al shader.**
  Síntoma: el shader lee posiciones o colores que no son los que escribió JavaScript, sin ningún error.
  Causa: un `vec3f` (y un `vec4f`) se alinea a 16 bytes, y la estructura se rellena hasta un múltiplo de su mayor alineación; un typed array sin huecos no coincide.
  Solución: calcula los offsets con las reglas de WGSL y escribe con huecos, u ordena los campos (el `vec3f` primero) o usa `vec4f`.
  → [ver ejemplo](06-structs-y-vec3.md)
- **Los últimos elementos no cambian.**
  Síntoma: un compute shader procesa el principio del array y deja el final como estaba.
  Causa: se lanzaron pocos grupos: el número de grupos se calculó con `Math.floor`.
  Solución: `Math.ceil(n / workgroupSize)` grupos, y la guarda `if (id.x < arrayLength(&data))` para los hilos que sobran.
  → [ver ejemplo](07-grupos-de-trabajo.md)
- **Un recuento que no suma lo que debe, y cambia en cada ejecución.**
  Síntoma: un histograma o un contador calculado en la GPU se queda corto.
  Causa: varios hilos leen, suman y escriben el mismo contador a la vez: una carrera de datos.
  Solución: `array<atomic<u32>>` y `atomicAdd`; con muchos choques, cuenta primero por grupo en `var<workgroup>`.
  → [ver ejemplo](08-grises-e-histograma.md)
- **La GPU «tarda» mucho la primera vez.**
  Síntoma: el primer cálculo en la GPU es varias veces más lento que los siguientes.
  Causa: crear el pipeline compila el shader, y el primer uso reserva los búferes.
  Solución: crea pipelines y búferes al cargar (`createComputePipelineAsync`), lanza una vez en vacío y mide después; para tiempos de la GPU, `timestamp-query`.
  → [ver ejemplo](10-cpu-contra-gpu.md)

## Resumen

- El viaje: `writeBuffer` (o `mappedAtCreation`) → búfer `STORAGE` → compute shader → `copyBufferToBuffer` → búfer `MAP_READ` → `mapAsync`, `getMappedRange().slice(0)`, `unmap()`.
- `GPUBufferUsage` son bits que se combinan con `|`; `MAP_READ` solo va con `COPY_DST` y `MAP_WRITE` con `COPY_SRC`; `writeBuffer` necesita `COPY_DST`.
- Las copias van de 4 en 4 bytes; las filas de las texturas, de 256 en 256; los campos de un `struct`, según su alineación (`vec3f`: 12 bytes que se alinean a 16).
- WGSL: `var<storage, read_write> data: array<f32>`, `@group/@binding`, `arrayLength`, `@builtin(global_invocation_id)`; `layout: 'auto'` y un bind group conectan los búferes.
- `dispatchWorkgroups(Math.ceil(n / 64))` con `@workgroup_size(64)` y una guarda para los hilos que sobran.
- Para contar entre hilos, atómicos (`atomicAdd`); `f16` con `shader-f16` y un `Float16Array`.
- La GPU gana cuando hay mucho cálculo por byte que viaja; mide después de crear los pipelines.

## Para profundizar

- [WebGPU Fundamentals: compute shaders (en inglés)](https://webgpufundamentals.org/webgpu/lessons/webgpu-compute-shaders.html)
- [WebGPU Fundamentals: la disposición de los datos en memoria, con calculadora de offsets (en inglés)](https://webgpufundamentals.org/webgpu/lessons/webgpu-memory-layout.html)
- [MDN: GPUBuffer (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/GPUBuffer)
- [MDN: GPUQueue.writeBuffer (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/GPUQueue/writeBuffer)
- [La especificación de WGSL: alineación y tamaño (en inglés)](https://www.w3.org/TR/WGSL/#alignment-and-size)
