---
example_description: "Promise.race se asienta con la PRIMERA operación que termine, aunque sea un fallo; Promise.any se cumple con el primer ÉXITO e ignora los fallos, y si todo falla rechaza con un AggregateError; casos límite con listas vacías"
example_tags: "javascript|python|promesas|race|any|aggregateerror"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Las fotos de la tienda están copiadas en tres servidores (espejos).
// Cada uno tarda distinto, y el de Monterrey está caído (falla enseguida).
function fromMirror(city, ms, ok = true) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (ok) resolve(`foto desde ${city} (${ms} ms)`);
      else reject(new Error(`espejo de ${city} caído`));
    }, ms);
  });
}
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// race: gana el PRIMERO que se asiente, sea éxito o fallo.
Promise.race([fromMirror('CDMX', 80), fromMirror('Monterrey', 20, false), fromMirror('Guadalajara', 50)])
  .then((photo) => console.log('race →', photo))
  .catch((error) => console.log('race → falla, porque el primero en terminar falló:', error.message))
  // any: gana el primer ÉXITO; los fallos solo cuentan si fallan todos.
  .then(() => Promise.any([fromMirror('CDMX', 80), fromMirror('Monterrey', 20, false), fromMirror('Guadalajara', 50)]))
  .then((photo) => console.log('any →', photo))
  // Si todos fallan: AggregateError, con la lista de errores en .errors.
  .then(() => Promise.any([fromMirror('Monterrey', 20, false), fromMirror('Mérida', 30, false)]))
  .catch((error) => {
    console.log('any, todos caídos →', error.name, '|', error.message);
    console.log('   errores →', error.errors.map((e) => e.message));
  })
  .then(() => {
    // Casos límite con listas vacías:
    Promise.all([]).then((value) => console.log('all([]) → se cumple al instante:', value));
    Promise.any([]).catch((error) => console.log('any([]) → se rechaza al instante:', error.name));
    const neverEnds = Promise.race([]); // 🤔 race([]) se queda PENDIENTE para siempre
    return wait(100).then(() => console.log('race([]) 100 ms después →', neverEnds));
  });

// > Desde Python: race se parece a asyncio.wait(tareas, return_when=
//   FIRST_COMPLETED) y any, a recorrer asyncio.as_completed() hasta el primer
//   éxito. AggregateError es como un ExceptionGroup: varios errores en uno.
```
