# ArrayBuffer y vistas

## Por qué importa

En la lección «Peticiones con fetch» viste que `response.arrayBuffer()` devuelve «bytes sin más», y en «Streams y progreso», que cada trozo del cuerpo es un `Uint8Array`, «una lista de bytes». Esta lección explica qué son exactamente esos dos objetos y por qué no son un array normal.

Un `Array` de JavaScript es flexible: guarda cualquier mezcla de valores, crece y encoge, y cada elemento ocupa varios bytes aunque solo guarde un valor de 0 a 255. Para un millón de píxeles eso es un desperdicio, y además ni la GPU, ni un módulo de WebAssembly, ni un archivo saben qué hacer con un `Array`. Lo que entienden es **memoria**: una fila de bytes seguidos, cada uno con su posición. JavaScript la representa con dos piezas: el **`ArrayBuffer`**, que son los bytes, y las **vistas** (*typed arrays* como `Uint8Array` o `Float32Array`), que dicen cómo leerlos. Separar las dos cosas es la idea clave de este módulo.

## El búfer y la vista

Un `ArrayBuffer` es un bloque de bytes de tamaño fijo, todos a cero al crearlo. No tiene índices ni métodos para leer: es memoria sin interpretar. Para usarla se crea una vista encima. La más sencilla es `Uint8Array`, que lee cada byte como un entero sin signo de 0 a 255:

```text
ArrayBuffer(8)   48 69 00 00 00 00 00 ff      ← bytes, sin significado
Uint8Array(8)   [72,105, 0, 0, 0, 0, 0,255]   ← la misma memoria, leída byte a byte
```

[[exercise:01-arraybuffer-y-uint8array.md-]]

```text
buffer → ArrayBuffer(8)
byteLength → 8
buffer[0] → undefined
bytes → Uint8Array(8) [72, 105, 0, 0, 0, 0, 0, 255]
¿misma memoria? → true
new Uint8Array(3) → Uint8Array(3) [0, 0, 0]
Uint8Array.of(3, 1, 4) → Uint8Array(3) [3, 1, 4]
new Uint8Array([10, 20]) → Uint8Array(2) [10, 20]
length → 5 | levels[10] → undefined
typeof levels.push → undefined
at(-1) → 5 | includes(4) → true | join → 3-1-4-1-5
Array.isArray(levels) → false
```

Un typed array se parece a un array, pero tiene tres diferencias de fondo: todos sus elementos son del **mismo tipo numérico**, su **tamaño es fijo** (no hay `push`, `pop` ni `splice`, y escribir fuera de rango se ignora sin avisar) y sus elementos viven **seguidos en memoria**, dentro de un `ArrayBuffer` al que se llega con `.buffer`. `new Uint8Array(3)` o `Uint8Array.of(…)` crean su propio búfer por debajo.

> **Desde Python:** el equivalente más cercano de un `Uint8Array` es un `bytearray`, con la diferencia de que el `bytearray` puede crecer (`append`). Las vistas que comparten memoria son el `memoryview` de Python: `memoryview(datos).cast('f')` es un `Float32Array` sobre los mismos bytes. Y si has usado numpy, un typed array es un `ndarray` de una dimensión con un `dtype` fijo.

## La familia de typed arrays

Hay una vista para cada tipo numérico que entiende una CPU. El nombre lo dice todo: `Int` o `Uint` (con o sin signo) o `Float` (decimal), seguido de los **bits** de cada elemento. `BYTES_PER_ELEMENT` dice cuántos bytes ocupa:

[[exercise:02-la-familia-de-typed-arrays.md-]]

