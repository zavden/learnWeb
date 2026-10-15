---
example_description: "Olvidar let dentro de una función no crea una local: reasigna la variable de fuera con ese nombre (y el modo estricto no lo detecta)"
example_tags: "javascript|python|ambito|let|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
const orders = [
  { id: 'A-1', lines: [{ cents: 1200, qty: 2 }, { cents: 450, qty: 1 }] }, // 2850
  { id: 'A-2', lines: [{ cents: 3000, qty: 1 }] },                          // 3000
];

let total = 0; // total del DÍA (todos los pedidos)

function orderTotal(order) {
  total = 0; // 🐛 quería una variable local… pero falta let: reinicia la de fuera
  for (const line of order.lines) {
    total += line.cents * line.qty;
  }
  return total;
}

for (const order of orders) {
  const amount = orderTotal(order);
  total += amount;
  console.log(`  ${order.id}: ${amount} → total del día ${total}`);
}
console.log('🐛 total del día →', total, '(esperado: 5850)'); // 6000

// Qué ha pasado: cada llamada a orderTotal pone a 0 el total del DÍA y lo usa
// como acumulador; al volver, el bucle le suma el importe otra vez.
// 'use strict' NO lo detecta: total existe, así que la asignación es legal.
// (El modo estricto solo protege de asignar a nombres que no existen.)

// ✅ Declara SIEMPRE las variables de trabajo dentro de la función, con su propio nombre.
function orderTotalFixed(order) {
  let sum = 0;
  for (const line of order.lines) {
    sum += line.cents * line.qty;
  }
  return sum;
}
let dayTotal = 0;
for (const order of orders) {
  dayTotal += orderTotalFixed(order);
}
console.log('✅ total del día →', dayTotal); // 5850

// ✅ Aún mejor: sin variables compartidas.
const dayTotalWithReduce = orders.reduce((acc, order) => acc + orderTotalFixed(order), 0);
console.log('✅ con reduce →', dayTotalWithReduce); // 5850
```
