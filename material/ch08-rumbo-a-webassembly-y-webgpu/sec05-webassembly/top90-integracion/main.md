# Integración: WebAssembly

## Por qué importa

Las cuatro lecciones del módulo enseñan las piezas por separado: qué es un módulo y cómo se valida, sus bytes uno a uno, la memoria lineal y la frontera con JavaScript. Un programa real las necesita todas a la vez. Un filtro de imagen son bytes de un canvas copiados a una memoria que tiene que crecer; una calculadora que compila es un analizador que genera instrucciones de una máquina de pila; una suma de comprobación de un archivo grande son trozos de un stream que pasan por una ventana fija de la memoria, con el estado guardado en globales.

Los ejemplos de esta página combinan dos, tres o cuatro lecciones cada uno, y casi todos combinan también algo de los capítulos anteriores: canvas e `ImageData`, formularios, streams de `fetch` y de `File`, `Intl`, animación con `requestAnimationFrame`. Todos construyen sus módulos con `assets/wasm/emit.js`, el archivo de la lección «La memoria lineal», y cada uno enseña en un comentario el WAT de lo que construye. Todos sus bucles de WebAssembly terminan: recorren una memoria de tamaño conocido o tienen un número fijo de vueltas.

## Las decisiones que se repiten

| Necesitas… | Usa… | Lección |
|------------|------|---------|
| que el módulo trabaje con muchos datos | ponerlos en la memoria y pasar un puntero y una longitud | «La memoria lineal» |
| más memoria de la que hay | `memory.grow(páginas)` y, **después**, crear las vistas | «La memoria lineal» |
| datos más grandes que la memoria | una ventana fija que se rellena trozo a trozo, y el estado en globales | «La memoria lineal», «WebAssembly a mano» |
| un texto de ida y vuelta | `encodeInto` en la memoria; la función devuelve la longitud; `TextDecoder` sobre esa vista | «La memoria lineal» |
| un registro con campos de varios tipos | 12 o 16 bytes por registro, `DataView` en little-endian y punteros alineados | «La memoria lineal», «DataView y endianness» |
| varios estados del mismo módulo | compilar una vez y crear una instancia por estado | «Qué es WebAssembly» |
| generar código en la página | un árbol, instrucciones en orden postfijo y `encodeModule` | «Qué es WebAssembly», «WebAssembly a mano» |
| confiar en lo que calcula el módulo | el mismo cálculo en JavaScript, y comparar | todas |

Dos reglas atraviesan la tabla. La primera: **la frontera se cruza poco**. Cada página copia sus datos a la memoria una vez, llama a una función que recorre todo y lee el resultado; ninguna llama a WebAssembly por cada píxel, cada celda o cada byte. La segunda: **lo que calcula WebAssembly se comprueba**. Casi todos los ejemplos repiten el cálculo en JavaScript, con un código lento y claro, y comparan los resultados byte a byte o bit a bit. Es la forma profesional de probar un módulo, y la única manera de saber que los bytes escritos a mano hacen lo que dice su WAT.

## Ejemplos combinados

### Un filtro de imagen en la memoria

El cuadro de Velasco se dibuja en un canvas y sus 633 600 bytes (`getImageData`) se copian a la memoria del módulo, que crece de una página a diez. Dos funciones recorren los píxeles de 4 en 4 bytes: una los pasa a gris con la fórmula de enteros de la lección «Píxeles» (77 R + 150 G + 29 B, entre 256) y la otra los invierte, sin tocar el alfa. El resultado vuelve a un `ImageData` y a `putImageData`; el mismo bucle en JavaScript comprueba cada byte.

[[exercise:01-filtro-en-la-memoria.md]]

```text
158400 píxeles · 633600 bytes · 10 páginas de memoria
Escala de grises · ¿los mismos píxeles que el bucle de JavaScript? true
Listo: elige otro filtro
// Tras elegir «Negativo»:
Negativo · ¿los mismos píxeles que el bucle de JavaScript? true
```

[[exercise:01-filtro-en-la-memoria.md-(script.js)]]

