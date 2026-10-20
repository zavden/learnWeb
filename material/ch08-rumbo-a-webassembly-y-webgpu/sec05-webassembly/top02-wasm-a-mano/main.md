# WebAssembly a mano

## Por qué importa

Nadie escribe módulos de WebAssembly byte a byte en su trabajo: para eso están los compiladores. Pero hacerlo una vez cambia la forma de ver todo lo demás. Un `.wasm` deja de ser una caja negra y se convierte en lo que ya sabes leer: un formato binario como los PNG y BMP de la lección «DataView y endianness», con una cabecera, unos campos de tamaño conocido y enteros LEB128 como los del módulo «Datos binarios». Cuando un compilador, una herramienta o el navegador te den un error con una posición (`@+31`), sabrás qué hay en ese byte.

Esta lección construye en un `Uint8Array` los 41 bytes del módulo `add` de la lección anterior, uno a uno, y después los lee con un lector como el de «DataView y endianness». Verás también por qué no se cuentan los tamaños a mano, la trampa del signo en las constantes, los bucles, las variables globales, los enteros de 64 bits y lo que pasa cuando una instrucción no puede seguir.

## La cabecera

Todo módulo empieza con 8 bytes fijos: la **firma** `00 61 73 6d` («\0asm») y la **versión**, `01 00 00 00`, un `uint32` en little-endian (el orden de toda la memoria de WebAssembly). Con solo eso ya tienes un módulo válido: vacío, sin funciones, pero se instancia.

[[exercise:01-cabecera-del-modulo.md-]]

```text
bytes → 8 | ¿válido? → true
exportaciones → []
validate() de los cuatro → false false false false
firma equivocada → CompileError: WebAssembly.compile(): expected magic word 00 61 73 6d, found 00 01 02 03 @+0
versión 2 → CompileError: WebAssembly.compile(): expected version 01 00 00 00, found 02 00 00 00 @+4
cortado → CompileError: WebAssembly.compile(): expected 4 bytes, fell off end @+4
un PNG → CompileError: WebAssembly.compile(): expected magic word 00 61 73 6d, found 89 50 4e 47 @+0
```

Los mensajes empiezan por el nombre de la función que los lanzó (`WebAssembly.compile()`, `WebAssembly.instantiate()` o `WebAssembly.Module()`) y terminan con `@+` y la **posición** del byte donde el lector se detuvo. Esa posición es la herramienta de depuración más útil que vas a tener con un `.wasm`. La versión es `1` desde 2017: las novedades del estándar (las versiones 2.0 y 3.0) añadieron instrucciones y secciones, pero la cabecera no ha cambiado.

## Secciones, vectores y tamaños

Detrás de la cabecera, un módulo es una lista de **secciones**, y todas tienen la misma forma: un byte con su **id**, su **tamaño** en bytes (un LEB128 sin signo) y su contenido. Es la estructura «tipo, longitud, datos» de los fragmentos de un PNG, y por la misma razón: un lector puede saltarse una sección que no entiende leyendo solo su tamaño. Las secciones van siempre en este orden, y las que no hacen falta se omiten:

| Id | Sección | Qué guarda |
|---|---|---|
| 1 | tipos | las firmas de las funciones: `(i32, i32) → i32` |
| 2 | importaciones | lo que el módulo necesita de fuera |
| 3 | funciones | el tipo de cada función propia (solo el número de tipo) |
| 5 | memoria | la memoria lineal y su tamaño (lección siguiente) |
| 6 | globales | las variables globales y su valor inicial |
| 7 | exportaciones | nombre → función, memoria o global |
| 8 | inicio | una función que se ejecuta al instanciar |
| 10 | código | los cuerpos de las funciones, en el orden de la sección 3 |
| 11 | datos | bytes que se copian a la memoria al instanciar |
| 0 | personalizada | cualquier cosa con nombre, en cualquier posición; el navegador la ignora |

(Las que faltan, 4 tablas, 9 elementos, 12 cuenta de datos y 13 etiquetas de excepciones, no se usan en este módulo; las tablas y las excepciones se mencionan en la última lección.) Dentro de las secciones, las listas son **vectores**: un LEB128 con cuántos elementos hay, seguido de los elementos. Y un nombre es un vector de bytes UTF-8: `03 61 64 64` es «add». ¿Por qué los tipos de las funciones (sección 3) y su código (sección 10) van separados? Para que el navegador conozca todas las firmas antes de leer el código, y pueda empezar a compilar cada función en cuanto llega, en paralelo y mientras el archivo aún se está descargando.

