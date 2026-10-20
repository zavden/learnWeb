# ¿Qué es WebGPU?

## Por qué importa

El módulo «Gráficos en la GPU» terminaba con una lista de límites de WebGL 2: un solo estado global que hay que recordar (`useProgram`, `bindTexture`, el viewport…), errores que solo aparecen si los preguntas con `gl.getError()` y nada de cálculo general fuera de los píxeles: para calcular había que fingir que los datos eran una imagen. Y prometía que el último módulo del curso cambiaría ese modelo por otro con **objetos explícitos**, **validación con mensajes claros** y ***compute shaders***. Este es ese módulo.

**WebGPU** es la API moderna para hablar con la GPU desde una página. Llegó a Chrome en 2023 y a Safari y Firefox en 2025, y no es «WebGL 3»: es un diseño nuevo, modelado sobre las APIs nativas que usan hoy los videojuegos y los sistemas operativos (Vulkan, Metal y Direct3D 12). Con ella se dibuja, como con WebGL, y además se **calcula**: simulaciones físicas, filtros de imagen, y la inferencia de redes neuronales que hace posible ejecutar modelos de lenguaje dentro del navegador.

Esta primera lección presenta las piezas antes de usarlas: cómo se comprueba que WebGPU existe, qué son el adaptador, el dispositivo y la cola, qué puede hacer tu GPU y qué te deja hacer el dispositivo, por qué los errores no lanzan excepciones y cómo se leen, y un primer vistazo a **WGSL**, su lenguaje de shaders.

## Qué hay en este módulo

1. **¿Qué es WebGPU?** (esta lección): adaptador, dispositivo y cola, soporte, características y límites, errores y WGSL.
2. **Búferes y compute**: crear búferes, escribirlos y leerlos, y compute shaders que duplican un array, pasan una foto a grises o cuentan píxeles.
3. **El pipeline de render**: el triángulo en WebGPU, vértices, uniforms, texturas, instancias y mezcla.
4. **Mapa del siguiente paso**: la última lección del curso, con lo que puedes estudiar y construir a partir de aquí.

Todos los ejemplos son JavaScript con el WGSL en un template string o en un archivo `.wgsl` de `assets/`. Como en el módulo de WebGL, dibujan o calculan **una vez** al cargar y comprueban el resultado leyéndolo de la GPU; lo que se anima, se anima con un botón.

## De WebGL a WebGPU

El pipeline gráfico es el mismo de la lección «CPU y GPU»: vértices, vertex shader, rasterización, fragment shader, mezcla. Lo que cambia es **cómo se habla** con la GPU. WebGL es una máquina de estados: activas un programa, enlazas un búfer, cambias el viewport, y cada `drawArrays` usa lo que esté activo en ese momento; el navegador lo comprueba todo en cada dibujo. WebGPU pide que describas cada cosa **una vez**, en un objeto, y lo valida al crearlo:

| | WebGL 2 | WebGPU |
|---|---|---|
| de dónde sale | `canvas.getContext('webgl2')` | `navigator.gpu.requestAdapter()` y `requestDevice()` |
| dónde vive el estado | en el contexto: lo último que activaste con `use*`/`bind*` | en objetos: pipelines y *bind groups*, que no cambian |
| cuándo se comprueba | en cada llamada de dibujo | al crear cada objeto: un pipeline se valida entero una vez |
| errores | `gl.getError()` da un código numérico | mensajes de texto con el nombre (`label`) de cada objeto |
| el trabajo | cada llamada es un encargo | se graba en un codificador y se envía a la cola de golpe |
| calcular sin dibujar | fingiendo que los datos son una textura | *compute shaders* |
| lenguaje | GLSL ES 3.00 | WGSL |
| lienzos | un contexto por lienzo | un dispositivo para varios lienzos, o para ninguno |

Las piezas forman una escalera. Cada peldaño se pide al anterior, y los dos primeros son asíncronos:

