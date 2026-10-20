---
example_description: "El evento formdata llega cada vez que se construye la lista de datos del formulario (en el envío normal y en new FormData(form)): event.formData permite añadir datos que no están en ningún control, como el carrito que vive en JavaScript"
example_tags: "javascript|formularios|formdata|evento-formdata|submit"
example_stage: minimal
example_importance: useful
console: true
---

# HTML

```html
<main>
  <h1>Finalizar la compra</h1>
  <ul id="cart-lines" class="lines"></ul>
  <form id="checkout" action="/pedidos" method="post">
    <p><label>Dirección <input name="address" value="Calle Morelos 12, Oaxaca" autocomplete="street-address"></label></p>
    <button type="submit">Pagar</button>
  </form>
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
.lines {
  margin: 0 0 0.75rem;
  padding-left: 1.2rem;
}
form {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
form p {
  margin: 0;
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
  overflow-wrap: anywhere;
}
```

# JavaScript

```javascript
const form = document.querySelector('#checkout');
const logList = document.querySelector('#log');
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// El carrito vive en JavaScript, no en controles del formulario.
const cart = [
  { sku: 'CAF-500', name: 'Café de Chiapas 500 g', price: 210, qty: 2 },
  { sku: 'CAC-250', name: 'Cacao de Tabasco 250 g', price: 145, qty: 1 },
];
const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
for (const item of cart) {
  const line = document.createElement('li');
  line.textContent = `${item.qty} × ${item.name} · ${money.format(item.price * item.qty)}`;
  document.querySelector('#cart-lines').append(line);
}

// formdata llega cada vez que alguien construye los datos del formulario: el envío
// normal (también con Enter) y cualquier new FormData(form). Aquí se añade el carrito.
form.addEventListener('formdata', (event) => {
  event.formData.set('cart', JSON.stringify(cart.map((item) => ({ sku: item.sku, qty: item.qty }))));
  event.formData.set('total', total.toFixed(2));
  logLine('formdata → añadidos cart y total');
});

logLine(`new FormData(form).get('total') → ${new FormData(form).get('total')}`);
logLine('Listo: pulsa «Pagar» (o Enter en la dirección); el envío no se cancela');
// Sin preventDefault, LearnWeb bloquea la navegación y escribe en la consola lo
// que se habría enviado: incluye cart y total, que no están en ningún control.
```
