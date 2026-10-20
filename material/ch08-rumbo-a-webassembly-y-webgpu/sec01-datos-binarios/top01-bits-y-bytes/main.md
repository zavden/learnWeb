# Bits y bytes

## Por qué importa

Este es el último capítulo del curso, y su nombre dice adónde va: **WebAssembly** (código compilado de C, C++ o Rust que corre en el navegador casi a la velocidad nativa) y **WebGPU** (la tarjeta gráfica al servicio de tu página, para dibujar y para calcular). Por el camino hay un idioma común: todos esos sistemas hablan con la máquina en **bytes**. Un worker recibe un `ArrayBuffer`; la GPU recibe los vértices de un modelo 3D en un `Float32Array`; un módulo de WebAssembly es, literalmente, un `Uint8Array`, y su memoria es un gran `ArrayBuffer` que lees y escribes con typed arrays.

Hasta ahora, los números de JavaScript eran valores abstractos: un `number` y ya. Esta lección baja un nivel y mira los **bits**: cómo se escribe un número en binario y en hexadecimal, qué es un byte y qué hacen los operadores bit a bit (`&`, `|`, `^`, `~`, `<<`, `>>`, `>>>`). Tienen una regla que no comparten con Python y que provoca fallos silenciosos: **convierten sus operandos a enteros de 32 bits**.

Todo el capítulo funciona igual en TypeScript, donde los typed arrays tienen sus propios tipos (`Uint8Array`, `ArrayBuffer`, `DataView`…). Los ejemplos de este módulo son JavaScript, porque lo que importa aquí es lo que ocurre al ejecutar.

## Qué hay en este capítulo

El capítulo «Rumbo a WebAssembly y WebGPU» tiene seis módulos, cada uno apoyado en el anterior:

1. **Datos binarios** (este módulo): bits y bytes, `ArrayBuffer` y typed arrays, `DataView` y el orden de los bytes, texto convertido en bytes y la precisión de `Float32Array`.
2. **Workers y concurrencia**: otro hilo para el trabajo pesado, transferir búferes sin copiarlos y memoria compartida.
3. **Rendimiento**: medir de verdad, memoria y recolector de basura, el presupuesto de cada fotograma.
4. **Gráficos en la GPU**: shaders, WebGL desde JavaScript, texturas.
5. **WebAssembly**: el formato binario, un módulo escrito byte a byte, la memoria lineal.
6. **WebGPU**: búferes, *compute shaders* y el pipeline de render.

## Bits, bytes y bases

Un **bit** es un 0 o un 1. Un **byte** son 8 bits, así que puede valer de `0` a `255` (2⁸ = 256 combinaciones). Es la unidad con la que trabaja la memoria: cada dirección de memoria guarda un byte, y un archivo es una fila de bytes. Leer un byte en binario es como leer un número en decimal, pero cada posición vale el doble que la anterior en lugar de diez veces más:

```text
posición    7    6    5    4    3    2    1    0
peso      128   64   32   16    8    4    2    1
bits        1    1    0    0    1    0    1    0   → 128 + 64 + 8 + 2 = 202
```

El binario es largo de leer, así que se usan dos atajos. En **hexadecimal** (base 16, cifras `0-9` y `a-f`), cada cifra son exactamente **4 bits**, y un byte son siempre **dos cifras**: `1100 1010` es `ca`. En **octal** (base 8), cada cifra son 3 bits; hoy casi solo se ve en los permisos de archivos de Unix. JavaScript tiene literales para las tres bases, con el separador `_` para agrupar cifras, y dos caminos de ida y vuelta: `toString(base)` (número → texto) y `parseInt(texto, base)` (texto → número):

[[exercise:01-bases-y-literales.md-]]