## `add`, byte a byte

Con esas piezas, el módulo `add` de la lección anterior se escribe a mano. Cada sección lleva un comentario con lo que significa cada byte:

[[exercise:02-add-byte-a-byte.md-]]

```text
bytes → 41 | ¿válido? → true
¿Module e Instance? → true true
add(2, 3) → 5
add(2 ** 31 - 1, 1) → -2147483648
add(1.9, '2') → 3
add(2, 3, 99) → 5 | add(2) → 2
```

El cuerpo de una función es su lista de **variables locales** (aquí ninguna: el byte `00`), sus **instrucciones** y `end` (`0b`). Los **parámetros** son las primeras locales: `local.get 0` lee el primero. Al llegar a `end`, lo que quede en la pila es el resultado. Y la suma es de enteros de 32 bits de verdad: al pasar de `2 ** 31 - 1` da la vuelta, sin error, igual que `| 0` en JavaScript. Los argumentos se convierten al entrar (`1.9` → `1`, `'2'` → `2`), y los que faltan llegan como `undefined`, que se convierte en `0`.

> **Desde Python:** el módulo `struct` y una lista de bytes también te permitirían escribir esto (`bytes([0x00, 0x61, 0x73, 0x6d, …])`). La diferencia es que, en el navegador, el resultado se ejecuta directamente con `WebAssembly.instantiate`.

## Leer un módulo

El camino inverso es el que prometía la lección «DataView y endianness»: un **lector con cursor** que recorre el `.wasm` sección a sección. Lee el id, lee el tamaño con LEB128 (el formato del ejemplo «Enteros LEB128» del módulo «Datos binarios»: 7 bits por byte y el bit alto como «sigue») y descifra el contenido de las secciones que conoce. El resultado es un volcado hexadecimal comentado:

[[exercise:03-leer-las-secciones.md-]]

```text
0000  00 61 73 6d                 firma «\0asm»
0004  01 00 00 00                 versión 1
0008  01 07                       sección 1 (tipos): 7 bytes
000a  01 60 02 7f 7f 01 7f        tipo 0: (i32, i32) → i32
0011  03 02                       sección 3 (funciones): 2 bytes
0013  01 00                       función 0: tipo 0
0015  07 07                       sección 7 (exportaciones): 7 bytes
0017  01 03 61 64 64 00 00        «add» → función 0
001e  0a 09                       sección 10 (código): 9 bytes
0020  01 07 00 20 00 20 01 6a 0b  cuerpo de la función 0: 7 bytes
```

Es el mismo trabajo que hacen `wasm-objdump -x` o `wasm-tools dump` en una terminal. Fíjate en que una sección desconocida no es un problema: basta con leer su tamaño y saltar. Por eso el formato puede crecer sin romper los lectores antiguos.

### 🐛 Los tamaños mal contados

Cada sección y cada cuerpo de función llevan su tamaño delante, y al cambiar una instrucción cambian **los dos**. Si añades `i32.const 1` e `i32.add` a `add` (tres bytes más) y olvidas un tamaño, el error no aparece donde está la causa, sino donde el lector se pierde:

[[exercise:04-tamanos-mal-contados.md-]]

```text
🐛 sin tocar los tamaños → CompileError: WebAssembly.compile(): section (code 1, "Type") extends past end of the module (length 106, remaining bytes 1) @+41
🐛 solo el del cuerpo → CompileError: WebAssembly.compile(): expected 10 bytes, fell off end @+34
🐛 la sección, uno de más → CompileError: WebAssembly.compile(): section (code 10, "Code") extends past end of the module (length 13, remaining bytes 12) @+30
✅ cuerpo 10 y sección 12 → add(2, 3) = 6
```

El primer mensaje es el más traicionero: culpa a una sección de **tipos** que no existe. La sección de código, con su tamaño viejo, termina tres bytes antes de tiempo; el lector cree que empieza otra sección y lee `01` como su id (tipos) y `6a` como su tamaño (106 bytes, cuando solo queda 1). Cuando veas un error absurdo con una posición cerca del final de una sección, sospecha de un tamaño.

