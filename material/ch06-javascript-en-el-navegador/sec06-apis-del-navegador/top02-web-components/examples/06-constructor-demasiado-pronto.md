---
example_description: "Leer atributos en el constructor funciona con las etiquetas del HTML (al mejorarlas ya los tienen) pero falla con createElement, que ejecuta el constructor antes de cualquier setAttribute: el precio sale $0.00; y añadir hijos en el constructor hace que createElement lance NotSupportedError. Se lee en connectedCallback y attributeChangedCallback"
example_tags: "javascript|web-components|constructor|createelement|atributos|upgrade|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Carta de bebidas</h1>
  <ul id="menu" class="menu">
    <li>Café de olla <buggy-price amount="45"></buggy-price></li>
  </ul>
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
  margin: 0 0 0.5rem;
}
.menu {
  display: grid;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.menu li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  background: #ffffff;
}
buggy-price,
drink-price {
  font-weight: 700;
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
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const menu = document.querySelector('#menu');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
function addDrink(tagName, drink, amount) {
  const price = document.createElement(tagName); // ← aquí corre el constructor
  price.setAttribute('amount', amount);          // …y el atributo llega DESPUÉS
  const item = document.createElement('li');
  item.append(`${drink} `, price);
  menu.append(item);                             // ← aquí, connectedCallback
  return price;
}

// 🐛 Lee el atributo en el constructor.
class BuggyPrice extends HTMLElement {
  constructor() {
    super();
    this.amount = Number(this.getAttribute('amount')); // Number(null) → 0
  }
  connectedCallback() {
    this.textContent = money.format(this.amount);
  }
}
customElements.define('buggy-price', BuggyPrice);
logLine(`🐛 desde el HTML → ${document.querySelector('buggy-price').textContent} (al mejorarla, ya tenía amount)`);
logLine(`🐛 con createElement → ${addDrink('buggy-price', 'Chocolate de Oaxaca', '55').textContent} (el constructor leyó null)`);

// ✅ El constructor solo prepara; los atributos se leen cuando ya están.
class DrinkPrice extends HTMLElement {
  static observedAttributes = ['amount'];
  connectedCallback() {
    this.render();
  }
  attributeChangedCallback() {
    this.render();
  }
  render() {
    this.textContent = money.format(Number(this.getAttribute('amount')));
  }
}
customElements.define('drink-price', DrinkPrice);
logLine(`✅ con createElement → ${addDrink('drink-price', 'Atole de guayaba', '35').textContent}`);

// ⛔ Y en el constructor tampoco se añaden hijos ni atributos. createElement
//    lo comprueba: informa del error (como uno no atrapado, en el evento
//    error de window) y devuelve un elemento desconocido en su lugar.
class EagerPrice extends HTMLElement {
  constructor() {
    super();
    this.textContent = '$0.00';
  }
}
customElements.define('eager-price', EagerPrice);
window.addEventListener('error', (event) => {
  logLine(`⛔ error en window → ${event.error.name}: ${event.error.message}`);
});
const eager = document.createElement('eager-price');
logLine(`⛔ createElement('eager-price') devolvió → ${eager.constructor.name}`);
```
