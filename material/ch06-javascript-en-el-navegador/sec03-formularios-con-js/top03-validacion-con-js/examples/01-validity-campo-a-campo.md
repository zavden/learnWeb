---
example_description: "La Constraint Validation API campo a campo: validity con un indicador por motivo (valueMissing, typeMismatch, rangeUnderflow, patternMismatch…), validationMessage con el aviso del navegador en su idioma y checkValidity() del formulario"
example_tags: "javascript|formularios|validacion|validity|validationmessage|checkvalidity"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Carrera 10K del Bosque de Chapultepec</h1>
  <form id="race" action="/carrera/inscripcion" method="post">
    <p><label>Nombre <input name="runner" required autocomplete="name"></label></p>
    <p><label>Correo <input name="email" type="email" value="ana@" autocomplete="email"></label></p>
    <p><label>Edad (16 o más) <input name="age" type="number" min="16" max="99" value="15"></label></p>
    <p>
      <label>Nombre en el dorsal <input name="bib" pattern="[A-Z]{3,10}" value="ana" aria-describedby="bib-hint"></label>
      <small id="bib-hint">De 3 a 10 letras mayúsculas, sin tildes.</small>
    </p>
  </form>
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
  margin-top: 0;
}
form {
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
form p {
  margin: 0 0 0.5rem;
}
small {
  display: block;
  color: #52606d;
}
input {
  font: inherit;
  color: #1f2933;
  padding: 0.3rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
}
input:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
  overflow-wrap: anywhere;
}
```

# JavaScript

```javascript
const form = document.querySelector('#race');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// Los motivos por los que un campo puede ser inválido (las propiedades de ValidityState).
const REASONS = ['valueMissing', 'typeMismatch', 'patternMismatch', 'tooLong', 'tooShort',
  'rangeUnderflow', 'rangeOverflow', 'stepMismatch', 'badInput', 'customError'];

function report(field) {
  const { validity } = field;
  if (validity.valid) {
    logLine(`✅ ${field.name} '${field.value}' → valid`);
    return;
  }
  const reasons = REASONS.filter((reason) => validity[reason]).join(', ');
  // validationMessage: el aviso que mostraría el navegador, en SU idioma.
  logLine(`❌ ${field.name} '${field.value}' → ${reasons} · «${field.validationMessage}»`);
}

for (const field of form.elements) report(field);
logLine(`form.checkValidity() → ${form.checkValidity()}`);

form.addEventListener('input', (event) => report(event.target));
logLine('Listo: corrige los campos uno a uno (Lucía, ana@huerta.mx, 34, ANA)');
```