```text
navigator.gpu            la API, si el navegador la tiene
   │ await requestAdapter()
   ▼
GPUAdapter               una GPU concreta: quién es, qué sabe hacer (features), hasta dónde llega (limits)
   │ await requestDevice()
   ▼
GPUDevice                tu conexión con ella: crea búferes, texturas, shaders, pipelines…
   │ device.queue
   ▼
GPUQueue                 la cola de encargos: queue.submit([…]), queue.writeBuffer(…)
```

¿Por qué tanta ceremonia? Porque las GPU modernas funcionan así por dentro. Con WebGL, el driver tenía que adivinar en cada dibujo qué había cambiado y recompilar o revalidar lo necesario, y esa adivinanza era lenta e impredecible. Con objetos explícitos, el trabajo caro (compilar, validar, preparar) se hace al crear el pipeline, y dibujar queda en casi nada.

## Comprobar el soporte

WebGPU no está en todos los navegadores ni en todas las máquinas, y solo existe en **contextos seguros**: páginas servidas por `https` o desde `localhost` (las tarjetas de LearnWeb, aunque tienen origen `null`, también lo son). La comprobación tiene dos pasos: que exista `navigator.gpu` y que `requestAdapter()` devuelva un adaptador.

[[exercise:01-hay-webgpu.md-]]

```text
'gpu' in navigator → true
isSecureContext → true
// En el Mac del curso:
fabricante → apple
arquitectura → metal-3
modelo y descripción → "" ""
¿de reserva (por software)? → false
```

El adaptador dice quién fabrica la GPU (`apple`) y su familia (`metal-3`: las GPU de Apple que admiten Metal 3, la API sobre la que Chrome ejecuta WebGPU en este Mac), pero deja vacíos el modelo exacto y la descripción. Es una medida de privacidad: el modelo de GPU, junto con otros datos, ayudaría a reconocer tu equipo entre millones (*fingerprinting*). La lección «CPU y GPU» ya leía estos dos valores en su comparación de WebGL y WebGPU.

### 🐛 El adaptador puede ser `null`

`requestAdapter()` no lanza un error cuando no puede darte una GPU: la promesa se cumple con `null`. Pasa en máquinas cuyo driver está en la lista de bloqueo del navegador, con una GPU que se está reiniciando o en algunas máquinas virtuales. El código de muchos tutoriales pasa directamente a `adapter.requestDevice()`, y en esas máquinas la página se rompe con un error que no dice nada de GPUs:

[[exercise:02-adaptador-nulo.md-]]

```text
🐛 sin comprobar → TypeError: Cannot read properties of null (reading 'requestDevice')
✅ comprobando, sin adaptador → WebGPU existe, pero no hay adaptador: dibuja con WebGL o con el canvas 2D
✅ comprobando, sin navigator.gpu → sin WebGPU: dibuja con WebGL o con el canvas 2D
// En el Mac del curso:
✅ comprobando, con la GPU real → dispositivo listo (apple)
forceFallbackAdapter → null
```

La máquina sin GPU está simulada con un objeto que tiene un `requestAdapter` que devuelve `null`: así se puede probar el camino del error en cualquier equipo. La última línea es un `null` de verdad: `forceFallbackAdapter: true` pide un adaptador «de reserva», que emula la GPU en la CPU, y el navegador no tiene ninguno para este Mac. Si la página no puede seguir sin GPU, dilo en pantalla; si puede, ofrece otro camino (WebGL 2 o el canvas 2D, que ya conoces).

## El adaptador: qué sabe hacer tu GPU

Las GPU no son todas iguales. WebGPU define una base que todas cumplen y, por encima, **características** opcionales (*features*) y **límites** (*limits*) que cambian de una GPU a otra. El adaptador los publica en `adapter.features` (se usa como un `Set`: `has`, `size`, `for…of`) y `adapter.limits` (un objeto con un número por límite):

[[exercise:03-caracteristicas-y-limites.md-]]

