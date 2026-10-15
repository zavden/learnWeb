---
example_description: "Un MutationObserver recibe los cambios del DOM como registros (childList, attributes, characterData) con sus valores anteriores; no avisa en el acto: los junta y los entrega en una microtarea, después de que termine el script que los hizo"
example_tags: "javascript|mutationobserver|observers|microtareas|childlist|attributes|characterdata"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Comandas de cocina</h1>
  <ul id="orders" class="orders">
    <li data-status="en-cocina">Mesa 1 · Chilaquiles rojos</li>
    <li data-status="nueva">Mesa 2 · Pozole rojo</li>
    <li data-status="nueva">Mesa 3 · Tacos al pastr</li>
  </ul>
  <p class="actions">
    <button id="add" type="button">＋ Nueva comanda</button>
    <button id="ready" type="button">✓ Todas listas</button>
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
  margin: 0 0 0.5rem;
}
.orders {
  display: grid;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.orders li {
  padding: 0.4rem 0.75rem;
  border-left: 6px solid #7b8794;
  border-radius: 0.25rem;
  background: #ffffff;
}
.orders li::after {
  content: " · " attr(data-status);
  color: #52606d;
}
.orders [data-status="en-cocina"] { border-left-color: #b45309; }
.orders [data-status="lista"] { border-left-color: #15803d; }
.actions {
  display: flex;
  gap: 0.5rem;
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
const orders = document.querySelector('#orders');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

function describe(record) {
  if (record.type === 'childList') {
    return `childList → + ${record.addedNodes.length} nodo: «${record.addedNodes[0].textContent}»`;
  }
  if (record.type === 'attributes') {
    const table = record.target.textContent.split(' · ')[0]; // 'Mesa 2'
    const now = record.target.getAttribute(record.attributeName);
    return `attributes → ${table} · ${record.attributeName}: ${record.oldValue} → ${now}`;
  }
  return `characterData → «${record.oldValue}» → «${record.target.data}»`;
}

const observer = new MutationObserver((records) => {
  logLine(`— callback (microtarea) · ${records.length} registro${records.length === 1 ? '' : 's'} —`);
  for (const record of records) logLine(describe(record));
});
observer.observe(orders, {
  childList: true,              // hijos que entran o salen
  subtree: true,                // …y en todo lo que hay debajo
  attributes: true,
  attributeFilter: ['data-status'],
  attributeOldValue: true,      // guarda el valor anterior del atributo
  characterData: true,          // cambios en nodos de texto
  characterDataOldValue: true,
});

// Tres cambios seguidos, como los haría cualquier parte de la aplicación.
const order4 = document.createElement('li');
order4.dataset.status = 'nueva'; // aún no está en la lista: no genera registro
order4.textContent = 'Mesa 4 · Enchiladas suizas';
orders.append(order4);
logLine('1. añado la comanda de la mesa 4');
orders.children[1].dataset.status = 'en-cocina';
logLine('2. la mesa 2 pasa a «en-cocina»');
orders.children[2].firstChild.data = 'Mesa 3 · Tacos al pastor'; // el nodo de texto
logLine('3. corrijo la errata de la mesa 3');
logLine('Listo: el script terminó y el callback aún no se ha ejecutado; pulsa los botones');

let nextTable = 5;
document.querySelector('#add').addEventListener('click', () => {
  const order = document.createElement('li');
  order.dataset.status = 'nueva';
  order.textContent = `Mesa ${nextTable} · Sopa de lima`;
  nextTable += 1;
  orders.append(order);
});
// Varios cambios en un mismo clic llegan juntos, en una sola llamada.
document.querySelector('#ready').addEventListener('click', () => {
  for (const order of orders.querySelectorAll('li:not([data-status="lista"])')) {
    order.dataset.status = 'lista';
  }
});
```
