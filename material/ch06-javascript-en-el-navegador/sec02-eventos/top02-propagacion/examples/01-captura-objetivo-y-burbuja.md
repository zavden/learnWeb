---
example_description: "El viaje de un clic: baja de window al botón (captura, fase 1), llega al objetivo (fase 2) y vuelve a subir (burbuja, fase 3); un listener por nivel y por fase lo escribe en orden"
example_tags: "javascript|eventos|propagacion|captura|burbuja|eventphase"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <section id="board" class="board" aria-label="Tablero">
    <h1>Por hacer</h1>
    <article id="card" class="card">
      <h2>Fotografiar la carta de otoño</h2>
      <button id="archive" type="button">Archivar</button>
    </article>
  </section>
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
h2 {
  font-size: 1rem;
  margin: 0 0 0.5rem;
}
.board {
  padding: 0.75rem;
  border: 2px dashed #7b8794;
  border-radius: 0.75rem;
}
.card {
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
button {
  font: inherit;
  padding: 0.4rem 0.8rem;
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
const logList = document.querySelector('#log');
const phaseNames = { 1: 'captura', 2: 'objetivo', 3: 'burbuja' };
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
function label(node) {
  if (node === window) return 'window';
  if (node === document) return 'document';
  return `#${node.id}`;
}

function report(event) {
  if (!event.target.closest('#board')) return; // solo los clics dentro del tablero
  const where = label(event.currentTarget);
  if (where === 'window' && event.eventPhase === Event.CAPTURING_PHASE) {
    logList.textContent = ''; // un clic nuevo: empieza la lista de cero
  }
  logLine(`${phaseNames[event.eventPhase]} · ${where} (fase ${event.eventPhase})`);
}

const levels = [window, document, document.querySelector('#board'),
  document.querySelector('#card'), document.querySelector('#archive')];
for (const node of levels) {
  node.addEventListener('click', report, { capture: true }); // al bajar
  node.addEventListener('click', report);                    // al subir
}
logLine('Listo: pulsa «Archivar»; luego, el título de la tarjeta');

// Event.CAPTURING_PHASE = 1, Event.AT_TARGET = 2, Event.BUBBLING_PHASE = 3.
// En el objetivo se ejecutan los dos listeners del botón (fase 2): primero el
// de captura y después el otro.
```
