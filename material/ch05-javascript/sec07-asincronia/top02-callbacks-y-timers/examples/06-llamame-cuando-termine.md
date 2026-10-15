---
example_description: "Un callback asíncrono es un «llámame cuando termines»: la función vuelve enseguida (su return no sirve para el resultado) y el resultado llega después, por el callback; la convención (error, resultado) separa el éxito del fallo"
example_tags: "javascript|python|callbacks|asincronia|error-first"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Una «base de datos» de pedidos detrás de una red simulada: tarda 60 ms.
const orders = new Map([
  ['P-501', { id: 'P-501', customer: 'Sofía Ríos', totalCents: 89000 }],
  ['P-502', { id: 'P-502', customer: 'Iván Mena', totalCents: 15500 }],
]);

// 🤔 Primer intento: devolver el pedido con return… desde DENTRO del callback.
function getOrderWrong(id) {
  setTimeout(() => {
    return orders.get(id); // este return es del callback, no de getOrderWrong
  }, 60);
  // getOrderWrong ya terminó aquí, sin return: devuelve undefined
}
console.log('🤔 getOrderWrong("P-501") →', getOrderWrong('P-501'));

// ✅ Estilo callback: el resultado no se DEVUELVE, se ENTREGA más tarde,
//    llamando al callback que te pasaron. Convención «error primero»
//    (la de Node.js): callback(error) o callback(null, resultado).
function getOrder(id, callback) {
  setTimeout(() => {
    const order = orders.get(id);
    if (!order) callback(new Error(`Pedido ${id} no encontrado`));
    else callback(null, order);
  }, 60);
}

getOrder('P-501', (error, order) => {
  if (error) {
    console.log('⛔', error.message);
    return;
  }
  console.log(`📦 ${order.id}: ${order.customer}, $${order.totalCents / 100}`);
});

getOrder('P-999', (error, order) => {
  if (error) {
    console.log('⛔', error.message);
    return;
  }
  console.log('📦', order.id);
});

console.log('fin del script: los dos pedidos están «en camino»');

// Es el «llámame cuando pase algo» de la lección «Formas de función»: quien
// recibe el callback decide CUÁNDO llamarlo (aquí, al vencer un temporizador;
// en el capítulo 6, al llegar un clic o una respuesta del servidor).
// > Desde Python: como pasar un callback a loop.call_later o
//   future.add_done_callback. En Python moderno casi no se ve, porque async/
//   await llegó antes; en JavaScript verás mucho código antiguo así.
```
