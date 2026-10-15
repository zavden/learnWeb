---
example_description: "Ejercicio: escribe a mano los combinadores all, allSettled y any (con new Promise y then, sin usar los de Promise) y un mapWithLimit que respete el límite de concurrencia y el orden de entrada"
example_tags: "javascript|ejercicio|promesas|promise-all|allsettled|any|concurrencia"
exercise: true
exercise_title: "Combinadores a mano"
exercise_instructions: "all(iterable) se cumple con un array de valores en el orden de entrada cuando se cumplen todos, se rechaza con el PRIMER rechazo, acepta valores que no son promesas y con una lista vacía se cumple al instante con [] || allSettled(iterable) nunca se rechaza: se cumple con un objeto { status: 'fulfilled', value } o { status: 'rejected', reason } por elemento, en el orden de entrada || any(iterable) se cumple con el primer éxito; si fallan todos (o la lista está vacía) se rechaza con un AggregateError cuyo array errors sigue el orden de entrada || mapWithLimit(items, limit, fn) llama a fn(item, index) con como mucho limit llamadas en marcha a la vez y se cumple con los resultados en el orden de entrada || No uses Promise.all, Promise.allSettled ni Promise.any: solo new Promise, Promise.resolve y then || Ejecuta hasta que todas las comprobaciones salgan ✓ (tres ya salen ✓ y deben seguir así)"
exercise_hints: "Convierte primero el iterable en array con [...iterable] y envuelve cada elemento con Promise.resolve(x): así los valores normales también tienen then || En all, lleva un contador de pendientes: cada then guarda su valor en results[index] y, cuando el contador llega a 0, resuelve; el primer reject gana porque una promesa solo se asienta una vez || allSettled es un all cuyos elementos nunca fallan: transforma cada promesa con then(value => ({ status: 'fulfilled', value }), reason => ({ status: 'rejected', reason })) || any es el espejo de all: cuenta los fallos y rechaza con new AggregateError(errors, 'All promises were rejected') cuando fallan todos || mapWithLimit: crea limit trabajadores async que, en un while, toman el siguiente índice libre (nextIndex++) y esperan su fn; al final, espera a todos los trabajadores con tu all"
exercise_solution_example: 10-ej-combinadores-a-mano-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
// EJERCICIO: los combinadores, a mano. Sin Promise.all, allSettled ni any:
// solo new Promise, Promise.resolve y then.

// TODO 1: todas; falla con el primer rechazo; orden de entrada.
function all(iterable) {
  return Promise.resolve([]); // provisional
}

// TODO 2: un informe { status, value | reason } por elemento; nunca se rechaza.
function allSettled(iterable) {
  return Promise.resolve([]); // provisional
}

// TODO 3: el primer éxito; si fallan todas, AggregateError con los errores en orden.
function any(iterable) {
  return Promise.reject(new AggregateError([], 'any sin hacer')); // provisional
}

// TODO 4: como mucho `limit` llamadas a fn a la vez; resultados en orden de entrada.
async function mapWithLimit(items, limit, fn) {
  return []; // provisional
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
async function check(description, compute, expected) {
  let actual;
  try {
    const limit = new Promise((resolve) => setTimeout(resolve, 400, '⏰ no terminó en 400 ms'));
    actual = await Promise.race([compute(), limit]);
  } catch (error) {
    actual = `${error.name}: ${error.message}`;
  }
  if (actual === expected) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}
const wait = (ms, value) => new Promise((resolve) => setTimeout(resolve, ms, value));
function failAfter(ms, message) {
  const promise = new Promise((_, reject) => setTimeout(reject, ms, new Error(message)));
  promise.catch(() => {}); // solo evita avisos «Uncaught (in promise)» mientras el ejercicio está a medias
  return promise;
}
const describe = async (promise) => {
  try {
    return `cumplida: ${JSON.stringify(await promise)}`;
  } catch (error) {
    const extra = error instanceof AggregateError ? ` [${error.errors.map((e) => e.message).join(', ')}]` : '';
    return `rechazada: ${error.name}: ${error.message}${extra}`;
  }
};

async function runChecks() {
  await check('all: valores en el orden de entrada', () => describe(all([wait(30, 'stock'), wait(10, 'precio'), wait(20, 'envío')])),
    'cumplida: ["stock","precio","envío"]');
  await check('all: los valores normales pasan tal cual', () => describe(all(new Set([1, wait(10, 'x'), 3]))), 'cumplida: [1,"x",3]');
  await check('all([]) se cumple con []', () => describe(all([])), 'cumplida: []');
  await check('all: falla con el primer rechazo, sin esperar a la lenta', async () => {
    let slowFinished = false;
    const slow = wait(150).then(() => { slowFinished = true; });
    const outcome = await describe(all([slow, failAfter(20, 'pasarela caída')]));
    return `${outcome} · ¿la lenta ya había terminado? ${slowFinished}`;
  }, 'rechazada: Error: pasarela caída · ¿la lenta ya había terminado? false');
  await check('allSettled: un informe por elemento', async () => {
    const report = await allSettled([wait(10, 'subida'), failAfter(5, '413'), 'sin espera']);
    return JSON.stringify(report.map((r) => (r.status === 'fulfilled' ? r.value : `✗ ${r.reason.message}`)));
  }, '["subida","✗ 413","sin espera"]');
  await check('allSettled: nunca se rechaza', async () => {
    const report = await allSettled([failAfter(5, 'a'), failAfter(10, 'b')]);
    return report.map((r) => r.status).join(',');
  }, 'rejected,rejected');
  await check('any: el primer éxito, ignorando fallos', () => describe(any([wait(40, 'CDMX'), failAfter(5, 'Monterrey caído'), wait(20, 'Guadalajara')])),
    'cumplida: "Guadalajara"');
  await check('any: si fallan todas, AggregateError en orden de entrada', () => describe(any([failAfter(30, 'Mérida caído'), failAfter(10, 'Monterrey caído')])),
    'rechazada: AggregateError: All promises were rejected [Mérida caído, Monterrey caído]');
  await check('any([]) se rechaza con AggregateError', async () => (await describe(any([]))).split(':').slice(0, 2).join(':'), 'rechazada: AggregateError');
  await check('mapWithLimit: resultados en el orden de entrada', () => describe(mapWithLimit(['A', 'B', 'C', 'D', 'E'], 2, (code, i) => wait(50 - i * 10, `${code}${i + 1}`))),
    'cumplida: ["A1","B2","C3","D4","E5"]');
  await check('mapWithLimit: nunca más de 2 a la vez', async () => {
    let running = 0;
    let max = 0;
    await mapWithLimit([30, 10, 20, 10, 30, 10], 2, async (ms) => {
      running += 1;
      max = Math.max(max, running);
      await wait(ms);
      running -= 1;
    });
    return `máximo a la vez: ${max}`;
  }, 'máximo a la vez: 2');
  await check('mapWithLimit con una lista vacía', () => describe(mapWithLimit([], 3, () => wait(10))), 'cumplida: []');
}
runChecks();
```
