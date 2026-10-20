---
example_description: "Ejercicio: una tabla sin caption, con cabeceras falsas, sin grupos de filas, con una columna fantasma y una celda que no ocupa su sitio"
example_tags: "ejercicio|tablas|caption|scope|rowspan|colspan"
example_stage: exercise
example_importance: important
exercise: true
exercise_title: "Arregla la tabla del horario"
exercise_instructions: "Convierte el párrafo del título en el caption de la tabla || Mete la fila de cabeceras en un thead y cambia sus td por th con scope=\"col\" (sin <b>) || Mete el resto de filas en un tbody y haz que el día de cada fila sea un th con scope=\"row\" || Quita la celda que sobra en la fila del martes: la ocupa ya el rowspan del lunes || Haz que «Cerrado» ocupe las dos columnas del domingo || Comprueba que la consola sale toda ✅"
exercise_hints: "Cuenta las posiciones de cada fila: la consola las muestra y deben ser 3 en todas || Un rowspan=\"4\" ocupa su columna en esa fila y en las tres siguientes || El aspecto en negrita de las cabeceras lo da th, no hace falta <b> || colspan=\"2\""
exercise_solution_example: 10-ej-arregla-la-tabla-solucion.md
exercise_locked_files: styles.css,script.js
console: true
---

# HTML

```html
<!-- TODO 1: este título debería ser el caption de la tabla -->
<p><b>Horario de la piscina cubierta</b></p>

<table>
  <!-- TODO 2: fila de cabeceras: en un thead, con th y scope="col" (y sin <b>) -->
  <tr>
    <td><b>Día</b></td>
    <td><b>Nado libre</b></td>
    <td><b>Cursillos</b></td>
  </tr>
  <!-- TODO 3: las filas de datos, en un tbody; el día de cada fila, un th con scope="row" -->
  <tr>
    <td>Lunes</td>
    <td>7:00–21:00</td>
    <td rowspan="4">17:00–20:00</td>
  </tr>
  <tr>
    <td>Martes</td>
    <td>7:00–21:00</td>
    <!-- TODO 4: aquí sobra algo (mira la columna fantasma a la derecha) -->
    <td>17:00–20:00</td>
  </tr>
  <tr>
    <td>Miércoles</td>
    <td>7:00–21:00</td>
  </tr>
  <tr>
    <td>Jueves</td>
    <td>7:00–21:00</td>
  </tr>
  <tr>
    <td>Viernes</td>
    <td>7:00–21:00</td>
    <td>Sin cursillos</td>
  </tr>
  <tr>
    <td>Sábado</td>
    <td>9:00–14:00</td>
    <td>Sin cursillos</td>
  </tr>
  <tr>
    <td>Domingo</td>
    <!-- TODO 5: «Cerrado» vale para las dos columnas -->
    <td>Cerrado</td>
  </tr>
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
// Comprobaciones automáticas (bloqueadas: no hace falta tocarlas). Adelanto: JavaScript se
// explica en su capítulo. positions() cuenta las posiciones que ocupa cada fila, sumando
// los colspan y las posiciones que tapan los rowspan de las filas de arriba.
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
