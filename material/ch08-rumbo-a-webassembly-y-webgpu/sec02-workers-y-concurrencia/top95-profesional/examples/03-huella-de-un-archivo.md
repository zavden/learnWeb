---
example_description: "La huella SHA-256 de un archivo calculada en un worker con una implementación incremental: lee el archivo por trozos, informa del progreso cada megabyte, se puede cancelar, se comprueba contra crypto.subtle.digest y se compara con la huella publicada (también una línea de un archivo SHA256SUMS)"
example_tags: "javascript|workers|sha256|hash|file|streams|progreso|cancelacion|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>Huella de un archivo</h1>
  <p class="intro">Comprueba que una descarga llegó intacta: su huella SHA-256 tiene que coincidir con la que publica su autor. El archivo no sale de tu navegador.</p>
  <div class="sources">
    <label>Tu archivo (hasta 50 MB) <input id="file" type="file"></label>
    <div class="buttons" role="group" aria-label="Archivos de prueba">
      <button type="button" data-sample="valley-of-mexico.jpg">valley-of-mexico.jpg</button>
      <button type="button" data-sample="sales.csv">sales.csv</button>
      <button id="generate" type="button">32 MB de prueba</button>
      <button id="cancel" type="button" disabled>Cancelar</button>
    </div>
  </div>
  <progress id="progress" max="1" value="0" aria-label="Progreso de la lectura"></progress>
  <p id="status" class="status" role="status"></p>
  <p class="hash"><code id="hash">—</code></p>
  <div class="compare">
    <label for="published">Huella publicada (o una línea de SHA256SUMS)</label>
    <input id="published" autocomplete="off" spellcheck="false">
    <button id="compare" type="button">Comparar</button>
    <p><output id="verdict" for="published" aria-live="polite"></output></p>
  </div>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; --ok: #166534; --bad: #b91c1c; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.app { max-width: 40rem; margin: 0 auto; padding: 1rem; display: grid; gap: 0.75rem; }
