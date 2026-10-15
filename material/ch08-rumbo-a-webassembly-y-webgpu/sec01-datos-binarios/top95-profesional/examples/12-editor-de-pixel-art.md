---
example_description: "Un editor de pixel art de 16 × 16 que guarda cada píxel en 4 bits (dos por byte, 128 bytes en total) y exporta a BMP de 24 bits con DataView y a PNG indexado de 4 bits con su paleta, comprimido con CompressionStream y con el CRC de cada fragmento; el dibujo se guarda en base64 en localStorage y se valida al cargarlo"
example_tags: "javascript|pixel-art|bits|png|bmp|compressionstream|crc32|localstorage|accesibilidad|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="pixel-app">
  <h1>Calaverita en pixel art</h1>
  <fieldset class="palette">
    <legend>Color</legend>
    <div id="palette" class="swatches"></div>
  </fieldset>
  <div id="canvas" class="canvas" role="grid" aria-label="Lienzo de 16 por 16 píxeles" aria-describedby="canvas-help"></div>
  <p id="canvas-help" class="help">Muévete con las flechas y pinta con Espacio o Intro (o con el ratón).</p>
  <div class="actions">
    <button id="export-bmp" type="button">Exportar BMP</button>
    <button id="export-png" type="button">Exportar PNG</button>
    <button id="save" type="button">Guardar en este navegador</button>
    <button id="reset" type="button">Volver al dibujo inicial</button>
    <button id="forget" type="button">Borrar lo guardado</button>
  </div>
  <p id="status" role="status"></p>
  <div id="exports" class="exports"></div>
  <p class="note">Las descargas no funcionan en las tarjetas de la galería y de la teoría, y allí el almacenamiento es una simulación en memoria: ábrelo con ▶ o en el editor.</p>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.pixel-app { max-width: 36rem; margin: 0 auto; padding: 1rem; display: grid; gap: 0.6rem; }