```text
decimal → 202
0b11001010 → 202
0o312 → 202
0xca → 202
0b1100_1010 → 202 | 0xc → 12 | 0xa → 10
(5).toString(2) → 101
(5).toString(2).padStart(8, '0') → 00000101
(255).toString(16) → ff
(10).toString(16).padStart(2, '0') → 0a
parseInt('11001010', 2) → 202
parseInt('ca', 16) → 202
parseInt('0b101', 2) → 0
Number('0b101') → 5 | Number('0xff') → 255
```

`toString(2)` no escribe los ceros de la izquierda: para ver un byte completo, `padStart(8, '0')`; para su forma hexadecimal, `padStart(2, '0')`. Lo usarás en todo el módulo.

> **Desde Python:** los literales son idénticos (`0b1010`, `0o17`, `0xff`, `1_000`). Cambian las funciones: `bin(202)` da `'0b11001010'` con prefijo, y `(202).toString(2)` da `'11001010'` sin él; `format(5, '08b')` es `(5).toString(2).padStart(8, '0')`; `int('ca', 16)` es `parseInt('ca', 16)`. Un detalle: `int('0b101', 2)` en Python acepta el prefijo, `parseInt` no (lee `'0'` y se para).

### Un byte, dos cifras hexadecimales

Ya has escrito bytes en hexadecimal sin saberlo. En la lección «Color» del módulo de fundamentos de CSS viste que `#1e40af` son tres canales, rojo, verde y azul, de 0 a 255: son **tres bytes**, `1e`, `40` y `af`, uno por canal. El selector de color de este ejemplo descompone cualquier color en sus bytes:

[[exercise:02-un-color-son-tres-bytes.md]]

```text
#1e40af → [30, 64, 175] = 3 bytes = 24 bits
Listo: elige otro color; cada canal es un byte (00-ff, 0-255)
// Tras elegir #ff8800 en el selector y cerrarlo:
#ff8800 → [255, 136, 0] = 3 bytes = 24 bits
```

El hexadecimal es el idioma de los bytes en todas partes: los volcados de memoria, las firmas de los archivos (un PNG empieza por `89 50 4e 47`, lección «DataView y endianness»), los bytes de UTF-8 que viste en «Anatomía de un documento» (`ó` es `c3 b3`) y las direcciones de memoria de un depurador.

## Operadores bit a bit

Los operadores bit a bit tratan un número como una fila de bits y operan **posición a posición**, columna a columna, sin acarreos:

| Operador | Nombre | Cada bit del resultado es 1 si… | Ejemplo (8 bits) |
|----------|--------|----------------------------------|------------------|
| `a & b` | AND | los dos bits son 1 | `1100 & 1010` → `1000` |
| `a \| b` | OR | alguno es 1 | `1100 \| 1010` → `1110` |
| `a ^ b` | XOR | son distintos | `1100 ^ 1010` → `0110` |
| `~a` | NOT | el bit era 0 | `~0000_1111` → `…1111_0000` |
| `a << n` | desplazamiento a la izquierda | (mueve los bits n posiciones; entran ceros) | `0011 << 2` → `1100` |
| `a >> n` | desplazamiento a la derecha | (mueve los bits; entran copias del signo) | `1100 >> 2` → `0011` |
| `a >>> n` | desplazamiento sin signo | (mueve los bits; entran ceros) | ver más abajo |

Desplazar `n` posiciones a la izquierda multiplica por `2 ** n`; a la derecha, divide entre `2 ** n` y descarta los decimales. XOR tiene una propiedad curiosa: aplicarlo dos veces con la misma clave devuelve el valor original.

[[exercise:03-operadores-bit-a-bit.md-]]

```text
a     → 11001010 202
b     → 10100110 166
a & b → 10000010 (AND: 1 si los dos son 1)
a | b → 11101110 (OR: 1 si alguno es 1)
a ^ b → 01101100 (XOR: 1 si son distintos)
~a → -203
~a & 0xff → 00110101 (NOT: cada bit al revés)
a << 1 → 110010100 = 404
a >> 2 → 00110010 = 50
a ^ key → 10011111 | (a ^ key) ^ key → 11001010
```

