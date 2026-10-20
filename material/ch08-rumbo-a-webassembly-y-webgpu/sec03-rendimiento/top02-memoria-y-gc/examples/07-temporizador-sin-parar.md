---
example_description: "Un setInterval que nadie para sigue ejecutándose después de quitar el widget de la página: actualiza un reloj que ya no se ve, gasta CPU y mantiene vivo el widget desconectado, porque la lista de temporizadores es una raíz para el recolector. clearInterval al desmontar lo arregla"
example_tags: "javascript|memoria|fugas|setinterval|temporizadores|componentes|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Subastas en vivo</h1>
  <p class="actions">
    <button id="leak" type="button">Montar y quitar un widget 🐛</button>
    <button id="clean" type="button">Parar los temporizadores huérfanos</button>
  </p>
  <p id="orphans" class="orphans" role="status">Temporizadores huérfanos: 0</p>
  <div id="widgets" class="widgets"></div>
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
.orphans { font-variant-numeric: tabular-nums; }
.widgets { display: grid; gap: 0.5rem; }
.auction { padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; }
.auction p { margin: 0.25rem 0 0; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
const TICK_MS = 200;
const DEMO_LIMIT_MS = 20_000; // límite de la demostración: un temporizador 🐛 se para solo a los 20 s
const widgetList = document.querySelector('#widgets');
const orphanLine = document.querySelector('#orphans');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const orphans = new Set(); // temporizadores cuyo widget ya no está en la página (nuestro registro)
let wastedTicks = 0;
function showOrphans() {
  orphanLine.textContent = `Temporizadores huérfanos: ${orphans.size} · ticks para nadie: ${wastedTicks}`;
}

// Un widget de subasta con su cuenta atrás. Devuelve lo necesario para desmontarlo.
function mountAuction(kind, item) {
  const widget = document.createElement('section');
  widget.className = 'auction';
  widget.innerHTML = `<h2>${kind} ${item}</h2><p class="clock"></p>`;
  widgetList.append(widget);
  const clock = widget.querySelector('.clock');
  const endsAt = performance.now() + 90_000;
  const auction = { widget, intervalId: 0, ticksAfterRemoval: 0 };
  const tick = () => {
    clock.textContent = `termina en ${Math.ceil((endsAt - performance.now()) / 1000)} s`;
    if (!widget.isConnected) { // 🐛 trabaja para un widget que nadie ve
      auction.ticksAfterRemoval += 1;
      wastedTicks += 1;
      showOrphans();
    }
  };
  tick();
  auction.intervalId = setInterval(tick, TICK_MS); // el callback apunta a `widget` y a `clock`
  return auction;
}
// 🐛 Quitar el widget no para su temporizador: el intervalo sigue, y con él el widget.
function unmountBuggy(auction) {
  auction.widget.remove();
  orphans.add(auction.intervalId);
  showOrphans();
  setTimeout(() => { clearInterval(auction.intervalId); orphans.delete(auction.intervalId); showOrphans(); }, DEMO_LIMIT_MS);
}
// ✅ Desmontar = parar todo lo que el widget puso en marcha (en un web component, en disconnectedCallback).
function unmountFixed(auction) {
  clearInterval(auction.intervalId);
  auction.widget.remove();
}

const buggy = mountAuction('🐛', 'Jarrón de Talavera');
const fixed = mountAuction('✅', 'Rebozo de Santa María');
logLine('dos widgets montados: 🐛 y ✅');
setTimeout(() => {
  unmountBuggy(buggy);
  unmountFixed(fixed);
  logLine('los dos widgets, quitados de la página');
}, 300);
setTimeout(() => {
  logLine(`🐛 ¿su temporizador siguió después de quitarlo? ${buggy.ticksAfterRemoval > 0} · ¿el widget está en la página? ${buggy.widget.isConnected}`);
  logLine(`✅ ¿su temporizador siguió después de quitarlo? ${fixed.ticksAfterRemoval > 0}`);
  clearInterval(buggy.intervalId); // la demostración lo para aquí; en una app seguiría para siempre
  orphans.delete(buggy.intervalId);
  showOrphans();
  logLine('Listo: pulsa «Montar y quitar un widget 🐛» y mira el contador de huérfanos');
}, 1600);

let leaked = 0;
document.querySelector('#leak').addEventListener('click', () => {
  if (orphans.size >= 5) return logLine('límite de la demostración: 5 huérfanos; páralos primero');
  leaked += 1;
  const auction = mountAuction('🐛', `Lote ${leaked}: máscara de Olinalá`);
  setTimeout(() => unmountBuggy(auction), 300);
  logLine(`🐛 widget ${leaked} montado y quitado · su temporizador sigue`);
});
document.querySelector('#clean').addEventListener('click', () => {
  for (const intervalId of orphans) clearInterval(intervalId);
  logLine(`🧹 temporizadores parados: ${orphans.size}`);
  orphans.clear();
  showOrphans();
});
showOrphans();
```
