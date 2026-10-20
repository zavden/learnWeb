# Streams y progreso

## Por qué importa

`await response.json()` es cómodo, pero espera al **último byte** antes de darte nada. Con un catálogo de 20 MB, eso son segundos de pantalla quieta, sin saber si falta mucho o poco, y el archivo entero en memoria antes de poder tocarlo. Las páginas modernas trabajan de otra manera: una barra que avanza mientras se descarga un PDF, resultados de búsqueda que aparecen uno a uno, la respuesta de un asistente que se escribe palabra a palabra mientras el servidor la genera.

Todo eso se hace con **streams** (flujos): datos que llegan en trozos y se procesan a medida que llegan. En la lección «Peticiones con fetch» viste que el `Response` llega con las cabeceras y el cuerpo sigue en camino; aquí aprenderás a leer ese camino trozo a trozo, y los tres sitios donde los trozos te engañan: un carácter partido, un total desconocido y una línea cortada.

## El cuerpo es un flujo

`response.body` es un **`ReadableStream`**, un flujo de lectura. `json()` y `text()` lo leen entero por ti; para leerlo tú, se le pide un **lector** con `getReader()`, y cada `await reader.read()` devuelve el siguiente trozo como `{ done, value }`: `value` es un `Uint8Array` (una lista de bytes, que estudiarás en el capítulo 8) y `done` se vuelve `true` cuando el flujo termina. Mientras un lector lo tiene, el flujo está **bloqueado** (`locked`): nadie más puede leerlo, tampoco `text()`.

```text
servidor ── Bloque 1 ──── Bloque 2 ──── Bloque 3 ──── (fin)
              │              │              │           │
reader.read() ▼              ▼              ▼           ▼
       {done:false,     {done:false,   {done:false,  {done:true,
        value: bytes}    value: bytes}  value: bytes} value: undefined}
```

[[exercise:01-leer-por-trozos.md-]]

```text
status → 200 | Content-Length → 5120
¿flujo bloqueado? → true
cada trozo es un Uint8Array → empieza por "Bloque 1 de 5"
trozo 1: 1024 bytes (llevamos 1024)
trozo 2: 1024 bytes (llevamos 2048)
trozo 3: 1024 bytes (llevamos 3072)
trozo 4: 1024 bytes (llevamos 4096)
trozo 5: 1024 bytes (llevamos 5120)
fin → 5120 bytes en 5 trozos | tardó 800 ms o más: true
```

Los trozos que recibes no son necesariamente los que envió el servidor: la red y el navegador pueden partirlos o juntarlos. Aquí, con 200 ms de pausa entre envíos, suelen llegar tal cual, pero tu código nunca debe depender de ello. Es la idea que hará falta en el resto de la lección.

> **Desde Python:** es `requests.get(url, stream=True)` con `for chunk in r.iter_content(1024)`, o `async for chunk in response.content.iter_chunked(1024)` en `aiohttp`. Igual que allí, el tamaño de cada trozo es orientativo.

### `for await` sobre el cuerpo

En Chrome, un `ReadableStream` es además un **iterable asíncrono** (desde 2024), así que se recorre con el `for await…of` de la lección «async/await», sin lector ni `done`. Salir del bucle con `break` (o con `return`, o por un error) **cancela** el flujo: el navegador cierra la conexión y deja de descargar.

[[exercise:02-for-await-sobre-el-body.md-]]

```text
trozo 1 → Bloque 1 de 10
trozo 2 → Bloque 2 de 10
trozo 3 → Bloque 3 de 10
¿terminó antes de 1 s (no esperó a los otros 7)? → true
¿se puede volver a leer? → false
```

## De bytes a texto

Los trozos son bytes; para tener texto hay que decodificarlos con un `TextDecoder` (UTF-8 por defecto). Y aquí está la primera trampa. En UTF-8, los caracteres del inglés ocupan un byte, pero «é» ocupa dos, «☕» tres y «🍞» cuatro. Si un trozo termina a mitad de uno de esos caracteres y decodificas cada trozo por separado, los bytes sueltos no forman nada válido y salen como `�` (el carácter de sustitución, U+FFFD). La solución es **un solo** decodificador para todo el flujo, con `decode(trozo, { stream: true })`: guarda los bytes de un carácter incompleto hasta que llegue el resto.

[[exercise:03-caracter-partido-entre-trozos.md-]]

```text
caracteres → 33 | bytes → 38
🐛 trozo a trozo → Caf�� de olla �� y pan de muerto ���
🐛 caracteres � → 7
✅ con stream: true → Café de olla ☕ y pan de muerto 🍞
✅ ¿igual que el original? → true
```

