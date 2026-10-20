# Ejemplos profesionales: WebAssembly

## Por qué importa

Las lecciones del módulo enseñan cada pieza con un módulo de unos pocos bytes y una llamada. Una herramienta real los usa durante horas, con datos que no ha visto nunca: archivos de varios megabytes que llegan a trozos, módulos escritos por otros, textos en cualquier idioma, usuarios que escriben código con errores o que pulsan dos veces seguidas. Esta página reúne once herramientas escritas como en un proyecto real con todo lo que has visto en el curso (HTML, CSS, el lenguaje JavaScript, el DOM y los eventos, los formularios, la red y los archivos, los workers) y este módulo: un ensamblador, un inspector de módulos, un anfitrión de plugins, un filtro con SIMD, un fractal en un worker…

Casi todas escriben sus módulos en **WAT**, el formato de texto, y los convierten en bytes en la propia página con una pequeña biblioteca de los `assets/`: `wasm/wat.js`, un ensamblador de un subconjunto de WAT construido sobre `wasm/emit.js` (el de las lecciones). Léela con «Assets»: no esconde nada que no hayas escrito ya a mano en la lección «WebAssembly a mano». Los plugins del ejemplo 4 son archivos `.wasm` de verdad, con su WAT al lado. Lee primero el bloque de comentarios del principio de cada script, que explica las decisiones de diseño.

## Qué tienen en común

- **Nada puede colgar la página.** WebAssembly no tiene guarda de bucles: todo bucle de estos módulos tiene un límite fijo o recorre una memoria de tamaño conocido. Y donde el código lo escribe alguien que no eres tú (el ensamblador y los plugins), las llamadas se ejecutan en un worker con un plazo: si vence, se termina el worker y se crea otro.
- **La frontera se cruza poco.** Los datos se copian (o se escriben con `encodeInto`) en la memoria una vez, una llamada recorre todo, y el resultado se lee con una vista. Ninguna herramienta llama al módulo por cada byte.
- **Las vistas se crean después de crecer.** Cuando una herramienta necesita más memoria, primero `grow` y después `new Uint8Array(memory.buffer, …)`; o la vista se crea justo antes de usarse.
- **Lo que calcula WebAssembly se comprueba.** Todas repiten el cálculo en JavaScript (o con una función del navegador, como `toBase64`) y comparan byte a byte o bit a bit, al cargar y en cada medida.
- **Las medidas son honestas.** Desde un botón, con la CPU despierta, calentamiento, rondas intercaladas y mediana, como en la lección «Medir antes de optimizar». Y se dicen tal como salen: aquí WebAssembly gana por mucho en dos casos (SIMD y enteros de 64 bits), y en otro se mide contra código nativo del navegador (base64), que es muy difícil de batir.
- **Accesibles.** Todo lo que se hace con el ratón se puede hacer con el teclado; los resultados se anuncian en regiones `role="status"` o `aria-live`; los lienzos tienen `role="img"` y una descripción que se actualiza.

## La biblioteca: `wat.js`

| Qué entiende | Ejemplo | Lección |
|---|---|---|
| campos `func`, `import`, `memory`, `global`, `export`, `start` y `data` | `(memory (export "memory") 1 256)` | «WebAssembly a mano» |
| nombres `$…` para funciones, locales, globales y etiquetas | `local.get $n`, `br $next` | «Qué es WebAssembly» |
| forma plana y forma anidada, con `(then …)` y `(else …)` | `(i32.add (local.get $a) (i32.const 1))` | «Qué es WebAssembly» |
| constantes en decimal y hexadecimal, enteros de 32 y 64 bits | `i32.const 0x811c9dc5`, `i64.const 0x2545F4914F6CDD1D` | «WebAssembly a mano» |
| `offset=` y `align=`, `memory.copy` y `memory.fill` | `i32.load8_u offset=1 (local.get $ptr)` | «La memoria lineal» |
| unas pocas instrucciones SIMD (`v128`) | `i8x16.add_sat_u` | este capítulo |
| la sección personalizada `name`, con los nombres de las funciones | — | «WebAssembly a mano» |

