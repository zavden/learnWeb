---
example_description: "Una cola de trabajos con prioridades sobre un pool de dos workers: los urgentes se adelantan a los que esperan, cada trabajo informa de su progreso, se puede cancelar en cola, en espera de reintento o en marcha, y los que fallan se reintentan con espera exponencial hasta tres veces"
example_tags: "javascript|workers|cola|prioridades|reintentos|backoff|cancelacion|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>Exportaciones de la tienda</h1>
  <p class="intro">Dos trabajos a la vez. Los de prioridad alta se adelantan a los que esperan; los que fallan se reintentan (hasta 3 intentos), esperando cada vez el doble.</p>
  <div class="buttons">
    <button id="start" type="button">Empezar</button>
    <button id="urgent" type="button">Añadir uno urgente</button>
    <button id="cancel-all" type="button">Cancelar todo</button>
  </div>
  <ol id="jobs" class="jobs"></ol>
  <p id="summary" class="summary" role="status"></p>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; --high-bg: #fee2e2; --high-ink: #991b1b; --low-bg: #e2e8f0; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.app { max-width: 36rem; margin: 0 auto; padding: 1rem; display: grid; gap: 0.75rem; }
h1 { margin: 0; font-size: 1.25rem; }
.intro { margin: 0; color: var(--muted); font-size: 0.9rem; }
.buttons { display: flex; flex-wrap: wrap; gap: 0.4rem; }
button { font: inherit; color: var(--ink); padding: 0.3rem 0.65rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: 0.6; }
button:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.jobs { margin: 0; padding: 0; list-style: none; display: grid; gap: 0.4rem; }
.job { display: grid; grid-template-columns: 1fr auto; gap: 0.2rem 0.75rem; align-items: center; padding: 0.5rem 0.75rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); }
.job progress { grid-column: 1 / -1; inline-size: 100%; }
.job .name { font-weight: 600; }
.badge { margin-inline-start: 0.4rem; padding: 0 0.4rem; border-radius: 1rem; background: var(--low-bg); font-size: 0.75rem; font-weight: 400; }
.badge.alta { background: var(--high-bg); color: var(--high-ink); }
.job .state { color: var(--muted); font-size: 0.85rem; }
.summary { margin: 0; font-weight: 600; }
.log { margin: 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-size: 0.8rem; }
```

# JavaScript

```javascript
// COLA DE TRABAJOS CON PRIORIDADES, CANCELACIÓN Y REINTENTOS
//
// Decisiones de diseño:
// - Un pool fijo de 2 workers (06-queue/job-worker.js). La cola se ordena por prioridad
//   (alta, normal, baja) y, dentro de cada una, por orden de llegada.
// - Estados de un trabajo: en cola → en marcha → hecho; o falló → esperando reintento →
//   en cola…; o cancelado. Solo la página cambia los estados: el worker informa.
// - Reintentos con espera exponencial (300 ms, 600 ms): un servicio que falla por
//   saturación necesita aire, no una lluvia de reintentos. Máximo 3 intentos.
// - Cancelar depende del estado: en cola o esperando reintento, la página lo quita;
//   en marcha, envía { type: 'cancel' } y el worker para en el siguiente paso.
// - La consola no imprime en orden de llegada (que cambia): al terminar todo, un resumen
//   y una línea por trabajo, en el orden en que se crearon.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM y los eventos del capítulo 6,
// y este módulo.
const MAX_ATTEMPTS = 3;
const PRIORITY = { alta: 0, normal: 1, baja: 2 };
const $ = (selector) => document.querySelector(selector);
function report(text) {
  console.log(text);
  $('#log').append(Object.assign(document.createElement('li'), { textContent: text }));
}

const BATCH = [
  { name: 'Facturas de octubre (PDF)', priority: 'alta', steps: 6, failsOn: { attempts: [1], step: 3, message: 'el servidor de facturas no respondió' } },
  { name: 'Inventario de la bodega (CSV)', priority: 'normal', steps: 4 },
  { name: 'Catálogo de temporada (PDF)', priority: 'normal', steps: 8 },
  { name: 'Reporte de ventas por estado', priority: 'normal', steps: 5, failsOn: { attempts: [1, 2], step: 2, message: 'la base de datos estaba ocupada' } },
  { name: 'Respaldo de pedidos', priority: 'baja', steps: 6, failsOn: { attempts: [1, 2, 3], step: 4, message: 'no hay espacio en el disco de respaldo' } },
  { name: 'Fotos del catálogo (ZIP)', priority: 'baja', steps: 7 },
];

const jobs = new Map(); // id → estado del trabajo
let queue = [];         // ids en espera, ya ordenados
let nextId = 1;
let started = false;
let retries = 0;

const workers = Array.from({ length: 2 }, () => {
  const worker = new Worker('06-queue/job-worker.js', { type: 'module' });
  worker.jobId = null; // qué trabajo lleva ahora
  worker.onmessage = (event) => handle(worker, event.data);
  return worker;
});
addEventListener('pagehide', () => workers.forEach((worker) => worker.terminate()));

