---
example_description: "Errores en una cadena de promesas: un throw dentro de un then se convierte en rechazo y salta los then siguientes hasta el primer catch; un catch que devuelve un valor recupera la cadena; then(ok, fallo) no atrapa los errores de su propio ok"
example_tags: "javascript|promesas|catch|errores|throw|recuperar"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
const wait = (ms, value) => new Promise((resolve) => setTimeout(resolve, ms, value));
const brokenResponse = '{"orderId": "P-731", "total": 12'; // JSON cortado

// 1. Un throw (o un error de JavaScript) dentro de un then RECHAZA la promesa
//    que devolvió ese then. Los then siguientes se saltan hasta un catch.
wait(20, brokenResponse)
  .then((text) => JSON.parse(text)) // lanza SyntaxError…
  .then((order) => console.log('(se salta) pedido →', order.orderId))
  .catch((error) => console.log('1. catch →', error.name))
  // 2. Un catch que DEVUELVE algo recupera la cadena: lo que sigue se cumple.
  .then(() => wait(20, '{"orderId": "P-732", "total": 1250}'))
  .then((text) => JSON.parse(text))
  .then((order) => {
    if (order.total > 1000) throw new RangeError(`El pedido ${order.orderId} necesita revisión manual`);
    return order;
  })
  .catch((error) => {
    // 3. Atrapa solo lo que sabes manejar; lo demás, relánzalo.
    if (!(error instanceof RangeError)) throw error;
    console.log('2. catch →', error.message);
    return { orderId: 'P-732', status: 'en revisión' }; // valor de recambio
  })
  .then((order) => console.log('3. la cadena sigue →', order.status))
  .then(() => {
    // 4. then(ok, fallo): el segundo argumento solo ve los rechazos de ANTES,
    //    no los errores que lance el propio ok.
    return wait(20, 'P-733').then(
      (id) => { throw new TypeError(`${id}: falta la dirección de envío`); },
      () => console.log('(nunca) el segundo argumento de then'),
    );
  })
  .catch((error) => console.log('4. lo atrapa el catch de después →', error.name));

// catch(fn) es exactamente then(undefined, fn).
// > Desde Python: un rechazo viaja por la cadena como una excepción por la
//   pila: el primer catch es el primer except que la atrapa, y lo que devuelve
//   es el valor con el que la ejecución continúa.
```
