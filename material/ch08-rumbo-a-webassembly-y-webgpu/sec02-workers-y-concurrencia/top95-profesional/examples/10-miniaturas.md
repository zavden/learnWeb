---
example_description: "Un generador de miniaturas: las fotos que eliges (o las dos del curso) se reparten entre un pool de workers; cada worker decodifica con createImageBitmap, reduce en un OffscreenCanvas y codifica a WebP con convertToBlob; los File y los Blob viajan como referencias, y la galería se ordena como la elegiste, no como terminan"
example_tags: "javascript|workers|offscreencanvas|imagebitmap|blob|pool|imagenes|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>Miniaturas</h1>
  <p class="intro">Decodificar, reducir y codificar cada foto ocurre en un worker. Tus fotos no salen de tu navegador.</p>
  <div class="controls">
    <label>Tus fotos <input id="files" type="file" accept="image/*" multiple></label>
    <label>Ancho
      <select id="width">
        <option value="160">160 px</option>
        <option value="240" selected>240 px</option>
        <option value="320">320 px</option>
      </select>
    </label>
    <button id="samples" type="button">Las dos fotos del curso</button>
    <button id="clear" type="button">Vaciar</button>
  </div>
  <p id="status" class="status" role="status"></p>
  <ul id="gallery" class="gallery"></ul>
  <p class="note">Los enlaces «Descargar» funcionan con ▶ o en el editor; en una tarjeta de la teoría (un iframe aislado) no hay descargas.</p>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.app { max-width: 46rem; margin: 0 auto; padding: 1rem; display: grid; gap: 0.75rem; }
