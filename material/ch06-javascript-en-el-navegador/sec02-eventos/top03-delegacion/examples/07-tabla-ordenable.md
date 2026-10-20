---
example_description: "Una tabla ordenable con delegación: un listener en el <thead> atiende los botones de todas las columnas, reordena las filas moviéndolas con append y anuncia el orden con aria-sort"
example_tags: "javascript|eventos|delegacion|tabla|ordenar|aria-sort|accesibilidad"
example_stage: intermediate
example_importance: useful
console: true
---

# HTML

```html
<main>
  <table id="coffees" class="coffees">
    <caption>Cafés de origen (pulsa una cabecera para ordenar)</caption>
    <thead>
      <tr>
        <th scope="col" aria-sort="none"><button type="button" data-sort="origin">Origen</button></th>
        <th scope="col" aria-sort="none"><button type="button" data-sort="altitude">Altitud (m)</button></th>
        <th scope="col" aria-sort="none"><button type="button" data-sort="price">Precio</button></th>
      </tr>
    </thead>
    <tbody>
      <tr data-origin="Chiapas" data-altitude="1400" data-price="210"><td>Chiapas</td><td>1400</td><td>$210.00</td></tr>
      <tr data-origin="Veracruz" data-altitude="1200" data-price="185"><td>Veracruz</td><td>1200</td><td>$185.00</td></tr>
      <tr data-origin="Oaxaca" data-altitude="1650" data-price="240"><td>Oaxaca</td><td>1650</td><td>$240.00</td></tr>
      <tr data-origin="Ánimas (Guerrero)" data-altitude="1100" data-price="175"><td>Ánimas (Guerrero)</td><td>1100</td><td>$175.00</td></tr>
    </tbody>
  </table>
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
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
.coffees {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
}
caption {
  font-weight: 700;
  text-align: start;
  padding-bottom: 0.5rem;
}
th,
td {
  padding: 0.35rem 0.5rem;
  border-bottom: 1px solid #cbd2d9;
  text-align: start;
}
th button {
  font: inherit;
  font-weight: 700;
  padding: 0.15rem 0.3rem;
  border: 0;
  background: none;
  color: #1f2933;
  cursor: pointer;
}
th button::after {
  content: " ↕";
  color: #52606d;
}
th[aria-sort="ascending"] button::after {
  content: " ▲";
}
th[aria-sort="descending"] button::after {
  content: " ▼";
}
th button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 1px;
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
const table = document.querySelector('#coffees');
const tbody = table.querySelector('tbody');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

function compareRows(key) {
  if (key === 'origin') return (a, b) => a.dataset.origin.localeCompare(b.dataset.origin, 'es');
  return (a, b) => Number(a.dataset[key]) - Number(b.dataset[key]);
}

table.querySelector('thead').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-sort]');
  if (!button) return;
  const header = button.closest('th');
  // Si ya estaba ascendente, ahora descendente; si no, ascendente.
  const direction = header.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
  for (const th of table.querySelectorAll('thead th')) th.setAttribute('aria-sort', 'none');
  header.setAttribute('aria-sort', direction);

  const rows = [...tbody.rows].toSorted(compareRows(button.dataset.sort));
  if (direction === 'descending') rows.reverse();
  tbody.append(...rows); // mover filas existentes: se reordenan, no se duplican
  logLine(`↕ ${button.dataset.sort} (${direction}) → ${rows.map((row) => row.dataset.origin).join(', ')}`);
});
logLine('Listo: pulsa «Precio» dos veces y luego «Origen»');

// aria-sort en el <th> anuncia el orden a los lectores de pantalla; las
// flechas del CSS lo muestran a la vista. Los botones dan el teclado gratis.
```
