---
example_description: "Los invoker commands (commandfor + command) disparan un evento command en el diálogo antes de actuar: event.command y event.source dicen qué y quién, preventDefault() cancela la acción integrada (no abrir con el carrito vacío) y los comandos propios (--clear-cart) los atiende tu listener. En Chrome 135+"
example_tags: "javascript|eventos|command|commandfor|dialog|preventdefault"
example_stage: minimal
example_importance: useful
console: true
---

# HTML

```html
<main>
  <h1>Tostaduría La Ceiba</h1>
  <p class="actions">
    <button id="add" type="button">Añadir café de Chiapas</button>
    <button id="open-cart" type="button" commandfor="cart-dialog" command="show-modal">🛒 Ver carrito (<output id="count">0</output>)</button>
  </p>
  <dialog id="cart-dialog" aria-labelledby="cart-title">
    <h2 id="cart-title">Tu carrito</h2>
    <p id="cart-summary"></p>
    <button id="clear-cart" type="button" commandfor="cart-dialog" command="--clear-cart">Vaciar</button>
    <button id="close-cart" type="button" commandfor="cart-dialog" command="close">Cerrar</button>
  </dialog>
  <p id="message" role="status"></p>
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
  font-size: 1.05rem;
  margin-top: 0;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
dialog {
  border: 1px solid #7b8794;
  border-radius: 0.75rem;
}
dialog::backdrop {
  background: rgb(31 41 51 / 0.5);
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
const cartDialog = document.querySelector('#cart-dialog');
const message = document.querySelector('#message');
const logList = document.querySelector('#log');
let items = 0;
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
function updateCart() {
  document.querySelector('#count').textContent = items;
  document.querySelector('#cart-summary').textContent = `${items} × Café de Chiapas 500 g · $${(items * 210).toFixed(2)}`;
}

document.querySelector('#add').addEventListener('click', () => {
  items += 1;
  updateCart();
  message.textContent = '';
});

// Un botón con commandfor + command dispara un evento «command» en el
// elemento objetivo ANTES de hacer nada. Es cancelable.
cartDialog.addEventListener('command', (event) => {
  logLine(`command → ${event.command} · source: #${event.source.id}`);
  if (event.command === 'show-modal' && items === 0) {
    event.preventDefault(); // cancela la acción integrada: no se abre
    message.textContent = 'Tu carrito está vacío.';
    logLine('⛔ carrito vacío → preventDefault(): el diálogo no se abre');
  }
  // Los comandos propios empiezan por «--»: no tienen acción integrada,
  // solo existen para tu listener.
  if (event.command === '--clear-cart') {
    items = 0;
    updateCart();
    cartDialog.close();
    logLine('🧹 carrito vaciado');
  }
});
updateCart();
logLine(`¿el navegador conoce command? → ${'command' in HTMLButtonElement.prototype}`);
logLine('Listo: pulsa «Ver carrito»; luego «Añadir…», «Ver carrito» y «Vaciar»');

// Los invoker commands funcionan en Chrome desde la versión 135. En un
// navegador que no los conozca, los botones no hacen nada: comprueba el
// soporte (la línea de arriba) y, si hace falta, usa showModal() en un click.
```
