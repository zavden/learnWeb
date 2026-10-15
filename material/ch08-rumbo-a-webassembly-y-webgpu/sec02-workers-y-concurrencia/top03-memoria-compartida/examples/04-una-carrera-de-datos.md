---
example_description: "Una carrera de datos, simulada de forma reproducible: dos taquillas (dos «hilos» hechos con generadores) venden 500 entradas cada una sobre el mismo contador; con «leer y luego escribir» se pierden ventas según cómo se intercalen los pasos, con Atomics.add (un solo paso indivisible) nunca"
example_tags: "javascript|concurrencia|carreras|atomics|generadores|memoria-compartida|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Dos «hilos» simulados con generadores (lección «Generadores»): cada
// yield es un punto donde el sistema podría pasar a ejecutar el otro hilo. En un
// hilo de verdad, ese cambio ocurre en cualquier instrucción y sin avisar.
function* sellUnsafe(sold, count, label, trace) {
  for (let i = 0; i < count; i++) {
    const current = sold[0];   // 1. leer
    trace?.push(`${label} lee ${current}`);
    yield;                     //    ← aquí puede colarse la otra taquilla
    sold[0] = current + 1;     // 2. escribir lo que leyó + 1
    trace?.push(`${label} escribe ${current + 1}`);
    yield;
  }
}
function* sellAtomic(sold, count) {
  for (let i = 0; i < count; i++) {
    Atomics.add(sold, 0, 1);   // leer, sumar y escribir en UN paso que nadie puede partir
    yield;
  }
}

// El planificador: en cada paso elige qué hilo avanza (como el sistema operativo).
function run(threads, pick) {
  const alive = [...threads];
  for (let step = 0; alive.length > 0; step++) {
    const index = pick(step, alive.length);
    if (alive[index].next().done) alive.splice(index, 1);
  }
}
function mulberry32(seed) { // números «aleatorios» con semilla (capítulo 6): siempre los mismos
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const oneAfterOther = () => 0;                   // termina una taquilla y luego la otra
const alternate = (step, n) => step % n;         // un paso cada una
const randomOrder = (seed) => { const random = mulberry32(seed); return (step, n) => Math.floor(random() * n); };

for (const [label, sell, pick] of [
  ['leer y escribir, una detrás de otra', sellUnsafe, oneAfterOther],
  ['leer y escribir, alternando', sellUnsafe, alternate],
  ['leer y escribir, orden aleatorio (semilla 2026)', sellUnsafe, randomOrder(2026)],
  ['Atomics.add, alternando', sellAtomic, alternate],
  ['Atomics.add, orden aleatorio (semilla 2026)', sellAtomic, randomOrder(2026)],
]) {
  const sold = new Int32Array(1); // el contador «compartido» por las dos taquillas
  run([sell(sold, 500, 'A'), sell(sold, 500, 'B')], pick);
  console.log(`${sold[0] === 1000 ? '✅' : '🐛'} ${label} → ${sold[0]} de 1000 entradas`);
}

// Una venta por taquilla, alternando, paso a paso:
const counter = new Int32Array(1);
const trace = [];
run([sellUnsafe(counter, 1, 'A', trace), sellUnsafe(counter, 1, 'B', trace)], alternate);
console.log(trace.join(' · '), '→ 2 ventas, el contador dice', counter[0]);
```