Los errores de sintaxis salen con su línea y su columna (`WatError: línea 5, columna 5: instrucción desconocida «i32.mull»`). Los de **tipos** no los busca: los encuentra el navegador al compilar, con la posición del byte. Antes de usarlo en estas páginas, sus bytes se compararon con los módulos de las lecciones: los 41 bytes de `add`, el `digitSum`, las globales con función de inicio y los 196 bytes de `checksum.wasm` salen idénticos.

## Un ensamblador de WAT

**Objetivo:** el taller del módulo: escribir WAT, ensamblarlo y llamarlo, sin herramientas instaladas. **Técnicas:** `wat.js` en la página; `WebAssembly.compile` para el veredicto de tipos; las secciones leídas con LEB128 y un volcado hexadecimal; las llamadas en un worker con un plazo de 1 s (un bucle sin salida escrito por error no congela la pestaña); argumentos con `n` para los `i64`; el cursor va al sitio del error; Tab inserta espacios (Escape y Tab salen del editor). **Fíjate en:** el error de tipos nombra la función, `#0:"total"`, gracias a la sección `name`.

[[exercise:01-ensamblador-wat.md]]

```text
«Dígito de control»
94 bytes · ¿válido? true · exporta digitSum (function)
secciones → tipos (6 B) · funciones (2 B) · exportaciones (12 B) · código (38 B) · personalizada «name» (18 B)
digitSum(20261020) → 13
Listo: elige otro ejemplo, edita el WAT y pulsa «Ensamblar», o llama a otra función
// Tras elegir «Factorial en i64»:
«Factorial en i64»
111 bytes · ¿válido? true · exporta factorial (function)
secciones → tipos (6 B) · funciones (2 B) · exportaciones (13 B) · código (53 B) · personalizada «name» (19 B)
factorial(20n) → 2432902008176640000n
// Tras elegir «Con un error de sintaxis» y después «Con un error de tipos»:
«Con un error de sintaxis»
❗ WatError: línea 5, columna 5: instrucción desconocida «i32.mull»
«Con un error de tipos»
❗ CompileError: WebAssembly.compile(): Compiling function #0:"total" failed: type error in fallthru[0] (expected f64, got i32) @+42
```

[[exercise:01-ensamblador-wat.md-(script.js)]]

## Un inspector de módulos

**Objetivo:** abrir cualquier `.wasm` y decir qué hay dentro, o por qué no es un módulo. **Técnicas:** un lector con cursor que no se fía del archivo (cada sección se lee dentro de sus límites y un corte se dice con su posición); los tipos, importaciones con su firma, funciones con el tamaño de su código, memoria, globales con su valor inicial, exportaciones, segmentos de datos y la sección `name`; un volcado comentado por secciones; firmas de otros formatos para reconocer lo que no es WebAssembly; selector, `<input type="file">` y arrastrar y soltar. **Fíjate en:** el veredicto final es del navegador (`WebAssembly.compile`), no del inspector.

[[exercise:02-inspector-de-wasm.md]]

```text
plugins/buen-fin.wasm → 169 bytes · ¿un módulo válido? true
secciones → tipos · importaciones · funciones · memoria · exportaciones · código · datos · personalizada «name»
importa → env.log (función (i32, i32) → ())
exporta → memory (memoria 0) · discount (función 1)
funciones → 0 $log (importada de env.log) · 1 $discount (26 bytes de código)
datos → 40 bytes en i32.const 0: «Buen Fin: 10 % de descuento desde $1,000»
Listo: elige otro archivo, abre uno tuyo o suéltalo en el recuadro
// Tras elegir «valley-of-mexico.jpg (no es un módulo)»:
valley-of-mexico.jpg → 31727 bytes · ¿un módulo válido? false
✗ firma ff d8 ff e0: no empieza por 00 61 73 6d (es un JPEG)
CompileError: WebAssembly.compile(): expected magic word 00 61 73 6d, found ff d8 ff e0 @+0
```

