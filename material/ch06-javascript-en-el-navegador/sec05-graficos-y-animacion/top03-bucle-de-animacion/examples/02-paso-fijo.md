---
example_description: "Con un paso de física por frame (delta time), una caída con gravedad depende de la frecuencia de la pantalla: 506 px en 1 s a 30 Hz, 493 px a 144 Hz. Con un acumulador, los frames reparten el tiempo en pasos fijos de 10 ms y el resultado es idéntico en cualquier pantalla"
example_tags: "javascript|requestanimationframe|paso-fijo|acumulador|fisica|delta-time"
example_stage: intermediate
example_importance: critical
console: true
---

# JavaScript

```javascript
// La física: gravedad de 980 px/s² (100 px = 1 m). dt en segundos.
const GRAVITY = 980;
function step(state, dt) {
  const vy = state.vy + GRAVITY * dt;          // la gravedad cambia la velocidad…
  return { y: state.y + vy * dt, vy };         // …y la velocidad, la posición
}

// Delta time (lección «Frames de animación y tiempo»): un paso por frame, con el dt de ese frame
function variableWorld() {
  let state = { y: 0, vy: 0 };
  let previous = null;
  return {
    frame(now) {                               // ← la función que darías a requestAnimationFrame
      if (previous !== null) state = step(state, (now - previous) / 1000);
      previous = now;
    },
    get y() { return state.y; },
  };
}

// ✅ Paso fijo: el tiempo de los frames se acumula y la física avanza de 10 en 10 ms
const STEP_MS = 10;
function fixedWorld() {
  let state = { y: 0, vy: 0 };
  let previous = null;
  let accumulator = 0;
  return {
    frame(now) {
      if (previous !== null) accumulator += now - previous;
      previous = now;
      while (accumulator >= STEP_MS) {         // 0, 1, 2… pasos: los que quepan
        state = step(state, STEP_MS / 1000);
        accumulator -= STEP_MS;
      }
      // draw(state) iría aquí; lo que sobra en el acumulador espera al frame siguiente
    },
    get y() { return state.y; },
  };
}

// Los instantes de los frames durante 1 s, en ms redondeados (para que las cuentas den exactas)
function frameTimes(hz) {
  const times = [];
  for (let i = 0; i <= hz; i++) times.push(Math.round(i * 1000 / hz));
  return times;
}

for (const hz of [30, 60, 120, 144]) {
  const variable = variableWorld();
  const fixed = fixedWorld();
  for (const now of frameTimes(hz)) {
    variable.frame(now);
    fixed.frame(now);
  }
  console.log(`${hz} Hz → dt del frame: ${variable.y.toFixed(1)} px · ✅ paso fijo: ${fixed.y.toFixed(1)} px`);
}
console.log(`la fórmula de la física (½ · g · t²) → ${GRAVITY / 2} px`);
```
