---
example_description: "Una capa de red tipada con reintentos: fetchWithRetry<T> reintenta solo los fallos que pueden arreglarse solos (red, plazo, 5xx) con espera exponencial, cada intento tiene su AbortSignal.timeout y todo se cancela con un AbortController; la interfaz es una unión discriminada de estados (cargando, error, vacío, datos) con aria-busy y un botón de reintento"
example_tags: "typescript|profesional|fetch|reintentos|backoff|abortsignal|result|uniones-discriminadas|estados-de-carga|accesibilidad"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Catálogo · Tienda de la sierra</h1>
  <div class="controls">
    <label for="scenario">Servidor</label>
    <select id="scenario">
      <option value="stable">Estable</option>
      <option value="recovers">Se recupera al tercer intento</option>
      <option value="down">Caído (503)</option>
      <option value="slow">Lento (3 s)</option>
      <option value="empty">Sin productos</option>
    </select>
    <button type="button" id="load">Cargar</button>
    <button type="button" id="cancel" disabled>Cancelar</button>
  </div>
  <section id="panel" class="panel" aria-live="polite" aria-busy="false"></section>
  <ol class="log" aria-label="Registro de intentos"></ol>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #cbd2d9; --danger: #b91c1c; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: #f5f7fa; }
main { max-width: 34rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.75rem; }
.controls { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
label { font-weight: 600; }
select, button { font: inherit; color: inherit; padding: 0.25rem 0.6rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: #fff; }
button { cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: 0.55; }
.panel { min-height: 5rem; margin-top: 0.75rem; padding: 0.5rem 0.75rem; border: 1px solid var(--line); border-radius: 0.75rem; background: #fff; }
.panel[aria-busy="true"] { color: var(--muted); }
.panel ul { margin: 0; padding-left: 1.2rem; }
.error { color: var(--danger); font-weight: 600; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: #fff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; color: var(--muted); }
```

# TypeScript

```typescript
// Catálogo con reintentos.
//
// Decisiones de diseño:
// - fetchWithRetry<T> no sabe nada de catálogos: recibe la URL de cada intento, un validador y
//   las reglas. Devuelve un Result; solo lanza lo inesperado (un fallo de programación).
// - Se reintenta lo que puede arreglarse solo: sin red, plazo agotado y errores 5xx. Un 4xx o
//   unos datos inválidos no mejoran por insistir. Espera exponencial: 200 ms, 400 ms… (en
//   producción se le suma un azar, el «jitter», para que miles de clientes no reintenten a la vez).
// - Cada intento tiene su plazo (AbortSignal.timeout) y todos comparten la señal de «Cancelar»
//   (AbortSignal.any). Cancelar no es un error: la interfaz vuelve a su estado inicial.
// - El panel pinta una unión discriminada de estados; un switch exhaustivo obliga a pintarlos todos.
// - Los escenarios usan assets/catalog.json, assets/catalog-empty.json y /api/demo/echo.
//
// Alcance: todo el curso hasta el módulo «TypeScript en la práctica».

type Product = { sku: string; name: string; price: number; stock: number };
type Validator<T> = (data: unknown) => data is T;
type FetchFailure =
  | { kind: 'http'; status: number }
  | { kind: 'network' }
  | { kind: 'timeout'; ms: number }
  | { kind: 'invalid' }
  | { kind: 'cancelled' };
type Result<T> = { ok: true; value: T; attempts: number } | { ok: false; error: FetchFailure; attempts: number };
type RetryOptions = { retries: number; baseDelayMs: number; timeoutMs: number; signal: AbortSignal; onRetry: (attempt: number, error: FetchFailure, waitMs: number) => void };

const isRetryable = (error: FetchFailure): boolean =>
  error.kind === 'network' || error.kind === 'timeout' || (error.kind === 'http' && error.status >= 500);

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    }, { once: true });
  });
}

async function attemptOnce<T>(url: string, validate: Validator<T>, options: RetryOptions): Promise<{ ok: true; value: T } | { ok: false; error: FetchFailure }> {
  try {
    const response = await fetch(url, { signal: AbortSignal.any([options.signal, AbortSignal.timeout(options.timeoutMs)]) });
    if (!response.ok) return { ok: false, error: { kind: 'http', status: response.status } };
    const data: unknown = await response.json();
    return validate(data) ? { ok: true, value: data } : { ok: false, error: { kind: 'invalid' } };
  } catch (error) {
    if (options.signal.aborted) return { ok: false, error: { kind: 'cancelled' } };
    if (error instanceof DOMException && error.name === 'TimeoutError') return { ok: false, error: { kind: 'timeout', ms: options.timeoutMs } };
    if (error instanceof TypeError) return { ok: false, error: { kind: 'network' } };
    throw error;
  }
}

async function fetchWithRetry<T>(urlFor: (attempt: number) => string, validate: Validator<T>, options: RetryOptions): Promise<Result<T>> {
  for (let attempt = 1; ; attempt += 1) {
    const result = await attemptOnce(urlFor(attempt), validate, options);
    if (result.ok) return { ...result, attempts: attempt };
    if (result.error.kind === 'cancelled' || !isRetryable(result.error) || attempt > options.retries) return { ...result, attempts: attempt };
    const waitMs = options.baseDelayMs * 2 ** (attempt - 1);
    options.onRetry(attempt, result.error, waitMs);
    try {
      await wait(waitMs, options.signal);
    } catch {
      return { ok: false, error: { kind: 'cancelled' }, attempts: attempt };
    }
  }
}