```text
// En el Mac del curso:
formato preferido del lienzo → bgra8unorm
shader-f16 → true
timestamp-query → true
float32-filterable → true
subgroups → true
texture-compression-bc → true
texture-compression-astc → true
maxComputeInvocationsPerWorkgroup → 1024
maxComputeWorkgroupSizeX → 1024
maxStorageBufferBindingSize → 4294967292 bytes (4.0 GiB)
tamaño de subgrupo → 32 hilos
```

| Característica | Para qué sirve | En el curso |
|---|---|---|
| `shader-f16` | números de 16 bits en los shaders (`f16`): la mitad de memoria | ejemplo 06 y lección 2 |
| `timestamp-query` | medir cuánto tarda la GPU, con precisión | lección 2 |
| `float32-filterable` | filtrar (`linear`) texturas de float32 | — |
| `subgroups` | que los hilos de un subgrupo compartan datos sin pasar por memoria | — |
| `texture-compression-bc`, `-astc`, `-etc2` | texturas comprimidas, tal como las guardan los juegos | — |

El formato preferido, `bgra8unorm`, dice en qué orden guarda la pantalla los canales de cada píxel: azul, verde, rojo y alfa, un byte cada uno. Tendrá su propia trampa en la lección 3. Y los 32 hilos del subgrupo son los *SIMD-groups* de Apple de la lección «CPU y GPU»: los hilos que ejecutan la misma instrucción a la vez.

## El dispositivo y sus límites

El **dispositivo** es lo que de verdad usarás: crea los búferes, las texturas, los shaders y los pipelines, y su `queue` recibe los encargos. Lo que sorprende es que sus límites **no** son los del adaptador:

[[exercise:04-el-dispositivo.md-]]

```text
dispositivo → tienda
características → core-features-and-limits
cola → GPUQueue
maxComputeInvocationsPerWorkgroup → 256
maxStorageBufferBindingSize → 134217728 bytes (128 MiB)
maxBufferSize → 268435456 bytes (256 MiB)
maxBindGroups → 4
destroy() → llamado
device.lost → destroyed
el mismo adaptador, otra vez → OperationError: Failed to execute 'requestDevice' on 'GPUAdapter': adapter is "consumed": it has already been used to create a device
// En el Mac del curso:
adaptador → 1024 hilos por grupo · 4294967292 bytes por búfer
```

Un dispositivo pedido sin opciones tiene los límites **mínimos** que WebGPU garantiza en cualquier GPU: 256 hilos por grupo, búferes de almacenamiento de 128 MiB, 4 grupos de bindings. Es a propósito: si tu código cabe en esos límites, funcionará en el portátil de cualquiera, no solo en el tuyo. Y lo mismo con las características: el dispositivo trae solo `core-features-and-limits` (la marca de «WebGPU completo») y nada opcional. Para tener más, se pide al crearlo, con `requiredLimits` y `requiredFeatures`, y nunca más de lo que el adaptador anuncia: pedir de más hace que `requestDevice()` falle.

`device.destroy()` libera toda su memoria de la GPU (búferes, texturas) de una vez. `device.lost` es una promesa que se cumple cuando el dispositivo deja de servir, con el motivo en `reason`: `'destroyed'` si lo destruiste tú, `'unknown'` si la GPU se perdió (un driver que se reinicia, un portátil que despierta). Una aplicación seria escucha esa promesa y vuelve a crearlo todo; la verás en la última lección. Los ejemplos del módulo destruyen su dispositivo al cerrar la página (`pagehide`).

Y un detalle que sorprende al hacer pruebas: **un adaptador da un solo dispositivo**. Después de `requestDevice()`, el adaptador queda «consumido» (*consumed*), y pedirle otro dispositivo se rechaza con un `OperationError`, aunque el primero ya esté destruido. Para otro dispositivo (con otros límites, para recuperarse de una pérdida), se pide otro adaptador: `await navigator.gpu.requestAdapter()` es barato y devuelve la misma GPU. Los ejemplos que siguen lo hacen así.

### 🐛 Los límites por defecto

