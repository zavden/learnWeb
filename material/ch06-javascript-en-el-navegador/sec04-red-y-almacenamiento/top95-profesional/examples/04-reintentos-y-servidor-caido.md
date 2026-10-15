---
example_description: "La consulta del estado de un pedido que aguanta un servidor inestable: reintentos con espera exponencial y jitter (con semilla), plazo por intento, sin reintentar los 4xx, un selector que simula el servidor (sano, se recupera, caído, lento, 404) con ?status= y ?delay=, una línea de tiempo accesible de los intentos y «Cancelar» que corta también la espera"
example_tags: "javascript|fetch|reintentos|backoff|jitter|abortsignal|errores|profesional"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<main class="tracker">
  <h1>¿Dónde está mi pedido?</h1>
  <form id="track-form">
    <label for="order">Número de pedido</label>
    <input id="order" name="order" value="P-2041" required pattern="P-[0-9]{4}">
    <label for="mode">Simular el servidor</label>
    <select id="mode" name="mode">
      <option value="healthy">Funciona</option>
      <option value="recovers">Falla 2 veces y se recupera</option>
      <option value="down">Caído (503 siempre)</option>
      <option value="slow">Lento (3 s por respuesta)</option>
      <option value="missing">Pedido inexistente (404)</option>
    </select>
    <p class="actions">
      <button type="submit">Consultar</button>
      <button id="cancel" type="button" disabled>Cancelar</button>
    </p>
  </form>
  <p id="status" class="status" role="status">Escribe tu número de pedido.</p>
  <ol id="attempts" class="attempts" aria-label="Intentos"></ol>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1f2933; --muted: #52606d; --line: #cbd2d9; --surface: #ffffff; --page: #f5f7fa; --accent: #1d4ed8; --ok: #166534; --error: #b91c1c; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.tracker { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0 0 0.5rem; font-size: 1.25rem; }
form { display: grid; grid-template-columns: auto 1fr; gap: 0.4rem 0.75rem; align-items: center; }
.actions { grid-column: 1 / -1; display: flex; gap: 0.5rem; margin: 0.25rem 0 0; }
input, select, button { font: inherit; padding: 0.35rem 0.6rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: var(--surface); color: var(--ink); }
button { cursor: pointer; }
button:disabled { color: #616e7c; cursor: not-allowed; }
:is(input, select, button):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.status { padding: 0.5rem 0.75rem; border-left: 4px solid var(--accent); background: var(--surface); }
.status.is-ok { border-color: var(--ok); }
.status.is-error { border-color: var(--error); color: var(--error); }
.attempts { margin: 0.5rem 0 0; padding-left: 1.5rem; font-size: 0.9rem; color: var(--muted); }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
```

# JavaScript

```javascript
// Consulta resiliente del estado de un pedido.
//
// Decisiones de diseño:
// - Se reintenta solo lo que puede arreglarse esperando: fallos de red,
//   plazos agotados, 5xx y 429. Un 4xx (pedido inexistente) se dice al
//   momento: reintentar no lo cambia.
// - Espera exponencial (300, 600, 1200… ms, con tope) con jitter del ±20 %:
//   así mil clientes que fallaron a la vez no vuelven a la vez. El azar tiene
//   semilla para que cada consulta dé los mismos tiempos y se pueda comprobar.
//   Si el servidor manda Retry-After (en segundos), esa cifra manda.
// - Cada intento tiene su plazo (AbortSignal.timeout) y todos comparten la
//   señal del botón «Cancelar» (AbortSignal.any), que corta también la espera.
// - La línea de tiempo enseña cada intento; el estado (role="status") dice en
//   palabras qué pasa y qué puede hacer el usuario.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

const MAX_RETRIES = 3;
const form = document.querySelector('#track-form');
const cancelButton = document.querySelector('#cancel');
const statusText = document.querySelector('#status');
const attemptsList = document.querySelector('#attempts');
const logList = document.querySelector('#log');
let consultation = null;
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
function setStatus(text, kind = '') {
  statusText.textContent = text;
  statusText.className = `status ${kind}`;
}
function createRandom(seed) { // Lehmer: el mismo «azar» en cada consulta
  let state = seed % 2147483647;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}
function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted();
    const timerId = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timerId);
      reject(signal.reason);
    }, { once: true });
  });
}

