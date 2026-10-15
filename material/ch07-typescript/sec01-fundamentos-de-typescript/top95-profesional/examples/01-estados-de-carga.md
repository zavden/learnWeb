---
example_description: "Un panel de pedidos con sus cinco estados (inicial, cargando, con datos, vacío y error) modelados como unión discriminada y pintados con un switch exhaustivo; un servidor simulado con temporizadores y una respuesta validada a mano desde unknown"
example_tags: "typescript|profesional|uniones-discriminadas|never|unknown|json|estados|asincronia|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>Pedidos para recoger hoy</h1>
  <fieldset class="scenario">
    <legend>Respuesta simulada del servidor</legend>
    <label><input type="radio" name="scenario" value="ok" checked> Con pedidos</label>
    <label><input type="radio" name="scenario" value="empty"> Sin pedidos</label>
    <label><input type="radio" name="scenario" value="fail"> Error</label>
    <label><input type="radio" name="scenario" value="broken"> Datos rotos</label>
  </fieldset>
  <button type="button" id="load" class="primary">Cargar pedidos</button>
  <section id="panel" class="panel" aria-live="polite" aria-busy="false" aria-label="Pedidos"></section>
  <h2>Registro de estados</h2>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
:root {
  color-scheme: light;
  --ink: #1f2933;
  --muted: #52606d;
  --line: #7b8794;
  --soft-line: #cbd2d9;
  --accent: #1d4ed8;
  --danger: #b91c1c;
  --danger-soft: #fef2f2;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.5; color: var(--ink); background: #f5f7fa; }
.app { max-width: 34rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.3rem; margin: 0 0 0.5rem; }
h2 { font-size: 1rem; margin-bottom: 0; }
.scenario { display: flex; flex-wrap: wrap; gap: 0.25rem 1rem; border: 1px solid var(--soft-line); border-radius: 0.5rem; }
button {
  font: inherit;
  padding: 0.45rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: #fff;
  color: var(--ink);
  cursor: pointer;
}
button.primary { margin: 0.75rem 0; border-color: var(--accent); background: var(--accent); color: #fff; }
button:disabled { opacity: 0.6; cursor: progress; }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.panel { min-height: 7rem; padding: 0.75rem 1rem; background: #fff; border: 1px solid var(--soft-line); border-radius: 0.75rem; }
.panel.error { border-color: var(--danger); background: var(--danger-soft); color: var(--danger); }
table { width: 100%; border-collapse: collapse; }
caption { text-align: start; font-weight: 700; }
th, td { padding: 0.3rem 0.4rem; border-bottom: 1px solid var(--soft-line); text-align: start; }
td.money { text-align: end; font-variant-numeric: tabular-nums; }
.log { font-size: 0.85rem; color: var(--muted); }
```

# TypeScript

```typescript
// Cinco estados, cada uno con sus datos: imposible tener «pedidos» mientras se carga.
type Order = { readonly id: string; readonly customer: string; readonly totalCents: number; readonly pickup: string };
type LoadState =
  | { kind: 'idle' }
  | { kind: 'loading'; attempt: number }
  | { kind: 'success'; orders: readonly Order[]; attempt: number }
  | { kind: 'empty'; attempt: number }
  | { kind: 'error'; message: string; attempt: number };
type Scenario = 'ok' | 'empty' | 'fail' | 'broken';
type ParseResult = { ok: true; orders: Order[] } | { ok: false; error: string };

const RESPONSES = {
  ok: '[{"id":"P-2041","customer":"Ana Ruiz","total":385,"pickup":"13:30"},{"id":"P-2042","customer":"Iván Soto","total":120,"pickup":"14:00"},{"id":"P-2043","customer":"Carmen Vidal","total":642.5,"pickup":"14:15"}]',
  empty: '[]',
  broken: '[{"id":"P-2044","customer":"Diego Ríos","total":"doscientos","pickup":"15:00"}]',
} as const;

function byId(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (element === null) throw new Error(`Falta el elemento #${id}`);
  return element;
}
function assertNever(value: never): never {
  throw new Error(`Estado no previsto: ${JSON.stringify(value)}`);
}

const loadButton = byId('load');
const panel = byId('panel');
const logList = byId('log');
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

// Servidor simulado: texto tras 700 ms, o un fallo. Promise<string> se lee
// «promesa de un string» (genéricos: módulo 2; fetch: «Red y almacenamiento»).
function fakeRequest(scenario: Scenario): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (scenario === 'fail') reject(new Error('El servidor no respondió (503)'));
      else resolve(RESPONSES[scenario]);
    }, 700);
  });
}

