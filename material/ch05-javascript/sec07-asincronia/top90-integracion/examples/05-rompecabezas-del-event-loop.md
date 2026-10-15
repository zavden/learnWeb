---
example_description: "Un rompecabezas del event loop: un programa mezcla código síncrono, then encadenados, queueMicrotask, una función async con await y dos temporizadores; el orden previsto se compara línea a línea con el real (✓/✗), y cada línea lleva la regla que la explica"
example_tags: "javascript|event-loop|microtareas|async|await|orden"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Antes de ejecutar: tapa la parte de abajo y escribe en un papel el orden en
// que crees que se apuntará cada etiqueta. Luego compáralo con PREDICTED.
const real = [];
const note = (label) => real.push(label);

note('script: empieza');
setTimeout(() => {
  note('timeout A');
  Promise.resolve().then(() => note('microtarea creada en timeout A'));
}, 0);
setTimeout(() => note('timeout B'), 0);
Promise.resolve()
  .then(() => note('then 1'))
  .then(() => note('then 2'));
queueMicrotask(() => note('queueMicrotask'));
(async () => {
  note('async: antes del await');
  await null;
  note('async: tras el await');
})();
note('script: termina');

// La predicción, con la regla que justifica cada posición.
const PREDICTED = [
  ['script: empieza', 'código síncrono'],
  ['async: antes del await', 'una función async se ejecuta en el acto hasta su primer await'],
  ['script: termina', 'el script entero es UNA tarea: termina antes que cualquier callback'],
  ['then 1', 'primera microtarea encolada (la promesa ya estaba cumplida)'],
  ['queueMicrotask', 'segunda microtarea, por orden de llegada'],
  ['async: tras el await', 'el await encoló su continuación como tercera microtarea'],
  ['then 2', 'se encoló al terminar «then 1»: va detrás de las que ya esperaban'],
  ['timeout A', 'primera TAREA, solo cuando la cola de microtareas está vacía'],
  ['microtarea creada en timeout A', 'las microtareas de una tarea van antes de la tarea siguiente'],
  ['timeout B', 'segunda tarea'],
];

setTimeout(() => {
  let hits = 0;
  PREDICTED.forEach(([label, rule], index) => {
    const ok = real[index] === label;
    if (ok) hits += 1;
    console.log(`${ok ? '✓' : '✗'} ${String(index + 1).padStart(2)}. ${real[index]}  ← ${ok ? rule : `esperaba «${label}»`}`);
  });
  console.log(`aciertos → ${hits} de ${PREDICTED.length}`);
}, 50);

// Cambia el programa (añade otro then, mueve el queueMicrotask, pon un
// await dentro de un then…) y ajusta PREDICTED hasta acertar todas.
```
