# JavaScript y WebAssembly juntos

## Por qué importa

En un proyecto real, nadie escribe los bytes de un módulo: un compilador convierte C, C++, Rust, Go o AssemblyScript en un `.wasm`, y genera además un archivo de JavaScript, el **código de pegamento**, que lo descarga, le da sus importaciones, convierte los textos y los arrays y expone funciones cómodas para la página. Esta lección es ese pegamento, escrito a mano: importar funciones y variables de JavaScript, cargar un `.wasm` de la red, compilarlo una vez y usarlo en un worker, y las reglas de la frontera: qué cuesta cruzarla, qué pasa con los errores y con los tipos.

También es la lección de la medida honesta. La lección «Qué es WebAssembly» desmontó el mito de que WebAssembly siempre es más rápido con un ejemplo del DOM, y el módulo «Rendimiento» decía que WebAssembly haría «ese cálculo más rápido». Aquí se comprueba con un cálculo puro, con las reglas de «Medir antes de optimizar», y el resultado se cuenta tal como sale.

Los módulos de los ejemplos se construyen con `wasm/emit.js`, como en la lección anterior, salvo uno que ya viene compilado en los `assets/`: `wasm/checksum.wasm`, con su formato de texto al lado en `checksum.wat.txt`. Léelos con el botón «Assets».

## Importar funciones y globales

Además de funciones y memorias, un módulo puede importar **variables globales**. Una global creada en JavaScript con `new WebAssembly.Global({ value: 'f64', mutable: true }, 0.16)` es un valor compartido: el módulo la lee con `global.get` en cada llamada, y JavaScript la cambia con `.value`. Las funciones importadas reciben los argumentos como `number` (o `BigInt`, si son `i64`) y lo que devuelven se convierte al tipo de su firma:

[[exercise:01-importar-funciones-y-globales.md-]]

```text
importa → env.showLine (function), env.taxRate (global)
showLine: 100.00 → 116.00 MXN (IVA 16 %)
checkout(10000) → 11600.00
showLine: 100.00 → 108.00 MXN (IVA 8 %)
checkout(10000) → 10800.00
🐛 taxRate: 0.16 → LinkError: WebAssembly.instantiate(): Import #1 "env" "taxRate": imported mutable global must be a WebAssembly.Global object
```

Fíjate en los índices: el módulo importa una función, así que su primera función propia, `checkout`, es la número 1. Las importaciones van siempre primero en la numeración. Y fíjate en el `LinkError`: es el error de **enlazar** el módulo con sus importaciones, que ocurre al instanciar. Lo verás también si falta una función (`Import #0 "env" "log": function import requires a callable`), y si falta el objeto de importaciones entero, un `TypeError` (`Imports argument must be present and must be an object`).

Queda un tipo de importación, la **tabla** (`WebAssembly.Table`): una lista de funciones a las que el módulo llama por su posición, con `call_indirect`. Es lo que usan los compiladores para los punteros a funciones de C y los métodos virtuales de C++; en este módulo no hace falta.

## Cargar un `.wasm`: `instantiateStreaming`

Un `.wasm` de verdad se descarga, como una imagen o un script. La forma correcta es **`WebAssembly.instantiateStreaming(fetch(url), importaciones)`**: recibe la respuesta (o la promesa de `fetch`) y **compila mientras los bytes llegan**, función a función, en paralelo con la descarga. Para un módulo de varios megabytes, cuando termina la descarga casi ha terminado la compilación. Y Chrome guarda en su caché el código máquina de los módulos grandes que carga así, para la siguiente visita.

[[exercise:02-instantiatestreaming.md-]]

```text
Content-Type → application/wasm
exporta → memory (memory), fnv1a (function), adler32 (function)
fnv1a → a7386607 | adler32 → 90ab0a9b
fnv1a sin >>> 0 → -1489476089
¿igual que en JavaScript? → true
```