```text
Int8Array         1 B  -128 … 127                         numpy: int8
Uint8Array        1 B  0 … 255                            numpy: uint8
Uint8ClampedArray 1 B  0 … 255 (satura)                   numpy: —
Int16Array        2 B  -32768 … 32767                     numpy: int16
Uint16Array       2 B  0 … 65535                          numpy: uint16
Int32Array        4 B  -2147483648 … 2147483647           numpy: int32
Uint32Array       4 B  0 … 4294967295                     numpy: uint32
Float16Array      2 B  ±65504, ~3 cifras                  numpy: float16
Float32Array      4 B  ±3.4e38, ~7 cifras                 numpy: float32
Float64Array      8 B  ±1.8e308, ~16 cifras (= number)    numpy: float64
BigInt64Array     8 B  -(2 ** 63) … 2 ** 63 - 1, BigInt   numpy: int64
BigUint64Array    8 B  0 … 2 ** 64 - 1, BigInt            numpy: uint64
Uint8Array → Uint8Array(2) [255, 255]
Int8Array → Int8Array(2) [-1, -1]
Uint16Array → Uint16Array [65535]
Int16Array → Int16Array [-1]
orderIds[1] = 5 → TypeError | Cannot convert 5 to a BigInt
orderIds → BigInt64Array(2) [103892072267927557n, -1n]
como BigUint64Array → 18446744073709551615n
```

Las versiones con signo usan el **complemento a dos** de la lección anterior: los mismos bits `ff` son `255` para un `Uint8Array` y `-1` para un `Int8Array`. El tipo no está en los bytes, está en la vista. Los dos tipos de 64 bits trabajan con `BigInt`, y no aceptan un `number` ni siquiera cuando es pequeño. `Float16Array` (decimales de 16 bits, en Chrome desde 2025) es el más nuevo: lo verás en la lección «Float32 y precisión», junto a los demás tipos decimales.

¿Cuál usar? `Uint8Array` para bytes sueltos (archivos, texto codificado, red); `Float32Array` para lo que va a la GPU (posiciones, colores, matrices); `Int32Array`/`Uint32Array` para enteros grandes y los índices de una malla 3D; `Float64Array` cuando necesitas la precisión completa de un `number`.

## Varias vistas sobre la misma memoria

Como el búfer es solo memoria, puedes ponerle **varias vistas a la vez**, de tipos distintos. Ninguna copia nada: todas leen y escriben los mismos bytes, cada una a su manera. Es lo que hace un programa en C cuando reinterpreta una zona de memoria, y lo que harás con la memoria de WebAssembly: el módulo escribe enteros y decimales, y JavaScript los lee con la vista que corresponda.

[[exercise:03-dos-vistas-una-memoria.md-]]

```text
floats → Float32Array(2) [1.5, -2]
bytes  → 00 00 c0 3f 00 00 00 c0
words  → Uint16Array(4) [0, 16320, 0, 49152]
tras bytes[3] = 0x40 → floats[0] = 6
tras words[3] = 0x3f80 → floats[1] = 1
```

```text
byte:       0  1  2  3   4  5  6  7
bytes:     00 00 c0 3f  00 00 00 c0
words:     [  0][16320] [  0][49152]
floats:    [    1.5   ] [    -2    ]
```

Dos detalles que volverán: los bytes de `1.5` (`3f c0 00 00`) aparecen **al revés** en memoria, `00 00 c0 3f` (es el orden *little-endian*, tema de la lección siguiente), y cambiar un byte del exponente convierte `1.5` en `6` (cómo se reparten los bits de un decimal se ve en «Float32 y precisión»).

### 🐛 `subarray` comparte, `slice` copia

Una vista también puede cubrir solo una parte del búfer. `subarray(inicio, fin)` crea una vista nueva sobre **la misma memoria**, desde la posición `inicio`; `slice(inicio, fin)` copia esos bytes a un búfer **nuevo**. Los nombres no ayudan: los dos devuelven algo que parece «un trozo», y solo uno es independiente.

[[exercise:04-subarray-comparte-memoria.md-]]

```text
contenido → Hola!
payload → Uint8Array(5) [98, 69, 70, 75, 11]
🐛 el original → Uint8Array(7) [1, 5, 98, 69, 70, 75, 11]
¿mismo búfer? → true | byteOffset → 2
✅ el original → Uint8Array(7) [1, 5, 72, 111, 108, 97, 33]
¿mismo búfer? → false | byteOffset → 0
```

`subarray` existe porque es gratis: no copia ningún byte, así que da igual que el búfer tenga 100 bytes o 100 MB. Úsalo para **leer** una parte (una cabecera, un trozo de un archivo); usa `slice` cuando vayas a **modificar** o a **guardar** el trozo. `byteOffset` dice en qué byte del búfer empieza una vista.