## Los ayudantes: `section`, `vec` y `str`

La solución es la de cualquier formato binario: no contar a mano. Cuatro funciones de una línea calculan cada tamaño a partir del contenido, y con ellas los 41 bytes salen idénticos. El mismo ejemplo añade una función `sub` y una **sección personalizada** (id 0) con un texto de 177 bytes: como pasa de 127, su tamaño necesita **dos** bytes de LEB128 (`b1 01`):

[[exercise:05-ayudantes-section-y-vec.md-]]

```text
add → 41 bytes | ¿los mismos que a mano? → true
add(7, 5) → 12 | sub(7, 5) → 2
sección personalizada → 177 bytes · empieza por 00 b1 01
uleb(127) → 7f | uleb(128) → 80 01 | uleb(300) → ac 02
customSections → Módulo de prueba de la lección «WebAssembly a mano…
```

Las secciones personalizadas son las que llevan lo que no es código: los **nombres** de las funciones y variables para el depurador (la sección `name`), el enlace a los **mapas de código fuente** que permiten depurar el C o el Rust original en DevTools, o quién compiló el módulo (`producers`). `WebAssembly.Module.customSections(module, nombre)` las devuelve como `ArrayBuffer`.

A partir de la lección siguiente, estos ayudantes, ampliados, viven en un archivo de los `assets/` de cada lección, `wasm/emit.js`: `encodeModule({ types, imports, funcs, memory, globals, exports, data })` devuelve los bytes de un módulo entero. Léelo con el botón «Assets»: son estas mismas funciones, con los opcodes de las instrucciones como constantes con nombre. Cada ejemplo seguirá mostrando, en un comentario, el WAT de lo que construye.

## Las instrucciones

Cada instrucción es un **opcode** de un byte, a veces seguido de **inmediatos**: los datos fijos que lleva escritos, como el número de una local o el valor de una constante. Las de este módulo:

| WAT | Byte | Inmediato | Pila |
|---|---|---|---|
| `local.get n` / `local.set n` / `local.tee n` | `20` / `21` / `22` | n (LEB128) | apila la local / la desapila y la guarda / la guarda y la deja |
| `global.get n` / `global.set n` | `23` / `24` | n | como las locales, con las globales |
| `i32.const v` / `i64.const v` | `41` / `42` | v (LEB128 **con signo**) | apila v |
| `i32.add` `sub` `mul` `div_s` `div_u` `rem_u` | `6a` `6b` `6c` `6d` `6e` `70` | — | dos `i32` → uno |
| `i32.eqz` `eq` `lt_u` `gt_s` `ge_u` | `45` `46` `49` `4a` `4f` | — | compara y deja 1 o 0 |
| `block` / `loop` / `if` … `else` … `end` | `02` / `03` / `04` … `05` … `0b` | tipo del bloque (`40` = sin resultado) | — |
| `br n` / `br_if n` | `0c` / `0d` | profundidad del bloque | `br_if` consume la condición |
| `call f` | `10` | índice de la función | consume los argumentos, deja el resultado |
| `unreachable` | `00` | — | trampa inmediata |

### 🐛 `i32.const` lleva signo

Los tamaños, las cuentas y los índices son LEB128 **sin signo**. Pero el inmediato de `i32.const` (y de `i64.const`) es un LEB128 **con signo**, y ahí cambia una regla: el bit `0x40` del último byte es el bit de signo. Un número como `64`, que «cabe» en 7 bits, no se puede escribir como `40`, porque `40` con signo es `-64`:

[[exercise:06-i32-const-con-signo.md-]]

```text
🐛 41 40 → maxTickets() = -64
✅ 41 c0 00 → maxTickets() = 64
63 → 3f | 64 → c0 00 | -1 → 7f | -64 → 40 | -65 → bf 7f | 120 → f8 00 | 128 → 80 01 | 2026 → ea 0f
```

Todo valor de 64 a 127 necesita dos bytes como constante, y uno solo como tamaño. Es la versión con signo del ejemplo «Enteros LEB128», donde viste que `-123456` es `c0 bb 78`: termina cuando lo que queda son todo ceros (o todo unos, si es negativo) **y** el bit `0x40` del último byte ya dice el signo correcto.

### Locales y bucles

