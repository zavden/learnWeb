---
example_description: "Un worker no tiene DOM: en su ámbito global hay fetch, setTimeout, indexedDB, crypto, TextEncoder u OffscreenCanvas, pero no document, window, localStorage ni alert; si intenta escribir en la página, lanza ReferenceError (evento error en el Worker y «Uncaught» en la consola). La solución: el worker devuelve el dato y la página lo escribe"
example_tags: "javascript|workers|dom|referenceerror|error|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Tu carrito</h1>
  <p class="total">Total: <output id="total">calculando…</output></p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 30rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.5rem; }
.total { font-size: 1.1rem; }
output { font-weight: 700; color: #166534; }
.log { padding-inline-start: 1.25rem; font-size: 0.85rem; }
```

# JavaScript

```javascript
// El worker es 04-no-dom/cart-worker.js («Assets»), un worker de módulo.
const totalOutput = document.querySelector('#total');
const logList = document.querySelector('#log');
function report(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const formatMXN = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
const lines = [
  { product: 'Plato de Talavera', price: 450, qty: 2 },
  { product: 'Rebozo de algodón', price: 380, qty: 1 },
  { product: 'Alebrije pequeño', price: 105, qty: 1 },
];

const worker = new Worker('04-no-dom/cart-worker.js', { type: 'module' });
worker.addEventListener('message', (event) => {
  const message = event.data;
  if (message.type === 'inventory') {
    report(`en el worker hay → ${message.present.join(', ')}`);
    report(`en el worker NO hay → ${message.missing.join(', ')}`);
    worker.postMessage({ type: 'render', lines }); // 🐛 «escribe tú el total en la página»
  } else if (message.type === 'total') {
    totalOutput.textContent = formatMXN(message.total); // ✅ la página escribe en su DOM
    report(`✅ total escrito por la página → ${totalOutput.textContent}`);
    worker.terminate();
  }
});
worker.addEventListener('error', (event) => {
  // Sin event.preventDefault(), el error sigue su camino hasta la página y la
  // consola lo muestra además como «Uncaught ReferenceError…».
  report(`🐛 error en el worker → ${event.message}`);
  report(`   en ${event.filename.split('/').pop()}, línea ${event.lineno}`);
  worker.postMessage({ type: 'total', lines }); // el worker sigue vivo: le pedimos solo el número
});
```
