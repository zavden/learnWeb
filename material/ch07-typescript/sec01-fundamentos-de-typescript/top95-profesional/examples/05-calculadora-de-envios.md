---
example_description: "Una calculadora de envíos guiada por una tabla de tarifas as const: zonas y velocidades como uniones de literales, plazos como tuplas, un desglose con tuplas [concepto, centavos] y un resultado ok/error que marca el campo inválido de forma accesible"
example_tags: "typescript|profesional|as-const|tipos-literales|tuplas|uniones-discriminadas|formularios|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>¿Cuánto cuesta enviar tu paquete?</h1>
  <form id="quote-form" class="form" novalidate>
    <fieldset>
      <legend>Destino</legend>
      <label><input type="radio" name="zone" value="local" checked> Misma ciudad</label>
      <label><input type="radio" name="zone" value="national"> Resto del país</label>
      <label><input type="radio" name="zone" value="pickup"> Recoger en tienda</label>
    </fieldset>
    <fieldset>
      <legend>Velocidad</legend>
      <label><input type="radio" name="speed" value="standard" checked> Estándar</label>
      <label><input type="radio" name="speed" value="express"> Express</label>
    </fieldset>
    <div class="field">
      <label for="weight">Peso (kg)</label>
      <input id="weight" type="number" inputmode="decimal" min="0.1" max="30" step="0.1" value="1" aria-describedby="weight-error">
      <p id="weight-error" class="error"></p>
    </div>
    <div class="field">
      <label><input id="insured" type="checkbox"> Asegurar el paquete (2 % del valor)</label>
      <label for="declared">Valor declarado (pesos)</label>
      <input id="declared" type="number" inputmode="numeric" min="1" max="50000" value="1000" disabled aria-describedby="declared-error">
      <p id="declared-error" class="error"></p>
    </div>
    <button type="submit" class="primary">Calcular</button>
  </form>
  <section class="result" aria-live="polite" aria-labelledby="result-title">
    <h2 id="result-title">Tu envío</h2>
    <table id="breakdown"></table>
    <p id="eta" class="eta"></p>
  </section>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #7b8794; --soft: #cbd2d9; --accent: #1d4ed8; --danger: #b91c1c; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.5; color: var(--ink); background: #f5f7fa; }
