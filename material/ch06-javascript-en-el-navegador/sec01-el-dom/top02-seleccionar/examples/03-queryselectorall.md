---
example_description: "querySelectorAll devuelve una NodeList con todos los elementos que encajan, en el orden del documento: tiene length, índices y forEach, y es iterable (for…of, spread, desestructuración). Si no encaja nada, es una lista vacía, nunca null"
example_tags: "javascript|dom|queryselectorall|nodelist|iterable|for-of"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<h2>Cafés de la semana</h2>
<ul id="products">
  <li class="product">Café de Chiapas</li>
  <li class="product sold-out">Café de Nayarit</li>
  <li class="product">Café de Veracruz</li>
</ul>
<p id="summary"></p>
```

# JavaScript

```javascript
const products = document.querySelectorAll('.product');
console.log('products →', products);
console.log('length →', products.length);
console.log('[0] →', products[0].textContent);
console.log('item(1) →', products.item(1).textContent);

// NodeList tiene forEach, como los arrays:
products.forEach((product, index) => {
  console.log(`forEach ${index} →`, product.textContent);
});

// Y es ITERABLE (tiene Symbol.iterator, módulo «Iteradores, generadores y metaprogramación»):
// todo lo que consume iterables la acepta.
console.log('typeof products[Symbol.iterator] →', typeof products[Symbol.iterator]);
const names = [];
for (const product of products) names.push(product.textContent);
const [first, ...others] = products;
console.log('desestructurando →', first.textContent, '+', others.length, 'más');

// Si no encaja nada, la lista está VACÍA (length 0), no es null:
const offers = document.querySelectorAll('.offer');
console.log('.offer → length', offers.length);
for (const offer of offers) console.log('esto no se ejecuta nunca:', offer);

const soldOut = document.querySelectorAll('#products .sold-out').length;
document.querySelector('#summary').textContent = `${products.length} cafés (${soldOut} agotado): ${names.join(', ')}`;
```
