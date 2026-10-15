---
example_description: "getElementById busca por id (sin #); querySelector acepta cualquier selector CSS y devuelve el primer elemento que encaja, o null; llamado sobre un elemento, solo busca dentro de él. Un selector mal escrito lanza un error"
example_tags: "javascript|dom|queryselector|getelementbyid|selectores"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main id="shop">
  <h1>Tostadores del Sur</h1>
  <p>Carrito: <span id="cart-count">0</span> productos</p>
  <ul class="products">
    <li class="product" data-category="coffee">
      <h2>Café de Chiapas</h2>
      <p class="price">$210.00</p>
    </li>
    <li class="product" data-category="coffee">
      <h2>Café de Veracruz</h2>
      <p class="price">$185.00</p>
    </li>
    <li class="product" data-category="tools">
      <h2>Molinillo manual</h2>
      <p class="price">$549.00</p>
    </li>
  </ul>
</main>
```

# JavaScript

```javascript
// getElementById: el id a secas, SIN almohadilla.
const cartCount = document.getElementById('cart-count');
console.log('getElementById →', cartCount);

// querySelector: cualquier selector CSS (el mismo que escribirías en una regla).
console.log("'#cart-count' →", document.querySelector('#cart-count') === cartCount);
// Si encajan varios, devuelve el PRIMERO en el orden del documento:
console.log("'.price' →", document.querySelector('.price').textContent);
console.log("'[data-category=\"tools\"] h2' →", document.querySelector('[data-category="tools"] h2').textContent);
console.log("'.product:last-child .price' →", document.querySelector('.product:last-child .price').textContent);

// Si no encaja ninguno: null (no es un error… todavía; ejemplo 02).
console.log("'.sold-out' →", document.querySelector('.sold-out'));

// Llamado sobre un elemento, solo busca entre SUS descendientes:
const grinder = document.querySelector('[data-category="tools"]');
console.log('dentro del molinillo →', grinder.querySelector('.price').textContent);

// getElementById solo existe en document: un id es único en toda la página.
console.log('typeof grinder.getElementById →', typeof grinder.getElementById);

// Un selector que no es CSS válido no devuelve null: lanza un SyntaxError.
// (Un id que empieza por número necesita escaparse: '#\\32 026' o getElementById.)
try {
  document.querySelector('#2026');
} catch (error) {
  console.log('⛔', error.name, '|', error.message);
}
```
