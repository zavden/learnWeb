---
example_description: "Un inspector de archivos: lee solo los primeros 256 KB con file.slice().arrayBuffer(), reconoce el formato por su firma (PNG, JPEG, GIF, WebP, BMP, WAV, MP3, MP4, PDF, ZIP, gzip y WebAssembly), saca medidas y datos de cada cabecera con DataView y avisa cuando la extensión o el tipo MIME no coinciden con los bytes"
example_tags: "javascript|archivos|firmas|magic-numbers|dataview|png|jpeg|wav|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="inspector-app">
  <h1>¿Qué hay en este archivo?</h1>
  <p class="intro">Elige un archivo de tu equipo: no sale de tu navegador. Solo se leen sus primeros 256 KB.</p>
  <p><label>Archivo <input id="file" type="file"></label></p>
  <div class="samples" role="group" aria-label="Archivos de ejemplo">
    <span>O prueba con:</span>
    <button type="button" data-sample="tile.png" data-type="image/png">tile.png</button>
    <button type="button" data-sample="chime.wav" data-type="audio/wav">chime.wav</button>
    <button type="button" data-sample="landscape.bmp" data-type="image/bmp">landscape.bmp</button>
    <button type="button" data-sample="tile.png" data-name="foto-de-perfil.jpg" data-type="image/jpeg">foto-de-perfil.jpg</button>
  </div>
  <section class="report" aria-labelledby="report-title" aria-live="polite">
    <h2 id="report-title">Resultado</h2>
    <p id="verdict" class="verdict"></p>
    <dl id="details"></dl>
  </section>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; --warn-bg: #fef3c7; --warn-ink: #78350f; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.inspector-app { max-width: 40rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0 0 0.25rem; font-size: 1.25rem; }
