# Texto y binario

## Por qué importa

Las personas leen texto; las redes, los discos y las memorias guardan bytes. Cada vez que un texto sale de JavaScript (una petición, un archivo, la memoria de WebAssembly, una huella criptográfica, un enlace) se convierte en bytes, y cada vez que entra, hace el camino inverso. Si las dos conversiones no usan la misma regla aparece el *mojibake*, el `�` o un archivo que no abre.

Ya has visto piezas sueltas. En «Anatomía de un documento», del módulo de HTML, `TextEncoder` y `TextDecoder` explicaban por qué «ó» se convierte en «Ã³», con la promesa de estudiarlos aquí. En «Strings» aprendiste que `length` cuenta unidades UTF-16. En «Streams y progreso» decodificaste trozos con `{ stream: true }` y juntaste los bytes de una descarga en un `Blob` «para el capítulo 8». Esta lección completa el cuadro: texto ↔ bytes, bytes con tipo (`Blob` y `File`), bytes escritos como texto (base64) y bytes resumidos en una huella (SHA-256).

## De texto a bytes: `TextEncoder`

`new TextEncoder().encode(texto)` devuelve un `Uint8Array` con el texto en **UTF-8**, y solo en UTF-8: no admite otra codificación. UTF-8 usa de 1 a 4 bytes por carácter, y los primeros bits de cada byte dicen qué papel tiene:

| Caracteres | Bytes | Patrón de bits |
|------------|-------|----------------|
| ASCII (`U+0000`-`U+007F`): `a`, `7`, `;` | 1 | `0xxxxxxx` |
| `U+0080`-`U+07FF`: `ñ`, `á`, `ü`, griego, árabe | 2 | `110xxxxx 10xxxxxx` |
| `U+0800`-`U+FFFF`: `€`, `☕`, chino, japonés | 3 | `1110xxxx 10xxxxxx 10xxxxxx` |
| `U+10000` en adelante: emojis | 4 | `11110xxx 10xxxxxx 10xxxxxx 10xxxxxx` |

[[exercise:01-bytes-por-caracter.md-]]

```text
encoding → utf-8
a  U+0061  length 1  →  1 byte: 61
ñ  U+00F1  length 1  →  2 bytes: c3 b1
€  U+20AC  length 1  →  3 bytes: e2 82 ac
🎸  U+1F3B8  length 2  →  4 bytes: f0 9f 8e b8
ñ en bits → 11000011 10110001
U+00F1 en bits → 00011110001
code points → 28 | length → 29 | bytes UTF-8 → 35
Uint8Array(4) [111, 108, 195, 169]
```

Un mismo texto tiene, pues, **tres tamaños**: los caracteres Unicode (*code points*: `[...texto].length`), las unidades UTF-16 de la lección «Strings» (`texto.length`) y los bytes UTF-8 (`encode(texto).length`). Cuando un límite se mide en bytes (una columna de base de datos, la cabecera `Content-Length`, los 4096 bytes de una cookie, el campo de un formato binario), contar con `length` se queda corto en cuanto aparecen tildes o emojis.

> **Desde Python:** `texto.encode('utf-8')` es `encoder.encode(texto)`, y `len(texto.encode())` es `encoder.encode(texto).length`. Python puede codificar en cualquier codificación (`'cp1252'`, `'utf-16'`); `TextEncoder`, solo en UTF-8, la única que deberías escribir hoy.

### `encodeInto`: escribir en una memoria que ya existe

`encode` crea un `Uint8Array` nuevo cada vez. `encoder.encodeInto(texto, destino)` escribe dentro de uno que ya existe (un campo de un registro binario, la memoria de un módulo de WebAssembly) y devuelve `{ read, written }`: cuántas unidades UTF-16 leyó del texto y cuántos bytes escribió. Si el texto no cabe, se detiene **entre dos caracteres**, nunca en medio de uno:

[[exercise:02-encodeinto-y-limites-en-bytes.md-]]

```text
length → 12 | bytes UTF-8 → 15
🐛 slice(0, 12) → Andrés Nú�
✅ encodeInto → {read: 9, written: 11}
✅ guardado → Andrés Nú
se quedó fuera → ñez
{read: 4, written: 4} Uint8Array(12) [82, 111, 115, 97, 0, 0, 0, 0, 0, 0, 0, 0]
```

