---
example_description: "Un compresor gzip en un worker: el archivo pasa por un TransformStream que cuenta los bytes (progreso) y por CompressionStream, el resultado se comprueba descomprimiéndolo con DecompressionStream y comparando byte a byte, y vuelve a la página como un Blob listo para descargar; un texto se reduce mucho y un JPEG casi nada"
example_tags: "javascript|workers|compressionstream|streams|blob|gzip|progreso|profesional"
example_stage: professional
example_importance: useful
console: true
---

# HTML

```html
<main class="app">
  <h1>Comprimir con gzip</h1>
  <p class="intro">El archivo se lee, se comprime y se comprueba en un worker, por trozos: la página solo ve el progreso y el resultado. No sale de tu navegador.</p>
  <div class="controls">
    <label>Tu archivo (hasta 50 MB) <input id="file" type="file"></label>
    <div class="buttons" role="group" aria-label="Archivos de prueba">
      <button type="button" data-sample="sales.csv">sales.csv</button>
      <button type="button" data-sample="valley-of-mexico.jpg">valley-of-mexico.jpg</button>
      <button id="generate" type="button">Un registro de 4,6 MB</button>
    </div>
  </div>
  <progress id="progress" max="1" value="0" aria-label="Progreso de la compresión"></progress>
  <p id="status" class="status" role="status"></p>
  <ul id="results" class="results"></ul>
  <p class="note">Los enlaces de descarga funcionan con ▶ o en el editor; en una tarjeta de la teoría (un iframe aislado) no hay descargas.</p>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; --bar: #bfdbfe; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.app { max-width: 38rem; margin: 0 auto; padding: 1rem; display: grid; gap: 0.75rem; }
h1 { margin: 0; font-size: 1.25rem; }
.intro, .note { margin: 0; color: var(--muted); font-size: 0.85rem; }
.controls { display: grid; gap: 0.5rem; padding: 0.75rem 1rem; border: 1px solid var(--line); border-radius: 0.6rem; background: var(--surface); }
label { display: grid; gap: 0.2rem; font-size: 0.9rem; }
.buttons { display: flex; flex-wrap: wrap; gap: 0.4rem; }
input, button { font: inherit; color: var(--ink); }
button { padding: 0.3rem 0.65rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: 0.6; }
:is(input, button, a):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
progress { inline-size: 100%; }
.status { margin: 0; font-weight: 600; }
.results { display: grid; gap: 0.5rem; margin: 0; padding: 0; list-style: none; }
.results li { padding: 0.5rem 0.75rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-size: 0.85rem; }
.ratio { block-size: 0.5rem; margin-block: 0.3rem; border-radius: 0.25rem; background: linear-gradient(to right, var(--accent) var(--ratio), var(--bar) var(--ratio)); }
.results a { color: var(--accent); }
.log { margin: 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-size: 0.8rem; }
```

# JavaScript

