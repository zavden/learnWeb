---
example_description: "Un cliente JSON resiliente: URLs construidas con URLSearchParams, un plazo por intento (AbortSignal.timeout) combinado con la cancelación del usuario (AbortSignal.any), errores por tipo (HttpError con su status, NetworkError) y reintentos con espera exponencial solo para lo que tiene arreglo (red, plazos, 5xx y 429)"
example_tags: "javascript|fetch|reintentos|backoff|abortsignal|errores|urlsearchparams|integracion"
example_stage: intermediate
example_importance: critical
console: true
---

# JavaScript

```javascript
// Combina «Peticiones con fetch» (errores por tipo, { signal }), «URL e
// historial» (URLSearchParams) y los reintentos del módulo de asincronía.
class HttpError extends Error {
  name = 'HttpError';
  constructor(response) {
    super(`HTTP ${response.status} ${response.statusText}`);
    this.status = response.status;
  }
}
class NetworkError extends Error {
  name = 'NetworkError';
}

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    const timerId = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timerId);
      reject(signal.reason);
    }, { once: true });
  });
}

// Un intento: plazo propio + señal del usuario; errores con nombre.
async function getJSON(url, { timeoutMs, signal }) {
  const signals = [AbortSignal.timeout(timeoutMs), ...(signal ? [signal] : [])];
  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.any(signals), headers: { Accept: 'application/json' } });
  } catch (error) {
    if (error.name === 'AbortError' || error.name === 'TimeoutError') throw error;
    throw new NetworkError(`sin conexión con ${url.host}`, { cause: error });
  }
  if (!response.ok) throw new HttpError(response);
  return response.json();
}

const isRetryable = (error) => error instanceof NetworkError || error.name === 'TimeoutError'
  || (error instanceof HttpError && (error.status >= 500 || error.status === 429));

// buildUrl(intento) → URL. Espera 100, 200, 400… ms entre intentos (sin
// jitter, para que la salida sea siempre la misma).
async function getJSONWithRetry(buildUrl, { retries = 3, baseMs = 100, timeoutMs = 1000, signal } = {}) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return { data: await getJSON(buildUrl(attempt), { timeoutMs, signal }), attempts: attempt };
    } catch (error) {
      if (!isRetryable(error) || attempt > retries) throw error;
      const delay = baseMs * 2 ** (attempt - 1);
      console.log(`  ↻ intento ${attempt}: ${error.name}${error.status ? ` ${error.status}` : ''} · reintento en ${delay} ms`);
      await wait(delay, signal);
    }
  }
}

// El servidor de prueba: ?status= decide el código y ?delay= el retraso.
function demoUrl(params) {
  const url = new URL('/api/demo/echo', document.baseURI);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url;
}

async function run(title, task) {
  console.log(`▶ ${title}`);
  try {
    await task();
  } catch (error) {
    if (error.name === 'AbortError') console.log('  🛑 AbortError: cancelado por el usuario');
    else if (error.name === 'TimeoutError') console.log('  ⏰ TimeoutError: sin respuesta, se deja para más tarde');
    else if (error instanceof HttpError && error.status < 500) console.log(`  ⛔ ${error.name} ${error.status}: reintentar no sirve`);
    else console.log(`  ⛔ ${error.name}: ${error.message}`);
  }
}

await run('inventario (el servidor se recupera al tercer intento)', async () => {
  const { data, attempts } = await getJSONWithRetry((attempt) => demoUrl({ tienda: 'centro', status: attempt < 3 ? 503 : 200 }));
  console.log(`  ✅ datos de la tienda «${data.query.tienda}» | intentos: ${attempts}`);
});
await run('pedido P-404', () => getJSONWithRetry(() => demoUrl({ pedido: 'P-404', status: 404 })));
await run('informe lento (300 ms de plazo por intento, 1 reintento)', () =>
  getJSONWithRetry(() => demoUrl({ delay: 1500 }), { retries: 1, timeoutMs: 300 }));
await run('el usuario cancela durante la espera', () => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 80);
  return getJSONWithRetry(() => demoUrl({ status: 503 }), { signal: controller.signal });
});
```
