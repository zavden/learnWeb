---
example_description: "El CSS de prefers-reduced-motion no alcanza al movimiento que crea JavaScript: un scrollTo con behavior: 'smooth' se anima igual; el script pregunta con matchMedia, elige 'smooth' o 'instant' y se actualiza con change si la persona cambia el ajuste"
example_tags: "javascript|matchmedia|prefers-reduced-motion|accesibilidad|scrollto|smooth"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Tamales de rajas</h1>
  <nav class="jumps" aria-label="Saltar a un paso">
    <button type="button" data-step="1">Paso 1</button>
    <button type="button" data-step="3">Paso 3</button>
    <button type="button" data-step="6">Paso 6</button>
  </nav>
  <p class="motion">Desplazamiento: <output id="behavior">—</output></p>
  <div id="steps" class="steps" tabindex="0" role="region" aria-label="Pasos de la receta">
    <section id="step-1"><h2>Paso 1</h2><p>Remoja las hojas de maíz en agua caliente media hora.</p></section>
    <section id="step-2"><h2>Paso 2</h2><p>Asa los chiles poblanos, pélalos y córtalos en rajas.</p></section>
    <section id="step-3"><h2>Paso 3</h2><p>Bate la masa con manteca y caldo hasta que una bolita flote en agua.</p></section>
    <section id="step-4"><h2>Paso 4</h2><p>Unta masa en cada hoja y pon rajas, queso y salsa verde.</p></section>
    <section id="step-5"><h2>Paso 5</h2><p>Dobla las hojas y acomoda los tamales de pie en la vaporera.</p></section>
    <section id="step-6"><h2>Paso 6</h2><p>Cuécelos una hora; están listos cuando la masa se despega de la hoja.</p></section>
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
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin: 0 0 0.5rem;
}
.jumps {
  display: flex;
  gap: 0.5rem;
}
.motion {
  margin: 0.4rem 0;
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
button:focus-visible,
.steps:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
/* position: relative → el offsetTop de cada paso se mide desde el panel. */
.steps {
  position: relative;
  height: 10rem;
  overflow-y: auto;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
}
.steps section {
  padding: 0.25rem 1rem 0.75rem;
  border-bottom: 1px solid #e4e7eb;
}
.steps h2 {
  margin: 0.5rem 0 0.25rem;
  font-size: 1rem;
}
.steps p {
  margin: 0;
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
const panel = document.querySelector('#steps');
const behaviorOutput = document.querySelector('#behavior');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// La preferencia, viva: si la persona la cambia con la página abierta, se nota.
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const scrollBehavior = () => (reduceMotion.matches ? 'instant' : 'smooth');
function showBehavior() {
  behaviorOutput.textContent = scrollBehavior();
}
showBehavior();
logLine(`(prefers-reduced-motion: reduce) → ${reduceMotion.matches} · desplazamiento: ${scrollBehavior()}`);
reduceMotion.addEventListener('change', () => {
  showBehavior();
  logLine(`change → reduce: ${reduceMotion.matches} · desplazamiento: ${scrollBehavior()}`);
});

document.querySelector('.jumps').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const step = document.querySelector(`#step-${button.dataset.step}`);
  // Un CSS con @media (prefers-reduced-motion) no puede frenar esta animación:
  // la pide el script. 'smooth' anima; 'instant' salta.
  panel.scrollTo({ top: step.offsetTop, behavior: scrollBehavior() });
  logLine(`↕ panel.scrollTo({ behavior: '${scrollBehavior()}' }) → ${button.textContent}`);
});
logLine('Listo: pulsa «Paso 6» y «Paso 1»');

// Si basta con CSS, también vale: html { scroll-behavior: smooth } dentro de
// @media (prefers-reduced-motion: no-preference), y en JS behavior: 'auto'.
```