Fíjate en el orden: primero `memory.grow` y después, en cada filtro, la vista `new Uint8Array(memory.buffer, PTR, size)`. Una vista creada antes de crecer estaría desconectada (lección «La memoria lineal»). Y en `crossOrigin = 'anonymous'`: en las tarjetas de la teoría, toda imagen es de otro origen, y sin él `getImageData` lanzaría un `SecurityError`.

### Una calculadora que compila

Una fórmula como `(precio * cantidad) - descuento` pasa por las tres fases de cualquier compilador: los **tokens** (números, nombres y símbolos, con su posición), el **árbol** (un análisis descendente recursivo con la precedencia de siempre) y la **generación de código**: un recorrido del árbol que escribe primero los operandos y después la operación, es decir, instrucciones de una máquina de pila. Cada variable se convierte en un parámetro `f64`, `emit.js` empaqueta el cuerpo y la página instancia el módulo en cada cambio.

[[exercise:02-calculadora-que-compila.md]]

```text
fórmula → (precio * cantidad) - descuento
parámetros → precio, cantidad, descuento
WAT → local.get $precio · local.get $cantidad · f64.mul · local.get $descuento · f64.sub
módulo → 49 bytes · ¿válido? true
formula(249.5, 3, 100) → 648.5 · ¿igual que en JavaScript? true
Listo: escribe otra fórmula y pulsa Intro, o cambia los valores
// Tras escribir precio * cantidad * (1 + iva) en la fórmula y pulsar Intro:
fórmula → precio * cantidad * (1 + iva)
parámetros → precio, cantidad, iva
WAT → local.get $precio · local.get $cantidad · f64.mul · f64.const 1 · local.get $iva · f64.add · f64.mul
módulo → 59 bytes · ¿válido? true
formula(249.5, 3, 0.16) → 868.26 · ¿igual que en JavaScript? true
// Tras borrar el último «)» y pulsar Intro:
❗ posición 29: falta un «)»
```

[[exercise:02-calculadora-que-compila.md-(script.js)]]

Es la idea de las hojas de cálculo y de los motores de reglas: un lenguaje pequeño, propio, que se compila en lugar de interpretarse. Y es seguro por construcción: la calculadora no usa `eval`, su lenguaje solo sabe hacer cuentas y el módulo que genera no importa nada, así que una fórmula escrita por un usuario no puede tocar la página. Fíjate en que dividir entre 0 da `Infinity`, sin trampa: solo atrapan las divisiones **enteras**.

### Una suma de comprobación por trozos

El inventario de la librería (272 555 bytes) no se copia entero a la memoria: los trozos que entrega el stream de `fetch` pasan por una **ventana** fija de 64 KiB, y el módulo acumula Adler-32 en dos variables globales, que sobreviven de una llamada a la siguiente. La memoria no crece nunca, así que la vista de la ventana vale siempre. El mismo código sirve para un archivo del disco con `file.stream()`.

[[exercise:03-suma-por-trozos.md]]

```text
inventario.csv → 272555 bytes · adler32 → c06b2277 · ¿igual que de una vez en JavaScript? true
memoria usada → una ventana de 65536 bytes, para un archivo 4.2 veces mayor
Listo: elige un archivo para calcular su suma
// Tras elegir un archivo (el nombre, el tamaño y la suma son los de tu archivo):
fotos-del-viaje.zip → 1834752 bytes · adler32 → 3f1c9a07
```

[[exercise:03-suma-por-trozos.md-(script.js)]]

Cuántos trozos llegan y de qué tamaño depende de la red y del navegador; por eso el ejemplo no lo imprime. Lo que no cambia es el resultado: `c06b2277` es también lo que da `zlib.adler32` en Python con el archivo entero. Es la técnica de los programas que verifican descargas de varios gigabytes: memoria constante, cualquier tamaño de archivo.

### El juego de la vida en la memoria

Dos tableros de 48 × 32 bytes, uno detrás de otro en la memoria. `step()` lee el tablero actual, escribe la generación siguiente en el otro (los bordes dan la vuelta, como en un toro), cambia una variable global para intercambiarlos y devuelve la población. JavaScript solo dibuja: lee los bytes del tablero actual con una vista y pinta las celdas vivas. Para comprobarlo, una **segunda instancia** del mismo módulo calcula 50 generaciones en su propia memoria, sin tocar el tablero que se ve.

[[exercise:04-juego-de-la-vida.md]]

