---
example_description: "Ejercicio: el ayudante bench de partida mide una sola llamada por medida, no calienta, no guarda el resultado y devuelve la media. Hazlo honesto: calentamiento sin medir, lotes, resultado consumido, mediana, mínimo, máximo y coste por llamada. Las comprobaciones usan un reloj simulado, así que no dependen del ordenador"
example_tags: "javascript|rendimiento|benchmark|mediana|calentamiento|ejercicio"
exercise: true
exercise_title: "Haz honesto este benchmark"
exercise_instructions: "Lee bench: cada medida cronometra UNA llamada, nada se calienta, el resultado se tira y devuelve la media || Calienta: antes de medir, llama a fn warmup veces sin leer el reloj, guardando cada resultado en benchSink || Cada medida es un lote: entre las dos lecturas de now(), llama a fn batch veces y guarda cada resultado en benchSink || Devuelve la mediana de las medidas (ordénalas y toma la del centro), el mínimo, el máximo y perCall = mediana / batch || Ejecuta hasta que las seis comprobaciones salgan ✅"
exercise_hints: "El reloj se lee solo dentro del bucle de medidas: dos veces por medida, ninguna en el calentamiento || times.toSorted((a, b) => a - b) ordena sin tocar el original; con 9 medidas, la mediana es la de la posición 4 || benchSink = fn() en todas las llamadas, también en las del calentamiento"
exercise_solution_example: 08-ej-benchmark-honesto-solucion.md
example_stage: exercise
example_importance: important
console: true
loop_protect: false
---

# JavaScript

```javascript
// loop_protect: false (en la cabecera): para medir de verdad, sin la guarda de bucles.
let benchSink;
// bench(nombre, fn, { runs, warmup, batch, now }) → { label, median, min, max, perCall } (en ms)
// `now` es el reloj: por defecto performance.now; las comprobaciones le pasan uno simulado.
function bench(label, fn, { runs = 9, warmup = 3, batch = 1000, now = () => performance.now() } = {}) {
  // TODO 1: calienta: fn, warmup veces, sin leer el reloj
  const times = [];
  for (let i = 0; i < runs; i++) {
    const start = now();
    fn(); // TODO 2 y 3: un lote de `batch` llamadas, guardando cada resultado en benchSink
    times.push(now() - start);
  }
  // TODO 4: la mediana en lugar de la media, y perCall = mediana / batch
  const mean = times.reduce((sum, ms) => sum + ms, 0) / times.length;
  return { label, median: mean, min: Math.min(...times), max: Math.max(...times), perCall: mean };
}

// ── Un uso real (no hace falta tocarlo): ¿cuánto cuesta dar formato a una fecha? ──
const dateFormatter = new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeZone: 'America/Mexico_City' });
const sampleDate = new Date('2026-10-15T18:00:00Z');
const real = bench('formatear una fecha', () => dateFormatter.format(sampleDate), { runs: 9, warmup: 100, batch: 500 });
console.log(`uso real · última fecha → ${benchSink}`);
console.log(`uso real · ≈ ${(real.perCall * 1000).toFixed(2)} µs por llamada (cambia en cada ejecución)`);

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
// Un reloj simulado: las 9 medidas «tardan» 5, 4, 30, 4, 6, 5, 4, 5 y 5 ms (en la tercera
// se coló una pausa). Cada lectura de más o de menos desordena las medidas.
function fakeClock(durations) {
  const readings = [];
  let t = 0;
  for (const duration of durations) {
    readings.push(t, t + duration);
    t += duration + 1;
  }
  let reads = 0;
  return { now: () => readings[reads++] ?? NaN, reads: () => reads };
}
function check(description, actual, expected) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) console.log('✅', description);
  else console.error('❌', description, '→ esperaba', JSON.stringify(expected), 'y obtuve', JSON.stringify(actual));
}
const clock = fakeClock([5, 4, 30, 4, 6, 5, 4, 5, 5]);
let calls = 0;
benchSink = undefined;
const result = bench('prueba', () => ++calls, { runs: 9, warmup: 3, batch: 1000, now: clock.now });
check('fn se llama warmup + runs × batch veces (3 + 9 × 1000)', calls, 9003);
check('el reloj se lee 2 veces por medida y ninguna al calentar', clock.reads(), 18);
check('mediana 5 (la media diría 7.6)', result.median, 5);
check('mínimo 4 y máximo 30', [result.min, result.max], [4, 30]);
check('perCall = mediana ÷ batch', result.perCall, 0.005);
check('benchSink guarda el resultado de la última llamada', benchSink, 9003);
```
