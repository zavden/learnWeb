---
example_description: "th con scope='col' o scope='row' le dice a un lector de pantalla qué cabecera corresponde a cada dato"
example_tags: "html|tablas|th|scope|accesibilidad"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<table>
  <caption>Horario de apertura</caption>
  <tr>
    <td></td>
    <th scope="col">Lunes a viernes</th>
    <th scope="col">Sábado</th>
  </tr>
  <tr>
    <th scope="row">Mañana</th>
    <td>9:00–14:00</td>
    <td>10:00–14:00</td>
  </tr>
  <tr>
    <th scope="row">Tarde</th>
    <td>17:00–20:30</td>
    <td>Cerrado</td>
  </tr>
</table>
<p>Al llegar a «Cerrado», un lector de pantalla dice «Tarde, Sábado: Cerrado». Sin cabeceras, solo diría «Cerrado».</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

table {
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #94a3b8;
  padding: 6px 10px;
}

th[scope="row"] {
  text-align: left;
  background: #f1f5f9;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Reproduce lo que anunciaría un lector de pantalla:
// para cada celda de datos, busca su cabecera de fila (th scope=row) y de columna (th scope=col).
const table = document.querySelector('table');
const columnHeaders = [...table.rows[0].cells];
for (const row of [...table.rows].slice(1)) {
  const rowHeader = row.querySelector('th[scope="row"]').textContent;
  [...row.cells].slice(1).forEach((cell, index) => {
    console.log(`${rowHeader}, ${columnHeaders[index + 1].textContent}: ${cell.textContent}`);
  });
}
```
