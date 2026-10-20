---
example_description: "Ejercicio: añade cancelación con AbortSignal a un pool de workers: una señal ya abortada rechaza sin crear workers, abortar a mitad rechaza con su motivo (AbortError o TimeoutError), cierra todos los workers y no empieza ningún trabajo más"
example_tags: "javascript|workers|pool|abortsignal|cancelacion|terminate|ejercicio"
exercise: true
exercise_title: "Cancelar un pool"
exercise_instructions: "runPool reparte trabajos entre varios workers y ya funciona sin señal (la primera comprobación sale ✅) || TODO 1: al principio de runPool, si signal ya está abortada, devuelve Promise.reject(signal.reason) sin crear ningún worker || TODO 2: dentro de la promesa, escucha el evento abort de la señal: vacía la cola (queue.length = 0), cierra cada worker con kill y rechaza con signal.reason || TODO 3: en worker.onmessage, si la señal ya está abortada, no hagas nada (puede llegar una respuesta justo después de abortar) || Ejecuta hasta que las seis comprobaciones salgan ✅"
exercise_hints: "signal es opcional: usa signal?.aborted y signal?.addEventListener(…) || El motivo está en signal.reason: un AbortError tras controller.abort() y un TimeoutError con AbortSignal.timeout(ms) || kill ya lleva la cuenta de los workers vivos y no pasa nada si lo llamas dos veces con el mismo worker"
exercise_solution_example: 09-ej-cancelar-un-pool-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Cancelar un pool</h1>
  <p>Ocho trabajos de 40 ms (simulados con un temporizador: no gastan CPU) para dos workers.</p>
  <p><output id="status" aria-live="polite">Comprobando…</output></p>
  <p class="note">Las comprobaciones del ejercicio están en la consola.</p>
</main>

<script type="text/js-worker" id="worker-code">
// EL CÓDIGO DEL WORKER: un trabajo que tarda job.ms y devuelve el doble de su valor.
self.onmessage = async (event) => {
  const { index, ms, value } = event.data;
  await new Promise((resolve) => setTimeout(resolve, ms));
  self.postMessage({ index, result: value * 2 });
};
</script>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 28rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.5rem; }
output { font-weight: 600; }
.note { color: #475569; font-size: 0.85rem; }
```

# JavaScript

```javascript
const code = document.querySelector('#worker-code').textContent;
const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
addEventListener('pagehide', () => URL.revokeObjectURL(url)); // se crean varios: la URL se libera al final

// Contadores para las comprobaciones: workers creados, vivos y trabajos empezados.
const counts = { created: 0, alive: 0, started: 0 };
const killed = new WeakSet();
function spawn() {
  counts.created += 1;
  counts.alive += 1;
  return new Worker(url);
}
function kill(worker) {
  if (killed.has(worker)) return; // dos veces el mismo: no pasa nada
  killed.add(worker);
  counts.alive -= 1;
  worker.terminate();
}
function send(worker, job) {
  counts.started += 1;
  worker.postMessage(job);
}

function runPool(jobs, { size = 2, signal } = {}) {
  // TODO 1: una señal ya abortada → Promise.reject(signal.reason), sin crear workers.

  return new Promise((resolve, reject) => {
    const queue = jobs.map((job, index) => ({ ...job, index }));
    const results = new Array(jobs.length);
    let finished = 0;
    const workers = Array.from({ length: Math.min(size, jobs.length) }, spawn);
    const giveWork = (worker) => {
      const job = queue.shift();
      if (job) send(worker, job);
    };

    // TODO 2: al abortar: vacía la cola, cierra todos los workers con kill y rechaza con signal.reason.

    for (const worker of workers) {
      worker.onmessage = (event) => {
        // TODO 3: si la señal ya está abortada, no hagas nada.
        results[event.data.index] = event.data.result;
        finished += 1;
        if (finished === jobs.length) {
          workers.forEach(kill);
          resolve(results);
        } else {
          giveWork(worker);
        }
      };
      giveWork(worker);
    }
  });
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
const JOBS = Array.from({ length: 8 }, (_, i) => ({ ms: 40, value: i + 1 }));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const outcome = (promise) => promise.then(() => 'terminó', (error) => error.name);
async function check(description, run, expected) {
  let actual;
  try {
    actual = JSON.stringify(await run());
  } catch (error) {
    actual = JSON.stringify(`${error.name}: ${error.message}`);
  }
  if (actual === JSON.stringify(expected)) console.log('✅', description);
  else console.error('❌', description, '→ esperaba', JSON.stringify(expected), 'y obtuve', actual);
}

await check('sin señal, el pool termina y devuelve los resultados en orden', () => runPool(JOBS), [2, 4, 6, 8, 10, 12, 14, 16]);
await check('abortar a los 50 ms rechaza con AbortError y no deja workers vivos', async () => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 50);
  const name = await outcome(runPool(JOBS, { signal: controller.signal }));
  return [name, counts.alive];
}, ['AbortError', 0]);
await check('después de abortar no empieza ningún trabajo más', async () => {
  const controller = new AbortController();
  let startedAtAbort = 0;
  setTimeout(() => { startedAtAbort = counts.started; controller.abort(); }, 50);
  await outcome(runPool(JOBS, { signal: controller.signal }));
  await sleep(250); // tiempo de sobra para que un pool sin cancelar terminara
  return counts.started === startedAtAbort;
}, true);
await check('una señal ya abortada rechaza sin crear workers', async () => {
  const before = counts.created;
  const name = await outcome(runPool(JOBS, { signal: AbortSignal.abort() }));
  return [name, counts.created - before];
}, ['AbortError', 0]);
await check('con AbortSignal.timeout(60), rechaza con TimeoutError', () => outcome(runPool(JOBS, { signal: AbortSignal.timeout(60) })), 'TimeoutError');
await sleep(250);
await check('al final, ningún worker sigue vivo', async () => counts.alive, 0);
document.querySelector('#status').textContent = `Workers creados: ${counts.created} · vivos: ${counts.alive}`;
```