## La máquina de pila, paso a paso

**Objetivo:** ver lo que la lección «Qué es WebAssembly» dibujaba en una tabla, con un programa de verdad: el máximo común divisor de Euclides. **Técnicas:** un intérprete de JavaScript para el WAT plano del programa, que precalcula dónde termina cada bloque (`br` a un `block` sale; a un `loop`, repite); la pila, las locales y los bloques abiertos tras cada instrucción; «Atrás» recupera la copia del estado anterior; un límite de 5000 pasos; el mismo texto ensamblado con `wat.js` y comparado con el intérprete en 50 parejas de números; teclado (→, ← y Fin con el foco en la máquina). **Fíjate en:** el `br_if $done` cuando `$b` llega a 0, que salta detrás del `end` del bloque exterior.

[[exercise:03-maquina-de-pila-paso-a-paso.md]]

```text
¿el intérprete y el módulo de wat.js coinciden en 50 parejas? true
gcd(1071, 462): 17 instrucciones, 3 locales
Listo: pulsa «Paso ▶» (o → con el foco en la máquina) o «Hasta el final»
// Tras pulsar «Paso ▶» cinco veces (la explicación está en la página: «Paso 5: desapila 0: no salta») y después «Hasta el final»:
fin en el paso 42 · resultado 21 · ¿igual que el módulo de verdad? true
```

## Un anfitrión de plugins

**Objetivo:** ejecutar código que la tienda no ha escrito sin tener que creérselo. **Técnicas:** el *sandbox* en cuatro capas: **capacidades** (`WebAssembly.Module.imports` antes de instanciar; solo se concede `env.log`), **memoria propia** (cada plugin tiene la suya; `env.log` lee de ella, con tope), **tiempo** (las llamadas, en un worker con un plazo de 500 ms; el `Module` viaja al worker) y **resultados** (un entero entre 0 y el total; una trampa o un valor imposible se ignoran con un aviso); un tope del 30 % para los descuentos juntos; un plugin tuyo, desde un archivo. **Fíjate en:** `pide-red.wasm` es un módulo válido, pero pide `env.fetchJson` y no se llega a instanciar.

[[exercise:04-anfitrion-de-plugins.md]]

```text
anfitrión → concede env.log · plazo de 500 ms por llamada, en un worker
buen-fin.wasm → pide env.log · ✅ cargado
envio-gratis.wasm → no pide nada · ✅ cargado
pide-red.wasm → pide env.log, env.fetchJson · 🚫 env.fetchJson no se concede: no se instancia
se-rompe.wasm → no pide nada · ✅ cargado
Listo: total $1,250.00; pulsa «Aplicar descuentos»
// Tras pulsar «Aplicar descuentos»:
buen-fin.wasm · dice «Buen Fin: 10 % de descuento desde $1,000» → −$125.00
envio-gratis.wasm → −$99.00
⚠️ se-rompe.wasm: RuntimeError: divide by zero; se ignora → —
total → $1,250.00 − $224.00 = $1,026.00
```

[[exercise:04-anfitrion-de-plugins.md-(script.js)]]

Es el modelo de las extensiones de editores, de los filtros de algunos servidores y de las bases de datos que admiten funciones de usuario: WebAssembly como formato portátil y aislado para el código de otros. El plazo en un worker es la parte que no se puede omitir: un bucle sin fin en el hilo principal no se puede parar desde JavaScript.

## Monte Carlo con enteros de 64 bits

**Objetivo:** números aleatorios reproducibles para una simulación, y un caso honesto donde WebAssembly gana por mucho. **Técnicas:** el generador xorshift64* con un estado `i64` en una global; los 53 bits altos por 2⁻⁵³ para un `f64` de [0, 1), exacto, así que el mismo generador con `BigInt` produce los mismos puntos y la misma estimación de π; un límite de 10 millones de puntos; la medida, desde un botón. **Fíjate en:** con `BigInt`, cada operación crea un número nuevo y hay que recortarlo con `& MASK`; con `i64`, cada operación es una instrucción de la CPU.

