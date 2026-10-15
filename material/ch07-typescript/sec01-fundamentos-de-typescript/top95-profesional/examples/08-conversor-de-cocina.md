---
example_description: "Una receta escalable con conversor de unidades: masas y volúmenes como uniones de literales con sus tablas as const, una función convert con sobrecargas que impide mezclar masa y volumen al compilar, y la conversión de textos de los <select> a esas uniones antes de llamarla"
example_tags: "typescript|profesional|sobrecargas|tipos-literales|as-const|estrechamiento|formularios|recetas"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>Pan de muerto</h1>
  <form id="recipe-form" class="card">
    <label>Porciones <input id="servings" type="number" min="1" max="24" value="8"></label>
    <fieldset>
      <legend>Unidades</legend>
      <label><input type="radio" name="system" value="metric" checked> Métricas</label>
      <label><input type="radio" name="system" value="us"> De EE. UU.</label>
    </fieldset>
  </form>
  <ul id="ingredients" class="ingredients" aria-live="polite"></ul>
  <form id="converter" class="card converter">
    <h2>Conversor rápido</h2>
    <label>Cantidad <input id="amount" type="number" min="0" step="any" value="2"></label>
    <label>De <select id="from"><optgroup label="Masa"><option value="g">g</option><option value="kg">kg</option><option value="oz">oz</option><option value="lb">lb</option></optgroup><optgroup label="Volumen"><option value="ml">ml</option><option value="l">l</option><option value="cup" selected>taza</option><option value="tbsp">cucharada</option><option value="tsp">cucharadita</option></optgroup></select></label>
    <label>A <select id="to"><optgroup label="Masa"><option value="g">g</option><option value="kg">kg</option><option value="oz">oz</option><option value="lb">lb</option></optgroup><optgroup label="Volumen"><option value="ml" selected>ml</option><option value="l">l</option><option value="cup">taza</option><option value="tbsp">cucharada</option><option value="tsp">cucharadita</option></optgroup></select></label>
    <button type="submit">Convertir</button>
    <output id="result" aria-live="polite"></output>
  </form>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #7b8794; --soft: #e5d3c0; --accent: #9a3412; --danger: #b91c1c; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.5; color: var(--ink); background: #fff8f0; }
.app { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.35rem; margin: 0 0 0.75rem; }
h2 { font-size: 1.05rem; margin: 0 0 0.5rem; width: 100%; }
.card { display: flex; flex-wrap: wrap; align-items: end; gap: 0.5rem 1rem; padding: 0.75rem 1rem; background: #fff; border: 1px solid var(--soft); border-radius: 0.75rem; margin-bottom: 1rem; }
fieldset { display: flex; gap: 1rem; border: 1px solid var(--soft); border-radius: 0.5rem; margin: 0; }
input, select, button { font: inherit; }
input[type="number"] { width: 5rem; padding: 0.25rem 0.4rem; border: 1px solid var(--line); border-radius: 0.4rem; }
select { padding: 0.25rem; }
button { padding: 0.35rem 0.9rem; border: 0; border-radius: 0.5rem; background: var(--accent); color: #fff; cursor: pointer; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.ingredients { list-style: none; padding: 0; margin: 0 0 1rem; display: grid; gap: 0.25rem; }
.ingredients li { display: flex; justify-content: space-between; padding: 0.3rem 0.75rem; background: #fff; border-bottom: 1px solid var(--soft); }
.ingredients .amount { font-variant-numeric: tabular-nums; font-weight: 600; }
output { width: 100%; font-weight: 600; }
output.error { color: var(--danger); }
```

# TypeScript

```typescript
// ── Unidades: dos familias que no se pueden mezclar ───────────────────────
type MassUnit = 'g' | 'kg' | 'oz' | 'lb';
type VolumeUnit = 'ml' | 'l' | 'cup' | 'tbsp' | 'tsp';
type Unit = MassUnit | VolumeUnit;
type System = 'metric' | 'us';
type Ingredient = { readonly name: string; readonly amount: number; readonly unit: Unit | 'pieza' };

const GRAMS = { g: 1, kg: 1000, oz: 28.3495, lb: 453.592 } as const;
const MILLILITERS = { ml: 1, l: 1000, cup: 240, tbsp: 15, tsp: 5 } as const;
const SYMBOL = { g: 'g', kg: 'kg', oz: 'oz', lb: 'lb', ml: 'ml', l: 'l', cup: 'tz', tbsp: 'cda', tsp: 'cdta', pieza: 'pza' } as const;
const BASE_SERVINGS = 8;

const RECIPE: readonly Ingredient[] = [
  { name: 'Harina de trigo', amount: 500, unit: 'g' },
  { name: 'Leche', amount: 120, unit: 'ml' },
  { name: 'Mantequilla', amount: 125, unit: 'g' },
  { name: 'Azúcar', amount: 100, unit: 'g' },
  { name: 'Huevos', amount: 3, unit: 'pieza' },
  { name: 'Agua de azahar', amount: 1, unit: 'tbsp' },
  { name: 'Levadura seca', amount: 10, unit: 'g' },
];

function toMassUnit(value: string): MassUnit | null {
  return value === 'g' || value === 'kg' || value === 'oz' || value === 'lb' ? value : null;
}
function toVolumeUnit(value: string): VolumeUnit | null {
  return value === 'ml' || value === 'l' || value === 'cup' || value === 'tbsp' || value === 'tsp' ? value : null;
}

// Sobrecargas (lección 6): masa con masa o volumen con volumen.
// convert(1, 'cup', 'g') es un error de tipos: ninguna firma lo acepta.
function convert(amount: number, from: MassUnit, to: MassUnit): number;
function convert(amount: number, from: VolumeUnit, to: VolumeUnit): number;
function convert(amount: number, from: Unit, to: Unit): number {
  const massFrom = toMassUnit(from);
  const massTo = toMassUnit(to);
  if (massFrom !== null && massTo !== null) return (amount * GRAMS[massFrom]) / GRAMS[massTo];
  const volumeFrom = toVolumeUnit(from);
  const volumeTo = toVolumeUnit(to);
  if (volumeFrom !== null && volumeTo !== null) return (amount * MILLILITERS[volumeFrom]) / MILLILITERS[volumeTo];
  throw new Error(`No se puede convertir ${from} en ${to}`); // solo si alguien se salta los tipos
}

const decimals = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 });

// Otra sobrecarga: con (cantidad, unidad) o con un ingrediente entero.
function formatAmount(amount: number, unit: Unit | 'pieza'): string;
function formatAmount(ingredient: Ingredient): string;
function formatAmount(first: number | Ingredient, unit?: Unit | 'pieza'): string {
  if (typeof first === 'number') return `${decimals.format(first)} ${SYMBOL[unit ?? 'pieza']}`;
  return `${decimals.format(first.amount)} ${SYMBOL[first.unit]}`;
}

function scale(ingredient: Ingredient, servings: number): Ingredient {
  const amount = (ingredient.amount * servings) / BASE_SERVINGS;
  return { ...ingredient, amount: ingredient.unit === 'pieza' ? Math.ceil(amount) : amount }; // 4.5 huevos → 5
}

function inSystem(ingredient: Ingredient, system: System): Ingredient {
  if (system === 'metric' || ingredient.unit === 'pieza') return ingredient;
  const mass = toMassUnit(ingredient.unit);
  if (mass !== null) {
    const grams = convert(ingredient.amount, mass, 'g');
    const unit: MassUnit = grams >= GRAMS.lb ? 'lb' : 'oz';
    return { ...ingredient, amount: convert(grams, 'g', unit), unit };
  }
  const volume = toVolumeUnit(ingredient.unit);
  if (volume === null) return ingredient;
  const ml = convert(ingredient.amount, volume, 'ml');
  const unit: VolumeUnit = ml >= MILLILITERS.cup / 4 ? 'cup' : ml >= MILLILITERS.tbsp ? 'tbsp' : 'tsp';
  return { ...ingredient, amount: convert(ml, 'ml', unit), unit };
}

// ── La interfaz ───────────────────────────────────────────────────────────
function byId(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (element === null) throw new Error(`Falta el elemento #${id}`);
  return element;
}
function controlById(id: string): HTMLInputElement | HTMLSelectElement {
  const element = byId(id);
  if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) return element;
  throw new Error(`#${id} no es un control de formulario`);
}
const recipeForm = byId('recipe-form');
const servingsInput = controlById('servings');
const list = byId('ingredients');
const amountInput = controlById('amount');
const fromSelect = controlById('from');
const toSelect = controlById('to');
const result = byId('result');