Fíjate en `~a`: no da `53` (el byte invertido), sino `-203`. El NOT invierte **32** bits, no 8, y el resultado se lee como un número con signo. Para quedarte con un byte, aplica la máscara `& 0xff`. Esa es la pista de la regla más importante de la lección.

## 🐛 Todo pasa por 32 bits

Un `number` es un decimal de 64 bits (lección «Números»), pero los operadores bit a bit no trabajan con ese formato. Antes de operar, convierten cada operando en un **entero de 32 bits con signo** (*int32*): quitan los decimales, se quedan con los 32 bits de abajo y leen el bit 31 como signo. El resultado también es un int32. Con números pequeños no se nota; con números grandes, el resultado cambia sin ningún error:

```text
0xffffffff = 11111111 11111111 11111111 11111111
leído sin signo (uint32): 4294967295
leído con signo (int32):  el bit 31 vale -2147483648 → -2147483648 + 2147483647 = -1
```

Esa forma de guardar negativos se llama **complemento a dos**: el bit de la izquierda pesa lo mismo que siempre, pero en negativo. Es la que usan todas las CPU, los typed arrays con signo de la lección siguiente y WebAssembly.

[[exercise:04-operandos-de-32-bits.md-]]

```text
2 ** 32 | 0 → 0
(2 ** 32 + 5) | 0 → 5
0xffffffff | 0 → -1
2 ** 31 | 0 → -2147483648
1 << 31 → -2147483648
1 << 32 → 1
3.7 | 0 → 3 | -3.7 | 0 → -3
🐛 ~~backupBytes → 705032704
✅ Math.trunc(backupBytes) → 5000000000
(0xffffffff | 0) >>> 0 → 4294967295
(1 << 31) >>> 0 → 2147483648
2n ** 32n | 0n → 4294967296n
```

En código antiguo verás `x | 0` y `~~x` como atajos para quitar decimales. Funcionan hasta `2 ** 31` y fallan sin avisar a partir de ahí: un archivo de 5 GB «mide» 705 MB. Para quitar decimales, `Math.trunc`. El `| 0` tiene una historia interesante: en **asm.js**, el antecesor de WebAssembly, `x | 0` era la forma de decirle al motor «esto es un int32», y el motor generaba instrucciones de enteros. WebAssembly convirtió esa idea en un formato propio, con tipos `i32` e `i64` de verdad.

## Desplazar con y sin signo: `>>` y `>>>`

Los dos desplazamientos a la derecha se diferencian en qué entra por la izquierda. `>>` copia el bit de signo, así que un negativo sigue siendo negativo (es una división entre 2 que respeta el signo). `>>>` mete ceros, y su resultado se lee **sin signo**: es el único operador bit a bit que devuelve un entero de 32 bits sin signo (*uint32*). Por eso `x >>> 0`, desplazar cero posiciones, es la forma estándar de leer los 32 bits de un resultado como un número positivo.

[[exercise:05-desplazar-con-y-sin-signo.md-]]

```text
(-8).toString(2) → -1000
bits de -8      → 11111111111111111111111111111000
-8 >> 1  → 11111111111111111111111111111100 -4
-8 >>> 1 → 01111111111111111111111111111100 2147483644
40 >> 3 → 5 | 40 >>> 3 → 5
pago-rapido:rosa → hash 1891298337 | 🐛 cubo 37 | ✅ cubo 37
pago-rapido:lucia → hash -285371672 | 🐛 cubo -72 | ✅ cubo 24
el hash de lucia en hex → eefd92e8
```

El hash FNV-1a del ejemplo es de verdad: se usa para repartir clientes en grupos de forma estable (la misma persona cae siempre en el mismo cubo). Usa `Math.imul(a, b)`, que multiplica como lo haría una CPU con dos int32. Con `*`, el producto de dos números de 32 bits puede pasar de `2 ** 53` y perder justo los bits de abajo, que son los que importan en un hash. Sin el `>>> 0` final, la mitad de los clientes caen en cubos negativos que no existen, y nadie da un error.