// Lo que pediría cada intento según el servidor simulado.
function attemptUrl(order, mode, attempt) {
  const url = new URL('/api/demo/echo', document.baseURI);
  url.searchParams.set('pedido', order);
  if (mode === 'recovers' && attempt <= 2) url.searchParams.set('status', '503');
  if (mode === 'down') url.searchParams.set('status', '503');
  if (mode === 'missing') url.searchParams.set('status', '404');
  if (mode === 'slow') url.searchParams.set('delay', '3000');
  return url;
}
const retryable = (outcome) => outcome.kind === 'network' || outcome.kind === 'timeout' || outcome.status >= 500 || outcome.status === 429;

async function tryOnce(url, signal) {
  try {
    const response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(1000)]) });
    if (!response.ok) return { kind: 'http', status: response.status, label: `${response.status} ${response.statusText}`, retryAfter: Number(response.headers.get('retry-after')) || 0 };
    return { kind: 'ok', label: `${response.status} ${response.statusText}`, data: await response.json() };
  } catch (error) {
    if (error.name === 'TimeoutError') return { kind: 'timeout', label: 'sin respuesta en 1 s' };
    if (error.name === 'AbortError') throw error;
    return { kind: 'network', label: 'sin conexión' };
  }
}

async function track(order, mode) {
  consultation?.abort();
  consultation = new AbortController();
  const { signal } = consultation;
  const random = createRandom(2041);
  attemptsList.replaceChildren();
  cancelButton.disabled = false;
  setStatus(`Consultando ${order}…`);
  try {
    for (let attempt = 1; ; attempt += 1) {
      const outcome = await tryOnce(attemptUrl(order, mode, attempt), signal);
      const step = Object.assign(document.createElement('li'), { textContent: `Intento ${attempt}: ${outcome.label}` });
      attemptsList.append(step);
      if (outcome.kind === 'ok') {
        setStatus(`Pedido ${outcome.data.query.pedido}: en camino desde Oaxaca, llega el jueves.`, 'is-ok');
        logLine(`✅ intento ${attempt} → ${outcome.label}: pedido ${outcome.data.query.pedido} en camino`);
        return;
      }
      if (!retryable(outcome)) {
        setStatus(`No encontramos el pedido ${order}. Revisa el número.`, 'is-error');
        logLine(`⛔ intento ${attempt} → ${outcome.label}: no se reintenta`);
        return;
      }
      if (attempt > MAX_RETRIES) {
        setStatus('El servicio no responde. Inténtalo dentro de unos minutos; tu pedido no se ha perdido.', 'is-error');
        logLine(`⛔ intento ${attempt} → ${outcome.label}: sin más reintentos`);
        return;
      }
      const backoff = Math.min(3000, 300 * 2 ** (attempt - 1));
      const delay = outcome.retryAfter ? outcome.retryAfter * 1000 : Math.round(backoff * (1 + 0.2 * (random() * 2 - 1)));
      setStatus(`El servicio falló (${outcome.label}). Reintento ${attempt} de ${MAX_RETRIES} en ${(delay / 1000).toFixed(1)} s…`);
      logLine(`🔄 intento ${attempt} → ${outcome.label} · reintento en ${delay} ms`);
      await wait(delay, signal);
    }
  } catch (error) {
    if (error.name !== 'AbortError') throw error;
    setStatus('Consulta cancelada.');
    logLine('🛑 consulta cancelada');
  } finally {
    cancelButton.disabled = true;
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  track(form.elements.order.value.trim(), form.elements.mode.value);
});
cancelButton.addEventListener('click', () => consultation?.abort());
logLine('Listo: elige cómo se comporta el servidor y pulsa «Consultar» (prueba «Cancelar» con el servidor caído)');
```