### 🐛 Vistas desalineadas

Una vista de elementos de 2, 4 u 8 bytes no puede empezar en cualquier byte: su `byteOffset` tiene que ser **múltiplo del tamaño del elemento**, y su tamaño total, un número entero de elementos. La razón está en el hardware: las CPU leen un entero de 4 bytes de una vez cuando empieza en un múltiplo de 4, y la vista calcula la posición de cada elemento como `byteOffset + índice × BYTES_PER_ELEMENT`. Las mismas reglas de alineación aparecerán en los búferes de WebGPU.

[[exercise:05-vistas-desalineadas.md-]]

```text
byteLength → 9
🐛 RangeError | start offset of Uint32Array should be a multiple of 4
🐛 RangeError | byte length of Uint32Array should be a multiple of 4
✅ copia alineada → Uint32Array(2) [10000, 20000]
✅ DataView → 10000 20000
byteOffset → 4 | byteLength → 4 | length → 2
🐛 RangeError | Invalid typed array length: 4
```

En los formatos de archivo reales, los campos no siempre están alineados (una cabecera de 1 byte desplaza todo lo demás). Para leerlos tienes dos caminos: copiar a un búfer nuevo, que siempre empieza alineado, o usar `DataView`, que lee cualquier tipo en cualquier posición. Fíjate también en las unidades: `byteOffset` y `byteLength` se miden en **bytes**; `length` y el tercer argumento del constructor, en **elementos**.

## 🐛 Lo que no cabe: desbordamiento

¿Qué pasa al guardar `300` en un `Uint8Array`? Ni error ni aviso: el valor se convierte a entero (truncando los decimales) y se queda con los **8 bits de abajo**, igual que los operadores de bits se quedaban con 32. `300` es `1_0010_1100` en binario; sin el bit de arriba queda `0010_1100`, que es `44`. Es aritmética **módulo 256**: el valor «da la vuelta», como un cuentakilómetros.

[[exercise:06-desbordamiento-silencioso.md-]]

```text
Uint8Array → Uint8Array(5) [44, 0, 255, 3, 0]
Int8Array 127 + 1 → -128
260 visitas → 4
🐛 más claro → Uint8Array(4) [70, 160, 4, 54]
✅ recortando → Uint8Array(4) [70, 160, 255, 255]
```

Ningún typed array de enteros lanza excepciones, y por eso el error aparece lejos de su causa: una foto con manchas negras donde debería haber blancos, un contador que vuelve a cero. Antes de escribir en un typed array de enteros, comprueba el rango o recórtalo con `Math.min`/`Math.max`.

### `Uint8ClampedArray` satura

Para los píxeles existe un tipo especial: `Uint8ClampedArray` (*clamped*, «sujeto»). Lo que se sale del rango se queda en el borde: `300` es `255` y `-3` es `0`. Es el tipo de `ImageData.data`, los píxeles de un canvas, que verás en el módulo «Gráficos y animación»: así un filtro que aclara una imagen no puede convertir el blanco en negro. Pero tiene una sorpresa con los decimales:

[[exercise:07-uint8clampedarray-satura.md-]]

```text
✅ más claro → Uint8ClampedArray(4) [70, 160, 255, 255]
300 y -3 → Uint8ClampedArray(2) [255, 0]
valores           → (5) [1.5, 2.5, 0.5, 254.5, 3.7]
Uint8Array        → Uint8Array(5) [1, 2, 0, 254, 3]
Uint8ClampedArray → Uint8ClampedArray(5) [2, 2, 0, 254, 4]
Math.round        → (5) [2, 3, 1, 255, 4]
media con Math.round → 3
media en Uint8ClampedArray → 2
```

| Al guardar | `Uint8Array` | `Uint8ClampedArray` | `Math.round` |
|------------|--------------|---------------------|--------------|
| `300` | `44` (da la vuelta) | `255` (satura) | — |
| `-3` | `253` | `0` | — |
| `3.7` | `3` (trunca) | `4` (redondea) | `4` |
| `2.5` | `2` | `2` (al par) | `3` (hacia arriba) |

