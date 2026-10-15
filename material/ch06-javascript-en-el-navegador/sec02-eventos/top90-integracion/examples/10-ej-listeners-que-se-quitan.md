---
example_description: "Ejercicio: un visor de fotos registra al abrirse tres listeners (teclado, clic fuera en captura y resize) que closeViewer no consigue quitar (flechas nuevas y capture distinto); al reabrirlo se acumulan. Arréglalo con un AbortController por apertura. La comprobación simula teclas, clics y resize"
example_tags: "javascript|eventos|ejercicio|removeeventlistener|abortcontroller|signal|capture"
exercise: true
exercise_title: "Listeners que de verdad se quitan"
exercise_instructions: "openViewer registra tres listeners y closeViewer intenta quitarlos, pero no lo consigue: dos son flechas nuevas y el de clics fuera se registró en captura || Por eso, tras abrir y cerrar varias veces, una flecha del teclado avanza varias fotos, y con el visor cerrado las teclas, los clics y el resize siguen actuando || Crea un AbortController en cada apertura y registra los tres listeners con su signal (el de clics, además, con capture: true) || En closeViewer, llama a abort() en lugar de a removeEventListener || Que abrir dos veces seguidas no registre nada dos veces || Ejecuta hasta que las cuatro comprobaciones salgan ✓"
exercise_hints: "removeEventListener necesita la MISMA función y la misma fase; con signal no necesitas ninguna de las dos || Guarda el controlador en una variable de fuera (let viewerLife = null) para que closeViewer lo encuentre || Si viewerLife ya existe, el visor está abierto: openViewer puede salir con return || Después de abort(), pon la variable a null: una señal abortada no sirve para la siguiente apertura"
exercise_solution_example: 10-ej-listeners-que-se-quitan-solucion.md
exercise_locked_files: index.html
example_stage: exercise
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
// EJERCICIO: que closeViewer quite de verdad los listeners de openViewer.
const viewer = document.querySelector('#viewer');
const openButton = document.querySelector('#open-viewer');
const photos = ['☕', '🫘', '🥛', '🍰'];
const state = { index: 0, outsideClicks: 0, layouts: 0 };

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
  viewer.hidden = false;
  showPhoto();
  // TODO 1: un AbortController por apertura, y los tres listeners con su signal
  document.addEventListener('keydown', (event) => onKey(event));
  document.addEventListener('click', onOutsideClick, { capture: true });
  window.addEventListener('resize', () => layout());
}

function closeViewer() {
  viewer.hidden = true;
  // TODO 2: ninguna de estas tres líneas quita nada. Sustitúyelas por abort()
  document.removeEventListener('keydown', (event) => onKey(event));
  document.removeEventListener('click', onOutsideClick);
  window.removeEventListener('resize', () => layout());
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
