---
example_description: "Planificador de tareas con dependencias para desplegar una web: orden topológico recursivo con detección de ciclos, tiempos memoizados, camino crítico, tareas afectadas por un cambio y un diagrama de Gantt en texto"
example_tags: "javascript|profesional|recursion|grafos|memoizacion|closures"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// PLANIFICADOR DE TAREAS para desplegar una web: instalar dependencias, comprobar,
// compilar, probar y publicar. Cada tarea necesita que otras hayan terminado antes.
//
// Decisiones:
// - El grafo es un Map tarea → { duration (segundos), deps (tareas previas) }.
// - El orden de ejecución sale de un recorrido en profundidad RECURSIVO: una tarea entra
//   en la lista cuando ya han entrado todas sus dependencias (orden topológico).
// - La pila de la recursión se lleva también en un array (visiting): si una tarea vuelve
//   a aparecer mientras se visita, hay un ciclo, y ese array ES el ciclo.
// - Con paralelismo ilimitado, una tarea termina en duration + el máximo de lo que tardan
//   sus dependencias: una definición recursiva que se MEMOIZA (cada tarea, una vez).
// - El camino crítico (la cadena que marca la duración total) se reconstruye siguiendo,
//   desde el final, la dependencia que termina más tarde.
// - Las funciones de cálculo se fabrican para un grafo concreto: la caché es privada.
//
// Alcance: módulos 1-3 (recursión, memoización, closures, Map y Set).

const PIPELINE = new Map([
  ['install', { duration: 20, deps: [] }],
  ['lint', { duration: 6, deps: ['install'] }],
  ['typecheck', { duration: 9, deps: ['install'] }],
  ['test', { duration: 14, deps: ['install'] }],
  ['build-css', { duration: 5, deps: ['install'] }],
  ['build-js', { duration: 12, deps: ['typecheck'] }],
  ['images', { duration: 18, deps: [] }],
  ['bundle', { duration: 4, deps: ['build-css', 'build-js', 'images'] }],
  ['e2e', { duration: 25, deps: ['bundle'] }],
  ['deploy', { duration: 7, deps: ['lint', 'test', 'e2e'] }],
]);

// ── Orden topológico con detección de ciclos ────────────────────────────
function topologicalOrder(graph) {
  const done = new Set();
  const visiting = []; // copia de la pila de llamadas de visit
  const order = [];

  function visit(task) {
    if (done.has(task)) return;
    const loopStart = visiting.indexOf(task);
    if (loopStart !== -1) {
      throw new Error(`dependencia circular: ${[...visiting.slice(loopStart), task].join(' → ')}`);
    }
    if (!graph.has(task)) throw new Error(`«${visiting.at(-1)}» depende de «${task}», que no existe`);
    visiting.push(task);
    for (const dep of graph.get(task).deps) visit(dep); // primero, todo lo que necesita
    visiting.pop();
    done.add(task);
    order.push(task);
  }

  for (const task of graph.keys()) visit(task);
  return order;
}

// ── Tiempos memoizados y camino crítico ─────────────────────────────────
function makeScheduler(graph) {
  const finishCache = new Map();
  let computed = 0;

  const finish = (task) => {
    if (!finishCache.has(task)) {
      computed += 1;
      const { duration, deps } = graph.get(task);
      finishCache.set(task, duration + Math.max(0, ...deps.map((dep) => finish(dep))));
    }
    return finishCache.get(task);
  };
  const start = (task) => finish(task) - graph.get(task).duration;

  const criticalPath = (task) => {
    const { deps } = graph.get(task);
    if (deps.length === 0) return [task];
    const latest = deps.reduce((a, b) => (finish(b) > finish(a) ? b : a));
    return [...criticalPath(latest), task];
  };

  return { finish, start, criticalPath, computed: () => computed };
}

// ── Tareas que hay que repetir si cambia una ────────────────────────────
function affectedBy(graph, changedTask) {
  const affected = new Set();
  const visit = (task) => {
    for (const [other, { deps }] of graph) {
      if (deps.includes(task) && !affected.has(other)) {
        affected.add(other);
        visit(other); // y todo lo que depende de ella
      }
    }
  };
  visit(changedTask);
  return [...affected];
}

// ── Informe ─────────────────────────────────────────────────────────────
const order = topologicalOrder(PIPELINE);
console.log('orden →', order.join(' · '));

const plan = makeScheduler(PIPELINE);
const sequential = [...PIPELINE.values()].reduce((sum, { duration }) => sum + duration, 0);
const total = Math.max(...order.map((task) => plan.finish(task)));
console.log(`en serie: ${sequential} s · en paralelo: ${total} s (cálculos de finish: ${plan.computed()})`);
console.log('camino crítico →', plan.criticalPath('deploy').join(' → '));

console.log('▼ Gantt (1 carácter = 2 s)');
for (const task of order) {
  const offset = ' '.repeat(Math.round(plan.start(task) / 2));
  const bar = '█'.repeat(Math.max(1, Math.round(PIPELINE.get(task).duration / 2)));
  const range = `${plan.start(task)}–${plan.finish(task)} s`;
  console.log(`  ${task.padEnd(10)}│${offset}${bar} ${range}`);
}

console.log('si cambia build-css, repetir →', affectedBy(PIPELINE, 'build-css').join(', '));
console.log('si cambia images, repetir →', affectedBy(PIPELINE, 'images').join(', '));

// ── Grafos con errores ──────────────────────────────────────────────────
// Un ciclo: el despliegue espera a la prueba de humo, que espera al despliegue.
const withCycle = new Map([...PIPELINE, ['smoke', { duration: 3, deps: ['deploy'] }]]);
withCycle.set('deploy', { ...PIPELINE.get('deploy'), deps: [...PIPELINE.get('deploy').deps, 'smoke'] });
// Una errata en una dependencia.
const withTypo = new Map([...PIPELINE, ['docs', { duration: 8, deps: ['instal'] }]]);
for (const [label, graph] of [['ciclo', withCycle], ['errata', withTypo]]) {
  try {
    topologicalOrder(graph);
  } catch (error) {
    console.log(`⚠️ ${label} → ${error.message}`);
  }
}
console.log('¿el grafo original sigue intacto? →', PIPELINE.get('deploy').deps.join(', ')); // sin smoke
```
