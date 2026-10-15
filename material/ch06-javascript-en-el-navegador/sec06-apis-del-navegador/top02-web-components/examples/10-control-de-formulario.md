---
example_description: "Un custom element que participa en un formulario: static formAssociated = true y attachInternals() le dan nombre en form.elements, valor en FormData (setFormValue) y validación (setValidity con required); los radios de su shadow DOM no cuentan para el formulario de fuera, pero le dan teclado y accesibilidad gratis"
example_tags: "javascript|web-components|formassociated|attachinternals|setformvalue|setvalidity|formularios|accesibilidad"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<template id="rating-field-template">
  <style>
    fieldset {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem 0.75rem;
      margin: 0;
      border: 1px solid #7b8794;
      border-radius: 0.5rem;
    }
    legend {
      padding: 0 0.25rem;
      font-weight: 700;
    }
    label {
      color: #92400e;
      cursor: pointer;
    }
  </style>
  <!-- Radios de verdad: flechas del teclado, foco y roles sin una línea de JS. -->
  <fieldset>
    <legend>Valoración</legend>
    <label><input type="radio" name="stars" value="1"> 1 ★</label>
    <label><input type="radio" name="stars" value="2"> 2 ★</label>
    <label><input type="radio" name="stars" value="3"> 3 ★</label>
    <label><input type="radio" name="stars" value="4"> 4 ★</label>
    <label><input type="radio" name="stars" value="5"> 5 ★</label>
  </fieldset>
</template>

<main>
  <h1>Reseña: Café de Chiapas</h1>
  <form id="review" action="/resenas" method="post">
    <rating-field name="rating" required></rating-field>
    <label class="comment">Comentario
      <textarea name="comment" rows="2">Muy aromático, con notas de cacao.</textarea>
    </label>
    <button type="submit">Enviar reseña</button>
  </form>
  <p id="card-notice" class="notice" hidden>Esta tarjeta es un iframe aislado y aquí el formulario no se envía: ábrelo con «▶ Run» o en el editor.</p>
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
form {
  display: grid;
  gap: 0.6rem;
  justify-items: start;
}
rating-field {
  display: block;
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
const template = document.querySelector('#rating-field-template');
const form = document.querySelector('#review');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

class RatingField extends HTMLElement {
  static formAssociated = true; // ← lo convierte en un control de formulario
  #internals;
  #radios;
  constructor() {
    super();
    this.#internals = this.attachInternals(); // valor, validez y formulario
    const root = this.attachShadow({ mode: 'open' });
    root.append(template.content.cloneNode(true));
    this.#radios = [...root.querySelectorAll('input')];
    root.addEventListener('change', () => this.#sync());
  }
  connectedCallback() {
    this.#sync();
  }
  // La API de un control: name, value, form, validity, checkValidity…
  get name() { return this.getAttribute('name'); }
  get form() { return this.#internals.form; }
  get validity() { return this.#internals.validity; }
  get validationMessage() { return this.#internals.validationMessage; }
  checkValidity() { return this.#internals.checkValidity(); }
  get value() {
    return this.#radios.find((radio) => radio.checked)?.value ?? '';
  }
  set value(stars) {
    for (const radio of this.#radios) radio.checked = radio.value === String(stars);
    this.#sync();
  }
  // El formulario lo llama al pulsar «reset».
  formResetCallback() {
    this.value = '';
  }
  #sync() {
    const value = this.value;
    this.#internals.setFormValue(value === '' ? null : value); // null: no se envía
    if (this.hasAttribute('required') && value === '') {
      // Tercer argumento: dónde apunta la burbuja del navegador.
      this.#internals.setValidity({ valueMissing: true }, 'Elige de 1 a 5 estrellas', this.#radios[0]);
    } else {
      this.#internals.setValidity({});
    }
  }
}
customElements.define('rating-field', RatingField);

const rating = form.elements.rating;
const formData = () => [...new FormData(form)].map(([key, value]) => `${key}=${value}`).join(' · ');
logLine(`form.elements → ${[...form.elements].map((control) => control.localName).join(', ')} (los radios del shadow DOM no cuentan)`);
logLine(`rating.form === form → ${rating.form === form}`);
logLine(`sin valoración → checkValidity(): ${form.checkValidity()} · «${rating.validationMessage}»`);
logLine(`FormData → ${formData()}`);
logLine('— simulado: rating.value = 4 —');
rating.value = 4;
logLine(`FormData → ${formData()}`);
logLine(`checkValidity(): ${form.checkValidity()}`);
rating.value = ''; // la persona empieza sin valoración
logLine('Listo: elige estrellas (con el ratón o con Tab y las flechas) y pulsa «Enviar reseña»');

form.addEventListener('submit', (event) => {
  event.preventDefault(); // la validación nativa ya pasó: aquí todo es válido
  logLine(`📨 envío → ${formData()}`);
});
if (window.origin === 'null') document.querySelector('#card-notice').hidden = false;
```
