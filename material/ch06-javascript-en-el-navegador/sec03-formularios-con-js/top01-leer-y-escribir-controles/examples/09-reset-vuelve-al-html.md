---
example_description: "form.reset() devuelve cada control a su valor INICIAL (los atributos del HTML: defaultValue, defaultChecked, defaultSelected), no al último estado guardado. Para que «Descartar cambios» vuelva a lo guardado, carga los datos también en los default*"
example_tags: "javascript|formularios|reset|defaultvalue|defaultchecked|defaultselected|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Ajustes del boletín</h1>
  <div class="forms">
    <form id="profile-a" action="/ajustes" method="post">
      <h2>🐛 Cargado en value</h2>
      <label>Nombre <input name="display_name" value="Lucía"></label>
      <label>Frecuencia
        <select name="frequency">
          <option value="weekly" selected>Semanal</option>
          <option value="monthly">Mensual</option>
        </select>
      </label>
      <label><input type="checkbox" name="digest"> Resumen en PDF</label>
      <button type="button" data-reset>Descartar cambios</button>
    </form>
    <form id="profile-b" action="/ajustes" method="post">
      <h2>✅ Cargado en default*</h2>
      <label>Nombre <input name="display_name" value="Lucía"></label>
      <label>Frecuencia
        <select name="frequency">
          <option value="weekly" selected>Semanal</option>
          <option value="monthly">Mensual</option>
        </select>
      </label>
      <label><input type="checkbox" name="digest"> Resumen en PDF</label>
      <button type="button" data-reset>Descartar cambios</button>
    </form>
  </div>
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
h2 {
  font-size: 0.95rem;
  margin: 0;
}
.forms {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: 0.75rem;
}
form {
  display: grid;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
input:not([type="checkbox"]),
select,
button {
  font: inherit;
  color: #1f2933;
  padding: 0.3rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
}
input:not([type="checkbox"]) {
  width: 8rem;
}
button {
  justify-self: start;
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
const formA = document.querySelector('#profile-a');
const formB = document.querySelector('#profile-b');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
const describe = (form) => {
  const { display_name: displayName, frequency, digest } = form.elements;
  return `${displayName.value} · ${frequency.value} · PDF: ${digest.checked}`;
};

// Lo que el servidor tiene guardado (en un caso real llegaría con fetch).
const saved = { displayName: 'Lucía Méndez', frequency: 'monthly', digest: true };

// 🐛 A: se cargan los datos en los valores ACTUALES.
formA.elements.display_name.value = saved.displayName;
formA.elements.frequency.value = saved.frequency;
formA.elements.digest.checked = saved.digest;

// ✅ B: se cargan también como valores INICIALES (cambian los atributos del HTML).
formB.elements.display_name.defaultValue = saved.displayName; // sin editar, value lo sigue
for (const option of formB.elements.frequency.options) {
  option.defaultSelected = option.value === saved.frequency;
}
formB.elements.digest.defaultChecked = saved.digest;

logLine(`A cargado → ${describe(formA)} · defaultValue '${formA.elements.display_name.defaultValue}'`);
logLine(`B cargado → ${describe(formB)} · defaultValue '${formB.elements.display_name.defaultValue}'`);

for (const form of [formA, formB]) {
  form.querySelector('[data-reset]').addEventListener('click', () => {
    form.reset(); // vuelve a los valores INICIALES de cada control
    logLine(`${form === formA ? '🐛 A' : '✅ B'} tras reset() → ${describe(form)}`);
  });
}
logLine('Listo: cambia algo en cada formulario y pulsa sus «Descartar cambios»');
```