`Uint8ClampedArray` redondea los `.5` **al número par más cercano** (*round half to even*), la regla de IEEE 754 que evita que los redondeos se acumulen siempre hacia arriba. `Math.round` lleva los `.5` hacia arriba. Las dos reglas son razonables; el problema es mezclarlas sin saberlo.

> **Desde Python:** `round(2.5)` es `2` en Python 3, porque también redondea al par: coincide con `Uint8ClampedArray` y no con `Math.round`. Y numpy da la vuelta como `Uint8Array`: `np.array([250], dtype=np.uint8) + 60` es `array([54], dtype=uint8)`.

## Los métodos de array, con matices

Los typed arrays tienen casi todos los métodos de los arrays que no cambian el tamaño: `map`, `filter`, `forEach`, `reduce`, `find`, `includes`, `sort`, `join`, `at`… Con una diferencia que se olvida: `map`, `filter` y `slice` devuelven **otro typed array del mismo tipo**, así que sus resultados también se recortan al guardarse.

[[exercise:08-map-devuelve-un-typed-array.md-]]

```text
🐛 × 2 → Uint8Array(3) [180, 24, 164]
🐛 en % → Uint8Array(3) [35, 54, 82]
filter → Uint8Array(2) [140, 210]
✅ × 2 → (3) [180, 280, 420]
✅ en % → (3) [35, 55, 82]
✅ spread → (3) [180, 280, 420]
🐛 JSON → {"sensor":"sala-2","readings":{"0":90,"1":140,"2":210}}
✅ JSON → {"sensor":"sala-2","readings":[90,140,210]}
Array sort → (3) [100, 25, 9] | Uint8Array sort → Uint8Array(3) [9, 25, 100]
```

Cuando el resultado ya no es un byte (porcentajes, sumas, textos), sal del typed array con `Array.from(typed, función)` o `[...typed]`. Lo mismo antes de `JSON.stringify`, que no conoce los typed arrays y los convierte en un objeto con claves `"0"`, `"1"`… La parte buena: `sort()` de un typed array ordena por valor numérico, sin necesidad de función de comparación.

## Copiar y juntar con `set`

`destino.set(origen, posición)` copia los elementos de `origen` (un typed array o un array normal) dentro de `destino`, a partir de `posición`. Es la forma de juntar trozos: reservar un bloque del tamaño total y copiar cada trozo en su sitio, que es lo que hace por dentro `response.arrayBuffer()` con los trozos que llegan por la red.

[[exercise:09-juntar-trozos-con-set.md-]]

```text
14 bytes → 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48
¿empieza por «PNG»? → PNG
header → 42 4d 00 00 00 00
header.set(4 bytes, 4) → RangeError | offset is out of bounds
fill + copyWithin → 42 4d ff ff 42 4d
```

## Búferes que crecen y búferes que se mudan

Dos novedades recientes del `ArrayBuffer` preparan el terreno para los módulos siguientes. Un búfer **redimensionable** se crea con `{ maxByteLength }` y cambia de tamaño con `resize()`, conservando sus bytes; una vista creada sin longitud lo sigue (*length-tracking*). Y `transfer()` **mueve** los bytes a un búfer nuevo: el viejo queda **desconectado** (*detached*), con `byteLength` `0`, y sus vistas, vacías.

[[exercise:10-buffers-redimensionables-y-transfer.md-]]

```text
resizable → true | byteLength → 4 | máximo → 16
tras resize(8) → tracking Uint8Array(8) [1, 2, 3, 4, 0, 0, 0, 0] | fixed Uint8Array(2) [1, 2]
resize(32) → RangeError | ArrayBuffer.prototype.resize: Invalid length parameter
nuevo → ArrayBuffer(8) | bytes → Uint8Array(8) [1, 2, 3, 4, 0, 0, 0, 0]
viejo → ArrayBuffer(0) | detached → true
vista vieja → 0 undefined
```

