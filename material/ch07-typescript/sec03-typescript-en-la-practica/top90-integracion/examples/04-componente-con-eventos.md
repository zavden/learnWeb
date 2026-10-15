---
example_description: "Un web component en TypeScript, <qty-stepper>: una clase con #privados, un getter/setter tipado, static observedAttributes y un evento qty:change con detail tipado. declare global lo añade a HTMLElementTagNameMap y HTMLElementEventMap, así que el carrito que lo usa escucha y lee sin un solo as"
example_tags: "typescript|integracion|web-components|clases|customevent|declare-global|dom|accesibilidad"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Tu carrito</h1>
  <ul class="cart">
    <li data-cents="21000">
      <span id="coffee">Café de Chiapas · $210</span>
      <qty-stepper value="1" max="5" aria-labelledby="coffee"></qty-stepper>
    </li>
    <li data-cents="14500">
      <span id="cocoa">Cacao de Tabasco · $145</span>
      <qty-stepper value="2" max="3" aria-labelledby="cocoa"></qty-stepper>
    </li>
  </ul>
  <p>Total: <output id="total">$500.00</output></p>
  <ol class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1f2933; background: #f5f7fa; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.15rem; margin: 0 0 0.5rem; }
.cart { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.4rem; }
.cart li { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.5rem; padding: 0.4rem 0.6rem; border: 1px solid #cbd2d9; border-radius: 0.5rem; background: #fff; }
qty-stepper { display: inline-flex; align-items: center; gap: 0.4rem; }
qty-stepper output { min-width: 1.5rem; text-align: center; font-weight: 700; }
qty-stepper button { font: inherit; color: inherit; width: 2rem; padding: 0.1rem 0; border: 1px solid #7b8794; border-radius: 0.4rem; background: #fff; cursor: pointer; }
qty-stepper button:disabled { cursor: not-allowed; opacity: 0.5; }
output#total { font-weight: 700; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; min-height: 1.2rem; border: 1px solid #cbd2d9; border-radius: 0.5rem; background: #fff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# TypeScript

```typescript
type QtyChange = { value: number; previous: number };

class QtyStepper extends HTMLElement {
  static observedAttributes = ['max'];
  #value = 0;
  #max = 9;
  #output = document.createElement('output');
  // Con el tipo escrito: sin él, TS7022 («referenced … in its own initializer»), porque
  // createElement consulta HTMLElementTagNameMap, que incluye esta misma clase.
  #minus: HTMLButtonElement = Object.assign(document.createElement('button'), { type: 'button', textContent: '−' });
  #plus: HTMLButtonElement = Object.assign(document.createElement('button'), { type: 'button', textContent: '+' });

  get value(): number {
    return this.#value;
  }
  set value(next: number) {
    const clamped = Math.min(this.#max, Math.max(0, Math.round(next)));
    if (clamped === this.#value) return;
    const previous = this.#value;
    this.#value = clamped;
    this.#render();
    this.dispatchEvent(new CustomEvent('qty:change', { detail: { value: clamped, previous }, bubbles: true }));
  }

  connectedCallback(): void {
    this.setAttribute('role', 'group');
    this.#minus.setAttribute('aria-label', 'Una unidad menos');
    this.#plus.setAttribute('aria-label', 'Una unidad más');
    this.#minus.addEventListener('click', () => { this.value -= 1; });
    this.#plus.addEventListener('click', () => { this.value += 1; });
    this.#value = Number(this.getAttribute('value') ?? 0);
    this.replaceChildren(this.#minus, this.#output, this.#plus);
    this.#render();
  }

  attributeChangedCallback(name: string, _old: string | null, current: string | null): void {
    if (name === 'max') this.#max = Number(current ?? 9);
  }

  #render(): void {
    this.#output.value = String(this.#value);
    this.#minus.disabled = this.#value === 0;
    this.#plus.disabled = this.#value === this.#max;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qty-stepper': QtyStepper;
  }
  interface HTMLElementEventMap {
    'qty:change': CustomEvent<QtyChange>;
  }
}
customElements.define('qty-stepper', QtyStepper);

// ── El carrito: solo conoce la etiqueta y su evento ───────────────────────
const cart = document.querySelector('ul');
const totalOutput = document.querySelector('output#total');
const logList = document.querySelector('ol');
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const report = (text: string): void => {
  console.log(text);
  logList?.append(Object.assign(document.createElement('li'), { textContent: text }));
};

function cartTotal(list: HTMLElement): number {
  let cents = 0;
  for (const line of list.querySelectorAll('li')) { // NodeListOf<HTMLLIElement>
    const stepper = line.querySelector('qty-stepper'); // QtyStepper | null, por el mapa
    cents += Number(line.dataset.cents ?? 0) * (stepper?.value ?? 0);
  }
  return cents / 100;
}

if (cart && totalOutput instanceof HTMLOutputElement) {
  cart.addEventListener('qty:change', (event) => { // event: CustomEvent<QtyChange>
    const name = event.target instanceof Element ? event.target.closest('li')?.querySelector('span')?.textContent : '';
    totalOutput.value = money.format(cartTotal(cart));
    report(`🔢 ${name?.split(' · ')[0]}: ${event.detail.previous} → ${event.detail.value} · total ${totalOutput.value}`);
  });
  report(`Listo: total ${money.format(cartTotal(cart))}. Usa «−» y «+» (el cacao llega como máximo a 3)`);
}
```