Cortar los bytes a ciegas con `slice` puede dejar la mitad de un carácter, que al decodificar se convierte en `�`. `encodeInto` deja un byte libre antes que partir la «ñ».

## De bytes a texto: `TextDecoder`

`new TextDecoder(etiqueta)` hace el camino inverso, y aquí sí se puede elegir la codificación: `'utf-8'` (la de por defecto), `'windows-1252'` (la de los documentos antiguos en español), `'utf-16le'` (la de Windows por dentro), `'shift_jis'`, `'gbk'`… Las etiquetas tienen alias, y `decoder.encoding` dice el nombre real:

[[exercise:03-textdecoder-y-codificaciones.md-]]

```text
utf-8        → Café!
windows-1252 → CafÃ©!
utf-16le     → 慃썦↩
🐛 como UTF-8 → "A�o;Precio\n2026;45 �"
✅ como windows-1252 → "Año;Precio\n2026;45 €"
✅ como utf-16le → Hola
'utf8' → utf-8
'latin1' → windows-1252
'ascii' → windows-1252
'utf-16' → utf-16le
```

Es el mismo experimento de «Anatomía de un documento», ahora con todas las piezas: un archivo es una fila de bytes y la codificación es la tabla con la que se leen. Los bytes `c3 a9` son «é» en UTF-8 y «Ã©» en windows-1252; el byte `f1` es «ñ» en windows-1252 y basura en UTF-8. Fíjate en que el navegador trata `'latin1'` y `'ascii'` como windows-1252: es lo que hace con las páginas antiguas, porque así es como se escribían en realidad.

### 🐛 Bytes inválidos: el carácter `�`

No todas las secuencias de bytes son UTF-8 válido: un `f3` suelto, por ejemplo, anuncia un carácter de 4 bytes que no llega. Ante eso, `TextDecoder` **no falla**: pone `U+FFFD` (`�`, el carácter de sustitución) y sigue. El dato original se pierde sin que nadie se entere. Con la opción `{ fatal: true }`, en cambio, lanza un `TypeError`, y puedes reaccionar, por ejemplo probando otra codificación:

[[exercise:04-bytes-invalidos-y-fatal.md-]]

```text
🐛 sin fatal → Canci�n | ¿tiene �? → true
✅ con fatal → TypeError | Failed to execute 'decode' on 'TextDecoder': The encoded data was not valid.
{encoding: 'windows-1252', text: 'Canción'}
{encoding: 'utf-8', text: 'Canción'}
medio emoji → Uint8Array(3) [239, 191, 189]
```

UTF-8 tiene una propiedad que hace fiable esta estrategia: es muy improbable que un texto en otra codificación con letras acentuadas sea, por casualidad, UTF-8 válido. Si `fatal` no protesta, casi seguro que era UTF-8.

> **Desde Python:** aquí los defectos van al revés. `b'Canci\xf3n'.decode('utf-8')` lanza `UnicodeDecodeError`, y hay que pedir `errors='replace'` para obtener el `�`. En JavaScript, el `�` es lo de serie y el error hay que pedirlo con `fatal: true`.

### La marca BOM

Algunos programas empiezan los archivos de texto con una **BOM** (*byte order mark*): el carácter `U+FEFF`, que en UTF-8 son los bytes `ef bb bf` y en UTF-16 dice además el orden de los bytes (`ff fe`, little-endian). Excel la escribe al exportar «CSV UTF-8». `TextDecoder` la quita por defecto; con `{ ignoreBOM: true }` la conserva, y entonces la primera columna ya no se llama `'fecha'`, sino `'﻿fecha'`:

[[exercise:05-la-marca-bom.md-]]

```text
por defecto → "fecha" | === "fecha" → true
ignoreBOM → "﻿fecha" | length → 6 | === "fecha" → false
primer carácter → feff
windows-1252 → ï»¿fecha
utf-16le → "Ok"
```

Si alguna vez ves `ï»¿` al principio de un texto, ya sabes qué es: una BOM de UTF-8 leída como windows-1252.

### Texto que llega por trozos