¿Para qué mover en lugar de copiar? Porque un búfer de 50 MB se puede entregar a otro hilo sin copiar sus bytes: es lo que pasa al **transferir** un búfer a un worker, y el original queda vacío igual que aquí (módulo «Workers y concurrencia»). La memoria de un módulo de WebAssembly también es un `ArrayBuffer` que crece, y las vistas que creaste antes de que creciera se quedan obsoletas (módulo «WebAssembly»).

## Bestiario

- **Modificas «una copia» y cambia el original.**
  Síntoma: después de procesar un trozo de un typed array, el array original también ha cambiado.
  Causa: `subarray` no copia: devuelve otra vista sobre la misma memoria.
  Solución: `slice` para trozos que vas a modificar o guardar; `subarray` solo para leer sin copiar.
  → [ver ejemplo](04-subarray-comparte-memoria.md)
- **`RangeError: start offset of Uint32Array should be a multiple of 4`.**
  Síntoma: crear una vista de 16, 32 o 64 bits sobre un búfer lanza `RangeError` (también «byte length … should be a multiple of 4»).
  Causa: las vistas de más de un byte tienen que empezar alineadas y cubrir un número entero de elementos.
  Solución: copia los bytes a un búfer nuevo (`buffer.slice(offset)`) o lee los campos con `DataView`.
  → [ver ejemplo](05-vistas-desalineadas.md)
- **`u8[0] = 300` guarda `44`.**
  Síntoma: valores absurdos, píxeles claros que se vuelven negros, contadores que vuelven a cero; ningún error.
  Causa: los typed arrays de enteros guardan solo los bits que caben (módulo 2⁸, 2¹⁶…) y truncan los decimales.
  Solución: comprueba o recorta el valor antes de guardarlo (`Math.min`/`Math.max`), o usa `Uint8ClampedArray` para píxeles.
  → [ver ejemplo](06-desbordamiento-silencioso.md)
- **`Uint8ClampedArray` guarda `2.5` como `2`.**
  Síntoma: un filtro de imagen difiere en 1 de lo calculado con `Math.round` justo en los valores `.5`.
  Causa: `Uint8ClampedArray` redondea los `.5` al par; `Math.round`, hacia arriba.
  Solución: redondea tú antes de guardar o compara con una tolerancia de 1.
  → [ver ejemplo](07-uint8clampedarray-satura.md)
- **`map` que se desborda y JSON con claves `"0"`, `"1"`.**
  Síntoma: `bytes.map(x => x * 2)` da valores pequeños y sin decimales; `JSON.stringify` produce `{"0":90,"1":140}`.
  Causa: `map`, `filter` y `slice` devuelven el mismo tipo de typed array; JSON no conoce los typed arrays.
  Solución: `Array.from(typed, fn)` o `[...typed]` para salir a un `Array` normal.
  → [ver ejemplo](08-map-devuelve-un-typed-array.md)

## Resumen

- Un `ArrayBuffer` son bytes sin interpretar; una vista (typed array) dice cómo leerlos: tipo y tamaño de cada elemento.
- Los typed arrays tienen tamaño fijo, un solo tipo numérico y sus elementos seguidos en memoria; no son `Array`.
- Varias vistas pueden compartir un búfer; `subarray` comparte memoria y `slice` copia.
- Las vistas de 2, 4 u 8 bytes deben empezar alineadas; `byteOffset`/`byteLength` en bytes, `length` en elementos.
- Los enteros que no caben dan la vuelta sin avisar; `Uint8ClampedArray` satura y redondea al par.
- `map`/`filter` devuelven el mismo typed array: `Array.from(typed, fn)` para salir; `set` copia y junta trozos.
- Los búferes pueden crecer (`resize`) y mudarse (`transfer`, que deja el original desconectado).

## Para profundizar

- [MDN: Typed arrays en JavaScript (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays)
- [MDN: ArrayBuffer (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)
- [javascript.info: ArrayBuffer, arrays binarios](https://es.javascript.info/arraybuffer-binary-arrays)
- [Documentación de Python: memoryview](https://docs.python.org/es/3/library/stdtypes.html#memoryview)
- [V8: ArrayBuffers redimensionables (en inglés)](https://v8.dev/features/resizable-array-buffer)