> **Desde Python:** Python no tiene `>>>` ni enteros de 32 bits: un `int` crece lo que haga falta, así que `1 << 31` es `2147483648` y `~5` es `-6` (eso sí coincide). Para imitar la aritmética de 32 bits sin signo se aplica una máscara después de cada operación: `(h * 0x01000193) & 0xffffffff`. En JavaScript, el recorte a 32 bits ocurre siempre, lo quieras o no.

## Máscaras y flags

Un número de 32 bits puede guardar **32 respuestas de sí/no**, una por bit. Cada opción es una potencia de 2 (`1 << 0`, `1 << 1`, `1 << 2`…), y una **máscara** es un número con a 1 los bits que te interesan. Ya has usado una: en la lección «Teclado, ratón y puntero», `event.buttons` sumaba los botones pulsados como bits (1 izquierdo, 2 derecho, 4 central). Las verás de nuevo en WebGPU, donde el uso de un búfer se declara como `GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST`.

| Operación | Código |
|-----------|--------|
| combinar opciones | `const flags = A \| B` |
| ¿está la opción? | `(flags & A) !== 0` |
| ¿están todas las de una máscara? | `(flags & MASK) === MASK` |
| encender | `flags \|= A` |
| apagar | `flags &= ~A` |
| alternar | `flags ^= A` |

[[exercise:06-mascaras-y-flags.md-]]

```text
invitada → 3 0011
¿puede comentar? → true
¿puede borrar? → false
+ subir → 0111
- comentar → 0101
alternar borrar → 1101
alternar otra vez → 0101
¿es editora? → false
permisos → (2) ['ver', 'subir']
0o754 → 111101100 → rwxr-xr--
```

¿Por qué no un objeto con cuatro booleanos? Para guardar o enviar millones de registros, un número ocupa mucho menos; y para las API de bajo nivel (la GPU, los formatos de archivo, WebAssembly), los bits son la forma natural de expresar opciones. En el código de tu interfaz, un objeto o un `Set` son más legibles: usa máscaras cuando el formato te las imponga.

### Empaquetar varios valores en un número

Los desplazamientos sirven también para **empaquetar** varios valores pequeños en uno grande: cada valor se desplaza a su sitio y `|` los junta. Para desempaquetar, se desplaza a la derecha el trozo que quieres y se recorta con `& 0xff` (o la máscara de su tamaño). Así se guardan los píxeles de muchas imágenes y texturas: cuatro bytes, rojo, verde, azul y alfa, en un entero de 32 bits.

[[exercise:07-empaquetar-colores.md-]]

```text
Azul Talavera: 1982639 → #1e40af → [30, 64, 175]
Rosa mexicano: 14942332 → #e4007c → [228, 0, 124]
Cempasúchil: 16752412 → #ff9f1c → [255, 159, 28]
🐛 RGBA → -469730049 -1bff8301
✅ RGBA → 3825237247 e4007cff
alfa → 255 | rojo → 228
```

Con tres bytes, todo encaja en 24 bits. Con el cuarto, el rojo cae en el bit 31, el del signo, y el número sale negativo: otra vez la regla de los 32 bits, otra vez `>>> 0`. En la lección siguiente verás la alternativa que evita todo esto: un `Uint8Array`, donde cada byte tiene su propia casilla.

### 🐛 La precedencia de `&` y `===`

La última trampa no tiene que ver con los bits, sino con el orden en que se lee una expresión. En JavaScript (y en C, de donde vienen estos operadores), `&`, `^` y `|` tienen **menos prioridad** que `===` y `!==`. Así que `flags & MASK === MASK` no compara el resultado de la máscara: compara primero `MASK === MASK` (que es `true`) y luego hace `flags & true`.

