---
example_description: "Un onclick en el HTML no encuentra las funciones de un módulo: el atributo se ejecuta en el ámbito global y las funciones del módulo no son globales; se conecta el botón desde el propio módulo"
example_tags: "javascript|modulos|ambito|onclick|eventos|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<p>Café de Chiapas 500 g · $210.00</p>
<!-- 🐛 onclick busca addToCart en el ámbito GLOBAL -->
<button type="button" id="buy-inline" onclick="addToCart('Café de Chiapas')">Añadir (onclick)</button>
<!-- ✅ este se conecta desde el módulo -->
<button type="button" id="buy">Añadir</button>
<p id="status" role="status">Carrito vacío</p>
```

# JavaScript

```javascript
// Archivo que usa: assets/01-precios/money.js (el del ejemplo 01).
// querySelector, textContent, click() y addEventListener son del capítulo 6:
// aquí solo buscan los botones, cambian un texto y simulan dos pulsaciones.
import { formatPrice } from './01-precios/money.js';

let count = 0;
function addToCart(name) {
  count += 1;
  document.querySelector('#status').textContent = `${count} × ${name} · ${formatPrice(count * 21000)}`;
}

console.log('typeof addToCart, dentro del módulo →', typeof addToCart);
console.log('typeof window.addToCart →', typeof window.addToCart);

// 🐛 Pulsar el primer botón: su onclick no encuentra addToCart.
//    → Uncaught ReferenceError: addToCart is not defined
document.querySelector('#buy-inline').click();

// ✅ El módulo conecta el segundo botón con SU función (capítulo 6).
document.querySelector('#buy').addEventListener('click', () => addToCart('Café de Chiapas'));
document.querySelector('#buy').click();
console.log('✅ estado →', document.querySelector('#status').textContent);

// Pulsa tú los dos botones: el primero añade otro error a la consola.
// Hay otra «solución»: window.addToCart = addToCart; pero vuelve a llenar
// window de nombres sueltos, justo lo que los módulos evitan. Mejor conectar
// los eventos desde el módulo.
```