.app { max-width: 34rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.25rem; margin: 0 0 0.75rem; }
h2 { font-size: 1.05rem; margin: 0 0 0.25rem; }
.form, .result { padding: 0.75rem 1rem; background: #fff; border: 1px solid var(--soft); border-radius: 0.75rem; margin-bottom: 1rem; }
fieldset { display: flex; flex-wrap: wrap; gap: 0.25rem 1rem; border: 1px solid var(--soft); border-radius: 0.5rem; margin: 0 0 0.75rem; }
.field { display: grid; gap: 0.2rem; margin-bottom: 0.5rem; }
input, button { font: inherit; }
input[type="number"] { width: 9rem; padding: 0.3rem 0.4rem; border: 1px solid var(--line); border-radius: 0.4rem; }
input[aria-invalid="true"] { border: 2px solid var(--danger); }
.error { min-height: 1.4em; margin: 0; color: var(--danger); font-size: 0.9rem; font-weight: 600; }
button.primary { padding: 0.45rem 1rem; border: 0; border-radius: 0.5rem; background: var(--accent); color: #fff; cursor: pointer; }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
table { width: 100%; border-collapse: collapse; }
td { padding: 0.25rem 0; border-bottom: 1px solid var(--soft); }
td:last-child { text-align: end; font-variant-numeric: tabular-nums; }
tr.total td { font-weight: 700; border-bottom: 0; }
.eta { margin: 0.5rem 0 0; color: var(--muted); }
.log { font-size: 0.85rem; color: var(--muted); }
```

# TypeScript

```typescript
// ── La tabla de tarifas: los datos mandan, el código solo los recorre ─────
type Zone = 'local' | 'national' | 'pickup';
type Speed = 'standard' | 'express';
type Days = readonly [min: number, max: number];

const ZONES = {
  local: { label: 'Misma ciudad', baseCents: 6900, perKgCents: 1200, days: [1, 2] },
  national: { label: 'Resto del país', baseCents: 14900, perKgCents: 3500, days: [3, 5] },
  pickup: { label: 'Recoger en tienda', baseCents: 0, perKgCents: 0, days: [0, 0] },
} as const;
const SPEEDS = {
  standard: { label: 'Estándar', surcharge: 0, daysFaster: 0 },
  express: { label: 'Express', surcharge: 0.6, daysFaster: 1 },
} as const;
const LIMITS = { minKg: 0.1, maxKg: 30, maxDeclared: 50000, insuranceRate: 0.02 } as const;

type Line = readonly [concept: string, cents: number];
type Quote = { readonly lines: readonly Line[]; readonly totalCents: number; readonly days: Days };
type Field = 'weight' | 'declared';
type QuoteResult = { ok: true; quote: Quote } | { ok: false; field: Field; message: string };

function quoteShipping(zone: Zone, speed: Speed, weightKg: number, declaredPesos: number | null): QuoteResult {
  if (!Number.isFinite(weightKg) || weightKg < LIMITS.minKg || weightKg > LIMITS.maxKg) {
    return { ok: false, field: 'weight', message: `El peso debe estar entre ${LIMITS.minKg} y ${LIMITS.maxKg} kg` };
  }
  if (declaredPesos !== null && (!Number.isFinite(declaredPesos) || declaredPesos < 1 || declaredPesos > LIMITS.maxDeclared)) {
    return { ok: false, field: 'declared', message: `El valor declarado va de $1 a $${LIMITS.maxDeclared}` };
  }
  const rate = ZONES[zone];
  const extraKg = Math.max(0, Math.ceil(weightKg) - 1);
  const lines: Line[] = [[`${rate.label}${rate.perKgCents > 0 ? ' (incluye 1 kg)' : ''}`, rate.baseCents]];
  if (extraKg > 0 && rate.perKgCents > 0) lines.push([`${extraKg} kg adicionales`, extraKg * rate.perKgCents]);
  // En tienda no hay transporte: la velocidad no aplica.
  const effectiveSpeed: Speed = zone === 'pickup' ? 'standard' : speed;
  const { surcharge, daysFaster } = SPEEDS[effectiveSpeed];
  if (surcharge > 0) {
    const transport = lines.reduce((sum, [, cents]) => sum + cents, 0);
    lines.push([`Recargo ${SPEEDS[effectiveSpeed].label.toLowerCase()}`, Math.round(transport * surcharge)]);
  }
  if (declaredPesos !== null) lines.push(['Seguro (2 %)', Math.round(declaredPesos * 100 * LIMITS.insuranceRate)]);
  const [minDays, maxDays] = rate.days;
  const days: Days = zone === 'pickup' ? [0, 0] : [Math.max(1, minDays - daysFaster), Math.max(1, maxDays - daysFaster)];
  return { ok: true, quote: { lines, totalCents: lines.reduce((sum, [, cents]) => sum + cents, 0), days } };
}

// ── La interfaz ───────────────────────────────────────────────────────────
function byId(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (element === null) throw new Error(`Falta el elemento #${id}`);
  return element;
}
function inputById(id: string): HTMLInputElement {
  const element = byId(id);
  if (!(element instanceof HTMLInputElement)) throw new Error(`#${id} no es un <input>`);
  return element;
}
const form = byId('quote-form');
const weightInput = inputById('weight');
const insuredInput = inputById('insured');
const declaredInput = inputById('declared');
const breakdown = byId('breakdown');
const eta = byId('eta');
const logList = byId('log');
// Una propiedad por campo: con field: Field, errors[field] siempre existe.
const errors = { weight: byId('weight-error'), declared: byId('declared-error') } as const;
const inputs = { weight: weightInput, declared: declaredInput } as const;
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

function checked(name: string): string {
  const input = form.querySelector(`input[name="${name}"]:checked`);
  return input instanceof HTMLInputElement ? input.value : '';
}
const toZone = (value: string): Zone => (value === 'national' || value === 'pickup' ? value : 'local');
const toSpeed = (value: string): Speed => (value === 'express' ? 'express' : 'standard');
const formatDays = ([min, max]: Days): string => (max === 0 ? 'hoy mismo' : `${min}–${max} días hábiles`);

function report(message: string): void {
  console.log(message);
  const item = document.createElement('li');
  item.textContent = message;
  logList.append(item);
}

function calculate(): void {
  const zone = toZone(checked('zone'));
  const speed = toSpeed(checked('speed'));
  const weight = weightInput.value === '' ? Number.NaN : Number(weightInput.value);
  const declared = insuredInput.checked ? Number(declaredInput.value) : null;
  const result = quoteShipping(zone, speed, weight, declared);
  for (const field of ['weight', 'declared'] as const) {
    const invalid = !result.ok && result.field === field;
    inputs[field].setAttribute('aria-invalid', String(invalid));
    errors[field].textContent = invalid ? result.message : '';
  }
  if (!result.ok) {
    report(`⚠️ ${result.field}: ${result.message}`);
    inputs[result.field].focus();
    return;
  }
  const { lines, totalCents, days } = result.quote;
  breakdown.replaceChildren(
    ...[...lines, ['Total', totalCents] as const].map(([concept, cents]) => {
      const row = document.createElement('tr');
      if (concept === 'Total') row.className = 'total';
      const label = document.createElement('td');
      label.textContent = concept;
      const amount = document.createElement('td');
      amount.textContent = money.format(cents / 100);
      row.append(label, amount);
      return row;
    }),
  );
  eta.textContent = `Llega en ${formatDays(days)}.`;
  report(`📦 ${zone} · ${speed} · ${weight} kg${declared === null ? '' : ` · seguro $${declared}`} → ${money.format(totalCents / 100)} (${formatDays(days)})`);
}

insuredInput.addEventListener('change', () => {
  declaredInput.disabled = !insuredInput.checked;
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  calculate();
});

calculate();
console.log('Listo: cambia destino, velocidad, peso o seguro y pulsa «Calcular»');
```
