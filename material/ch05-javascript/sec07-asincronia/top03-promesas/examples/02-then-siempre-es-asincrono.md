---
example_description: "El ejecutor de new Promise se ejecuta en el acto, de forma síncrona; los callbacks de then, en cambio, siempre son microtareas, aunque la promesa ya esté cumplida: el código que sigue a then se ejecuta antes, haya caché o no"
example_tags: "javascript|python|promesas|then|microtareas|orden"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
console.log('1. antes de crear la promesa');

const payment = new Promise((resolve) => {
  // El EJECUTOR (la función que recibe new Promise) corre YA, dentro de la
  // llamada a new Promise: la operación empieza en cuanto creas la promesa.
  console.log('2. ejecutor: empiezo el cobro (síncrono)');
  resolve('PAY-881'); // cumplida antes incluso de que alguien llame a then
});

payment.then((id) => {
  // …y aun así este callback es una MICROTAREA: espera a que termine el script.
  console.log('5. then sobre una promesa ya cumplida →', id);
});
console.log('3. después de then');

// ¿Por qué importa? Una función que a veces tiene el dato en caché y a veces
// no se comporta SIEMPRE igual: el código tras then va primero en los dos casos.
const priceCache = new Map([['café de olla', 210]]);
function getPrice(product) {
  if (priceCache.has(product)) return Promise.resolve(priceCache.get(product)); // ya lo tengo
  return new Promise((resolve) => setTimeout(resolve, 50, 95));                  // hay que pedirlo
}
getPrice('café de olla').then((price) => console.log('6. precio (desde la caché) →', price));
getPrice('cajeta').then((price) => console.log('7. precio (desde la «red») →', price));

console.log('4. fin del script');

// Con callbacks, una función así llamaría a su callback a veces YA y a veces
// MÁS TARDE, y el orden del programa cambiaría según el estado de la caché.
// Las promesas lo prohíben: then nunca llama a su callback de forma síncrona.
// > Desde Python: ¡ojo con la diferencia! Una corrutina de Python no ejecuta
//   NADA hasta que alguien la espera con await o la programa con
//   asyncio.create_task. Una promesa de JavaScript ya está en marcha desde
//   que existe: el ejecutor arrancó la operación en el paso 2.
```