Las variables locales se declaran al principio del cuerpo, en **grupos** de «cuántas y de qué tipo»: `01 01 7f` es un grupo de una variable `i32`. Se numeran después de los parámetros. Un bucle es un `block` con un `loop` dentro, como en la lección anterior, y cada bloque lleva un byte de **tipo de bloque** (`40` si no deja nada en la pila):

[[exercise:07-locales-y-bucles.md-]]

```text
digitSum(2026) → 10
digitSum(20261020) → 13
digitSum(-1) → 57
```

Este bucle termina siempre por su propia naturaleza: cada vuelta divide `n` entre 10, y un `i32` tiene como mucho 10 cifras. Fíjate en la última línea: `i32.div_u` y `i32.rem_u` leen los bits de `-1` sin signo, como `4294967295`. Con `div_s` y `rem_s`, el bucle haría otra cosa con los negativos.

## Globales y función de inicio

La sección de **globales** declara variables que viven mientras vive la instancia, con su tipo, si son mutables y un valor inicial (una expresión constante, `i32.const 0`, terminada en `end`). Si se exportan, llegan a JavaScript como objetos **`WebAssembly.Global`**, con una propiedad `value` que se lee y, si es mutable, también se escribe. La sección de **inicio** nombra una función sin parámetros que se ejecuta sola al crear la instancia, antes de que `instantiate` termine:

[[exercise:08-globales-y-funcion-de-inicio.md-]]

```text
¿WebAssembly.Global? → true | typeof → object
stock.value al instanciar → 120
sell(5) → 115 | stock.value → 115
tras stock.value = 200 → sell(1) → 199
```

Fíjate en el `120` del cuerpo de la función de inicio: `41 f8 00`, dos bytes, por la regla del signo. Un `WebAssembly.Global` también se puede crear desde JavaScript (`new WebAssembly.Global({ value: 'f64', mutable: true }, 0.16)`) y **importar**: lo verás en la última lección.

## 🐛 `i64` y `BigInt`

La lección anterior adelantó que un `i64` llega a JavaScript como `BigInt`. La trampa está en el otro sentido: un parámetro `i64` **solo** acepta `BigInt`. Un `number`, aunque sea un entero pequeño y exacto, lanza `TypeError`. Es lo que pasa con los instantes en milisegundos, un caso típico de entero de 64 bits:

[[exercise:09-i64-y-bigint.md-]]

```text
🐛 addMinutes(number, 45) → TypeError: Cannot convert 1792513800000 to a BigInt
✅ addMinutes(BigInt, 45) → 1792516500000n | typeof → bigint
🐛 resultado + 1000 → TypeError: Cannot mix BigInt and other types, use explicit conversions
✅ como fecha → 2026-10-20T17:15:00.000Z
addMinutes(2n ** 63n - 1n, 1) → -9223372036854715809n
BigInt.asIntN(64, … + 60000n) → -9223372036854715809n
🐛 minutos como BigInt → TypeError: Cannot convert a BigInt value to a number
```

La conversión es estricta en los dos sentidos: un `i64` no acepta un `number` y un `i32` no acepta un `BigInt`. Lo que vuelve también es `BigInt`, que no se mezcla con `number` sin `Number()` o `BigInt()`. Y los `i64` dan la vuelta en los 64 bits, como `BigInt.asIntN(64, …)` de la lección «Bits y bytes». Antes de que existiera esta conversión (hasta 2020), una función con `i64` en su firma ni siquiera se podía llamar desde JavaScript.

> **Desde Python:** un `int` de Python no tiene límite, como un `BigInt`, pero en Python no hay dos tipos de número entero entre los que elegir. `ctypes.c_int64(2 ** 63).value` da `-9223372036854775808`: también da la vuelta.

## 🐛 Trampas

Algunas instrucciones no pueden continuar: dividir entre cero, una división cuyo resultado no cabe en un `i32` (`-2147483648 / -1` sería `2147483648`), leer fuera de la memoria o llegar a un `unreachable`. En lugar de devolver un valor inventado, WebAssembly **atrapa** (*trap*): la función se detiene en el acto y JavaScript recibe un **`WebAssembly.RuntimeError`**.

[[exercise:10-trampas.md-]]

