---
example_description: "En un select multiple, value devuelve solo la PRIMERA opción elegida; selectedOptions es la colección de todas (viva), y su value y text se sacan con [...] y map. En un select normal, value, selectedIndex y el texto de la opción"
example_tags: "javascript|formularios|select|multiple|selectedoptions|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Pan de muerto por encargo</h1>
  <form id="bread" action="/encargos" method="post">
    <p>
      <label for="bread-size">Tamaño</label>
      <select id="bread-size" name="size">
        <option value="individual">Individual</option>
        <option value="family" selected>Familiar</option>
      </select>
    </p>
    <p>
      <label for="extras">Extras (Cmd o Ctrl + clic para elegir varios)</label>
      <select id="extras" name="extras" multiple size="4">
        <option value="orange">Ralladura de naranja</option>
        <option value="sesame" selected>Ajonjolí</option>
        <option value="anise">Anís</option>
        <option value="filling" selected>Relleno de nata</option>
      </select>
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
  display: grid;
  gap: 0.25rem;
  margin: 0 0 0.75rem;
}
select {
  font: inherit;
  color: #1f2933;
  padding: 0.35rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
}
select:focus-visible {
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
const size = document.querySelector('#bread-size');
const extras = document.querySelector('#extras');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// Un select normal: value es el value de la opción elegida; el texto visible,
// el de selectedOptions[0] (o options[selectedIndex]).
logLine(`size.value → '${size.value}' · selectedIndex → ${size.selectedIndex} · texto → '${size.selectedOptions[0].text}'`);

function reportExtras() {
  // 🐛 Con multiple, value solo da la PRIMERA opción elegida.
  logLine(`🐛 extras.value → '${extras.value}'`);
  // ✅ selectedOptions es una colección con TODAS; [...] la convierte en array.
  const chosen = [...extras.selectedOptions];
  logLine(`✅ valores → ${JSON.stringify(chosen.map((option) => option.value))}`);
  logLine(`✅ textos → ${chosen.map((option) => option.text).join(', ') || '(ninguno)'}`);
}

reportExtras();
extras.addEventListener('change', reportExtras);
logLine('Listo: añade «Anís» con Cmd + clic (Ctrl + clic en Windows)');

// Con el teclado: Tab hasta la lista, flechas para moverte y Mayús + flechas para
// ampliar la selección. Para pocas opciones, unas casillas suelen ser más fáciles.
```
