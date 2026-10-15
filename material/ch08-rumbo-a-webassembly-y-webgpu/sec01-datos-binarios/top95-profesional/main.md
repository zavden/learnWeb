# Ejemplos profesionales: datos binarios

## Por qué importa

Detrás de cada imagen, cada sonido, cada partida guardada y cada archivo que una página abre o genera hay un formato binario: una lista de campos con su tamaño, su orden de bytes y sus reglas. Esta página reúne doce herramientas que trabajan directamente con esos bytes, escritas como en un proyecto real con todo lo que has visto en el curso: HTML, CSS, el lenguaje JavaScript, el DOM, los eventos, los formularios, la red y el almacenamiento del capítulo 6, y este módulo.

Usan los archivos pequeños de `assets/` (`tile.png`, `landscape.bmp`, `chime.wav` y `air-quality.csv`, unos datos sintéticos de calidad del aire) y, cuando tiene sentido, un archivo que elijas tú, que **nunca sale de tu navegador**. Nada genera sonido ni descarga nada hasta que lo pides. Las descargas, `history.replaceState` y el almacenamiento persistente solo funcionan con «▶ Run» o en el editor: en una tarjeta de la teoría (un iframe aislado, de origen `null`) no hay descargas, el historial no se puede tocar y el almacenamiento es una simulación en memoria, y cada ejemplo lo dice en su página. Lee primero el bloque de comentarios del principio de cada script, que explica las decisiones de diseño.

## Qué tienen en común

- **Lo que viene de fuera se valida antes de usarlo.** Firma, versión, cada longitud contra los bytes que quedan y, si el formato lo trae, el CRC. Un archivo cortado, dañado o malicioso da un mensaje claro, nunca una lectura a medias ni una excepción suelta.
- **Primero el tamaño, luego los bytes.** Para escribir, se calcula el tamaño exacto (textos ya codificados, filas con relleno, columnas alineadas), se reserva un `ArrayBuffer` y se rellena con `DataView`, con el tercer argumento siempre escrito.
- **Leer sin copiar cuando se puede.** `subarray`, vistas sobre el mismo búfer y `file.slice()` para leer solo el principio de un archivo grande; `slice` solo cuando hace falta una copia.
- **El texto, siempre por bytes.** `TextEncoder`/`TextDecoder` (con `fatal: true` al leer datos que deberían ser UTF-8), base64 desde bytes (`toBase64` en Chrome, con una alternativa) y nunca `btoa` con texto.
- **Cada byte en su sitio y con su nombre.** Las máscaras y desplazamientos llevan paréntesis, los enteros de 32 bits sin signo pasan por `>>> 0` o por un `Uint32Array`, y los decimales que se guardan en float32 se comparan con `Math.fround`.
- **Accesibles con teclado.** Las rejillas (bytes, asientos, píxeles) usan un único elemento enfocable que se mueve con las flechas; los estados se dicen en palabras en regiones `role="status"`, no solo con color.
- **Poca carga.** Nada pesado al cargar: los WAV se generan al pulsar, los archivos grandes se leen por trozos o solo su cabecera, y las URL de objeto se liberan cuando dejan de hacer falta.

## Visor hexadecimal accesible

**Objetivo:** mirar los bytes de un archivo e interpretar los de cualquier posición. **Técnicas:** una rejilla ARIA de 16 columnas con tabindex itinerante (flechas, Inicio/Fin, AvPág/RePág, Ctrl o ⌘ + Inicio/Fin), páginas de 256 bytes hechas con `subarray`, y un inspector que lee con `DataView` cada tipo entero y float32 en los dos órdenes de bytes, con «—» cuando no quedan bytes. De un archivo propio se leen como mucho 4 MB con `file.slice()`. **Fíjate en:** la posición `0x0010` de `tile.png`: como u32 big-endian es `8`, el ancho de la imagen; como little-endian, 134 millones.

[[exercise:01-visor-hexadecimal-accesible.md]]

```text
📄 tile.png · 155 bytes
📍 0x0010 → u8 0 · u16 LE 0 / BE 0 · u32 LE 134217728 / BE 8
Listo: entra en la rejilla con Tab y muévete con las flechas, o elige otro archivo
// Tras pulsar Tab hasta la rejilla y luego ↓:
📍 0x0020 → u8 220 · u16 LE 220 / BE 56320 · u32 LE 220 / BE 3690987520
// Tras Fin (el final de la fila):
📍 0x002f → u8 65 · u16 LE 31297 / BE 16762 · u32 LE 1819638337 / BE 1098544492
// Tras elegir chime.wav en «Archivo de ejemplo»:
📄 chime.wav · 9644 bytes
📍 0x0000 → u8 82 · u16 LE 18770 / BE 21065 · u32 LE 1179011410 / BE 1380533830
```

