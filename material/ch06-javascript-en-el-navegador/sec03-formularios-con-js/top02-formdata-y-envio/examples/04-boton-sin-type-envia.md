---
example_description: "Un <button> sin type dentro de un formulario es de envío: «+» suma uno y además envía el formulario, y Enter en el campo «pulsa» el primer botón de envío, que es «−». Con type=\"button\" solo hacen lo suyo"
example_tags: "javascript|formularios|button|type|submit|submitter|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Tu carrito · Café de Chiapas 500 g</h1>
  <div class="carts">
    <form id="cart-buggy" class="cart" action="/carrito" method="post">
      <h2>🐛 Botones sin type</h2>
      <button data-step="-1" aria-label="Quitar una">−</button>
      <input name="quantity" type="number" min="1" max="10" value="2" aria-label="Cantidad">
      <button data-step="1" aria-label="Añadir una">+</button>
    </form>
    <form id="cart-fixed" class="cart" action="/carrito" method="post">
      <h2>✅ type="button"</h2>
      <button type="button" data-step="-1" aria-label="Quitar una">−</button>
      <input name="quantity" type="number" min="1" max="10" value="2" aria-label="Cantidad">
      <button type="button" data-step="1" aria-label="Añadir una">+</button>
      <button type="submit">Actualizar</button>
    </form>
  </div>
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
h2 {
  flex-basis: 100%;
  font-size: 0.95rem;
  margin: 0;
}
.carts {
  display: grid;
  gap: 0.75rem;
}
.cart {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
input,
button {
  font: inherit;
  color: #1f2933;
  padding: 0.3rem 0.6rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
}
input {
  width: 4rem;
}
button {
  cursor: pointer;
}
:focus-visible {
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
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

for (const form of document.querySelectorAll('.cart')) {
  const mark = form.id === 'cart-buggy' ? '🐛' : '✅';
  const quantity = form.elements.quantity;

  form.addEventListener('click', (event) => {
    const button = event.target.closest('[data-step]');
    if (!button) return;
    quantity.value = quantity.valueAsNumber + Number(button.dataset.step);
    logLine(`${mark} ${button.textContent} → cantidad ${quantity.value}`);
  });

  // Este listener NO cancela el envío: así ves cuándo ocurre. LearnWeb bloquea la
  // navegación y escribe en la consola lo que se habría enviado; una página real
  // se recargaría y el carrito volvería a empezar.
  form.addEventListener('submit', (event) => {
    logLine(`${mark} 📨 submit · lo disparó «${event.submitter.textContent}»`);
  });
}
logLine('Listo: pulsa «+» en los dos carritos; luego escribe en cada cantidad y pulsa Enter');

// 🐛 Un <button> dentro de un form sin type es type="submit": su acción por defecto
//    es enviar. Y Enter en un campo «pulsa» el PRIMER botón de envío del formulario.
```
