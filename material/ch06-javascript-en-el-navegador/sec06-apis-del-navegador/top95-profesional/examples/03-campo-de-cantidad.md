---
example_description: "<quantity-field>, un control de formulario hecho a mano: formAssociated + ElementInternals (valor en FormData, validez con rangeOverflow/rangeUnderflow/stepMismatch, reset, fieldset disabled, restauración), Shadow DOM con delegatesFocus para que <label for> lo enfoque, un input numérico de verdad dentro (teclado y flechas) con botones − y +, y eventos input/change como los nativos"
example_tags: "javascript|web-components|formassociated|elementinternals|validacion|delegatesfocus|formularios|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Pedido para la cafetería</h1>
  <form id="order" class="order" action="/pedidos" method="post">
    <fieldset id="items" class="items">
      <legend>Productos</legend>
      <div class="line">
        <label for="qty-chiapas">Café de Chiapas 500 g · $210</label>
        <quantity-field id="qty-chiapas" name="chiapas" data-price="210" min="0" max="10" value="1"></quantity-field>
      </div>
      <div class="line">
        <label for="qty-cacao">Cacao de Tabasco 250 g · $95 (de 2 en 2)</label>
        <quantity-field id="qty-cacao" name="cacao" data-price="95" min="0" max="12" step="2" value="0"></quantity-field>
      </div>
    </fieldset>
    <p class="total">Total: <output id="total" for="qty-chiapas qty-cacao">$210.00</output></p>
    <label class="pause"><input id="pause" type="checkbox"> Pausar pedidos (desactiva los productos)</label>
    <p class="actions">
      <button type="submit">Pedir</button>
      <button type="reset">Vaciar</button>
    </p>
  </form>
  <p id="card-notice" class="notice" hidden>Esta tarjeta es un iframe aislado y aquí el formulario no se envía: ábrela con «▶ Run» o en el editor.</p>
  <p id="status" class="status" role="status"></p>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
