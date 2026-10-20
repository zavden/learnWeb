---
example_description: "valueAsDate de un type=\"date\" es la medianoche UTC de ese día: leído con getDate() o toLocaleDateString() en Ciudad de México sale el día ANTERIOR. Se lee con getUTCDate(), con Intl y timeZone: 'UTC', o se usa el string de value"
example_tags: "javascript|formularios|valueasdate|date|zonas-horarias|intl|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Hotel Casa Azul · Oaxaca</h1>
  <form id="stay" action="/reservas" method="post">
    <label for="arrival">Llegada</label>
    <input id="arrival" name="arrival" type="date" value="2026-11-20">
  </form>
  <p id="summary" class="summary">Llegas el …</p>
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
input {
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
.summary {
  font-weight: 600;
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
const arrival = document.querySelector('#arrival');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
// Un formateador con la zona UTC: muestra el día que eligió el usuario.
const utcDay = new Intl.DateTimeFormat('es-MX', { dateStyle: 'full', timeZone: 'UTC' });

function report() {
  logLine(`value → '${arrival.value}' (un string AAAA-MM-DD)`);
  const date = arrival.valueAsDate; // null si el campo está vacío
  if (date === null) return;
  logLine(`valueAsDate → ${date.toISOString()} (medianoche UTC)`);
  // 🐛 Los métodos locales calculan el día en TU zona: al oeste de Greenwich,
  //    la medianoche UTC todavía es el día anterior.
  logLine(`🐛 getDate() → ${date.getDate()} · toLocaleDateString → ${date.toLocaleDateString('es-MX')}`);
  // ✅ Léelo en UTC…
  logLine(`✅ getUTCDate() → ${date.getUTCDate()} · Intl en UTC → ${utcDay.format(date)}`);
  document.querySelector('#summary').textContent = `Llegas el ${utcDay.format(date)}`;
}

logLine(`tu zona → ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
report();
arrival.addEventListener('change', report);
logLine('Listo: elige otra fecha de llegada');

// ✅ …o no conviertas: para guardar o enviar una fecha de calendario, el string
//    '2026-11-20' de value es lo más seguro (es lo que envía el formulario).
```
