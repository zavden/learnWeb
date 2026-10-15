---
example_description: "Crear promesas con new Promise((resolve, reject) => …): el ayudante wait(ms) (el asyncio.sleep de JavaScript), promisificar una API de callbacks «error primero», y un throw dentro del ejecutor que se convierte en rechazo"
example_tags: "javascript|python|promesas|new-promise|promisificar|wait"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// new Promise(ejecutor): el ejecutor recibe dos funciones, resolve y reject.
// Arranca la operación y, cuando termine, llama a UNA de las dos.

// 1. wait(ms): una promesa que se cumple pasados ms milisegundos.
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 2. Promisificar: envolver una API de callbacks «error primero» (como la de
//    la lección anterior) para que devuelva promesas.
const orders = new Map([['P-501', { id: 'P-501', customer: 'Sofía Ríos' }]]);
function getOrderWithCallback(id, callback) {
  setTimeout(() => {
    if (orders.has(id)) callback(null, orders.get(id));
    else callback(new Error(`Pedido ${id} no encontrado`));
  }, 40);
}

function promisify(fn) {
  return (...args) => new Promise((resolve, reject) => {
    fn(...args, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}
const getOrder = promisify(getOrderWithCallback);

// 3. Un throw dentro del ejecutor también rechaza la promesa.
function parseOrder(text) {
  return new Promise((resolve) => {
    resolve(JSON.parse(text)); // si JSON.parse lanza, la promesa se rechaza
  });
}

const start = performance.now();
wait(100)
  .then(() => console.log('wait(100) → esperó ≥ 100 ms:', performance.now() - start >= 100))
  .then(() => getOrder('P-501'))
  .then((order) => console.log('getOrder promisificada →', order.customer))
  .then(() => getOrder('P-999'))
  .catch((error) => console.log('rechazo →', error.message))
  .then(() => parseOrder('{"orderId": "P-731", "total":'))
  .catch((error) => console.log('throw en el ejecutor → rechazo:', error.name));

// Solo necesitas new Promise para ENVOLVER algo que no habla en promesas
// (temporizadores, callbacks, eventos). Si ya tienes una promesa, encadénala:
// envolverla otra vez es un error clásico (ejemplo siguiente).
// > Desde Python: wait(ms) es asyncio.sleep(segundos); new Promise con
//   resolve/reject se parece a loop.create_future() con set_result y
//   set_exception, pero aquí el ejecutor arranca el trabajo en el acto.
```
