---
example_description: "Un <rating-stars> completo: shadow DOM con radios de verdad (teclado y lector de pantalla gratis), ::part y una variable CSS para el tema, el atributo value reflejado en la propiedad, asociado al formulario (FormData y required con ElementInternals), un evento change despachado desde el host y un pequeño salto animado que respeta prefers-reduced-motion"
example_tags: "javascript|web-components|shadow-dom|part|formassociated|attachinternals|matchmedia|web-animations"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Reseña: Café de Veracruz</h1>
  <form id="review" class="review" action="/resenas" method="post">
    <rating-stars name="rating" value="4" required>Valoración</rating-stars>
    <label class="comment">Comentario
      <textarea name="comment" rows="2">Dulce, con notas de chocolate.</textarea>
    </label>
    <button type="submit">Enviar reseña</button>
  </form>
  <p id="card-notice" class="notice" hidden>Esta tarjeta es un iframe aislado y aquí el formulario no se envía: ábrela con «▶ Run» o en el editor.</p>
  <ol id="log" class="log" aria-live="polite"></ol>
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
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin: 0 0 0.5rem;
}
.review {
  display: grid;
  gap: 0.6rem;
  justify-items: start;
}
/* El tema del componente, desde fuera: una variable CSS y ::part. */
rating-stars {
  --star-color: #92400e;
}
rating-stars::part(legend) {
  font-weight: 700;
}
.comment {
  display: grid;
  gap: 0.25rem;
  width: 100%;
}
textarea {
  font: inherit;
  padding: 0.35rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
}
button {
  font: inherit;
  padding: 0.3rem 0.7rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:focus-visible,
textarea:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.notice {
  color: #92400e;
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

const STAR_STYLES = `
  fieldset { display: flex; gap: 0.15rem; margin: 0; padding: 0.25rem 0.5rem; border: 1px solid #7b8794; border-radius: 0.5rem; }
  legend { padding: 0 0.25rem; }
  label { position: relative; font-size: 1.6rem; line-height: 1; color: var(--star-color, #52606d); cursor: pointer; }
  input { position: absolute; opacity: 0; inset: 0; margin: 0; cursor: pointer; }
  label:has(input:focus-visible) { outline: 3px solid #1d4ed8; outline-offset: 2px; border-radius: 0.25rem; }
`;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

class RatingStars extends HTMLElement {
  static formAssociated = true;
  static observedAttributes = ['value'];
  #internals = this.attachInternals();
  #inputs = [];

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = STAR_STYLES;
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.setAttribute('part', 'legend'); // la puerta para ::part(legend)
    legend.append(document.createElement('slot')); // el texto de la etiqueta viene de fuera
    fieldset.append(legend);
    for (let stars = 1; stars <= 5; stars += 1) {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'stars';
      input.value = String(stars);
      input.setAttribute('aria-label', `${stars} de 5 estrellas`);
      label.append(input, '☆');
      fieldset.append(label);
      this.#inputs.push(input);
    }
    root.append(style, fieldset);
    // Un change de dentro no es composed: el componente avisa desde el host.
    root.addEventListener('change', (event) => {
      this.value = event.target.value;
      this.#bounce(event.target.parentElement);
      this.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  // value refleja el atributo (y el atributo pinta, valida y rellena el formulario).
  get value() { return Number(this.getAttribute('value') ?? 0); }
  set value(stars) { this.setAttribute('value', String(stars)); }
  get name() { return this.getAttribute('name'); }
  get form() { return this.#internals.form; }
  checkValidity() { return this.#internals.checkValidity(); }
  get validationMessage() { return this.#internals.validationMessage; }

  connectedCallback() { this.#render(); }
  attributeChangedCallback() { this.#render(); }
  formResetCallback() { this.removeAttribute('value'); }

  #render() {
    const value = this.value;
    for (const input of this.#inputs) {
      const stars = Number(input.value);
      input.checked = stars === value;
      input.nextSibling.data = stars <= value ? '★' : '☆';
    }
    this.#internals.setFormValue(value > 0 ? String(value) : null);
    if (this.hasAttribute('required') && value === 0) {
      this.#internals.setValidity({ valueMissing: true }, 'Elige de 1 a 5 estrellas', this.#inputs[0]);
    } else {
      this.#internals.setValidity({});
    }
  }
  #bounce(label) {
    if (reduceMotion.matches) return; // sin saltos para quien pidió menos movimiento
    label.animate([{ scale: 1 }, { scale: 1.35 }, { scale: 1 }], { duration: 250, easing: 'ease-out' });
  }
}
customElements.define('rating-stars', RatingStars);

const form = document.querySelector('#review');
const rating = form.elements.rating;
const formData = () => [...new FormData(form)].map(([key, value]) => `${key}=${value}`).join(' · ');
form.addEventListener('change', (event) => {
  if (event.target === rating) logLine(`change en el formulario → rating = ${rating.value} · FormData → ${formData()}`);
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  logLine(`📨 envío → ${formData()}`);
});

logLine(`shadowRoot → ${rating.shadowRoot.mode} · radios dentro: ${rating.shadowRoot.querySelectorAll('input').length} · form.elements: ${[...form.elements].map((control) => control.localName).join(', ')}`);
logLine(`desde el HTML (value="4") → ${rating.value} · FormData → ${formData()}`);
logLine('— simulado: un clic en la 2.ª estrella —');
rating.shadowRoot.querySelector('input[value="2"]').click();
logLine(`atributo value → ${rating.getAttribute('value')} (la propiedad y el atributo van juntos)`);
rating.removeAttribute('value');
logLine(`sin valor → checkValidity(): ${form.checkValidity()} · «${rating.validationMessage}»`);
rating.value = 4;
logLine('Listo: elige con el ratón o con Tab y las flechas; luego «Enviar reseña»');
if (window.origin === 'null') document.querySelector('#card-notice').hidden = false;
```