## Inspector de archivos

**Objetivo:** decir qué es un archivo por sus bytes, no por su nombre. **Técnicas:** solo los primeros 256 KB (`file.slice(0, LIMIT).arrayBuffer()`); firmas de doce formatos (PNG, JPEG, GIF, WebP, BMP, WAV, MP3, MP4, PDF, ZIP, gzip y WebAssembly) y, para cada uno, sus datos de cabecera: medidas de PNG, GIF, BMP y WebP, los segmentos de un JPEG hasta su `SOF`, los fragmentos RIFF de un WAV (canales, muestreo, duración) o el primer archivo de un ZIP (un `.docx` es un ZIP con `[Content_Types].xml`). **Fíjate en:** el botón «foto-de-perfil.jpg» crea un `File` con nombre y tipo de JPEG y los bytes de un PNG: el inspector avisa. Solo avisa cuando el nombre o el tipo dicen *otro formato conocido*, para no protestar por tipos MIME raros pero correctos.

[[exercise:02-inspector-de-archivos.md]]

```text
🔎 tile.png → Es un PNG · medidas: 8 × 8 px · color: 8 bits por canal, RGB · textos: Title
Listo: elige un archivo tuyo o prueba con chime.wav y con «foto-de-perfil.jpg»
// Tras pulsar «chime.wav»:
🔎 chime.wav → Es un WAV · formato: PCM sin comprimir · canales: mono · muestreo: 16000 Hz, 16 bits · duración: 0.30 s
// Tras pulsar «foto-de-perfil.jpg»:
🔎 foto-de-perfil.jpg → ⚠️ Los bytes dicen PNG, pero la extensión dice .jpg y el tipo MIME dice image/jpeg · medidas: 8 × 8 px · color: 8 bits por canal, RGB · textos: Title
```

## Metadatos de un PNG

**Objetivo:** leer y escribir los textos de un PNG (título, autor, licencia) sin tocar la imagen. **Técnicas:** recorrido de fragmentos con validación (firma, límites, `IHDR` primero, CRC-32 de cada uno); textos `tEXt` (Latin-1) e `iTXt` (UTF-8); escritura por reconstrucción: firma + `IHDR` + el texto nuevo + el resto, quitando el texto anterior con la misma clave; y el resultado se vuelve a analizar antes de ofrecerlo. **Fíjate en:** un valor con «€» no cabe en Latin-1, así que se escribe como `iTXt`; el tamaño crece en 35 bytes con «Taller de Puebla» (12 de estructura + 23 de texto).

[[exercise:03-metadatos-png.md]]

```text
🖼️ tile.png · 155 bytes · 4 fragmentos, CRC correctos: 4/4
📝 Title = Azulejo de Talavera (tEXt)
Listo: elige «Author», escribe «Taller de Puebla» y pulsa «Guardar en el PNG»; prueba también un valor con «€»
// Tras elegir «Author», escribir «Taller de Puebla» y pulsar «Guardar en el PNG»:
💾 tEXt Author = Taller de Puebla → 190 bytes (+35) · 5 fragmentos, CRC correctos: 5/5
// Tras elegir «Comment», escribir «Precio: 450 € (pieza única)» y guardar:
💾 iTXt Comment = Precio: 450 € (pieza única) → 244 bytes (+54) · 6 fragmentos, CRC correctos: 6/6
```

## Partida guardada

**Objetivo:** el formato de guardado de un juego: compacto, versionado y a prueba de daños. **Técnicas:** firma `LWSV`, versión, fecha `u32`, campos de 8 y 32 bits, posición en float32, logros en una máscara de 16 bits, nombre UTF-8 con su longitud delante y un CRC-32 al final; base64 en `localStorage` (clave `lw-bin-partida`, con su botón para borrarla); la versión 1 se sigue leyendo y se migra recalculando los logros. **Fíjate en:** «Simular un byte dañado» cambia un solo bit de las monedas y la carga se rechaza entera: el juego nunca queda a medio cargar. El CRC detecta daños, no trampas; para eso haría falta una firma criptográfica.

[[exercise:04-partida-guardada.md]]