Este ejemplo pide grupos de 512 hilos a un dispositivo por defecto. La GPU admite 1024, pero el dispositivo, 256:

[[exercise:05-limites-por-defecto.md-]]

```text
hilos por grupo, como mucho → 256
🐛 sin requiredLimits → Entry-point uses workgroup_size(512, 1, 1) that exceeds the maximum allowed (256, 256, 64).
   ¿el mensaje dice cómo arreglarlo? → true
// En el Mac del curso (el adaptador admite 1024):
hilos por grupo, como mucho → 512
✅ con requiredLimits → pipeline creado
```

Fíjate en la calidad del mensaje: dice qué pediste, cuál es el máximo y, en el resto del texto, que este adaptador admite más y que se pide con `requiredLimits` al llamar a `requestDevice()`. Compáralo con el `1282` de `gl.getError()`. Pero no pidas límites altos por costumbre: cada límite que subes deja fuera a las GPU que no llegan.

### 🐛 Las características hay que pedirlas

Con las características pasa lo mismo. Un shader que usa números `f16` necesita `shader-f16`, y no basta con que la tenga el adaptador:

[[exercise:06-pedir-una-caracteristica.md-]]

```text
// En el Mac del curso:
¿el adaptador tiene shader-f16? → true
🐛 características → core-features-and-limits
🐛 enable f16 → Error while parsing WGSL: :1:8 error: extension 'f16' is not allowed in the current environment
✅ características → core-features-and-limits, shader-f16
✅ enable f16 → compila
```

El patrón correcto es preguntar al adaptador (`adapter.features.has('shader-f16')`), pedirla solo si existe y tener un plan B si no: un shader en `f32`. La lección 2 pide un dispositivo así para calcular de verdad con números de media precisión.

## Grabar y enviar

En WebGL, cada llamada era un encargo para la GPU. En WebGPU, los encargos se **graban** en un codificador (`GPUCommandEncoder`), que los apunta sin ejecutarlos; `finish()` cierra la grabación y da un `GPUCommandBuffer`, y `queue.submit([…])` lo manda a la cola de una vez. `submit()` no devuelve nada ni espera a la GPU: vuelve al instante, y la GPU trabaja en paralelo mientras JavaScript sigue.

[[exercise:07-grabar-y-enviar.md-]]

```text
1. grabado → GPUCommandBuffer «pedido del día»
2. submit() ha vuelto → undefined (no es una promesa)
3. JavaScript sigue con lo suyo
4. onSubmittedWorkDone → la GPU ha terminado
```

Es lo mismo que pasaba en WebGL (lección «CPU y GPU»: las llamadas encargan y vuelven), pero ahora a la vista. Y la espera también es explícita: `queue.onSubmittedWorkDone()` es una promesa que se cumple cuando la GPU termina todo lo enviado hasta ese momento, sin bloquear el hilo principal como el `readPixels` de WebGL. Dentro de un codificador irán las **pasadas**: una pasada de cómputo (`beginComputePass`) en la lección 2 y una de dibujo (`beginRenderPass`) en la lección 3.

## Los errores no lanzan

La GPU vive en otro proceso del navegador. Cuando llamas a `device.createBuffer(…)`, Chrome te da un objeto **al momento** y manda la petición a ese proceso, que la valida después. Si algo está mal, ya es tarde para lanzar una excepción: el objeto que tienes queda marcado como **inválido**, todo lo que se construya con él también lo será, y el aviso va a… ningún sitio, si nadie lo escucha. Chrome lo escribe como advertencia en la consola de DevTools, pero la consola de LearnWeb no lo ve, y en la página no pasa nada. Es el fallo más típico al empezar con WebGPU: **una página que no hace nada, sin un solo error**.

[[exercise:08-errores-silenciosos.md-]]

```text
🐛 createBuffer con usage 0 → un GPUBuffer de 16 bytes, sin excepción
✅ popErrorScope → GPUValidationError
   Buffer usages must not be 0.
   - While calling [Device "tienda"].CreateBuffer([BufferDescriptor ""facturas""]).
✅ uncapturederror → Buffer usages must not be 0.
```