const isProductList: Validator<Product[]> = (data): data is Product[] =>
  Array.isArray(data) && data.every((item: unknown) =>
    typeof item === 'object' && item !== null &&
    'sku' in item && typeof item.sku === 'string' && 'name' in item && typeof item.name === 'string' &&
    'price' in item && typeof item.price === 'number' && 'stock' in item && Number.isInteger(item.stock));

// ── Escenarios: la URL de cada intento ────────────────────────────────────
const SCENARIOS = {
  stable: () => 'catalog.json',
  recovers: (attempt: number) => (attempt < 3 ? '/api/demo/echo?status=503' : 'catalog.json'),
  down: () => '/api/demo/echo?status=503',
  slow: () => '/api/demo/echo?delay=3000',
  empty: () => 'catalog-empty.json',
} satisfies Record<string, (attempt: number) => string>;
type Scenario = keyof typeof SCENARIOS;
const isScenario = (value: string): value is Scenario => Object.hasOwn(SCENARIOS, value);

// ── La interfaz: un estado, una forma de pintarlo ─────────────────────────
type ViewState =
  | { status: 'idle' }
  | { status: 'loading'; attempt: number }
  | { status: 'error'; error: FetchFailure; attempts: number }
  | { status: 'empty' }
  | { status: 'ready'; products: Product[]; attempts: number };

function $<T extends Element>(selector: string, type: new () => T): T {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Falta «${selector}» o no es un ${type.name}`);
  return element;
}
const panel = $('#panel', HTMLElement);
const scenarioSelect = $('#scenario', HTMLSelectElement);
const loadButton = $('#load', HTMLButtonElement);
const cancelButton = $('#cancel', HTMLButtonElement);
const logList = $('.log', HTMLOListElement);
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const report = (text: string): void => {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
};

function explain(error: FetchFailure): string {
  switch (error.kind) {
    case 'http': return `el servidor respondió ${error.status}`;
    case 'network': return 'no hay conexión';
    case 'timeout': return `sin respuesta en ${error.ms / 1000} s`;
    case 'invalid': return 'los datos no tienen la forma esperada';
    case 'cancelled': return 'cancelado';
    default: {
      const unhandled: never = error;
      return unhandled;
    }
  }
}

function paint(state: ViewState): void {
  panel.setAttribute('aria-busy', String(state.status === 'loading'));
  loadButton.disabled = state.status === 'loading';
  cancelButton.disabled = state.status !== 'loading';
  switch (state.status) {
    case 'idle':
      panel.replaceChildren(Object.assign(document.createElement('p'), { textContent: 'Elige un servidor y pulsa «Cargar».' }));
      break;
    case 'loading':
      panel.replaceChildren(Object.assign(document.createElement('p'), { textContent: `Cargando… (intento ${state.attempt})` }));
      break;
    case 'error': {
      const retry = Object.assign(document.createElement('button'), { type: 'button', textContent: 'Reintentar' });
      retry.addEventListener('click', () => void load());
      const message = Object.assign(document.createElement('p'), { className: 'error', textContent: `No se pudo cargar el catálogo: ${explain(state.error)} (${state.attempts} intento(s)).` });
      panel.replaceChildren(message, retry);
      break;
    }
    case 'empty':
      panel.replaceChildren(Object.assign(document.createElement('p'), { textContent: 'Todavía no hay productos en el catálogo.' }));
      break;
    case 'ready': {
      const list = document.createElement('ul');
      list.append(...state.products.map((product) => Object.assign(document.createElement('li'), {
        textContent: `${product.name} · ${money.format(product.price)}${product.stock === 0 ? ' · agotado' : ''}`,
      })));
      panel.replaceChildren(list);
      break;
    }
    default: {
      const unhandled: never = state;
      return unhandled;
    }
  }
}

let controller: AbortController | null = null;

async function load(): Promise<void> {
  const scenario = isScenario(scenarioSelect.value) ? scenarioSelect.value : 'stable';
  controller = new AbortController();
  paint({ status: 'loading', attempt: 1 });
  report(`▶ ${scenario}`);
  const result = await fetchWithRetry(SCENARIOS[scenario], isProductList, {
    retries: 3,
    baseDelayMs: 200,
    timeoutMs: 800,
    signal: controller.signal,
    onRetry: (attempt, error, waitMs) => {
      report(`⏳ intento ${attempt}: ${explain(error)} · reintento en ${waitMs} ms`);
      paint({ status: 'loading', attempt: attempt + 1 });
    },
  });
  controller = null;
  if (result.ok) {
    paint(result.value.length === 0 ? { status: 'empty' } : { status: 'ready', products: result.value, attempts: result.attempts });
    report(`✅ ${result.value.length} productos (${result.attempts} intento(s))`);
  } else if (result.error.kind === 'cancelled') {
    paint({ status: 'idle' });
    report('⏹️ cancelado por el usuario');
  } else {
    paint({ status: 'error', error: result.error, attempts: result.attempts });
    report(`⚠️ ${explain(result.error)} (${result.attempts} intento(s))`);
  }
}

loadButton.addEventListener('click', () => void load()); // load nunca rechaza por un fallo esperado
cancelButton.addEventListener('click', () => controller?.abort());
paint({ status: 'idle' });
report('Listo: elige un servidor y pulsa «Cargar»; con «Lento» o «Caído», prueba también «Cancelar»');
```
