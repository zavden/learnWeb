# DataView y endianness

## Por qué importa

Un archivo de imagen, un sonido, un paquete de red o un módulo de WebAssembly tienen algo en común: son **formatos binarios**. Empiezan con una cabecera donde cada campo ocupa una posición y un tamaño fijos («bytes 18 a 21: el ancho, entero de 32 bits con signo»), mezclan tipos distintos y casi nunca respetan la alineación de la lección anterior. Un typed array no sirve para leerlos: lee un solo tipo, alineado y en el orden de bytes de tu máquina.

Para eso está **`DataView`**: una vista que lee y escribe **cualquier tipo en cualquier posición**, y en el **orden de bytes** que tú digas. Ese orden, la *endianness*, es la segunda mitad de la lección y la fuente de su error más común. Al final leerás las cabeceras de un PNG y de un BMP de verdad (están en los `assets/` de esta lección) y escribirás un BMP desde cero. En la lección «Peticiones con fetch» viste que `arrayBuffer()` servía para «formatos binarios»: aquí lo usarás para eso.

## `DataView`: cualquier tipo, en cualquier posición

`new DataView(buffer, byteOffset?, byteLength?)` se crea sobre un `ArrayBuffer`, como cualquier vista. En lugar de índices, tiene un par de métodos por tipo, y la posición se da siempre **en bytes**:

| Lectura | Escritura | Tamaño |
|---------|-----------|--------|
| `getInt8(pos)`, `getUint8(pos)` | `setInt8(pos, v)`, `setUint8(pos, v)` | 1 byte |
| `getInt16(pos, le)`, `getUint16(pos, le)` | `setInt16(pos, v, le)`, `setUint16(pos, v, le)` | 2 bytes |
| `getInt32(pos, le)`, `getUint32(pos, le)` | `setInt32(pos, v, le)`, `setUint32(pos, v, le)` | 4 bytes |
| `getFloat32(pos, le)`, `getFloat64(pos, le)` | `setFloat32(pos, v, le)`, `setFloat64(pos, v, le)` | 4 y 8 bytes |
| `getBigInt64(pos, le)`, `getBigUint64(pos, le)` | `setBigInt64(pos, v, le)`, `setBigUint64(pos, v, le)` | 8 bytes (`BigInt`) |

(En Chrome hay también `getFloat16`/`setFloat16`.) El último argumento, `le`, es `true` para *little-endian*; enseguida verás por qué importa. Con todo eso se puede describir un registro binario campo a campo, como el `struct` de C o de Python:

[[exercise:01-dataview-un-registro-binario.md-]]

```text
view → DataView(12)
bytes → 05 02 00 00 ac 41 40 fd 08 ae cf 6a
estación → 517
temperatura → 21.5
humedad → 64 | ajuste → -3
el mismo byte 7 como Uint8 → 253
fecha → 2026-10-14T16:30:00.000Z
getUint32(10) → RangeError | Offset is outside the bounds of the DataView
```

Fíjate en dos diferencias con los typed arrays: el float32 de la temperatura empieza en el byte 2, sin alinear, y leer fuera del búfer lanza un `RangeError` en lugar de devolver `undefined` en silencio. Para un parser, el error es una ventaja: un archivo cortado se detecta en el acto.

> **Desde Python:** `DataView` es el módulo `struct`. `struct.pack('<HfBbI', …)` escribe el mismo registro de 12 bytes de una vez, y `struct.unpack('<HfBbI', datos)` lo lee. Cada letra es un tipo (`B`/`b` byte sin/con signo, `H`/`h` 16 bits, `I`/`i` 32, `Q`/`q` 64, `e` float16, `f` float32, `d` float64) y el primer carácter es el orden: `<` little-endian, `>` big-endian, `!` orden de red (big-endian). `struct.unpack_from(formato, datos, offset)` lee desde una posición, como `getUint32(offset)`.

## 🐛 El orden de los bytes: *endianness*

Un número de varios bytes se puede guardar en dos órdenes. En **big-endian**, el byte más significativo va primero, como escribimos los números. En **little-endian**, el menos significativo va primero:

```text
0x12345678          posición:  0   1   2   3
big-endian                     12  34  56  78   ← como se escribe
little-endian                  78  56  34  12   ← «al revés»
```

Los nombres vienen de *Los viajes de Gulliver*, donde dos países guerrean por si el huevo se rompe por el extremo grande o por el pequeño: una elección arbitraria, defendida con pasión. Cada procesador y cada formato eligió la suya:

| Little-endian | Big-endian |
|---------------|------------|
| las CPU x86 y ARM (tu ordenador y tu móvil) | los protocolos de red («orden de red») |
| la memoria de WebAssembly y los búferes de WebGPU | PNG, JPEG, MP4, MIDI |
| BMP, WAV, ZIP, GIF | los archivos `.class` de Java |

Los typed arrays usan el orden **de la máquina**, que en la práctica siempre es little-endian (las máquinas big-endian que siguen en uso, como los mainframes de IBM, no ejecutan navegadores). `DataView`, en cambio, usa **big-endian si no le pasas el tercer argumento**. Así, los mismos cuatro bytes dan números distintos según quién los lea, y nadie da un error:

[[exercise:02-big-endian-por-defecto.md-]]

```text
Uint16Array [1] en bytes → 01 00 → little-endian
Uint32Array escribe → 78 56 34 12
🐛 getUint32(0) → 78563412
✅ getUint32(0, true) → 12345678
🐛 setUint16(0, 2026) → bytes 07 ea → Uint16Array lee 59911
✅ setUint16(0, 2026, true) → bytes ea 07 → Uint16Array lee 2026
```

La primera línea es la prueba clásica para saber el orden de la máquina: escribir un `1` de 16 bits y mirar si el primer byte es `01`. La regla para no fallar nunca: con `DataView`, escribe **siempre** el tercer argumento, también cuando es `false`, para que quien lea el código sepa qué orden espera el formato. Y si mezclas `DataView` con typed arrays sobre el mismo búfer (lo harás con WebAssembly), usa `true`.

## Mirar los bytes: el volcado hexadecimal

Antes de escribir un parser, se mira el archivo. Un **volcado hexadecimal** (*hexdump*) lo muestra en filas de 16 bytes: la posición, los bytes en hexadecimal y, a la derecha, los mismos bytes como texto ASCII, con un punto para los que no son imprimibles. Los nombres y las firmas de un formato saltan a la vista:

[[exercise:03-volcado-hexadecimal.md-]]

```text
tile.png → 155 bytes
00000000  89 50 4e 47 0d 0a 1a 0a  00 00 00 0d 49 48 44 52  |.PNG........IHDR|
00000010  00 00 00 08 00 00 00 08  08 02 00 00 00 4b 6d 29  |.............Km)|
00000020  dc 00 00 00 19 74 45 58  74 54 69 74 6c 65 00 41  |.....tEXtTitle.A|
00000030  7a 75 6c 65 6a 6f 20 64  65 20 54 61 6c 61 76 65  |zulejo de Talave|
00000040  72 61 3d 2f fc 1f 00 00  00 3d 49 44 41 54 78 9c  |ra=/.....=IDATx.|
```

Es la misma vista que dan `xxd archivo` o `hexdump -C archivo` en una terminal, y el panel de memoria de las DevTools. Los archivos de esta lección son diminutos a propósito (155 y 174 bytes): ábrelos con el botón «Assets». El script `generate-samples.mjs` que los generó también está ahí, y usa lo mismo que esta lección.

## Leer un formato real: PNG

Un PNG es una firma de 8 bytes seguida de **fragmentos** (*chunks*), todos con la misma forma: longitud (4 bytes), tipo (4 letras ASCII), datos y un código de comprobación CRC-32 (4 bytes). Todos los números van en **big-endian**. El primer fragmento es siempre `IHDR`, con el ancho, el alto y el formato de los píxeles; los píxeles van comprimidos en uno o varios `IDAT`, y `IEND` cierra el archivo.

```text
89 50 4e 47 0d 0a 1a 0a | 00 00 00 0d  49 48 44 52  [13 bytes]  [CRC] | … | 00 00 00 00  49 45 4e 44  [CRC]
        firma            |  longitud    «IHDR»        datos             |   |  longitud 0  «IEND»
```

La firma está pensada para detectar archivos estropeados: `89` no es ASCII (falla si algo transmite solo 7 bits), `0d 0a` y `0a` fallan si algo convierte los saltos de línea, y `1a` detiene el comando `type` de MS-DOS.

[[exercise:04-cabecera-png.md]]

```text
firma PNG → true
IHDR (13 bytes)
tEXt (25 bytes)
IDAT (61 bytes)
IEND (0 bytes)
ancho → 8
alto → 8
bits por canal → 8
tipo de color → 2 (RGB)
Title → Azulejo de Talavera
```