El módulo exporta su memoria y dos sumas de comprobación: **FNV-1a**, el hash de la lección «Bits y bytes», y **Adler-32**, la de zlib. Las dos devuelven un `i32`, que llega a JavaScript **con signo**: para leerlo como un número de 32 bits sin signo, `>>> 0`, como entonces. Y la versión de JavaScript da el mismo resultado: es la forma profesional de probar un módulo, una referencia lenta y clara contra la versión rápida.

### 🐛 El tipo MIME y el 404

`instantiateStreaming` es exigente con la respuesta: tiene que ser un **200** y traer la cabecera **`Content-Type: application/wasm`**. Muchos servidores mal configurados envían los `.wasm` como `application/octet-stream`, y el módulo deja de cargar aunque los bytes sean perfectos. Los `assets/` de esta lección tienen el mismo módulo con dos extensiones, `.wasm` y `.bin`, para verlo:

[[exercise:03-tipo-mime-y-404.md-]]

```text
✅ wasm/checksum.wasm → exporta memory, fnv1a, adler32
🐛 wasm/checksum.bin → TypeError: Failed to execute 'compile' on 'WebAssembly': Incorrect response MIME type. Expected 'application/wasm'.
🐛 wasm/no-existe.wasm → TypeError: Failed to execute 'compile' on 'WebAssembly': HTTP status code is not ok
✅ checksum.bin con arrayBuffer() → exporta memory, fnv1a, adler32
✅ un 404 con un mensaje claro → Error: wasm/no-existe.wasm: HTTP 404
```

Fíjate en que los dos mensajes hablan de `'compile'`, aunque la función llamada fuera `instantiateStreaming`, y en que el del 404 no dice qué archivo faltaba. La función `loadWasm` del ejemplo hace las dos cosas bien: comprueba `response.ok` con un mensaje propio y, si el servidor no anuncia `application/wasm`, cae a `arrayBuffer()` + `instantiate`, que funciona con cualquier tipo (pero ya no compila durante la descarga). La solución de verdad está en el servidor: los `.wasm`, como `application/wasm`.

## Compilar una vez

Si una página necesita varias instancias del mismo módulo (una por documento abierto, una por worker), no hay que descargarlo y compilarlo cada vez. **`WebAssembly.compileStreaming(fetch(url))`** devuelve el `Module`, y `WebAssembly.instantiate(module, importaciones)` crea instancias de él, cada una con su propia memoria. Y un `Module` se puede **enviar a un worker** con `postMessage`: el worker lo instancia sin volver a descargarlo ni compilarlo.

[[exercise:04-compilar-una-vez-y-workers.md-]]

```text
compileStreaming → 3 exportaciones
¿las dos instancias comparten memoria? → false
🐛 postMessage(instance) → DataCloneError
worker: ¿recibió un Module? → true
worker: fnv1a → a7386607 · ¿igual que en la página? → true
```

Es el esquema de las aplicaciones que procesan imágenes o vídeo con WebAssembly: el módulo se compila una vez en la página, cada worker recibe una copia del `Module` y trabaja con su propia instancia y su propia memoria, y los datos van y vienen como búferes transferidos (lección «Transferibles»). Una `Instance`, en cambio, no se puede enviar: tiene estado. Que varios workers trabajen sobre **la misma** memoria es otra cosa: exige una memoria compartida y, por tanto, una página aislada con COOP y COEP (lección «Memoria compartida» y la lección anterior).

## El coste de cruzar la frontera

Llamar a una función de WebAssembly desde JavaScript, o al revés, no es gratis: hay que convertir los argumentos y el resultado, y cambiar de un mundo al otro. Son nanosegundos, y para una llamada que hace mucho trabajo no importan. El problema aparece cuando se cruza **por cada elemento**.

### 🐛 Llamadas charlatanas

El ejemplo suma el precio con IVA de 500 000 productos de cuatro formas: JavaScript llamando a WebAssembly por cada precio, WebAssembly llamando a JavaScript por cada precio (para pedirlo), una sola llamada con los precios ya en la memoria, y JavaScript solo:

[[exercise:05-llamadas-charlatanas.md]]