h2 { margin: 0 0 0.5rem; font-size: 1rem; }
.intro { margin-top: 0; color: var(--muted); }
button { font: inherit; padding: 0.25rem 0.6rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); color: var(--ink); cursor: pointer; }
:is(button, input):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.samples { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; font-size: 0.9rem; }
.report { margin-top: 1rem; padding: 0.75rem 1rem; border: 1px solid var(--line); border-radius: 0.6rem; background: var(--surface); }
.verdict { margin: 0 0 0.5rem; font-weight: 600; }
.verdict[data-warning] { padding: 0.4rem 0.6rem; border-radius: 0.4rem; background: var(--warn-bg); color: var(--warn-ink); }
dl { display: grid; grid-template-columns: max-content 1fr; gap: 0.2rem 1rem; margin: 0; font-size: 0.9rem; }
dt { color: var(--muted); }
dd { margin: 0; overflow-wrap: anywhere; }
.mono { font-family: Menlo, Consolas, monospace; font-size: 0.85em; }
.log { margin: 1rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
```

# JavaScript

```javascript
// Inspector de archivos por sus «números mágicos».
//
// Decisiones de diseño:
// - El tipo se decide por los BYTES, no por el nombre ni por file.type (que el
//   navegador deduce de la extensión). Si el nombre o el tipo dicen otro formato
//   conocido, se avisa.
// - Solo se leen los primeros 256 KB (file.slice(0, LIMIT).arrayBuffer()): basta
//   para cualquier cabecera y no carga un vídeo de 2 GB en memoria.
// - Cada formato tiene su función de detalles; todas leen con un DataView y
//   comprueban que hay bytes suficientes (un archivo cortado no lanza errores
//   raros: dice «cabecera incompleta»).
// - El archivo elegido no sale del navegador: no hay ninguna petición de red
//   (los botones de ejemplo sí descargan sus archivos de assets/).
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos, los
// formularios, la red (fetch) y este módulo.

const LIMIT = 256 * 1024;
const logList = document.querySelector('#log');
const verdict = document.querySelector('#verdict');
const details = document.querySelector('#details');
const latin1 = new TextDecoder('windows-1252');
const utf8 = new TextDecoder();

function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const ascii = (text) => Array.from(text, (char) => char.charCodeAt(0));
const matches = (bytes, signature, offset = 0) => signature.every((byte, index) => bytes[offset + index] === byte);
const text = (bytes, start, length) => latin1.decode(bytes.subarray(start, start + length));
const hexBytes = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(' ');

// --- Detalles de cada formato (reciben bytes y un DataView; devuelven [nombre, valor]) ---
function pngDetails(bytes, view) {
  if (bytes.length < 33) return [['cabecera', 'incompleta']];
  const COLOR = { 0: 'gris', 2: 'RGB', 3: 'paleta', 4: 'gris + alfa', 6: 'RGBA' };
  const texts = [];
  for (let at = 8; at + 12 <= bytes.length; at += 12 + view.getUint32(at, false)) {
    if (text(bytes, at + 4, 4) === 'tEXt') texts.push(text(bytes, at + 8, view.getUint32(at, false)).split('\0')[0]);
  }
  return [
    ['medidas', `${view.getUint32(16, false)} × ${view.getUint32(20, false)} px`],
    ['color', `${view.getUint8(24)} bits por canal, ${COLOR[view.getUint8(25)] ?? 'desconocido'}`],
    ['textos', texts.length ? texts.join(', ') : 'ninguno'],
  ];
}
function jpegDetails(bytes, view) {
  // Segmentos: ff + marcador + longitud (big-endian). SOF0-SOF15 (salvo c4, c8, cc) traen las medidas.
  for (let at = 2; at + 9 <= bytes.length && bytes[at] === 0xff; ) {
    const marker = bytes[at + 1];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return [['medidas', `${view.getUint16(at + 7, false)} × ${view.getUint16(at + 5, false)} px`], ['codificación', marker === 0xc2 ? 'progresiva' : 'secuencial']];
    }
    at += 2 + view.getUint16(at + 2, false);
  }
  return [['medidas', 'no están en los primeros 256 KB']];
}
const gifDetails = (bytes, view) => (bytes.length < 10 ? [['cabecera', 'incompleta']] : [['versión', text(bytes, 0, 6)], ['medidas', `${view.getUint16(6, true)} × ${view.getUint16(8, true)} px`]]);
const bmpDetails = (bytes, view) => (bytes.length < 30 ? [['cabecera', 'incompleta']] : [
  ['medidas', `${view.getInt32(18, true)} × ${Math.abs(view.getInt32(22, true))} px`],
  ['filas', view.getInt32(22, true) < 0 ? 'de arriba abajo' : 'de abajo arriba'],
  ['bits por píxel', view.getUint16(28, true)],
]);
function riffChunks(bytes, view) {
  const chunks = {};
  for (let at = 12; at + 8 <= bytes.length; at += 8 + view.getUint32(at + 4, true) + (view.getUint32(at + 4, true) % 2)) {
    chunks[text(bytes, at, 4)] = { start: at + 8, size: view.getUint32(at + 4, true) };
  }
  return chunks;
}
function wavDetails(bytes, view) {
  const { 'fmt ': format, data } = riffChunks(bytes, view);
  if (!format) return [['cabecera', 'sin fragmento fmt']];
  const channels = view.getUint16(format.start + 2, true);
  const sampleRate = view.getUint32(format.start + 4, true);
  const byteRate = view.getUint32(format.start + 8, true);
  const result = [
    ['formato', view.getUint16(format.start, true) === 1 ? 'PCM sin comprimir' : `código ${view.getUint16(format.start, true)}`],
    ['canales', channels === 1 ? 'mono' : channels === 2 ? 'estéreo' : channels],
    ['muestreo', `${sampleRate} Hz, ${view.getUint16(format.start + 14, true)} bits`],
  ];
  if (data) result.push(['duración', `${(data.size / byteRate).toFixed(2)} s`]);
  return result;
}
function webpDetails(bytes, view) {
  const kind = text(bytes, 12, 4);
  if (kind === 'VP8X' && bytes.length >= 30) {
    const u24 = (at) => bytes[at] | (bytes[at + 1] << 8) | (bytes[at + 2] << 16); // 24 bits, little-endian
    const width = 1 + u24(24);
    const height = 1 + u24(27);
    return [['medidas', `${width} × ${height} px`], ['variante', 'extendida (VP8X)']];
  }
  if (kind === 'VP8L' && bytes.length >= 25) {
    const bits = view.getUint32(21, true); // 14 bits de ancho - 1 y 14 de alto - 1
    return [['medidas', `${(bits & 0x3fff) + 1} × ${((bits >>> 14) & 0x3fff) + 1} px`], ['variante', 'sin pérdida (VP8L)']];
  }
  if (kind === 'VP8 ' && bytes.length >= 30) {
    return [['medidas', `${view.getUint16(26, true) & 0x3fff} × ${view.getUint16(28, true) & 0x3fff} px`], ['variante', 'con pérdida (VP8)']];
  }
  return [['variante', kind]];
}
function zipDetails(bytes, view) {
  if (bytes.length < 30) return [['cabecera', 'incompleta']];
  const nameLength = view.getUint16(26, true);
  const first = utf8.decode(bytes.subarray(30, 30 + nameLength));
  const office = { '[Content_Types].xml': 'documento de Office (docx, xlsx, pptx)', mimetype: 'EPUB u OpenDocument' };
  return [['primer archivo', first], ['probablemente', office[first] ?? 'un ZIP']];
}

