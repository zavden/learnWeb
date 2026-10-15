---
example_description: "Sondear un trabajo largo (una exportación de ventas) con espera creciente: cada consulta espera más que la anterior hasta un tope, respeta el Retry-After de un 429, para en cuanto el trabajo termina o falla, y se detiene con un plazo total (AbortSignal.timeout) o si el usuario cierra el panel"
example_tags: "javascript|profesional|async|sondeo|backoff|abortsignal|settimeout"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// SONDEAR UNA EXPORTACIÓN DE VENTAS hasta que esté lista.
//
// Decisiones:
// - El servidor crea el trabajo y devuelve un id; el cliente pregunta por su
//   estado hasta que está «listo» (o «fallido»).
// - Espera creciente: 20 ms la primera vez, ×1.6 cada vez, como mucho 120 ms.
//   Al principio se pregunta a menudo (puede acabar pronto); después, menos
//   (no tiene sentido saturar al servidor por un trabajo largo).
// - Es un bucle con await, no un setInterval: nunca hay dos consultas a la vez
//   (lección «Callbacks y temporizadores»).
// - Un 429 trae Retry-After: se espera eso y no se cuenta como fallo.
// - Una sola señal lo para todo: un plazo total (AbortSignal.timeout) y el
//   botón «Cerrar» del usuario, unidos con AbortSignal.any.
// - En una página real, también se pausaría con la pestaña oculta: evento
//   visibilitychange (capítulo 6).
// - El servidor es un guion: cada trabajo responde según el número de consulta.
//
// Alcance: módulos 1-7.

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

class HttpError extends Error {
  constructor(status, { retryAfterMs } = {}) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }
}

// ── El servidor simulado ─────────────────────────────────────────────────
const SCRIPTS = {
  'ventas-septiembre': [
    { state: 'en cola' }, { state: 'procesando', progress: 20 }, { status: 429, retryAfterMs: 80 },
    { state: 'procesando', progress: 60 }, { state: 'procesando', progress: 90 },
    { state: 'listo', url: 'https://exportaciones.example.com/ventas-septiembre.csv' },
  ],
  'clientes-2026': [{ state: 'en cola' }], // se queda en cola para siempre
  'inventario-octubre': [{ state: 'en cola' }, { state: 'procesando', progress: 10 }],
};
const server = {
  polls: new Map(),
  async startExport(name) {
    await wait(20);
    this.polls.set(name, 0);
    return name; // el id del trabajo
  },
  async getStatus(jobId, { signal } = {}) {
    await wait(15, { signal });
    const poll = this.polls.get(jobId) + 1;
    this.polls.set(jobId, poll);
    const steps = SCRIPTS[jobId];
    const step = steps[Math.min(poll, steps.length) - 1];
    if (step.status) throw new HttpError(step.status, step);
    return step;
  },
};

// ── El sondeo ────────────────────────────────────────────────────────────
async function pollUntilDone(jobId, { signal, firstDelayMs = 20, factor = 1.6, maxDelayMs = 120, onStatus = () => {} } = {}) {
  let delay = firstDelayMs;
  for (let poll = 1; ; poll++) {
    await wait(delay, { signal });
    let status;
    try {
      status = await server.getStatus(jobId, { signal });
    } catch (error) {
      if (error.status !== 429) throw error;
      onStatus(poll, delay, `429 demasiadas consultas · el servidor pide esperar ${error.retryAfterMs} ms`);
      delay = error.retryAfterMs;
      continue;
    }
    onStatus(poll, delay, status.progress === undefined ? status.state : `${status.state} ${status.progress} %`);
    if (status.state === 'listo') return status.url;
    if (status.state === 'fallido') throw new Error(`la exportación ${jobId} falló`);
    delay = Math.min(maxDelayMs, Math.round(delay * factor));
  }
}

async function exportReport(name, { totalTimeoutMs = 2000, closeAfterMs } = {}) {
  console.log(`▶ exportar «${name}»`);
  const panel = new AbortController(); // el botón «Cerrar» del panel
  if (closeAfterMs !== undefined) setTimeout(() => panel.abort(new DOMException('el usuario cerró el panel', 'AbortError')), closeAfterMs);
  const signal = AbortSignal.any([panel.signal, AbortSignal.timeout(totalTimeoutMs)]);
  try {
    const jobId = await server.startExport(name);
    const url = await pollUntilDone(jobId, {
      signal,
      onStatus: (poll, delay, text) => console.log(`  consulta ${poll} (tras ${delay} ms): ${text}`),
    });
    console.log(`  ✅ lista → ${url}`);
  } catch (error) {
    if (error.name === 'TimeoutError') console.log(`  ⏰ plazo total de ${totalTimeoutMs} ms agotado: se avisará por email`);
    else if (error.name === 'AbortError') console.log(`  🛑 ${error.message}: se deja de preguntar`);
    else console.log(`  ⛔ ${error.message}`);
  }
  console.log(`  consultas hechas → ${server.polls.get(name) ?? 0}`);
}

async function main() {
  await exportReport('ventas-septiembre');
  await exportReport('clientes-2026', { totalTimeoutMs: 300 });
  await exportReport('inventario-octubre', { closeAfterMs: 80 });
}
main();

// > Desde Python: el mismo bucle con «await asyncio.sleep(delay)» y
//   «async with asyncio.timeout(0.3):» alrededor para el plazo total.
```