Hay dos formas de recoger los errores:

| Forma | Cómo | Para qué |
|---|---|---|
| ámbito de errores | `device.pushErrorScope('validation')`, las llamadas, `await device.popErrorScope()` | comprobar un paso concreto: devuelve el **primer** error del ámbito, o `null` |
| oyente del dispositivo | `device.addEventListener('uncapturederror', (event) => …)` y `event.error` | la red de seguridad: todo error que no recoja ningún ámbito; Chrome lo entrega la próxima vez que la página trabaja con la GPU (un `submit`, `onSubmittedWorkDone()`…), no con el dispositivo ocioso |

El filtro `'validation'` recoge los errores de uso de la API, que son casi todos; existen también `'out-of-memory'` e `'internal'`. Y fíjate en la segunda línea del mensaje: nombra el dispositivo y el búfer por su `label`. (Chrome escribe la etiqueta del descriptor entre comillas dobladas, `[BufferDescriptor ""facturas""]`: es así.) Con veinte búferes en una aplicación, `[Buffer "facturas"]` dice cuál es; sin etiquetas, el mensaje dice `[Buffer]` y tienes que adivinarlo. Desde aquí, todos los ejemplos ponen etiquetas a todo, y los de las lecciones siguientes escuchan `uncapturederror` y lo escriben con `console.warn`.

Hay unas pocas excepciones que sí lanzan al momento: las que el navegador puede comprobar sin preguntar a la GPU, como un tamaño imposible en `createBuffer` (lección 2).

## WGSL de un vistazo

Los shaders de WebGPU se escriben en **WGSL** (*WebGPU Shading Language*). Se parece a Rust en la sintaxis (`fn`, `let`, `var`, los tipos después del nombre con `:`) y a GLSL en lo demás: vectores y matrices de serie, las mismas funciones (`dot`, `mix`, `clamp`), float32 en todas partes. Un mismo módulo puede tener varios **puntos de entrada**, marcados con un atributo: `@compute`, `@vertex` o `@fragment`.

[[exercise:09-primer-vistazo-a-wgsl.md-]]

```text
tour.wgsl → 53 líneas
mensajes del compilador → 0
pipeline de cómputo con «main» → creado
```

El archivo `assets/tour.wgsl` (léelo con «Assets») tiene comentada cada pieza. Lo esencial:

| | WGSL | Notas |
|---|---|---|
| escalares | `f32`, `i32`, `u32`, `bool` | sin `f64`; `f16` con `shader-f16` |
| vectores | `vec2f`, `vec3f`, `vec4f`, `vec3u`, `vec2i`… | atajos de `vec3<f32>`, `vec3<u32>`… |
| matrices | `mat4x4f`, `mat3x3f`… | por columnas, como las de la lección «WebGL desde JavaScript» |
| constantes | `const TAX_RATE = 0.16;` | se conoce al compilar |
| variables | `let x = …;` (no cambia), `var x = …;` (cambia) | el tipo se deduce o se escribe: `let x: f32 = …` |
| funciones | `fn total(p: Product) -> f32 { … }` | |
| estructuras | `struct Product { price: f32, units: u32 }` | |
| literales | `3` y `3.0` se adaptan; `3u` (u32), `3i` (i32), `3.0f` (f32), `0.5h` (f16) | |

| Atributo | Dónde va | Qué dice |
|---|---|---|
| `@compute`, `@vertex`, `@fragment` | antes de `fn` | este es un punto de entrada de ese tipo |
| `@workgroup_size(64)` | con `@compute` | cuántos hilos tiene cada grupo |
| `@group(0) @binding(0)` | antes de un recurso (`var<storage>`, `var<uniform>`, texturas) | dónde lo conecta JavaScript |
| `@builtin(global_invocation_id)` | un parámetro o un campo | un valor que pone la GPU: qué hilo soy, qué vértice, en qué píxel |
| `@location(0)` | entradas y salidas | qué atributo de vértice, qué varying o qué destino de dibujo |

