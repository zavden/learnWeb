---
example_description: "El seguimiento en vivo de un pedido: /api/demo/stream envía NDJSON poco a poco, un generador asíncrono lo convierte en líneas (AsyncGenerator<unknown>) y otro en eventos tipados de una tupla de estados; la página avanza una barra de progreso y una línea de tiempo con cada evento y se puede detener con AbortController"
example_tags: "typescript|profesional|streams|ndjson|asyncgenerator|for-await|abortcontroller|tuplas|progress|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Pedido P-1042 · seguimiento</h1>
  <p class="actions">
    <button type="button" id="start">Seguir el pedido</button>
    <button type="button" id="stop" disabled>Dejar de seguir</button>
  </p>
  <label for="progress" class="progress-label">Progreso</label>
  <progress id="progress" max="5" value="0"></progress>
  <p id="current" class="current" role="status">Pulsa «Seguir el pedido».</p>
  <ol id="timeline" class="timeline" aria-label="Historial del pedido"></ol>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #cbd2d9; --ok: #166534; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: #f5f7fa; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.5rem; }
.actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
button { font: inherit; color: inherit; padding: 0.3rem 0.8rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: #fff; cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: 0.55; }
.progress-label { display: block; font-weight: 600; }
progress { width: 100%; height: 1rem; accent-color: var(--ok); }
.current { font-weight: 600; }
.timeline { margin: 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: #fff; }
.timeline li { margin: 0.15rem 0; }
.timeline .note { color: var(--muted); }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
```

# TypeScript

```typescript
// Seguimiento de un pedido en vivo.
//
// Decisiones de diseño:
// - Tres capas, cada una con su tipo: bytes → líneas de texto (readLines: AsyncGenerator<string>)
//   → valores sin comprobar (JSON.parse: unknown) → eventos del pedido (trackOrder:
//   AsyncGenerator<TrackingEvent>). La página solo ve eventos tipados.
// - Los estados son una tupla as const: su orden da la posición en la barra de progreso y su
//   tipo, la unión de estados. El número de cada bloque del servidor (n) se convierte en estado.
// - for await sobre response.body sería TS2504 con las librerías de LearnWeb (falta
//   DOM.AsyncIterable): readLines usa getReader() y libera el lector al terminar o al cancelar.
// - «Dejar de seguir» aborta la petición; el bucle termina sin tratarlo como un error.
//
// Alcance: todo el curso hasta el módulo «TypeScript en la práctica».

const STATES = ['received', 'preparing', 'packed', 'shipped', 'delivered'] as const;
type OrderState = (typeof STATES)[number];
type TrackingEvent = { state: OrderState; step: number; of: number };
const LABELS = {
  received: 'Pedido recibido',
  preparing: 'Preparando tu mole',
  packed: 'Empaquetado',
  shipped: 'En camino con la paquetería',
  delivered: 'Entregado',
} satisfies Record<OrderState, string>;

// ── Capa 1: bytes → líneas ────────────────────────────────────────────────
// El tipo exacto de response.body en TypeScript 5.9: con ReadableStream<Uint8Array> a secas,
// pipeThrough(new TextDecoderStream()) no encaja (TS2345).
async function* readLines(body: ReadableStream<Uint8Array<ArrayBuffer>>): AsyncGenerator<string, void, undefined> {
  const reader = body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += value;
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? ''; // la última puede llegar a medias
      for (const line of lines) if (line.trim() !== '') yield line;
    }
    if (buffer.trim() !== '') yield buffer;
  } finally {
    reader.releaseLock(); // también si quien consume sale antes (break o cancelación)
  }
}

// ── Capa 2: líneas → eventos tipados ──────────────────────────────────────
function toEvent(value: unknown): TrackingEvent | null {
  if (typeof value !== 'object' || value === null || !('n' in value) || !('of' in value)) return null;
  const { n, of } = value;
  if (typeof n !== 'number' || typeof of !== 'number') return null;
  const state = STATES[n - 1]; // OrderState | undefined… en los tipos, solo OrderState
  return state === undefined ? null : { state, step: n, of };
}

async function* trackOrder(orderId: string, signal: AbortSignal): AsyncGenerator<TrackingEvent, void, undefined> {
  const response = await fetch(`/api/demo/stream?format=ndjson&chunks=${STATES.length}&interval=500&order=${orderId}`, { signal });
  if (!response.ok || response.body === null) throw new Error(`HTTP ${response.status}`);
  for await (const line of readLines(response.body)) {
    const event = toEvent(JSON.parse(line));
    if (event) yield event;
  }
}

// ── La página ─────────────────────────────────────────────────────────────
function $<T extends Element>(selector: string, type: new () => T): T {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Falta «${selector}» o no es un ${type.name}`);
  return element;
}
const startButton = $('#start', HTMLButtonElement);
const stopButton = $('#stop', HTMLButtonElement);
const progress = $('#progress', HTMLProgressElement);
const current = $('#current', HTMLParagraphElement);
const timeline = $('#timeline', HTMLOListElement);
let following: AbortController | null = null;

function addToTimeline(text: string, className = ''): void {
  timeline.append(Object.assign(document.createElement('li'), { textContent: text, className }));
  console.log(text);
}

async function follow(): Promise<void> {
  following = new AbortController();
  startButton.disabled = true;
  stopButton.disabled = false;
  timeline.replaceChildren();
  progress.value = 0;
  current.textContent = 'Conectando…';
  try {
    for await (const event of trackOrder('P-1042', following.signal)) {
      progress.value = event.step;
      current.textContent = `${LABELS[event.state]} (${event.step} de ${event.of})`;
      addToTimeline(`📦 ${event.step}/${event.of} · ${LABELS[event.state]}`);
    }
    current.textContent = 'Seguimiento terminado: el pedido llegó';
  } catch (error) {
    const stopped = error instanceof DOMException && error.name === 'AbortError';
    current.textContent = stopped ? 'Dejaste de seguir el pedido.' : 'No se pudo seguir el pedido. Inténtalo más tarde.';
    addToTimeline(stopped ? '⏹️ seguimiento detenido' : `⚠️ ${error instanceof Error ? error.message : String(error)}`, 'note');
  } finally {
    following = null;
    startButton.disabled = false;
    stopButton.disabled = true;
  }
}

startButton.addEventListener('click', () => void follow()); // follow trata sus propios errores
stopButton.addEventListener('click', () => following?.abort());
console.log('Listo: pulsa «Seguir el pedido» (cada estado llega medio segundo después del anterior) y prueba «Dejar de seguir»');
```