h1 { margin: 0; font-size: 1.25rem; }
.intro { margin: 0; color: var(--muted); }
.sources, .compare { display: grid; gap: 0.5rem; padding: 0.75rem 1rem; border: 1px solid var(--line); border-radius: 0.6rem; background: var(--surface); }
label { display: grid; gap: 0.2rem; font-size: 0.9rem; }
.buttons { display: flex; flex-wrap: wrap; gap: 0.4rem; }
input, button { font: inherit; color: var(--ink); }
#published { padding: 0.3rem 0.4rem; border: 1px solid var(--muted); border-radius: 0.4rem; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
button { justify-self: start; padding: 0.3rem 0.65rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: 0.6; }
:is(input, button):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
progress { inline-size: 100%; }
.status { margin: 0; font-weight: 600; }
.hash { margin: 0; overflow-wrap: anywhere; }
code { font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
output[data-result='ok'] { color: var(--ok); font-weight: 600; }
output[data-result='bad'] { color: var(--bad); font-weight: 600; }
.log { margin: 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-size: 0.8rem; overflow-wrap: anywhere; }
```

# JavaScript

```javascript
// HUELLA SHA-256 DE UN ARCHIVO, EN UN WORKER
//
// Decisiones de diseño:
// - crypto.subtle.digest necesita el archivo entero en memoria y no informa de nada
//   hasta el final. 03-hash/sha256.js es una implementación incremental (update/digest)
//   que el worker (03-hash/hash-worker.js) alimenta con los trozos de file.stream():
//   memoria constante, progreso cada MB y cancelación entre trozos.
// - La implementación propia se comprueba contra crypto.subtle con los archivos de
//   hasta 64 MB: si alguna vez no coincidieran, se diría.
// - El File viaja al worker como referencia (postMessage no copia sus bytes).
// - Límite de 50 MB para tus archivos: la versión en JavaScript procesa unos 50 MB por
//   segundo, y ningún ejemplo del curso ocupa la CPU más de un segundo por clic.
// - La huella publicada se normaliza (minúsculas, sin espacios ni «:»), y se acepta una
//   línea de un archivo SHA256SUMS («huella  nombre»): si el nombre no coincide, se avisa.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, File y streams del capítulo 6, bits,
// DataView y typed arrays del módulo «Datos binarios» y este módulo.
const LIMIT = 50 * 1024 * 1024;
const $ = (selector) => document.querySelector(selector);
const fmt = (n) => n.toLocaleString('es-MX');
function report(text) {
  console.log(text);
  $('#log').append(Object.assign(document.createElement('li'), { textContent: text }));
}

const worker = new Worker('03-hash/hash-worker.js', { type: 'module' });
addEventListener('pagehide', () => worker.terminate());
let nextId = 0;
let current = null; // { id, name, size, start, timed, resolve }
let lastResult = null; // { name, hex }

worker.onmessage = (event) => {
  const message = event.data;
  if (message.id !== current?.id) return;
  if (message.type === 'progress') {
    $('#progress').value = message.loaded / message.total;
    $('#status').textContent = `Leyendo ${current.name}: ${Math.floor((100 * message.loaded) / message.total)} %`;
    return;
  }
  const { name, size, start, timed, resolve } = current;
  current = null;
  setBusy(false);
  if (message.type === 'result') {
    $('#progress').value = 1;
    $('#hash').textContent = message.hex;
    lastResult = { name, hex: message.hex };
    const check = message.native === null ? '(sin comprobar con crypto.subtle)' : message.native === message.hex ? '✅ igual que crypto.subtle.digest' : '❌ distinta de crypto.subtle.digest';
    $('#status').textContent = `${name}: ${fmt(size)} bytes`;
    report(`🔐 ${name} · ${fmt(size)} bytes → ${message.hex} · ${check}`);
    if (timed) {
      const seconds = (performance.now() - start) / 1000;
      report(`⏱️ ${seconds.toFixed(2)} s · ${(size / 1024 / 1024 / seconds).toFixed(0)} MB/s, sin bloquear la página`);
    }
  } else if (message.type === 'cancelled') {
    $('#status').textContent = 'Cancelado';
    report(`⏹ ${name}: cancelado a mitad de lectura`);
  } else {
    report(`⚠️ ${name}: ${message.message}`);
  }
  resolve();
};

function setBusy(busy) {
  document.querySelectorAll('.sources button:not(#cancel), #file').forEach((control) => { control.disabled = busy; });
  $('#cancel').disabled = !busy;
}
function hashFile(file, name, { timed = false } = {}) {
  if (file.size > LIMIT) {
    report(`⚠️ ${name}: ${fmt(file.size)} bytes; en este ejemplo el límite es 50 MB`);
    return Promise.resolve();
  }
  const { promise, resolve } = Promise.withResolvers();
  current = { id: ++nextId, name, size: file.size, start: performance.now(), timed, resolve };
  $('#progress').value = 0;
  $('#hash').textContent = '…';
  $('#verdict').textContent = '';
  setBusy(true);
  worker.postMessage({ type: 'hash', id: current.id, file });
  return promise;
}

// Archivos de prueba: dos de «Assets» y 32 MB «aleatorios» con semilla (siempre los mismos).
document.querySelector('.sources').addEventListener('click', async (event) => {
  const sample = event.target.closest('button')?.dataset.sample;
  if (sample) await hashFile(await (await fetch(sample)).blob(), sample);
});
function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
$('#generate').addEventListener('click', () => {
  const words = new Uint32Array(8 * 1024 * 1024);
  const random = mulberry32(2026);
  for (let i = 0; i < words.length; i++) words[i] = Math.floor(random() * 2 ** 32);
  hashFile(new Blob([words]), 'prueba-32mb.bin', { timed: true });
});
$('#file').addEventListener('change', () => {
  const [file] = $('#file').files;
  if (file) hashFile(file, file.name, { timed: true });
});
$('#cancel').addEventListener('click', () => {
  if (current) worker.postMessage({ type: 'cancel', id: current.id });
});

// Comparar con la huella publicada: 64 cifras hexadecimales, quizá seguidas del nombre.
$('#compare').addEventListener('click', () => {
  const output = $('#verdict');
  const [rawHash = '', ...rest] = $('#published').value.trim().split(/\s+/);
  const published = rawHash.toLowerCase().replaceAll(':', '');
  const fileName = rest.join(' ').replace(/^\*/, ''); // en SHA256SUMS, «*» marca modo binario
  let text;
  if (!lastResult) text = 'Primero calcula la huella de un archivo.';
  else if (!/^[0-9a-f]{64}$/.test(published)) text = '⚠️ Una huella SHA-256 son 64 cifras hexadecimales.';
  else if (published === lastResult.hex) text = `✅ Coincide: ${lastResult.name} está intacto.`;
  else text = `❌ No coincide${fileName && fileName !== lastResult.name ? ` (y esa línea es de ${fileName}, no de ${lastResult.name})` : ''}.`;
  output.textContent = text;
  output.dataset.result = text.startsWith('✅') ? 'ok' : text.startsWith('❌') ? 'bad' : '';
  report(text);
});

await hashFile(await (await fetch('valley-of-mexico.jpg')).blob(), 'valley-of-mexico.jpg');
report('Listo: copia la huella de arriba en «Huella publicada» y pulsa «Comparar»; cambia una cifra y compara otra vez. Después, «32 MB de prueba» (y «Cancelar»)');
```
