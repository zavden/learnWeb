---
example_description: "Un break en for…of llama a return() del generador: el código de limpieza escrito después del bucle no se ejecuta, pero el de un finally sí; y, a diferencia de Python, el generador queda cerrado y no se puede continuar"
example_tags: "javascript|python|generadores|finally|break|limpieza|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
const orders = [
  { id: 'P-101', total: 320 },
  { id: 'P-102', total: 780 },
  { id: 'P-103', total: 150 },
  { id: 'P-104', total: 960 },
];

// 🐛 La conexión se cierra DESPUÉS del bucle… solo si se llega a ese punto.
function* queryOrders() {
  console.log('  🔌 abro la conexión');
  for (const order of orders) yield order;
  console.log('  🔌 cierro la conexión');
}

console.log('▶ 🐛 break con el cierre después del bucle');
for (const order of queryOrders()) {
  if (order.total > 500) break; // buscamos el primer pedido grande
}
console.log('  (la conexión quedó abierta: «cierro» no apareció)');

// ✅ break → for…of llama a return() → el generador termina en el yield donde
//    estaba pausado, ejecutando los finally que lo rodeen.
function* safeQueryOrders() {
  console.log('  🔌 abro la conexión');
  try {
    for (const order of orders) yield order;
  } finally {
    console.log('  🔌 cierro la conexión');
  }
}

console.log('▶ ✅ break con finally');
for (const order of safeQueryOrders()) {
  if (order.total > 500) break;
}
console.log('▶ ✅ desestructuración parcial con finally');
const [first] = safeQueryOrders();
console.log('  primero →', first.id);

// 🐛 La otra cara: tras el break, el generador está CERRADO para siempre.
console.log('▶ 🐛 seguir donde lo dejé');
const pending = safeQueryOrders();
for (const order of pending) {
  console.log('  atiendo →', order.id);
  break;
}
console.log('  el resto →', [...pending]);

// Los iteradores de arrays no tienen return(): esos sí se pueden continuar.
const queue = orders.values();
for (const order of queue) break;
console.log('▶ iterador de array tras break →', [...queue].map((order) => order.id));

// ✅ Para atender por tandas, pide los valores con next() en vez de for…of.
console.log('▶ ✅ por tandas');
const batches = safeQueryOrders();
console.log('  primera tanda →', batches.next().value.id, batches.next().value.id);
console.log('  …más tarde →', batches.next().value.id);
batches.return(); // cuando ya no lo necesitas, ciérralo tú (ejecuta el finally)

// > Desde Python: el for de Python NO cierra el generador al salir con break:
//   puedes seguir con otro for donde lo dejaste, y el finally se ejecuta al
//   agotarlo, con gen.close() o cuando el recolector de basura lo destruye.
//   JavaScript lo cierra en el acto, siempre: limpieza segura, pero sin pausa.
```