[[exercise:05-monte-carlo-con-i64.md]]

```text
semilla 2026 → f541ccc087fc7fd0 7003112028c18076 ea4436571aa828a5 7b844e7e014434bc
¿la misma secuencia con BigInt? true
10 000 puntos → π ≈ 3.1172 · ¿el mismo resultado con BigInt? true
Listo: pulsa «Estimar π» o «Comparar con BigInt»
// Tras pulsar «Estimar π» (1 000 000 de puntos):
semilla 2026 · 1,000,000 puntos → π ≈ 3.140912
// Tras pulsar «Comparar con BigInt»:
200,000 puntos, semilla 2026 → ¿el mismo π en los dos? true (3.14542)
// Los tiempos cambian en cada ejecución; en el M1 del curso:
BigInt: ≈ 28.5 ms · WebAssembly i64: ≈ 1.90 ms · ≈ 15 veces más rápido
```

## Brillo con SIMD

**Objetivo:** el otro caso en que WebAssembly gana de verdad: una instrucción para 16 bytes. **Técnicas:** el brillo como suma saturada (`i8x16.add_sat_u` y `i8x16.sub_sat_u`) de un vector `[k, k, k, 0]` por píxel que no toca el alfa; la misma operación byte a byte en WebAssembly (con dos `select` para recortar) y en JavaScript (con `Uint8ClampedArray`, que recorta solo); los tres comparados byte a byte; el deslizador aplica la versión SIMD como mucho una vez por fotograma; la medida, con 8 copias de la imagen (5 MB) y solo el filtro cronometrado. **Fíjate en:** que el navegador valide el módulo ya responde a «¿hay SIMD?».

[[exercise:06-brillo-con-simd.md]]

```text
SIMD disponible → true · imagen de 633600 bytes · 78 páginas
brillo +40 → ¿los mismos 633600 bytes en las tres versiones? true · alfa del primer píxel: 255
brillo -40 → ¿los mismos 633600 bytes en las tres versiones? true · alfa del primer píxel: 255
Listo: mueve el deslizador o pulsa «Medir»
// Tras llevar el deslizador a +30 y soltarlo:
brillo 30 → aplicado con SIMD
// Tras pulsar «Medir»:
5068800 bytes por medida · 9 rondas intercaladas (2 de calentamiento)
// Los tiempos cambian en cada ejecución; en el M1 del curso:
JavaScript: mediana ≈ 4.00 ms
WebAssembly byte a byte: mediana ≈ 2.00 ms
WebAssembly SIMD: mediana ≈ 0.15 ms
SIMD frente a byte a byte: ≈ 13 veces más rápido
```

El JavaScript pierde aquí también contra el WebAssembly byte a byte, y no por lentitud del JIT: `Uint8ClampedArray` tiene que recortar cada escritura, y el bucle de WebAssembly hace exactamente las tres operaciones que necesita. El salto grande es el de SIMD, que JavaScript no puede expresar.

## Mandelbrot en un worker

**Objetivo:** un cálculo pesado fuera del hilo principal, con el módulo compilado una sola vez. **Técnicas:** el WAT ensamblado y compilado en la página; el `Module` enviado al worker, que lo instancia y escribe 480 × 320 píxeles en su memoria (paleta de 256 colores en los primeros 1024 bytes); la copia de los píxeles vuelve **transferida** (lección «Transferibles»); cada petición lleva un número y las respuestas de vistas viejas se descartan; clic para acercar en un punto, flechas para moverse, + y −; las iteraciones de 6 puntos comprobadas contra JavaScript. **Fíjate en:** la página nunca se bloquea: mientras el worker calcula, los botones siguen respondiendo.

[[exercise:07-mandelbrot-en-un-worker.md]]