h1 { margin: 0; font-size: 1.25rem; }
.intro, .note { margin: 0; color: var(--muted); font-size: 0.85rem; }
.controls { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; align-items: end; }
label { display: grid; gap: 0.2rem; font-size: 0.9rem; }
input, select, button { font: inherit; color: var(--ink); }
select, button { padding: 0.3rem 0.6rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); }
button { cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: 0.6; }
:is(input, select, button, a):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.status { margin: 0; font-weight: 600; }
.gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr)); gap: 0.75rem; margin: 0; padding: 0; list-style: none; }
.gallery figure { margin: 0; padding: 0.5rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); display: grid; gap: 0.3rem; }
.gallery img { inline-size: 100%; block-size: auto; border-radius: 0.3rem; background: #e2e8f0; }
.gallery .waiting { display: grid; place-items: center; aspect-ratio: 3 / 2; border-radius: 0.3rem; background: #e2e8f0; color: var(--muted); font-size: 0.85rem; }
figcaption { font-size: 0.8rem; overflow-wrap: anywhere; }
figcaption a { color: var(--accent); }
.log { margin: 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-size: 0.8rem; }
```

# JavaScript

```javascript
// MINIATURAS EN UN POOL DE WORKERS
//
// Decisiones de diseño:
// - Cada foto es un trabajo para el pool (min(4, núcleos) workers de
//   10-thumbs/thumb-worker.js). El File llega al worker como referencia (no se copian
//   sus bytes), el worker la decodifica con createImageBitmap, la reduce en un
//   OffscreenCanvas y la codifica con convertToBlob; el Blob vuelve, también sin copia.
// - La galería tiene un hueco por foto desde el principio, en el orden en que la
//   elegiste: cada miniatura ocupa SU hueco cuando llega, termine antes o después.
// - Las URL de objeto se liberan (revokeObjectURL) al vaciar la galería o al salir.
// - La consola solo imprime cuando han terminado todas, en el orden de la galería, y
//   solo las medidas: los bytes de un WebP dependen del codificador del navegador.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, File y canvas del capítulo 6, Blob y
// URL de objeto del módulo «Datos binarios» y este módulo.
const $ = (selector) => document.querySelector(selector);
const kb = (bytes) => `${Math.max(1, Math.round(bytes / 1024))} KB`;
function report(text) {
  console.log(text);
  $('#log').append(Object.assign(document.createElement('li'), { textContent: text }));
}

// El pool: workers libres y una cola de trabajos { id, file, maxWidth, resolve }.
const poolSize = Math.min(4, navigator.hardwareConcurrency || 2);
const workers = [];
const idle = [];
const queue = [];
const pending = new Map();
let nextId = 1;
for (let i = 0; i < poolSize; i++) {
  const worker = new Worker('10-thumbs/thumb-worker.js', { type: 'module' });
  worker.onmessage = (event) => {
    pending.get(event.data.id)(event.data);
    pending.delete(event.data.id);
    idle.push(worker);
    pump();
  };
  workers.push(worker);
  idle.push(worker);
}
addEventListener('pagehide', () => workers.forEach((worker) => worker.terminate()));
function pump() {
  while (idle.length > 0 && queue.length > 0) {
    const { id, file, maxWidth, resolve } = queue.shift();
    pending.set(id, resolve);
    idle.pop().postMessage({ id, file, maxWidth });
  }
}
const makeThumbnail = (file, maxWidth) => new Promise((resolve) => {
  queue.push({ id: nextId++, file, maxWidth, resolve });
  pump();
});

const urls = [];
function clearGallery() {
  urls.splice(0).forEach((url) => URL.revokeObjectURL(url));
  $('#gallery').replaceChildren();
}
addEventListener('pagehide', clearGallery);

async function processAll(items) {
  const maxWidth = Number($('#width').value);
  $('#status').textContent = `Reduciendo ${items.length} foto(s)…`;
  const start = performance.now();
  // Un hueco por foto, en orden; cada resultado rellena el suyo.
  const results = await Promise.all(items.map(async ({ blob, name }) => {
    const item = document.createElement('li');
    const figure = document.createElement('figure');
    figure.append(Object.assign(document.createElement('div'), { className: 'waiting', textContent: 'Reduciendo…' }));
    item.append(figure);
    $('#gallery').append(item);
    const result = await makeThumbnail(blob, maxWidth);
    const caption = document.createElement('figcaption');
    if (!result.ok) {
      figure.replaceChildren(caption);
      caption.textContent = `${name}: no es una imagen que el navegador sepa leer`;
      return { name, ...result };
    }
    const url = URL.createObjectURL(result.blob);
    urls.push(url);
    const image = Object.assign(document.createElement('img'), { src: url, alt: `Miniatura de ${name}`, width: result.width, height: result.height });
    const link = Object.assign(document.createElement('a'), { href: url, download: `${name.replace(/\.[^.]+$/, '')}-${result.width}.webp`, textContent: 'Descargar' });
    caption.append(`${name} · ${result.original.width} × ${result.original.height} → ${result.width} × ${result.height} · ${kb(blob.size)} → ${kb(result.blob.size)} · `, link);
    figure.replaceChildren(image, caption);
    return { name, ...result };
  }));
  $('#status').textContent = `${results.filter((result) => result.ok).length} de ${results.length} miniaturas en ${(performance.now() - start).toFixed(0)} ms`;
  for (const result of results) {
    report(result.ok
      ? `🖼️ ${result.name}: ${result.original.width} × ${result.original.height} → ${result.width} × ${result.height}`
      : `⚠️ ${result.name}: no es una imagen que el navegador sepa leer`);
  }
}

async function loadSamples() {
  const names = ['valley-of-mexico.jpg', 'great-wave.jpg'];
  return Promise.all(names.map(async (name) => ({ name, blob: await (await fetch(name)).blob() })));
}
$('#samples').addEventListener('click', async () => processAll(await loadSamples()));
$('#files').addEventListener('change', () => {
  const files = [...$('#files').files];
  if (files.length > 0) processAll(files.map((file) => ({ name: file.name, blob: file })));
});
$('#clear').addEventListener('click', () => {
  clearGallery();
  $('#status').textContent = 'Galería vacía';
  report('🧹 galería vacía: URL de objeto liberadas');
});

await processAll(await loadSamples());
report('Listo: elige varias fotos tuyas (o cambia el ancho y pulsa «Las dos fotos del curso»)');
```
