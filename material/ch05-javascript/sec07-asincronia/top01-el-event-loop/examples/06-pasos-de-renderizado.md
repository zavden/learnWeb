---
example_description: "Los pasos de renderizado: los callbacks de requestAnimationFrame se ejecutan justo antes de pintar, después de las microtareas; los del mismo frame reciben el mismo instante, y uno pedido dentro de otro espera al frame siguiente"
example_tags: "javascript|event-loop|requestanimationframe|renderizado|microtareas"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// requestAnimationFrame(fn) pide: «ejecuta fn justo ANTES de pintar el próximo
// frame». Recibe el instante del frame (en ms, la misma escala que
// performance.now()). Es la base de las animaciones (lección 6 de este módulo).
let firstFrame;

requestAnimationFrame((frameTime) => {
  firstFrame = frameTime;
  console.log('3. rAF → paso de renderizado, justo antes de pintar');

  // Pedido DENTRO de un rAF: ya no entra en este frame, sino en el siguiente.
  requestAnimationFrame((nextFrameTime) => {
    console.log('5. rAF anidado → frame siguiente:', nextFrameTime > firstFrame);
    const gap = nextFrameTime - firstFrame;
    console.log(`   entre frames ≈ ${gap.toFixed(1)} ms (≈ 16.7 a 60 Hz, ≈ 8.3 a 120 Hz; varía)`);
  });
});

requestAnimationFrame((frameTime) => {
  // Todos los rAF pedidos para el mismo frame reciben el MISMO instante.
  console.log('4. otro rAF del mismo frame → mismo instante:', frameTime === firstFrame);
});

Promise.resolve().then(() => console.log('2. microtarea → antes de cualquier pintado'));
console.log('1. script');

// Una vuelta del event loop: tarea → microtareas → (si toca pintar: rAF,
// estilos, layout, pintado). El navegador pinta como mucho una vez por frame
// de la pantalla (unas 60 o 120 veces por segundo) y nunca en mitad de una
// tarea ni entre dos microtareas.
// Un setTimeout(fn, 0) frente a un rAF: el orden NO está garantizado (depende
// de cuánto falte para el próximo frame), así que no lo imprimimos.
```
