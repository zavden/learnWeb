---
example_description: "La compra de entradas de un museo enviada a la API de prueba (/api/demo/echo): un requestJson<T> genérico con límite de tiempo devuelve una unión ok/error, la respuesta se valida desde unknown con predicados antes de usarla, y los fallos (422, tiempo agotado, datos inesperados) se muestran con un mensaje claro"
example_tags: "typescript|profesional|fetch|validacion|unknown|predicados-de-tipo|genericos|record|abortsignal|api|dom|accesibilidad"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<main class="app">
  <h1>Entradas · Museo Nacional de Antropología</h1>
  <form id="order" class="card" novalidate>
    <p class="field"><label for="date">Fecha de la visita</label><input id="date" type="date" value="2026-11-14"></p>
    <fieldset class="tickets">
      <legend>Entradas</legend>
      <p class="field"><label for="adult">Adulto ($100)</label><input id="adult" type="number" min="0" max="10" value="2"></p>
      <p class="field"><label for="student">Estudiante ($50)</label><input id="student" type="number" min="0" max="10" value="1"></p>
      <p class="field"><label for="senior">INAPAM (gratis)</label><input id="senior" type="number" min="0" max="10" value="0"></p>
    </fieldset>
  </form>
  <div class="actions" role="group" aria-label="Enviar">
    <button type="button" data-scenario="ok" class="primary">Comprar</button>
    <button type="button" data-scenario="rejected">Simular un error 422</button>
    <button type="button" data-scenario="slow">Respuesta lenta (3 s)</button>
    <button type="button" data-scenario="malformed">Respuesta inesperada</button>
  </div>
  <p id="result" class="result" role="status" aria-live="polite"></p>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #7b8794; --accent: #9a3412; --ok: #166534; --danger: #b91c1c; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: #fff8f0; }
