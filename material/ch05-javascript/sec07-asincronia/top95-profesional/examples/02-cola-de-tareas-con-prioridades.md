---
example_description: "Una cola de tareas para el envío de emails: tres prioridades (FIFO dentro de cada una), un límite de concurrencia y un cubo de tokens que limita el ritmo de inicios; cada tarea devuelve su propia promesa (Promise.withResolvers) y onIdle() avisa cuando no queda nada"
example_tags: "javascript|profesional|async|cola|prioridades|concurrencia|rate-limit"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// LA COLA DE ENVÍOS DE EMAIL DE UNA TIENDA.
//
// Decisiones:
// - Tres prioridades: alta (restablecer contraseña), normal (confirmaciones
//   de pedido) y baja (boletín). Dentro de cada una, por orden de llegada.
// - Límite de concurrencia: como mucho 2 envíos en marcha.
// - Límite de ritmo con un CUBO DE TOKENS: caben 3 tokens; cada inicio gasta
//   uno y se recupera uno cada 50 ms. Permite una ráfaga corta al principio y
//   después un ritmo constante (el proveedor de correo cobra los excesos).
// - add() devuelve la promesa de ESA tarea (Promise.withResolvers): quien la
//   encola puede esperar su resultado o su error sin conocer la cola.
// - add() no arranca nada en el acto: programa el reparto en UNA microtarea,
//   así que todo lo que se encola en el mismo trozo de código compite por
//   prioridad (si no, la primera tarea añadida saldría antes que una alta
//   añadida una línea más abajo).
// - Cuando no hay tokens, UN solo temporizador espera a la próxima recarga.
// - La cola no reintenta: eso es cosa de la tarea (ejemplo «Capa HTTP»).
//
// Alcance: módulos 1-7.

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const PRIORITIES = ['alta', 'normal', 'baja'];

class TaskQueue {
  #queues = new Map(PRIORITIES.map((priority) => [priority, []]));
  #running = 0;
  #tokens;
  #lastRefill = performance.now();
  #refillTimer = null;
  #idleWaiters = [];
  #dispatchScheduled = false;
  #createdAt = performance.now();
  starts = []; // { label, at } para comprobar los límites

  constructor({ concurrency = 2, bucketSize = 3, refillMs = 50 } = {}) {
    Object.assign(this, { concurrency, bucketSize, refillMs });
    this.#tokens = bucketSize;
  }

  add(task, { priority = 'normal', label = task.name } = {}) {
    if (!this.#queues.has(priority)) throw new RangeError(`Prioridad desconocida: ${priority}`);
    const { promise, resolve, reject } = Promise.withResolvers();
    this.#queues.get(priority).push({ task, label, resolve, reject });
    if (!this.#dispatchScheduled) { // un solo reparto por trozo de código
      this.#dispatchScheduled = true;
      queueMicrotask(() => {
        this.#dispatchScheduled = false;
        this.#dispatch();
      });
    }
    return promise;
  }

  onIdle() {
    if (this.#isIdle()) return Promise.resolve();
    const { promise, resolve } = Promise.withResolvers();
    this.#idleWaiters.push(resolve);
    return promise;
  }

  get pending() {
    return [...this.#queues.values()].reduce((sum, queue) => sum + queue.length, 0);
  }

  #isIdle() {
    return this.#running === 0 && this.pending === 0;
  }

  #refill() {
    const now = performance.now();
    const earned = Math.floor((now - this.#lastRefill) / this.refillMs);
    if (earned > 0) {
      this.#tokens = Math.min(this.bucketSize, this.#tokens + earned);
      this.#lastRefill += earned * this.refillMs;
    }
  }

  #nextJob() {
    for (const priority of PRIORITIES) {
      const queue = this.#queues.get(priority);
      if (queue.length > 0) return queue.shift();
    }
    return null;
  }

  #dispatch() {
    this.#refill();
    while (this.#running < this.concurrency && this.pending > 0) {
      if (this.#tokens < 1) {
        if (this.#refillTimer === null) {
          const msToNextToken = this.#lastRefill + this.refillMs - performance.now();
          this.#refillTimer = setTimeout(() => {
            this.#refillTimer = null;
            this.#dispatch();
          }, Math.max(0, msToNextToken));
        }
        break;
      }
      this.#tokens -= 1;
      this.#run(this.#nextJob());
    }
    if (this.#isIdle()) for (const resolve of this.#idleWaiters.splice(0)) resolve();
  }