```text
split(120000, 4) → 30000
🐛 split(120000, 0) → RuntimeError: divide by zero · ¿RuntimeError? true
🐛 split(-2147483648, -1) → RuntimeError: divide result unrepresentable · ¿RuntimeError? true
🐛 fail() → RuntimeError: unreachable · ¿RuntimeError? true
después: split(9000, 4) → 2250
JavaScript: 120000 / 0 → Infinity | (-(2 ** 31) / -1) | 0 → -2147483648
```

Es lo contrario que JavaScript, donde ninguna división lanza. Una trampa es una excepción normal: se captura con `try/catch`, y la instancia sigue funcionando después. `unreachable` es lo que ponen los compiladores donde el programa no debería llegar nunca (el `panic!` de Rust o un `abort()` de C acaban ahí). Las trampas de memoria, las más frecuentes, se ven en la lección siguiente.

## Bestiario

- **Un error que culpa a una sección que no existe.**
  Síntoma: tras cambiar una función, `CompileError: … section (code 1, "Type") extends past end of the module …`, `expected 10 bytes, fell off end` o `section was shorter than expected size`.
  Causa: un tamaño (de la sección o del cuerpo de una función) no se actualizó; el lector se desplaza y lee bytes de código como si fueran el principio de otra sección.
  Solución: no cuentes tamaños a mano: calcúlalos desde el contenido con funciones como `section` y `vec`, y usa la posición `@+` para encontrar el tamaño culpable.
  → [ver ejemplo](04-tamanos-mal-contados.md)
- **`i32.const 64` devuelve `-64`.**
  Síntoma: una constante entre 64 y 127 (o un negativo) sale con otro valor o con otro signo.
  Causa: el inmediato de `i32.const` es un LEB128 con signo, y el bit `0x40` del último byte es el signo.
  Solución: codifica las constantes con un `sleb()`; 64 es `c0 00`.
  → [ver ejemplo](06-i32-const-con-signo.md)
- **`TypeError: Cannot convert 1792513800000 to a BigInt`.**
  Síntoma: llamar a una función con un parámetro `i64` lanza `TypeError`, aunque el número sea entero; o el resultado no se puede sumar a un `number`.
  Causa: los `i64` viajan como `BigInt`, en los dos sentidos, y `BigInt` no se mezcla con `number`.
  Solución: `BigInt(valor)` al llamar y `Number(resultado)` al volver (exacto hasta `2 ** 53`).
  → [ver ejemplo](09-i64-y-bigint.md)
- **`RuntimeError: divide by zero` o `divide result unrepresentable`.**
  Síntoma: una división que en JavaScript daría `Infinity` o un número lanza una excepción.
  Causa: las divisiones enteras de WebAssembly atrapan con divisor 0 y cuando el resultado no cabe en el tipo.
  Solución: comprueba el divisor (y el caso del mínimo entre -1) antes, o captura el `RuntimeError`; la instancia sigue sirviendo.
  → [ver ejemplo](10-trampas.md)

## Resumen

- Un módulo es la cabecera (`00 61 73 6d 01 00 00 00`) y una lista de secciones en orden fijo: id, tamaño en LEB128 y contenido.
- Los vectores son una cuenta (LEB128) y sus elementos; un nombre es un vector de bytes UTF-8.
- Tipos (1), funciones (3), exportaciones (7) y código (10) bastan para `add`; el código son locales, instrucciones y `end` (`0b`).
- Los errores de compilación llevan la posición del byte (`@+30`); un tamaño mal contado falla lejos de su causa.
- Las constantes usan LEB128 con signo: `i32.const 64` es `41 c0 00`.
- Las globales exportadas son `WebAssembly.Global` (`.value`); la función de inicio se ejecuta al instanciar.
- `i64` ↔ `BigInt` en los dos sentidos, estricto; las trampas (`RuntimeError`) son excepciones capturables.

## Para profundizar

- [WebAssembly: la especificación del formato binario (en inglés)](https://webassembly.github.io/spec/core/binary/index.html)
- [MDN: Entender el formato de texto de WebAssembly (en inglés)](https://developer.mozilla.org/en-US/docs/WebAssembly/Understanding_the_text_format)
- [La tabla de opcodes de WebAssembly (en inglés)](https://pengowray.github.io/wasm-ops/)
- [Wikipedia: LEB128 (en inglés)](https://en.wikipedia.org/wiki/LEB128)