.app { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.75rem; }
.card { padding: 0.5rem 1rem; background: #fff; border: 1px solid var(--line); border-radius: 0.75rem; }
.field { display: grid; gap: 0.15rem; margin: 0.4rem 0; }
.tickets { display: flex; flex-wrap: wrap; gap: 0 1rem; border: 0; padding: 0; margin: 0; }
.tickets legend { padding: 0; font-weight: 600; }
input, button { font: inherit; }
input { padding: 0.25rem 0.4rem; border: 1px solid var(--line); border-radius: 0.4rem; max-width: 9rem; }
.actions { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0.75rem 0; }
button { padding: 0.35rem 0.8rem; border: 1px solid var(--line); border-radius: 0.5rem; background: #fff; color: var(--ink); cursor: pointer; }
button.primary { border-color: var(--accent); background: var(--accent); color: #fff; }
button[aria-busy="true"] { cursor: progress; opacity: 0.7; }
.result { min-height: 1.45em; font-weight: 600; }
.result.ok { color: var(--ok); }
.result.error { color: var(--danger); }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { font-size: 0.85rem; color: var(--muted); }
```

# TypeScript

```typescript
// ── El pedido y su validación (lección 6) ────────────────────────────────
const KINDS = ['adult', 'student', 'senior'] as const;
type TicketKind = (typeof KINDS)[number];
type TicketOrder = { museum: string; date: string; tickets: Record<TicketKind, number> };
const PRICES = { adult: 100, student: 50, senior: 0 } satisfies Record<TicketKind, number>;
const KIND_LABELS = { adult: 'adulto', student: 'estudiante', senior: 'INAPAM' } satisfies Record<TicketKind, string>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isCount = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 10;

// Devuelve el pedido o la lista de problemas, cada uno con su ruta.
function parseOrder(data: unknown, path: string): TicketOrder | string[] {
  if (!isRecord(data)) return [`${path} debe ser un objeto`];
  const problems: string[] = [];
  const { museum, date, tickets } = data;
  if (typeof museum !== 'string' || museum === '') problems.push(`${path}.museum debe ser texto`);
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) problems.push(`${path}.date debe ser AAAA-MM-DD`);
  const counts: Record<TicketKind, number> = { adult: 0, student: 0, senior: 0 };
  if (!isRecord(tickets)) problems.push(`${path}.tickets debe ser un objeto`);
  else {
    for (const kind of KINDS) {
      const value = tickets[kind];
      if (isCount(value)) counts[kind] = value;
      else problems.push(`${path}.tickets.${kind} debe ser un entero de 0 a 10, llegó ${JSON.stringify(value)}`);
    }
  }
  if (problems.length > 0 || typeof museum !== 'string' || typeof date !== 'string') return problems;
  return { museum, date, tickets: counts };
}

// Lo que contesta /api/demo/echo: el método, la ruta y el cuerpo que se le envió.
type Echo = { method: string; path: string; body: unknown };
const isEcho = (data: unknown): data is Echo =>
  isRecord(data) && typeof data.method === 'string' && typeof data.path === 'string' && 'body' in data;

// ── Una petición genérica: nunca lanza, siempre devuelve una unión ────────
type Result<T> = { ok: true; status: number; value: T } | { ok: false; status: number | null; error: string };

async function requestJson<T>(url: string, init: RequestInit, parse: (data: unknown) => T | string[], timeoutMs: number): Promise<Result<T>> {
  try {
    const response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
    if (!response.ok) return { ok: false, status: response.status, error: `el servidor rechazó la petición (${response.status})` };
    const data: unknown = await response.json(); // json() devuelve any: se guarda como unknown
    const parsed = parse(data);
    return Array.isArray(parsed) ? { ok: false, status: response.status, error: `respuesta no válida: ${parsed.join('; ')}` } : { ok: true, status: response.status, value: parsed };
  } catch (error) {
    // Un tiempo agotado rechaza con un error llamado TimeoutError; un fallo de red, con un TypeError.
    const name = error instanceof Error ? error.name : 'Error';
    return { ok: false, status: null, error: name === 'TimeoutError' ? `sin respuesta en ${timeoutMs / 1000} s: la petición se canceló` : `fallo de red (${name})` };
  }
}

// La respuesta buena: un eco válido cuyo cuerpo es un pedido válido.
function parseEchoedOrder(data: unknown): { method: string; path: string; order: TicketOrder } | string[] {
  if (!isEcho(data)) return ['la respuesta no tiene la forma de un eco'];
  const order = parseOrder(data.body, 'body');
  return Array.isArray(order) ? order : { method: data.method, path: data.path, order };
}

// ── La interfaz ───────────────────────────────────────────────────────────
function byId<T extends HTMLElement>(id: string, type: new () => T): T {
  const element = document.getElementById(id);
  if (!(element instanceof type)) throw new Error(`Falta #${id} o no es del tipo esperado`);
  return element;
}
const SCENARIOS = {
  ok: { query: 'status=201', timeoutMs: 5000 },
  rejected: { query: 'status=422', timeoutMs: 5000 },
  slow: { query: 'delay=3000', timeoutMs: 1000 },
  malformed: { query: 'status=201', timeoutMs: 5000 },
} satisfies Record<string, { query: string; timeoutMs: number }>;
type Scenario = keyof typeof SCENARIOS;
const isScenario = (value: string | undefined): value is Scenario => value !== undefined && value in SCENARIOS;

const resultText = byId('result', HTMLParagraphElement);
const logList = byId('log', HTMLOListElement);
const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

function report(message: string, kind: 'ok' | 'error'): void {
  resultText.textContent = message;
  resultText.className = `result ${kind}`;
  console.log(message);
  logList.append(Object.assign(document.createElement('li'), { textContent: message }));
}
function readForm(): Record<string, unknown> {
  const tickets = Object.fromEntries(KINDS.map((kind) => [kind, byId(kind, HTMLInputElement).valueAsNumber]));
  return { museum: 'Museo Nacional de Antropología', date: byId('date', HTMLInputElement).value, tickets };
}
function describe(order: TicketOrder): string {
  const parts = KINDS.filter((kind) => order.tickets[kind] > 0).map((kind) => `${order.tickets[kind]} ${KIND_LABELS[kind]}`);
  const total = KINDS.reduce((sum, kind) => sum + order.tickets[kind] * PRICES[kind], 0);
  return `${order.date} · ${parts.join(' + ')} = ${pesos.format(total)}`;
}

async function send(scenario: Scenario, trigger: HTMLButtonElement): Promise<void> {
  const local = parseOrder(readForm(), 'form'); // primero, lo que sale de la página
  if (Array.isArray(local)) return report(`⚠️ revisa el formulario: ${local.join('; ')}`, 'error');
  // «Respuesta inesperada»: un cliente antiguo manda las cantidades como texto, y el eco las devuelve así.
  const payload = scenario === 'malformed' ? { ...local, tickets: { ...local.tickets, adult: 'dos' } } : local;
  trigger.setAttribute('aria-busy', 'true');
  resultText.textContent = 'Enviando…';
  const { query, timeoutMs } = SCENARIOS[scenario];
  const result = await requestJson(`/api/demo/echo?${query}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, parseEchoedOrder, timeoutMs);
  trigger.removeAttribute('aria-busy');
  if (result.ok) report(`✅ ${result.status} · ${result.value.method} ${result.value.path} · ${describe(result.value.order)}`, 'ok');
  else report(`⚠️ ${result.status ?? 'sin estado'} · ${result.error}`, 'error');
}

byId('order', HTMLFormElement).addEventListener('submit', (event) => event.preventDefault());
document.querySelector('.actions')?.addEventListener('click', (event) => {
  if (!(event.target instanceof HTMLButtonElement)) return;
  const scenario = event.target.dataset.scenario;
  // void: la promesa no se espera aquí, y send nunca lanza (requestJson devuelve una unión).
  if (isScenario(scenario) && event.target.getAttribute('aria-busy') !== 'true') void send(scenario, event.target);
});
console.log('Listo: pulsa «Comprar» y luego prueba el error 422, la respuesta lenta y la respuesta inesperada');
```