const FORMATS = [
  { id: 'png', name: 'PNG', mimes: ['image/png'], ext: ['png'], test: (b) => matches(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), details: pngDetails },
  { id: 'jpeg', name: 'JPEG', mimes: ['image/jpeg'], ext: ['jpg', 'jpeg'], test: (b) => matches(b, [0xff, 0xd8, 0xff]), details: jpegDetails },
  { id: 'gif', name: 'GIF', mimes: ['image/gif'], ext: ['gif'], test: (b) => matches(b, ascii('GIF87a')) || matches(b, ascii('GIF89a')), details: gifDetails },
  { id: 'webp', name: 'WebP', mimes: ['image/webp'], ext: ['webp'], test: (b) => matches(b, ascii('RIFF')) && matches(b, ascii('WEBP'), 8), details: webpDetails },
  { id: 'bmp', name: 'BMP', mimes: ['image/bmp', 'image/x-ms-bmp'], ext: ['bmp'], test: (b) => matches(b, ascii('BM')), details: bmpDetails },
  { id: 'wav', name: 'WAV', mimes: ['audio/wav', 'audio/x-wav', 'audio/wave'], ext: ['wav'], test: (b) => matches(b, ascii('RIFF')) && matches(b, ascii('WAVE'), 8), details: wavDetails },
  { id: 'mp3', name: 'MP3', mimes: ['audio/mpeg', 'audio/mp3'], ext: ['mp3'], test: (b) => matches(b, ascii('ID3')) || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0), details: (b) => [['etiqueta ID3', matches(b, ascii('ID3')) ? `v2.${b[3]}` : 'no']] },
  { id: 'mp4', name: 'MP4 / MOV', mimes: ['video/mp4', 'audio/mp4', 'audio/x-m4a', 'video/quicktime'], ext: ['mp4', 'm4a', 'mov'], test: (b) => matches(b, ascii('ftyp'), 4), details: (b) => [['marca', text(b, 8, 4)]] },
  { id: 'pdf', name: 'PDF', mimes: ['application/pdf'], ext: ['pdf'], test: (b) => matches(b, ascii('%PDF-')), details: (b) => [['versión', text(b, 5, 3)]] },
  { id: 'zip', name: 'ZIP', mimes: ['application/zip', 'application/x-zip-compressed'], ext: ['zip', 'docx', 'xlsx', 'pptx', 'epub', 'odt'], test: (b) => matches(b, [0x50, 0x4b, 0x03, 0x04]), details: zipDetails },
  { id: 'gzip', name: 'gzip', mimes: ['application/gzip', 'application/x-gzip'], ext: ['gz', 'tgz'], test: (b) => matches(b, [0x1f, 0x8b]), details: () => [] },
  { id: 'wasm', name: 'WebAssembly', mimes: ['application/wasm'], ext: ['wasm'], test: (b) => matches(b, [0x00, 0x61, 0x73, 0x6d]), details: (b, v) => [['versión', b.length >= 8 ? v.getUint32(4, true) : '?']] },
];

function render(rows) {
  details.replaceChildren(...rows.flatMap(([name, value]) => [
    Object.assign(document.createElement('dt'), { textContent: name }),
    Object.assign(document.createElement('dd'), { textContent: String(value) }),
  ]));
}

async function inspect(file) {
  const bytes = new Uint8Array(await file.slice(0, LIMIT).arrayBuffer());
  const view = new DataView(bytes.buffer);
  const format = FORMATS.find((candidate) => candidate.test(bytes));
  const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
  const rows = [['nombre', file.name], ['tamaño', `${file.size} bytes`], ['tipo según el navegador', file.type || '(desconocido)'], ['primeros bytes', hexBytes(bytes.subarray(0, 12))]];
  const warnings = [];
  if (format) {
    rows.push(...format.details(bytes, view));
    // Solo se avisa si el nombre o el tipo dicen OTRO formato conocido (sin falsos positivos
    // con tipos raros como application/vnd.openxmlformats-…, que es un ZIP).
    const byExtension = FORMATS.find((candidate) => candidate.ext.includes(extension));
    const byMime = FORMATS.find((candidate) => candidate.mimes.includes(file.type));
    if (byExtension && byExtension !== format) warnings.push(`la extensión dice .${extension}`);
    if (byMime && byMime !== format) warnings.push(`el tipo MIME dice ${file.type}`);
  }
  render(rows);
  details.querySelectorAll('dd')[3].classList.add('mono');
  const message = !format
    ? 'Formato desconocido: ninguna firma conocida coincide'
    : warnings.length ? `⚠️ Los bytes dicen ${format.name}, pero ${warnings.join(' y ')}` : `Es un ${format.name}`;
  verdict.textContent = message;
  verdict.toggleAttribute('data-warning', warnings.length > 0 || !format);
  const summary = rows.slice(4).map(([name, value]) => `${name}: ${value}`).join(' · ');
  logLine(`🔎 ${file.name} → ${message}${summary ? ` · ${summary}` : ''}`);
}

async function inspectSample(button) {
  const response = await fetch(button.dataset.sample);
  if (!response.ok) throw new Error(`${button.dataset.sample}: HTTP ${response.status}`);
  const name = button.dataset.name ?? button.dataset.sample;
  await inspect(new File([await response.blob()], name, { type: button.dataset.type }));
}

document.querySelector('#file').addEventListener('change', (event) => {
  const [file] = event.target.files;
  if (file) inspect(file).catch((error) => logLine(`⚠️ No se pudo leer ${file.name}: ${error.message}`));
});
document.querySelector('.samples').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (button) inspectSample(button).catch((error) => logLine(`⚠️ ${error.message}`));
});

try {
  await inspectSample(document.querySelector('[data-sample="tile.png"]'));
  logLine('Listo: elige un archivo tuyo o prueba con chime.wav y con «foto-de-perfil.jpg»');
} catch (error) {
  logLine(`⚠️ ${error.message}`);
}
```
