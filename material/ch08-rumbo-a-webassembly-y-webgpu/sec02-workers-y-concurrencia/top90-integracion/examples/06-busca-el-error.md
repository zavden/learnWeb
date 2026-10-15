---
example_description: "Tres errores reales con workers, cada uno con su arreglo: onProgress?.(++finished) no cuenta nada si no hay onProgress (el ?. se salta el argumento) y el pool no termina nunca; la página sigue usando un array que ya transfirió (un for suma 0 sin avisar, reduce lanza TypeError); y un worker por llamada sin terminate() deja hilos vivos para siempre"
example_tags: "javascript|workers|depuracion|encadenamiento-opcional|transferibles|terminate|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Un registro de workers vivos, para poder contarlos (el navegador no los enumera).
const alive = new Set();
const SUM_CODE = 'self.onmessage = (event) => self.postMessage(event.data.reduce((sum, value) => sum + value, 0));';
function spawn() {
  const url = URL.createObjectURL(new Blob([SUM_CODE], { type: 'text/javascript' }));
  const worker = new Worker(url);
  URL.revokeObjectURL(url);
  alive.add(worker);
  return worker;
}
function kill(worker) {
  worker.terminate();
  alive.delete(worker);
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const chunks = [[1000, 2000], [500, 500], [1500, 500]]; // tres trozos que suman 6000

// ── 1. El ?. que se salta el argumento ─────────────────────────────────────
function sumInPool(parts, onProgress, buggy) {
  return new Promise((resolve) => {
    let finished = 0;
    let total = 0;
    for (const part of parts) {
      const worker = spawn();
      worker.onmessage = (event) => {
        total += event.data;
        kill(worker);
        if (buggy) {
          onProgress?.(++finished); // 🐛 sin onProgress, ?. no evalúa NADA de la llamada, ni ++finished
        } else {
          finished += 1;            // ✅ el efecto, fuera; la llamada opcional, aparte
          onProgress?.(finished);
        }
        if (finished === parts.length) resolve(total);
      };
      worker.postMessage(part);
    }
  });
}
const result = await Promise.race([sumInPool(chunks, undefined, true), sleep(300).then(() => 'pendiente')]);
console.log(`🐛 1. onProgress?.(++finished) sin onProgress → a los 300 ms: ${result}`);
console.log(`✅ 1. finished += 1 fuera del ?. → total ${await sumInPool(chunks, undefined, false)}`);

// ── 2. El array que ya no es tuyo ───────────────────────────────────────────
const prices = new Float64Array([450, 380, 105, 690]);
function subtotal(values) { // un for por índice: no se queja de nada
  let sum = 0;
  for (let i = 0; i < values.length; i++) sum += values[i];
  return sum;
}
const worker2 = spawn();
const reply = () => new Promise((resolve) => { worker2.onmessage = (event) => resolve(event.data); });
worker2.postMessage(prices, [prices.buffer]); // 🐛 transferido… y la página lo sigue usando
console.log(`🐛 2. el worker suma ${await reply()}, pero la página, después, suma ${subtotal(prices)} sin ningún aviso`);
try {
  prices.reduce((sum, value) => sum + value, 0); // los métodos, en cambio, sí se quejan
} catch (error) {
  console.log(`   y con reduce → ${error.name}: ${error.message}`);
}
const kept = new Float64Array([450, 380, 105, 690]);
const copy = kept.slice(); // ✅ se transfiere una copia (o el worker lo devuelve)
worker2.postMessage(copy, [copy.buffer]);
console.log(`✅ 2. con una copia: el worker suma ${await reply()} y la página sigue sumando ${subtotal(kept)}`);
kill(worker2);

// ── 3. El terminate() olvidado ──────────────────────────────────────────────
async function sumOnce(values, { closeIt }) {
  const worker = spawn();
  try {
    return await new Promise((resolve) => {
      worker.onmessage = (event) => resolve(event.data);
      worker.postMessage(values);
    });
  } finally {
    if (closeIt) kill(worker); // ✅ siempre, haya respuesta o error
  }
}
for (let i = 0; i < 3; i++) await sumOnce([i, 1], { closeIt: false }); // 🐛
console.log(`🐛 3. tres llamadas sin terminate() → workers vivos: ${alive.size}`);
const leaked = [...alive];
for (let i = 0; i < 3; i++) await sumOnce([i, 1], { closeIt: true });
console.log(`✅ 3. con terminate() en finally → workers nuevos que siguen vivos: ${alive.size - leaked.length}`);

// Limpieza: los que olvidaron cerrar el 1 🐛 (que nunca terminó) y el 3 🐛.
alive.forEach(kill);
console.log('🧹 al final, workers vivos →', alive.size);
```