Este fallo no aparece nunca con texto solo ASCII, así que pasa las pruebas con datos en inglés y aparece en producción con el primer «café». El ejemplo construye su propio `ReadableStream` para poder partir los bytes donde quiere (al final de la lección verás cómo se hace).

## Progreso de descarga

Para una barra de progreso hacen falta dos números: el total y lo recibido. El total lo anuncia el servidor en la cabecera `Content-Length` (en bytes); lo recibido se suma trozo a trozo. El elemento `<progress>` de HTML es la barra accesible: con `max` y `value` dice el porcentaje, y los lectores de pantalla lo anuncian como barra de progreso.

[[exercise:04-progreso-de-descarga.md]]

[[exercise:04-progreso-de-descarga.md-(script.js)]]

```text
Listo: mira la barra; «Descargar otra vez» repite la descarga
Content-Length → 20480 bytes
📦 10 %
📦 20 %
📦 30 %
📦 40 %
📦 50 %
📦 60 %
📦 70 %
📦 80 %
📦 90 %
📦 100 %
✅ 20480 bytes en 10 trozos
```

Al leer tú el cuerpo, los bytes quedan en tus manos: el ejemplo los junta en un `Blob`, que es lo que haría `response.blob()`.

### Cuando el total es desconocido

`Content-Length` no siempre está. Un servidor que genera la respuesta mientras la envía (un informe, una exportación, un flujo de eventos) no sabe cuánto ocupará y la manda **por partes** (*chunked*), sin anunciar el tamaño. Entonces `headers.get('content-length')` devuelve `null`, `Number(null)` es `0`, y la división da `Infinity`:

[[exercise:05-total-desconocido.md-]]

```text
🐛 sin comprobar el total:
   Content-Length: null | total: 0 | progreso: Infinity %
   Content-Length: null | total: 0 | progreso: Infinity %
   Content-Length: null | total: 0 | progreso: Infinity %
   Content-Length: null | total: 0 | progreso: Infinity %
✅ comprobando el total:
   0.5 KB recibidos (total desconocido)
   1.0 KB recibidos (total desconocido)
   1.5 KB recibidos (total desconocido)
   2.0 KB recibidos (total desconocido)
✅ fin → 2048 bytes
```

Sin total, el progreso es **indeterminado**: un `<progress>` sin atributo `value` se dibuja como una barra en movimiento, y el texto puede contar los kilobytes recibidos. Recuerda también la lección «Orígenes y CORS»: en una respuesta de otro origen, `Content-Length` es una de las cabeceras seguras, así que se puede leer; la mayoría de las demás, no.

### Cuando el servidor comprime

La segunda mentira de `Content-Length` es más sutil. Casi todos los servidores **comprimen** las respuestas de texto (`Content-Encoding: gzip`, `br` o `zstd`), y entonces `Content-Length` cuenta los bytes **comprimidos**, los que viajan por la red. Pero el navegador descomprime antes de dártelos: `response.body` entrega los bytes **descomprimidos**, muchos más. La barra llega al 100 % cuando aún falta casi todo, y sigue subiendo. El servidor de prueba no comprime, así que el ejemplo hace las dos mitades él mismo con `CompressionStream` (lo que haría el servidor) y `DecompressionStream` (lo que hace el navegador):

[[exercise:06-content-length-comprimido.md-]]

```text
Content-Length (comprimido) menor que 3 KB → true
bytes recibidos (descomprimidos) → 19801 | igual que el original: true
🐛 progreso final → más del 100 %
✅ total para la barra → null (desconocido: barra indeterminada)
```

En la pestaña Network de DevTools verás las dos cifras de cada petición: «transferred» (lo que viajó, comprimido) y «resources» (el tamaño real). Si la respuesta trae `Content-Encoding`, trata el total como desconocido, o pide al servidor que envíe el tamaño sin comprimir en otra cabecera (que, entre orígenes, tendrá que exponer).

## Datos que llegan por líneas

Para enviar **muchos objetos** poco a poco, un JSON normal no sirve: `[ {…}, {…}, … ]` no se puede analizar hasta que llega el `]` final. El formato **NDJSON** (*newline-delimited JSON*, también llamado JSON Lines) pone un objeto JSON completo por línea, y cada línea se puede analizar en cuanto llega. Con una condición: que esté **entera**. La red corta los trozos por donde quiere, no por los saltos de línea, y analizar cada trozo como si trajera líneas completas falla:

[[exercise:07-lineas-cortadas-entre-trozos.md-]]