```text
Listo: pulsa «Recoger 25 monedas» y «Guardar»; luego «Simular un byte dañado» y «Cargar»; y prueba «Cargar una partida de la versión 1»
// Tras pulsar «Recoger 25 monedas» y «Guardar»:
🎮 nivel 1 · 25 monedas · (0.00, 0.00) · 🏆 Primeras monedas
💾 guardada: 38 bytes → 52 caracteres en base64
// Tras «Simular un byte dañado» y «Cargar»:
🔧 un bit cambiado en el byte 11 (las monedas)
❌ guardada: la partida está dañada (el CRC no coincide)
// Tras «Cargar una partida de la versión 1»:
📂 versión 1: 33 bytes · Itzel · nivel 4 · 130 monedas · ⬆️ migrada de la versión 1
// Tras «Borrar la partida guardada»:
🗑️ partida borrada
```

## Mapa de asientos

**Objetivo:** elegir asientos en una sala de cine y compartir la selección por enlace. **Técnicas:** 96 asientos en 12 bytes: ocupación y selección son dos `Uint8Array` usados como conjuntos de bits (`index >> 3`, `1 << (index & 7)`); el conteo apaga bits con `n & (n - 1)`; la selección viaja en `?asientos=` como base64url de 16 caracteres, escrita con `replaceState` solo al pulsar y dentro de `try/catch`; al cargar se valida y se le quitan los asientos ya ocupados con `selección & ~ocupados`. Rejilla con flechas y asientos ocupados con `aria-disabled`, para que se puedan recorrer y oír. **Fíjate en:** abre el ejemplo con ↗, elige asientos, pulsa el botón y recarga: la selección vuelve desde la dirección.

[[exercise:05-mapa-de-asientos.md]]

```text
🎬 96 asientos en 12 bytes · ocupados 23 · libres 73 · sin selección compartida en el enlace
Listo: elige E8 y E9 (con el ratón o con Tab y las flechas) y pulsa «Poner mi selección en el enlace»
// Tras pulsar E8, E9 y E7 (ocupado):
➕ E8 · 1 asiento(s) · $85.00
➕ E9 · 2 asiento(s) · $170.00
⛔ E7 está ocupado
// Tras «Poner mi selección en el enlace» (con ▶ o en el editor):
🔗 ?asientos=AAAAAAAAgAEAAAAA (12 bytes → 16 caracteres)
```

## Inspector de UTF-8

**Objetivo:** ver un texto como lo ve cada capa (grafemas, code points, UTF-16, bytes) y explicar por qué unos bytes no son UTF-8. **Técnicas:** `Intl.Segmenter`, `[...texto]`, `length` y `TextEncoder` para los cuatro tamaños; los bits de cada byte con su marca (`110|`, `10|`…) resaltada y separada; un validador que implementa paso a paso el decodificador UTF-8 del estándar Encoding y da el motivo de cada error (byte imposible, continuación suelta, forma demasiado larga, sustituto, más allá de U+10FFFF, secuencia incompleta). **Fíjate en:** la última comprobación compara con `TextDecoder`: el validador produce exactamente los mismos `U+FFFD`, también con las secuencias más retorcidas.

[[exercise:06-inspector-utf8.md]]

```text
📝 «Año 2026 · ¡olé! 🎸👍🏽» → 19 grafemas · 20 code points · 23 unidades UTF-16 · 33 bytes UTF-8
🔢 17 bytes → 4 carácter(es) y 6 error(es): byte que nunca aparece en UTF-8, continuación suelta, sustituto UTF-16 (U+D800-U+DFFF), continuación suelta, continuación suelta, secuencia incompleta al final · ✅ igual que TextDecoder
Listo: escribe otro texto o cambia los bytes (por ejemplo, e0 80 80 o f4 90 80 80) y pulsa Tab
// Tras escribir «e0 80 80 f4 90 80 80» en los bytes y pulsar Tab:
🔢 7 bytes → 0 carácter(es) y 7 error(es): forma demasiado larga (overlong), continuación suelta, continuación suelta, por encima de U+10FFFF, continuación suelta, continuación suelta, continuación suelta · ✅ igual que TextDecoder
```

## Enteros LEB128

**Objetivo:** el formato de enteros de tamaño variable de WebAssembly, Protocol Buffers y DWARF. **Técnicas:** `BigInt` para llegar a 64 bits; grupos de 7 bits del menos al más significativo con el bit de continuación arriba; con signo, `>>` (que en `BigInt` conserva el signo) y el bit 6 del último byte; decodificación que rechaza secuencias cortadas y de más de 10 bytes; y una comparación de tamaños con 1000 identificadores guardados como diferencias. **Fíjate en:** al escribir `-123456` y salir del campo, primero se valida como «sin signo» (y falla); al marcar «con signo», da `c0 bb 78`. En el módulo de WebAssembly leerás estos mismos bytes dentro de un `.wasm`.

