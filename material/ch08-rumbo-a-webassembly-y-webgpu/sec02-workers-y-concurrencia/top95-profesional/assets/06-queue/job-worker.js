// UN WORKER DE LA COLA (ejemplo 06, de módulo). Ejecuta un trabajo cada vez, paso a
// paso, e informa del progreso. Los pasos son esperas (no gastan CPU): en una
// aplicación real serían trozos de una exportación, de una subida, de un informe…
// Entre paso y paso mira si le han pedido cancelar. Algunos trabajos fallan a
// propósito en ciertos intentos, para ver los reintentos.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let cancelled = false;

self.onmessage = async (event) => {
  const message = event.data;
  if (message.type === 'cancel') {
    cancelled = true;
    return;
  }
  const { job, attempt } = message;
  cancelled = false;
  for (let step = 1; step <= job.steps; step++) {
    await sleep(job.stepMs);
    if (cancelled) {
      self.postMessage({ type: 'cancelled', id: job.id });
      return;
    }
    if (job.failsOn && job.failsOn.attempts.includes(attempt) && step === job.failsOn.step) {
      self.postMessage({ type: 'failed', id: job.id, message: job.failsOn.message });
      return;
    }
    self.postMessage({ type: 'progress', id: job.id, step, steps: job.steps });
  }
  self.postMessage({ type: 'done', id: job.id });
};