```javascript
// COMPRESOR GZIP EN UN WORKER
//
// Decisiones de diseño:
// - Todo con streams en el worker (11-gzip/gzip-worker.js): file.stream() → un
//   TransformStream que cuenta bytes (el progreso) → CompressionStream('gzip'). Nunca
//   hay dos copias enteras del archivo en memoria mientras se comprime.
// - Un resultado no se ofrece sin comprobarlo: se descomprime y se compara con el
//   original byte a byte.
// - El File entra y el Blob comprimido sale como referencias: postMessage no copia sus
//   bytes. La página solo crea la URL de descarga (y la libera cuando la sustituye).
// - La consola dice la proporción con palabras («a menos de una cuarta parte»): el
//   tamaño exacto en bytes depende de la versión de zlib del navegador; la página sí
//   lo muestra.
// - Límite de 50 MB para tus archivos: ningún clic ocupa la CPU más de un segundo.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, File y streams del capítulo 6, Blob
// del módulo «Datos binarios» y este módulo.
import { generateLog } from './05-logs/logs.js';

const LIMIT = 50 * 1024 * 1024;
const $ = (selector) => document.querySelector(selector);
const fmt = (n) => n.toLocaleString('es-MX');
function report(text) {
  console.log(text);
  $('#log').append(Object.assign(document.createElement('li'), { textContent: text }));
}

const worker = new Worker('11-gzip/gzip-worker.js', { type: 'module' });
addEventListener('pagehide', () => worker.terminate());
let nextId = 0;
let current = null;
const urls = new Map(); // nombre → URL de objeto del .gz

worker.onmessage = (event) => {
  const message = event.data;
  if (message.id !== current?.id) return;
  if (message.type === 'progress') {
    $('#progress').value = message.loaded / message.total;
    return;
  }
  const { name, size, start, timed, resolve } = current;
  current = null;
  setBusy(false);
  if (message.type === 'error') {
    report(`⚠️ ${name}: ${message.message}`);
    return resolve();
  }
  const ratio = message.blob.size / size;
  const words = ratio < 0.25 ? 'a menos de una cuarta parte' : ratio < 0.5 ? 'a menos de la mitad' : ratio < 0.9 ? 'a algo menos' : 'casi igual: ya venía comprimido';
  report(`📦 ${name}: ${fmt(size)} bytes → ${words} · ¿la ida y vuelta da los mismos bytes? ${message.same}`);
  if (timed) report(`⏱️ comprimido y comprobado en ${(performance.now() - start).toFixed(0)} ms, sin bloquear la página`);
  showResult(name, size, message.blob, ratio, message.same);
  resolve();
};

function showResult(name, size, blob, ratio, same) {
  if (urls.has(name)) URL.revokeObjectURL(urls.get(name));
  const url = URL.createObjectURL(blob);
  urls.set(name, url);
  const item = document.createElement('li');
  const bar = Object.assign(document.createElement('div'), { className: 'ratio' });
  bar.style.setProperty('--ratio', `${(ratio * 100).toFixed(1)}%`);
  bar.setAttribute('aria-hidden', 'true');
  const link = Object.assign(document.createElement('a'), { href: url, download: `${name}.gz`, textContent: `Descargar ${name}.gz` });
  item.append(`${name}: ${fmt(size)} → ${fmt(blob.size)} bytes (${(ratio * 100).toFixed(1)} %) · ${same ? '✅ comprobado' : '❌ no coincide al descomprimir'}`, bar, link);
  $('#results').prepend(item);
}

function setBusy(busy) {
  document.querySelectorAll('.controls button, #file').forEach((control) => { control.disabled = busy; });
}
function compress(file, name, { timed = false } = {}) {
  if (file.size > LIMIT) {
    report(`⚠️ ${name}: ${fmt(file.size)} bytes; en este ejemplo el límite es 50 MB`);
    return Promise.resolve();
  }
  const { promise, resolve } = Promise.withResolvers();
  current = { id: ++nextId, name, size: file.size, start: performance.now(), timed, resolve };
  $('#progress').value = 0;
  $('#status').textContent = `Comprimiendo ${name}…`;
  setBusy(true);
  worker.postMessage({ id: current.id, file });
  return promise.then(() => { $('#status').textContent = ''; });
}

document.querySelector('.buttons').addEventListener('click', async (event) => {
  const sample = event.target.closest('button')?.dataset.sample;
  if (sample) await compress(await (await fetch(sample)).blob(), sample);
});
$('#generate').addEventListener('click', () => {
  // Un registro de servidor inventado (el del «Visor de registros»): texto muy repetitivo.
  const blob = new Blob([generateLog(60_000).join('\n'), '\n'], { type: 'text/plain' });
  compress(blob, 'tienda.log', { timed: true });
});
$('#file').addEventListener('change', () => {
  const [file] = $('#file').files;
  if (file) compress(file, file.name, { timed: true });
});
addEventListener('pagehide', () => urls.forEach((url) => URL.revokeObjectURL(url)));

await compress(await (await fetch('sales.csv')).blob(), 'sales.csv');
await compress(await (await fetch('valley-of-mexico.jpg')).blob(), 'valley-of-mexico.jpg');
report('Listo: pulsa «Un registro de 4,6 MB» o elige un archivo tuyo; prueba con algo ya comprimido (un .zip, una foto)');
```