Como en GLSL, todo bucle de un shader debe terminar pronto: aquí no hay guarda de bucles de LearnWeb, y un shader que no acaba congela la GPU (y, en un portátil sin ventilador, el equipo entero). Todos los bucles de este módulo tienen un límite fijo y pequeño.

### 🐛 Sin conversiones implícitas

En la lección «Tu primer fragment shader», GLSL no dejaba escribir `1` donde iba un `float`. WGSL es más amable con los **literales**: `let x: f32 = 1;` vale, porque un número escrito sin sufijo es «abstracto» y se adapta al tipo que se le pide. Pero con **valores** de un tipo concreto es igual de estricto: un `i32` no pasa a `f32` (ni al revés) sin una conversión escrita.

[[exercise:10-wgsl-sin-conversiones.md-]]

```text
🐛 mensajes → 1
   error 2:7 cannot initialize 'let' of type 'f32' with value of type 'i32'
✅ mensajes → 0
🐛 createShaderModule → Error while parsing WGSL: :4:16 error: unresolved value 'datos'
🐛 createComputePipeline → [Invalid ShaderModule "duplicar"] is invalid due to a previous error.
```

Tres detalles. `total / count` entre dos `i32` es una división **entera** (7 / 2 da 3), y querer guardarla en un `f32` es justo el aviso que necesitas: convierte antes de dividir, `f32(total) / f32(count)`. El compilador informa solo del **primer** error (la línea 3 también estaba mal): corrige y vuelve a compilar. Y el error de un módulo **se contagia**: el pipeline creado con él falla con `[Invalid ShaderModule "duplicar"] is invalid due to a previous error`. Cuando veas una cascada de «invalid due to a previous error», sube hasta el primer mensaje: los demás son consecuencias. El mensaje completo de `createShaderModule` cita además la línea culpable y la subraya:

```text
Error while parsing WGSL: :4:16 error: unresolved value 'datos'
  data[id.x] = datos[id.x] * 2.0;
               ^^^^^
```

## Calcular en la GPU

Los *compute shaders* son la gran novedad. Un compute shader no dibuja: es una función que la GPU ejecuta miles de veces en paralelo, cada vez con un número de hilo distinto, y que lee y escribe **búferes** de memoria. Es la idea del fragment shader («una función por píxel») sin el píxel: una función por elemento de un array. Con ellos, la GPU sirve para física (partículas, fluidos, telas), procesado de imagen y vídeo, simulaciones científicas y, sobre todo hoy, **aprendizaje automático**: una red neuronal es, casi entera, multiplicar matrices enormes. Bibliotecas como transformers.js (de Hugging Face) y WebLLM ejecutan modelos de visión y de lenguaje dentro del navegador con WebGPU, sin servidor.

> **Desde Python:** es la diferencia entre numpy y CuPy o PyTorch. `np.array(datos) * 2` multiplica en la CPU; `torch.tensor(datos, device='mps') * 2` (en un Mac; `'cuda'` con una GPU de NVIDIA) hace la misma cuenta en la GPU, y CuPy copia la interfaz de numpy para que el cambio sea casi solo el `import`. Por debajo, esas bibliotecas lanzan compute shaders (*kernels*). Con WebGPU los escribes tú, y el `.to('mps')` que mueve los datos a la GPU es el `writeBuffer` de la lección siguiente.

## Bestiario

- **`Cannot read properties of null (reading 'requestDevice')`.**
  Síntoma: la página funciona en tu equipo y se rompe en otros con un `TypeError` que no menciona la GPU.
  Causa: `requestAdapter()` devuelve `null` (no lanza) cuando el navegador no puede dar una GPU, y el código no lo comprobó.
  Solución: comprueba `navigator.gpu` y el adaptador, y ofrece otro camino (WebGL 2, canvas 2D) o un mensaje en la página.
  → [ver ejemplo](02-adaptador-nulo.md)
