---
example_description: "Un registro de actividad de una tienda: las entradas son una unión discriminada, los suscriptores tienen un tipo de función (entrada, posición) => void y subscribe devuelve la función que da de baja; la lista filtrada, los contadores, la consola y los avisos emergentes se suscriben sin conocerse"
example_tags: "typescript|profesional|tipos-de-funcion|callbacks|uniones-discriminadas|never|clases|suscripciones"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>Actividad de la tienda</h1>
  <div class="actions" id="actions">
    <button type="button" data-simulate="order">Nuevo pedido</button>
    <button type="button" data-simulate="warning">Aviso de inventario</button>
    <button type="button" data-simulate="info">Nota del turno</button>
  </div>
  <div class="options">
    <label>Mostrar
      <select id="filter">
        <option value="all">Todo</option>
        <option value="order">Pedidos</option>
        <option value="warning">Avisos</option>
        <option value="info">Notas</option>
      </select>
    </label>
    <label><input type="checkbox" id="toasts" checked> Avisos emergentes</label>
  </div>
  <p id="counts" class="counts" aria-live="polite"></p>
  <ol id="entries" class="entries" aria-label="Entradas del registro"></ol>
  <div id="toast" class="toast" role="status" hidden></div>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #7b8794; --soft: #cbd2d9; --accent: #1d4ed8; --warn: #92400e; --warn-soft: #fffbeb; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: #f5f7fa; }