```text
Listo: 500000 precios en la memoria; pulsa «Medir» (unos 200 ms de trabajo)
// Tras pulsar «Medir»:
total → 3474700.00 MXN · ¿mismo resultado en las cuatro? true
llamadas que cruzan la frontera, por medida → 500000 · 500001 · 1 · 0
// Los tiempos cambian en cada ejecución; en el M1 del curso:
🐛 JavaScript llama a WebAssembly por cada precio: mediana ≈ 2.0 ms
🐛 WebAssembly llama a JavaScript por cada precio: mediana ≈ 3.0 ms
✅ una llamada, con los precios en la memoria: mediana ≈ 0.4 ms
JavaScript solo: mediana ≈ 0.5 ms
```

[[exercise:05-llamadas-charlatanas.md-(script.js)]]

Las dos versiones charlatanas hacen la misma aritmética que las otras dos, y tardan varias veces más: casi todo su tiempo es cruzar. La versión de una sola llamada no cruza más que una vez y recorre la memoria a toda velocidad; JavaScript solo tampoco cruza nada. La regla para diseñar la frontera: **los datos en la memoria y una llamada por lote**, no una por elemento. Es lo que hacen las bibliotecas bien diseñadas: `procesarImagen(ptr, ancho, alto)`, no `procesarPíxel(x, y)`.

> **Desde Python:** es la misma regla que con numpy. `precios * 1.16` sobre un array entero entra en C una vez y recorre los datos allí; un bucle de Python con `precios[i] * 1.16` cruza la frontera entre Python y C en cada elemento y va decenas de veces más lento.

## Una comparación honesta

Ahora, el caso más favorable a WebAssembly: un cálculo puro, sin DOM y sin cruces, sobre 4 MiB de datos que ya están en su memoria. El mismo algoritmo, FNV-1a, en JavaScript y en el `checksum.wasm` de los ejemplos anteriores, con las reglas de la lección «Medir antes de optimizar»: la CPU despierta, calentamiento, medidas intercaladas, mediana y el resultado consumido (y comparado). La primera llamada de cada versión se mide aparte, y también lo que costaría copiar los datos a la memoria si vinieran de JavaScript:

[[exercise:06-benchmark-honesto.md]]

```text
Listo: pulsa «Medir» (unos 250 ms de trabajo la primera vez)
// Tras pulsar «Medir»:
datos → 4194304 bytes · fnv1a → d2dfec65 · ¿mismo resultado en JavaScript y en WebAssembly? true
// Los tiempos cambian en cada ejecución; en el M1 del curso:
1.ª llamada (en frío): JavaScript ≈ 6.0 ms · WebAssembly ≈ 9.0 ms
JavaScript: mediana ≈ 5.3 ms
WebAssembly: mediana ≈ 5.3 ms
copiar 4 MiB a la memoria con set(): mediana ≈ 0.1 ms
// Tras pulsar otra vez: las mismas líneas, sin la de la 1.ª llamada.
```

[[exercise:06-benchmark-honesto.md-(script.js)]]

El resultado no es el del mito: **en caliente, las dos versiones tardan casi lo mismo**. Para un bucle de enteros sobre un typed array, TurboFan genera un código máquina muy parecido al que genera para WebAssembly; a veces gana uno, a veces el otro, por poco. Las dos versiones tienen además su propio calentamiento: JavaScript empieza interpretando, y WebAssembly empieza con el código de Liftoff, que es rápido de generar pero más lento de ejecutar, hasta que TurboFan lo recompila.

¿Dónde está entonces la ventaja de WebAssembly? En lo que JavaScript no puede expresar: instrucciones **SIMD**, que procesan 16 bytes a la vez en los cálculos que se pueden repartir así (filtros de imagen y de audio, compresión; FNV-1a no, porque cada paso necesita el resultado del anterior); enteros de **64 bits** de verdad, sin `BigInt`; memoria con la disposición exacta que elige el programador; un rendimiento **predecible**, sin desoptimizaciones si los tipos cambian; y, sobre todo, el código que **ya existe** en C, C++ o Rust, probado durante años, que no hay que reescribir. Y la copia también cuenta: si los datos nacen en JavaScript, traerlos a la memoria cuesta, aunque aquí sea poco frente al cálculo.

