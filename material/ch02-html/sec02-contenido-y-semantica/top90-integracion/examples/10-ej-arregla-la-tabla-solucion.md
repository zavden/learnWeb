---
example_description: "Solución: el horario con caption, thead y tbody, cabeceras th con scope, el rowspan bien contado y el colspan del domingo"
example_tags: "solucion|tablas|caption|scope|rowspan|colspan"
example_stage: final-solution
example_importance: important
console: true
---

# HTML

```html
<table>
  <!-- ✅ 1. El título, dentro de la tabla: un lector de pantalla lo anuncia al entrar -->
  <caption>Horario de la piscina cubierta</caption>
  <!-- ✅ 2. Cabeceras de columna: th con scope="col"; la negrita ya la pone th -->
  <thead>
    <tr>
      <th scope="col">Día</th>
      <th scope="col">Nado libre</th>
      <th scope="col">Cursillos</th>
    </tr>
  </thead>
  <!-- ✅ 3. Filas de datos en tbody; cada día, cabecera de su fila -->
  <tbody>
    <tr>
      <th scope="row">Lunes</th>
      <td>7:00–21:00</td>
      <td rowspan="4">17:00–20:00</td>
    </tr>
    <!-- ✅ 4. De martes a jueves, la tercera posición ya la ocupa el rowspan del lunes -->
    <tr>
      <th scope="row">Martes</th>
      <td>7:00–21:00</td>
    </tr>
    <tr>
      <th scope="row">Miércoles</th>
      <td>7:00–21:00</td>
    </tr>
    <tr>
      <th scope="row">Jueves</th>
      <td>7:00–21:00</td>
    </tr>
    <tr>
      <th scope="row">Viernes</th>
      <td>7:00–21:00</td>
      <td>Sin cursillos</td>
    </tr>
    <tr>
      <th scope="row">Sábado</th>
      <td>9:00–14:00</td>
      <td>Sin cursillos</td>
    </tr>
    <tr>
      <th scope="row">Domingo</th>
      <!-- ✅ 5. Una celda que ocupa las dos columnas -->
      <td colspan="2">Cerrado</td>
    </tr>
  </tbody>
</table>
```

# CSS

```css
/* Bloqueado: no hace falta tocarlo */
body {
  font-family: system-ui, sans-serif;
  color: #1f2937;
}

table {
  border-collapse: collapse;
}

caption {
  padding-bottom: 0.5rem;
  font-weight: 700;
  text-align: left;
}

th,
td {
  padding: 0.4rem 0.75rem;
  border: 1px solid #94a3b8;
  text-align: left;
}

thead th {
  background: #e2e8f0;
}

td[rowspan] {
  background: #dbeafe;
}

td[colspan] {
  text-align: center;
  background: #f1f5f9;
}
```

# JavaScript

```javascript
// Las mismas comprobaciones del ejercicio: ahora todas salen ✅
const table = document.querySelector('table');

function positions(table) {
  const covered = [];
  return [...table.rows].map((row, index) => {
    let width = covered[index] ?? 0;
    for (const cell of row.cells) {
      width += cell.colSpan;
      for (let next = 1; next < cell.rowSpan; next += 1) {
        covered[index + next] = (covered[index + next] ?? 0) + cell.colSpan;
      }
    }
    return width;
  });
}

const widths = positions(table);
const headerCells = table.tHead ? [...table.tHead.rows[0].cells] : [];
const bodyRows = table.tHead ? [...table.tBodies[0].rows] : [];

const checks = [
  ['la tabla tiene caption («Horario de la piscina cubierta»)', table.caption?.textContent.trim() === 'Horario de la piscina cubierta'],
  ['la fila de cabeceras está en un thead', table.tHead !== null],
  ['las cabeceras son th con scope="col"', headerCells.length === 3 && headerCells.every((cell) => cell.matches('th[scope="col"]'))],
  ['cada fila de datos empieza con un th scope="row"', bodyRows.length === 7 && bodyRows.every((row) => row.cells[0].matches('th[scope="row"]'))],
  ['ninguna cabecera usa <b>', table.querySelector('b') === null],
  ['todas las filas ocupan 3 posiciones (sin columna fantasma ni huecos)', widths.every((width) => width === 3)],
];
for (const [label, ok] of checks) console.log(ok ? '✅' : '❌', label);
console.log('posiciones por fila →', widths.join(', '));
```