```text
módulo → 325 bytes, compilado una vez: una instancia en la página y otra en el worker
¿mismas iteraciones que en JavaScript en 6 puntos? true · (-0.5, 0) → 200 · (0.4, 0.4) → 9 · (-0.75, 0.1) → 33 · (-1.25, 0) → 200 · (1, 1) → 2 · (-0.1, 0.65) → 75
Listo: haz clic en la imagen para acercar, o usa los botones y el teclado
imagen 480 × 320 → centro (-0.600000, 0.000000) · 160 píxeles por unidad
// Tras pulsar «Acercar»:
imagen 480 × 320 → centro (-0.600000, 0.000000) · 320 píxeles por unidad
```

Debajo del lienzo, la página dice cuánto tardó cada imagen en el worker: en el M1 del curso, unos 60-80 ms (≈) para la vista inicial y unos 200 ms tras «Acercar». Las vistas con más zona negra tardan más, porque los puntos del conjunto agotan sus 200 iteraciones.

## Base64 en WebAssembly

**Objetivo:** un códec completo, con validación, y la medida que pone a WebAssembly en su sitio. **Técnicas:** el alfabeto y la tabla inversa (con un valor para «=» y otro para lo que no es base64) en segmentos de datos; 3 bytes → 4 letras con relleno; decodificación estricta que devuelve -1; la memoria justa para entrada y salida; el texto con `encodeInto` y `TextDecoder`; las 41 longitudes de 0 a 40 bytes comparadas, de ida y de vuelta, con `toBase64` y `fromBase64` del navegador. **Fíjate en:** `Uint8Array.prototype.toBase64` está escrito en C++ dentro de Chrome: cuando el navegador ya trae una función, lo normal es que gane, y la medida lo dice.

[[exercise:08-base64-en-wasm.md]]

```text
módulo → 931 bytes · toBase64 del navegador: sí
«¡Hola, Oaxaca! Mole negro y tlayudas 🌮» → wqFIb2xhLCBPYXhhY2EhIE1vbGUgbmVncm8geSB0bGF5dWRhcyDwn4yu
«Q2Fmw6kgZGUgb2xsYQ==» → «Café de olla»
¿igual que el navegador en las 41 longitudes de 0 a 40 bytes, de ida y de vuelta? true
decode estricto → «Zm9v» válido · «Zm9» no válido · «Zm=v» no válido · «Zm9v!!!!» no válido
Listo: escribe un texto, pega un base64 o pulsa «Medir»
// Tras pulsar «Medir»:
1 MiB → 1398104 letras · ¿el mismo base64? true
// Los tiempos cambian en cada ejecución; en el M1 del curso:
WebAssembly: mediana ≈ 0.8 ms
toBase64 del navegador: mediana ≈ 0.15 ms
```

## Un catálogo ordenado en la memoria

**Objetivo:** una estructura de datos de verdad dentro de la memoria lineal. **Técnicas:** un índice de entradas de 16 bytes (SKU, puntero y longitud del nombre, precio) ordenado por SKU, con búsqueda binaria e inserción que abre hueco con `memory.copy`; los nombres en UTF-8 en otra zona, con un asignador de avance que hace crecer la memoria si hace falta; 500 artesanías insertadas en orden revuelto y comprobadas contra un `Map`; buscar, añadir y recorrer por páginas. **Fíjate en:** el módulo no sabe que guarda textos; solo guarda punteros y longitudes, y JavaScript los convierte.

[[exercise:09-catalogo-ordenado.md]]

```text
500 productos · índice de 8000 bytes · nombres: 15152 bytes desde 65536
¿el índice está ordenado por SKU? true · ¿las 500 búsquedas coinciden con un Map? true
buscar 163352 → 163352: Árbol de la vida de Metepec n.º 1, $435.68 (posición 40)
Listo: busca un SKU (Intro para anotarlo), añade una artesanía o recorre el índice
// Tras pulsar «Añadir» con los valores de muestra, y otra vez:
añadido 100001 «Catrina de barro, Capula» en la posición 1 · ahora hay 501
❗ el SKU 100001 ya existe
```

## Un verificador de archivos