// La frontera: el texto se comprueba entero antes de convertirse en Order[].
function parseOrders(text: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'la respuesta no es JSON' };
  }
  if (!Array.isArray(data)) return { ok: false, error: 'se esperaba una lista' };
  const items: unknown[] = data;
  const orders: Order[] = [];
  for (const item of items) {
    if (typeof item !== 'object' || item === null) return { ok: false, error: 'un pedido no es un objeto' };
    if (!('id' in item) || typeof item.id !== 'string') return { ok: false, error: 'un pedido sin id' };
    if (!('customer' in item) || typeof item.customer !== 'string') return { ok: false, error: `${item.id}: falta el cliente` };
    if (!('total' in item) || typeof item.total !== 'number') return { ok: false, error: `${item.id}: total no es un número` };
    if (!('pickup' in item) || typeof item.pickup !== 'string') return { ok: false, error: `${item.id}: falta la hora` };
    orders.push({ id: item.id, customer: item.customer, totalCents: Math.round(item.total * 100), pickup: item.pickup });
  }
  return { ok: true, orders };
}

function currentScenario(): Scenario {
  const checked = document.querySelector('input[name="scenario"]:checked');
  const value = checked instanceof HTMLInputElement ? checked.value : '';
  return value === 'empty' || value === 'fail' || value === 'broken' ? value : 'ok';
}

let state: LoadState = { kind: 'idle' };
let attempts = 0;

function describeState(current: LoadState): string {
  switch (current.kind) {
    case 'idle':
      return 'idle';
    case 'loading':
      return `loading (intento ${current.attempt})`;
    case 'success': {
      const total = current.orders.reduce((sum, order) => sum + order.totalCents, 0);
      return `success: ${current.orders.length} pedidos, ${money.format(total / 100)} en total (intento ${current.attempt})`;
    }
    case 'empty':
      return `empty (intento ${current.attempt})`;
    case 'error':
      return `error: ${current.message} (intento ${current.attempt})`;
    default:
      return assertNever(current);
  }
}

function paragraph(text: string): HTMLParagraphElement {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

function ordersTable(orders: readonly Order[]): HTMLTableElement {
  const table = document.createElement('table');
  table.createCaption().textContent = `${orders.length} pedidos`;
  const head = table.createTHead().insertRow();
  for (const label of ['Pedido', 'Cliente', 'Recoge', 'Total']) {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = label;
    head.append(th);
  }
  const body = table.createTBody();
  for (const order of orders) {
    const row = body.insertRow();
    for (const text of [order.id, order.customer, order.pickup]) row.insertCell().textContent = text;
    const total = row.insertCell();
    total.className = 'money';
    total.textContent = money.format(order.totalCents / 100);
  }
  return table;
}

// Un único sitio que traduce el estado a pantalla, con un caso por estado.
function render(): void {
  const current = state;
  const busy = current.kind === 'loading';
  panel.setAttribute('aria-busy', String(busy));
  panel.classList.toggle('error', current.kind === 'error');
  loadButton.toggleAttribute('disabled', busy);
  switch (current.kind) {
    case 'idle':
      panel.replaceChildren(paragraph('Pulsa «Cargar pedidos» para ver los de hoy.'));
      break;
    case 'loading':
      panel.replaceChildren(paragraph(`Cargando pedidos… (intento ${current.attempt})`));
      break;
    case 'success':
      panel.replaceChildren(ordersTable(current.orders));
      break;
    case 'empty':
      panel.replaceChildren(paragraph('🍃 No hay pedidos para recoger hoy.'));
      break;
    case 'error': {
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.textContent = 'Reintentar';
      retry.addEventListener('click', load);
      panel.replaceChildren(paragraph(`⚠️ ${current.message}`), retry);
      break;
    }
    default:
      assertNever(current);
  }
}

function setState(next: LoadState): void {
  state = next;
  render();
  const line = `estado → ${describeState(next)}`;
  console.log(line);
  const item = document.createElement('li');
  item.textContent = line;
  logList.append(item);
}

async function load(): Promise<void> {
  attempts += 1;
  const attempt = attempts;
  setState({ kind: 'loading', attempt });
  try {
    const result = parseOrders(await fakeRequest(currentScenario()));
    if (!result.ok) setState({ kind: 'error', message: `Datos no válidos: ${result.error}`, attempt });
    else if (result.orders.length === 0) setState({ kind: 'empty', attempt });
    else setState({ kind: 'success', orders: result.orders, attempt });
  } catch (error) {
    setState({ kind: 'error', message: error instanceof Error ? error.message : String(error), attempt });
  }
}

loadButton.addEventListener('click', load);
setState({ kind: 'idle' });
console.log('Listo: elige una respuesta simulada y pulsa «Cargar pedidos»');
```