h1 { margin: 0; font-size: 1.25rem; }
p { margin: 0; }
.palette { margin: 0; border: 1px solid var(--line); border-radius: 0.5rem; }
.swatches { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.swatches label { display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.8rem; }
.swatch { display: inline-block; inline-size: 1rem; block-size: 1rem; border: 1px solid var(--muted); border-radius: 0.2rem; }
.canvas { display: grid; inline-size: max-content; border: 1px solid var(--muted); }
.canvas [role="row"] { display: grid; grid-template-columns: repeat(16, 1.25rem); }
.canvas [role="gridcell"] { display: block; block-size: 1.25rem; }
.pixel { display: block; inline-size: 1.25rem; block-size: 1.25rem; padding: 0; border: 0; cursor: pointer; }
.pixel:focus-visible { outline: 3px solid var(--accent); outline-offset: -3px; box-shadow: inset 0 0 0 4px #ffffff; }
.help, .note { font-size: 0.8rem; color: var(--muted); }
.actions { display: flex; flex-wrap: wrap; gap: 0.4rem; }
button { font: inherit; padding: 0.3rem 0.65rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); color: var(--ink); cursor: pointer; }
:is(button, input):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.exports { display: flex; flex-wrap: wrap; gap: 1rem; }
.exports figure { margin: 0; font-size: 0.8rem; }
.exports img { display: block; inline-size: 96px; block-size: 96px; image-rendering: pixelated; border: 1px solid var(--line); }
.exports a { color: var(--accent); }
.log { margin: 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
```

# JavaScript

```javascript
// Editor de pixel art con formatos binarios propios y estándar.
//
// Decisiones de diseño:
// - 8 colores caben en 3 bits; se usan 4 (medio byte) porque así dos píxeles
//   llenan un byte y el dibujo entero ocupa 128 bytes. Es exactamente el formato
//   de las filas de un PNG indexado de 4 bits: el pixel de la izquierda en el
//   medio byte alto.
// - BMP (24 bits, sin comprimir) con DataView en little-endian: 16 px × 3 bytes =
//   48 bytes por fila, ya múltiplo de 4 (sin relleno).
// - PNG indexado: IHDR + PLTE (la paleta) + IDAT (las filas comprimidas con
//   CompressionStream('deflate'), que produce el formato zlib que pide PNG) + IEND,
//   cada fragmento con su CRC-32. El resultado se vuelve a comprobar antes de ofrecerlo.
// - Guardado en localStorage (clave lw-bin-pixel) como base64 de 1 byte de versión
//   + 128 bytes; al cargarlo se valida la versión, la longitud y cada índice.
// - Rejilla con tabindex itinerante; cada píxel dice su posición y su color.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos, la red
// (streams), el almacenamiento (capítulo 6) y este módulo.

const SIZE = 16;
const STORAGE_KEY = 'lw-bin-pixel';
const PALETTE = [
  ['crema', [254, 243, 199]], ['tinta', [30, 41, 59]], ['blanco', [255, 255, 255]], ['cempasúchil', [255, 159, 28]],
  ['morado', [124, 58, 237]], ['rosa mexicano', [228, 0, 124]], ['verde', [22, 163, 74]], ['azul', [29, 78, 216]],
];
const KEYS = '.kwoprgb'; // un carácter por color, para escribir el dibujo inicial
const SKETCH = ['........', '...wwwww', '..wwwwwr', '.wwwwwrp', '.wwkkkww', '.wkkokww', '.wwkkkww', '.wwwwwwk',
  '.rwwwwww', '..wwwwww', '...wkwkw', '...wkwkw', '....wwbw', '.....www', '........', 'g..g....']; // mitad izquierda
const canvas = document.querySelector('#canvas');
const logList = document.querySelector('#log');
let pixels = new Uint8Array(SIZE * SIZE / 2); // 4 bits por píxel
let color = 3;
let focusIndex = 0;
const urls = [];

function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const setStatus = (text) => { document.querySelector('#status').textContent = text; };

// --- 4 bits por píxel ---
const getPixel = (index) => (index % 2 === 0 ? pixels[index >> 1] >> 4 : pixels[index >> 1] & 0x0f);
function setPixel(index, value) {
  const byte = pixels[index >> 1];
  pixels[index >> 1] = index % 2 === 0 ? (value << 4) | (byte & 0x0f) : (byte & 0xf0) | value;
}
function loadSketch() {
  pixels = new Uint8Array(SIZE * SIZE / 2);
  SKETCH.forEach((half, y) => {
    [...half + [...half].reverse().join('')].forEach((key, x) => setPixel(y * SIZE + x, KEYS.indexOf(key)));
  });
}

// --- CRC-32 y base64 ---
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
const toBase64 = (bytes) => (bytes.toBase64 ? bytes.toBase64() : btoa(String.fromCharCode(...bytes)));
const fromBase64 = (text) => (Uint8Array.fromBase64 ? Uint8Array.fromBase64(text) : Uint8Array.from(atob(text), (char) => char.charCodeAt(0)));

// --- Exportar ---
function toBmp() {
  const rowSize = SIZE * 3; // 48: ya es múltiplo de 4
  const view = new DataView(new ArrayBuffer(54 + rowSize * SIZE));
  view.setUint16(0, 0x4d42, true);
  view.setUint32(2, view.byteLength, true);
  view.setUint32(10, 54, true);
  view.setUint32(14, 40, true);
  view.setInt32(18, SIZE, true);
  view.setInt32(22, SIZE, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(34, rowSize * SIZE, true);
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const [r, g, b] = PALETTE[getPixel(y * SIZE + x)][1];
      const at = 54 + (SIZE - 1 - y) * rowSize + x * 3; // de abajo arriba
      view.setUint8(at, b);
      view.setUint8(at + 1, g);
      view.setUint8(at + 2, r);
    }
  }
  return new Uint8Array(view.buffer);
}

function chunk(type, data) {
  const bytes = new Uint8Array(12 + data.length);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, data.length, false);
  bytes.set(Array.from(type, (char) => char.charCodeAt(0)), 4);
  bytes.set(data, 8);
  view.setUint32(8 + data.length, crc32(bytes.subarray(4, 8 + data.length)), false);
  return bytes;
}
async function zlibDeflate(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
async function toPng() {
  const header = new Uint8Array(13);
  const view = new DataView(header.buffer);
  view.setUint32(0, SIZE, false);
  view.setUint32(4, SIZE, false);
  header.set([4, 3], 8); // 4 bits por píxel, tipo de color 3 (paleta)
  const rowBytes = SIZE / 2;
  const raw = new Uint8Array(SIZE * (1 + rowBytes));
  for (let y = 0; y < SIZE; y += 1) raw.set(pixels.subarray(y * rowBytes, (y + 1) * rowBytes), y * (1 + rowBytes) + 1); // filtro 0 + fila
  const parts = [
    Uint8Array.of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a),
    chunk('IHDR', header),
    chunk('PLTE', Uint8Array.from(PALETTE.flatMap(([, rgb]) => rgb))),
    chunk('IDAT', await zlibDeflate(raw)),
    chunk('IEND', new Uint8Array(0)),
  ];
  const png = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    png.set(part, offset);
    offset += part.length;
  }
  return png;
}
function checkPng(png) {
  const view = new DataView(png.buffer);
  let ok = 0;
  let total = 0;
  for (let at = 8; at + 12 <= png.length; at += 12 + view.getUint32(at, false)) {
    const length = view.getUint32(at, false);
    total += 1;
    if (view.getUint32(at + 8 + length, false) === crc32(png.subarray(at + 4, at + 8 + length))) ok += 1;
  }
  return `${ok}/${total}`;
}

