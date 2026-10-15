---
example_description: "Solución: cada producto es una copia de la plantilla rellenada con textContent, con dataset.sku y classList.toggle('sold-out'); replaceChildren inserta la lista de una vez sin duplicar, y hidden muestra el aviso solo cuando no hay productos"
example_tags: "javascript|dom|solucion|template|textcontent|dataset|classlist|hidden"
example_stage: final-solution
example_importance: important
console: true
---

# HTML

```html
<main class="catalog">
  <h1>Catálogo</h1>
  <ul id="products"></ul>
  <p id="empty-message" hidden>No hay productos en esta categoría.</p>
</main>

<template id="product-template">
  <li class="product"><span class="name"></span> · <span class="price"></span></li>
</template>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}
.sold-out {
  color: #475569;
  text-decoration: line-through;
}
```

# JavaScript

```javascript
// SOLUCIÓN: el catálogo desde los datos, sin innerHTML.
const products = [
  { sku: 'CAF-CHI', name: 'Café de Chiapas 500 g', price: 210, stock: 12 },
  { sku: 'CAF-VER', name: '<b>Oferta</b> Café de Veracruz 500 g', price: 185, stock: 0 },
  { sku: 'MOL-MAN', name: 'Molinillo manual', price: 549, stock: 4 },
  { sku: 'FIL-100', name: 'Filtros de papel ×100', price: 65, stock: 0 },
];

const formatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const formatPrice = (price) => formatter.format(price);
const template = document.querySelector('#product-template');

function renderProducts(list, items) {
  const rows = items.map((product) => {
    const copy = template.content.cloneNode(true); // una copia: la plantilla no se vacía
    const item = copy.firstElementChild; // el <li>, antes de que la copia se vacíe al insertarla
    item.querySelector('.name').textContent = product.name; // texto, nunca HTML
    item.querySelector('.price').textContent = formatPrice(product.price);
    item.dataset.sku = product.sku;
    item.classList.toggle('sold-out', product.stock === 0);
    return item;
  });
  list.replaceChildren(...rows); // una sola operación, y sustituye lo anterior
}

function updateEmptyMessage(items) {
  document.querySelector('#empty-message').hidden = items.length > 0;
}

const list = document.querySelector('#products');
renderProducts(list, products);
updateEmptyMessage(products);

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, compute, expected) {
  let actual;
  try {
    actual = compute();
  } catch (error) {
    actual = `${error.name}: ${error.message}`;
  }
  if (Object.is(actual, expected)) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}
const items = () => [...list.querySelectorAll(':scope > li.product')];
const message = document.querySelector('#empty-message');

check('hay 4 <li class="product"> y la plantilla sigue intacta',
  () => items().length === 4 && template.content.childElementCount === 1, true);
check('el nombre con <b> se ve como texto (y no crea un <b>)',
  () => items()[1]?.querySelector('.name').textContent === '<b>Oferta</b> Café de Veracruz 500 g' && list.querySelector('b') === null, true);
check('los precios van formateados', () => items().map((item) => item.querySelector('.price').textContent).join(' '), '$210.00 $185.00 $549.00 $65.00');
check('cada <li> lleva su data-sku', () => items().map((item) => item.getAttribute('data-sku')).join(' '), 'CAF-CHI CAF-VER MOL-MAN FIL-100');
check('solo los agotados tienen la clase sold-out', () => items().map((item) => item.classList.contains('sold-out')).join(' '), 'false true false true');
check('pintar otra vez no duplica', () => {
  renderProducts(list, products);
  return items().length;
}, 4);
check('el aviso aparece sin productos y se oculta con ellos', () => {
  renderProducts(list, []);
  updateEmptyMessage([]);
  const shownWhenEmpty = !message.hidden && items().length === 0;
  renderProducts(list, products);
  updateEmptyMessage(products);
  return shownWhenEmpty && message.hidden;
}, true);
```
