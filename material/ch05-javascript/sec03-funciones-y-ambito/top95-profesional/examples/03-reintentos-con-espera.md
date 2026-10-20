---
example_description: "Reintentos con espera exponencial y jitter, un cortacircuitos y un planificador simulado: envío de emails a un proveedor caído, con azar con semilla para que la salida sea siempre la misma"
example_tags: "javascript|profesional|reintentos|closures|orden-superior|simulacion"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// REINTENTOS CON ESPERA EXPONENCIAL para los emails de confirmación de una tienda,
// cuando el proveedor de correo está caído. El tiempo es SIMULADO.
//
// Decisiones:
// - Sin promesas (llegan en el módulo «Asincronía y event loop»): cada intento es una
//   llamada síncrona que devuelve o lanza, y un planificador simulado decide CUÁNDO
//   se ejecuta. En una página real, ese papel lo haría setTimeout.
// - Espera exponencial con tope: base × factor^(intento − 1), como mucho maxMs, ±20 %
//   de «jitter» para que miles de clientes no reintenten todos a la vez.
// - El azar sale de un generador con SEMILLA (Lehmer / Park-Miller): la salida es
//   idéntica en cada ejecución y en cada navegador.
// - Solo se reintentan los errores TRANSITORIOS (error.retryable): una dirección mal
//   escrita no se arregla insistiendo.
// - Un cortacircuitos deja de llamar al proveedor tras 3 fallos seguidos y vuelve a
//   probar con UNA llamada pasados 4 s (cerrado → abierto → semiabierto → cerrado).
// - Todo el estado vive en closures; las piezas se configuran con objetos de opciones.
//
// Alcance: módulos 1-3 (closures, orden superior, objeto de opciones, try/catch).

// ── Planificador simulado ───────────────────────────────────────────────
function createScheduler() {
  let now = 0;
  let nextId = 1;
  let queue = [];
  return {
    now: () => now,
    schedule: (delayMs, task) => {
      queue = [...queue, { id: nextId++, time: now + delayMs, task }];
    },
    runAll: () => {
      while (queue.length > 0) {
        // la tarea más temprana (y, si empatan, la programada antes)
        const next = queue.reduce((a, b) => (b.time < a.time || (b.time === a.time && b.id < a.id) ? b : a));
        queue = queue.filter((item) => item !== next);
        now = next.time;
        next.task();
      }
    },
  };
}

// ── Azar reproducible: generador de Lehmer (enteros exactos, sin decimales) ──
function createRandom(seed) {
  let state = seed % 2147483647;
  return () => {
    state = (state * 16807) % 2147483647; // el producto cabe de sobra en un entero seguro
    return (state - 1) / 2147483646;      // número en [0, 1)
  };
}

// ── Errores ─────────────────────────────────────────────────────────────
function mailError(code, message, retryable) {
  const error = new Error(`${code} ${message}`);
  error.retryable = retryable;
  return error;
}

// ── Cortacircuitos ──────────────────────────────────────────────────────
function createCircuitBreaker(fn, { failureThreshold = 3, cooldownMs = 4000, now, onChange = () => {} }) {
  let state = 'cerrado';
  let failures = 0;
  let openedAt = 0;
  const moveTo = (next) => {
    if (next !== state) onChange(state, next);
    state = next;
  };
  return (...args) => {
    if (state === 'abierto') {
      if (now() - openedAt < cooldownMs) throw mailError('⚡', 'circuito abierto: ni se intenta', true);
      moveTo('semiabierto'); // pasado el descanso, se permite UNA prueba
    }
    try {
      const result = fn(...args);
      failures = 0;
      moveTo('cerrado');
      return result;
    } catch (error) {
      if (error.retryable) {
        failures += 1;
        if (state === 'semiabierto' || failures >= failureThreshold) {
          openedAt = now();
          moveTo('abierto');
        }
      }
      throw error;
    }
  };
}

// ── Reintentos ──────────────────────────────────────────────────────────
function retryWithBackoff(task, {
  scheduler, random, retries = 5, baseMs = 500, factor = 2, maxMs = 8000, jitterRatio = 0.2,
  onAttempt = () => {}, onDone = () => {},
}) {
  let attempt = 0;
  const delayFor = (n) => {
    const exponential = Math.min(maxMs, baseMs * factor ** (n - 1));
    return Math.round(exponential * (1 + jitterRatio * (random() * 2 - 1)));
  };
  const run = () => {
    attempt += 1;
    try {
      const result = task();
      onAttempt({ attempt, ok: true });
      onDone({ ok: true, result, attempts: attempt, time: scheduler.now() });
    } catch (error) {
      const retry = error.retryable === true && attempt <= retries;
      const delay = retry ? delayFor(attempt) : null;
      onAttempt({ attempt, ok: false, error, delay });
      if (retry) scheduler.schedule(delay, run);
      else onDone({ ok: false, error, attempts: attempt, time: scheduler.now() });
    }
  };
  scheduler.schedule(0, run);
}

// ── El escenario ────────────────────────────────────────────────────────
const timeline = createScheduler(); // (no lo llamamos scheduler: window.scheduler ya existe en Chrome)
const random = createRandom(2026);
const OUTAGE_UNTIL = 5000; // el proveedor está caído los primeros 5 segundos
const time = () => String(timeline.now()).padStart(5);

// El «proveedor de correo»: rechaza al momento las direcciones sin dominio (error
// definitivo) y, mientras dura la caída, responde 503 a todo lo demás (transitorio).
function sendViaProvider(to, subject) {
  if (!to.includes('.', to.indexOf('@'))) throw mailError(550, `dirección rechazada: ${to}`, false);
  if (timeline.now() < OUTAGE_UNTIL) throw mailError(503, 'servicio no disponible', true);
  return `msg-${to.slice(0, to.indexOf('@'))}-${timeline.now()}`;
}

const sendMail = createCircuitBreaker(sendViaProvider, {
  now: timeline.now,
  onChange: (from, to) => console.log(`t=${time()} ⚡ cortacircuitos: ${from} → ${to}`),
});

const jobs = [
  { to: 'ana@example.com', subject: 'Pedido P-1042 confirmado' },
  { to: 'luis@example.com', subject: 'Pedido P-1043 confirmado' },
  { to: 'pedro@example', subject: 'Pedido P-1044 confirmado' },
  { to: 'sara@example.com', subject: 'Pedido P-1045 confirmado', retries: 2 },
];
const results = new Map();

for (const { to, subject, retries } of jobs) {
  retryWithBackoff(() => sendMail(to, subject), {
    scheduler: timeline,
    random,
    ...(retries === undefined ? {} : { retries }), // si el trabajo no dice nada, vale el default
    onAttempt: ({ attempt, ok, error, delay }) => {
      const outcome = ok ? '✓ enviado'
        : `✗ ${error.message}${delay === null ? ' · no se reintenta' : ` · reintento en ${delay} ms`}`;
      console.log(`t=${time()} ${to.padEnd(17)} intento ${attempt}: ${outcome}`);
    },
    onDone: (summary) => results.set(to, summary),
  });
}

timeline.runAll();

console.log('▼ Resumen');
for (const { to } of jobs) {
  const { ok, attempts, time: doneAt, error } = results.get(to);
  console.log(`  ${ok ? '✅' : '❌'} ${to.padEnd(17)} ${attempts} intento(s), t=${doneAt} ms${ok ? '' : ` · ${error.message}`}`);
}
```