[[exercise:07-varint-leb128.md]]

```text
u 300 → ac 02
u 624485 → e5 8e 26
u 4294967295 → ff ff ff ff 0f
i -1 → 7f
i 63 → 3f
i 64 → c0 00
i -123456 → c0 bb 78
⛔ cortada → RangeError: secuencia cortada: el último byte pide continuación
⛔ demasiado larga → RangeError: más de 10 bytes: no es un entero de 64 bits
📦 1000 ids: Uint32Array 4000 B · LEB128 2649 B · LEB128 de las diferencias 1094 B
🔢 624485 → e5 8e 26 (3 bytes) · decodificado: 624485 ✅
Listo: escribe -123456 y marca «con signo»; prueba también 128 y 18446744073709551615
// Tras escribir -123456 y marcar «con signo»:
🔢 ⚠️ un LEB128 sin signo no admite negativos
🔢 -123456 → c0 bb 78 (3 bytes) · decodificado: -123456 ✅
```

## Un sensor en float16

**Objetivo:** elegir cómo guardar un día de lecturas de temperatura según el error que se puede tolerar. **Técnicas:** cinco codificaciones con su par codificar/decodificar sobre typed arrays (`Float64Array`, `Float32Array`, `Float16Array` si existe, centésimas en `Int16Array` y bytes cuantizados con mínimo y máximo en la cabecera), y el error medido al decodificar: máximo, medio y cuadrático. La recomendación usa el error **máximo**, porque un solo valor muy malo puede disparar una alarma. **Fíjate en:** como el sensor mide centésimas, «centésimas en `Int16Array`» es exacto con los mismos bytes que float16: cuando la resolución de la fuente es conocida, un entero escalado gana. Float16 brilla con datos sin una resolución fija, como los colores HDR o los pesos de una red neuronal.

[[exercise:08-sensores-en-float16.md]]

```text
Float64Array             11520 B · máx 0 · medio 0
Float32Array              5760 B · máx 9.2e-7 · medio 4.2e-7
Float16Array              2880 B · máx 0.0075 · medio 0.0035
Int16Array (centésimas)   2880 B · máx 0 · medio 0
Uint8Array cuantizado     1448 B · máx 0.029 · medio 0.014
✅ Error máximo «0,01 °C» → Int16Array (centésimas), 2880 bytes (25 % de float64)
Listo: cambia el error máximo aceptable a 0,05 °C y luego a «ninguno»
// Tras elegir 0,05 °C:
✅ Error máximo «0,05 °C» → Uint8Array cuantizado, 1448 bytes (12,6 % de float64)
// Tras elegir «ninguno (exacto)»:
✅ Error máximo «ninguno (exacto)» → Int16Array (centésimas), 2880 bytes (25 % de float64)
```

## Metrónomo en WAV

**Objetivo:** generar pistas de metrónomo para ensayar, con tempo, compás, duración y timbre. **Técnicas:** validación de los campos antes de generar (`valueAsNumber`, mensaje en `role="alert"`); un `ArrayBuffer` del tamaño exacto, que ya está a cero (silencio), así que solo se calculan las muestras de cada golpe; acento en el primer tiempo; muestras recortadas a [-1, 1] antes de pasarlas a `Int16`; cabecera RIFF con `DataView`; reproductor en bucle y descarga con una URL de objeto que se libera al generar otra. **Fíjate en:** diez segundos de audio son 480 044 bytes, pero el cálculo cuesta lo mismo que 16 golpes de 40 ms.

[[exercise:09-metronomo-wav.md]]

```text
Listo: pulsa «Generar el WAV» y luego ▶; cambia el tempo a 30 para ver la validación
// Tras pulsar «Generar el WAV»:
🥁 96 bpm · 4/4 · 4 compases → 16 golpes · 10.00 s · 480044 bytes
// Tras poner el tempo en 30 y pulsar «Generar el WAV»:
⚠️ El tempo tiene que ser un número entero entre 40 y 208.
```

## De CSV a columnas binarias