function currentSystem(): System {
  const checked = recipeForm.querySelector('input[name="system"]:checked');
  return checked instanceof HTMLInputElement && checked.value === 'us' ? 'us' : 'metric';
}

function renderRecipe(): void {
  const servings = Math.min(24, Math.max(1, Math.round(Number(servingsInput.value)) || BASE_SERVINGS));
  const system = currentSystem();
  const scaled = RECIPE.map((item) => inSystem(scale(item, servings), system));
  list.replaceChildren(
    ...scaled.map((item) => {
      const li = document.createElement('li');
      const amount = document.createElement('span');
      amount.className = 'amount';
      amount.textContent = formatAmount(item);
      li.append(item.name, amount);
      return li;
    }),
  );
  const sample = scaled.slice(0, 2).map((item) => `${item.name} ${formatAmount(item)}`).join(' · ');
  console.log(`🍞 ${servings} ${servings === 1 ? 'porción' : 'porciones'} · ${system} · ${sample}`);
}

recipeForm.addEventListener('input', renderRecipe);
recipeForm.addEventListener('submit', (event) => event.preventDefault());

byId('converter').addEventListener('submit', (event) => {
  event.preventDefault();
  const amount = Number(amountInput.value);
  // Los <select> dan strings: se convierten en uniones ANTES de llamar a convert.
  const from = toMassUnit(fromSelect.value) ?? toVolumeUnit(fromSelect.value);
  const to = toMassUnit(toSelect.value) ?? toVolumeUnit(toSelect.value);
  if (from === null || to === null) return;
  const fromText = SYMBOL[from];
  const toText = SYMBOL[to];
  // Para elegir la sobrecarga, cada familia por separado (una unión no encaja en ninguna).
  const massFrom = toMassUnit(fromSelect.value);
  const massTo = toMassUnit(toSelect.value);
  const volumeFrom = toVolumeUnit(fromSelect.value);
  const volumeTo = toVolumeUnit(toSelect.value);
  let converted: number | null = null;
  if (massFrom !== null && massTo !== null) converted = convert(amount, massFrom, massTo);
  else if (volumeFrom !== null && volumeTo !== null) converted = convert(amount, volumeFrom, volumeTo);
  const message =
    converted === null
      ? `⚠️ ${fromText} → ${toText}: no se puede convertir una masa en un volumen (o al revés) sin la densidad`
      : `⚖️ ${decimals.format(amount)} ${fromText} → ${decimals.format(converted)} ${toText}`;
  result.textContent = message;
  result.classList.toggle('error', converted === null);
  console.log(message);
});

renderRecipe();
console.log('Listo: cambia las porciones o las unidades; prueba el conversor con taza → ml y taza → g');
```
