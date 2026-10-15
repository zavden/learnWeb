---
example_description: "Un await dentro de un bucle hace las operaciones una detrás de otra (tres pedidos de 120 ms tardan ≥ 360 ms); si no dependen entre sí, lanzarlas todas y esperar con Promise.all las hace a la vez (≈ 120 ms)"
example_tags: "javascript|python|async|await|bucles|promise-all|rendimiento|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
const wait = (ms, value) => new Promise((resolve) => setTimeout(resolve, ms, value));
const getOrder = (id) => wait(120, { id, status: id === 'P-1002' ? 'enviado' : 'pagado' });
const orderIds = ['P-1001', 'P-1002', 'P-1003'];

async function main() {
  // 🐛 await en el bucle: cada vuelta ESPERA a que termine la petición antes
  //    de lanzar la siguiente. Tres peticiones independientes, en fila.
  let start = performance.now();
  const sequential = [];
  for (const id of orderIds) {
    sequential.push(await getOrder(id));
  }
  let elapsed = performance.now() - start;
  console.log('🐛 secuencial →', sequential.map((order) => order.status));
  console.log('   tardó ≥ 360 ms (3 × 120) →', elapsed >= 360, `(≈ ${Math.round(elapsed)} ms; varía)`);

  // ✅ Lanzar todas (map crea las tres promesas, ya en marcha) y esperarlas juntas.
  start = performance.now();
  const parallel = await Promise.all(orderIds.map((id) => getOrder(id)));
  elapsed = performance.now() - start;
  console.log('✅ en paralelo →', parallel.map((order) => order.status));
  console.log('   tardó < 240 ms (≈ una sola) →', elapsed < 240, `(≈ ${Math.round(elapsed)} ms; varía)`);
}
main();

// ¿Cuándo SÍ quieres el bucle secuencial? Cuando cada paso depende del
// anterior (el cursor de la página siguiente), cuando el orden importa
// (aplicar movimientos de una cuenta) o cuando el servidor limita cuántas
// peticiones aceptas a la vez. Para cien pedidos, ni todo en fila ni cien a la
// vez: por tandas (en los ejemplos profesionales verás un límite de
// concurrencia).
// > Desde Python: idéntico. await dentro de un for va en fila;
//   asyncio.gather(*(get_order(i) for i in ids)) va en paralelo.
```
