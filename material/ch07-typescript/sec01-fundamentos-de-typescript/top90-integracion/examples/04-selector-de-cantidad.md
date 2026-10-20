---
example_description: "Un selector de cantidad en una ficha de producto: elementos obligatorios con funciones que descartan null, un listener delegado que estrecha event.target con instanceof, data-action convertido de string a una unión de literales y un switch exhaustivo"
example_tags: "typescript|integracion|dom|null|instanceof|tipos-literales|never|eventos"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main class="card" id="card">
  <h1>Café de Chiapas · 500 g</h1>
  <p class="price">$210.00 la bolsa · quedan <span id="stock">5</span></p>
  <div class="stepper" role="group" aria-label="Cantidad">
    <button type="button" data-action="decrement" aria-label="Quitar una bolsa">−</button>
    <output id="quantity" aria-live="polite">1</output>
    <button type="button" data-action="increment" aria-label="Añadir una bolsa">+</button>
  </div>
  <p class="actions">
    <button type="button" data-action="reset">Vaciar</button>
    <!-- Un botón de un «plugin» con una acción que nuestro código no conoce: -->
    <button type="button" data-action="double">×2</button>
  </p>
  <p>Subtotal: <strong id="subtotal">$210.00</strong></p>
  <ol id="log" class="log" aria-label="Registro" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root {
  color-scheme: light;
  --ink: #1f2933;
  --line: #7b8794;
  --accent: #1d4ed8;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: var(--ink);
  background: #f5f7fa;
}
.card {
  max-width: 26rem;
  margin: 1rem auto;
  padding: 1rem 1.25rem;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 0.75rem;
}
h1 {
  font-size: 1.2rem;
  margin: 0 0 0.25rem;
}
.stepper {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}
button {
  font: inherit;
  min-width: 2.5rem;
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: #fff;
  color: var(--ink);
  cursor: pointer;
}
button:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
button:disabled {
  color: #616e7c;
  cursor: not-allowed;
}
output {
  min-width: 1.5rem;
  text-align: center;
  font-size: 1.3rem;
  font-weight: 700;
}
.log {
  font-size: 0.85rem;
  color: #3e4c59;
  padding-left: 1.25rem;
}
```

# TypeScript

```typescript
// Elementos obligatorios: si faltan, error claro en lugar de null (lección 2).
function byId(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (element === null) throw new Error(`Falta el elemento #${id}`);
  return element;
}

const card = byId('card');
const quantityOutput = byId('quantity');
const subtotalOutput = byId('subtotal');
const logList = byId('log');
const STOCK = Number(byId('stock').textContent);
const PRICE_CENTS = 21000;

// data-action es un string cualquiera del HTML: se convierte en una unión (lección 5).
type Action = 'increment' | 'decrement' | 'reset';

function toAction(value: string | undefined): Action | null {
  switch (value) {
    case 'increment':
    case 'decrement':
    case 'reset':
      return value; // aquí value ya es 'increment' | 'decrement' | 'reset'
    default:
      return null;
  }
}

function assertNever(value: never): never {
  throw new Error(`Acción no prevista: ${String(value)}`);
}

function nextQuantity(current: number, action: Action): number {
  switch (action) {
    case 'increment':
      return Math.min(STOCK, current + 1);
    case 'decrement':
      return Math.max(0, current - 1);
    case 'reset':
      return 0;
    default:
      return assertNever(action); // si mañana añades 'double' a Action, esto avisa
  }
}

let quantity = 1;

function report(message: string): void {
  console.log(message);
  const item = document.createElement('li');
  item.textContent = message;
  logList.append(item);
}

function render(): void {
  quantityOutput.textContent = String(quantity);
  subtotalOutput.textContent = `$${((quantity * PRICE_CENTS) / 100).toFixed(2)}`;
  for (const button of card.querySelectorAll('button')) {
    if (button.dataset.action === 'increment') button.disabled = quantity >= STOCK;
    if (button.dataset.action === 'decrement') button.disabled = quantity <= 0;
  }
}

// Un solo listener para todos los botones (delegación, capítulo 6).
card.addEventListener('click', (event) => {
  // event.target es EventTarget | null: instanceof lo estrecha a Element (lección 4).
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest('button');
  if (button === null) return;
  const action = toAction(button.dataset.action);
  if (action === null) {
    report(`⚠️ acción desconocida «${button.dataset.action ?? '(ninguna)'}»: se ignora`);
    return;
  }
  quantity = nextQuantity(quantity, action);
  render();
  report(`${action} → ${quantity} · ${subtotalOutput.textContent}`);
});

render();
console.log('Listo: pulsa + y − (hay 5 bolsas), «Vaciar» o «×2»');
```
