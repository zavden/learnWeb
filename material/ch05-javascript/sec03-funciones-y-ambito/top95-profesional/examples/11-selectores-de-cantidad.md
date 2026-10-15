---
example_description: "Una familia de selectores de cantidad accesibles creada con una fábrica: cada selector guarda su estado en un closure, admite teclado (flechas, RePág, Inicio, Fin), formatos con Intl y se destruye limpiando sus oyentes"
example_tags: "javascript|profesional|closures|fabricas|accesibilidad|interfaz"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>Selectores de cantidad</h1>
  <p class="intro">Todos salen de la misma fábrica. Prueba con el ratón y con el teclado: flechas, <kbd>RePág</kbd>/<kbd>AvPág</kbd>, <kbd>Inicio</kbd> y <kbd>Fin</kbd>, o escribe un valor y pulsa <kbd>Intro</kbd>.</p>

  <div class="grid">
    <section class="card" aria-labelledby="cart-title">
      <h2 id="cart-title">Cesta</h2>
      <ul id="cart-lines" class="cart-lines"></ul>
      <p class="total">Total: <output id="cart-total" aria-live="polite">—</output></p>
    </section>

    <section class="card" aria-labelledby="booking-title">
      <h2 id="booking-title">Reserva de mesa</h2>
      <div id="adults"></div>
      <div id="children"></div>
      <p class="hint" id="booking-summary" aria-live="polite"></p>
    </section>

    <section class="card" aria-labelledby="climate-title">
      <h2 id="climate-title">Calefacción</h2>
      <div id="thermostat"></div>
      <p class="hint" id="thermostat-hint" aria-live="polite"></p>
    </section>

    <section class="card" aria-labelledby="session-title">
      <h2 id="session-title">Sala de reuniones</h2>
      <div id="duration"></div>
      <p class="hint" id="duration-hint" aria-live="polite"></p>
    </section>
  </div>
</main>
```

# CSS

```css
:root {
  --text: #1f2933;
  --muted: #52606d;
  --page: #f5f7fa;
  --surface: #ffffff;
  --border: #c3cad3;
  --accent: #1d4ed8;
  --ok: #166534;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  line-height: 1.5;
  color: var(--text);
  background: var(--page);
}
.app {
  max-width: 64rem;
  margin: 0 auto;
  padding: 1.5rem 1rem 2.5rem;
}
h1 {
  margin: 0;
  font-size: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);
}
h2 {
  margin-top: 0;
  font-size: 1.1rem;
}
.intro,
.hint {
  color: var(--muted);
}
.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
}
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
}
.field-label {
  display: block;
  font-weight: 600;
  margin: 0.5rem 0 0.25rem;
}
.stepper {
  display: inline-flex;
  align-items: stretch;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  overflow: hidden;
}
.stepper button {
  font: inherit;
  font-size: 1.15rem;
  width: 2.5rem;
  border: 0;
  background: #eef2f7;
  color: var(--accent);
  cursor: pointer;
}
.stepper button:disabled {
  color: #7b8794;
  cursor: not-allowed;
}
.stepper input {
  font: inherit;
  width: 7.5rem;
  text-align: center;
  border: 0;
  border-inline: 1px solid #7b8794;
  color: var(--text);
}
.stepper button:focus-visible,
.stepper input:focus-visible,
.remove:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: -3px;
}
.cart-lines {
  list-style: none;
  padding: 0;
  margin: 0;
}
.cart-lines li {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.25rem 0.75rem;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
}
.line-total {
  font-variant-numeric: tabular-nums;
}
.remove {
  font: inherit;
  font-size: 0.9rem;
  border: 0;
  background: none;
  color: var(--accent);
  text-decoration: underline;
  cursor: pointer;
  justify-self: start;
}
.total {
  font-weight: 700;
}
.eco {
  color: var(--ok);
  font-weight: 600;
}
```

# JavaScript

```javascript
// FAMILIA DE SELECTORES DE CANTIDAD creada con una fábrica.
//
// Decisiones:
// - createStepper(contenedor, opciones) construye el control y devuelve una API
//   pequeña (getValue, setValue, setMax, destroy). El valor y el máximo actual viven en
//   variables del closure: no hay estado global ni clases.
// - Accesible: <label> asociado, role="spinbutton" con aria-valuenow/min/max y
//   aria-valuetext (el texto con unidades), botones con aria-label, teclado del patrón
//   «spinbutton» de WAI-ARIA y botones desactivados en los límites.
// - Cada selector recibe cómo formatear y cómo leer su valor (funciones como opciones):
//   euros, °C con Intl, minutos como «1 h 30 min».
// - El valor se redondea al paso con toFixed para no arrastrar ruido de coma flotante
//   (21.5 + 0.5 no debe acabar en 21.999999).
// - destroy quita los oyentes y los nodos: los closures dejan de estar alcanzables y se
//   liberan (lección «Closures», memoria).
//
// Alcance: módulos 1-3. createElement, append, remove, los eventos (click, keydown,
// change) y preventDefault se estudian en el capítulo 6.

