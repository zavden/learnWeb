---
example_description: "performance.now() avanza a saltos de 0,1 ms en una página sin aislamiento cross-origin: medir una sola operación rápida da 0 o 0,1 ms y no dice nada. Se mide un lote de 200 000 llamadas y se divide"
example_tags: "javascript|rendimiento|performance-now|resolucion|medir|bug"
example_stage: common-error
example_importance: critical
console: true
loop_protect: false
---

# JavaScript

```javascript
// loop_protect: false (en la cabecera): la guarda de bucles de LearnWeb añade una
// llamada en cada vuelta de cada bucle y falsearía la medida. Todos los bucles terminan.

// Un carrito de seis productos: calcular su total cuesta unas decenas de nanosegundos.
const cart = [
  { sku: 'CAF-500', price: 189, qty: 2 },
  { sku: 'TE-VERDE', price: 95, qty: 1 },
  { sku: 'MOL-NEGRO', price: 120, qty: 3 },
  { sku: 'PAN-DULCE', price: 18.5, qty: 6 },
  { sku: 'CHOC-OAX', price: 145, qty: 1 },
  { sku: 'MIEL-250', price: 110, qty: 2 },
];
function cartTotal(items) {
  let total = 0;
  for (const item of items) total += item.price * item.qty;
  return Math.round(total * 1.16 * 100) / 100; // con IVA del 16 %, redondeado a centavos
}

// 1. ¿De cuánto en cuánto avanza el reloj? Lee hasta ver 5 cambios y guarda el salto menor.
let smallestStep = Infinity;
let changes = 0;
let previous = performance.now();
while (changes < 5) {
  const now = performance.now();
  if (now !== previous) {
    smallestStep = Math.min(smallestStep, now - previous);
    changes += 1;
    previous = now;
  }
}
console.log('el reloj avanza a saltos de →', Number(smallestStep.toFixed(3)), 'ms');
// Sin aislamiento cross-origin (COOP + COEP), Chrome recorta el reloj a 0,1 ms.
console.log('crossOriginIsolated →', crossOriginIsolated);

// 🐛 2. Medir UNA llamada: la operación cabe de sobra dentro de un salto del reloj.
const singles = [];
for (let i = 0; i < 20; i++) {
  const start = performance.now();
  cartTotal(cart);
  singles.push(Number((performance.now() - start).toFixed(1)));
}
// Unas dicen 0 y otras 0.1, según si la llamada cruzó un salto del reloj. Ninguna dice la verdad.
console.log('🐛 20 medidas de una llamada → todas valen 0 o 0.1 ms:', singles.every((ms) => ms === 0 || ms === 0.1));

// ✅ 3. Medir un LOTE que dure bastante más que un salto (≥ 1 ms) y dividir.
const CALLS = 200_000;
let sum = 0; // se usa el resultado: así el motor no puede saltarse el trabajo (ejemplo 06)
const start = performance.now();
for (let i = 0; i < CALLS; i++) sum += cartTotal(cart);
const batchMs = performance.now() - start;
console.log('total del carrito →', cartTotal(cart));
console.log('✅ ¿todas las llamadas dieron lo mismo? →', Math.abs(sum / CALLS - cartTotal(cart)) < 1e-6);
console.log(`✅ ${CALLS} llamadas en un lote: ≈ ${batchMs.toFixed(1)} ms`);
console.log(`✅ una llamada: ≈ ${((batchMs / CALLS) * 1e6).toFixed(0)} ns (el lote ÷ ${CALLS})`);

// Desde Python: time.perf_counter() no se recorta (resolución de nanosegundos), pero la
// regla es la misma: una operación de nanosegundos se mide repetida, como hace timeit.
```
