---
example_description: "Una función async siempre devuelve una promesa (return la cumple, throw la rechaza); await pausa SOLO esa función hasta que la promesa se asienta, y mientras tanto el resto del programa sigue"
example_tags: "javascript|python|async|await|promesas|orden"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 1. async delante de function: la función devuelve SIEMPRE una promesa.
async function getStock(product) {
  return 12; // → promesa cumplida con 12
}
async function getPrice(product) {
  throw new Error(`Sin precio para ${product}`); // → promesa rechazada
}
console.log('getStock() →', getStock('café de olla'));
getPrice('tamarindo').catch((error) => console.log('getPrice() rechazada →', error.message));

// 2. await promesa: pausa ESTA función hasta que la promesa se asiente y
//    devuelve su valor (o lanza su error). Solo vale dentro de una async.
async function prepareOrder(id) {
  console.log(`2. ${id}: empieza (hasta el primer await, todo es síncrono)`);
  await wait(50); // la función se pausa aquí y devuelve el control
  console.log(`5. ${id}: continúa tras el await (50 ms después)`);
  const units = await getStock('café de olla'); // await de una promesa ya cumplida: también pausa
  console.log(`6. ${id}: stock →`, units);
  return `${id} listo para enviar`;
}

console.log('1. antes de llamar');
const result = prepareOrder('P-1001');
console.log('3. la llamada volvió enseguida con →', result);
result.then((message) => console.log('7. then →', message));
console.log('4. fin del script: prepareOrder sigue pausada');

// await no bloquea la página: pausa la función y deja que el event loop siga
// con lo demás. Lo que viene tras un await continúa como microtarea cuando
// la promesa se asienta: es un then escrito de otra forma.
// > Desde Python: async function = async def, y await es el mismo. Igual que
//   en Python, await solo existe dentro de funciones async (fuera de ellas,
//   solo en los módulos: último ejemplo de la lección).
```
