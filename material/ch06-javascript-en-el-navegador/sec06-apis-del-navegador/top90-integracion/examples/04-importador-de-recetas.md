---
example_description: "Un importador de recetas con tres entradas y un solo camino: soltar archivos, elegirlos con el <input> o pegar filas de una hoja de cálculo acaban en importText; se valida el tipo y el tamaño, se lee con file.text(), se pinta una tabla y se ofrece un JSON para descargar con una URL blob: que se revoca al regenerarla"
example_tags: "javascript|file-api|drag-and-drop|paste|csv|createobjecturl|revokeobjecturl"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Importar recetas</h1>
  <div id="drop-zone" class="drop-zone">
    <p>Suelta aquí archivos .csv o .json (máx. 100 KB)</p>
    <label>o elígelos <input id="picker" type="file" accept=".csv,.json" multiple></label>
  </div>
  <label class="paste" for="paste-box">o pega filas de tu hoja de cálculo (receta, minutos, porciones):</label>
  <textarea id="paste-box" rows="2" placeholder="Cmd + V o Ctrl + V"></textarea>
  <table class="recipes">
    <caption>Recetas importadas: <output id="total">0</output></caption>
    <thead><tr><th scope="col">Receta</th><th scope="col">Min.</th><th scope="col">Porc.</th><th scope="col">Origen</th></tr></thead>
    <tbody id="rows"></tbody>
  </table>
  <p><a id="download" class="download" download="recetas.json" hidden>⬇ Descargar recetas.json</a></p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