function createJob(spec) {
  const job = { ...spec, id: nextId++, stepMs: 120, status: 'en cola', attempt: 0, progress: 0, note: '', timer: 0, cancelRequested: false };
  job.element = document.createElement('li');
  job.element.className = 'job';
  job.element.innerHTML = '<span class="name"></span><button type="button">Cancelar</button><span class="state"></span><progress max="1" value="0"></progress>';
  job.element.querySelector('.name').append(job.name, Object.assign(document.createElement('span'), { className: `badge ${job.priority}`, textContent: job.priority }));
  job.element.querySelector('progress').setAttribute('aria-label', `Progreso de ${job.name}`);
  job.element.querySelector('button').addEventListener('click', () => cancel(job));
  $('#jobs').append(job.element);
  jobs.set(job.id, job);
  enqueue(job);
  return job;
}
function render(job) {
  job.element.querySelector('.state').textContent = job.note || job.status;
  job.element.querySelector('progress').value = job.progress;
  job.element.querySelector('button').disabled = ['hecho', 'falló', 'cancelado'].includes(job.status);
}
function enqueue(job) {
  job.status = 'en cola';
  job.note = '';
  queue.push(job.id);
  queue.sort((a, b) => PRIORITY[jobs.get(a).priority] - PRIORITY[jobs.get(b).priority] || a - b);
  render(job);
  pump();
}
function pump() {
  if (!started) return;
  for (const worker of workers) {
    if (worker.jobId !== null || queue.length === 0) continue;
    const job = jobs.get(queue.shift());
    worker.jobId = job.id;
    job.status = 'en marcha';
    job.attempt += 1;
    job.note = job.attempt > 1 ? `en marcha (intento ${job.attempt} de ${MAX_ATTEMPTS})` : '';
    job.progress = 0;
    render(job);
    const { id, steps, stepMs, failsOn } = job;
    worker.postMessage({ type: 'run', job: { id, steps, stepMs, failsOn }, attempt: job.attempt });
  }
  checkFinished();
}

function handle(worker, message) {
  const job = jobs.get(message.id);
  if (message.type === 'progress') {
    job.progress = message.step / message.steps;
    render(job);
    return;
  }
  worker.jobId = null; // libre para el siguiente
  if (message.type === 'done') {
    job.status = 'hecho';
    job.note = job.attempt > 1 ? `hecho al intento ${job.attempt}` : '';
    job.progress = 1;
  } else if (message.type === 'cancelled' || job.cancelRequested) {
    job.status = 'cancelado'; // también si falló justo cuando se pedía cancelarlo
    job.note = '';
  } else if (job.attempt < MAX_ATTEMPTS) {
    const delay = 300 * 2 ** (job.attempt - 1); // 300 ms, 600 ms
    retries += 1;
    job.status = 'esperando reintento';
    job.note = `falló (${message.message}); reintento en ${delay / 1000} s`;
    job.timer = setTimeout(() => enqueue(job), delay);
  } else {
    job.status = 'falló';
    job.note = `falló ${MAX_ATTEMPTS} veces: ${message.message}`;
  }
  render(job);
  pump();
}

function cancel(job) {
  if (job.status === 'en cola') {
    queue = queue.filter((id) => id !== job.id);
  } else if (job.status === 'esperando reintento') {
    clearTimeout(job.timer);
  } else if (job.status === 'en marcha') {
    workers.find((worker) => worker.jobId === job.id)?.postMessage({ type: 'cancel' });
    job.cancelRequested = true;
    job.note = 'cancelando…';
    render(job);
    return; // el worker confirmará con 'cancelled'
  } else {
    return;
  }
  job.status = 'cancelado';
  job.note = '';
  render(job);
  checkFinished();
}

let finishedReported = false;
function checkFinished() {
  const all = [...jobs.values()];
  if (!started || finishedReported || all.some((job) => !['hecho', 'falló', 'cancelado'].includes(job.status))) return;
  finishedReported = true;
  const count = (status) => all.filter((job) => job.status === status).length;
  const text = `📊 ${all.length} de ${all.length} terminados: ✅ ${count('hecho')} hechos · ❌ ${count('falló')} falló · ⏹ ${count('cancelado')} cancelados · 🔁 ${retries} reintentos`;
  $('#summary').textContent = text;
  report(text);
  for (const job of all) report(`   #${job.id} ${job.name} → ${job.note || job.status}`);
  $('#start').disabled = true;
}

$('#start').addEventListener('click', () => {
  started = true;
  $('#start').disabled = true;
  report('▶ en marcha: 2 trabajos a la vez');
  pump();
});
$('#urgent').addEventListener('click', () => {
  const job = createJob({ name: 'Devolución urgente (PDF)', priority: 'alta', steps: 3 });
  finishedReported = false;
  report(`➕ #${job.id} ${job.name}: se pone delante de los que esperan`);
});
$('#cancel-all').addEventListener('click', () => [...jobs.values()].forEach(cancel));

// Al cargar: el lote en la cola (nada se ejecuta hasta pulsar «Empezar»).
BATCH.forEach(createJob);
report(`📋 ${jobs.size} trabajos en cola, en este orden: ${queue.map((id) => `${jobs.get(id).name.split(' (')[0]} (${jobs.get(id).priority})`).join(' · ')}`);
report('Listo: pulsa «Empezar»; mientras tanto, «Añadir uno urgente» o el «Cancelar» de algún trabajo');
```