```text
48 × 32 = 1536 celdas · dos tableros de 1536 bytes en la memoria (en 0 y en 2048)
generación 0 → población 13
¿igual que en JavaScript tras 50 generaciones? true · población 82
Listo: pulsa «Un paso» o «Reproducir 100 generaciones»
// Tras pulsar «Un paso» dos veces:
generación 1 → población 14
generación 2 → población 15
// Tras pulsar «Reiniciar» y «Reproducir 100 generaciones», y esperar unos 10 s:
⏹ generación 100 → población 25
```

[[exercise:04-juego-de-la-vida.md-(script.js)]]

La animación sigue las reglas de siempre: empieza con un botón, avanza diez generaciones por segundo y se detiene en la centésima (unos 10 segundos), se para si ocultas la página y, con «reducir movimiento», no arranca (se avanza con «Un paso»). Y la variable global `current` se exporta y es mutable: «Reiniciar» la pone a 0 desde JavaScript.

### Un texto de ida y vuelta: del nombre a la URL

El nombre de un producto se convierte en la parte de una dirección web (un *slug*): minúsculas, sin tildes, con guiones entre las palabras. `encodeInto` lo escribe en la memoria; la función recorre sus bytes UTF-8, cambia las letras con tilde gracias a una tabla de 64 bytes guardada en un **segmento de datos**, y devuelve la longitud del resultado, que `TextDecoder` lee con exactitud.

[[exercise:05-texto-a-slug.md]]

```text
cafe-de-olla-con-piloncillo-500-g · ¿igual que con normalize()? true
nandu-pinguino-edicion-de-lujo · ¿igual que con normalize()? true
mole-poblano-receta-de-la-abuela · ¿igual que con normalize()? true
arbol-de-la-vida-metepec · ¿igual que con normalize()? true
límite: «Plzeň» → plze (con normalize(): plzen)
Listo: escribe el nombre de otro producto (pulsa Intro para anotarlo)
// Tras escribir «Jalapeños en escabeche» y pulsar Intro:
/tienda/jalapenos-en-escabeche
```

[[exercise:05-texto-a-slug.md-(script.js)]]

Las letras con tilde del español ocupan dos bytes en UTF-8, `c3` y un segundo byte entre `80` y `bf` (lección «Texto y binario»): basta una tabla de 64 entradas para todas. La última línea muestra el límite honesto de esa tabla: la «ň» checa empieza por `c5`, no está en ella y se convierte en separador, mientras que `normalize('NFD')` sabe separar su tilde. Para el catálogo de una tienda mexicana basta; para cualquier idioma, la versión de JavaScript es la buena.

### Registros en la memoria

Las 2000 ventas de una librería son **registros** de 12 bytes, como un `struct` de C: el SKU, las unidades, la categoría, un byte de relleno y el precio en float32. JavaScript los escribe campo a campo con `DataView`, en un puntero que el asignador de avance alinea a 4; los totales (8 `f64` de ingresos y 8 `u32` de unidades) van en otro puntero alineado a 8. El módulo los recorre y suma, y JavaScript lee los totales con un `Float64Array` y un `Uint32Array`.

[[exercise:06-registros-en-memoria.md]]

```text
registros → 2000 × 12 bytes desde 1024 · totales en 25024 (múltiplo de 8)
Novela → 1711 libros · $478,594.39
Poesía → 855 libros · $239,276.99
Ensayo → 859 libros · $239,331.59
Historia → 857 libros · $240,590.79
Infantil → 860 libros · $240,718.99
Cómic → 858 libros · $239,887.19
¿los mismos totales que en JavaScript, al último bit? true
```

[[exercise:06-registros-en-memoria.md-(script.js)]]

Los totales coinciden al último bit porque las dos versiones hacen exactamente las mismas operaciones, en el mismo orden: el precio se lee como float32 (`f32.load` y `getFloat32`), se convierte a float64 sin perder nada (`f64.promote_f32`) y se multiplica y suma en float64. El byte de relleno es la regla de la alineación de la lección «ArrayBuffer y vistas»: sin él, el precio de cada registro caería en una dirección impar.

## Ejercicios