Cuando los bytes llegan por partes (un flujo de red, un archivo leído por trozos), un carácter puede quedar partido entre dos trozos. Lo resolviste en la lección «Streams y progreso»: **un solo** `TextDecoder` para todo el flujo, con `decoder.decode(trozo, { stream: true })`, que guarda los bytes del carácter incompleto hasta el trozo siguiente, o `flujo.pipeThrough(new TextDecoderStream())`.

## `Blob`: bytes con un tipo

Un **`Blob`** (*Binary Large Object*) es un bloque de bytes **inmutable** con un tipo MIME. Es la moneda de cambio de los datos binarios en el navegador: lo devuelve `response.blob()`, lo aceptan `fetch` como cuerpo, `FormData`, los `<img>` y los enlaces de descarga a través de una URL, y es la base de `File`. Se crea a partir de **partes** (strings, que se guardan en UTF-8; typed arrays; `ArrayBuffer`; otros Blobs), y como sus bytes pueden estar en disco y no en memoria, se leen con promesas:

| Miembro | Qué da |
|---------|--------|
| `size`, `type` | tamaño en bytes y tipo MIME |
| `text()` | promesa de un string (UTF-8, sin BOM) |
| `arrayBuffer()` | promesa de un `ArrayBuffer` |
| `bytes()` | promesa de un `Uint8Array` (en Chrome desde 2025) |
| `stream()` | un `ReadableStream` de trozos `Uint8Array` |
| `slice(inicio, fin, tipo)` | otro Blob con una parte, sin copiar |

[[exercise:06-blob-partes-y-lectura.md-]]

```text
size → 60 bytes | caracteres → 56 | type → text/csv;charset=utf-8
text() → "producto;unidades\nCafé de Chiapas;14\nCacao de Tabasco;6\n"
arrayBuffer() → empieza por ef bb bf 70 72 6f
bytes() → 60 bytes en un Uint8Array
slice → 18 bytes text/plain "producto;unidades\n"
csv.size sigue → 60 | withTotal.size → 69
stream() → 69 bytes leídos por trozos
```

¿Blob o `ArrayBuffer`? Un `ArrayBuffer` son bytes en memoria que puedes leer y modificar ya; un Blob es un «archivo» opaco que el navegador puede guardar donde quiera y leer cuando se lo pidas. Para procesar bytes, `ArrayBuffer` y typed arrays; para guardar, enviar, mostrar o descargar, Blob.

## `File` y URLs de objeto

Un **`File`** es un Blob con dos datos más: `name` y `lastModified` (milisegundos desde 1970). Los archivos que elige una persona en un `<input type="file">` o que arrastra a la página son objetos `File`; los leerás en el módulo «APIs modernas del navegador». Aquí lo creas tú.

Para que un `<img>`, un `<video>` o un enlace de descarga usen un Blob, hace falta una URL. `URL.createObjectURL(blob)` crea una con la forma `blob:<origen>/<identificador>`, que apunta a los bytes en memoria y solo vale en la página que la creó. Mientras exista, el Blob no se libera: cuando ya no haga falta, `URL.revokeObjectURL(url)`. Para descargar, un enlace con el atributo `download` (el nombre del archivo) y esa URL:

[[exercise:07-file-y-urls-de-objeto.md]]

```text
File → entrada-museo.svg · 480 bytes · image/svg+xml
¿es un Blob? → true · lastModified → 2026-10-14T17:00:00.000Z
URL de objeto → ¿empieza por «blob:»? true
Listo: pulsa «Descargar entrada»
<img> cargada; URL liberada
// Tras pulsar «Descargar entrada» (en el editor o con ▶):
Descarga: entrada-museo.svg (480 bytes)
```

Es la pieza que faltaba en el gestor de descargas del módulo «Red y almacenamiento»: los trozos de la descarga se juntan en un Blob, `createObjectURL` le da una dirección y un `<a download>` lo guarda. Las tarjetas de la galería y de la teoría no permiten descargas (son iframes aislados sin ese permiso); el ejemplo lo avisa en la página.

## base64: bytes escritos como texto

