---
example_description: "value es siempre un string, también en type=\"number\": 2 + 1 personas da «21». valueAsNumber da el número (NaN si el campo está vacío) y Number('') convierte el vacío en 0 sin avisar"
example_tags: "javascript|formularios|value|valueasnumber|number|coercion|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Reserva de mesa · Fonda Doña Lupe</h1>
  <form id="booking" class="row" action="/reservas" method="post">
    <p>
      <label for="adults">Adultos</label>
      <input id="adults" name="adults" type="number" min="1" max="12" value="2">
    </p>
    <p>
      <label for="kids">Niños</label>
      <input id="kids" name="kids" type="number" min="0" max="12" value="1">
    </p>
  </form>
  <p>Mesa para: <output id="guests" for="adults kids">3 personas</output></p>
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
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
.row p {
  display: grid;
  gap: 0.25rem;
  margin: 0;
}
input {
  width: 6rem;
  font: inherit;
  color: #1f2933;
  padding: 0.35rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
}
input:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
output {
  font-weight: 700;
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
const adults = document.querySelector('#adults');
const kids = document.querySelector('#kids');
const guests = document.querySelector('#guests');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

function report() {
  // 🐛 value es un STRING aunque el campo sea type="number": + concatena.
  logLine(`🐛 value + value → '${adults.value + kids.value}'`);
  // ✅ valueAsNumber da un número… o NaN si el campo está vacío (o no es un número).
  const total = adults.valueAsNumber + kids.valueAsNumber;
  logLine(`✅ valueAsNumber + valueAsNumber → ${total}`);
  // 🐛 Number('') es 0: con Number(), un campo vacío se convierte en 0 sin avisar.
  logLine(`   Number(value) + Number(value) → ${Number(adults.value) + Number(kids.value)}`);
  guests.textContent = Number.isNaN(total) ? 'completa los dos campos' : `${total} personas`;
}

report();
document.querySelector('#booking').addEventListener('input', report);
logLine('Listo: cambia las cantidades; luego vacía «Niños»');
```