**Objetivo:** comprobar que un archivo es el que dice ser, sin cargarlo entero en memoria. **Técnicas:** CRC-32 con tabla (la de ZIP, PNG y zlib), calculada por la función de inicio del módulo; el valor de prueba del estándar (`cbf43926`); los trozos del stream de `fetch` o de `file.stream()` por una ventana de 64 KiB; barra de progreso y «Cancelar» entre trozo y trozo; un manifiesto de sumas publicadas, con una equivocada a propósito. **Fíjate en:** CRC-32 detecta errores, no ataques; para eso está SHA-256 (`crypto.subtle`, módulo «Datos binarios»).

[[exercise:10-crc32-de-archivos.md]]

```text
crc32('123456789') → cbf43926 · ¿el valor de prueba del estándar? true
valley-of-mexico.jpg → 31727 bytes · crc32 9abf28e7 · ✅ coincide con el manifiesto
wasm/checksum.wasm → 196 bytes · crc32 1b89e349 · ✅ coincide con el manifiesto
plugins/buen-fin.wasm → 169 bytes · crc32 1ca8cc78 · ✅ coincide con el manifiesto
plugins/envio-gratis.wasm → 74 bytes · crc32 6d019a28 · ❌ el manifiesto dice 6d0f9a28
Listo: elige un archivo tuyo (y, si quieres, su CRC-32 esperado)
// Tras elegir un archivo (los valores son los de tu archivo; la velocidad, ≈, solo en la página):
fotos-del-viaje.zip → 1834752 bytes · crc32 5e1c09a3
```

## Un contador de texto

**Objetivo:** `wc` en el navegador: bytes, caracteres, palabras y líneas de cualquier texto. **Técnicas:** un solo recorrido de los bytes UTF-8 (los caracteres empiezan en los bytes que no son de continuación); los resultados en tres globales exportadas; la memoria que crece con el texto (3 bytes por unidad UTF-16 en el peor caso) y la vista creada después; el poema «Lo fatal» de Rubén Darío, lo que escribas o un archivo; todo comparado con JavaScript. **Fíjate en:** 555 caracteres son 563 bytes, por las tildes, la «ñ» y los signos de apertura del español.

[[exercise:11-contador-de-palabras.md]]

```text
«Lo fatal» → 563 bytes · 555 caracteres · 109 palabras · 15 líneas · ¿igual que en JavaScript? true
memoria → 1 página
Listo: edita el texto (sal del campo para anotarlo), elige un archivo o pulsa «Probar con 2 MB»
// Tras pulsar «Probar con 2 MB»:
el poema, repetido hasta pasar de 2 MB → 2029052 bytes · 2000220 caracteres · 392836 palabras · 54060 líneas · ¿igual que en JavaScript? true
memoria → 92 páginas
```

## Para seguir

Todo lo de esta página corre en un solo hilo de WebAssembly, con módulos de unos cientos de bytes escritos a mano. Los programas reales los genera un compilador desde C, C++ o Rust, con memorias de cientos de megabytes, hilos que comparten memoria (y exigen las cabeceras COOP y COEP) y miles de funciones. El módulo «WebGPU», el último del curso, lleva el cálculo a la tarjeta gráfica, con búferes que se llenan desde los mismos typed arrays; y su última lección, «Mapa del siguiente paso», recoge qué estudiar después: las cadenas de compilación a WebAssembly (Emscripten, Rust y `wasm-bindgen`), WebGPU sin WebGL y los libros y recursos para seguir.

## Para profundizar

- [WebAssembly: la especificación del formato de texto (en inglés)](https://webassembly.github.io/spec/core/text/index.html)
- [V8: WebAssembly SIMD (en inglés)](https://v8.dev/features/simd)
- [MDN: WebAssembly.Module.imports (en inglés)](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/Module/imports_static)
- [Sebastiano Vigna: generadores xorshift (en inglés)](https://prng.di.unimi.it/)
- [Wikipedia: Comprobación de redundancia cíclica](https://es.wikipedia.org/wiki/Verificaci%C3%B3n_de_redundancia_c%C3%ADclica)
