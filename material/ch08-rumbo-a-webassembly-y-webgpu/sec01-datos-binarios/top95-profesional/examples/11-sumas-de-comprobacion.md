---
example_description: "Una herramienta de sumas de comprobación: CRC-32 calculado por trozos con file.stream() y una barra de progreso, SHA-256 con crypto.subtle, y comparación con la suma publicada por el autor (sin importar mayúsculas, espacios ni dos puntos) para saber si una descarga llegó intacta"
example_tags: "javascript|crc32|sha-256|crypto|streams|archivos|integridad|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="checksum-app">
  <h1>¿Llegó intacto?</h1>
  <p><label>Archivo <input id="file" type="file"></label></p>
  <div class="samples" role="group" aria-label="Archivos de ejemplo">
    <span>O usa uno de ejemplo:</span>
    <button type="button" data-sample="tile.png">tile.png</button>
    <button type="button" data-sample="chime.wav">chime.wav</button>
    <button type="button" data-sample="air-quality.csv">air-quality.csv</button>
  </div>
  <p><label for="progress">Progreso</label> <progress id="progress" max="1" value="0"></progress></p>
  <dl class="sums">
    <dt>Archivo</dt><dd id="file-name">—</dd>
    <dt><label for="crc">CRC-32</label></dt><dd><input id="crc" type="text" readonly></dd>
    <dt><label for="sha">SHA-256</label></dt><dd><input id="sha" type="text" readonly></dd>
  </dl>
  <p class="compare">
    <label for="expected">Suma publicada</label>
    <input id="expected" type="text" autocomplete="off" spellcheck="false" placeholder="pega aquí un CRC-32 o un SHA-256">
    <button id="check" type="button">Comparar</button>
  </p>
  <p id="verdict" class="verdict" role="status"></p>
  <details>
    <summary>Sumas publicadas de los archivos de ejemplo (SHA256SUMS)</summary>
    <pre class="published">fb9f3a8dfaf99af22d7b6769c7fb54a749d2d8e46df0c6464d07f69cca2c7151  tile.png
9a1f1a1d87ec0b9326f57a88f67b103eea7988647b3cec2c4473b304efb54567  chime.wav
9fd1a7d69ebcd9a6d14e95d2037fe98ed073360508127c7fb024e49511fd27b5  air-quality.csv</pre>
  </details>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; --ok-bg: #dcfce7; --ok-ink: #14532d; --bad-bg: #fee2e2; --bad-ink: #7f1d1d; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.checksum-app { max-width: 42rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0 0 0.5rem; font-size: 1.25rem; }
