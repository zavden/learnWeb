---
example_description: "addEventListener('click', addToCart('Café')) ejecuta la función AL CARGAR y registra lo que devuelve (undefined), que el navegador ignora sin error: el botón no hace nada. Para pasar argumentos, una flecha que la llame"
example_tags: "javascript|eventos|addeventlistener|callback|parentesis|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Despensa mexicana</h1>
  <p class="actions">
    <button id="add-coffee" type="button">Añadir café (🐛)</button>
    <button id="add-mole" type="button">Añadir mole (✅)</button>
  </p>
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
.actions {
  display: flex;
  gap: 0.5rem;
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
const logList = document.querySelector('#log');
let items = 0;
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

function addToCart(product) {
  items += 1;
  document.querySelector('#cart-count').textContent = items;
  logLine(`🛒 añadido: ${product} (total: ${items})`);
  // no tiene return → devuelve undefined
}

logLine('Registrando los listeners…');

// 🐛 Con paréntesis, addToCart se EJECUTA ahora mismo (sin ningún clic) y a
//    addEventListener le llega lo que devuelve: undefined. El navegador ignora
//    un listener null o undefined en silencio: ni error ni aviso.
document.querySelector('#add-coffee').addEventListener('click', addToCart('Café de Chiapas'));

// ✅ Para pasar un argumento, registra una función que haga la llamada.
document.querySelector('#add-mole').addEventListener('click', () => addToCart('Mole poblano'));

logLine('Listo: ya hay 1 en el carrito sin haber pulsado nada. Pulsa los dos botones');

// Es el error de la lección «Formas de función» (llamar en vez de pasar),
// con un agravante: aquí el síntoma no es un TypeError, sino un botón muerto.
```
