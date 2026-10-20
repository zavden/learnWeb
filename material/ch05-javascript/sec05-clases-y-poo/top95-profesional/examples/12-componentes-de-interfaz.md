---
example_description: "Una clase base Component (opciones por defecto estáticas, estado inmutable, oyentes que se limpian solos, render abstracto, destroy que restaura el HTML) y dos componentes accesibles que heredan de ella: un selector de cantidad y una valoración con estrellas"
example_tags: "javascript|profesional|clases|herencia|componentes|accesibilidad|interfaz"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="shop">
  <article class="product" aria-labelledby="product-title">
    <p class="eyebrow">Café de especialidad · Chiapas</p>
    <h1 id="product-title">Café de altura Finca Irlanda</h1>
    <p class="price">$289.00 <span class="unit">por bolsa de 500 g</span></p>
    <p class="lead">Tueste medio, notas de chocolate amargo y frutos rojos. Cultivado a 1 200 m bajo sombra de árboles nativos.</p>

    <div class="field">
      <label class="label" for="quantity">Cantidad de bolsas</label>
      <!-- Sin JavaScript, un campo numérico normal. El componente le añade los botones. -->
      <div class="stepper" id="quantity-stepper">
        <input id="quantity" type="number" min="1" max="10" value="1" inputmode="numeric">
      </div>
    </div>

    <div class="field">
      <span class="label" id="rating-label">Tu valoración</span>
      <!-- Sin JavaScript, un desplegable. El componente lo cambia por estrellas. -->
      <div class="rating" id="rating" aria-labelledby="rating-label">
        <select aria-labelledby="rating-label">
          <option value="0">Sin valorar</option>
          <option value="1">1 de 5: muy malo</option>
          <option value="2">2 de 5: malo</option>
          <option value="3">3 de 5: normal</option>
          <option value="4">4 de 5: bueno</option>
          <option value="5">5 de 5: excelente</option>
        </select>
      </div>
    </div>

    <p class="summary" role="status" id="summary">1 bolsa × $289.00 = $289.00</p>

    <div class="actions">
      <button class="primary" type="button" id="add">Añadir al carrito</button>
      <button class="secondary" type="button" id="toggle" aria-pressed="true">Mejoras activadas</button>
    </div>
  </article>
</main>
```

# CSS

```css
:root {
  --page: #fbf7f2;
  --card: #ffffff;
  --text: #2b2118;       /* 15.75:1 sobre la tarjeta */
  --muted: #6b5a4c;      /* 6.58:1 sobre la tarjeta */
  --accent: #7a3b12;     /* texto blanco encima: 8.53:1 */
  --star-on: #b45309;    /* 5.02:1: componente de interfaz */
  --star-off: #7c6a5c;   /* 5.16:1 */
  --focus: #1d4ed8;      /* 6.70:1 */
  --border: #7c6a5c;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--page);
  color: var(--text);
  font: 1rem/1.5 system-ui, sans-serif;
}

.shop {
  padding: 1rem;
}

.product {
  max-width: 34rem;
  margin: 0 auto;
  padding: 1.5rem;
  background: var(--card);
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgb(43 33 24 / 0.15);
}

.eyebrow,
.unit,
.lead {
  color: var(--muted);
}

.eyebrow {
  margin: 0;
  font-size: 0.875rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

h1 {
  margin: 0.25rem 0;
  font-size: clamp(1.4rem, 4vw, 1.9rem);
  line-height: 1.2;
}

.price {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
}

.unit {
  font-size: 0.95rem;
  font-weight: 400;
}

.field {
  display: grid;
  gap: 0.4rem;
  margin-block: 1.25rem;
}

.label {
  font-weight: 600;
}

.stepper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.stepper input {
  width: 5rem;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font: inherit;
  text-align: center;
}

.stepper.is-enhanced input {
  -moz-appearance: textfield; /* sin las flechas del navegador: ya hay botones */
}

.stepper.is-enhanced input::-webkit-inner-spin-button {
  appearance: none;
}

.step-button {
  width: 2.75rem;
  height: 2.75rem; /* objetivo táctil de 44 px */
  border: 1px solid var(--border);
  border-radius: 50%;
  background: var(--card);
  color: var(--text);
  font: 700 1.25rem/1 system-ui, sans-serif;
  cursor: pointer;
}

.step-button[aria-disabled="true"] {
  cursor: not-allowed;
  opacity: 0.45;
}

.rating select {
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font: inherit;
}

.rating[role="radiogroup"] {
  display: flex;
  gap: 0.25rem;
}

.star {
  min-width: 2.75rem;
  min-height: 2.75rem;
  border: 0;
  border-radius: 0.5rem;
  background: none;
  color: var(--star-off);
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
}

.star.is-on {
  color: var(--star-on);
}

:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
}

