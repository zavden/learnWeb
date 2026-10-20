---
example_description: "const total = total(items) lanza ReferenceError: la variable local tapa a la función desde el principio del bloque y aún está en la zona muerta temporal"
example_tags: "javascript|python|ambito|sombreado|tdz|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
function total(items) {
  return items.reduce((sum, item) => sum + item.cents, 0);
}

function printReceipt(items) {
  // 🐛 Esta línea declara una variable LOCAL llamada total. Su ámbito es TODO el
  // cuerpo de printReceipt, desde la llave que lo abre, así que la función total
  // de fuera queda tapada… y a la derecha del = la variable todavía no tiene
  // valor (zona muerta temporal, lección «Variables»).
  const total = total(items);
  return `Total: ${(total / 100).toFixed(2)} €`;
}

const cartItems = [{ cents: 1250 }, { cents: 380 }];
try {
  console.log(printReceipt(cartItems));
} catch (error) {
  console.log('🐛 printReceipt →', error.name, '|', error.message);
}

// Con var en lugar de const el error es otro, pero el origen es el mismo:
// la var local (que vale undefined) tapa a la función → «total is not a function».
function printReceiptVar(items) {
  var total = total(items);
  return total;
}
try {
  printReceiptVar(cartItems);
} catch (error) {
  console.log('🐛 con var →', error.name, '|', error.message);
}

// ✅ Nombres distintos: un VERBO para la función, un SUSTANTIVO para el dato.
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.cents, 0);
}
function printReceiptFixed(items) {
  const total = calculateTotal(items);
  return `Total: ${(total / 100).toFixed(2)} €`;
}
console.log('✅', printReceiptFixed(cartItems)); // 'Total: 16.30 €'

// > Desde Python: total = total(items) dentro de una función lanza
//   UnboundLocalError: cannot access local variable 'total'… por la misma razón.
```
