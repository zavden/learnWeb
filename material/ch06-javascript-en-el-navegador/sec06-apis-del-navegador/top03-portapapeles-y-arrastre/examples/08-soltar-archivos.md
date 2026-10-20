---
example_description: "Soltar archivos desde el escritorio: en drop, dataTransfer.files es una FileList con name, size y type de cada archivo (los mismos objetos File que da un <input type=\"file\">, la alternativa de teclado); window cancela dragover y drop para que un archivo soltado fuera de la zona no haga que el navegador lo abra"
example_tags: "javascript|drag-and-drop|archivos|datatransfer|files|filelist|input-file"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Adjuntos del pedido</h1>
  <div id="drop-zone" class="drop-zone">
    <p>Suelta aquí la factura o las fotos del pedido</p>
    <label class="picker">o elígelos <input id="picker" type="file" multiple></label>
  </div>
  <ul id="files" class="files"></ul>
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
  padding: 1rem;
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
  margin: 0 0 0.5rem;
}
.picker:focus-within {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.files {
  padding-left: 1.2rem;
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
const zone = document.querySelector('#drop-zone');
const fileList = document.querySelector('#files');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
function formatSize(bytes) {
  const mega = bytes >= 1024 * 1024;
  const unit = mega ? 'megabyte' : 'kilobyte';
  const value = bytes / (mega ? 1024 * 1024 : 1024);
  return new Intl.NumberFormat('es-MX', { style: 'unit', unit, maximumFractionDigits: 1 }).format(value);
}

// La misma función para los dos caminos: soltar o elegir.
function showFiles(files, how) {
  logLine(`${how} → ${files.length} archivo(s)`);
  for (const file of files) {
    const description = `${file.name} · ${formatSize(file.size)} · ${file.type || 'tipo desconocido'}`;
    const item = document.createElement('li');
    item.textContent = description;
    fileList.append(item);
    logLine(`   📎 ${description}`);
  }
}

// Si un archivo cae FUERA de la zona, el navegador lo abriría en la pestaña
// (y tu página desaparecería): window cancela por defecto dragover y drop.
window.addEventListener('dragover', (event) => event.preventDefault());
window.addEventListener('drop', (event) => event.preventDefault());

zone.addEventListener('dragover', (event) => {
  // Mientras se arrastra solo se ven los tipos: 'Files' si trae archivos.
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
  showFiles(event.dataTransfer.files, 'drop');
});

// La alternativa de teclado (y la de los móviles): el <input type="file">.
document.querySelector('#picker').addEventListener('change', (event) => {
  showFiles(event.target.files, 'input');
});
logLine('Listo: arrastra archivos desde el escritorio hasta la zona, o elígelos con el botón');

// Ni el drop ni el input leen el contenido: un File es una referencia al
// archivo, con su nombre y su tamaño. Leerlo es el siguiente ejemplo.
```
