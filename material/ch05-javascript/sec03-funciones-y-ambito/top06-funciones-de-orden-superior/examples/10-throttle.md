---
example_description: "Throttle con un reloj simulado: de 21 eventos de scroll en 320 ms solo pasan 3 llamadas, una cada 100 ms como máximo"
example_tags: "javascript|orden-superior|throttle|closures|rendimiento"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// THROTTLE: deja pasar como mucho UNA llamada cada intervalMs, por muchos
// eventos que lleguen (scroll, movimiento del ratón, cambio de tamaño…).
// Para ver el comportamiento exacto sin mover el ratón, el reloj es un
// parámetro: en una página real sería performance.now() (milisegundos).
function throttle(fn, intervalMs, now = () => performance.now()) {
  let lastRun = -Infinity; // closure: cuándo se dejó pasar la última llamada
  return (...args) => {
    const time = now();
    if (time - lastRun >= intervalMs) {
      lastRun = time;
      fn(...args);
    }
    // si no ha pasado el intervalo, la llamada se descarta
  };
}

// Simulación: el usuario hace scroll y llega un evento cada 16 ms (≈ 60 por segundo).
let fakeTime = 0;
let calls = 0;
const savePosition = throttle(
  (y) => {
    calls += 1;
    console.log(`  t = ${String(fakeTime).padStart(3)} ms → guardar posición ${y} px`);
  },
  100,
  () => fakeTime,
);

let events = 0;
for (let frame = 0; frame <= 20; frame++) {
  fakeTime = frame * 16;
  events += 1;
  savePosition(frame * 40);
}
console.log(`eventos: ${events} · llamadas: ${calls}`); // eventos: 21 · llamadas: 3

// ⚠️ La última posición (800 px, en t = 320 ms) no se ha guardado: llegó dentro
// del intervalo. Las versiones completas (como la de la librería lodash) añaden
// una llamada final con los últimos argumentos («trailing call»).

// Con los mismos eventos:
//   debounce(fn, 400) → UNA llamada, 400 ms después del ÚLTIMO evento
//   throttle(fn, 100) → una llamada cada 100 ms MIENTRAS siguen llegando eventos
```
