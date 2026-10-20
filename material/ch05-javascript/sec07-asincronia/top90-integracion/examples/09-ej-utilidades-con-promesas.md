---
example_description: "Ejercicio: escribe las cuatro utilidades asíncronas de todo proyecto: wait cancelable con una señal, withTimeout con AbortSignal.timeout, retry que solo reintenta los errores transitorios, y promisify para APIs con callbacks «error primero»"
example_tags: "javascript|ejercicio|promesas|abortsignal|reintentos|promisificar"
exercise: true
exercise_title: "Utilidades con promesas"
exercise_instructions: "wait(ms, { signal }) se cumple pasados ms milisegundos; si la señal ya está cancelada se rechaza al momento con signal.reason, y si se cancela durante la espera, limpia su temporizador y se rechaza con signal.reason || withTimeout(task, ms) llama a task(signal) con una señal que se cancela sola a los ms milisegundos (AbortSignal.timeout) y devuelve lo que devuelva task || retry(task, { retries, delayMs }) llama a task(intento) empezando por 1; si lanza un error con retryable === true y quedan reintentos, espera delayMs y vuelve a intentarlo; si el error no es transitorio o se acabaron los reintentos, lo relanza || promisify(fn) devuelve una función que llama a fn con los mismos argumentos más un callback (error, resultado) y devuelve una promesa que se rechaza con el error o se cumple con el resultado || Ejecuta hasta que todas las comprobaciones salgan ✓ (tres ya salen ✓ y deben seguir así)"
exercise_hints: "En wait, empieza con signal?.throwIfAborted() dentro del ejecutor de new Promise: un throw ahí rechaza la promesa || Para enterarte de la cancelación: signal?.addEventListener('abort', () => { clearTimeout(id); reject(signal.reason); }, { once: true }) || withTimeout cabe en una línea: return task(AbortSignal.timeout(ms)) || En retry, un for (let attempt = 1; ; attempt++) con return await task(attempt) dentro de un try; sin el await, el catch no vería el rechazo || En promisify: (...args) => new Promise((resolve, reject) => fn(...args, (error, result) => …))"
exercise_solution_example: 09-ej-utilidades-con-promesas-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
// EJERCICIO: cuatro utilidades que usarás en cualquier proyecto con promesas.
// Completa cada TODO hasta que todo salga ✓.

// TODO 1: cancelable con { signal } (antes de empezar y durante la espera).
function wait(ms, { signal } = {}) {
  return new Promise((resolve) => setTimeout(resolve, ms)); // provisional: no se deja cancelar
}

// TODO 2: llama a task(signal) con una señal que se cancele sola a los ms.
function withTimeout(task, ms) {
  return task(undefined); // provisional: sin plazo
}

// TODO 3: reintenta los errores con retryable === true, esperando delayMs.
async function retry(task, { retries = 2, delayMs = 10 } = {}) {
  return task(1); // provisional: un solo intento
}

// TODO 4: de callback «error primero» a promesa.
function promisify(fn) {
  return () => Promise.reject(new Error('promisify sin hacer')); // provisional
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
const rejectionOf = async (promise) => {
  try {
    await promise;
    return 'no se rechazó';
  } catch (error) {
    return `${error.name}: ${error.message}`;
  }
};
class MailError extends Error {
  constructor(message, retryable) {
    super(message);
    this.name = 'MailError';
    this.retryable = retryable;
  }
}
function getOrderWithCallback(id, callback) { // una API antigua, con callback
  setTimeout(() => {
    if (id === 'P-501') callback(null, 'Sofía Ríos');
    else callback(new Error(`Pedido ${id} no encontrado`));
  }, 10);
}

async function runChecks() {
  await check('wait(30) se cumple', async () => {
    await wait(30);
    return 'cumplida';
  }, 'cumplida');
  await check('wait con una señal ya cancelada se rechaza al momento', () => {
    const controller = new AbortController();
    controller.abort(new Error('cancelada antes de empezar'));
    return rejectionOf(wait(200, { signal: controller.signal }));
  }, 'Error: cancelada antes de empezar');
  await check('wait se cancela a mitad', () => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(new Error('el cliente se fue')), 20);
    return rejectionOf(wait(200, { signal: controller.signal }));
  }, 'Error: el cliente se fue');
  await check('withTimeout: una tarea rápida devuelve su valor', () => withTimeout(() => wait(20).then(() => 'PDF listo'), 100), 'PDF listo');
  await check('withTimeout: una tarea lenta se rechaza con TimeoutError', async () => {
    const message = await rejectionOf(withTimeout((signal) => wait(200, { signal }), 50));
    return message.split(':')[0];
  }, 'TimeoutError');
  await check('withTimeout: la tarea recibe una AbortSignal', () => withTimeout(async (signal) => signal instanceof AbortSignal, 50), true);
  await check('retry: el tercer intento funciona', () => retry(async (attempt) => {
    if (attempt < 3) throw new MailError('503 servicio no disponible', true);
    return `enviado en el intento ${attempt}`;
  }), 'enviado en el intento 3');
  await check('retry: un error definitivo no se reintenta', async () => {
    let attempts = 0;
    await rejectionOf(retry(async () => {
      attempts += 1;
      throw new MailError('550 dirección rechazada', false);
    }));
    return `${attempts} intento(s)`;
  }, '1 intento(s)');
  await check('retry: se rinde tras retries + 1 intentos', async () => {
    let attempts = 0;
    const message = await rejectionOf(retry(async () => {
      attempts += 1;
      throw new MailError('503 servicio no disponible', true);
    }, { retries: 2, delayMs: 5 }));
    return `${attempts} intento(s) · ${message}`;
  }, '3 intento(s) · MailError: 503 servicio no disponible');
  const getOrder = promisify(getOrderWithCallback);
  await check('promisify: éxito', () => getOrder('P-501'), 'Sofía Ríos');
  await check('promisify: error', () => rejectionOf(getOrder('P-999')), 'Error: Pedido P-999 no encontrado');
}
runChecks();
```