[[exercise:08-precedencia-de-los-operadores-de-bits.md-]]

```text
visitor & EDITOR === EDITOR → 1
🐛 el visitante entra en el panel de edición
(visitor & EDITOR) === EDITOR → false
commenter & COMMENT !== 0 → 0
(commenter & COMMENT) !== 0 → true
1 << 2 + 1 → 8
(1 << 2) + 1 → 5
```

El fallo es doble: según los valores, la condición deja pasar a quien no debe o bloquea a quien sí puede. Y no hay error ni aviso. La regla es simple: **paréntesis siempre** alrededor de una operación de bits que se compara o se combina con otra cosa.

> **Desde Python:** aquí Python es distinto. En Python, `&`, `^` y `|` tienen **más** prioridad que las comparaciones, así que `flags & MASK == MASK` significa `(flags & MASK) == MASK` y funciona. Al traducir ese código a JavaScript, la misma línea cambia de significado sin dar error.

## Contar bits: `Math.clz32`

`Math.clz32(x)` cuenta los ceros de la izquierda en los 32 bits de `x` (*count leading zeros*). Parece una curiosidad, pero de ahí sale cuántos bits necesita un número (`32 - Math.clz32(n)`, el `bit_length()` de Python) y la siguiente potencia de 2. Dos trucos clásicos completan la caja de herramientas: `n & (n - 1)` apaga el bit 1 más bajo, así que es `0` justo cuando `n` es potencia de 2, y repetido sirve para contar los bits encendidos.

[[exercise:09-contar-bits-y-potencias-de-2.md-]]

```text
Math.clz32(1) → 31
Math.clz32(255) → 24
Math.clz32(0) → 32
bitLength(1000) → 10 → 1111101000
¿potencias de 2? → (4) [true, false, true, false]
imagen de 300 px → textura de 512 px
imagen de 512 px → textura de 512 px
imagen de 513 px → textura de 1024 px
imagen de 1920 px → textura de 2048 px
countBits(0b1011_0110) → 5
```

Las potencias de 2 aparecen por todas partes en la programación de bajo nivel: tamaños de página de memoria, búferes que crecen duplicándose y, en WebGL 1, las texturas que necesitaban lados potencia de 2 para poder repetirse y generar sus versiones reducidas (*mipmaps*).

## Más de 32 bits: `BigInt`

Cuando necesitas 64 bits (identificadores de bases de datos, hashes de 64 bits, los enteros `i64` de WebAssembly), el `number` no sirve: sus enteros solo son exactos hasta `2 ** 53`, y sus operadores de bits se quedan en 32. La herramienta es `BigInt`, que ya conoces de la lección «Números». Sus operadores de bits no tienen límite, como los `int` de Python. Como tampoco tiene tamaño fijo, para imitar un entero de exactamente N bits se recorta con `BigInt.asUintN(N, x)` (sin signo) o `BigInt.asIntN(N, x)` (con signo).

[[exercise:10-bigint-para-64-bits.md-]]

```text
1n << 63n → 9223372036854775808n
1 << 63 → -2147483648
~5n → -6n
asUintN(64, -1n) → 18446744073709551615n
asIntN(64, 1n << 63n) → -9223372036854775808n
asUintN(8, 300n) → 44n
JSON → {"id":"103892072267927557"}
leído → {date: '2026-10-14T16:30:00.250Z', shop: 37, sequence: 5}
orderId >> 22 → TypeError | Cannot mix BigInt and other types, use explicit conversions
```

Los identificadores «snowflake» como el del ejemplo los usan muchas plataformas: como el tiempo va en los bits de arriba, ordenar los identificadores es ordenar por fecha, y cada servidor puede generarlos sin preguntar a nadie. Fíjate en que el identificador viaja como texto en el JSON. En la lección siguiente verás `BigInt64Array`, el typed array cuyos elementos son `BigInt`, y en el módulo de WebAssembly, que los `i64` de un módulo llegan a JavaScript como `BigInt`.