## Errores en la frontera

Las excepciones atraviesan la frontera en los dos sentidos, como si fuera una sola pila de llamadas. Si una función importada de JavaScript lanza, la excepción sale por la función de WebAssembly que la llamó, **intacta** (el mismo objeto), y esa función se queda a medias. Si WebAssembly atrapa dentro de una llamada que hizo JavaScript, el `RuntimeError` sube por todas las capas hasta el primer `try/catch`:

[[exercise:07-errores-que-cruzan.md-]]

```text
book(12) → 1
book(120) → RangeError: el asiento 120 no existe
¿un RuntimeError? → false | ¿la pila pasa por WebAssembly? → true
reservas → 1
book(0) → RuntimeError: unreachable · ¿RuntimeError? true
book(14) → 2 | reservas → 2
```

La línea «reservas → 1» es la consecuencia importante: la excepción cortó `book` después de `call $reserve` y antes de sumar la reserva. Una excepción que atraviesa un módulo puede dejarlo a medias (un `malloc` sin su `free`, un cerrojo cerrado), salvo que el módulo se haya compilado para capturarla; por eso el código de pegamento suele capturar los errores dentro de las importaciones en lugar de dejarlos cruzar. En la pila del error (`error.stack`), las funciones de WebAssembly aparecen como `wasm://wasm/…:wasm-function[1]:0x…`: el índice de la función y la posición del byte, la misma que en los mensajes de compilación. DevTools muestra además el código de esas funciones como WAT, y con los mapas de código fuente de un compilador, el C o el Rust original.

### 🐛 Una importación con la firma equivocada

La validación de la lección «Qué es WebAssembly» comprueba los tipos **dentro** del módulo, pero no puede comprobar una función de JavaScript: el módulo solo sabe la firma que declaró. Así que la llama con esos argumentos y **convierte** lo que devuelve, sin ningún error:

[[exercise:08-importacion-con-firma-equivocada.md-]]

```text
✅ (cents) => cents - 500 → finalPrice(2500) = 2000
🐛 devuelve '1950 pesos' → finalPrice(2500) = 0
🐛 devuelve 1950.75 → finalPrice(2500) = 1950
🐛 olvida el return → finalPrice(2500) = 0
🐛 espera (cents, percent) → finalPrice(2500) = 0
🐛 devuelve 1950n → TypeError: Cannot convert a BigInt value to a number
✅ con comprobación → TypeError: discount debe devolver un entero, no "1950 pesos"
```

Son las conversiones de siempre (`ToInt32`: un texto que no es un número, `undefined` y `NaN` se vuelven 0; un decimal se trunca) aplicadas en silencio. El parámetro `percent` nunca llega, así que vale `undefined` y la cuenta da `NaN`, que también se convierte en 0. Solo un `BigInt` lanza. La solución está en el lado de JavaScript: comprobar lo que devuelve la importación (con un envoltorio como `checked`) o escribir el objeto de importaciones en TypeScript, con los tipos de la firma.

### 🐛 `i64` en las importaciones

La regla de la lección «WebAssembly a mano» vale también hacia fuera: si la firma de una importación lleva `i64`, la función de JavaScript **recibe** un `BigInt` y tiene que **devolver** un `BigInt`. Con los instantes en milisegundos, el error es fácil de cometer, porque `Date.UTC()` y `Date.now()` devuelven `number`:

[[exercise:09-i64-en-las-importaciones.md-]]

```text
🐛 now devuelve un number → stamp() → TypeError: Cannot convert 1792513800000 to a BigInt
✅ now devuelve BigInt → stamp() → 1792513800000n
🐛 audit recibe un BigInt → stampAndAudit() → TypeError: Cannot convert a BigInt value to a number
audit: bigint 2026-10-20T16:30:00.000Z
✅ stampAndAudit() → undefined
```

