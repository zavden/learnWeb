---
example_description: "Una tabla que se ordena moviendo sus filas: una copia estática de tbody.rows, sort con los data-* y append(...filas), que mueve los mismos nodos en vez de crearlos; los botones de cada fila conservan su listener y su contador, y aria-sort dice cómo está ordenada"
example_tags: "javascript|dom|integracion|tabla|ordenar|append|dataset|aria-sort"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<table class="stock">
  <caption>Existencias de la tienda</caption>
  <thead>
    <tr>
      <th scope="col"><button type="button" data-sort="name">Producto</button></th>
      <th scope="col"><button type="button" data-sort="price">Precio</button></th>
      <th scope="col"><button type="button" data-sort="stock">Existencias</button></th>
      <th scope="col">Pedido</th>
    </tr>
  </thead>
  <tbody>
    <tr data-sku="MOL" data-name="Molinillo manual" data-price="549" data-stock="4"><td>Molinillo manual</td><td>$549</td><td>4</td><td><button type="button" class="add">Añadir (<span>0</span>)</button></td></tr>
    <tr data-sku="VER" data-name="Café de Veracruz 500 g" data-price="185" data-stock="0"><td>Café de Veracruz 500 g</td><td>$185</td><td>0</td><td><button type="button" class="add">Añadir (<span>0</span>)</button></td></tr>
    <tr data-sku="FIL" data-name="Filtros de papel ×100" data-price="65" data-stock="30"><td>Filtros de papel ×100</td><td>$65</td><td>30</td><td><button type="button" class="add">Añadir (<span>0</span>)</button></td></tr>
    <tr data-sku="PRE" data-name="Prensa francesa 1 L" data-price="420" data-stock="7"><td>Prensa francesa 1 L</td><td>$420</td><td>7</td><td><button type="button" class="add">Añadir (<span>0</span>)</button></td></tr>
    <tr data-sku="CHI" data-name="Café de Chiapas 500 g" data-price="210" data-stock="12"><td>Café de Chiapas 500 g</td><td>$210</td><td>12</td><td><button type="button" class="add">Añadir (<span>0</span>)</button></td></tr>
  </tbody>
</table>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}
.stock {
  border-collapse: collapse;
}
caption {
  margin-bottom: 0.5rem;
  font-weight: bold;
  text-align: start;
}
th,
td {
  padding: 0.3rem 0.6rem;
  text-align: start;
  border-bottom: 1px solid #cbd5e1;
}
th button {
  padding: 0;
  font: inherit;
  font-weight: bold;
  color: #1d4ed8;
  background: none;
  border: 0;
  cursor: pointer;
}
th[aria-sort="ascending"] button::after {
  content: ' ▲';
}
th[aria-sort="descending"] button::after {
  content: ' ▼';
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
const tbody = document.querySelector('.stock tbody');
const sortButtons = document.querySelectorAll('[data-sort]');

function sortTable(key) {
  const header = document.querySelector(`[data-sort="${key}"]`).closest('th');
  // Segundo clic en la misma columna: al revés.
  const direction = header.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
  const sign = direction === 'ascending' ? 1 : -1;
  const rows = [...tbody.rows]; // tbody.rows es VIVA: mejor una copia antes de mover
  rows.sort((a, b) => {
    const order = key === 'name'
      ? a.dataset.name.localeCompare(b.dataset.name, 'es')
      : Number(a.dataset[key]) - Number(b.dataset[key]); // dataset da strings
    return order * sign;
  });
  tbody.append(...rows); // MUEVE las filas: no se crea ni se destruye ninguna
  for (const button of sortButtons) button.closest('th').removeAttribute('aria-sort');
  header.setAttribute('aria-sort', direction);
}

// Un listener por botón «Añadir» (eventos: módulo siguiente); su contador vive
// en el propio botón, así que sobrevive a cualquier reordenación.
for (const button of tbody.querySelectorAll('.add')) {
  let count = 0;
  button.addEventListener('click', () => {
    count += 1;
    button.querySelector('span').textContent = count;
  });
}
for (const button of sortButtons) {
  button.addEventListener('click', () => sortTable(button.dataset.sort));
}

// Comprobaciones al cargar
const order = () => [...tbody.rows].map((row) => row.dataset.sku).join(' ');
const rowsBefore = new Set(tbody.rows);
const chiapasButton = tbody.querySelector('[data-sku="CHI"] .add');
chiapasButton.click();

sortTable('price');
console.log('precio ▲ →', order());
sortTable('price');
console.log('precio ▼ →', order());
sortTable('name');
console.log('nombre ▲ →', order());
console.log('¿las mismas filas (los mismos objetos)? →', [...tbody.rows].every((row) => rowsBefore.has(row)));
chiapasButton.click();
console.log('contador de Chiapas tras ordenar →', chiapasButton.textContent);
console.log('aria-sort →', [...document.querySelectorAll('thead th')].map((th) => th.getAttribute('aria-sort')));
```