- **«exceeds the maximum allowed» con una GPU que debería poder.**
  Síntoma: un pipeline (o un búfer) que pide más de los límites básicos falla, aunque el adaptador anuncie límites mayores.
  Causa: el dispositivo tiene los límites mínimos de WebGPU salvo que se pidan otros al crearlo.
  Solución: `requestDevice({ requiredLimits: { … } })` con valores que no pasen de `adapter.limits`; mejor aún, diseña dentro de los límites básicos.
  → [ver ejemplo](05-limites-por-defecto.md)
- **`extension 'f16' is not allowed` con una GPU que tiene `shader-f16`.**
  Síntoma: un shader que usa una característica opcional no compila.
  Causa: el dispositivo solo tiene las características que se pidieron en `requiredFeatures`.
  Solución: comprueba `adapter.features.has(…)` y pídela al crear el dispositivo; si no existe, usa la versión sin ella.
  → [ver ejemplo](06-pedir-una-caracteristica.md)
- **La página no hace nada y no hay ningún error.**
  Síntoma: no se dibuja nada o no sale ningún resultado, y la consola de LearnWeb está limpia.
  Causa: los errores de WebGPU no lanzan excepciones: dejan objetos inválidos y el aviso solo llega a DevTools.
  Solución: `pushErrorScope('validation')` / `popErrorScope()` alrededor de los pasos que dudes, un oyente de `uncapturederror` siempre, y `label` en todos los objetos.
  → [ver ejemplo](08-errores-silenciosos.md)
- **`cannot initialize 'let' of type 'f32' with value of type 'i32'`.**
  Síntoma: un shader no compila por mezclar enteros y decimales.
  Causa: WGSL no convierte valores entre tipos; solo los literales sin sufijo se adaptan.
  Solución: convierte con el nombre del tipo, `f32(total)`, `u32(x)`, antes de operar; y si ves una cascada de «invalid due to a previous error», lee el primer mensaje.
  → [ver ejemplo](10-wgsl-sin-conversiones.md)

## Resumen

- WebGPU es la API moderna de la GPU en la web, modelada sobre Vulkan, Metal y Direct3D 12: objetos explícitos que se validan al crearlos, encargos que se graban y se envían, y compute shaders.
- La escalera: `navigator.gpu` → `requestAdapter()` (puede ser `null`) → `requestDevice()` → `device.queue`.
- El adaptador publica `info`, `features` y `limits`; el dispositivo tiene los límites básicos y ninguna característica opcional, salvo que se pidan con `requiredLimits` y `requiredFeatures`.
- Los encargos se graban en un `GPUCommandEncoder`, `finish()` los cierra y `queue.submit()` los envía sin esperar; `onSubmittedWorkDone()` avisa al terminar.
- Los errores son asíncronos y no lanzan: `pushErrorScope`/`popErrorScope`, el evento `uncapturederror` y etiquetas en todo; el primer error de una cascada es el que cuenta.
- WGSL: `f32 i32 u32 bool`, `vec3f`, `mat4x4f`, `const`/`let`/`var`, `fn`, `struct` y atributos (`@compute @vertex @fragment @group @binding @builtin @location @workgroup_size`); sin conversiones implícitas y con bucles siempre acotados.
- `device.destroy()` libera la GPU; `device.lost` avisa cuando el dispositivo deja de servir.

## Para profundizar

- [MDN: la API de WebGPU (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API)
- [WebGPU Fundamentals: lo básico (en inglés)](https://webgpufundamentals.org/webgpu/lessons/webgpu-fundamentals.html)
- [Chrome for Developers: visión general de WebGPU (en inglés)](https://developer.chrome.com/docs/web-platform/webgpu/overview)
- [Tour of WGSL: WGSL paso a paso, con ejemplos ejecutables (en inglés)](https://google.github.io/tour-of-wgsl/)
- [La especificación de WebGPU (en inglés)](https://www.w3.org/TR/webgpu/)
