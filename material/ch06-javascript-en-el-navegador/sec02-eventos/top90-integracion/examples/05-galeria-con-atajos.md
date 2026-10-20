---
example_description: "Un visor de grabados con miniaturas delegadas y atajos de teclado que no estorban: ← → solo fuera de los campos y sin modificadores, «i» desactivable (WCAG 2.1.4), «?» abre la ayuda en un <dialog>, aria-keyshortcuts y botones visibles para todo"
example_tags: "javascript|eventos|integracion|teclado|atajos|delegacion|accesibilidad|dialog"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Grabados japoneses</h1>
  <figure class="viewer">
    <div id="art" class="art" role="img" aria-label="La gran ola de Kanagawa">🌊</div>
    <figcaption><strong id="title">La gran ola de Kanagawa</strong> <span id="info" class="info">Hokusai, 1831</span></figcaption>
  </figure>
  <p class="controls">
    <button type="button" id="prev" aria-keyshortcuts="ArrowLeft">← Anterior</button>
    <button type="button" id="next" aria-keyshortcuts="ArrowRight">Siguiente →</button>
    <button type="button" id="toggle-info" aria-keyshortcuts="I" aria-pressed="true">Ficha (<kbd>i</kbd>)</button>
    <button type="button" id="help" aria-keyshortcuts="?">Atajos (<kbd>?</kbd>)</button>
  </p>
  <ul id="thumbs" class="thumbs"></ul>
  <p><label>Nota sobre la obra <input id="note" type="text"></label></p>
  <p><label><input type="checkbox" id="single-key" checked> Atajos de una sola tecla</label></p>
  <dialog id="help-dialog" aria-labelledby="help-title">
    <h2 id="help-title">Atajos de teclado</h2>
    <dl>
      <dt><kbd>←</kbd> <kbd>→</kbd></dt><dd>Obra anterior y siguiente</dd>
      <dt><kbd>i</kbd></dt><dd>Mostrar u ocultar la ficha (se puede desactivar)</dd>
      <dt><kbd>?</kbd></dt><dd>Esta ayuda</dd>
    </dl>
    <form method="dialog"><button>Cerrar</button></form>
  </dialog>
  <ol id="log" class="log"></ol>
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
  margin-top: 0;
}
.viewer {
  margin: 0;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: #1f2933;
  color: #ffffff;
  text-align: center;
}
.art {
  font-size: 4rem;
}
.info[hidden] {
  display: none;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.thumbs {
  display: flex;
  gap: 0.4rem;
  padding: 0;
  list-style: none;
}
.thumbs button {
  font-size: 1.5rem;
}
.thumbs button[aria-current="true"] {
  border-color: #1d4ed8;
  background: #dbeafe;
}
kbd {
  padding: 0 0.25rem;
  border: 1px solid #7b8794;
  border-radius: 0.25rem;
  font-size: 0.85em;
}
button {
  font: inherit;
  padding: 0.3rem 0.6rem;
  border: 1px solid #7b8794;
  border-radius: 0.4rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:focus-visible,
input:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.log {
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
const prints = [
  { art: '🌊', title: 'La gran ola de Kanagawa', info: 'Hokusai, 1831' },
  { art: '🗻', title: 'El Fuji rojo', info: 'Hokusai, 1831' },
  { art: '🌧️', title: 'Lluvia repentina en Ōhashi', info: 'Hiroshige, 1857' },
  { art: '🌸', title: 'Cerezos en Arashiyama', info: 'Hiroshige, 1834' },
];
let current = 0;
const thumbs = document.querySelector('#thumbs');
const info = document.querySelector('#info');
const toggleInfoButton = document.querySelector('#toggle-info');

function show(index, how) {
  current = (index + prints.length) % prints.length;
  const { art, title, info: details } = prints[current];
  const artBox = document.querySelector('#art');
  artBox.textContent = art;
  artBox.setAttribute('aria-label', title);
  document.querySelector('#title').textContent = title;
  info.textContent = details;
  for (const [i, thumb] of [...thumbs.children].entries()) {
    thumb.firstElementChild.setAttribute('aria-current', String(i === current));
  }
  if (how) logLine(`🖼️ ${current + 1}/${prints.length} «${title}» (${how})`);
}
function toggleInfo(how) {
  info.hidden = !info.hidden;
  toggleInfoButton.setAttribute('aria-pressed', String(!info.hidden));
  logLine(`ℹ️ ficha ${info.hidden ? 'oculta' : 'visible'} (${how})`);
}
function openHelp(how) {
  document.querySelector('#help-dialog').showModal();
  logLine(`❓ ayuda abierta (${how})`);
}

// Miniaturas: botones creados desde los datos, con un listener delegado.
thumbs.replaceChildren(...prints.map((print, i) => {
  const item = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = print.art;
  button.setAttribute('aria-label', print.title);
  button.dataset.index = i;
  item.append(button);
  return item;
}));
thumbs.addEventListener('click', (event) => {
  const button = event.target.closest('[data-index]');
  if (button) show(Number(button.dataset.index), 'miniatura');
});

// Los botones visibles: todo lo que hace un atajo se puede hacer sin él.
document.querySelector('#prev').addEventListener('click', () => show(current - 1, 'botón'));
document.querySelector('#next').addEventListener('click', () => show(current + 1, 'botón'));
toggleInfoButton.addEventListener('click', () => toggleInfo('botón'));
document.querySelector('#help').addEventListener('click', () => openHelp('botón'));

// Los atajos.
function isTyping(target) {
  return target.isContentEditable
    || target.matches('textarea, select, input:not([type="checkbox"], [type="radio"], [type="button"], [type="submit"])');
}
document.addEventListener('keydown', (event) => {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return; // del navegador
  if (isTyping(event.target) || document.querySelector('#help-dialog').open) return;
  const singleKeyOn = document.querySelector('#single-key').checked;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    show(current + (event.key === 'ArrowRight' ? 1 : -1), `tecla ${event.key}`);
  } else if (event.key.toLowerCase() === 'i' && singleKeyOn) {
    toggleInfo('tecla i');
  } else if (event.key === '?' && singleKeyOn) {
    openHelp('tecla ?');
  }
});
show(0);
logLine('Listo: haz clic en la vista previa y pulsa → → i ?; luego escribe una «i» en la nota (no debe ocultar la ficha)');
```