Recorrer los fragmentos sin entender todos es la clave de los formatos extensibles: el lector salta los que no conoce usando su longitud. Así un PNG puede llevar metadatos, perfiles de color o animación (APNG) sin romper los lectores antiguos.

## Leer otro formato: BMP

BMP, el formato de imagen de Windows, es el más sencillo que existe: una cabecera de 54 bytes y los píxeles sin comprimir. Al ser de Windows (CPU x86), todo va en **little-endian**:

| Posición | Tamaño | Campo |
|----------|--------|-------|
| 0 | 2 | firma `'BM'` |
| 2 | 4 | tamaño del archivo |
| 10 | 4 | posición de los píxeles |
| 14 | 4 | tamaño de la cabecera de imagen (40) |
| 18 | 4 | ancho (con signo) |
| 22 | 4 | alto (con signo) |
| 28 | 2 | bits por píxel (24: 3 bytes por píxel) |

[[exercise:05-cabecera-bmp.md-]]

```text
{signature: 'BM', fileSize: 174, pixelOffset: 54, headerSize: 40, width: 7, height: 5, bitsPerPixel: 24, compression: 0}
¿tamaño correcto? → true
bytes útiles por fila → 21 | con relleno → 24
píxeles → 120 bytes desde la posición 54
ancho leído en big-endian → 117440512
```

Un ancho de 117 millones de píxeles es la firma típica de un orden de bytes equivocado: `07 00 00 00` leído al revés. Y comprueba siempre lo que dice la cabecera contra lo que tienes (`fileSize` frente a `byteLength`): un parser que se fía de un archivo malicioso es la puerta de entrada de muchos fallos de seguridad.

### 🐛 El relleno de las filas

La cabecera esconde una regla que no está en ningún campo: cada **fila** de píxeles ocupa un **múltiplo de 4 bytes**. Una imagen de 7 píxeles de ancho a 3 bytes por píxel tiene 21 bytes útiles por fila, pero cada fila ocupa 24: los 3 últimos son **relleno** (*padding*). Es la alineación de la lección anterior, aplicada a las filas, y la verás de nuevo en las texturas de WebGL y WebGPU. Un decodificador que la olvida empieza cada fila unos bytes antes de lo debido:

[[exercise:06-relleno-de-filas-bmp.md]]

```text
bytes por fila → 🐛 21 | ✅ 24
🐛 fila de arriba → #7dd3fc #7dd3fc #7dd3fc #000000 #7dd3fc #7dd3fc #7dd3fc
✅ fila de arriba → #7dd3fc #7dd3fc #7dd3fc #7dd3fc #7dd3fc #facc15 #7dd3fc
```

Con 3 bytes de relleno, el desfase es exactamente un píxel por fila y la imagen sale inclinada; con 1 o 2 bytes, los canales se mezclan y salen colores absurdos. El fallo no aparece en las imágenes cuyo ancho × 3 ya es múltiplo de 4 (4, 8, 12… píxeles), así que pasa las pruebas con imágenes «redondas».

### 🐛 La altura negativa

Los BMP guardan las filas **de abajo arriba**: la primera fila del archivo es la de abajo de la imagen. Pero el formato permite lo contrario, y lo indica con una **altura negativa**: `-5` significa «5 filas, de arriba abajo». Un decodificador que lee la altura sin signo obtiene un número absurdo, y uno que la lee bien pero ignora el signo pinta la imagen boca abajo:

[[exercise:07-altura-negativa-bmp.md]]

```text
altura con getUint32 → 4294967291
altura con getInt32 → -5
🐛 fila de arriba → #16a34a #16a34a #16a34a #16a34a #16a34a #16a34a #16a34a
✅ fila de arriba → #7dd3fc #7dd3fc #7dd3fc #7dd3fc #7dd3fc #facc15 #7dd3fc
```

`4294967291` es `-5` leído como entero sin signo: el complemento a dos de la lección «Bits y bytes». La regla general: comprueba en la especificación si cada campo tiene signo, y elige `getInt32` o `getUint32` en consecuencia.

## Un lector con cursor

Escribir `view.getUint32(18, true)` con posiciones a mano es frágil: un byte mal contado y todo lo que sigue sale mal. Los parsers de verdad usan un **cursor**: un objeto que recuerda la posición y avanza solo con cada lectura. El código queda como la especificación del formato, campo a campo, y un archivo cortado se detecta con un mensaje claro:

[[exercise:08-lector-con-cursor.md-]]