main {
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  margin: 0 0 0.75rem;
  font-size: 1.25rem;
}
.items {
  display: grid;
  gap: 0.6rem;
  margin: 0;
  padding: 0.6rem 0.8rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
.line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
/* Estados del control, desde fuera: :invalid y :disabled funcionan con
   los elementos asociados a formularios. */
quantity-field:invalid {
  --field-border: #b91c1c;
}
quantity-field:disabled {
  opacity: 0.6;
}
.total {
  font-size: 1.1rem;
  font-weight: 700;
}
.actions {
  display: flex;
  gap: 0.5rem;
}
button {
  font: inherit;
  padding: 0.35rem 0.8rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:focus-visible,
input:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.notice {
  color: #92400e;
}
.status {
  min-height: 1.4em;
}
```

# JavaScript

```javascript
// UN CONTROL DE CANTIDAD QUE SE COMPORTA COMO UN <input>.
//
// Decisiones de diseño:
// - static formAssociated = true + attachInternals(): el valor viaja en
//   FormData (setFormValue), la validez se calcula con los mismos estados de
//   la Constraint Validation API (rangeUnderflow, rangeOverflow, stepMismatch,
//   badInput) y la burbuja del navegador apunta al input de dentro.
// - Como un <input>, el atributo value es el valor POR DEFECTO (al que vuelve
//   «Vaciar», formResetCallback) y la propiedad value es el valor actual.
// - Dentro, un <input type="number"> de verdad: teclado, flechas y lector de
//   pantalla sin trabajo. delegatesFocus: true hace que el foco (y el clic en
//   su <label for>) pase al input; el texto de la etiqueta se copia a su
//   aria-label, porque una etiqueta no cruza el Shadow DOM.
// - El input de dentro ya emite input (composed); change no lo es, así que el
//   host lo vuelve a emitir. Los botones − y + emiten los dos, como haría
//   el navegador.
// - formDisabledCallback: un <fieldset disabled> desactiva también lo de dentro.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos,
// formularios con JS y este módulo.

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const FIELD_CSS = `
  :host { display: inline-flex; align-items: stretch; border: 1px solid var(--field-border, #7b8794); border-radius: 0.5rem; overflow: hidden; background: #ffffff; }
  input { width: 3.5rem; border: 0; font: inherit; text-align: center; color: #1f2933; background: transparent; }
  input:focus-visible { outline: 3px solid #1d4ed8; outline-offset: -3px; }
  button { width: 2.2rem; border: 0; font: inherit; font-size: 1.1rem; color: #1f2933; background: #e4e7eb; cursor: pointer; }
  button:disabled { color: #7b8794; cursor: default; }
  button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: -3px; }
`;

class QuantityField extends HTMLElement {
  static formAssociated = true;
  static observedAttributes = ['min', 'max', 'step', 'value'];
  #internals = this.attachInternals();
  #current = null; // null = todavía el valor por defecto
  #input;
  #minus;
  #plus;

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open', delegatesFocus: true });
    const style = document.createElement('style');
    style.textContent = FIELD_CSS;
    this.#minus = this.#button('−', 'Uno menos', -1);
    this.#plus = this.#button('+', 'Uno más', 1);
    this.#input = document.createElement('input');
    this.#input.type = 'number';
    this.#input.inputMode = 'numeric';
    this.#input.setAttribute('part', 'input');
    root.append(style, this.#minus, this.#input, this.#plus);
    this.#input.addEventListener('input', () => {
      this.#current = this.#input.valueAsNumber; // NaN si no es un número
      this.#sync({ keepInput: true });
    });
    this.#input.addEventListener('change', () => this.#emit('change'));
  }

  // ── La API de un control ──
  get min() { return Number(this.getAttribute('min') ?? 0); }
  get max() { return Number(this.getAttribute('max') ?? 99); }
  get step() { return Number(this.getAttribute('step') ?? 1); }
  get defaultValue() { return Number(this.getAttribute('value') ?? this.min); }
  get value() { return this.#current ?? this.defaultValue; }
  set value(number) {
    this.#current = Number(number);
    this.#sync();
  }
  get name() { return this.getAttribute('name'); }
  get form() { return this.#internals.form; }
  get labels() { return this.#internals.labels; }
  get validity() { return this.#internals.validity; }
  get validationMessage() { return this.#internals.validationMessage; }
  checkValidity() { return this.#internals.checkValidity(); }
  reportValidity() { return this.#internals.reportValidity(); }
  stepBy(direction) {
    const next = Math.min(this.max, Math.max(this.min, (Number.isNaN(this.value) ? this.min : this.value) + direction * this.step));
    if (next === this.value) return;
    this.value = next;
    this.#emit('input');
    this.#emit('change');
  }

  // ── Ciclo de vida y formulario ──
  connectedCallback() {
    const label = this.#internals.labels[0];
    if (label) this.#input.setAttribute('aria-label', label.textContent.trim());
    this.#sync();
  }
  attributeChangedCallback() { this.#sync(); }
  formResetCallback() {
    this.#current = null;
    this.#sync();
  }
  formDisabledCallback(disabled) {
    this.#input.disabled = disabled;
    this.#sync();
  }
  formStateRestoreCallback(state) {
    this.value = state;
  }

  // ── Por dentro ──
  #button(text, label, direction) {
    const button = document.createElement('button');
    button.type = 'button';
    button.tabIndex = -1; // el teclado usa las flechas del input: un solo Tab
    button.textContent = text;
    button.setAttribute('aria-label', label);
    button.addEventListener('click', () => this.stepBy(direction));
    return button;
  }
  #emit(type) {
    this.dispatchEvent(new Event(type, { bubbles: true }));
  }
  #sync({ keepInput = false } = {}) {
    const value = this.value;
    if (!keepInput) this.#input.value = Number.isNaN(value) ? '' : String(value);
    this.#input.min = this.min;
    this.#input.max = this.max;
    this.#input.step = this.step;
    const disabled = this.#input.disabled;
    this.#minus.disabled = disabled || value <= this.min;
    this.#plus.disabled = disabled || value >= this.max;
    this.#internals.setFormValue(Number.isNaN(value) ? null : String(value));
    const [flags, message] = Number.isNaN(value) ? [{ badInput: true }, 'Escribe un número']
      : value < this.min ? [{ rangeUnderflow: true }, `Como mínimo ${this.min}`]
      : value > this.max ? [{ rangeOverflow: true }, `Como mucho ${this.max}`]
      : (value - this.min) % this.step !== 0 ? [{ stepMismatch: true }, `De ${this.step} en ${this.step}`]
      : [{}, ''];
    this.#internals.setValidity(flags, message, this.#input);
  }
}
customElements.define('quantity-field', QuantityField);

// ── El formulario del pedido ─────────────────────────────────────────────
const form = document.querySelector('#order');
const fields = [...form.querySelectorAll('quantity-field')];
const totalOutput = document.querySelector('#total');
const statusLine = document.querySelector('#status');
function updateTotal() {
  const total = fields.reduce((sum, field) => sum + (Number.isNaN(field.value) ? 0 : field.value * Number(field.dataset.price)), 0);
  totalOutput.textContent = money.format(total);
  return totalOutput.textContent;
}
const formData = () => [...new FormData(form)].map(([key, value]) => `${key}=${value}`).join(' · ');
form.addEventListener('input', updateTotal);
form.addEventListener('reset', () => setTimeout(updateTotal)); // los controles se reinician después del evento
document.querySelector('#pause').addEventListener('change', (event) => {
  document.querySelector('#items').disabled = event.target.checked;
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  statusLine.textContent = `Pedido enviado: ${formData()} · ${updateTotal()}`;
  console.log(`📨 ${statusLine.textContent}`);
});
if (window.origin === 'null') document.querySelector('#card-notice').hidden = false;

// ── Comprobaciones al cargar ─────────────────────────────────────────────
function audit(label, actual, expected) {
  if (actual === expected) console.log('✅', label, '→', actual);
  else console.error('❌', label, '→', actual, '(esperaba', expected, ')');
}
const [chiapas, cacao] = fields;
audit('form.elements', [...form.elements].filter((control) => control.localName === 'quantity-field').map((field) => field.name).join(', '), 'chiapas, cacao');
audit('FormData y total al empezar', `${formData()} · ${updateTotal()}`, 'chiapas=1 · cacao=0 · $210.00');
cacao.shadowRoot.querySelector('[aria-label="Uno más"]').click();
audit('«+» en el cacao (de 2 en 2)', `${cacao.value} · ${updateTotal()}`, '2 · $400.00');
chiapas.value = 11;
audit('11 cafés (máx. 10)', `${chiapas.validity.rangeOverflow} · ${chiapas.validationMessage} · :invalid ${chiapas.matches(':invalid')}`, 'true · Como mucho 10 · :invalid true');
cacao.value = 3;
audit('3 de cacao (de 2 en 2)', `${cacao.validity.stepMismatch} · ${cacao.validationMessage}`, 'true · De 2 en 2');
audit('con errores, el formulario no es válido', form.checkValidity(), false);
form.reset();
audit('«Vaciar» vuelve a los valores por defecto', `${formData()} · válido ${form.checkValidity()}`, 'chiapas=1 · cacao=0 · válido true');
document.querySelector('#items').disabled = true;
audit('fieldset disabled desactiva el control y su input', `${chiapas.matches(':disabled')} · ${chiapas.shadowRoot.querySelector('input').disabled}`, 'true · true');
document.querySelector('#items').disabled = false;
audit('<label for> da nombre al input de dentro', chiapas.shadowRoot.querySelector('input').getAttribute('aria-label'), 'Café de Chiapas 500 g · $210');
updateTotal();
console.log('Listo: cambia las cantidades con − y +, con las flechas o escribiendo; prueba «Pausar pedidos», «Vaciar» y «Pedir»');
```
