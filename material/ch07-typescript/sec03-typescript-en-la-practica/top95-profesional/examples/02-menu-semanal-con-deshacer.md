---
example_description: "El menú semanal de una cocina económica con un almacén tipado: una clase genérica Store<S, A> con un reductor puro, acciones como unión discriminada (switch exhaustivo con never), suscriptores que pintan el DOM e historial para deshacer y rehacer; el estado es de solo lectura y está congelado"
example_tags: "typescript|profesional|store|reducer|uniones-discriminadas|genericos|clases|deshacer|readonly|dom|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Menú de la semana · Cocina Doña Chela</h1>
  <table class="week">
    <caption>Plato del día (precio por comida)</caption>
    <thead><tr><th scope="col">Día</th><th scope="col">Plato</th><th scope="col"><span class="visually-hidden">Acciones</span></th></tr></thead>
    <tbody id="days"></tbody>
  </table>
  <p class="summary" id="summary" aria-live="polite"></p>
  <div class="actions" role="group" aria-label="Historial">
    <button type="button" id="undo">↩️ Deshacer</button>
    <button type="button" id="redo">↪️ Rehacer</button>
    <button type="button" id="clear">Vaciar la semana</button>
  </div>
  <ol class="log" aria-label="Registro de acciones"></ol>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #cbd2d9; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: #f5f7fa; }
