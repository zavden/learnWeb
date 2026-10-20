---
example_description: "Un cliente de API sobre una red simulada: cada intento tiene su plazo (AbortSignal.timeout combinado con la señal del usuario mediante AbortSignal.any), los fallos transitorios se reintentan con espera exponencial y jitter con semilla, los definitivos no, y cancelar detiene también la espera entre intentos"
example_tags: "javascript|async|abortsignal|reintentos|timeout|cancelar|api"
example_stage: intermediate
example_importance: critical
console: true
---

# JavaScript

```javascript
// ── Herramientas de las lecciones ──────────────────────────────────────────
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
function createRandom(seed) { // azar con semilla (Lehmer)
  let state = seed % 2147483647;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646; // número en [0, 1)
  };
}

class HttpError extends Error {
  constructor(status, path) {
    super(`${status} en ${path}`);
    this.name = 'HttpError';
    this.status = status;
    this.retryable = status >= 500; // los 5xx son del servidor: puede que a la próxima vaya bien
  }
}

// ── La red simulada: un guion de respuestas por ruta e intento ─────────────
const SCRIPT = {
  '/orders/P-1001': [{ ms: 30, status: 200 }],
  '/orders/P-1002': [{ ms: 30, status: 503 }, { ms: 400, status: 200 }, { ms: 40, status: 200 }],
  '/orders/P-404': [{ ms: 20, status: 404 }],
  '/orders/P-1003': [{ ms: 400, status: 200 }, { ms: 400, status: 200 }, { ms: 400, status: 200 }],
};
const attemptsByPath = new Map();
function fakeFetch(path, { signal }) {
  const attempt = attemptsByPath.get(path) ?? 0;
  attemptsByPath.set(path, attempt + 1);
  const { ms, status } = SCRIPT[path][Math.min(attempt, SCRIPT[path].length - 1)];
  return wait(ms, { signal }).then(() => {
    if (status !== 200) throw new HttpError(status, path);
    return { id: path.split('/').at(-1), status: 'enviado' };
  });
}

// ── El cliente ─────────────────────────────────────────────────────────────
const random = createRandom(7);
async function request(path, { signal, retries = 3, timeoutMs = 100, baseMs = 40 } = {}) {
  for (let attempt = 1; ; attempt++) {
    // Plazo POR INTENTO, unido a la cancelación del usuario (si la hay).
    const timeout = AbortSignal.timeout(timeoutMs);
    const attemptSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
    try {
      return await fakeFetch(path, { signal: attemptSignal });
    } catch (error) {
      if (signal?.aborted) throw signal.reason; // canceló el usuario: no se reintenta
      const retryable = error.name === 'TimeoutError' || error.retryable === true;
      if (!retryable || attempt > retries) throw error;
      const delay = Math.round(baseMs * 2 ** (attempt - 1) * (0.8 + 0.4 * random()));
      console.log(`  ✗ intento ${attempt}: ${error.name === 'TimeoutError' ? `sin respuesta en ${timeoutMs} ms` : error.message} · reintento en ${delay} ms`);
      await wait(delay, { signal }); // la espera también se cancela
    }
  }
}

async function main() {
  const userCancel = new AbortController();
  const cases = [
    { path: '/orders/P-1001' },
    { path: '/orders/P-1002' },
    { path: '/orders/P-404' },
    { path: '/orders/P-1003', cancelAfterMs: 200 }, // el usuario se cansa y pulsa «Cancelar»
  ];
  for (const { path, cancelAfterMs } of cases) {
    console.log(`▶ GET ${path}`);
    const signal = cancelAfterMs ? userCancel.signal : undefined;
    if (cancelAfterMs) setTimeout(() => userCancel.abort(new Error('cancelado por el usuario')), cancelAfterMs);
    try {
      const order = await request(path, { signal });
      console.log(`  ✓ ${order.id}: ${order.status}`);
    } catch (error) {
      console.log(`  ⛔ ${error.message}`);
    }
  }
  console.log('intentos por ruta →', Object.fromEntries(attemptsByPath));
}
main();

// Tres decisiones que importan:
// - El plazo es POR INTENTO (un AbortSignal.timeout nuevo en cada vuelta);
//   la señal del usuario es una sola para toda la petición.
// - Un plazo agotado es transitorio (se reintenta); un 404, definitivo.
// - Tras una cancelación del usuario no se reintenta nada: se relanza su motivo.
```
