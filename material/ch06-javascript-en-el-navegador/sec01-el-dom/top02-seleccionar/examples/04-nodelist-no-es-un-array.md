---
example_description: "Una NodeList tiene forEach pero no map, filter ni reduce («prices.map is not a function»), y una HTMLCollection ni siquiera tiene forEach; [...lista] o Array.from(lista, fn) las convierten en arrays de verdad"
example_tags: "javascript|dom|nodelist|htmlcollection|array-from|spread|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<h2>Tu carrito</h2>
<ul id="cart">
  <li>Café de Chiapas · $<span class="price">210</span></li>
  <li>Café de Veracruz · $<span class="price">185</span></li>
  <li>Molinillo manual · $<span class="price">549</span></li>
</ul>
<p>Total: <strong id="total">—</strong></p>
```

# JavaScript

```javascript
const prices = document.querySelectorAll('#cart .price');

// 🐛 Parece un array, pero no lo es:
try {
  prices.map((price) => Number(price.textContent));
} catch (error) {
  console.log('⛔', error.name, '|', error.message);
}
console.log('Array.isArray(prices) →', Array.isArray(prices));
console.log('typeof prices.forEach →', typeof prices.forEach);
console.log('typeof prices.map →', typeof prices.map);

// ✅ Conviértela en array: con spread…
const amounts = [...prices].map((price) => Number(price.textContent));
console.log('✅ [...prices].map →', amounts);

// …o con Array.from, que acepta la función de mapeo como segundo argumento.
const total = Array.from(prices, (price) => Number(price.textContent))
  .reduce((sum, amount) => sum + amount, 0);
console.log('✅ Array.from + reduce →', total);
document.querySelector('#total').textContent = `$${total.toFixed(2)}`;

// 🐛 Una HTMLCollection (children, getElementsByClassName…) no tiene ni forEach:
const items = document.querySelector('#cart').children;
try {
  items.forEach((item) => console.log(item.textContent));
} catch (error) {
  console.log('⛔', error.name, '|', error.message);
}
// ✅ pero también es iterable: for…of y spread funcionan.
for (const item of items) console.log('for…of →', item.textContent);
```