main { max-width: 34rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.75rem; }
.week { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid var(--line); }
caption { text-align: start; font-weight: 600; padding-bottom: 0.3rem; }
th, td { padding: 0.35rem 0.5rem; border-bottom: 1px solid var(--line); text-align: start; }
select, button { font: inherit; color: inherit; padding: 0.2rem 0.5rem; border: 1px solid #7b8794; border-radius: 0.4rem; background: #fff; }
button { cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: 0.55; }
select { max-width: 100%; }
.actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.summary { font-weight: 600; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: #fff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; color: var(--muted); }
```

# TypeScript

```typescript
// Menú semanal con deshacer y rehacer.
//
// Decisiones de diseño:
// - El estado cambia SOLO a través de acciones: una unión discriminada que un reductor puro
//   convierte en un estado nuevo (switch exhaustivo con never: una acción nueva sin tratar
//   no compila). La clase Store<S, A> no sabe nada de menús: sirve para cualquier estado.
// - El estado es Readonly en los tipos y además está congelado en ejecución (lección 1:
//   readonly se borra; Object.freeze no). El modo estricto convierte un descuido en TypeError.
// - Deshacer y rehacer guardan estados enteros, que son baratos porque nunca se modifican.
// - La interfaz se suscribe al almacén y se repinta entera; el foco vuelve al control que
//   lo tenía, para no perderse con cada cambio.
//
// Alcance: todo el curso hasta el módulo «TypeScript en la práctica».

// ── Un almacén genérico con historial ─────────────────────────────────────
type Listener<S, A> = (state: S, action: A | 'undo' | 'redo') => void;

class Store<S, A extends { type: string }> {
  #past: S[] = [];
  #future: S[] = [];
  #listeners = new Set<Listener<S, A>>();

  constructor(private state: S, private readonly reducer: (state: S, action: A) => S) {}

  get current(): S {
    return this.state;
  }
  get canUndo(): boolean {
    return this.#past.length > 0;
  }
  get canRedo(): boolean {
    return this.#future.length > 0;
  }
  dispatch(action: A): void {
    const next = this.reducer(this.state, action);
    if (next === this.state) return; // nada cambió: ni historial ni aviso
    this.#past.push(this.state);
    this.#future = [];
    this.#set(next, action);
  }
  undo(): void {
    const previous = this.#past.pop();
    if (previous === undefined) return;
    this.#future.push(this.state);
    this.#set(previous, 'undo');
  }
  redo(): void {
    const next = this.#future.pop();
    if (next === undefined) return;
    this.#past.push(this.state);
    this.#set(next, 'redo');
  }
  subscribe(listener: Listener<S, A>): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }
  #set(state: S, action: A | 'undo' | 'redo'): void {
    this.state = state;
    for (const listener of this.#listeners) listener(state, action);
  }
}

// ── El dominio: días, platos, estado y acciones ───────────────────────────
const DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'] as const;
type Day = (typeof DAYS)[number];
const DISHES = {
  mole: { name: 'Mole poblano', cents: 9500 },
  pozole: { name: 'Pozole rojo', cents: 8500 },
  enchiladas: { name: 'Enchiladas verdes', cents: 7500 },
  chiles: { name: 'Chiles en nogada', cents: 12000 },
} as const satisfies Record<string, { name: string; cents: number }>;
type DishId = keyof typeof DISHES;
type WeekMenu = Readonly<Record<Day, DishId | null>>;
type Action =
  | { type: 'assign'; day: Day; dish: DishId }
  | { type: 'clear-day'; day: Day }
  | { type: 'clear-week' };

const isDishId = (value: string): value is DishId => Object.hasOwn(DISHES, value);
const isDay = (value: string | undefined): value is Day => DAYS.some((day) => day === value);

function reduce(menu: WeekMenu, action: Action): WeekMenu {
  switch (action.type) {
    case 'assign':
      return menu[action.day] === action.dish ? menu : Object.freeze({ ...menu, [action.day]: action.dish });
    case 'clear-day':
      return menu[action.day] === null ? menu : Object.freeze({ ...menu, [action.day]: null });
    case 'clear-week':
      return DAYS.every((day) => menu[day] === null) ? menu : EMPTY_WEEK;
    default: {
      const unhandled: never = action;
      return unhandled;
    }
  }
}
const EMPTY_WEEK: WeekMenu = Object.freeze({ lunes: null, martes: null, miércoles: null, jueves: null, viernes: null });
const INITIAL: WeekMenu = Object.freeze({ ...EMPTY_WEEK, lunes: 'mole', miércoles: 'pozole' });
const store = new Store<WeekMenu, Action>(INITIAL, reduce);

// ── La interfaz ───────────────────────────────────────────────────────────
function $<T extends Element>(selector: string, type: new () => T): T {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Falta «${selector}» o no es un ${type.name}`);
  return element;
}
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const tbody = $('#days', HTMLTableSectionElement);
const summary = $('#summary', HTMLParagraphElement);
const undoButton = $('#undo', HTMLButtonElement);
const redoButton = $('#redo', HTMLButtonElement);
const logList = $('.log', HTMLOListElement);
const report = (text: string): void => {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
};

function describe(menu: WeekMenu): string {
  const planned = DAYS.filter((day) => menu[day] !== null).length;
  const cents = DAYS.reduce((sum, day) => {
    const dish = menu[day];
    return sum + (dish === null ? 0 : DISHES[dish].cents);
  }, 0);
  return `${planned} de 5 días · ${money.format(cents / 100)} por persona`;
}

function render(menu: WeekMenu): void {
  const focusedId = document.activeElement?.id; // para devolver el foco tras repintar
  tbody.replaceChildren(...DAYS.map((day) => {
    const row = document.createElement('tr');
    const select = Object.assign(document.createElement('select'), { id: `dish-${day}` });
    select.dataset.day = day;
    select.setAttribute('aria-label', `Plato del ${day}`);
    select.append(new Option('— sin plato —', ''), ...Object.entries(DISHES).map(([id, dish]) => new Option(`${dish.name} (${money.format(dish.cents / 100)})`, id)));
    select.value = menu[day] ?? '';
    const clear = Object.assign(document.createElement('button'), { type: 'button', textContent: 'Quitar', id: `clear-${day}` });
    clear.dataset.day = day;
    clear.disabled = menu[day] === null;
    clear.setAttribute('aria-label', `Quitar el plato del ${day}`);
    const cells = [day, select, clear].map((content) => {
      const cell = document.createElement('td');
      cell.append(content);
      return cell;
    });
    row.append(...cells);
    return row;
  }));
  summary.textContent = describe(menu);
  undoButton.disabled = !store.canUndo;
  redoButton.disabled = !store.canRedo;
  if (focusedId) document.getElementById(focusedId)?.focus();
}

store.subscribe((menu, action) => {
  render(menu);
  const label = typeof action === 'string' ? action : action.type === 'assign' ? `assign ${action.day} → ${action.dish}` : action.type === 'clear-day' ? `clear-day ${action.day}` : action.type;
  report(`📝 ${label} · ${describe(menu)}`);
});

tbody.addEventListener('change', (event) => {
  if (!(event.target instanceof HTMLSelectElement)) return;
  const day = event.target.dataset.day;
  const value = event.target.value;
  if (!isDay(day)) return;
  if (value === '') store.dispatch({ type: 'clear-day', day });
  else if (isDishId(value)) store.dispatch({ type: 'assign', day, dish: value });
});
tbody.addEventListener('click', (event) => {
  const button = event.target instanceof Element ? event.target.closest('button') : null;
  const day = button?.dataset.day;
  if (isDay(day)) store.dispatch({ type: 'clear-day', day });
});
undoButton.addEventListener('click', () => store.undo());
redoButton.addEventListener('click', () => store.redo());
$('#clear', HTMLButtonElement).addEventListener('click', () => store.dispatch({ type: 'clear-week' }));

render(store.current);
try {
  (store.current as { lunes: DishId | null }).lunes = 'chiles'; // un descuido a propósito: el estado está congelado
} catch (error) {
  report(`🧊 el estado no se puede cambiar a mano: ${error instanceof Error ? error.name : 'error'}`);
}
report(`Listo: ${describe(store.current)}. Elige platos, pulsa «Quitar», «Vaciar la semana», «Deshacer» y «Rehacer»`);
```
