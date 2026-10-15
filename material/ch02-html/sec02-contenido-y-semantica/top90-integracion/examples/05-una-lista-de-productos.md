---
example_description: "Tarjetas de producto bien hechas: lista de artículos, enlace en el título, botón con nombre único, precio tachado que se entiende sin verlo y mensaje en una región viva"
example_tags: "integracion|listas|article|enlaces|botones|aria|role-status"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<h1>Cafeteras y molinillos</h1>

<!-- Un listado de productos es una lista (el orden da igual: ul) de artículos autónomos -->
<ul class="products">
  <li>
    <article>
      <!-- La foto no está dentro del enlace y el título ya nombra el producto:
           el alt cuenta lo que añade la foto (su aspecto), sin repetir el nombre -->
      <img src="img/moka-pot.svg" alt="De aluminio, con asa y pomo negros" width="320" height="240">
      <!-- El enlace va en el título, no envolviendo la tarjeta: un enlace no puede contener un botón -->
      <h2><a href="https://cafetalia.example/cafetera-italiana-6-tazas/">Cafetera italiana, 6 tazas</a></h2>
      <!-- s: un precio que ya no vale. El tachado no se anuncia: el texto oculto lo explica -->
      <p class="price">
        <s><span class="visually-hidden">Precio anterior:</span> 34,90&nbsp;€</s>
        <strong><span class="visually-hidden">Precio actual:</span> 27,90&nbsp;€</strong>
      </p>
      <!-- Tres botones «Añadir al carrito» serían indistinguibles en la lista de botones:
           el texto oculto completa el nombre con el producto -->
      <button type="button" onclick="addToCart(this)">Añadir al carrito<span class="visually-hidden">: Cafetera italiana, 6 tazas</span></button>
    </article>
  </li>
  <li>
    <article>
      <img src="img/french-press.svg" alt="De vidrio, con émbolo y tapa de acero" width="320" height="240">
      <h2><a href="https://cafetalia.example/cafetera-embolo-1-litro/">Cafetera de émbolo, 1 litro</a></h2>
      <p class="price"><strong>22,50&nbsp;€</strong></p>
      <button type="button" onclick="addToCart(this)">Añadir al carrito<span class="visually-hidden">: Cafetera de émbolo, 1 litro</span></button>
    </article>
  </li>
  <li>
    <article>
      <img src="img/coffee-grinder.svg" alt="Caja de madera con cajón para el café molido y manivela de hierro" width="320" height="240">
      <h2><a href="https://cafetalia.example/molinillo-manual/">Molinillo manual de madera</a></h2>
      <p class="price"><strong>39,00&nbsp;€</strong> <small>Agotado temporalmente</small></p>
      <!-- disabled es booleano: basta con escribirlo -->
      <button type="button" disabled>Añadir al carrito<span class="visually-hidden">: Molinillo manual de madera</span></button>
    </article>
  </li>
</ul>

<!-- Región viva: existe desde el principio, vacía, y el lector anuncia cada cambio de su texto -->
<p id="cart-status" role="status"></p>
```

# CSS

```css
/* Solo para que se lea bien: el CSS se estudia en el capítulo 3 */
body {
  font-family: system-ui, sans-serif;
  color: #1f2937;
}

/* grid coloca las tarjetas en columnas que caben en el ancho (capítulo de CSS).
   Ojo: sin viñetas, Safari deja de anunciar la lista (lección de listas); se resuelve en CSS */
.products {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
  gap: 1rem;
  padding: 0;
  list-style: none;
}

article {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
}

img {
  display: block;
  max-width: 100%;
  height: auto;
}

h2 {
  font-size: 1.05rem;
}

.price s {
  color: #4b5563;
}

.price strong {
  color: #b91c1c;
  font-size: 1.2rem;
}

button {
  font: inherit;
  padding: 0.4rem 0.8rem;
}

/* Invisible en pantalla, presente en el árbol de accesibilidad (lección de accesibilidad) */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

#cart-status {
  min-height: 1.5em;
  font-weight: 600;
  color: #15803d;
}

:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo (onclick llama a esta función al pulsar).
let cartCount = 0;

function addToCart(button) {
  cartCount += 1;
  const product = button.closest('article').querySelector('h2').textContent;
  document.getElementById('cart-status').textContent = `Añadido: ${product}. Productos en el carrito: ${cartCount}.`;
  console.log('🛒', document.getElementById('cart-status').textContent);
}

// Las listas de enlaces y de botones que ofrece un lector de pantalla: cada nombre se entiende solo
console.group('Enlaces');
for (const link of document.querySelectorAll('.products a')) console.log('🔗', link.textContent);
console.groupEnd();

console.group('Botones');
for (const button of document.querySelectorAll('.products button')) {
  console.log('🔘', button.textContent + (button.disabled ? ' (desactivado)' : ''));
}
console.groupEnd();
```