El primer error aparece al llamar a `stamp()`, no al instanciar: el `TypeError` lo lanza la conversión del valor que devolvió `now`. El segundo lo lanza `new Date()` dentro de `audit`, al recibir un `BigInt`. La solución es convertir en la propia importación: `BigInt(…)` al devolver y `Number(…)` al recibir.

### 🐛 Usar la instancia antes de tiempo

Toda la API de WebAssembly es asíncrona, y `instantiate` tiene dos formas que devuelven cosas distintas (lección «Qué es WebAssembly»). Las tres maneras clásicas de quedarse sin instancia:

[[exercise:10-instantiate-sin-await.md-]]

```text
¿es una promesa? → true
🐛 sin await → TypeError: Cannot read properties of undefined (reading 'exports')
🐛 { instance } de instantiate(module) → undefined
✅ desde bytes → 5 | ✅ desde un Module → 5
🐛 antes de que termine → TypeError: Cannot read properties of null (reading 'add')
… y cuando la promesa se cumple → add(1, 1) = 2
```

La tercera es la más frecuente en una página real: un botón cuyo manejador usa las exportaciones, registrado al cargar, que alguien pulsa antes de que el módulo termine de compilarse. La solución es el orden: primero el `await`, después registrar los manejadores o habilitar los botones.

## Lo que viene

El estándar sigue creciendo, y Chrome ya tiene dos piezas que cambian la forma de escribir el pegamento:

**Excepciones de WebAssembly.** Un módulo puede lanzar y capturar sus propias excepciones (las de C++ o Rust) con las instrucciones `throw` y `try_table`. Desde JavaScript, `new WebAssembly.Tag({ parameters: ['i32'] })` describe un tipo de excepción y los valores que lleva, y `new WebAssembly.Exception(tag, [42])` crea una (con `exception.is(tag)` y `exception.getArg(tag, 0)` para leerla). `WebAssembly.JSTag` permite capturar dentro de WebAssembly los errores lanzados por JavaScript. Hasta su llegada, los compiladores tenían que simular las excepciones con llamadas a JavaScript, mucho más lentas.

**JSPI** (*JavaScript Promise Integration*). El código de C o Rust es síncrono, y las APIs de la web son asíncronas (`fetch`, leer un archivo): ¿cómo llama una función de C a `fetch` y espera la respuesta? Con `new WebAssembly.Suspending(funciónAsíncrona)` se importa una función que devuelve una promesa, y con `WebAssembly.promising(exportación)` se exporta una función que devuelve una promesa. Cuando el módulo llama a la importación, su pila entera se **suspende** hasta que la promesa se cumple, y JavaScript sigue libre mientras tanto. Así, código escrito para leer archivos «de una vez» funciona en la web sin reescribirlo.

## Las herramientas de verdad

Todo lo de este módulo lo hacen por ti las cadenas de compilación. Las más usadas:

| Lenguaje | Herramienta | Qué genera |
|---|---|---|
| C y C++ | Emscripten (basado en clang) | el `.wasm` y un `.js` de pegamento que imita un sistema operativo (archivos, consola, hilos) |
| Rust | `wasm-bindgen` y `wasm-pack` | el `.wasm` y un módulo de JavaScript (y sus tipos de TypeScript) con funciones que aceptan strings y objetos |
| AssemblyScript | su propio compilador | un lenguaje con la sintaxis de TypeScript que compila directamente a WebAssembly |
| Go, Kotlin, Dart, Java | sus compiladores | WebAssembly con recolector de basura (WasmGC) o con el suyo propio dentro del módulo |

Qué estudiar después, con cuál empezar y dónde seguir aprendiendo está en la última lección del curso, «Mapa del siguiente paso», al final del módulo «WebGPU».

## Bestiario

- **`TypeError: Failed to execute 'compile' on 'WebAssembly': Incorrect response MIME type. Expected 'application/wasm'.`**
  Síntoma: `instantiateStreaming` falla con un `.wasm` que funciona con `arrayBuffer()`; o, con un 404, `HTTP status code is not ok` sin decir qué archivo.
  Causa: el servidor no envía la cabecera `Content-Type: application/wasm`, o la respuesta no es un 200.
  Solución: configura el servidor para los `.wasm`; en el cliente, comprueba `response.ok` y cae a `arrayBuffer()` + `instantiate` si el tipo no es el correcto.
  → [ver ejemplo](03-tipo-mime-y-404.md)
