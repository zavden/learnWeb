---
example_description: "document.startViewTransition() devuelve un ViewTransition con tres promesas: updateCallbackDone (el DOM ya cambió), ready (las fotos están hechas y la animación empieza) y finished (terminó). skipTransition() aplica el cambio sin animar: ready se rechaza y finished se cumple igual"
example_tags: "javascript|view-transitions|startviewtransition|promesas|skiptransition|web-animations"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Ficha de producto</h1>
  <article id="card" class="card">
    <span class="card__icon" aria-hidden="true">🌵</span>
    <h2 class="card__title">Nopal en maceta</h2>
    <p class="card__details">Maceta de barro de 20 cm. Riego cada dos semanas; sol directo.</p>
  </article>
  <p>
    <button type="button" data-skip="no">Cambiar la vista</button>
    <button type="button" data-skip="yes">Cambiar sin animación (skipTransition)</button>
  </p>
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
  margin-top: 0;
}
.card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 20rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  background: #dcfce7;
}
.card__icon {
  font-size: 1.5rem;
}
.card__title {
  margin: 0;
  font-size: 1rem;
}
.card__details {
  display: none;
}
/* La vista detallada: en columna, icono grande y descripción */
.card.is-open {
  flex-direction: column;
  align-items: flex-start;
  padding: 1rem;
}
.card.is-open .card__icon {
  font-size: 3rem;
}
.card.is-open .card__details {
  display: block;
  margin: 0;
}
/* Con movimiento, el icono y el título viajan a su nuevo sitio (capítulo de CSS) */
@media (prefers-reduced-motion: no-preference) {
  .card__icon {
    view-transition-name: plant-icon;
  }
  .card__title {
    view-transition-name: plant-title;
  }
}
button {
  font: inherit;
  padding: 0.3rem 0.8rem;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.log {
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
const card = document.querySelector('#card');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

function switchView(skip) {
  const update = () => {
    card.classList.toggle('is-open');
    logLine('1. callback: el DOM cambia');
  };
  if (!document.startViewTransition) {        // sin View Transitions: el mismo cambio, sin animación
    update();
    return;
  }
  const transition = document.startViewTransition(update);
  if (skip) transition.skipTransition();      // el cambio se aplica, pero sin fotos ni animación
  transition.updateCallbackDone.then(() => logLine('2. updateCallbackDone: el DOM ya cambió'));
  transition.ready.then(
    () => logLine('3. ready: fotos hechas, empieza la animación'),
    (error) => logLine(`3. ready rechazada → ${error.name}: ${error.message}`),
  );
  transition.finished.then(() => logLine('4. finished: la transición terminó'));
}

document.querySelectorAll('[data-skip]').forEach((button) => {
  button.addEventListener('click', () => {
    logList.replaceChildren();
    switchView(button.dataset.skip === 'yes');
  });
});
console.log('¿startViewTransition existe? →', typeof document.startViewTransition === 'function');
console.log('Listo: pulsa «Cambiar la vista»');
```