## Bestiario

- **`2 ** 32 | 0` es `0`, `1 << 31` es negativo y `~~x` trunca mal.**
  Síntoma: una operación de bits con un número grande da `0`, un negativo o un valor absurdo; un tamaño de 5 GB «mide» 705 MB.
  Causa: los operadores bit a bit convierten sus operandos a int32 (32 bits, con signo) y descartan los decimales y los bits de arriba.
  Solución: `>>> 0` para leer el resultado sin signo; `Math.trunc` para quitar decimales; `BigInt` para más de 32 bits.
  → [ver ejemplo](04-operandos-de-32-bits.md)
- **Un hash o un color RGBA negativo.**
  Síntoma: `hash % 100` da `-72`; un color empaquetado sale `-469730049` y su hexadecimal empieza por `-`.
  Causa: el resultado de `^`, `|`, `<<` o `Math.imul` es un int32, y el bit 31 encendido lo vuelve negativo; `toString(2)` y `toString(16)` de un negativo ponen un signo, no los bits.
  Solución: `(resultado >>> 0)` antes de usar el número, de calcular un resto o de pasarlo a texto.
  → [ver ejemplo](05-desplazar-con-y-sin-signo.md) · [y con colores](07-empaquetar-colores.md)
- **`flags & MASK === MASK` siempre se cumple (o nunca).**
  Síntoma: una comprobación de permisos deja pasar a quien no debe, o bloquea a quien sí puede, sin ningún error.
  Causa: `===` y `!==` tienen más prioridad que `&`, `^` y `|` (en Python es al revés); y `<<` va después de `+`.
  Solución: paréntesis siempre: `(flags & MASK) === MASK`, `(1 << 2) + 1`.
  → [ver ejemplo](08-precedencia-de-los-operadores-de-bits.md)
- **`parseInt('0b101', 2)` es `0`.**
  Síntoma: un texto binario o hexadecimal con prefijo se convierte en `0` (o en un número a medias).
  Causa: `parseInt` lee hasta el primer carácter que no es una cifra de la base: la `b` o la `x` del prefijo.
  Solución: quita el prefijo antes de `parseInt(texto, base)`, o usa `Number('0b101')`, que entiende los prefijos.
  → [ver ejemplo](01-bases-y-literales.md)

## Resumen

- Un byte son 8 bits (0-255) y se escribe con dos cifras hexadecimales; un color `#1e40af` son tres bytes.
- Literales `0b`, `0o`, `0x` con `_`; `toString(base).padStart(n, '0')` para ver bits; `parseInt(texto, base)` sin prefijo.
- `&`, `|`, `^`, `~`, `<<`, `>>` operan bit a bit sobre **int32**: los bits de arriba y los decimales desaparecen y el bit 31 es el signo.
- `>>>` rellena con ceros y devuelve un uint32: `x >>> 0` lee un resultado de 32 bits como positivo.
- Máscaras: `|` combina, `&` pregunta, `&= ~` apaga, `^=` alterna; empaquetar es desplazar y unir con `|`.
- Paréntesis siempre: `===` va antes que `&` en JavaScript (al revés que en Python).
- `Math.clz32`, `Math.imul` y `n & (n - 1)` para trabajo de bajo nivel; `BigInt` con `asUintN`/`asIntN` para 64 bits.

## Para profundizar

- [MDN: Operadores bit a bit (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators#bitwise_operators)
- [MDN: Math.clz32 (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32)
- [MDN: BigInt.asUintN (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt/asUintN)
- [ECMAScript: la conversión ToInt32 (en inglés)](https://tc39.es/ecma262/#sec-toint32)
- [Documentación de Python: operaciones bit a bit con enteros](https://docs.python.org/es/3/library/stdtypes.html#bitwise-operations-on-integer-types)