Muchos sitios solo admiten texto: JSON, HTML, CSS, una URL, el cuerpo de un correo. Para meter bytes arbitrarios ahí se usa **base64**, que escribe cada grupo de **3 bytes** (24 bits) con **4 caracteres** de un alfabeto de 64 (`A-Z`, `a-z`, `0-9`, `+`, `/`), 6 bits cada uno. Si al final sobran uno o dos bytes, se rellena con `=`. El precio: el resultado ocupa un **33 % más**.

```text
bytes      'H'       'o'       'l'
           01001000  01101111  01101100
6 en 6     010010  000110  111101  101100
base64       S       G       9       s        → 'Hola' = 'SG9s' + 'YQ=='
```

Las funciones históricas son `btoa` (bytes → base64) y `atob` (base64 → bytes), de la época en que los strings hacían de bytes. No reciben texto: reciben una **«cadena binaria»**, un string donde cada carácter es un byte (de `U+0000` a `U+00FF`). Con texto de verdad, fallan de dos maneras:

[[exercise:08-base64-y-btoa.md-]]

```text
btoa('Hola') → SG9sYQ==
🐛 btoa con € → InvalidCharacterError | Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range.
🐛 btoa('ñandú') → 8WFuZPo=
🐛 leído como UTF-8 → �and�
✅ textToBase64 → w7FhbmTDuiDwn464IDIwIOKCrA==
✅ base64ToText → ñandú 🎸 20 €
toBase64() → w7FhbmTDug==
fromBase64() → Uint8Array(7) [195, 177, 97, 110, 100, 195, 186]
toHex() → c3b1616e64c3ba | fromHex() → Uint8Array(2) [195, 177]
bytes → 7 | caracteres base64 → 12
```

El segundo fallo es el traicionero: `'ñandú'` cabe en Latin-1, así que `btoa` no protesta, pero codifica los bytes de Latin-1 (`f1 61 6e 64 fa`) y no los de UTF-8. Funciona en tus pruebas con `btoa`/`atob` en los dos extremos y falla en cuanto el otro extremo es un servidor que espera UTF-8. La regla: a base64 se llega **desde bytes**. En Chrome (desde 2025), `Uint8Array` trae `toBase64()`, `Uint8Array.fromBase64()`, `toHex()` y `Uint8Array.fromHex()`, que trabajan directamente con bytes y hacen innecesarias las cadenas binarias.

### base64url y URLs `data:`

Dos variantes aparecen en cuanto base64 entra en una URL. **base64url** cambia `+` y `/` (que en una URL significan espacio y separador de ruta) por `-` y `_`, y suele quitar el relleno `=`: es la de los tokens JWT y los enlaces que guardan estado. Y una **URL `data:`** mete los bytes dentro de la propia dirección: `data:image/svg+xml;base64,PHN2Zy…`.

[[exercise:09-base64url-y-data-urls.md]]

```text
base64 → …IsK/UXVpw6luIHNlcsOhPyJdfQ== (116 caracteres)
base64url → …IsK_UXVpw6luIHNlcsOhPyJdfQ (114 caracteres)
¿iguales con replace? → true
recuperada → Domingo tranquilo: Bésame mucho · La llorona · ¿Quién será?
data: URL → data:image/svg+xml;base64,PHN2Zy… (230 caracteres para 152 bytes)
```

| | URL `data:` | URL `blob:` |
|---|---|---|
| Contiene | los bytes, en base64 | una referencia a un Blob en memoria |
| Tamaño | un 33 % más que los bytes | unos 60 caracteres |
| Vale en | cualquier sitio (JSON, CSS, otra página) | solo en la página que la creó, hasta `revokeObjectURL` |
| Úsala para | recursos pequeños que deben viajar solos | archivos generados para mostrar o descargar |

## Huellas: SHA-256

Una **función hash criptográfica** resume cualquier cantidad de bytes en una huella de tamaño fijo: 32 bytes en el caso de SHA-256. La misma entrada da siempre la misma huella; un solo bit distinto da una huella completamente diferente; y no se puede volver atrás ni fabricar dos entradas con la misma huella. En el navegador se calcula con `crypto.subtle.digest('SHA-256', bytes)`, que recibe bytes (otra vez `TextEncoder`) y devuelve una promesa de un `ArrayBuffer`, que se escribe en hexadecimal:

