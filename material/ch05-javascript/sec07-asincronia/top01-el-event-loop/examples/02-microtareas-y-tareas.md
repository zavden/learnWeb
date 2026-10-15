---
example_description: "El orden de una vuelta del event loop: primero el código síncrono, después TODAS las microtareas (then, queueMicrotask, también las que se encolan entre ellas) y solo entonces la siguiente tarea (setTimeout)"
example_tags: "javascript|event-loop|microtareas|tareas|queuemicrotask|settimeout"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Los números dicen el orden REAL en que aparece cada línea.
// Promise.resolve().then(fn) programa fn como microtarea (las promesas llegan
// en la lección «Promesas»); queueMicrotask(fn) hace lo mismo sin promesa.

console.log('1. script: empieza el pago del pedido P-2077');

setTimeout(() => {
  console.log('6. tarea: setTimeout 0 → envío el email de confirmación');
}, 0);

Promise.resolve().then(() => {
  console.log('3. microtarea (then) → marco el pedido como pagado');
});

queueMicrotask(() => {
  console.log('4. microtarea (queueMicrotask) → actualizo el contador del carrito');
  // Una microtarea encolada DESDE una microtarea entra en la misma ronda:
  queueMicrotask(() => console.log('5. microtarea anidada → todavía antes de cualquier tarea'));
  // Una tarea encolada desde aquí va al FINAL de la cola de tareas:
  setTimeout(() => console.log('7. tarea encolada desde una microtarea → la última'), 0);
});

console.log('2. script: termina');

// Una vuelta del event loop:
//   1) ejecuta UNA tarea entera (aquí, el script),
//   2) vacía la cola de microtareas, incluidas las que aparecen mientras tanto,
//   3) quizá pinta la página,
//   4) toma la siguiente tarea (los dos setTimeout, por orden de llegada).
```