const activeSteppers = new Set();
const onlyNumberChars = (text) =>
  [...text.replace(',', '.')].filter((char) => (char >= '0' && char <= '9') || char === '.' || char === '-').join('');

function createStepper(container, {
  id, label, min = 0, max = 99, step = 1, value = min,
  format = (number) => String(number),
  parse = (text) => Number(onlyNumberChars(text)),
  onChange = () => {},
}) {
  let currentMax = max;
  const decimals = (String(step).split('.')[1] ?? '').length;
  const clamp = (number) => Math.min(currentMax, Math.max(min, number));
  const snap = (number) => Number((Math.round(number / step) * step).toFixed(decimals));
  let current = clamp(snap(value));

  // ── Nodos ──
  const labelElement = document.createElement('label');
  labelElement.className = 'field-label';
  labelElement.htmlFor = `${id}-input`;
  labelElement.textContent = label;
  const minus = document.createElement('button');
  const plus = document.createElement('button');
  const input = document.createElement('input');
  minus.type = 'button';
  plus.type = 'button';
  minus.textContent = '−';
  plus.textContent = '+';
  minus.setAttribute('aria-label', `Menos: ${label}`);
  plus.setAttribute('aria-label', `Más: ${label}`);
  input.id = `${id}-input`;
  input.autocomplete = 'off';
  input.inputMode = decimals > 0 ? 'decimal' : 'numeric';
  input.setAttribute('role', 'spinbutton');
  input.setAttribute('aria-valuemin', min);
  const group = document.createElement('div');
  group.className = 'stepper';
  group.append(minus, input, plus);
  container.append(labelElement, group);

  function paint() {
    input.value = format(current);
    input.setAttribute('aria-valuenow', current);
    input.setAttribute('aria-valuemax', currentMax);
    input.setAttribute('aria-valuetext', format(current));
    minus.disabled = current <= min;
    plus.disabled = current >= currentMax;
  }
  function update(next) {
    const previous = current;
    current = clamp(snap(next));
    paint(); // siempre: también deshace lo que se haya escrito mal en el campo
    if (current !== previous) onChange(current, previous);
  }

  // Los oyentes se guardan con nombre para poder quitarlos en destroy.
  const onMinus = () => update(current - step);
  const onPlus = () => update(current + step);
  const onKeydown = (event) => {
    const targets = {
      ArrowUp: current + step,
      ArrowDown: current - step,
      PageUp: current + step * 10,
      PageDown: current - step * 10,
      Home: min,
      End: currentMax,
    };
    if (event.key in targets) {
      event.preventDefault();
      update(targets[event.key]);
    }
  };
  const onCommit = () => {
    const parsed = input.value.trim() === '' ? NaN : parse(input.value);
    update(Number.isFinite(parsed) ? parsed : current); // vacío o ilegible → se queda como estaba
  };
  minus.addEventListener('click', onMinus);
  plus.addEventListener('click', onPlus);
  input.addEventListener('keydown', onKeydown);
  input.addEventListener('change', onCommit);
  paint();

  const api = {
    getValue: () => current,
    setValue: (next) => update(next),
    setMax: (nextMax) => {
      currentMax = Math.max(min, nextMax);
      update(current); // si el valor ya no cabe, se recorta
    },
    destroy: () => {
      minus.removeEventListener('click', onMinus);
      plus.removeEventListener('click', onPlus);
      input.removeEventListener('keydown', onKeydown);
      input.removeEventListener('change', onCommit);
      labelElement.remove();
      group.remove();
      activeSteppers.delete(api);
      console.log(`🗑 selector «${label}» destruido · activos: ${activeSteppers.size}`);
    },
  };
  activeSteppers.add(api);
  return api;
}

// ── 1. Cesta: un selector por línea, con el stock como máximo ───────────
const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const PRODUCTS = [
  { sku: 'TE-01', name: 'Té verde sencha 100 g', cents: 690, stock: 12 },
  { sku: 'CA-07', name: 'Café de Etiopía 250 g', cents: 895, stock: 4 },
  { sku: 'AC-03', name: 'Tetera de hierro 0,8 l', cents: 3450, stock: 2 },
];
const cartList = document.querySelector('#cart-lines');
const cartTotal = document.querySelector('#cart-total');
const cartSteppers = new Map(); // sku → API del selector

function refreshCartTotal() {
  const cents = PRODUCTS.filter((product) => cartSteppers.has(product.sku))
    .reduce((sum, product) => sum + product.cents * cartSteppers.get(product.sku).getValue(), 0);
  cartTotal.textContent = money.format(cents / 100);
}

