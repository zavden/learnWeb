---
example_description: "Solución: all, allSettled y any escritos con new Promise y then (contadores de pendientes, el primer rechazo o el primer éxito gana) y mapWithLimit con trabajadores que se reparten un índice"
example_tags: "javascript|solucion|promesas|promise-all|allsettled|any|concurrencia"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// SOLUCIÓN: los combinadores, a mano (solo new Promise, Promise.resolve y then).

function all(iterable) {
  return new Promise((resolve, reject) => {
    const promises = [...iterable].map((item) => Promise.resolve(item));
    const results = new Array(promises.length);
    let pending = promises.length;
    if (pending === 0) resolve(results);
    promises.forEach((promise, index) => {
      promise.then((value) => {
        results[index] = value; // en su sitio, no en el orden de llegada
        pending -= 1;
        if (pending === 0) resolve(results);
      }, reject); // el primer rechazo gana: una promesa solo se asienta una vez
    });
  });
}

function allSettled(iterable) {
  return all([...iterable].map((item) => Promise.resolve(item).then(
    (value) => ({ status: 'fulfilled', value }),
    (reason) => ({ status: 'rejected', reason }),
  )));
}

function any(iterable) {
  return new Promise((resolve, reject) => {
    const promises = [...iterable].map((item) => Promise.resolve(item));
    const errors = new Array(promises.length);
    let pending = promises.length;
    if (pending === 0) reject(new AggregateError(errors, 'All promises were rejected'));
    promises.forEach((promise, index) => {
      promise.then(resolve, (error) => { // el primer éxito gana
        errors[index] = error;
        pending -= 1;
        if (pending === 0) reject(new AggregateError(errors, 'All promises were rejected'));
      });
    });
  });
}

async function mapWithLimit(items, limit, fn) {
  const results = new Array(items.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await fn(items[index], index);
    }
  }
  await all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
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
