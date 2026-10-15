---
example_description: "Leer y escribir los metadatos de un PNG: recorre los fragmentos comprobando cada CRC-32, lee los textos tEXt (Latin-1) e iTXt (UTF-8), y añade o sustituye uno reconstruyendo el archivo con fragmentos nuevos y su CRC; el resultado se vuelve a verificar, se muestra y se puede descargar"
example_tags: "javascript|png|metadatos|crc32|dataview|textencoder|blob|descargas|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="meta-app">
  <h1>Metadatos de un PNG</h1>
  <p><label>Tu PNG <input id="file" type="file" accept="image/png"></label> <span class="hint">(si no eliges ninguno, se usa tile.png)</span></p>
  <div class="layout">
    <figure>
      <img id="preview" width="128" height="128" alt="Vista previa del PNG cargado">
      <figcaption id="file-label">tile.png</figcaption>
    </figure>
    <section aria-labelledby="chunks-title">
      <h2 id="chunks-title">Fragmentos</h2>
      <table>
        <thead><tr><th scope="col">Tipo</th><th scope="col">Bytes</th><th scope="col">CRC</th></tr></thead>
        <tbody id="chunks"></tbody>
      </table>
      <h2>Textos</h2>
      <dl id="texts"></dl>
    </section>
  </div>
  <fieldset class="editor">
    <legend>Añadir o cambiar un texto</legend>
    <label>Clave
      <select id="key">
        <option>Title</option><option>Author</option><option>Description</option>
        <option>Copyright</option><option>Software</option><option>Comment</option>
      </select>
    </label>
    <label>Valor <input id="value" type="text" maxlength="200" autocomplete="off"></label>
    <button id="save" type="button">Guardar en el PNG</button>
  </fieldset>
  <p><a id="download" hidden>Descargar el PNG con metadatos</a></p>
  <p class="note">Las tarjetas de la galería y de la teoría no permiten descargas (iframe aislado): ábrelo con ▶ o en el editor.</p>
  <p id="status" role="status"></p>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; --ok: #166534; --bad: #b91c1c; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.meta-app { max-width: 40rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0 0 0.5rem; font-size: 1.25rem; }
