---
example_description: "Pestañas accesibles (role tablist, tabindex itinerante, flechas, Inicio y Fin) cuyo cambio de panel es una View Transition: el panel se desliza hacia un lado u otro según la dirección, un cambio rápido salta la transición en curso con skipTransition(), y sin soporte (o con «reducir movimiento») el cambio es instantáneo"
example_tags: "javascript|view-transitions|startviewtransition|skiptransition|tabs|aria|teclado|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="recipe">
  <h1>Mole poblano</h1>
  <div class="tabs">
    <div class="tabs__list" role="tablist" aria-label="Secciones de la receta">
      <button type="button" role="tab" id="tab-ingredients" aria-controls="panel-ingredients" aria-selected="true">Ingredientes</button>
      <button type="button" role="tab" id="tab-steps" aria-controls="panel-steps" aria-selected="false" tabindex="-1">Preparación</button>
      <button type="button" role="tab" id="tab-history" aria-controls="panel-history" aria-selected="false" tabindex="-1">Historia</button>
    </div>
    <div class="tabs__viewport">
      <section class="tabs__panel" role="tabpanel" id="panel-ingredients" aria-labelledby="tab-ingredients" tabindex="0">
        <ul>
          <li>4 chiles mulatos, 4 anchos y 3 pasillas</li>
          <li>60 g de chocolate de mesa</li>
          <li>2 jitomates asados y media cebolla</li>
          <li>Ajonjolí, almendras, pasas y una tortilla dorada</li>
        </ul>
      </section>
      <section class="tabs__panel" role="tabpanel" id="panel-steps" aria-labelledby="tab-steps" tabindex="0" hidden>
        <ol>
          <li>Desvena, tuesta y remoja los chiles.</li>
          <li>Fríe por separado las semillas, la fruta y la tortilla.</li>
          <li>Muele todo con el caldo y cocina a fuego lento con el chocolate.</li>
        </ol>
      </section>
      <section class="tabs__panel" role="tabpanel" id="panel-history" aria-labelledby="tab-history" tabindex="0" hidden>
        <p>La tradición lo sitúa en un convento de Puebla en el siglo XVII, aunque las salsas de chiles molidos son mucho más antiguas.</p>
      </section>
    </div>
  </div>
  <ol id="log" class="log" aria-hidden="true"></ol>
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
.recipe {
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.tabs__list {
  display: flex;
  gap: 0.25rem;
  border-bottom: 2px solid #cbd2d9;
}
[role="tab"] {
  font: inherit;
  padding: 0.4rem 0.9rem;
  border: 0;
  border-bottom: 3px solid transparent;
  background: none;
  color: #52606d;
  cursor: pointer;
}
[role="tab"][aria-selected="true"] {
  border-bottom-color: #0e7490;
  color: #1f2933;
  font-weight: 600;
}
[role="tab"]:focus-visible,
.tabs__panel:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.tabs__viewport {
  overflow: hidden;              /* el panel que se desliza no se sale de la tarjeta */
}
.tabs__panel {
  min-height: 8rem;
  padding: 0.5rem 0.75rem;
  background: #ffffff;
  view-transition-name: recipe-panel;
}
.tabs__panel[hidden] {
  display: none;
}
/* La transición: el panel viejo sale por un lado y el nuevo entra por el otro */
@keyframes slide-out-left { to { translate: -40px 0; opacity: 0; } }
@keyframes slide-in-right { from { translate: 40px 0; opacity: 0; } }
@keyframes slide-out-right { to { translate: 40px 0; opacity: 0; } }
@keyframes slide-in-left { from { translate: -40px 0; opacity: 0; } }
::view-transition-old(recipe-panel) {
  animation: 220ms ease-in both slide-out-left;
}
::view-transition-new(recipe-panel) {
  animation: 260ms ease-out both slide-in-right;
}
html[data-direction="back"]::view-transition-old(recipe-panel) {
  animation-name: slide-out-right;
}
html[data-direction="back"]::view-transition-new(recipe-panel) {
  animation-name: slide-in-left;
}
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none;
  }
}
.log {
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
  color: #52606d;
}
```

# JavaScript

```javascript
// Pestañas con View Transitions.
//
// Decisiones de diseño:
// - El patrón de pestañas de ARIA: tablist/tab/tabpanel, aria-selected, un solo tab con
//   tabindex="0" (Tab entra y sale de la lista de un salto), flechas, Inicio y Fin. Activación
//   automática: moverse con las flechas cambia de panel.
// - select() cambia el DOM y nada más; startViewTransition(select) lo anima. Sin soporte, se
//   llama a select() directamente: la transición es una mejora.
// - La dirección (adelante/atrás) va en un atributo de <html> que el CSS usa para elegir hacia
//   dónde se desliza el panel.
// - Si llega otro cambio mientras una transición está en marcha, skipTransition() la termina:
//   el DOM ya cambió y la nueva empieza desde ese estado.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

const tabs = [...document.querySelectorAll('[role="tab"]')];
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

function select(index) {
  tabs.forEach((tab, i) => {
    const selected = i === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
  });
}

let current = 0;
let transition = null;
function activate(index, { focus = false } = {}) {
  if (index === current) return;
  const direction = index > current ? 'forward' : 'back';
  current = index;
  if (focus) tabs[index].focus();
  if (!document.startViewTransition) {
    select(index);
    logLine(`📑 ${tabs[index].textContent} (sin View Transitions)`);
    return;
  }
  if (transition) {
    transition.skipTransition();                  // la anterior, al final de golpe
    logLine('⏭️ transición anterior saltada');
  }
  document.documentElement.dataset.direction = direction;
  const started = document.startViewTransition(() => select(index));
  transition = started;
  logLine(`📑 ${tabs[index].textContent} (${direction === 'forward' ? '→' : '←'})`);
  started.ready.catch(() => {});                  // si se salta, ready se rechaza: es esperable
  started.finished.then(() => {
    if (transition === started) transition = null;
  });
}

document.querySelector('[role="tablist"]').addEventListener('click', (event) => {
  const tab = event.target.closest('[role="tab"]');
  if (tab) activate(tabs.indexOf(tab));
});
document.querySelector('[role="tablist"]').addEventListener('keydown', (event) => {
  const moves = {
    ArrowRight: (current + 1) % tabs.length,
    ArrowLeft: (current - 1 + tabs.length) % tabs.length,
    Home: 0,
    End: tabs.length - 1,
  };
  if (!(event.key in moves)) return;
  event.preventDefault();
  activate(moves[event.key], { focus: true });
});

console.log('¿View Transitions? →', typeof document.startViewTransition === 'function');
logLine('Listo: pulsa «Preparación» y «Historia», o Tab hasta las pestañas y las flechas');
```
