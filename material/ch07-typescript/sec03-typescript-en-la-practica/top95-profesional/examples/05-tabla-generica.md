---
example_description: "Una clase DataTable<T> que pinta cualquier lista de objetos como una tabla ordenable y filtrable: cada columna es un Column<T, K> con su clave (keyof T) y un formateador que recibe T[K]; las cabeceras son botones con aria-sort y un aviso aria-live cuenta el resultado. La misma clase sirve para dos tablas con tipos distintos"
example_tags: "typescript|profesional|genericos|keyof|tipos-indexados|clases|tabla|ordenar|filtrar|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Museos de la Ciudad de México</h1>
  <section aria-labelledby="museums-title">
    <h2 id="museums-title">Entradas vendidas en octubre</h2>
    <div id="museums"></div>
  </section>
  <section aria-labelledby="events-title">
    <h2 id="events-title">Próximas actividades</h2>
    <div id="events"></div>
  </section>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #cbd2d9; --accent: #9a3412; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: #f5f7fa; }
main { max-width: 36rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.5rem; }
h2 { font-size: 1rem; margin: 1rem 0 0.4rem; }
.filter { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem; }
.filter input { font: inherit; color: inherit; padding: 0.2rem 0.4rem; border: 1px solid #7b8794; border-radius: 0.4rem; background: #fff; }
.scroll { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid var(--line); font-variant-numeric: tabular-nums; }
th, td { padding: 0.3rem 0.5rem; border-bottom: 1px solid var(--line); text-align: start; }
td.number, th.number { text-align: end; }
th button { font: inherit; font-weight: 700; color: var(--accent); padding: 0; border: 0; background: none; cursor: pointer; }
th button::after { content: ' ↕'; color: var(--muted); }
th[aria-sort="ascending"] button::after { content: ' ▲'; }
th[aria-sort="descending"] button::after { content: ' ▼'; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.count { margin: 0.3rem 0 0; color: var(--muted); font-size: 0.9rem; }
```

# TypeScript

```typescript
// Tabla genérica ordenable y filtrable.
//
// Decisiones de diseño:
// - Una columna sabe su clave (K extends keyof T) y formatea un valor de tipo T[K]. La lista
//   de columnas es un tipo mapeado indexado ({ [K in keyof T]: Column<T, K> }[keyof T]): así
//   cada columna conserva su propia relación clave/valor dentro de la unión (módulo 2).
// - Ordenar compara los valores crudos (números como números, textos con Intl.Collator), no
//   el texto formateado: «$1,200» no debe ir antes que «$950».
// - Las cabeceras son <button> dentro de <th> con aria-sort, y un párrafo aria-live anuncia
//   el resultado. El filtro busca en el texto que ve el usuario.
// - DataTable<T> no sabe nada de museos: la página crea dos tablas con tipos distintos.
//
// Alcance: todo el curso hasta el módulo «TypeScript en la práctica».

type Column<T, K extends keyof T> = {
  key: K;
  label: string;
  format?: (value: T[K]) => string;
  numeric?: boolean;
};
type AnyColumn<T> = { [K in keyof T]: Column<T, K> }[keyof T];
type SortState<T> = { key: keyof T; direction: 'ascending' | 'descending' } | null;

const collator = new Intl.Collator('es-MX', { sensitivity: 'base', numeric: true });

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return collator.compare(String(a), String(b));
}

class DataTable<T> {
  #sort: SortState<T> = null;
  #query = '';
  #table = document.createElement('table');
  #count = Object.assign(document.createElement('p'), { className: 'count' });

  constructor(
    private readonly container: HTMLElement,
    private readonly rows: readonly T[],
    private readonly columns: readonly AnyColumn<T>[],
    private readonly noun: string,
  ) {
    this.#count.setAttribute('aria-live', 'polite');
    const label = Object.assign(document.createElement('label'), { textContent: `Filtrar ${noun}` });
    const input = Object.assign(document.createElement('input'), { type: 'search' });
    input.id = `${container.id}-filter`;
    label.htmlFor = input.id;
    input.addEventListener('input', () => {
      this.#query = input.value.trim();
      this.#render();
    });
    const filter = Object.assign(document.createElement('p'), { className: 'filter' });
    filter.append(label, input);
    const scroll = Object.assign(document.createElement('div'), { className: 'scroll' });
    scroll.append(this.#table);
    container.replaceChildren(filter, scroll, this.#count);
    this.#render();
  }

  sortBy(key: keyof T): void {
    const ascending = this.#sort?.key !== key || this.#sort.direction === 'descending';
    this.#sort = { key, direction: ascending ? 'ascending' : 'descending' };
    this.#render();
    const column = this.columns.find((item) => item.key === key);
    const direction = ascending ? 'ascendente' : 'descendente';
    this.#count.textContent = `${this.#count.textContent} Ordenado por ${column?.label ?? String(key)}, ${direction}.`;
    const first = this.#table.querySelector('tbody td')?.textContent ?? '—';
    console.log(`↕ ${this.noun} por ${column?.label ?? String(key)}, ${direction} → primero: ${first}`);
  }

  #cellText<K extends keyof T>(row: T, column: Column<T, K>): string {
    const value = row[column.key]; // T[K]
    return column.format ? column.format(value) : String(value);
  }

  #visibleRows(): T[] {
    const needle = this.#query.toLocaleLowerCase('es-MX');
    const filtered = this.rows.filter((row) => needle === '' ||
      this.columns.some((column) => this.#cellText(row, column).toLocaleLowerCase('es-MX').includes(needle)));
    const sort = this.#sort;
    if (sort === null) return filtered;
    const sign = sort.direction === 'ascending' ? 1 : -1;
    return filtered.toSorted((a, b) => sign * compareValues(a[sort.key], b[sort.key]));
  }

  #render(): void {
    const head = document.createElement('tr');
    for (const column of this.columns) {
      const th = Object.assign(document.createElement('th'), { scope: 'col', className: column.numeric ? 'number' : '' });
      const button = Object.assign(document.createElement('button'), { type: 'button', textContent: column.label });
      button.addEventListener('click', () => {
        this.sortBy(column.key);
        // La tabla se ha repintado: el foco vuelve al botón nuevo de la misma columna.
        const again = this.#table.querySelector(`th:nth-child(${this.columns.indexOf(column) + 1}) button`);
        if (again instanceof HTMLButtonElement) again.focus();
      });
      if (this.#sort?.key === column.key) th.setAttribute('aria-sort', this.#sort.direction);
      th.append(button);
      head.append(th);
    }
    const rows = this.#visibleRows();
    const body = document.createElement('tbody');
    body.append(...rows.map((row) => {
      const tr = document.createElement('tr');
      tr.append(...this.columns.map((column) =>
        Object.assign(document.createElement('td'), { textContent: this.#cellText(row, column), className: column.numeric ? 'number' : '' })));
      return tr;
    }));
    const thead = document.createElement('thead');
    thead.append(head);
    this.#table.replaceChildren(thead, body);
    this.#count.textContent = `${rows.length} de ${this.rows.length} ${this.noun}.`;
  }
}

// ── Dos tablas con tipos distintos ────────────────────────────────────────
type MuseumSales = { museum: string; borough: string; tickets: number; revenue: number };
type Activity = { title: string; museum: string; date: string; free: boolean };

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
const count = new Intl.NumberFormat('es-MX');
const day = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', timeZone: 'UTC' });

function $<T extends Element>(selector: string, type: new () => T): T {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Falta «${selector}» o no es un ${type.name}`);
  return element;
}

const sales = new DataTable<MuseumSales>($('#museums', HTMLDivElement), [
  { museum: 'Museo Nacional de Antropología', borough: 'Miguel Hidalgo', tickets: 41250, revenue: 4125000 },
  { museum: 'Museo Frida Kahlo', borough: 'Coyoacán', tickets: 18900, revenue: 5103000 },
  { museum: 'Museo Soumaya', borough: 'Miguel Hidalgo', tickets: 35600, revenue: 0 },
  { museum: 'Palacio de Bellas Artes', borough: 'Cuauhtémoc', tickets: 27300, revenue: 2457000 },
], [
  { key: 'museum', label: 'Museo' },
  { key: 'borough', label: 'Alcaldía' },
  { key: 'tickets', label: 'Entradas', numeric: true, format: (value) => count.format(value) }, // value: number
  { key: 'revenue', label: 'Ingresos', numeric: true, format: (value) => (value === 0 ? 'gratis' : money.format(value)) },
], 'museos');

const activities = new DataTable<Activity>($('#events', HTMLDivElement), [
  { title: 'Taller de papel picado', museum: 'Museo de Arte Popular', date: '2026-10-28', free: true },
  { title: 'Concierto de son jarocho', museum: 'Palacio de Bellas Artes', date: '2026-11-07', free: false },
  { title: 'Visita nocturna', museum: 'Museo Nacional de Antropología', date: '2026-10-31', free: false },
], [
  { key: 'title', label: 'Actividad' },
  { key: 'museum', label: 'Museo' },
  { key: 'date', label: 'Fecha', format: (value) => day.format(new Date(`${value}T00:00:00Z`)) }, // value: string
  { key: 'free', label: 'Precio', format: (value) => (value ? 'gratis' : 'con entrada') }, // value: boolean
], 'actividades');

// El orden inicial usa la misma API que los botones: dos veces, de más a menos.
sales.sortBy('tickets');
sales.sortBy('tickets');
activities.sortBy('date');
console.log('Listo: pulsa las cabeceras para ordenar (dos veces cambia el sentido) o escribe en un filtro');
```
