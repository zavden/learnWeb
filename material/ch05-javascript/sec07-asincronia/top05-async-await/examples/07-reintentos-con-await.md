---
example_description: "Reintentos con espera exponencial y jitter escritos con async/await: un for normal, un await wait(retraso) y un catch que decide si el error es transitorio; con una señal se pone un presupuesto de tiempo total. Es la versión con promesas del ejemplo profesional de «Funciones y ámbito»"
example_tags: "javascript|async|await|reintentos|backoff|abortsignal|simulacion"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// En el módulo «Funciones y ámbito» (ejemplo profesional «Reintentos con
// espera») había que simular el tiempo con un planificador hecho a mano,
// porque aún no había promesas. Con await, el algoritmo es un bucle for.

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

// Azar con semilla (Lehmer): los mismos retrasos en cada ejecución.
function createRandom(seed) {
  let state = seed % 2147483647;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

class MailError extends Error {
  constructor(code, message, retryable) {
    super(`${code} ${message}`);
    this.name = 'MailError';
    this.retryable = retryable;
  }
}

// Proveedor de correo simulado: sus `failures` primeras llamadas dan 503.
function createProvider(failures) {
  let calls = 0;
  return async (to) => {
    await wait(10); // la «red»
    calls += 1;
    if (!to.includes('.', to.indexOf('@'))) throw new MailError(550, `dirección rechazada: ${to}`, false);
    if (calls <= failures) throw new MailError(503, 'servicio no disponible', true);
    return `msg-${calls}`;
  };
}

async function retryWithBackoff(task, { retries = 4, baseMs = 40, factor = 2, maxMs = 300, jitter = 0.2, random, signal } = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await task(); // return AWAIT: si no, el catch no vería el rechazo
    } catch (error) {
      if (!error.retryable || attempt > retries) throw error; // definitivo o sin intentos
      const exponential = Math.min(maxMs, baseMs * factor ** (attempt - 1));
      const delay = Math.round(exponential * (1 + jitter * (random() * 2 - 1)));
      console.log(`  ✗ intento ${attempt}: ${error.message} · reintento en ${delay} ms`);
      await wait(delay, { signal }); // la espera también se puede cancelar
    }
  }
}

async function main() {
  const random = createRandom(2026);
  const jobs = [
    { to: 'ana@example.com', failures: 3 },
    { to: 'pedro@example', failures: 0 },
    { to: 'luis@example.com', failures: 9, budgetMs: 100 }, // con presupuesto de tiempo total
  ];
  for (const { to, failures, budgetMs } of jobs) {
    console.log(`▶ ${to}`);
    const send = createProvider(failures);
    const signal = budgetMs ? AbortSignal.timeout(budgetMs) : undefined;
    try {
      const id = await retryWithBackoff(() => send(to), { random, signal });
      console.log(`  ✓ enviado → ${id}`);
    } catch (error) {
      if (error.name === 'TimeoutError') console.log(`  ⏰ presupuesto de ${budgetMs} ms agotado: se deja para más tarde`);
      else console.log(`  ⛔ no se reintenta → ${error.message}`);
    }
  }
}
main();
```