function offer(bytes, name, type) {
  const url = URL.createObjectURL(new Blob([bytes], { type }));
  urls.push(url);
  const figure = document.createElement('figure');
  const image = Object.assign(document.createElement('img'), { src: url, alt: `La calaverita exportada como ${name}` });
  const link = Object.assign(document.createElement('a'), { href: url, download: name, textContent: `Descargar ${name} (${bytes.length} bytes)` });
  figure.append(image, link);
  document.querySelector('#exports').prepend(figure);
}

// --- Lienzo ---
function buildCanvas() {
  const rows = [];
  for (let y = 0; y < SIZE; y += 1) {
    const row = document.createElement('div');
    row.setAttribute('role', 'row');
    for (let x = 0; x < SIZE; x += 1) {
      const cell = document.createElement('span');
      cell.setAttribute('role', 'gridcell');
      const button = Object.assign(document.createElement('button'), { type: 'button', className: 'pixel', tabIndex: -1 });
      button.dataset.index = y * SIZE + x;
      cell.append(button);
      row.append(cell);
    }
    rows.push(row);
  }
  canvas.replaceChildren(...rows);
}
function paintCanvas() {
  for (const button of canvas.querySelectorAll('.pixel')) {
    const index = Number(button.dataset.index);
    const [name, [r, g, b]] = PALETTE[getPixel(index)];
    button.style.background = `rgb(${r} ${g} ${b})`;
    button.setAttribute('aria-label', `fila ${Math.floor(index / SIZE) + 1}, columna ${(index % SIZE) + 1}: ${name}`);
    button.tabIndex = index === focusIndex ? 0 : -1;
  }
}
function buildPalette() {
  document.querySelector('#palette').replaceChildren(...PALETTE.map(([name, [r, g, b]], index) => {
    const label = document.createElement('label');
    const radio = Object.assign(document.createElement('input'), { type: 'radio', name: 'color', value: index, checked: index === color });
    const swatch = Object.assign(document.createElement('span'), { className: 'swatch' });
    swatch.style.background = `rgb(${r} ${g} ${b})`;
    label.append(radio, swatch, name);
    return label;
  }));
}