  async #run(job) {
    this.#running += 1;
    this.starts.push({ label: job.label, at: performance.now() - this.#createdAt, running: this.#running });
    try {
      job.resolve(await job.task());
    } catch (error) {
      job.reject(error);
    } finally {
      this.#running -= 1;
      this.#dispatch();
    }
  }
}

// ── El escenario ─────────────────────────────────────────────────────────
// settle: escucha la promesa EN EL ACTO (así su rechazo nunca queda sin manejar).
const settle = (promise) => promise.then(
  (value) => ({ status: 'fulfilled', value }),
  (reason) => ({ status: 'rejected', reason }),
);

async function sendEmail(to, subject) {
  await wait(30); // el proveedor tarda 30 ms por email
  if (!to.includes('.', to.indexOf('@'))) throw new Error(`dirección rechazada: ${to}`);
  return `📧 ${subject} → ${to}`;
}

const outbox = new TaskQueue({ concurrency: 2, bucketSize: 3, refillMs: 50 });
const jobs = [
  ['B1', 'baja', 'ana@example.com', 'Boletín de octubre'],
  ['N1', 'normal', 'luis@example.com', 'Pedido P-1042 confirmado'],
  ['A1', 'alta', 'sofia@example.com', 'Restablece tu contraseña'],
  ['B2', 'baja', 'ivan@example', 'Boletín de octubre'],
  ['N2', 'normal', 'elena@example.com', 'Pedido P-1043 confirmado'],
  ['A2', 'alta', 'jorge@example.com', 'Código de verificación'],
  ['N3', 'normal', 'marta@example.com', 'Pedido P-1044 enviado'],
  ['B3', 'baja', 'joel@example.com', 'Boletín de octubre'],
].map(([label, priority, to, subject]) => ({ label, outcome: settle(outbox.add(() => sendEmail(to, subject), { priority, label })) }));

// A los 70 ms llega una urgente: debe adelantar a todo lo que no haya empezado.
setTimeout(() => {
  jobs.push({ label: 'A3', outcome: settle(outbox.add(() => sendEmail('carla@example.com', 'Restablece tu contraseña'), { priority: 'alta', label: 'A3' })) });
}, 70);

async function main() {
  await wait(80); // A3 ya está en la cola
  await outbox.onIdle();
  const results = await Promise.all(jobs.map((job) => job.outcome));
  console.log('orden de inicio →', outbox.starts.map((start) => start.label).join(' '));
  results.forEach((result, index) => {
    console.log(`  ${jobs[index].label}: ${result.status === 'fulfilled' ? result.value : `⛔ ${result.reason.message}`}`);
  });

  const order = outbox.starts.map((start) => start.label);
  console.log('nunca más de 2 a la vez →', outbox.starts.every((start) => start.running <= 2));
  console.log('las altas iniciales, antes que ninguna normal o baja →', order.indexOf('A2') < order.indexOf('N1'));
  console.log('la urgente tardía adelantó a las que esperaban →', order.indexOf('A3') < order.indexOf('N3') && order.indexOf('A3') < order.indexOf('B1'));
  console.log('tras la ráfaga de 3, como mucho un inicio por recarga →', outbox.starts.every((start, i) => i < 3 || start.at >= (i - 2) * 50 - 1));
}
main();

// > Desde Python: asyncio.PriorityQueue para las prioridades, un
//   asyncio.Semaphore(2) para la concurrencia y, para el ritmo, una librería
//   como aiolimiter, que también es un cubo de tokens.
```