.samples { display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; font-size: 0.9rem; }
button, input { font: inherit; color: var(--ink); }
button { padding: 0.25rem 0.6rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); cursor: pointer; }
input[type="text"] { inline-size: 100%; padding: 0.25rem 0.4rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
:is(button, input, summary):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
progress { inline-size: 12rem; vertical-align: middle; accent-color: var(--accent); }
.sums { display: grid; grid-template-columns: max-content 1fr; gap: 0.35rem 0.75rem; align-items: center; }
dd { margin: 0; overflow-wrap: anywhere; }
.compare { display: grid; grid-template-columns: 1fr auto; gap: 0.3rem 0.5rem; align-items: center; }
.compare label { grid-column: 1 / -1; }
.verdict { padding: 0.4rem 0.6rem; border-radius: 0.4rem; font-weight: 600; }
.verdict:empty { padding: 0; }
.verdict[data-result="ok"] { background: var(--ok-bg); color: var(--ok-ink); }
.verdict[data-result="bad"] { background: var(--bad-bg); color: var(--bad-ink); }
.published { overflow-x: auto; font-size: 0.7rem; }
.log { margin: 1rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.72rem; overflow-wrap: anywhere; }
```

# JavaScript

```javascript
// Sumas de comprobación de un archivo.
//
// Decisiones de diseño:
// - CRC-32 por trozos con file.stream() y for await: la memoria no crece con el
//   tamaño del archivo y la barra avanza (cada await deja pintar a la página).
// - SHA-256 con crypto.subtle.digest, que necesita todos los bytes de una vez:
//   por encima de 512 MB no se calcula (se dice por qué). crypto.subtle solo
//   existe en contextos seguros (HTTPS o localhost): se comprueba antes.
// - La suma publicada se normaliza (minúsculas, sin espacios ni «:»; o se toma de
//   una línea de SHA256SUMS) y se decide por su longitud si es un CRC-32 (8 cifras)
//   o un SHA-256 (64).
// - Cada cálculo nuevo cancela el anterior: si eliges otro archivo a mitad, el
//   resultado viejo no pisa al nuevo.
// - El CRC detecta errores de transmisión; el SHA-256, además, manipulaciones.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos, la red
// (fetch, streams) y este módulo.

const SHA_LIMIT = 512 * 1024 * 1024;
const logList = document.querySelector('#log');
const progress = document.querySelector('#progress');
let current = null; // { name, crc, sha }
let runId = 0;

function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const CRC_TABLE = Uint32Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let bit = 0; bit < 8; bit += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
const toHex = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

async function crc32Of(file, myRun) {
  let crc = 0xffffffff;
  let done = 0;
  for await (const chunk of file.stream()) {
    if (myRun !== runId) return null; // llegó otro archivo: se abandona este
    for (const byte of chunk) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    done += chunk.byteLength;
    progress.value = file.size ? done / file.size : 1;
  }
  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0');
}

async function sha256Of(file) {
  if (!globalThis.crypto?.subtle) return 'no disponible (hace falta HTTPS o localhost)';
  if (file.size > SHA_LIMIT) return 'no calculado: el archivo pasa de 512 MB';
  return toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', await file.arrayBuffer())));
}

async function checkFile(file) {
  runId += 1;
  const myRun = runId;
  progress.value = 0;
  document.querySelector('#file-name').textContent = `${file.name} · ${file.size} bytes`;
  document.querySelector('#crc').value = 'calculando…';
  document.querySelector('#sha').value = 'calculando…';
  const crc = await crc32Of(file, myRun);
  const sha = await sha256Of(file);
  if (myRun !== runId || crc === null) return;
  current = { name: file.name, crc, sha };
  document.querySelector('#crc').value = crc;
  document.querySelector('#sha').value = sha;
  logLine(`🧮 ${file.name} · ${file.size} bytes · CRC-32 ${crc} · SHA-256 ${sha}`);
  if (document.querySelector('#expected').value.trim()) compare();
}

function compare() {
  const verdict = document.querySelector('#verdict');
  const raw = document.querySelector('#expected').value.trim();
  // Acepta también una línea de SHA256SUMS: «suma␠␠nombre».
  const line = raw.match(/^([0-9a-f]{8}|[0-9a-f]{64})\s+\*?(\S+)$/i);
  const expected = (line ? line[1] : raw).toLowerCase().replace(/[\s:]/g, '');
  const otherName = line && current && line[2] !== current.name ? ` (ojo: esa línea es de ${line[2]})` : '';
  let result;
  let message;
  if (!current) {
    message = 'Elige primero un archivo.';
  } else if (!/^[0-9a-f]+$/.test(expected) || ![8, 64].includes(expected.length)) {
    message = 'La suma publicada no parece un CRC-32 (8 cifras hex) ni un SHA-256 (64).';
  } else {
    const kind = expected.length === 8 ? 'CRC-32' : 'SHA-256';
    const actual = kind === 'CRC-32' ? current.crc : current.sha;
    result = actual === expected ? 'ok' : 'bad';
    message = result === 'ok' ? `✅ El ${kind} coincide: ${current.name} está intacto.` : `❌ El ${kind} NO coincide: ${current.name} no es el archivo publicado (o llegó dañado)${otherName}.`;
  }
  verdict.textContent = message;
  if (result) verdict.dataset.result = result;
  else delete verdict.dataset.result;
  logLine(message);
}

document.querySelector('#file').addEventListener('change', (event) => {
  const [file] = event.target.files;
  if (file) checkFile(file).catch((error) => logLine(`⚠️ No se pudo leer ${file.name}: ${error.message}`));
});
document.querySelector('.samples').addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  try {
    const response = await fetch(button.dataset.sample);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await checkFile(new File([await response.blob()], button.dataset.sample));
  } catch (error) {
    logLine(`⚠️ ${button.dataset.sample}: ${error.message}`);
  }
});
document.querySelector('#check').addEventListener('click', compare);

try {
  const response = await fetch('tile.png');
  await checkFile(new File([await response.blob()], 'tile.png'));
  logLine('Listo: pulsa «chime.wav», copia su línea de las sumas publicadas en «Suma publicada» y pulsa «Comparar»');
} catch (error) {
  logLine(`⚠️ ${error.message}`);
}
```
