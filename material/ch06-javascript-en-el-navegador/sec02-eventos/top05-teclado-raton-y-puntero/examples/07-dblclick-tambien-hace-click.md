---
example_description: "Un doble clic dispara click (detail 1), click (detail 2) y después dblclick: si click alterna la selección, el doble clic selecciona y deselecciona antes de abrir; ignorar los click con detail > 1 lo arregla. Abrir también con un botón, para el teclado"
example_tags: "javascript|eventos|dblclick|click|detail|raton|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Documentos</h1>
  <p class="hint">Un clic selecciona (o deselecciona); doble clic abre. Haz doble clic en un archivo de cada lista.</p>
  <div class="lists">
    <section>
      <h2>🐛 click alterna siempre</h2>
      <ul id="files-buggy" class="files">
        <li><button type="button" aria-pressed="false" data-file="informe-octubre.pdf">📄 informe-octubre.pdf</button></li>
        <li><button type="button" aria-pressed="false" data-file="carta-de-otono.docx">📄 carta-de-otono.docx</button></li>
      </ul>
      <button type="button" class="open">Abrir los seleccionados</button>
    </section>
    <section>
      <h2>✅ click ignora detail &gt; 1</h2>
      <ul id="files-fixed" class="files">
        <li><button type="button" aria-pressed="false" data-file="informe-octubre.pdf">📄 informe-octubre.pdf</button></li>
        <li><button type="button" aria-pressed="false" data-file="carta-de-otono.docx">📄 carta-de-otono.docx</button></li>
      </ul>
      <button type="button" class="open">Abrir los seleccionados</button>
    </section>
  </div>
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
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
h2 {
  font-size: 0.9rem;
}
.hint {
  color: #52606d;
}
.lists {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 0.75rem;
}
.files {
  display: grid;
  gap: 0.25rem;
  padding: 0;
  list-style: none;
}
button {
  font: inherit;
  padding: 0.3rem 0.6rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
  user-select: none; /* que el doble clic no seleccione el texto */
}
.files button {
  width: 100%;
  text-align: start;
}
button[aria-pressed="true"] {
  border-color: #1d4ed8;
  background: #dbeafe;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
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
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

function setUpFileList(list, ignoreRepeatedClicks) {
  list.addEventListener('click', (event) => {
    const file = event.target.closest('[data-file]');
    if (!file) return;
    // detail cuenta los clics seguidos: 1 en el primero, 2 en el segundo…
    if (ignoreRepeatedClicks && event.detail > 1) {
      logLine(`click · detail: ${event.detail} → ignorado (es parte de un doble clic)`);
      return;
    }
    const selected = file.getAttribute('aria-pressed') !== 'true';
    file.setAttribute('aria-pressed', String(selected));
    const mark = !selected && event.detail > 1 ? '🐛 ' : '';
    logLine(`click · detail: ${event.detail} → ${mark}${file.dataset.file} ${selected ? 'seleccionado' : 'deseleccionado'}`);
  });
  list.addEventListener('dblclick', (event) => {
    const file = event.target.closest('[data-file]');
    if (file) logLine(`dblclick → 📂 abro ${file.dataset.file}`);
  });
  // dblclick no existe en el teclado: «Abrir» hace lo mismo con lo seleccionado.
  list.parentElement.querySelector('.open').addEventListener('click', () => {
    const names = [...list.querySelectorAll('[aria-pressed="true"]')].map((file) => file.dataset.file);
    logLine(`📂 abro: ${names.join(', ') || '(nada seleccionado)'}`);
  });
}
setUpFileList(document.querySelector('#files-buggy'), false);
setUpFileList(document.querySelector('#files-fixed'), true);
logLine('Listo: haz doble clic en «informe-octubre.pdf» en cada lista');

// El orden de un doble clic: pointerdown, mousedown, pointerup, mouseup,
// click (detail 1), y otra vez lo mismo con click (detail 2), y por último
// dblclick. El navegador no puede saber en el primer clic si vendrá otro.
```