main {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin: 0 0 0.5rem;
}
.drop-zone {
  padding: 0.75rem;
  border: 2px dashed #7b8794;
  border-radius: 0.75rem;
  background: #ffffff;
  text-align: center;
}
.drop-zone.over {
  border-color: #1d4ed8;
  background: #dbeafe;
}
.drop-zone p {
  margin: 0 0 0.4rem;
}
.paste {
  display: block;
  margin: 0.6rem 0 0.25rem;
}
textarea {
  box-sizing: border-box;
  width: 100%;
  font: inherit;
  padding: 0.35rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
}
input:focus-visible,
textarea:focus-visible,
a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.recipes {
  width: 100%;
  margin-top: 0.6rem;
  border-collapse: collapse;
  background: #ffffff;
  font-size: 0.9rem;
}
.recipes caption {
  text-align: start;
  font-weight: 700;
}
.recipes th,
.recipes td {
  padding: 0.25rem 0.5rem;
  border-bottom: 1px solid #e4e7eb;
  text-align: start;
}
.download {
  color: #1d4ed8;
}
.download[hidden] {
  display: none;
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
const MAX_BYTES = 100 * 1024;
const zone = document.querySelector('#drop-zone');
const rowsBody = document.querySelector('#rows');
const totalOutput = document.querySelector('#total');
const downloadLink = document.querySelector('#download');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
const recipes = [];

// ── Un solo camino para las tres entradas ────────────────────────────────
function parse(text, kind) {
  if (kind === 'json') return JSON.parse(text);
  const separator = kind === 'tsv' ? '\t' : ',';
  const lines = text.trim().split(/\r?\n/);
  if (kind === 'csv') lines.shift(); // la cabecera
  return lines.map((line) => {
    const [name, minutes, servings] = line.split(separator);
    return { name, minutes, servings };
  });
}
function importText(text, kind, source) {
  const valid = parse(text, kind)
    .map((recipe) => ({ name: String(recipe.name ?? '').trim(), minutes: Number(recipe.minutes), servings: Number(recipe.servings) }))
    .filter((recipe) => recipe.name && Number.isFinite(recipe.minutes) && Number.isFinite(recipe.servings));
  for (const recipe of valid) {
    const row = rowsBody.insertRow();
    for (const value of [recipe.name, recipe.minutes, recipe.servings, source]) row.insertCell().textContent = value;
  }
  recipes.push(...valid);
  totalOutput.textContent = recipes.length;
  refreshDownload();
  return valid.length;
}

// ── El JSON para descargar: una URL blob: nueva, y la anterior revocada ──
let downloadUrl = null;
function refreshDownload() {
  if (downloadUrl) URL.revokeObjectURL(downloadUrl); // la vieja ya no sirve: suéltala
  const blob = new Blob([JSON.stringify(recipes, null, 2)], { type: 'application/json' });
  downloadUrl = URL.createObjectURL(blob);
  downloadLink.href = downloadUrl;
  downloadLink.textContent = `⬇ Descargar recetas.json (${recipes.length} recetas, ${blob.size} bytes)`;
  downloadLink.hidden = false;
}

// ── Archivos: validar, leer, importar ────────────────────────────────────
async function handleFiles(files) {
  for (const file of files) {
    const kind = file.name.toLowerCase().match(/\.(csv|json)$/)?.[1];
    if (!kind) {
      logLine(`⛔ ${file.name}: solo se admiten .csv o .json`);
      continue;
    }
    if (file.size > MAX_BYTES) {
      logLine(`⛔ ${file.name}: pesa más de 100 KB`);
      continue;
    }
    try {
      const count = importText(await file.text(), kind, file.name);
      logLine(`📄 ${file.name} · ${file.size} bytes → ${count} recetas`);
    } catch (error) {
      logLine(`⛔ ${file.name}: ${error.name} (${error.message})`);
    }
  }
}

// Soltar fuera de la zona no debe abrir el archivo en la pestaña.
window.addEventListener('dragover', (event) => event.preventDefault());
window.addEventListener('drop', (event) => event.preventDefault());
let pendingImport = Promise.resolve();
zone.addEventListener('dragover', (event) => {
  if (!event.dataTransfer.types.includes('Files')) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
  zone.classList.add('over');
});
zone.addEventListener('dragleave', (event) => {
  if (!zone.contains(event.relatedTarget)) zone.classList.remove('over');
});
zone.addEventListener('drop', (event) => {
  event.preventDefault();
  zone.classList.remove('over');
  pendingImport = handleFiles(event.dataTransfer.files);
});
document.querySelector('#picker').addEventListener('change', (event) => {
  pendingImport = handleFiles(event.target.files);
});

// ── Pegar filas (separadas por tabuladores) ──────────────────────────────
document.querySelector('#paste-box').addEventListener('paste', (event) => {
  const text = event.clipboardData.getData('text/plain');
  if (!text.includes('\t')) return; // texto normal: que entre en el cuadro
  event.preventDefault();
  logLine(`📋 pegado → ${importText(text, 'tsv', 'portapapeles')} recetas`);
});

// ── Simulado al cargar: los mismos eventos que llegarían de verdad ───────
function dropFiles(files) {
  const data = new DataTransfer();
  for (const file of files) data.items.add(file);
  zone.dispatchEvent(new DragEvent('drop', { dataTransfer: data, bubbles: true, cancelable: true }));
  return pendingImport;
}
logLine('— simulado: soltar recetas-otono.csv —');
await dropFiles([new File(['name,minutes,servings\nPan de muerto,180,12\nCalabaza en tacha,90,6\nAtole de guayaba,30,6\n'], 'recetas-otono.csv', { type: 'text/csv' })]);
logLine('— simulado: soltar foto.jpg —');
await dropFiles([new File([new Uint8Array(2048)], 'foto.jpg', { type: 'image/jpeg' })]);
logLine('— simulado: pegar 2 filas de una hoja de cálculo —');
const pasted = new DataTransfer();
pasted.setData('text/plain', 'Champurrado\t40\t6\nTamales de rajas\t120\t20');
document.querySelector('#paste-box').dispatchEvent(new ClipboardEvent('paste', { clipboardData: pasted, bubbles: true, cancelable: true }));
logLine(`🍲 en total: ${recipes.length} recetas · ${downloadLink.textContent}`);
logLine('Listo: suelta o elige tus archivos, o pega filas en el cuadro');
```
