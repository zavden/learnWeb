---
example_description: "Una cuenta atrás que no deriva: cada tick calcula lo que queda a partir de una hora límite y programa el siguiente setTimeout justo para cuando cambie el número; tras un bloqueo de 250 ms salta los números perdidos y llega a 0 a tiempo, mientras la versión que cuenta ticks se queda atrás"
example_tags: "javascript|settimeout|setinterval|deriva|performance-now|temporizadores"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// La reserva de tus entradas caduca en 10 «segundos» (de 100 ms cada uno,
// para no esperar de verdad).
const SECOND = 100;
const TOTAL = 10;
const deadline = performance.now() + TOTAL * SECOND;

function busyFor(ms) {
  const end = performance.now() + ms;
  while (performance.now() < end) {}
}

// 🐛 La cuenta ingenua: resta 1 en cada tick de setInterval.
let naiveRemaining = TOTAL;
const naiveId = setInterval(() => {
  naiveRemaining -= 1;
  if (naiveRemaining <= 0) clearInterval(naiveId);
}, SECOND);

// ✅ La cuenta corregida: lo que queda SIEMPRE sale del reloj, y el siguiente
//    tick se programa para el momento exacto en que cambia el número.
const shown = [];
function tick() {
  const msLeft = deadline - performance.now();
  const remaining = Math.max(0, Math.ceil(msLeft / SECOND));
  shown.push(remaining);
  if (remaining === 0) {
    finish(-msLeft);
    return;
  }
  const untilNextChange = msLeft - (remaining - 1) * SECOND; // ms hasta el próximo número
  setTimeout(tick, untilNextChange + 1); // +1: caer justo DESPUÉS de la frontera
}
tick();

// A los 350 ms la página se bloquea 250 ms (está montando el mapa de asientos).
setTimeout(() => busyFor(250), 350);

function finish(lateBy) {
  clearInterval(naiveId);
  console.log('mostrado →', shown.join(' '), '(los números saltados dependen de cuándo cae el bloqueo; varía)');
  console.log('✅ llegó a 0 a tiempo (menos de 40 ms tarde) →', lateBy < 40);
  console.log('✅ nunca volvió a subir →', shown.every((value, i) => i === 0 || value < shown[i - 1]));
  console.log('✅ tras el bloqueo se saltó números en vez de quedarse atrás →', shown.length < TOTAL + 1);
  console.log('🐛 la cuenta por ticks aún no había llegado a 0 →', naiveRemaining > 0);
}

// Dos ideas de la lección «Callbacks y temporizadores», juntas: el valor sale
// del reloj (no de contar ticks), y el setTimeout recursivo se reprograma cada
// vez con el retraso que haga falta, en vez de un intervalo fijo. Es como
// funcionan los relojes de las páginas que no se desajustan.
```
