---
example_description: "addEventListener('click', función): el navegador guarda la función y la llama en cada clic (también con Tab + Enter); el script termina antes de que llegue ningún evento"
example_tags: "javascript|eventos|addeventlistener|click|listener"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Café de Chiapas · 500 g</h1>
  <p>$210.00 MXN</p>
  <button id="add-to-cart" type="button">Añadir al carrito</button>
  <p>En el carrito: <output id="cart-count">0</output></p>
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
button {
  font: inherit;
  padding: 0.4rem 0.8rem;
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
// Un evento es un aviso del navegador: «ha pasado algo» (un clic, una tecla, la
// página terminó de cargar…). addEventListener(tipo, función) apunta la función
// para que el navegador la llame CADA VEZ que ocurra ese evento en ese elemento.
const addButton = document.querySelector('#add-to-cart');
const cartCount = document.querySelector('#cart-count');
const logList = document.querySelector('#log');
let items = 0;

// Escribe en la consola y en la lista de la página.
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

function addToCart() {
  items += 1;
  cartCount.textContent = items;
  logLine(`🛒 clic → ${items} en el carrito`);
}

addButton.addEventListener('click', addToCart); // ← la función, SIN paréntesis
logLine('Listo: pulsa «Añadir al carrito» (con el ratón, o con Tab y Enter)');

// El script termina aquí y addToCart todavía no se ha ejecutado: el navegador
// la guarda y la llama cuando llega el clic, como una tarea más del event loop
// (módulo «Asincronía y event loop»).
```