h2 { margin: 0.25rem 0; font-size: 1rem; }
.hint, .note { color: var(--muted); font-size: 0.85rem; }
.layout { display: flex; flex-wrap: wrap; gap: 1rem 1.5rem; align-items: flex-start; }
figure { margin: 0; }
figcaption { font-size: 0.85rem; color: var(--muted); }
img { display: block; image-rendering: pixelated; border: 1px solid var(--line); background: var(--surface); }
table { border-collapse: collapse; font-size: 0.85rem; font-variant-numeric: tabular-nums; }
th, td { padding: 0.15rem 0.6rem 0.15rem 0; text-align: start; border-bottom: 1px solid var(--line); }
td:first-child { font-family: Menlo, Consolas, monospace; }
.crc-ok { color: var(--ok); }
.crc-bad { color: var(--bad); font-weight: 700; }
dl { display: grid; grid-template-columns: max-content 1fr; gap: 0.15rem 0.75rem; margin: 0; font-size: 0.9rem; }
dt { font-family: Menlo, Consolas, monospace; color: var(--muted); }
dd { margin: 0; overflow-wrap: anywhere; }
.editor { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; align-items: end; margin-top: 1rem; border: 1px solid var(--line); border-radius: 0.6rem; }
.editor label { display: grid; gap: 0.2rem; font-size: 0.9rem; }
select, input[type="text"], button { font: inherit; padding: 0.25rem 0.5rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); color: var(--ink); }
input[type="text"] { inline-size: 14rem; }
button { cursor: pointer; }
a { color: var(--accent); }
[hidden] { display: none; }
:is(select, input, button, a):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.log { margin: 1rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
```

# JavaScript

```javascript
// Lector y escritor de metadatos PNG.
//
// Decisiones de diseño:
// - Se valida todo antes de usarlo: firma, que cada fragmento quepa en el archivo,
//   que el primero sea IHDR y el CRC-32 de cada uno. Un PNG con fallos se muestra
//   igualmente, pero marcado.
// - Para escribir no se «parchea» el archivo: se reconstruye (firma + IHDR + el
//   texto nuevo + el resto de fragmentos), calculando la longitud y el CRC del
//   fragmento nuevo. Los textos anteriores con la misma clave se quitan.
// - tEXt solo admite Latin-1 (un byte por carácter). Si el valor tiene algo fuera
//   de Latin-1 (€, emojis…), se escribe un iTXt, que guarda UTF-8.
// - El resultado se vuelve a analizar antes de ofrecerlo: lo que se descarga ha
//   pasado las mismas comprobaciones que lo que se carga.
// - Cada vista previa nueva libera la URL de objeto de la anterior.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos, los
// formularios, la red (fetch) y este módulo.

const SIGNATURE = Uint8Array.of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
const encoder = new TextEncoder();
const latin1 = new TextDecoder('windows-1252');
const utf8 = new TextDecoder('utf-8', { fatal: true });
const logList = document.querySelector('#log');
let current = { name: 'tile.png', bytes: new Uint8Array(0) };
let previewUrl = null;
let downloadUrl = null;

function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// CRC-32 con la tabla clásica (lección de integración del módulo).
const CRC_TABLE = Uint32Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let bit = 0; bit < 8; bit += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function parsePng(bytes) {
  if (bytes.length < 8 || !SIGNATURE.every((byte, index) => bytes[index] === byte)) throw new Error('no es un PNG (la firma no coincide)');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const chunks = [];
  for (let at = 8; at < bytes.length; ) {
    if (at + 12 > bytes.length) throw new Error(`fragmento cortado en la posición ${at}`);
    const length = view.getUint32(at, false);
    if (at + 12 + length > bytes.length) throw new Error(`el fragmento de la posición ${at} dice medir ${length} bytes y no caben`);
    const type = latin1.decode(bytes.subarray(at + 4, at + 8));
    const crcOk = view.getUint32(at + 8 + length, false) === crc32(bytes.subarray(at + 4, at + 8 + length));
    chunks.push({ type, length, crcOk, raw: bytes.subarray(at, at + 12 + length), data: bytes.subarray(at + 8, at + 8 + length) });
    at += 12 + length;
  }
  if (chunks[0]?.type !== 'IHDR') throw new Error('el primer fragmento no es IHDR');
  return chunks;
}

function readText(chunk) {
  const zero = chunk.data.indexOf(0);
  const key = latin1.decode(chunk.data.subarray(0, zero));
  if (chunk.type === 'tEXt') return [key, latin1.decode(chunk.data.subarray(zero + 1))];
  // iTXt: clave \0 · comprimido (1 byte) · método (1 byte) · idioma \0 · clave traducida \0 · texto UTF-8
  if (chunk.data[zero + 1] !== 0) return [key, '(texto comprimido: no se muestra)'];
  let at = zero + 3;
  at = chunk.data.indexOf(0, at) + 1; // salta el idioma
  at = chunk.data.indexOf(0, at) + 1; // salta la clave traducida
  return [key, utf8.decode(chunk.data.subarray(at))];
}

function makeChunk(type, data) {
  const chunk = new Uint8Array(12 + data.length);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, data.length, false);
  chunk.set(encoder.encode(type), 4);
  chunk.set(data, 8);
  view.setUint32(8 + data.length, crc32(chunk.subarray(4, 8 + data.length)), false);
  return chunk;
}
const isLatin1 = (text) => [...text].every((char) => char.codePointAt(0) <= 0xff);
const latin1Bytes = (text) => Uint8Array.from(text, (char) => char.charCodeAt(0));

function textChunk(key, value) {
  if (isLatin1(value)) return makeChunk('tEXt', Uint8Array.of(...latin1Bytes(key), 0, ...latin1Bytes(value)));
  const valueBytes = encoder.encode(value);
  const data = new Uint8Array(key.length + 5 + valueBytes.length); // clave \0 0 0 \0 \0 texto
  data.set(latin1Bytes(key));
  data.set(valueBytes, key.length + 5);
  return makeChunk('iTXt', data);
}