```text
🐛 cada trozo por separado:
   SyntaxError: Unterminated string in JSON at position 30 (line 1 column 31)
   SyntaxError: Unexpected token 'í', "ía","total":420}" is not valid JSON
   SyntaxError: Unterminated string in JSON at position 27 (line 1 column 28)
   SyntaxError: Unexpected token 'A', "Andrés","total":145}" is not valid JSON
   SyntaxError: Unterminated string in JSON at position 23 (line 1 column 24)
   SyntaxError: Unexpected token 'r', "r":"Rosa","... is not valid JSON
✅ con búfer:
   📦 {id: 'P-1001', customer: 'Lucía', total: 420}
   📦 {id: 'P-1002', customer: 'Andrés', total: 145}
   📦 {id: 'P-1003', customer: 'Rosa', total: 98}
```

La solución es un **búfer**: se le añade cada trozo de texto, se cortan las líneas, se procesan todas menos la última (que puede estar a medias) y esa última se guarda para el trozo siguiente. Al terminar el flujo, lo que quede en el búfer es la última línea. Es el mismo problema que el carácter partido, una capa más arriba.

### Tuberías: `pipeThrough`

Los flujos se encadenan como las tuberías de una terminal. `flujo.pipeThrough(transformador)` pasa cada trozo por un **`TransformStream`**, que recibe trozos por un lado y entrega otros por el otro, y devuelve el flujo de salida. El navegador trae algunos hechos: `TextDecoderStream` (un `TextDecoder` con `stream: true`, en forma de flujo), `CompressionStream` y `DecompressionStream`. Y puedes escribir los tuyos: el búfer de líneas del ejemplo anterior, convertido en un `TransformStream` reutilizable, recibe texto y entrega líneas. Juntos leen los pedidos NDJSON que envía el servidor de prueba, cada uno en cuanto llega:

[[exercise:08-pipethrough-y-ndjson.md-]]

```text
Content-Type → application/x-ndjson; charset=utf-8
📦 1/5 · Bloque 1 de 5
📦 2/5 · Bloque 2 de 5
📦 3/5 · Bloque 3 de 5
📦 4/5 · Bloque 4 de 5
📦 5/5 · Bloque 5 de 5
¿llegaron poco a poco? → primero antes de 100 ms: true | último tras 500 ms: true
```

```text
response.body ──► TextDecoderStream ──► splitLines() ──► for await (const line of …)
  (bytes)            (texto)               (líneas)          JSON.parse(line)
```

Así funcionan las respuestas «en vivo» de muchas APIs: resultados de búsqueda que llegan por partes o el texto de un modelo de lenguaje que aparece palabra a palabra. El navegador también tiene un formato y una API propios para eventos que el servidor envía cuando quiere, *Server-Sent Events* (`new EventSource(url)`), que es un flujo de texto por líneas con reconexión automática.

> **Desde Python:** `pipeThrough` es como encadenar generadores: `for line in split_lines(decode(chunks))`. Y un `TransformStream` es un generador que recibe trozos y hace `yield` de cero, uno o varios resultados por cada uno.

## Tus propios flujos

`new ReadableStream({ start, pull, cancel })` crea un flujo propio. `start(controller)` se ejecuta una vez, al crearlo; `pull(controller)` se llama **cada vez que el lector necesita más**, y produce con `controller.enqueue(trozo)`; `controller.close()` lo termina, y `cancel()` se llama si el lector abandona. El flujo genera solo lo que se le pide (más un trozo de reserva): es la **contrapresión** (*backpressure*), que evita producir más rápido de lo que alguien consume. Y `new Response(flujo)` envuelve cualquier flujo en una respuesta, con sus `text()`, `json()` y `blob()`:

[[exercise:09-crear-un-readablestream.md-]]

```text
▶ text() lee el flujo entero:
   (pull 1: genero la fila 1)
   (pull 2: genero la fila 2)
   (pull 3: genero la fila 3)
   (pull 4: genero la fila 4)
   (pull 5: no quedan filas → close)
fecha,producto,unidades
2026-10-12,"Café de Chiapas · 500 g",14
2026-10-12,"Cacao de Tabasco · 250 g",6
2026-10-13,"Café de Chiapas · 500 g",9
2026-10-13,"Vainilla de Papantla",3
▶ dos lecturas y cancel():
   (pull 1: genero la fila 1)
   → fecha,producto,unidades
   (pull 2: genero la fila 2)
   → 2026-10-12,"Café de Chiapas · 500 g",14
▶ blob():
   (pull 1: genero la fila 1)
   (pull 2: genero la fila 2)
   (pull 3: genero la fila 3)
   (pull 4: genero la fila 4)
   (pull 5: no quedan filas → close)
   tamaño → 184 bytes
```

