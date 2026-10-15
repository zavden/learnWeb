---
example_description: "finally se ejecuta tanto si la promesa se cumple como si se rechaza: es el sitio para ocultar el indicador de carga; no recibe argumentos y deja pasar el valor o el error, salvo que lance uno propio"
example_tags: "javascript|python|promesas|finally|limpieza"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function loadOrders(customerId) {
  return wait(40).then(() => {
    if (customerId === 'C-404') throw new Error('Cliente sin pedidos visibles');
    return ['P-1001', 'P-1002', 'P-1003'];
  });
}

function showOrders(customerId) {
  console.log(`⏳ (indicador de carga visible) cliente ${customerId}`);
  return loadOrders(customerId)
    .then((orders) => console.log('  📋 pedidos →', orders.join(', ')))
    .catch((error) => console.log('  ⛔', error.message))
    .finally(() => console.log('  ✋ (indicador de carga oculto)')); // ← en los dos casos
}

showOrders('C-1')
  .then(() => showOrders('C-404'))
  .then(() => {
    // finally no recibe argumentos y NO cambia el resultado: lo deja pasar…
    return Promise.resolve('PAY-77').finally(() => 'esto se ignora');
  })
  .then((value) => {
    console.log('finally deja pasar el valor →', value);
    // …salvo que lance: entonces su error sustituye al resultado.
    return Promise.resolve('PAY-78').finally(() => {
      throw new Error('no se pudo cerrar la sesión de pago');
    });
  })
  .catch((error) => console.log('un throw en finally gana →', error.message));

// > Desde Python: es el finally de try/except/finally. Como allí, un error
//   lanzado dentro del finally sustituye al resultado; a diferencia de allí,
//   lo que devuelva se ignora (un return en el finally de Python sí manda).
```
