---
example_description: "Solución: un AbortController por apertura del visor; los tres listeners (teclado, clic fuera en captura y resize) se registran con su signal y closeViewer los quita todos con un solo abort()"
example_tags: "javascript|eventos|ejercicio|removeeventlistener|abortcontroller|signal|capture"
example_stage: final-solution
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Fotos del taller de barismo</h1>
  <button type="button" id="open-viewer">Abrir el visor</button>
  <section id="viewer" class="viewer" aria-label="Visor de fotos" hidden>
    <p id="photo" class="photo">☕ 1/4</p>
    <p class="hint">← → para cambiar de foto · Escape o un clic fuera para cerrar</p>
    <p>Recolocaciones: <output id="layouts">0</output></p>
  </section>
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
  max-width: 28rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.viewer {
  margin-top: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: #1f2933;
  color: #ffffff;
  text-align: center;
}
.photo {
  font-size: 2.5rem;
  margin: 0;
}
.hint {
  font-size: 0.85rem;
}
button {
  font: inherit;
  padding: 0.35rem 0.75rem;
  border: 1px solid #7b8794;
  border-radius: 0.4rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// SOLUCIÓN: un AbortController por apertura; cerrar = abort().
const viewer = document.querySelector('#viewer');
const openButton = document.querySelector('#open-viewer');
const photos = ['☕', '🫘', '🥛', '🍰'];
const state = { index: 0, outsideClicks: 0, layouts: 0 };
let viewerLife = null; // el controlador de la apertura actual (null = cerrado)

function showPhoto() {
  document.querySelector('#photo').textContent = `${photos[state.index % photos.length]} ${(state.index % photos.length) + 1}/${photos.length}`;
}
function onKey(event) {
  if (event.key === 'ArrowRight') state.index += 1;
  if (event.key === 'ArrowLeft') state.index = Math.max(0, state.index - 1);
  if (event.key === 'Escape') closeViewer();
  showPhoto();
}
function onOutsideClick(event) {
  if (viewer.contains(event.target) || event.target === openButton) return;
  state.outsideClicks += 1;
  closeViewer();
}
function layout() {
  state.layouts += 1;
  document.querySelector('#layouts').textContent = state.layouts;
}

function openViewer() {
  if (viewerLife) return; // ya abierto: no registres nada dos veces
  viewer.hidden = false;
  showPhoto();
  viewerLife = new AbortController();
  const { signal } = viewerLife;
  document.addEventListener('keydown', onKey, { signal });
  document.addEventListener('click', onOutsideClick, { capture: true, signal });
  window.addEventListener('resize', () => layout(), { signal });
}

function closeViewer() {
  if (!viewerLife) return;
  viewerLife.abort(); // los tres fuera, sea cual sea su función o su fase
  viewerLife = null;  // la próxima apertura necesita un controlador nuevo
  viewer.hidden = true;
}

openButton.addEventListener('click', openViewer);

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
// Simulan teclas, clics y un cambio de tamaño con dispatchEvent.
function check(description, compute, expected) {
  let actual;
  try {
    actual = compute();
  } catch (error) {
    actual = `${error.name}: ${error.message}`;
  }
  if (Object.is(actual, expected)) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}
const pressKey = (key) => document.body.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
const change = (counter, action) => {
  const before = state[counter];
  action();
  return state[counter] - before;
};

check('tras abrir y cerrar dos veces y volver a abrir, → avanza UNA foto', () => {
  openViewer(); closeViewer(); openViewer(); closeViewer(); openViewer();
  return change('index', () => pressKey('ArrowRight'));
}, 1);
check('con el visor cerrado, → no cambia la foto', () => {
  closeViewer();
  return change('index', () => pressKey('ArrowRight'));
}, 0);
check('con el visor cerrado, un clic en la página no es un «clic fuera»', () => {
  return change('outsideClicks', () => document.querySelector('h1').dispatchEvent(new MouseEvent('click', { bubbles: true })));
}, 0);
check('con el visor cerrado, un resize no recoloca nada', () => {
  return change('layouts', () => window.dispatchEvent(new Event('resize')));
}, 0);
```