Hay también **`WritableStream`**, el destino de una tubería (`flujo.pipeTo(destino)`), que verás cuando un flujo tenga que acabar en un archivo o en otro proceso. Los ejemplos 3 y 7 usaron flujos propios para partir los datos donde querían: es la forma de probar un lector de flujos sin depender de cómo corte la red.

## ¿Y el progreso de subida?

`fetch` no tiene eventos de progreso de **subida**: puedes saber cuánto llega, pero no cuánto se ha enviado de un archivo grande. Chrome permite enviar un `ReadableStream` como cuerpo de la petición (`body: flujo, duplex: 'half'`), pero solo por HTTP/2 o HTTP/3, y contar lo que tú entregas al navegador no es lo mismo que lo que ha recibido el servidor. Para una barra de subida, la herramienta sigue siendo la API anterior a `fetch`, **`XMLHttpRequest`**, con su objeto `upload`:

```js
const xhr = new XMLHttpRequest();
xhr.upload.addEventListener('progress', (event) => {
  if (event.lengthComputable) uploadBar.value = Math.round((event.loaded / event.total) * 100);
});
xhr.addEventListener('load', () => console.log('subido →', xhr.status));
xhr.open('POST', '/api/demo/echo');
xhr.send(formData); // el FormData con el archivo del formulario
```

## Bestiario

- **Caracteres `�` en el texto.**
  Síntoma: al leer un flujo por trozos aparecen `�` sueltos, sobre todo junto a acentos y emojis, y no siempre en el mismo sitio.
  Causa: un carácter de varios bytes quedó partido entre dos trozos y cada trozo se decodificó por separado.
  Solución: un solo `TextDecoder` con `decode(trozo, { stream: true })` y un `decode()` final, o `pipeThrough(new TextDecoderStream())`.
  → [ver ejemplo](03-caracter-partido-entre-trozos.md)
- **Una barra en `Infinity %`.**
  Síntoma: el progreso marca `Infinity` o `NaN`.
  Causa: la respuesta no trae `Content-Length` (envío por partes) y `Number(null)` es `0`.
  Solución: si no hay total, muestra un progreso indeterminado y los bytes recibidos.
  → [ver ejemplo](05-total-desconocido.md)
- **Una barra que pasa del 100 %.**
  Síntoma: el progreso llega al 100 % muy pronto y sigue subiendo.
  Causa: con compresión, `Content-Length` cuenta bytes comprimidos y el cuerpo entrega bytes descomprimidos.
  Solución: si hay `Content-Encoding`, trata el total como desconocido, o pide al servidor el tamaño real en otra cabecera.
  → [ver ejemplo](06-content-length-comprimido.md)
- **`JSON.parse` falla con NDJSON por trozos.**
  Síntoma: `Unterminated string in JSON` o `Unexpected token` al leer líneas JSON de un flujo, de forma intermitente.
  Causa: los trozos no respetan los saltos de línea.
  Solución: un búfer que solo entrega líneas completas (mejor como `TransformStream`).
  → [ver ejemplo](07-lineas-cortadas-entre-trozos.md)

## Resumen

- `response.body` es un `ReadableStream` de bytes (`Uint8Array`): se lee con `getReader()` y `read()` → `{ done, value }`, o con `for await` en Chrome; `break` cancela.
- Los trozos no respetan nada: ni caracteres ni líneas. Decodifica con un único `TextDecoder` y `{ stream: true }`, y corta líneas con un búfer.
- Progreso de descarga = bytes recibidos / `Content-Length`, salvo que falte (total desconocido) o haya compresión (total engañoso).
- `pipeThrough` encadena transformaciones: `TextDecoderStream`, `CompressionStream`, tus `TransformStream`.
- `new ReadableStream({ start, pull })` crea flujos perezosos con contrapresión; `new Response(flujo)` les da `text()`, `json()` y `blob()`.
- `fetch` no informa del progreso de subida: para eso, `XMLHttpRequest` y `xhr.upload.onprogress`.

## Para profundizar

- [MDN: Streams API](https://developer.mozilla.org/es/docs/Web/API/Streams_API)
- [MDN: Using readable streams (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams)
- [javascript.info: Fetch: progreso de la descarga](https://es.javascript.info/fetch-progress)
- [web.dev: Streams, la guía definitiva (en inglés)](https://web.dev/articles/streams)
- [Streams Standard (en inglés)](https://streams.spec.whatwg.org/)
