---
example_description: "Una promesa es un objeto que representa un resultado futuro: nace pendiente y se asienta UNA vez, cumplida con un valor (then) o rechazada con un error (catch); la consola muestra su estado"
example_tags: "javascript|python|promesas|then|catch|estados"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// La «API» del almacén devuelve PROMESAS. Cómo se fabrica una (new Promise)
// lo verás en el ejemplo «Crear promesas»; de momento, úsala.
const STOCK = { 'café de olla': 12, 'pan de muerto': 0 };
function getStock(product) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (product in STOCK) resolve(STOCK[product]);                // ✔ cumplir
      else reject(new Error(`Producto desconocido: ${product}`));   // ✘ rechazar
    }, 100);
  });
}

// getStock vuelve AL MOMENTO con una promesa pendiente: el dato aún no existe.
const coffee = getStock('café de olla');
console.log('recién creada →', coffee);

// then(fn): «cuando se cumpla, llama a fn con el valor».
coffee.then((units) => {
  console.log('then → unidades de café:', units);
  console.log('ahora →', coffee);
});

// catch(fn): «si se rechaza, llama a fn con el error».
getStock('tamarindo').catch((error) => {
  console.log('catch →', error.message);
});

// Una promesa se asienta UNA sola vez: lo que venga después se ignora.
const payment = new Promise((resolve, reject) => {
  resolve('PAY-1001');
  resolve('PAY-1002');               // ignorado
  reject(new Error('demasiado tarde')); // ignorado
});
payment.then((id) => console.log('solo cuenta la primera →', id));

// Promise.resolve(v) y Promise.reject(e) crean promesas ya asentadas.
console.log('Promise.resolve(0) →', Promise.resolve(0));
console.log('fin del script');

// Estados: pending (pendiente) → fulfilled (cumplida, con un valor)
//                              → rejected (rechazada, con un motivo).
// «Asentada» (settled) = cumplida o rechazada; ya no cambia nunca.
// > Desde Python: una promesa se parece a un asyncio.Future: resolve es
//   set_result, reject es set_exception y then es add_done_callback… pero
//   then devuelve OTRA promesa, y eso permite encadenarlas (ejemplo 3).
```
