---
example_description: "La propiedad onclick guarda UN solo manejador: asignarla sustituye al anterior (también al atributo onclick del HTML), mientras que addEventListener acumula listeners independientes"
example_tags: "javascript|eventos|onclick|addeventlistener|atributos|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Pedido P-2077 · $640.00</h1>
  <!-- El atributo onclick ejecuta su texto como código en el ámbito global. -->
  <button id="checkout" type="button" onclick="logLine('1. atributo onclick del HTML')">Pagar</button>
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
const checkout = document.querySelector('#checkout');
const logList = document.querySelector('#log');
// Declaración de función en un script clásico → global: el atributo la encuentra.
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// El atributo crea la propiedad onclick del elemento: una función.
console.log('typeof checkout.onclick →', typeof checkout.onclick);

// 🐛 La propiedad onclick tiene sitio para UNA función: cada asignación
//    sustituye a la anterior, sin avisar. La analítica desaparece.
checkout.onclick = () => logLine('2. onclick = analítica');
checkout.onclick = () => logLine('3. onclick = pago');

// ✅ addEventListener acumula: cada parte del código añade el suyo y ninguno
//    pisa a otro. Se ejecutan en el orden en que se registraron.
checkout.addEventListener('click', () => logLine('✅ addEventListener: analítica'));
checkout.addEventListener('click', () => logLine('✅ addEventListener: pago'));

console.log('el atributo sigue en el HTML →', checkout.getAttribute('onclick'));
logLine('Listo: pulsa «Pagar»');

// Para quitar el manejador de onclick: checkout.onclick = null.
// Además del pisotón, el texto del atributo se ejecuta en el ámbito global:
// no ve las funciones de un módulo (lección «Módulos ES», ejemplo 05).
```
