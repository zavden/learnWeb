---
example_description: "Un gráfico de barras en canvas a partir de datos validados: ventas.json llega como unknown y un validador lo convierte en SalesReport; la métrica elegida es una clave tipada (unidades o ingresos) y una sola función dibuja cualquiera, nítida en pantallas de alta densidad y redibujada con ResizeObserver; el canvas tiene su descripción y una tabla con los mismos datos"
example_tags: "typescript|profesional|canvas|validacion|unknown|keyof|resizeobserver|intl|fetch|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1 id="title">Ventas mensuales</h1>
  <fieldset class="metric">
    <legend>Mostrar</legend>
    <label><input type="radio" name="metric" value="units" checked> Unidades</label>
    <label><input type="radio" name="metric" value="revenue"> Ingresos</label>
  </fieldset>
  <figure class="chart">
    <canvas id="chart" role="img" aria-describedby="summary"></canvas>
    <figcaption id="summary" aria-live="polite">Cargando…</figcaption>
  </figure>
  <details>
    <summary>Ver los datos en una tabla</summary>
    <table id="data"></table>
  </details>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #cbd2d9; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: #f5f7fa; }
main { max-width: 36rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.5rem; }
.metric { display: flex; flex-wrap: wrap; gap: 1rem; border: 1px solid var(--line); border-radius: 0.5rem; background: #fff; }
legend { font-weight: 600; }
.chart { margin: 0.75rem 0; padding: 0.5rem; border: 1px solid var(--line); border-radius: 0.75rem; background: #fff; }
canvas { display: block; width: 100%; height: 14rem; }
figcaption { margin-top: 0.4rem; color: var(--muted); font-size: 0.9rem; }
table { width: 100%; border-collapse: collapse; background: #fff; font-variant-numeric: tabular-nums; }
th, td { padding: 0.25rem 0.5rem; border-bottom: 1px solid var(--line); text-align: end; }
th:first-child, td:first-child { text-align: start; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
```

# TypeScript

```typescript
// Gráfico de ventas en canvas.
//
// Decisiones de diseño:
// - Los datos llegan de assets/ventas.json como unknown; parseReport() devuelve un SalesReport o
//   la lista de problemas (con su ruta). El dibujo solo trabaja con datos comprobados.
// - La métrica es una clave del tipo (Metric = 'units' | 'revenue'), y METRICS dice cómo se
//   llama y cómo se formatea cada una (satisfies Record<Metric, …>: no se puede olvidar ninguna).
// - El canvas se dibuja a la densidad de la pantalla (devicePixelRatio) y se redibuja cuando
//   cambia el ancho de su figura (ResizeObserver sobre el padre, no sobre el canvas, y solo si
//   el ancho cambió, para no provocar el bucle de ResizeObserver).
// - Accesible: el canvas es role="img" y lo describe un pie de figura con el máximo y el mínimo;
//   la tabla tiene los mismos números.
//
// Alcance: todo el curso hasta el módulo «TypeScript en la práctica».

type MonthSales = { month: `${number}-${number}`; units: number; revenue: number };
type SalesReport = { shop: string; months: MonthSales[] };
type Metric = keyof Pick<MonthSales, 'units' | 'revenue'>;

const count = new Intl.NumberFormat('es-MX');
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
const monthLabel = new Intl.DateTimeFormat('es-MX', { month: 'short', timeZone: 'UTC' });
const monthLong = new Intl.DateTimeFormat('es-MX', { month: 'short', year: 'numeric', timeZone: 'UTC' });
const METRICS = {
  units: { label: 'unidades', format: (value: number) => count.format(value) },
  revenue: { label: 'ingresos', format: (value: number) => money.format(value) },
} satisfies Record<Metric, { label: string; format: (value: number) => string }>;

// ── Validación ────────────────────────────────────────────────────────────
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isMonth = (value: unknown): value is MonthSales['month'] => typeof value === 'string' && /^\d{4}-\d{2}$/.test(value);
const isAmount = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;

function parseReport(data: unknown): SalesReport | string[] {
  if (!isRecord(data)) return ['el informe debe ser un objeto'];
  const problems: string[] = [];
  const months: MonthSales[] = [];
  if (typeof data.shop !== 'string') problems.push('shop: debe ser texto');
  if (!Array.isArray(data.months) || data.months.length === 0) problems.push('months: debe ser una lista con datos');
  else data.months.forEach((item: unknown, index) => {
    if (isRecord(item) && isMonth(item.month) && isAmount(item.units) && isAmount(item.revenue)) {
      months.push({ month: item.month, units: item.units, revenue: item.revenue });
    } else {
      problems.push(`months[${index}]: no tiene la forma { month: 'AAAA-MM', units, revenue }`);
    }
  });
  return problems.length > 0 || typeof data.shop !== 'string' ? problems : { shop: data.shop, months };
}

// ── Dibujo ────────────────────────────────────────────────────────────────
function draw(canvas: HTMLCanvasElement, months: readonly MonthSales[], metric: Metric): void {
  const context = canvas.getContext('2d');
  if (!context) return;
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = Math.round(width * ratio); // cambiar el tamaño borra y reinicia el contexto…
  canvas.height = Math.round(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0); // …así que la escala va después

  const values = months.map((month) => month[metric]); // number: las dos métricas lo son
  const max = Math.max(...values);
  const top = 22;
  const bottom = height - 24;
  const slot = width / months.length;
  context.font = '12px system-ui, sans-serif';
  context.textAlign = 'center';
  months.forEach((month, index) => {
    const value = month[metric];
    const barHeight = ((bottom - top) * value) / max;
    const x = index * slot + slot * 0.15;
    context.fillStyle = value === max ? '#9a3412' : '#c2410c';
    context.fillRect(x, bottom - barHeight, slot * 0.7, barHeight);
    context.fillStyle = '#1f2933';
    context.fillText(monthLabel.format(new Date(`${month.month}-01T00:00:00Z`)), x + slot * 0.35, height - 6);
    if (slot > 56) context.fillText(METRICS[metric].format(value), x + slot * 0.35, bottom - barHeight - 6);
  });
  context.strokeStyle = '#52606d';
  context.beginPath();
  context.moveTo(0, bottom + 0.5);
  context.lineTo(width, bottom + 0.5);
  context.stroke();
}

function describe(months: readonly MonthSales[], metric: Metric): string {
  const sorted = months.toSorted((a, b) => b[metric] - a[metric]);
  const best = sorted[0];
  const worst = sorted.at(-1);
  if (!best || !worst) return 'Sin datos';
  const name = (month: MonthSales): string => monthLong.format(new Date(`${month.month}-01T00:00:00Z`));
  const { label, format } = METRICS[metric];
  return `${label} · máximo: ${name(best)} (${format(best[metric])}) · mínimo: ${name(worst)} (${format(worst[metric])})`;
}

function fillTable(table: HTMLTableElement, months: readonly MonthSales[]): void {
  const head = document.createElement('tr');
  for (const text of ['Mes', 'Unidades', 'Ingresos']) head.append(Object.assign(document.createElement('th'), { scope: 'col', textContent: text }));
  const rows = months.map((month) => {
    const row = document.createElement('tr');
    row.append(...[monthLong.format(new Date(`${month.month}-01T00:00:00Z`)), count.format(month.units), money.format(month.revenue)]
      .map((text) => Object.assign(document.createElement('td'), { textContent: text })));
    return row;
  });
  const thead = document.createElement('thead');
  thead.append(head);
  const tbody = document.createElement('tbody');
  tbody.append(...rows);
  table.replaceChildren(thead, tbody);
}

// ── La página ─────────────────────────────────────────────────────────────
function $<T extends Element>(selector: string, type: new () => T): T {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Falta «${selector}» o no es un ${type.name}`);
  return element;
}
const canvas = $('#chart', HTMLCanvasElement);
const summary = $('#summary', HTMLElement);
const metricOf = (form: HTMLFieldSetElement): Metric => {
  const checked = form.querySelector('input:checked');
  return checked instanceof HTMLInputElement && checked.value === 'revenue' ? 'revenue' : 'units';
};

const response = await fetch('ventas.json');
const parsed = response.ok ? parseReport(await response.json()) : [`HTTP ${response.status}`];
if (Array.isArray(parsed)) {
  summary.textContent = `No se pudieron leer las ventas: ${parsed.join('; ')}`;
  console.log(`⚠️ ${summary.textContent}`);
} else {
  const report = parsed;
  const fieldset = $('.metric', HTMLFieldSetElement);
  let metric: Metric = metricOf(fieldset);
  let drawnWidth = 0;
  const redraw = (): void => {
    drawnWidth = canvas.clientWidth;
    draw(canvas, report.months, metric);
    summary.textContent = describe(report.months, metric);
    canvas.setAttribute('aria-label', `Gráfico de barras: ${METRICS[metric].label} por mes`);
  };
  $('#title', HTMLHeadingElement).textContent = `Ventas mensuales · ${report.shop}`;
  fillTable($('#data', HTMLTableElement), report.months);
  redraw();
  console.log(`📊 ${summary.textContent}`);
  fieldset.addEventListener('change', () => {
    metric = metricOf(fieldset);
    redraw();
    console.log(`📊 ${summary.textContent}`);
  });
  const figure = canvas.parentElement;
  if (figure) {
    new ResizeObserver(() => {
      if (canvas.clientWidth !== drawnWidth) redraw(); // solo si el ancho cambió
    }).observe(figure);
  }
  console.log('Listo: elige «Ingresos» o «Unidades», abre la tabla o cambia el ancho de la vista previa');
}
```
