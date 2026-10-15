---
example_description: "Solución: bench calienta sin leer el reloj, mide lotes de batch llamadas, guarda cada resultado en benchSink y devuelve la mediana, el mínimo, el máximo y el coste por llamada; con el reloj simulado sale la mediana 5 aunque una medida sufra una pausa de 30"
example_tags: "javascript|rendimiento|benchmark|mediana|calentamiento|solucion"
example_stage: final-solution
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
  for (let i = 0; i < warmup; i++) benchSink = fn(); // calentar: sin reloj
  const times = [];
  for (let i = 0; i < runs; i++) {
    const start = now();
    for (let call = 0; call < batch; call++) benchSink = fn(); // un lote, resultado consumido
    times.push(now() - start);
  }
  const sorted = times.toSorted((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  return { label, median, min: sorted[0], max: sorted.at(-1), perCall: median / batch };
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
