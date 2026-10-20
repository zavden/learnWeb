---
example_description: "Nuevo: Promise.withResolvers() (Chrome 119) da la promesa y sus resolve/reject por separado, para cumplirla desde otra parte del código; Promise.try(fn) (Chrome 128) ejecuta fn en el acto y convierte su resultado o su error síncrono en una promesa"
example_tags: "javascript|promesas|withresolvers|promise-try|nuevo"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// ⚠️ NUEVO: Promise.withResolvers llegó a Chrome en la versión 119 (2023) y
//    Promise.try en la 128 (2024).

// 1. Promise.withResolvers(): la promesa y sus dos funciones, por separado.
//    Útil cuando QUIEN cumple la promesa no es quien la crea: aquí, una
//    confirmación que se resuelve cuando el usuario pulsa un botón (simulado).
let pendingDialog = null;
function askConfirmation(question) {
  const { promise, resolve } = Promise.withResolvers();
  console.log(`❓ ${question} [Confirmar] [Cancelar]`);
  pendingDialog = { accept: () => resolve(true), cancel: () => resolve(false) };
  return promise;
}

askConfirmation('¿Vaciar el carrito (3 productos)?')
  .then((confirmed) => console.log('respuesta →', confirmed ? 'vaciado' : 'cancelado'));
setTimeout(() => pendingDialog.cancel(), 60); // 60 ms después, el usuario pulsa «Cancelar»

// Antes de withResolvers se escribía así (lo verás en código antiguo):
//   let resolve; const promise = new Promise((r) => { resolve = r; });

// 2. Promise.try(fn): ejecuta fn AHORA y devuelve una promesa con su
//    resultado. Si fn lanza de forma síncrona, la promesa se rechaza.
function applyCoupon(code) {
  if (!code.startsWith('MX-')) throw new RangeError(`Cupón con formato no válido: ${code}`); // síncrono
  return new Promise((resolve) => setTimeout(resolve, 40, 15)); // asíncrono: 15 % de descuento
}

Promise.try(() => applyCoupon('MX-BUENFIN'))
  .then((percent) => console.log('cupón aplicado →', `${percent} %`));
Promise.try(() => applyCoupon('BUENFIN'))
  .catch((error) => console.log('un solo catch para los dos tipos de error →', error.name));

// Sin Promise.try, applyCoupon('BUENFIN').catch(…) no llega ni a llamar a
// catch: el throw salta antes de que exista ninguna promesa.
try {
  applyCoupon('BUENFIN').catch(() => console.log('(nunca)'));
} catch (error) {
  console.log('sin Promise.try → el error sale como throw síncrono:', error.name);
}
```
