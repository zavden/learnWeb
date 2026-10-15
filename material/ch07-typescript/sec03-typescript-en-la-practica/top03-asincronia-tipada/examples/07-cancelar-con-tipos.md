---
example_description: "Cancelar con tipos: una tarea cancelable es (signal: AbortSignal) => Promise<T>, y withDeadline<T> le añade un plazo con AbortSignal.timeout y AbortSignal.any. Un plazo rechaza con TimeoutError, abort() con AbortError, y abort(motivo) con el motivo tal cual: signal.reason es any"
example_tags: "typescript|fetch|abortcontroller|abortsignal|timeouterror|aborterror|genericos|domexception"
example_stage: minimal
example_importance: important
console: true
---

# TypeScript

```typescript
// Una tarea cancelable: recibe una señal y devuelve la promesa de un T.
type Task<T> = (signal: AbortSignal) => Promise<T>;

// Añade un plazo a CUALQUIER tarea, y una cancelación de fuera si la hay.
function withDeadline<T>(task: Task<T>, ms: number, external?: AbortSignal): Promise<T> {
  const deadline = AbortSignal.timeout(ms);
  return task(external ? AbortSignal.any([deadline, external]) : deadline);
}

// Un predicado para las cancelaciones «normales» (las dos son DOMException).
function isCancellation(error: unknown): error is DOMException {
  return error instanceof DOMException && (error.name === 'AbortError' || error.name === 'TimeoutError');
}

// La tarea: un informe que el servidor de prueba tarda 600 ms en preparar.
const loadReport: Task<number> = async (signal) => {
  const response = await fetch('/api/demo/echo?delay=600', { signal });
  return response.status;
};

async function attempt(label: string, run: () => Promise<number>): Promise<void> {
  try {
    console.log(`✅ ${label} → ${await run()}`);
  } catch (error) {
    if (isCancellation(error)) console.log(`⏹️ ${label} → ${error.name}: ${error.message}`);
    else if (error instanceof Error) console.log(`❓ ${label} → ${error.name}: ${error.message}`);
    else throw error;
  }
}

await attempt('plazo de 2 s', () => withDeadline(loadReport, 2000));
await attempt('plazo de 300 ms', () => withDeadline(loadReport, 300));

const user = new AbortController();
setTimeout(() => user.abort(), 100); // el usuario pulsa «Cancelar»
await attempt('cancelado a los 100 ms', () => withDeadline(loadReport, 2000, user.signal));

// abort(motivo): fetch rechaza con ESE valor, que puede ser cualquier cosa (reason: any).
const panel = new AbortController();
setTimeout(() => panel.abort(new Error('el usuario cerró el panel')), 100);
await attempt('cerrado con un motivo propio', () => withDeadline(loadReport, 2000, panel.signal));
console.log('panel.signal.reason →', String(panel.signal.reason));
```