function withText(bytes, key, value) {
  const chunks = parsePng(bytes);
  const kept = chunks.slice(1).filter((chunk) => !(['tEXt', 'iTXt'].includes(chunk.type) && readText(chunk)[0] === key));
  const parts = [SIGNATURE, chunks[0].raw, textChunk(key, value), ...kept.map((chunk) => chunk.raw)];
  const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0)); // primero el tamaño
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

function show(name, bytes) {
  const chunks = parsePng(bytes); // lanza si el archivo no vale
  current = { name, bytes };
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
  document.querySelector('#preview').src = previewUrl;
  document.querySelector('#file-label').textContent = `${name} · ${bytes.length} bytes`;
  document.querySelector('#chunks').replaceChildren(...chunks.map((chunk) => {
    const row = document.createElement('tr');
    row.append(
      Object.assign(document.createElement('td'), { textContent: chunk.type }),
      Object.assign(document.createElement('td'), { textContent: chunk.length }),
      Object.assign(document.createElement('td'), { textContent: chunk.crcOk ? '✓ correcto' : '✗ no coincide', className: chunk.crcOk ? 'crc-ok' : 'crc-bad' }),
    );
    return row;
  }));
  const texts = chunks.filter((chunk) => ['tEXt', 'iTXt'].includes(chunk.type)).map((chunk) => [...readText(chunk), chunk.type]);
  document.querySelector('#texts').replaceChildren(...(texts.length ? texts.flatMap(([key, value, type]) => [
    Object.assign(document.createElement('dt'), { textContent: `${key} (${type})` }),
    Object.assign(document.createElement('dd'), { textContent: value }),
  ]) : [Object.assign(document.createElement('dd'), { textContent: 'Este PNG no tiene textos.' })]));
  const okCount = chunks.filter((chunk) => chunk.crcOk).length;
  return { chunks, texts, summary: `${chunks.length} fragmentos, CRC correctos: ${okCount}/${chunks.length}` };
}

function setStatus(text) {
  document.querySelector('#status').textContent = text;
}

function save() {
  const key = document.querySelector('#key').value;
  const value = document.querySelector('#value').value.trim();
  if (!value) {
    setStatus('Escribe un valor antes de guardar.');
    return;
  }
  if (value.includes('\0')) {
    setStatus('El valor no puede contener el carácter nulo.');
    return;
  }
  const before = current.bytes.length;
  const name = current.name.replace(/(\.png)?$/i, '-con-metadatos.png').replace(/(-con-metadatos)+/, '-con-metadatos');
  const output = withText(current.bytes, key, value);
  const { summary } = show(name, output); // se vuelve a analizar: lo descargable está verificado
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  downloadUrl = URL.createObjectURL(new Blob([output], { type: 'image/png' }));
  const link = document.querySelector('#download');
  Object.assign(link, { href: downloadUrl, download: name, hidden: false });
  const type = isLatin1(value) ? 'tEXt' : 'iTXt';
  setStatus(`Guardado: ${key} = ${value}`);
  logLine(`💾 ${type} ${key} = ${value} → ${output.length} bytes (${output.length - before >= 0 ? '+' : ''}${output.length - before}) · ${summary}`);
}

document.querySelector('#save').addEventListener('click', save);
document.querySelector('#value').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') save();
});
document.querySelector('#file').addEventListener('change', async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  try {
    const { texts, summary } = show(file.name, new Uint8Array(await file.arrayBuffer()));
    logLine(`🖼️ ${file.name} · ${file.size} bytes · ${summary} · ${texts.length} texto(s)`);
  } catch (error) {
    setStatus(`No se pudo leer ${file.name}: ${error.message}`);
    logLine(`⚠️ ${file.name}: ${error.message}`);
  }
});

try {
  const bytes = new Uint8Array(await (await fetch('tile.png')).arrayBuffer());
  const { texts, summary } = show('tile.png', bytes);
  logLine(`🖼️ tile.png · ${bytes.length} bytes · ${summary}`);
  for (const [key, value, type] of texts) logLine(`📝 ${key} = ${value} (${type})`);
  logLine('Listo: elige «Author», escribe «Taller de Puebla» y pulsa «Guardar en el PNG»; prueba también un valor con «€»');
} catch (error) {
  logLine(`⚠️ ${error.message}`);
}
```
