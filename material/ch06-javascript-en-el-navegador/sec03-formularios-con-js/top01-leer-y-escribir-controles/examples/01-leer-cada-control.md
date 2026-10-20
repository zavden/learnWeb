---
example_description: "form.elements da cada control por su name; la propiedad que se lee depende del control: value en textos, listas y textarea, valueAsNumber en números, checked en casillas y el value del grupo en los radios"
example_tags: "javascript|formularios|form-elements|value|checked|select"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Pedido de café</h1>
  <form id="order" action="/pedidos" method="post">
    <p>
      <label for="customer">Nombre</label>
      <input id="customer" name="customer" value="Lucía Méndez" autocomplete="name">
    </p>
    <p>
      <label for="quantity">Bolsas de 500 g</label>
      <input id="quantity" name="quantity" type="number" min="1" max="10" value="2">
    </p>
    <fieldset>
      <legend>Molienda</legend>
      <label><input type="radio" name="grind" value="beans" checked> En grano</label>
      <label><input type="radio" name="grind" value="espresso"> Para espresso</label>
    </fieldset>
    <p>
      <label for="origin">Origen</label>
      <select id="origin" name="origin">
        <option value="chiapas">Chiapas</option>
        <option value="veracruz" selected>Veracruz</option>
        <option value="oaxaca">Oaxaca</option>
      </select>
    </p>
    <p><label><input type="checkbox" name="gift"> Envolver para regalo</label></p>
    <p>
      <label for="notes">Notas</label>
      <textarea id="notes" name="notes" rows="2">Entregar por la tarde</textarea>
    </p>
    <button id="read" type="button">Leer el formulario</button>
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
  display: grid;
  gap: 0.25rem;
  margin: 0 0 0.75rem;
}
fieldset {
  margin: 0 0 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.375rem;
}
input,
select,
textarea,
button {
  font: inherit;
  color: #1f2933;
}
input:not([type="radio"], [type="checkbox"]),
select,
textarea {
  padding: 0.35rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
}
button {
  padding: 0.4rem 0.8rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  cursor: pointer;
}
:focus-visible {
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
}
```

# JavaScript

```javascript
const form = document.querySelector('#order');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// form.elements reúne los controles del formulario; se piden por su name (o su id).
function readForm() {
  const { customer, quantity, grind, origin, gift, notes } = form.elements;
  logLine(`customer.value → '${customer.value}'`);
  logLine(`quantity.value → '${quantity.value}' · valueAsNumber → ${quantity.valueAsNumber}`);
  logLine(`grind.value → '${grind.value}' (el radio marcado del grupo)`);
  logLine(`origin.value → '${origin.value}' · texto → '${origin.selectedOptions[0].text}'`);
  logLine(`gift.checked → ${gift.checked}`);
  logLine(`notes.value → '${notes.value}'`);
}

readForm();
document.querySelector('#read').addEventListener('click', readForm);
logLine('Listo: cambia los campos y pulsa «Leer el formulario»');
```
