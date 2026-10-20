---
example_description: "Escribir un estilo solo deja el layout pendiente; leer una medida justo después obliga al navegador a calcularlo en ese momento (un layout forzado) para devolver el número correcto. Varias escrituras seguidas cuestan un solo layout; leer tras cada escritura cuesta uno por lectura"
example_tags: "javascript|dom|layout|reflow|offsetheight|rendimiento"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<div class="panel" id="panel">Detalles del pedido P-1024</div>
```

# CSS

```css
.panel {
  height: 40px;
  padding: 0 1rem;
  font: 16px/40px system-ui, sans-serif;
  background: #eff6ff;
}
```

# JavaScript

```javascript
const panel = document.querySelector('#panel');
console.log('altura →', panel.offsetHeight);

// ESCRIBIR un estilo no calcula nada todavía: el navegador apunta «layout
// pendiente» y lo calculará antes de pintar el siguiente frame.
panel.style.height = '120px';
// LEER una medida con cambios pendientes le OBLIGA a calcular el layout YA
// (un «layout forzado»), para que el número sea el correcto:
console.log('altura justo después de cambiarla →', panel.offsetHeight);

// Varias escrituras seguidas se acumulan: un solo layout cuando alguien lee.
panel.style.height = '200px';
panel.style.padding = '0 2rem';
panel.style.height = '80px';
console.log('tras tres escrituras →', panel.offsetHeight);

// Lo que cuesta: 300 lecturas con el layout al día, frente a 300 lecturas
// con un cambio pendiente antes de cada una.
const READS = 300;
let sum = 0;
let start = performance.now();
for (let i = 0; i < READS; i++) {
  sum += panel.offsetHeight; // nada pendiente: la medida ya está calculada
}
const cleanMs = performance.now() - start;

start = performance.now();
for (let i = 0; i < READS; i++) {
  panel.style.height = `${80 + (i % 2)}px`; // escribir…
  sum += panel.offsetHeight; // …y leer: un layout forzado en cada vuelta
}
const forcedMs = performance.now() - start;

console.log(`${READS} lecturas sin cambios → ${cleanMs.toFixed(2)} ms (varía)`);
console.log(`${READS} lecturas tras un cambio → ${forcedMs.toFixed(2)} ms (varía)`);
console.log('¿leer tras escribir es más caro? →', forcedMs > cleanMs);

// Fuerzan el layout: offset*, client*, scroll*, getBoundingClientRect(),
// getComputedStyle (las medidas), innerText, scrollTo/scrollIntoView y focus().
```