[[exercise:10-sha256-con-crypto-subtle.md-]]

```text
Web a fondo  → d9ea4accb53a8d495d2afd0b7c29e0350547b80839d7bc335c4349797384754d
Web a fondo. → 8b5cf1e35b587283a801ff34b540e9b47f24e5189dc93f4faf757e50a21aa351
¿determinista? → true
huella → 32 bytes = 64 cifras hex
¿intacto? → true
¿intacto el alterado? → false
token → 16 bytes aleatorios | ¿todos de 0 a 255? → true
```

Las huellas sirven para comprobar que un archivo llegó intacto, para detectar duplicados y como identificadores de contenido (las cachés y Git los usan así). `crypto.subtle` solo existe en contextos seguros (HTTPS o `localhost`). Para contraseñas no se usa SHA-256 a secas, sino funciones lentas a propósito, como PBKDF2 o Argon2, que se calculan en el servidor.

## Bestiario

- **Aparecen `�` en un texto.**
  Síntoma: un texto decodificado tiene `�` donde había tildes o «ñ»; ningún error lo avisó.
  Causa: los bytes no eran UTF-8 válido (el archivo estaba en otra codificación, o se cortó a mitad de un carácter) y `TextDecoder` los sustituye por `U+FFFD` sin fallar.
  Solución: `new TextDecoder('utf-8', { fatal: true })` para detectarlo y probar otra codificación; cortar con `encodeInto` en vez de `slice` sobre los bytes.
  → [ver ejemplo](04-bytes-invalidos-y-fatal.md) · [cortar bytes](02-encodeinto-y-limites-en-bytes.md)
- **`btoa` falla con «€»… o «funciona» con «ñ».**
  Síntoma: `InvalidCharacterError: … characters outside of the Latin1 range`, o un base64 que el servidor decodifica como `�and�`.
  Causa: `btoa` recibe una cadena binaria (un carácter por byte, Latin-1), no texto UTF-8.
  Solución: texto → `TextEncoder` → bytes → base64 (`bytes.toBase64()` en Chrome, o `btoa(String.fromCharCode(...bytes))`); y el camino inverso con `TextDecoder`.
  → [ver ejemplo](08-base64-y-btoa.md)
- **La primera columna de un CSV no se encuentra.**
  Síntoma: `row.fecha` es `undefined` aunque la cabecera dice «fecha», o el texto empieza por `ï»¿`.
  Causa: el archivo empieza con una BOM (`U+FEFF`) que se conservó, o que se leyó con otra codificación.
  Solución: decodifica con `TextDecoder` sin `ignoreBOM` (la quita) o elimina un `﻿` inicial.
  → [ver ejemplo](05-la-marca-bom.md)

## Resumen

- `TextEncoder` convierte texto en bytes UTF-8 (1 a 4 por carácter); un texto tiene tres tamaños: code points, `length` y bytes.
- `encodeInto` escribe en un `Uint8Array` existente sin partir caracteres; `TextDecoder(etiqueta)` lee cualquier codificación.
- `TextDecoder` cambia los bytes inválidos por `�` en silencio: `{ fatal: true }` lo convierte en un error.
- La BOM (`ef bb bf`) se quita por defecto; un solo decodificador con `{ stream: true }` para texto por trozos.
- `Blob`: bytes inmutables con tipo, leídos con promesas; `File` añade nombre y fecha; `createObjectURL`/`revokeObjectURL` les dan y quitan una URL.
- base64 escribe 3 bytes con 4 caracteres (+33 %): `btoa` solo admite Latin-1; pasa siempre por bytes (`toBase64()` en Chrome).
- base64url para URLs; las URL `data:` llevan los bytes dentro; `crypto.subtle.digest` calcula huellas SHA-256.

## Para profundizar

- [MDN: TextEncoder (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder)
- [MDN: Blob](https://developer.mozilla.org/es/docs/Web/API/Blob)
- [MDN: Uint8Array.prototype.toBase64() (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toBase64)
- [WHATWG: Encoding Standard, las codificaciones y etiquetas del navegador (en inglés)](https://encoding.spec.whatwg.org/)
- [Documentación de Python: base64](https://docs.python.org/es/3/library/base64.html)