```text
BMP → {signature: 'BM', fileSize: 174, pixelOffset: 54, headerSize: 40, width: 7, height: 5, planes: 1, bitsPerPixel: 24}
cursor en → 30 | quedan → 144
PNG → IHDR 13 bytes: 8 × 8 | cursor en 24
archivo cortado → RangeError | faltan bytes: pides 4 en la posición 18 y quedan 2
```

En el módulo de WebAssembly leerás un módulo `.wasm` con un lector como este: sus secciones también son «tipo, longitud, datos».

## Escribir un archivo binario

Escribir es el camino inverso: reservar un `ArrayBuffer` del tamaño exacto, rellenar la cabecera con `set…` y copiar los píxeles en su sitio. Como el búfer nace a ceros, el relleno de las filas ya está hecho. Para que el navegador pueda mostrar o descargar esos bytes, se envuelven en un **`Blob`** (bytes con un tipo MIME) y se les da una dirección con `URL.createObjectURL`: los dos se estudian a fondo en la lección siguiente.

[[exercise:09-escribir-un-bmp.md]]

```text
atardecer.bmp → 1894 bytes (30 × 20, filas de 92 bytes) · empieza por 42 4d 66 07 00 00
Listo: el <img> muestra el archivo; «Descargar» lo guarda
// Tras pulsar «Descargar atardecer.bmp» (en el editor o con ▶):
Descarga: atardecer.bmp
```

Fíjate en los bytes 2 a 5, `66 07 00 00`: es `0x0766`, 1894, el tamaño del archivo en little-endian. Ningún paso necesita una librería: un formato binario es solo una lista de campos, y con `DataView` puedes leer o escribir cualquiera cuya especificación tengas.

## Bestiario

- **`DataView` lee otro número.**
  Síntoma: un valor leído con `DataView` sale enorme o con los bytes al revés (`0x78563412` en lugar de `0x12345678`); lo que escribe `DataView` lo lee mal un typed array.
  Causa: `DataView` usa big-endian si no le pasas el tercer argumento; los typed arrays usan el orden de la máquina, little-endian.
  Solución: escribe siempre el tercer argumento (`true` para little-endian) según lo que diga el formato.
  → [ver ejemplo](02-big-endian-por-defecto.md)
- **Un BMP inclinado o con colores absurdos.**
  Síntoma: la imagen decodificada sale torcida, con una diagonal negra, o con los colores mezclados; solo con ciertos anchos.
  Causa: cada fila de un BMP ocupa un múltiplo de 4 bytes, con relleno al final.
  Solución: `rowSize = Math.ceil((width * bytesPorPíxel) / 4) * 4` y cada fila empieza en `pixelOffset + fila * rowSize`.
  → [ver ejemplo](06-relleno-de-filas-bmp.md)
- **Un BMP boca abajo, o un bucle de 4 mil millones de filas.**
  Síntoma: algunas imágenes BMP salen invertidas, o la altura leída es `4294967291`.
  Causa: la altura es un entero con signo; negativa significa filas de arriba abajo.
  Solución: `getInt32` para la altura, `Math.abs` para el número de filas y el signo para el orden.
  → [ver ejemplo](07-altura-negativa-bmp.md)

## Resumen

- `DataView` lee y escribe cualquier tipo en cualquier posición (en bytes), sin alineación, y lanza `RangeError` fuera del búfer.
- *Endianness*: big-endian guarda primero el byte más significativo; little-endian, el menos. Cada formato elige el suyo.
- Los typed arrays usan el orden de la máquina (little-endian); `DataView`, big-endian por defecto: pasa siempre el tercer argumento.
- PNG: firma + fragmentos (longitud, tipo, datos, CRC) en big-endian; BMP: cabecera de 54 bytes en little-endian.
- Los BMP rellenan cada fila hasta un múltiplo de 4 bytes y usan la altura negativa para las filas de arriba abajo.
- Un lector con cursor convierte la especificación en código; un `ArrayBuffer` + `DataView` + `Blob` escriben cualquier archivo.

## Para profundizar

- [MDN: DataView (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView)
- [MDN: Endianness (en inglés)](https://developer.mozilla.org/en-US/docs/Glossary/Endianness)
- [W3C: especificación de PNG (en inglés)](https://www.w3.org/TR/png-3/)
- [Wikipedia: el formato BMP (en inglés)](https://en.wikipedia.org/wiki/BMP_file_format)
- [Documentación de Python: struct](https://docs.python.org/es/3/library/struct.html)