.summary {
  padding: 0.75rem 1rem;
  border-left: 4px solid var(--accent);
  background: var(--page);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.primary,
.secondary {
  min-height: 2.75rem;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  font: 600 1rem system-ui, sans-serif;
  cursor: pointer;
}

.primary {
  border: 0;
  background: var(--accent);
  color: #ffffff;
}

.secondary {
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--text);
}

.secondary[aria-pressed="false"] {
  border-style: dashed;
}

@media (prefers-reduced-motion: no-preference) {
  .star {
    transition: transform 0.15s;
  }

  .star:hover {
    transform: scale(1.15);
  }
}
```

# JavaScript

```javascript
// COMPONENTES DE INTERFAZ CON CLASES. La lógica de clases es la de este módulo;
// el DOM (querySelector, createElement, addEventListener, atributos) se estudia
// en el capítulo 6: aquí basta con saber que cada línea lee o cambia la página.
// - Component es abstracta: opciones por defecto estáticas que cada subclase
//   sombrea, estado inmutable con setState, oyentes que destroy() quita y el
//   HTML original guardado en un privado para restaurarlo (mejora progresiva).
// - Un WeakMap estático privado impide montar dos componentes en el mismo nodo.
// - Se crean con el estático mount(): el constructor de la base NO llama a setup()
//   ni a render(), porque los #privados de la subclase aún no existirían
//   (lección «Herencia con extends»: el padre que llama a un método sobrescrito).
const money = (cents) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100);

class Component {
  static defaults = {};
  static #mounted = new WeakMap(); // nodo → componente
  #cleanups = [];
  #originalHtml;

  static mount(root, options) {
    const component = new this(root, options); // this = la subclase: QuantityStepper.mount(…)
    component.setup(); // aquí el objeto ya está completo, privados incluidos
    component.render();
    return component;
  }

