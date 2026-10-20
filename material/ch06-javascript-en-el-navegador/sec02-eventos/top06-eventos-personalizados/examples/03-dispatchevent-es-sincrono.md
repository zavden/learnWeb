---
example_description: "dispatchEvent es SÍNCRONO: ejecuta todos los listeners antes de devolver, como una llamada a función; si el estado se actualiza después del dispatch, los listeners ven el estado viejo"
example_tags: "javascript|eventos|dispatchevent|sincrono|orden|estado|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Un pedido y quien lo vigila. Los eventos se pueden despachar en cualquier
// EventTarget; aquí, en un objeto creado con new EventTarget().
const order = { id: 'P-2077', status: 'borrador' };
const orders = new EventTarget();
orders.addEventListener('order:paid', (event) => {
  console.log(`   2. listener: el pedido ${event.detail.id} está → ${event.detail.status}`);
});

// 🐛 Avisar ANTES de cambiar el estado: dispatchEvent ejecuta los listeners
//    en ese mismo momento, así que ven el pedido todavía en «borrador».
function payBuggy() {
  console.log('🐛 1. antes de dispatchEvent');
  const result = orders.dispatchEvent(new CustomEvent('order:paid', { detail: order }));
  order.status = 'pagado';
  console.log(`🐛 3. después de dispatchEvent (devolvió ${result}) · ahora → ${order.status}`);
}
payBuggy();

// ✅ Cambia el estado y DESPUÉS avisa: el aviso describe algo que ya pasó.
order.status = 'borrador';
function payFixed() {
  order.status = 'pagado';
  console.log('✅ 1. estado actualizado; aviso');
  orders.dispatchEvent(new CustomEvent('order:paid', { detail: order }));
  console.log('✅ 3. fin de payFixed');
}
payFixed();

// dispatchEvent no encola nada: recorre el camino y llama a cada listener
// AHORA, igual que emit() en el EventEmitter del módulo «Clases y POO».
// Los eventos del usuario (un clic de verdad) sí son tareas del event loop;
// los que despacha tu código, no.
```
