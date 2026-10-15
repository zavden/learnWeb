---
example_description: "Lo que el clonado estructurado no copia: una función, un Symbol o un elemento del DOM hacen que postMessage lance DataCloneError (y no se envía nada); una instancia de clase llega como objeto plano, sin prototipo, métodos, getters ni campos privados. La solución: enviar datos planos y reconstruir la instancia con una clase que ambos lados importan"
example_tags: "javascript|workers|postmessage|datacloneerror|clases|prototipos|modulos|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Usa 06-orders/order.js (la clase) y 06-orders/order-worker.js («Assets»).
import { Order } from './06-orders/order.js';

const worker = new Worker('06-orders/order-worker.js', { type: 'module' });

// postMessage clona ANTES de enviar: si algo no se puede clonar, lanza aquí mismo
// y no se envía nada.
function trySend(label, message) {
  try {
    worker.postMessage(message);
    console.log(`${label} → enviado`);
  } catch (error) {
    console.log(`🐛 ${label} → ${error.name}: ${error.message}`);
  }
}
trySend('una función', { code: 'P-3184', onPaid: () => {} });
trySend('un symbol', { code: 'P-3184', priority: Symbol('urgente') });
trySend('un elemento del DOM', { code: 'P-3184', row: document.createElement('div') });

const order = new Order('P-3184', [
  { product: 'Mezcal artesanal', price: 690, qty: 1 },
  { product: 'Sal de gusano', price: 85, qty: 2 },
]);
order.pay();
console.log('en la página → total:', order.total, '· pagado:', order.paid);

// Las respuestas de un mismo worker llegan en orden: primero la de 'instance'.
let replies = 0;
worker.onmessage = (event) => {
  console.log(event.data);
  if (++replies === 2) worker.terminate();
};
worker.postMessage({ kind: 'instance', order });        // 🐛 viaja, pero «aplanada»
worker.postMessage({ kind: 'data', order: order.toData() }); // ✅ datos y reconstrucción

// Python: pickle sí guarda la clase de un objeto (por su nombre, y el otro proceso
// la importa). El clonado estructurado no: solo copia datos.
```