**Objetivo:** convertir un CSV en un formato binario por columnas, como hacen Parquet o Arrow, y medir lo que se gana. **Técnicas:** validación del CSV; un diccionario para las estaciones (cada fila guarda un byte); minutos en `Uint16Array` respecto a una hora base; mediciones en `Float32Array`; cada columna alineada a 4 bytes con `(offset + 3) & ~3` para leerla con una vista, sin copiar (comprobando antes que la máquina es little-endian, como el formato); comparación con CSV y JSON, también comprimidos con `CompressionStream('gzip')`; consultas que recorren solo las columnas necesarias; y la ida y vuelta comprobada fila a fila. **Fíjate en:** las columnas ocupan menos de un tercio del CSV, y siguen siendo lo más pequeño después de gzip. Los tamaños exactos con gzip dependen de la versión de zlib del navegador, así que la consola solo da la conclusión.

[[exercise:10-csv-a-columnas.md]]

```text
📄 air-quality.csv: 480 filas × 5 columnas
📦 CSV 19046 B · JSON 45212 B · columnas 5824 B (31 % del CSV)
🗜️ con gzip, ¿las columnas siguen siendo lo más pequeño? true
📊 Xalostoc 38.5 · Tlalnepantla 33.5 · Merced 26.3 · Coyoacán 20.1 · Pedregal 16.3
🔁 ida y vuelta: las 480 filas coinciden · vistas sin copiar: true
Listo: pulsa «Descargar air-quality.lwco» y ábrelo en el visor hexadecimal (ejemplo 1)
// Tras pulsar «Descargar air-quality.lwco» (con ▶ o en el editor):
💾 air-quality.lwco (5824 bytes)
```

## Sumas de comprobación

**Objetivo:** comprobar que una descarga llegó intacta comparándola con la suma que publica su autor. **Técnicas:** CRC-32 por trozos con `for await` sobre `file.stream()` y un `<progress>` que avanza; SHA-256 con `crypto.subtle.digest` (con límite de tamaño y comprobación de contexto seguro); la suma publicada se normaliza (mayúsculas, espacios, `:`) y también se acepta una línea de un archivo `SHA256SUMS`; elegir otro archivo a mitad de cálculo cancela el anterior. **Fíjate en:** pega la línea de `tile.png` mientras está cargado `chime.wav`: el resultado es ❌ y además te avisa de que la línea es de otro archivo.

[[exercise:11-sumas-de-comprobacion.md]]

```text
🧮 tile.png · 155 bytes · CRC-32 619a3d12 · SHA-256 fb9f3a8dfaf99af22d7b6769c7fb54a749d2d8e46df0c6464d07f69cca2c7151
Listo: pulsa «chime.wav», copia su línea de las sumas publicadas en «Suma publicada» y pulsa «Comparar»
// Tras pulsar «chime.wav», pegar su línea de SHA256SUMS y pulsar «Comparar»:
🧮 chime.wav · 9644 bytes · CRC-32 0ad3095d · SHA-256 9a1f1a1d87ec0b9326f57a88f67b103eea7988647b3cec2c4473b304efb54567
✅ El SHA-256 coincide: chime.wav está intacto.
```

## Editor de pixel art

**Objetivo:** dibujar una calaverita de 16 × 16 y exportarla a formatos estándar. **Técnicas:** cada píxel en 4 bits (dos por byte, 128 bytes en total), el mismo formato que las filas de un PNG indexado; BMP de 24 bits con `DataView`; PNG con paleta (`PLTE`), filas comprimidas con `CompressionStream('deflate')` (que produce el formato zlib que pide PNG) y el CRC de cada fragmento, comprobado antes de ofrecerlo; guardado en `localStorage` (clave `lw-bin-pixel`) como base64 de una versión + 128 bytes, validado al cargar. Rejilla con flechas y Espacio para pintar; cada píxel dice su color. **Fíjate en:** el BMP ocupa 822 bytes y el PNG menos de 200: la paleta de 4 bits y la compresión hacen el resto.

[[exercise:12-editor-de-pixel-art.md]]

```text
🎨 16 × 16 píxeles · 8 colores · 4 bits por píxel → 128 bytes
Listo: pinta un par de píxeles, pulsa «Exportar PNG» y «Exportar BMP» y compara los tamaños
// Tras elegir «rosa mexicano» y pintar el píxel de arriba a la izquierda:
🖌️ (1, 1) → rosa mexicano
// Tras «Exportar PNG» y «Exportar BMP»:
🖼️ calaverita.png: indexado de 4 bits · CRC correctos 4/4 · más pequeño que el BMP: true
🖼️ calaverita.bmp: 822 bytes (24 bits por píxel, sin comprimir)
// Tras «Guardar en este navegador»:
💾 guardado: 129 bytes → 172 caracteres en base64
```
