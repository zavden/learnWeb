---
example_description: "Cada vez que se abre el panel de un pedido se añade un listener de keydown a document y nadie lo quita: a la cuarta apertura, una pulsación de Escape ejecuta cuatro manejadores, tres de ellos con pedidos viejos que siguen en memoria. Un AbortController por apertura quita el listener al cerrar"
example_tags: "javascript|memoria|fugas|listeners|abortcontroller|eventos|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Pedidos del día</h1>
  <p class="actions">
    <button id="open-buggy" type="button">Ver pedido 🐛</button>
    <button id="open-fixed" type="button">Ver pedido ✅</button>
    <button id="clean" type="button">Quitar los listeners 🐛</button>
  </p>
  <section id="panel" class="panel" hidden aria-labelledby="panel-title">
    <h2 id="panel-title">Pedido</h2>
    <p>Tres tamales de rajas y un champurrado. Cierra con Escape o con el botón.</p>
    <button id="close" type="button">Cerrar</button>
  </section>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
h2 { font-size: 1rem; margin: 0; }
.actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
button { font: inherit; padding: 0.3rem 0.7rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; cursor: pointer; }
button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.panel { display: grid; gap: 0.4rem; justify-items: start; padding: 0.75rem; border: 2px solid #1d4ed8; border-radius: 0.5rem; background: #ffffff; }
.panel[hidden] { display: none; }
.panel p { margin: 0; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
const panel = document.querySelector('#panel');
const panelTitle = document.querySelector('#panel-title');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

let orderNumber = 100;
let handlerRuns = 0;
const keyListeners = { '🐛': 0, '✅': 0 }; // nuestro registro de listeners de keydown en document
const buggyHandlers = [];                    // solo para poder limpiar la demostración
let closeCurrent = () => {};

function showPanel(kind, order) {
  panelTitle.textContent = `Pedido ${order} ${kind}`;
  panel.hidden = false;
}

// 🐛 Cada apertura registra un listener NUEVO (otra función, otro closure con su pedido)
//    y «Cerrar» solo oculta el panel: los listeners se acumulan en document.
function openBuggy() {
  const order = `P-${++orderNumber}`;
  showPanel('🐛', order);
  const onKey = (event) => {
    if (event.key !== 'Escape') return;
    handlerRuns += 1;
    logLine(`🐛 Escape → cerrando el pedido ${order}`);
    panel.hidden = true;
  };
  document.addEventListener('keydown', onKey);
  buggyHandlers.push(onKey);
  keyListeners['🐛'] += 1;
  closeCurrent = () => { panel.hidden = true; };
}

// ✅ Un AbortController por apertura: al cerrar (con el botón o con Escape), abort() quita
//    el listener, y el closure con su pedido queda libre para el recolector.
let panelController = null;
function openFixed() {
  panelController?.abort(); // si ya había uno abierto, se cierra antes
  const controller = new AbortController();
  panelController = controller;
  const order = `P-${++orderNumber}`;
  showPanel('✅', order);
  keyListeners['✅'] += 1;
  controller.signal.addEventListener('abort', () => { keyListeners['✅'] -= 1; });
  const closePanel = () => {
    controller.abort();
    panel.hidden = true;
  };
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    handlerRuns += 1;
    logLine(`✅ Escape → cerrando el pedido ${order}`);
    closePanel();
  }, { signal: controller.signal });
  closeCurrent = closePanel;
}

function pressEscape() {
  handlerRuns = 0;
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  return handlerRuns;
}

// La demostración al cargar: tres aperturas cerradas con «Cerrar» y, a la cuarta, Escape.
logLine('— 🐛 el panel se abre y se cierra con «Cerrar» tres veces; a la cuarta, Escape —');
for (let i = 0; i < 3; i++) { openBuggy(); closeCurrent(); }
openBuggy();
let runs = pressEscape();
logLine(`🐛 una pulsación → ${runs} manejadores · listeners de keydown en document: ${keyListeners['🐛']}`);
for (const onKey of buggyHandlers.splice(0)) document.removeEventListener('keydown', onKey); // limpia la demostración
keyListeners['🐛'] = 0;

logLine('— ✅ lo mismo con un AbortController por apertura —');
for (let i = 0; i < 3; i++) { openFixed(); closeCurrent(); }
openFixed();
runs = pressEscape();
logLine(`✅ una pulsación → ${runs} manejador · listeners de keydown en document: ${keyListeners['✅']}`);

document.querySelector('#open-buggy').addEventListener('click', openBuggy);
document.querySelector('#open-fixed').addEventListener('click', openFixed);
document.querySelector('#close').addEventListener('click', () => closeCurrent());
document.querySelector('#clean').addEventListener('click', () => {
  for (const onKey of buggyHandlers.splice(0)) document.removeEventListener('keydown', onKey);
  keyListeners['🐛'] = 0;
  logLine('🧹 listeners 🐛 quitados');
});
console.log('Listo: pulsa «Ver pedido 🐛», «Cerrar», otra vez «Ver pedido 🐛» y Escape');

// En DevTools (con ↗): la consola acepta getEventListeners(document).keydown.length, y
// More tools › Performance monitor tiene un contador «JS event listeners» que sube con cada
// apertura 🐛 y nunca baja.
```
