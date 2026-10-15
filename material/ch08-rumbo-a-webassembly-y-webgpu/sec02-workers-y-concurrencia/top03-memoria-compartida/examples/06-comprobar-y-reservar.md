---
example_description: "La otra carrera clásica, «comprobar y luego actuar», simulada: dos compradores ven libre el último asiento y los dos lo reservan (uno recibe una confirmación falsa); con Atomics.compareExchange, comprobar y reservar son un solo paso y solo uno gana. Con la misma operación se construye un cerrojo"
example_tags: "javascript|concurrencia|carreras|atomics|compareexchange|cerrojo|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// El último asiento libre de la sala, 12A: 0 = libre; si no, el número del comprador.
const FREE = 0;
const buyers = { 1: 'Ana', 2: 'Beto' };

// 🐛 Comprobar y luego reservar: dos pasos, y entre ellos se puede colar el otro hilo.
function* reserveUnsafe(seat, buyer, trace) {
  if (seat[0] !== FREE) return false;
  trace.push(`${buyers[buyer]} ve el 12A libre`);
  yield;                                   // ← aquí se cuela el otro comprador
  seat[0] = buyer;
  trace.push(`${buyers[buyer]} lo reserva`);
  return true;
}
// ✅ compareExchange comprueba y escribe en UN solo paso: «si vale FREE, pon buyer».
function* reserveAtomic(seat, buyer, trace) {
  const before = Atomics.compareExchange(seat, 0, FREE, buyer);
  trace.push(`${buyers[buyer]} ${before === FREE ? 'lo reserva' : 'llega tarde'}`);
  yield;
  return before === FREE;
}

// Los dos «hilos», alternando un paso cada uno; devuelve lo que confirmó cada uno.
function runAlternating(threads) {
  const results = new Array(threads.length);
  for (let step = 0; results.includes(undefined); step++) {
    const index = step % threads.length;
    if (results[index] !== undefined) continue;
    const { done, value } = threads[index].next();
    if (done) results[index] = value;
  }
  return results;
}

for (const [label, reserve] of [['🐛 comprobar y luego reservar', reserveUnsafe], ['✅ compareExchange', reserveAtomic]]) {
  const seat = new Int32Array(1);
  const trace = [];
  const [ana, beto] = runAlternating([reserve(seat, 1, trace), reserve(seat, 2, trace)]);
  console.log(`${label}: ${trace.join(' · ')}`);
  console.log(`   confirmaciones → Ana: ${ana ? 'sí' : 'no'}, Beto: ${beto ? 'sí' : 'no'} · el asiento es de ${buyers[seat[0]]}`);
}

// Con compareExchange se construye un CERROJO (mutex): 0 = abierto, 1 = cerrado.
// lock: «si está abierto, ciérralo» en un paso; unlock: ábrelo. Con hilos de verdad,
// quien no consigue el cerrojo se duerme con Atomics.wait hasta que lo abran
// (ejemplo siguiente); aquí, en un solo hilo, basta con ver qué devuelve.
const mutex = new Int32Array(1);
const tryLock = () => Atomics.compareExchange(mutex, 0, 0, 1) === 0;
console.log('primer tryLock →', tryLock(), '| segundo tryLock →', tryLock());
Atomics.store(mutex, 0, 0); // unlock
console.log('tras abrirlo, tryLock →', tryLock());
```
