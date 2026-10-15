---
example_description: "querySelector('[name=size]').value devuelve el value del PRIMER radio, esté marcado o no. form.elements.size es un RadioNodeList cuyo value es el del radio marcado ('' si no hay ninguno), y asignarlo marca otro"
example_tags: "javascript|formularios|radio|radionodelist|form-elements|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Café de olla para llevar</h1>
  <form id="drink" action="/pedidos" method="post">
    <fieldset>
      <legend>Tamaño</legend>
      <label><input type="radio" name="size" value="small"> Chico</label>
      <label><input type="radio" name="size" value="medium" checked> Mediano</label>
      <label><input type="radio" name="size" value="large"> Grande</label>
    </fieldset>
    <fieldset>
      <legend>Leche</legend>
      <label><input type="radio" name="milk" value="whole"> Entera</label>
      <label><input type="radio" name="milk" value="oat"> De avena</label>
    </fieldset>
    <button id="upsize" type="button">Hazlo grande</button>
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
  display: grid;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
fieldset {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 0;
  border: 1px solid #cbd2d9;
  border-radius: 0.375rem;
}
button {
  justify-self: start;
  font: inherit;
  color: #1f2933;
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
const form = document.querySelector('#drink');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// 🐛 Un grupo de radio son VARIOS inputs con el mismo name. querySelector devuelve
//    el primero, y su value es su valor fijo: 'small', esté marcado o no.
logLine(`🐛 querySelector('[name=size]').value → '${form.querySelector('[name=size]').value}'`);

// ✅ form.elements.size devuelve el grupo entero (un RadioNodeList)…
const sizes = form.elements.size;
logLine(`✅ form.elements.size → ${sizes.constructor.name} con ${sizes.length} radios`);
// …y su value es el del radio MARCADO.
logLine(`✅ form.elements.size.value → '${sizes.value}'`);
// Sin ninguno marcado, el grupo vale '' (y querySelector(':checked') da null).
logLine(`leche sin elegir → '${form.elements.milk.value}' · :checked → ${form.querySelector('[name=milk]:checked')}`);

// Asignar value al grupo MARCA el radio que tiene ese valor.
document.querySelector('#upsize').addEventListener('click', () => {
  sizes.value = 'large';
  logLine(`sizes.value = 'large' → marcado: ${form.querySelector('[name=size]:checked').parentElement.textContent.trim()}`);
});
form.addEventListener('change', (event) => {
  logLine(`change en ${event.target.name} → '${form.elements[event.target.name].value}'`);
});
logLine('Listo: elige una leche y otro tamaño; luego pulsa «Hazlo grande»');
```
