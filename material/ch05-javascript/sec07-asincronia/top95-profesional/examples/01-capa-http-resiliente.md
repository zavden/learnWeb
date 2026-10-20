---
example_description: "Una capa HTTP resiliente sobre una red simulada: plazo por intento, reintentos con espera exponencial y jitter completo con semilla, Retry-After en los 429, POST solo con clave de idempotencia, cortacircuitos por servicio (cerrado, abierto, semiabierto) y cancelación del usuario"
example_tags: "javascript|profesional|async|reintentos|cortacircuitos|abortsignal|idempotencia"
example_stage: professional
example_importance: critical
console: true
---

# JavaScript

```javascript
// LA CAPA HTTP DE UNA TIENDA EN LÍNEA, sobre una red SIMULADA.
//
// Decisiones:
// - Cada intento tiene su plazo (AbortSignal.timeout), unido a la señal del
//   usuario con AbortSignal.any. Si cancela el usuario, no se reintenta nada.
// - Se reintentan los fallos transitorios: plazo agotado, 5xx y 429. Un 429
//   trae Retry-After: se espera lo que dice el servidor, no la espera exponencial.
// - Espera exponencial con jitter: la espera de cada intento es
//   base × 2^(intento − 1) (con un tope), la mitad fija y la otra mitad al
//   azar, para que miles de clientes no reintenten a la vez. El azar tiene semilla.
// - Solo se reintentan las peticiones idempotentes (GET, PUT, DELETE). Un POST
//   solo si lleva clave de idempotencia: si el servidor creó el pedido pero la
//   respuesta se perdió, el reintento con la misma clave devuelve ese pedido
//   en vez de crear otro.
// - Un cortacircuitos por servicio: tras 3 fallos seguidos se ABRE y falla al
//   momento sin llamar a nadie; pasado el descanso deja pasar UNA prueba
//   (semiabierto): si va bien se cierra, si falla se vuelve a abrir.
// - La red es un guion: cada ruta responde según el número de llamada, así que
//   la salida es siempre la misma.
//
// Alcance: módulos 1-7 (clases, #privados, Map, promesas, async/await,
// AbortController, AbortSignal.timeout/any).

// ── Utilidades ───────────────────────────────────────────────────────────
function wait(ms, { signal } = {}) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    const timerId = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => { // addEventListener: capítulo 6
      clearTimeout(timerId);
      reject(signal.reason);
    }, { once: true });
  });
}

function createRandom(seed) { // Lehmer / Park-Miller
  let state = seed % 2147483647;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

class HttpError extends Error {
  constructor(status, request, { retryAfterMs } = {}) {
    super(`${status} ${request}`);
    this.name = 'HttpError';
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }
}

class CircuitOpenError extends Error {
  constructor(service) {
    super(`circuito abierto para «${service}»: ni se intenta`);
    this.name = 'CircuitOpenError';
  }
}

// ── La red simulada ──────────────────────────────────────────────────────
// Cada ruta tiene un guion: la llamada n.º k recibe la respuesta k (la última se repite).
function createNetwork(scripts) {
  const calls = new Map();
  const createdOrders = new Map(); // clave de idempotencia → pedido ya creado
  return {
    calls,
    createdOrders,
    async send({ method, path, idempotencyKey }, { signal }) {
      const key = `${method} ${path}`;
      const call = (calls.get(key) ?? 0) + 1;
      calls.set(key, call);
      const steps = scripts[key];
      const { ms = 20, status = 200, retryAfterMs, body } = steps[Math.min(call, steps.length) - 1];
      // Con clave, el servidor crea el pedido (una sola vez por clave) ANTES de responder.
      if (method === 'POST' && idempotencyKey && status === 200 && !createdOrders.has(idempotencyKey)) {
        createdOrders.set(idempotencyKey, `P-${4400 + createdOrders.size + 1}`);
      }
      await wait(ms, { signal }); // …y la respuesta tarda `ms` (y puede perderse)
      if (status >= 400) throw new HttpError(status, key, { retryAfterMs });
      if (method === 'POST' && idempotencyKey) return { status, body: { id: createdOrders.get(idempotencyKey) } };
      return { status, body };
    },
  };
}

// ── El cortacircuitos ────────────────────────────────────────────────────
class CircuitBreaker {
  #state = 'cerrado';
  #failures = 0;
  #openedAt = 0;
  constructor(service, { threshold = 3, cooldownMs = 200, onChange = () => {} } = {}) {
    this.service = service;
    this.threshold = threshold;
    this.cooldownMs = cooldownMs;
    this.onChange = onChange;
  }
  get state() {
    return this.#state;
  }
  #moveTo(next) {
    if (next === this.#state) return;
    this.onChange(this.service, this.#state, next);
    this.#state = next;
  }
  beforeCall() {
    if (this.#state !== 'abierto') return;
    if (performance.now() - this.#openedAt < this.cooldownMs) throw new CircuitOpenError(this.service);
    this.#moveTo('semiabierto'); // pasado el descanso, UNA prueba
  }
  success() {
    this.#failures = 0;
    this.#moveTo('cerrado');
  }
  failure() {
    this.#failures += 1;
    if (this.#state === 'semiabierto' || this.#failures >= this.threshold) {
      this.#openedAt = performance.now();
      this.#moveTo('abierto');
    }
  }
}

// ── El cliente ───────────────────────────────────────────────────────────
const IDEMPOTENT = new Set(['GET', 'PUT', 'DELETE']);

class HttpClient {
  #network;
  #random;
  #breakers = new Map();
  constructor(network, { seed = 1, timeoutMs = 80, retries = 3, baseMs = 30, maxDelayMs = 200, log = console.log } = {}) {
    this.#network = network;
    this.#random = createRandom(seed);
    Object.assign(this, { timeoutMs, retries, baseMs, maxDelayMs, log });
  }

  #breakerFor(service) {
    if (!this.#breakers.has(service)) {
      this.#breakers.set(service, new CircuitBreaker(service, {
        onChange: (name, from, to) => this.log(`  ⚡ ${name}: ${from} → ${to}`),
      }));
    }
    return this.#breakers.get(service);
  }

  #isRetryable(error, method, idempotencyKey) {
    const transient = error.name === 'TimeoutError' || error.status === 429 || error.status >= 500;
    return transient && (IDEMPOTENT.has(method) || Boolean(idempotencyKey));
  }

  async request(method, path, { signal, idempotencyKey } = {}) {
    const service = path.split('/')[1];
    const breaker = this.#breakerFor(service);
    for (let attempt = 1; ; attempt++) {
      breaker.beforeCall(); // lanza CircuitOpenError si está abierto
      const timeout = AbortSignal.timeout(this.timeoutMs);
      const attemptSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
      try {
        const response = await this.#network.send({ method, path, idempotencyKey }, { signal: attemptSignal });
        breaker.success();
        return { ...response, attempts: attempt };
      } catch (error) {
        if (signal?.aborted) throw signal.reason; // canceló el usuario: no cuenta como fallo del servicio
        breaker.failure();
        if (breaker.state === 'abierto') throw new CircuitOpenError(service); // esperar ya no tiene sentido
        if (!this.#isRetryable(error, method, idempotencyKey) || attempt > this.retries) throw error;
        const cap = Math.min(this.maxDelayMs, this.baseMs * 2 ** (attempt - 1));
        const delay = error.retryAfterMs ?? Math.round(cap / 2 + this.#random() * (cap / 2));
        const why = error.name === 'TimeoutError' ? `sin respuesta en ${this.timeoutMs} ms` : error.message;
        this.log(`  ↻ intento ${attempt}: ${why} · reintento en ${delay} ms${error.retryAfterMs ? ' (Retry-After)' : ''}`);
        await wait(delay, { signal });
      }
    }
  }
}

// ── El escenario ─────────────────────────────────────────────────────────
const network = createNetwork({
  'GET /catalogo/productos': [{ body: { total: 128 } }],
  'GET /inventario/cafe-de-olla': [{ status: 503 }, { ms: 300 }, { body: { units: 12 } }],
  'POST /pedidos/nuevo': [{ status: 503 }, { ms: 300 }, {}], // 2.ª llamada: creado, pero la respuesta no llega
  'GET /envios/tarifas': [{ status: 429, retryAfterMs: 60 }, { body: { express: 14900 } }],
  'GET /pagos/estado': [{ status: 500 }, { status: 500 }, { status: 500 }, { body: { ok: true } }],
  'GET /informes/ventas': [{ ms: 300, body: { total: 0 } }],
});
const http = new HttpClient(network, { seed: 2026 });
const summary = [];

async function run(label, method, path, options = {}) {
  console.log(`▶ ${label}: ${method} ${path}`);
  try {
    const { body, attempts } = await http.request(method, path, options);
    console.log(`  ✓ ${JSON.stringify(body)}`);
    summary.push({ petición: label, resultado: '✓', intentos: attempts });
  } catch (error) {
    console.log(`  ⛔ ${error.name}: ${error.message}`);
    summary.push({ petición: label, resultado: `⛔ ${error.name}`, intentos: '—' });
  }
}

async function main() {
  await run('catálogo', 'GET', '/catalogo/productos');
  await run('stock', 'GET', '/inventario/cafe-de-olla');
  await run('pedido sin clave', 'POST', '/pedidos/nuevo');
  await run('pedido con clave', 'POST', '/pedidos/nuevo', { idempotencyKey: 'carrito-77-intento-1' });
  await run('tarifas', 'GET', '/envios/tarifas');
  await run('pagos (servicio caído)', 'GET', '/pagos/estado');
  await run('pagos, otra vez', 'GET', '/pagos/estado');
  await wait(250); // pasa el descanso del cortacircuitos
  await run('pagos, tras el descanso', 'GET', '/pagos/estado');

  const userCancel = new AbortController();
  setTimeout(() => userCancel.abort(new DOMException('el usuario cerró el informe', 'AbortError')), 50);
  await run('informe (el usuario cancela)', 'GET', '/informes/ventas', { signal: userCancel.signal });

  console.table(summary);
  console.log('pedidos creados en el servidor →', network.createdOrders.size, '(el reintento con clave no duplicó el pedido)');
}
main();
```
