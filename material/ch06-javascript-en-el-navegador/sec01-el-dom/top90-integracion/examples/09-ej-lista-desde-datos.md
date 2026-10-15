---
example_description: "Ejercicio: pinta un catálogo desde un array sin innerHTML: clona la plantilla, rellena con textContent, guarda el SKU en dataset, marca los agotados con classList, inserta todo de una vez sin duplicar al repetir y muestra u oculta el aviso de catálogo vacío"
example_tags: "javascript|dom|ejercicio|template|textcontent|dataset|classlist|hidden"
exercise: true
exercise_title: "Un catálogo desde los datos"
exercise_instructions: "renderProducts(list, products): por cada producto, clona el contenido de #product-template y rellena .name y .price con textContent (el precio con formatPrice) || Guarda el SKU en el atributo data-sku del <li> (con dataset) y añade la clase sold-out solo a los productos con stock 0 || Inserta todos los <li> de una vez y sustituyendo lo que hubiera: llamar dos veces a renderProducts no debe duplicar la lista || updateEmptyMessage(products): el párrafo #empty-message se ve cuando no hay productos y se oculta cuando los hay (propiedad hidden) || Ejecuta hasta que las siete comprobaciones salgan ✓"
exercise_hints: "template.content.cloneNode(true) da una copia; el <li> es su firstElementChild (guárdalo antes de insertar la copia) || dataset.sku = 'CAF-CHI' crea el atributo data-sku || classList.toggle('sold-out', condición) pone o quita la clase sin if || replaceChildren(...items) cambia todos los hijos de una vez: un array de <li> y el spread || hidden = true oculta y hidden = false muestra"
exercise_solution_example: 09-ej-lista-desde-datos-solucion.md
exercise_locked_files: index.html
example_stage: exercise
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
// EJERCICIO: pinta el catálogo desde los datos, sin innerHTML. Completa los TODO.
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
  // TODO 1: por cada producto, clona template.content y rellena .name y .price
  // TODO 2: dataset.sku en el <li> y la clase sold-out si stock === 0
  // TODO 3: inserta todos los <li> de una vez, SUSTITUYENDO lo que hubiera
}

function updateEmptyMessage(items) {
  // TODO 4: #empty-message visible sin productos, oculto con productos
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