- **WebAssembly «no es más rápido» porque cruza demasiado.**
  Síntoma: una función de WebAssembly llamada (o que llama a JavaScript) por cada elemento hace que el total sea varias veces más lento que en JavaScript.
  Causa: cada cruce de la frontera cuesta, y millones de cruces cuestan milisegundos.
  Solución: los datos en la memoria y una llamada por lote: `procesar(ptr, n)`, no `procesar(elemento)`.
  → [ver ejemplo](05-llamadas-charlatanas.md)
- **Una importación devuelve un texto o un decimal y el módulo recibe 0 o un número truncado.**
  Síntoma: resultados absurdos (0, decimales perdidos) sin ningún error; solo un `BigInt` lanza.
  Causa: WebAssembly no comprueba las funciones de JavaScript: las llama según su firma y convierte el resultado con `ToInt32`/`ToNumber`.
  Solución: valida en la importación lo que devuelve (o tipa el objeto de importaciones con TypeScript).
  → [ver ejemplo](08-importacion-con-firma-equivocada.md)
- **`TypeError: Cannot convert 1792513800000 to a BigInt` al llamar a una exportación.**
  Síntoma: una función de WebAssembly falla al llamar a una importación con `i64`, o la importación falla al usar lo que recibe.
  Causa: las importaciones con `i64` reciben y deben devolver `BigInt`.
  Solución: `BigInt(…)` al devolver y `Number(…)` al recibir, dentro de la importación.
  → [ver ejemplo](09-i64-en-las-importaciones.md)
- **`TypeError: Cannot read properties of undefined (reading 'exports')`.**
  Síntoma: `instance` es `undefined`, o las exportaciones no existen todavía cuando se usan.
  Causa: falta un `await`; `instantiate(module)` devuelve la `Instance` sin `{ }`; o un manejador se ejecuta antes de que termine la compilación.
  Solución: `await` siempre, la forma correcta de cada `instantiate`, y activar lo que usa el módulo después de tenerlo.
  → [ver ejemplo](10-instantiate-sin-await.md)

## Resumen

- Un módulo importa funciones, memorias, tablas y globales; una global mutable importada es un `WebAssembly.Global` compartido; fallar al enlazar es un `LinkError`.
- `instantiateStreaming(fetch(url), importaciones)` compila mientras descarga; exige un 200 y `Content-Type: application/wasm`.
- `compileStreaming` + `instantiate(module)` compila una vez para muchas instancias; un `Module` se envía a un worker, una `Instance` no.
- Cruzar la frontera cuesta: datos en la memoria y una llamada por lote.
- En un cálculo puro y caliente, JavaScript y WebAssembly suelen empatar; WebAssembly gana con SIMD, 64 bits, predictibilidad y código que ya existe.
- Las excepciones cruzan la frontera intactas en los dos sentidos y pueden dejar una función a medias.
- La frontera no comprueba las funciones de JavaScript: convierte en silencio; los `i64` son `BigInt` también en las importaciones.
- `await` siempre: `instantiate(bytes)` da `{ module, instance }`; `instantiate(module)`, la `Instance`.

## Para profundizar

- [MDN: Usar la API de JavaScript de WebAssembly (en inglés)](https://developer.mozilla.org/en-US/docs/WebAssembly/Using_the_JavaScript_API)
- [MDN: WebAssembly.instantiateStreaming (en inglés)](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/instantiateStreaming_static)
- [V8: Introducción a JSPI (en inglés)](https://v8.dev/blog/jspi)
- [Emscripten: documentación (en inglés)](https://emscripten.org/docs/getting_started/index.html)
- [MDN: Compilar de Rust a WebAssembly (en inglés)](https://developer.mozilla.org/en-US/docs/WebAssembly/Rust_to_Wasm)