Los cuatro ejercicios se corrigen solos: al cargar, cada comprobación imprime `✅` o, en rojo, `❌` con lo esperado y lo obtenido. Al abrirlos, casi todas salen en rojo; las que ya salen en verde comprueban algo que el código de partida hace bien y que tu cambio no debe romper.

### El módulo que no compila

Un módulo de la tienda, escrito byte a byte, no compila: el tamaño de su sección de código está mal contado. Y cuando compile, el envío de 9900 centavos saldrá negativo, por la regla del signo de `i32.const`. Cinco comprobaciones.

[[exercise:07-ej-tamano-de-seccion.md-]]

```text
❌ el módulo se compila → esperaba "ok" y obtuve "CompileError: WebAssembly.instantiate(): expected 8 bytes, fell off end @+68"
❌ subtotal(3, 2450) = 7350 → esperaba 7350 y obtuve "TypeError: Cannot read properties of null (reading 'subtotal')"
❌ withShipping(7350) = 17250 (el envío son $99.00) → esperaba 17250 y obtuve "TypeError: Cannot read properties of null (reading 'withShipping')"
❌ la constante 9900 está escrita como ac cd 00 → esperaba "41 ac cd 00" y obtuve "41 ac 4d"
❌ el módulo mide 77 bytes → esperaba 77 y obtuve 76
```

### Los bytes de `mul` y `square`

Con los ayudantes de la lección «WebAssembly a mano», amplía el módulo de `add` con `mul` y `square`. `square` tiene un solo parámetro, así que necesita su propio tipo. Seis comprobaciones.

[[exercise:08-ej-bytes-de-mul.md-]]

```text
❌ exporta add, mul y square → esperaba "add, mul, square" y obtuve "add"
✅ add(2, 3) = 5 (no se ha roto)
❌ mul(6, 7) = 42 → esperaba 42 y obtuve "TypeError: math.mul is not a function"
❌ mul(65536, 65536) = 0 (i32 da la vuelta) → esperaba 0 y obtuve "TypeError: math.mul is not a function"
❌ square(9) = 81 → esperaba 81 y obtuve "TypeError: math.square is not a function"
❌ square tiene un solo parámetro → esperaba 1 y obtuve "TypeError: Cannot read properties of undefined (reading 'length')"
```

### Las vistas, después de crecer

Un registro de temperaturas añade 20 000 lecturas y la memoria crece a dos páginas por el camino. La vista creada al principio se queda desconectada: una función devuelve `undefined`, otra lanza y la tercera escribe en el vacío sin ningún error. Seis comprobaciones.

[[exercise:09-ej-vistas-tras-crecer.md-]]

```text
✅ 20000 lecturas guardadas
✅ la memoria creció a 2 páginas
❌ latest() = 9999.5 → esperaba 9999.5 y obtuve undefined
❌ average() = 4999.75 → esperaba 4999.75 y obtuve "TypeError"
❌ setReading(19999, 42) llega a WebAssembly: get(19999) = 42 → esperaba 42 y obtuve 9999.5
✅ la memoria sigue en 2 páginas
```

### Importaciones con el tipo correcto

La caja de una cafetería importa dos funciones de JavaScript que devuelven el tipo equivocado: un texto donde el módulo espera un `i32` (y la frontera lo convierte en 0 sin avisar) y un `number` donde espera un `i64`. Arréglalas sin tocar los bytes del módulo. Seis comprobaciones.

[[exercise:10-ej-firma-de-las-importaciones.md-]]

```text
❌ un café de 19.50 → charge(19.5) = 1950 → esperaba 1950 y obtuve 0
❌ un pan de 19.99 → charge(19.99) = 1999 → esperaba 1999 y obtuve 0
❌ 0.1 + 0.2 pesos → charge(0.1 + 0.2) = 30 → esperaba 30 y obtuve 0
❌ receiptTime() = 1792521900000n → esperaba 1792521900000n y obtuve "TypeError: Cannot convert 1792521900000 to a BigInt"
❌ receiptTime() es un BigInt → esperaba "bigint" y obtuve "TypeError: Cannot convert 1792521900000 to a BigInt"
❌ la hora del ticket → esperaba "2026-10-20T18:45:00.000Z" y obtuve "TypeError: Cannot convert 1792521900000 to a BigInt"
```
