---
example_description: "La cola de microtareas se vacía entera antes de pasar a la siguiente tarea: una cadena de 100 000 microtareas retrasa a un setTimeout programado antes; una cadena sin fin congelaría la página sin que la guarda de bucles lo detecte"
example_tags: "javascript|event-loop|microtareas|queuemicrotask|bloqueo"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Recalcular los precios de un catálogo de 100 000 productos encadenando
// microtareas: cada una procesa un producto y encola la siguiente.
const TOTAL = 100_000;
let processed = 0;
let processedWhenTimerRan = null;

// El temporizador se programa ANTES que cualquier microtarea…
setTimeout(() => {
  processedWhenTimerRan = processed;
  console.log('⏲️ setTimeout 0 → por fin entra');
  console.log('   productos procesados cuando entró →', processedWhenTimerRan);
  console.log('   ¿esperó a la cadena entera? →', processedWhenTimerRan === TOTAL);
}, 0);

function recalculate() {
  processed += 1;
  if (processed < TOTAL) queueMicrotask(recalculate); // ← encola la siguiente
  else console.log('✅ microtareas → 100 000 productos recalculados');
}
queueMicrotask(recalculate);
console.log('script: cadena de microtareas lanzada');

// …y aun así entra el ÚLTIMO: el event loop no pasa a la siguiente tarea
// mientras quede una sola microtarea en la cola, aunque se hayan añadido
// mientras tanto. Tampoco pinta: los pasos de renderizado van después.
//
// ⚠️ Una cadena SIN fin de microtareas (cada una encola otra, para siempre)
// congela la página igual que un while (true). La guarda de LearnWeb solo
// vigila los bucles, así que no la detendría: no lo pruebes.
// Para trocear trabajo largo hay que ceder con TAREAS (setTimeout,
// MessageChannel), no con microtareas: lo verás al final de esta lección.
```