  constructor(root, options = {}) {
    if (new.target === Component) throw new TypeError('Component es abstracta');
    if (Component.#mounted.has(root)) throw new Error(`#${root.id} ya tiene un ${Component.#mounted.get(root).constructor.name}`);
    this.root = root;
    this.options = Object.freeze({ ...this.constructor.defaults, ...options });
    this.state = Object.freeze({});
    this.#originalHtml = root.innerHTML;
    Component.#mounted.set(root, this);
  }

  setup() {} // gancho opcional para las subclases
  render() {
    throw new Error(`${this.constructor.name} debe implementar render()`);
  }

  setState(patch) {
    const changed = Object.entries(patch).some(([key, value]) => this.state[key] !== value);
    if (!changed) return;
    this.state = Object.freeze({ ...this.state, ...patch });
    this.render();
    this.options.onChange?.(this.state, this);
  }

  listen(target, type, handler) {
    target.addEventListener(type, handler);
    this.#cleanups.push(() => target.removeEventListener(type, handler)); // la MISMA función
  }

  destroy() {
    for (const cleanup of this.#cleanups) cleanup();
    this.#cleanups = [];
    this.root.innerHTML = this.#originalHtml;
    this.root.removeAttribute('role');
    this.root.classList.remove('is-enhanced');
    Component.#mounted.delete(this.root);
  }
}

class QuantityStepper extends Component {
  static defaults = { min: 1, max: 99, step: 1, unit: 'unidad' };

  setup() {
    this.input = this.root.querySelector('input');
    this.root.classList.add('is-enhanced');
    this.minus = this.#button('−', `Quitar una ${this.options.unit}`);
    this.plus = this.#button('+', `Añadir una ${this.options.unit}`);
    this.input.before(this.minus);
    this.input.after(this.plus);
    this.state = Object.freeze({ value: this.#clamp(Number(this.input.value)) });
    this.listen(this.minus, 'click', () => this.set(this.state.value - this.options.step));
    this.listen(this.plus, 'click', () => this.set(this.state.value + this.options.step));
    this.listen(this.input, 'input', () => this.set(Number(this.input.value)));
    this.listen(this.input, 'change', () => { this.input.value = this.state.value; }); // al salir, el valor válido
  }

  #button(text, label) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'step-button';
    button.textContent = text;
    button.setAttribute('aria-label', label);
    return button;
  }
  #clamp(value) {
    const { min, max } = this.options;
    return Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : min;
  }
  set(value) {
    this.setState({ value: this.#clamp(value) });
  }

  render() {
    const { value } = this.state;
    if (document.activeElement !== this.input) this.input.value = value; // no pisa lo que se teclea
    // aria-disabled (y no disabled): el botón conserva el foco al llegar al límite.
    this.minus.setAttribute('aria-disabled', String(value <= this.options.min));
    this.plus.setAttribute('aria-disabled', String(value >= this.options.max));
  }
}

class StarRating extends Component {
  static defaults = { max: 5, words: ['muy malo', 'malo', 'normal', 'bueno', 'excelente'] };

  setup() {
    const initial = Number(this.root.querySelector('select')?.value ?? 0);
    this.root.replaceChildren(); // el desplegable de respaldo se va; destroy() lo devuelve
    this.root.setAttribute('role', 'radiogroup');
    this.stars = Array.from({ length: this.options.max }, (_, index) => {
      const star = document.createElement('button');
      star.type = 'button';
      star.className = 'star';
      star.setAttribute('role', 'radio');
      star.setAttribute('aria-label', `${index + 1} de ${this.options.max}: ${this.options.words[index]}`);
      this.listen(star, 'click', () => this.select(index + 1));
      this.root.append(star);
      return star;
    });
    // Patrón «radio group» de WAI-ARIA: flechas, Inicio y Fin mueven y eligen.
    this.listen(this.root, 'keydown', (event) => {
      const moves = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
      const current = this.state.value || 1;
      let next = null;
      if (event.key in moves) next = current + moves[event.key];
      if (event.key === 'Home') next = 1;
      if (event.key === 'End') next = this.options.max;
      if (next === null) return;
      event.preventDefault(); // que las flechas no desplacen la página
      this.select(Math.min(this.options.max, Math.max(1, next)));
      this.stars[this.state.value - 1].focus();
    });
    this.state = Object.freeze({ value: initial });
  }

  select(value) {
    this.setState({ value });
  }

  get label() {
    const { value } = this.state;
    return value === 0 ? 'sin valorar' : `${value} de ${this.options.max} (${this.options.words[value - 1]})`;
  }

  render() {
    this.stars.forEach((star, index) => {
      const checked = index + 1 === this.state.value;
      star.textContent = index < this.state.value ? '★' : '☆';
      star.classList.toggle('is-on', index < this.state.value);
      star.setAttribute('aria-checked', String(checked));
      // Solo una estrella entra en el orden de tabulación: la elegida (o la primera).
      star.tabIndex = checked || (this.state.value === 0 && index === 0) ? 0 : -1;
    });
  }
}

// ── La ficha de producto ──────────────────────────────────────────────
const UNIT_CENTS = 28900;
const summary = document.querySelector('#summary');
let stepper;
let rating;

function updateSummary() {
  const quantity = stepper.state.value;
  const bags = quantity === 1 ? 'bolsa' : 'bolsas';
  summary.textContent = `${quantity} ${bags} × ${money(UNIT_CENTS)} = ${money(quantity * UNIT_CENTS)} · Tu valoración: ${rating.label}`;
}

function mount() {
  stepper = QuantityStepper.mount(document.querySelector('#quantity-stepper'), {
    min: 1, max: 10, unit: 'bolsa',
    onChange: ({ value }) => {
      console.log('cantidad →', value);
      updateSummary();
    },
  });
  rating = StarRating.mount(document.querySelector('#rating'), {
    onChange: () => {
      console.log('valoración →', rating.label);
      updateSummary();
    },
  });
  updateSummary();
}
mount();

try {
  StarRating.mount(document.querySelector('#rating')); // el mismo nodo otra vez
} catch (error) {
  console.warn(`⛔ ${error.message}`);
}

document.querySelector('#add').addEventListener('click', () => {
  const quantity = stepper ? stepper.state.value : Number(document.querySelector('#quantity').value);
  console.log('🛒 añadido →', JSON.stringify({ sku: 'CAF-FI-500', quantity, totalCents: quantity * UNIT_CENTS }));
});

const toggle = document.querySelector('#toggle');
toggle.addEventListener('click', () => {
  const enhanced = toggle.getAttribute('aria-pressed') === 'true';
  if (enhanced) {
    stepper.destroy();
    rating.destroy();
    stepper = null;
    rating = null;
    summary.textContent = 'Mejoras desactivadas: el campo numérico y el desplegable siguen funcionando.';
  } else {
    mount();
  }
  toggle.setAttribute('aria-pressed', String(!enhanced));
  toggle.textContent = enhanced ? 'Mejoras desactivadas' : 'Mejoras activadas';
  console.log(enhanced ? '🔌 componentes desmontados: HTML original restaurado' : '🔌 componentes montados otra vez');
});
```
