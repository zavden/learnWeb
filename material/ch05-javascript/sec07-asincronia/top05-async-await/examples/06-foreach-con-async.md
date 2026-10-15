---
example_description: "forEach con un callback async no espera a nada: lanza los callbacks y devuelve undefined en el acto, así que el total se lee antes de que lleguen los datos; se arregla con for…of + await (en fila) o con Promise.all + map (a la vez)"
example_tags: "javascript|async|await|foreach|bucles|promise-all|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
const wait = (ms, value) => new Promise((resolve) => setTimeout(resolve, ms, value));
const PRICES = { 'P-1001': 21000, 'P-1002': 9500, 'P-1003': 18000 };
const getOrderCents = (id) => wait(50, PRICES[id]);
const orderIds = Object.keys(PRICES);

async function main() {
  // 🐛 forEach llama al callback async tres veces, ignora las promesas que
  //    devuelven y termina en el acto. No hay nada que esperar: forEach
  //    devuelve undefined, así que «await orderIds.forEach(…)» tampoco espera.
  let total = 0;
  await orderIds.forEach(async (id) => {
    const cents = await getOrderCents(id);
    total += cents;
  });
  console.log('🐛 total tras forEach →', total);
  await wait(100);
  console.log('🐛 …y 100 ms después, cuando ya nadie lo mira →', total);

  // ✅ En fila: for…of SÍ respeta el await de su cuerpo.
  total = 0;
  for (const id of orderIds) {
    total += await getOrderCents(id);
  }
  console.log('✅ for…of + await →', total);

  // ✅ A la vez: map devuelve las promesas, Promise.all las espera.
  const amounts = await Promise.all(orderIds.map((id) => getOrderCents(id)));
  console.log('✅ Promise.all + map →', amounts.reduce((sum, cents) => sum + cents, 0));
}
main();

// Lo mismo pasa con cualquier método que llame a un callback sin esperar su
// resultado: map devuelve un array de PROMESAS (por eso funciona con
// Promise.all), filter con un callback async deja pasar todo (una promesa es
// un valor verdadero), y reduce acumula promesas.
// Y si un callback async de forEach falla, su rechazo no lo espera nadie:
// sale como «Uncaught (in promise)».
// Ojo con «total += await …» en callbacks que corren a la vez: el += lee total
// ANTES del await, y cada callback escribiría su importe sobre un 0 viejo.
```
