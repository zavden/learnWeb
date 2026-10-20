---
example_description: "Con un acumulador de paso fijo, volver de una pestaña oculta 5 s mete 5000 ms en un solo frame: 500 pasos de física de golpe (la página se congela y la caja salta 600 px). Limitar el tiempo de cada frame a 100 ms lo deja en 10 pasos; pausar con visibilitychange lo evita del todo"
example_tags: "javascript|requestanimationframe|acumulador|visibilitychange|delta-time|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Una cinta lleva cajas a 120 px/s; la física avanza en pasos fijos de 10 ms (ejemplo 02).
const STEP_MS = 10;
function beltWorld(maxFrameMs) {
  let x = 0;
  let previous = null;
  let accumulator = 0;
  let mostSteps = 0;                            // el frame que más pasos tuvo que dar
  let biggestJump = 0;                          // y cuánto se movió la caja en él
  return {
    frame(now) {
      if (previous !== null) accumulator += Math.min(now - previous, maxFrameMs); // ✅ el tope
      previous = now;
      const before = x;
      let steps = 0;
      while (accumulator >= STEP_MS) {
        x += 120 * STEP_MS / 1000;
        accumulator -= STEP_MS;
        steps += 1;
      }
      mostSteps = Math.max(mostSteps, steps);
      biggestJump = Math.max(biggestJump, x - before);
    },
    report: () => `el frame más largo dio ${mostSteps} pasos · la caja saltó ${Math.round(biggestJump)} px`,
  };
}

// 1 s visible a 60 Hz, 5 s en otra pestaña (rAF no llama), y 1 s visible otra vez
const times = [];
for (let i = 0; i <= 60; i++) times.push(Math.round(i * 1000 / 60));
for (let i = 0; i <= 60; i++) times.push(6000 + Math.round(i * 1000 / 60));

const raw = beltWorld(Infinity);
const clamped = beltWorld(100);
for (const now of times) {
  raw.frame(now);
  clamped.frame(now);
}
console.log('🐛 sin tope →', raw.report());
console.log('✅ como mucho 100 ms por frame →', clamped.report());

// 🐛 Al volver, el primer frame trae 5000 ms: el bucle while da 500 pasos seguidos (con
//    una física pesada, la página se congela; y si un paso tarda más que su tiempo, cada
//    frame acumula más deuda: la «espiral de la muerte»). La caja aparece 600 px más allá.
// ✅ Dos defensas que se combinan:
//    1. Un tope al tiempo de cada frame: Math.min(now - previous, 100). Se pierde tiempo
//       simulado, pero nadie lo echa de menos.
//    2. Pausar el bucle al ocultarse la página (visibilitychange, ejemplo 01) y, al volver,
//       poner previous = null para que el primer frame no cuente la pausa.
```