for (const product of PRODUCTS) {
  const item = document.createElement('li');
  const lineTotal = document.createElement('span');
  lineTotal.className = 'line-total';
  const control = document.createElement('div');
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'remove';
  remove.textContent = 'Quitar';
  remove.setAttribute('aria-label', `Quitar ${product.name} de la cesta`);
  item.append(control, lineTotal, remove);
  cartList.append(item);

  const showLine = (qty) => {
    lineTotal.textContent = money.format((product.cents * qty) / 100);
  };
  const stepper = createStepper(control, {
    id: `qty-${product.sku}`,
    label: `${product.name} (${money.format(product.cents / 100)}, quedan ${product.stock})`,
    min: 1,
    max: product.stock,
    value: 1,
    parse: (text) => Number.parseInt(onlyNumberChars(text), 10),
    onChange: (qty, previous) => {
      showLine(qty);
      refreshCartTotal();
      console.log(`🛒 ${product.sku}: ${previous} → ${qty}`);
    },
  });
  cartSteppers.set(product.sku, stepper);
  showLine(stepper.getValue());
  remove.addEventListener('click', () => {
    stepper.destroy(); // sus closures (y su estado) dejan de estar alcanzables
    cartSteppers.delete(product.sku);
    item.remove();
    refreshCartTotal();
  }, { once: true });
}
refreshCartTotal();

// ── 2. Reserva: dos selectores que se limitan entre sí (máximo 8 personas) ──
const TABLE_LIMIT = 8;
const bookingSummary = document.querySelector('#booking-summary');
const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;
let adults;
let children;
function refreshBooking() {
  // Cada selector recibe como máximo lo que deja libre el otro.
  adults.setMax(TABLE_LIMIT - children.getValue());
  children.setMax(TABLE_LIMIT - adults.getValue());
  const total = adults.getValue() + children.getValue();
  bookingSummary.textContent = `${plural(adults.getValue(), 'adulto', 'adultos')} y ${plural(children.getValue(), 'niño', 'niños')}: `
    + `${total} de ${TABLE_LIMIT} plazas.`;
}
adults = createStepper(document.querySelector('#adults'), {
  id: 'adults', label: 'Adultos', min: 1, max: TABLE_LIMIT, value: 2, onChange: refreshBooking,
});
children = createStepper(document.querySelector('#children'), {
  id: 'children', label: 'Niños', min: 0, max: TABLE_LIMIT, value: 1, onChange: refreshBooking,
});
refreshBooking();

// ── 3. Termostato: decimales, unidades con Intl y un aviso ──────────────
const celsius = new Intl.NumberFormat('es-ES', { style: 'unit', unit: 'celsius', minimumFractionDigits: 1, maximumFractionDigits: 1 });
const thermostatHint = document.querySelector('#thermostat-hint');
const showThermostat = (degrees) => {
  thermostatHint.replaceChildren(degrees <= 20
    ? Object.assign(document.createElement('span'), { className: 'eco', textContent: 'Modo eco: ahorras energía.' })
    : `Cada grado por encima de 20 °C aumenta el consumo en torno a un 7 %.`);
};
const thermostat = createStepper(document.querySelector('#thermostat'), {
  id: 'thermostat', label: 'Temperatura deseada', min: 15, max: 28, step: 0.5, value: 21,
  format: (degrees) => celsius.format(degrees),
  onChange: showThermostat,
});
showThermostat(thermostat.getValue());

// ── 4. Duración: minutos mostrados como «1 h 30 min» y hora de fin ──────
const formatMinutes = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return [hours > 0 ? `${hours} h` : '', rest > 0 ? `${rest} min` : ''].filter(Boolean).join(' ') || '0 min';
};
// Acepta «90», «1 h 30 min» o «2h».
const parseMinutes = (text) => {
  if (!text.includes('h')) return Number.parseInt(text, 10);
  const [hours, rest] = text.split('h');
  return Number.parseInt(hours, 10) * 60 + (Number.parseInt(rest, 10) || 0);
};
const START_MINUTES = 18 * 60; // la sala se reserva a partir de las 18:00
const durationHint = document.querySelector('#duration-hint');
const showDuration = (minutes) => {
  const end = START_MINUTES + minutes;
  const clock = `${String(Math.floor(end / 60) % 24).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
  durationHint.textContent = `De 18:00 a ${clock}.`;
};
const duration = createStepper(document.querySelector('#duration'), {
  id: 'duration', label: 'Duración', min: 15, max: 240, step: 15, value: 60,
  format: formatMinutes, parse: parseMinutes, onChange: showDuration,
});
showDuration(duration.getValue());

console.log(`selectores activos: ${activeSteppers.size}`);
```