.app { max-width: 34rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.25rem; margin: 0 0 0.75rem; }
.actions, .options { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; align-items: center; margin-bottom: 0.75rem; }
button, select, input { font: inherit; }
button { padding: 0.4rem 0.8rem; border: 1px solid var(--line); border-radius: 0.5rem; background: #fff; color: var(--ink); cursor: pointer; }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.counts { margin: 0 0 0.5rem; color: var(--muted); }
.entries { display: grid; gap: 0.3rem; padding-left: 2rem; }
.entries li { padding: 0.3rem 0.5rem; background: #fff; border: 1px solid var(--soft); border-radius: 0.4rem; }
.entries li.warning { border-color: var(--warn); background: var(--warn-soft); color: var(--warn); }
.toast { position: fixed; inset: auto 1rem 1rem auto; max-width: 18rem; padding: 0.6rem 0.9rem; border-left: 4px solid var(--warn); background: var(--warn-soft); color: var(--warn); border-radius: 0.4rem; box-shadow: 0 4px 12px rgb(0 0 0 / 0.15); }
.toast[hidden] { display: none; }
```

# TypeScript

```typescript
// ── El registro: entradas tipadas y suscriptores con un tipo de función ───
type Level = 'info' | 'order' | 'warning';
type LogEntry =
  | { readonly level: 'info'; readonly message: string }
  | { readonly level: 'order'; readonly orderId: string; readonly totalCents: number }
  | { readonly level: 'warning'; readonly sku: string; readonly message: string };
type LogListener = (entry: LogEntry, position: number) => void;
type Unsubscribe = () => void;

class ActivityLog {
  readonly #entries: LogEntry[] = [];
  #listeners: LogListener[] = [];

  // Devuelve la función que da de baja: el tipo dice exactamente eso.
  subscribe(listener: LogListener): Unsubscribe {
    this.#listeners.push(listener);
    return () => {
      this.#listeners = this.#listeners.filter((item) => item !== listener);
    };
  }

  add(entry: LogEntry): void {
    this.#entries.push(entry);
    for (const listener of this.#listeners) listener(entry, this.#entries.length);
  }

  get entries(): readonly LogEntry[] {
    return this.#entries; // quien lo lea no puede hacer push: es readonly LogEntry[]
  }
}

function assertNever(value: never): never {
  throw new Error(`Entrada no prevista: ${JSON.stringify(value)}`);
}
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

function describeEntry(entry: LogEntry): string {
  switch (entry.level) {
    case 'info':
      return `ℹ️ ${entry.message}`;
    case 'order':
      return `🧾 pedido ${entry.orderId} · ${money.format(entry.totalCents / 100)}`;
    case 'warning':
      return `⚠️ ${entry.sku}: ${entry.message}`;
    default:
      return assertNever(entry);
  }
}

// ── La interfaz: cada parte es un suscriptor independiente ────────────────
function byId(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (element === null) throw new Error(`Falta el elemento #${id}`);
  return element;
}
function selectById(id: string): HTMLSelectElement {
  const element = byId(id);
  if (!(element instanceof HTMLSelectElement)) throw new Error(`#${id} no es un <select>`);
  return element;
}
function inputById(id: string): HTMLInputElement {
  const element = byId(id);
  if (!(element instanceof HTMLInputElement)) throw new Error(`#${id} no es un <input>`);
  return element;
}
const filterSelect = selectById('filter');
const toastsToggle = inputById('toasts');
const entriesList = byId('entries');
const countsLine = byId('counts');
const toast = byId('toast');

const activity = new ActivityLog();
const toFilter = (value: string): Level | 'all' =>
  value === 'info' || value === 'order' || value === 'warning' ? value : 'all';

function entryItem(entry: LogEntry, position: number): HTMLLIElement {
  const item = document.createElement('li');
  item.value = position;
  item.className = entry.level;
  item.textContent = describeEntry(entry);
  return item;
}

// 1. La lista, que respeta el filtro.
activity.subscribe((entry, position) => {
  const filter = toFilter(filterSelect.value);
  if (filter === 'all' || filter === entry.level) entriesList.append(entryItem(entry, position));
});
// 2. Los contadores por tipo.
const counts = { info: 0, order: 0, warning: 0 };
activity.subscribe((entry) => {
  counts[entry.level] += 1;
  countsLine.textContent = `${counts.order} pedidos · ${counts.warning} avisos · ${counts.info} notas`;
});
// 3. La consola.
activity.subscribe((entry, position) => console.log(`#${position} ${describeEntry(entry)}`));
// 4. Los avisos emergentes: solo los warning, y se pueden dar de baja.
let hideTimer: number | undefined;
const showToast: LogListener = (entry) => {
  if (entry.level !== 'warning') return;
  toast.textContent = describeEntry(entry);
  toast.hidden = false;
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => (toast.hidden = true), 4000);
};
let stopToasts: Unsubscribe | null = activity.subscribe(showToast);

toastsToggle.addEventListener('change', () => {
  if (toastsToggle.checked && stopToasts === null) {
    stopToasts = activity.subscribe(showToast);
    console.log('🔔 avisos emergentes activados');
  } else if (!toastsToggle.checked && stopToasts !== null) {
    stopToasts();
    stopToasts = null;
    toast.hidden = true;
    console.log('🔕 avisos emergentes desactivados');
  }
});

filterSelect.addEventListener('change', () => {
  const filter = toFilter(filterSelect.value);
  const items = activity.entries
    .map((entry, index) => [entry, index + 1] as const)
    .filter(([entry]) => filter === 'all' || entry.level === filter)
    .map(([entry, position]) => entryItem(entry, position));
  entriesList.replaceChildren(...items);
  console.log(`🔎 filtro: ${filter} → ${items.length} de ${activity.entries.length} entradas`);
});

// Datos de la simulación: cada clic toma el siguiente de su tipo.
const ORDERS = [['P-3001', 38500], ['P-3002', 12000], ['P-3003', 64250]] as const;
const LOW_STOCK = [['MOL-02', 'quedan 2 bolsas de mole negro'], ['CAF-CHI', 'quedan 3 bolsas de café de Chiapas']] as const;
const NOTES = ['Llegó el pedido del proveedor de cacao', 'Corte de caja a las 15:00'] as const;
const used = { order: 0, warning: 0, info: 0 };

byId('actions').addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const kind = event.target.closest('button')?.dataset.simulate;
  if (kind !== 'order' && kind !== 'warning' && kind !== 'info') return;
  const index = used[kind]++; // kind ya es Level: used[kind] siempre existe
  if (kind === 'order') {
    const [orderId, totalCents] = ORDERS[index % ORDERS.length];
    activity.add({ level: 'order', orderId, totalCents });
  } else if (kind === 'warning') {
    const [sku, message] = LOW_STOCK[index % LOW_STOCK.length];
    activity.add({ level: 'warning', sku, message });
  } else {
    activity.add({ level: 'info', message: NOTES[index % NOTES.length] });
  }
});

activity.add({ level: 'info', message: 'Turno de mañana abierto' });
console.log('Listo: pulsa «Nuevo pedido», «Aviso de inventario» o «Nota del turno»; prueba el filtro y desactiva los avisos');
```