canvas.addEventListener('click', (event) => {
  const button = event.target.closest('.pixel');
  if (!button) return;
  focusIndex = Number(button.dataset.index);
  setPixel(focusIndex, color);
  paintCanvas();
  logLine(`🖌️ (${(focusIndex % SIZE) + 1}, ${Math.floor(focusIndex / SIZE) + 1}) → ${PALETTE[color][0]}`);
});
canvas.addEventListener('keydown', (event) => {
  const steps = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] };
  if (!(event.key in steps)) return;
  event.preventDefault();
  const [dx, dy] = steps[event.key];
  const x = Math.min(SIZE - 1, Math.max(0, (focusIndex % SIZE) + dx));
  const y = Math.min(SIZE - 1, Math.max(0, Math.floor(focusIndex / SIZE) + dy));
  focusIndex = y * SIZE + x;
  paintCanvas();
  canvas.querySelector(`[data-index="${focusIndex}"]`).focus();
});
document.querySelector('#palette').addEventListener('change', (event) => {
  color = Number(event.target.value);
  setStatus(`Color: ${PALETTE[color][0]}`);
});

document.querySelector('#export-bmp').addEventListener('click', () => {
  const bmp = toBmp();
  offer(bmp, 'calaverita.bmp', 'image/bmp');
  logLine(`🖼️ calaverita.bmp: ${bmp.length} bytes (24 bits por píxel, sin comprimir)`);
});
document.querySelector('#export-png').addEventListener('click', async () => {
  try {
    const png = await toPng();
    offer(png, 'calaverita.png', 'image/png');
    logLine(`🖼️ calaverita.png: indexado de 4 bits · CRC correctos ${checkPng(png)} · más pequeño que el BMP: ${png.length < 54 + SIZE * SIZE * 3}`);
  } catch (error) {
    logLine(`⚠️ No se pudo crear el PNG: ${error.message}`);
  }
});
document.querySelector('#save').addEventListener('click', () => {
  const record = new Uint8Array(1 + pixels.length);
  record[0] = 1; // versión del formato
  record.set(pixels, 1);
  try {
    localStorage.setItem(STORAGE_KEY, toBase64(record));
    setStatus('Dibujo guardado en este navegador.');
    logLine(`💾 guardado: ${record.length} bytes → ${toBase64(record).length} caracteres en base64`);
  } catch (error) {
    setStatus(`No se pudo guardar: ${error.message}`);
  }
});
document.querySelector('#reset').addEventListener('click', () => {
  loadSketch();
  paintCanvas();
  logLine('↩️ dibujo inicial');
});
document.querySelector('#forget').addEventListener('click', () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // sin almacenamiento: no hay nada que borrar
  }
  setStatus('Borrado lo guardado en este navegador.');
  logLine('🗑️ dibujo guardado borrado');
});
window.addEventListener('pagehide', () => urls.forEach((url) => URL.revokeObjectURL(url)));

function restore() {
  let saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    return 'sin acceso al almacenamiento: dibujo inicial';
  }
  if (saved === null) return 'dibujo inicial';
  try {
    const record = fromBase64(saved);
    const valid = record.length === 1 + SIZE * SIZE / 2 && record[0] === 1
      && record.subarray(1).every((byte) => (byte >> 4) < PALETTE.length && (byte & 0x0f) < PALETTE.length);
    if (!valid) return 'lo guardado no es válido: dibujo inicial';
    pixels = record.slice(1); // copia: el registro no se reutiliza
    return 'dibujo recuperado de este navegador';
  } catch {
    return 'lo guardado no es base64: dibujo inicial';
  }
}

loadSketch();
buildPalette();
buildCanvas();
setStatus(`Color: ${PALETTE[color][0]} · ${restore()}`);
paintCanvas();
logLine(`🎨 ${SIZE} × ${SIZE} píxeles · ${PALETTE.length} colores · 4 bits por píxel → ${pixels.length} bytes`);
logLine('Listo: pinta un par de píxeles, pulsa «Exportar PNG» y «Exportar BMP» y compara los tamaños');
```
