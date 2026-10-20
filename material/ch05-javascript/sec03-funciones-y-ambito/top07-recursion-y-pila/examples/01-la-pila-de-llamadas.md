---
example_description: "La pila de llamadas: cada llamada se apila encima de la que la hizo y se desapila al volver; console.trace muestra la pila real"
example_tags: "javascript|python|pila-de-llamadas|call-stack|funciones"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// El motor guarda en una PILA (call stack) qué función se está ejecutando y a dónde
// volver cuando termine. Para verlo, llevamos nuestro propio registro:
const stack = [];
function enter(name) {
  stack.push(name);
  console.log(`${'  '.repeat(stack.length - 1)}▶ entra ${name}   pila: [${stack.join(' → ')}]`);
}
function leave(name, result) {
  console.log(`${'  '.repeat(stack.length - 1)}◀ sale ${name} con ${result}`);
  stack.pop();
}

function checkout(cart) {
  enter('checkout');
  const total = calculateTotal(cart);
  leave('checkout', total);
  return total;
}
function calculateTotal(cart) {
  enter('calculateTotal');
  const subtotal = cart.reduce((sum, cents) => sum + cents, 0);
  const total = addTax(subtotal);
  leave('calculateTotal', total);
  return total;
}
function addTax(cents) {
  enter('addTax');
  // console.trace imprime la pila REAL que guarda el motor en este momento.
  console.trace('pila dentro de addTax');
  const total = Math.round(cents * 1.21);
  leave('addTax', total);
  return total;
}

checkout([1000, 2500]);
console.log('pila al terminar →', stack); // []: todas las llamadas han vuelto

// Cada llamada ocupa un «marco» (frame) en la pila con sus parámetros, sus
// variables locales y el punto al que debe volver. La función que está arriba
// es la que se ejecuta; las de abajo esperan su resultado.
// Es la misma pila que ves en el traceback de un error (lección «Errores y excepciones»).
```
