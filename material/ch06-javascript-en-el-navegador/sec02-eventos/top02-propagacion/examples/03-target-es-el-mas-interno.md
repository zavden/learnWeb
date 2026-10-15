---
example_description: "Un botón con un icono y un contador dentro: según dónde pulses, event.target es el <span> o el <svg>/<path>, no el botón, y su dataset está vacío; currentTarget o closest('button') dan siempre el botón"
example_tags: "javascript|eventos|target|currenttarget|closest|svg|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Café de Chiapas · 500 g</h1>
  <button id="add" class="add" type="button" data-sku="CAF-500">
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.5L20 8H6" fill="none" stroke="currentColor" stroke-width="2"/>
    </svg>
    Añadir
    <span class="badge" id="badge">0</span>
  </button>
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
.add {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font: inherit;
  font-size: 1.1rem;
  padding: 0.5rem 0.9rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
.add:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.badge {
  min-width: 1.6rem;
  padding: 0.15rem 0.4rem;
  border-radius: 1rem;
  background: #1d4ed8;
  color: #ffffff;
  font-size: 0.9rem;
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
let units = 0;
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

document.querySelector('#add').addEventListener('click', (event) => {
  // 🐛 target es lo que hay JUSTO bajo el puntero: el <path> del icono, el
  //    <span> del contador… Su dataset no tiene sku.
  logLine(`🐛 target → ${event.target.tagName} · sku: ${event.target.dataset.sku}`);
  // ✅ currentTarget es el elemento que escucha: el botón, siempre.
  logLine(`✅ currentTarget → ${event.currentTarget.tagName} · sku: ${event.currentTarget.dataset.sku}`);
  // ✅ closest sube desde target hasta encontrar un botón (útil en delegación).
  logLine(`✅ target.closest('button') → sku: ${event.target.closest('button').dataset.sku}`);
  units += 1;
  document.querySelector('#badge').textContent = units;
});
logLine('Listo: pulsa el icono del carrito, luego el número y luego «Añadir»');

// Fíjate en el tagName: 'SPAN' y 'BUTTON' van en mayúsculas (HTML), pero
// 'path' y 'svg' en minúsculas (los elementos SVG conservan su nombre).
// Otro arreglo, solo de CSS: .add * { pointer-events: none; } hace que los
// hijos no puedan ser target. Funciona, pero esconde el problema; en JS,
// currentTarget o closest son explícitos.
```
