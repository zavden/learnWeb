---
example_description: "stopPropagation rompe a otros: un menú que se cierra «al hacer clic fuera» escucha en document, y las estrellas de valoración, que detienen la propagación, lo dejan abierto. Arreglos: no detener (comprobar target en el padre) o escuchar en captura"
example_tags: "javascript|eventos|stoppropagation|captura|menu|clic-fuera|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <div class="toolbar">
    <button id="sort-toggle" type="button" aria-expanded="false" aria-controls="sort-menu">Ordenar por ▾</button>
    <ul id="sort-menu" class="menu" hidden>
      <li><button type="button">Precio</button></li>
      <li><button type="button">Novedad</button></li>
    </ul>
  </div>
  <article id="product" class="product">
    <h1>Café de Chiapas · 500 g</h1>
    <p>Valora: <span class="stars">
      <button type="button" data-stars="1" aria-label="1 estrella">★</button>
      <button type="button" data-stars="2" aria-label="2 estrellas">★</button>
      <button type="button" data-stars="3" aria-label="3 estrellas">★</button>
    </span></p>
  </article>
  <label><input type="checkbox" id="use-capture"> El menú escucha en captura (✅)</label>
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
  font-size: 1.1rem;
  margin: 0 0 0.5rem;
}
.toolbar {
  position: relative;
  margin-bottom: 0.75rem;
}
.menu {
  position: absolute;
  z-index: 1;
  margin: 0.25rem 0 0;
  padding: 0.25rem;
  list-style: none;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
}
.product {
  margin-bottom: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
button {
  font: inherit;
  padding: 0.3rem 0.7rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
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
const toggle = document.querySelector('#sort-toggle');
const menu = document.querySelector('#sort-menu');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

function setMenuOpen(isOpen) {
  menu.hidden = !isOpen;
  toggle.setAttribute('aria-expanded', String(isOpen));
}
toggle.addEventListener('click', () => {
  setMenuOpen(menu.hidden);
  logLine(menu.hidden ? '▴ menú cerrado' : '▾ menú abierto');
});

// El menú se cierra con cualquier clic fuera de él: escucha en document.
function closeOnOutsideClick(event) {
  if (menu.hidden || event.target.closest('.toolbar')) return;
  setMenuOpen(false);
  logLine('▴ clic fuera → menú cerrado');
}
document.addEventListener('click', closeOnOutsideClick);

// Otro componente, escrito por otra persona: las estrellas detienen la
// propagación «para que la tarjeta del producto no reciba el clic».
for (const star of document.querySelectorAll('[data-stars]')) {
  star.addEventListener('click', (event) => {
    event.stopPropagation(); // 🐛 tampoco llega a document
    logLine(`★ valoración: ${star.dataset.stars}`);
    if (!menu.hidden) logLine('🐛 el menú sigue abierto: el clic no llegó a document');
  });
}

// ✅ Arreglo del menú: escuchar en la fase de CAPTURA. document lo recibe al
//    bajar, antes de que nadie pueda detenerlo.
document.querySelector('#use-capture').addEventListener('change', (event) => {
  const capture = event.currentTarget.checked;
  document.removeEventListener('click', closeOnOutsideClick, { capture: !capture });
  document.addEventListener('click', closeOnOutsideClick, { capture });
  logLine(`el menú escucha ahora en ${capture ? 'captura ✅' : 'burbuja 🐛'}`);
});
logLine('Listo: abre «Ordenar por», pulsa una estrella; marca la casilla y repite');

// El arreglo de fondo es no usar stopPropagation: si un padre no debe
// reaccionar, que el padre lo compruebe (event.target.closest('.stars')).
```
