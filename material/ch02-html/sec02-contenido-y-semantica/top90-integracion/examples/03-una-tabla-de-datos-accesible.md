---
example_description: "Una tabla de datos completa y accesible: caption, grupos de filas, scope, totales en tfoot, columna destacada con col, descripción con aria-describedby y descarga de los datos"
example_tags: "integracion|tablas|scope|tfoot|aria-describedby|download"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<h1>Memoria anual de la biblioteca</h1>
<p>La sala general sigue siendo la más usada; la juvenil es la única que baja en verano.</p>

<!-- Contenedor con scroll para pantallas estrechas. Al poder desplazarse con las flechas,
     necesita foco (tabindex="0") y un nombre: role="region" + aria-labelledby → el caption -->
<div class="table-scroll" role="region" aria-labelledby="loans-caption" tabindex="0">
  <!-- aria-describedby: la nota se lee después del nombre de la tabla -->
  <table id="loans" aria-describedby="loans-note">
    <caption id="loans-caption">Préstamos por sala y trimestre (2025)</caption>
    <!-- col solo admite background, width, border y visibility: aquí, el fondo de la columna Total -->
    <colgroup>
      <col>
      <col span="4">
      <col class="total-column">
    </colgroup>
    <thead>
      <tr>
        <th scope="col">Sala</th>
        <th scope="col">Ene–mar</th>
        <th scope="col">Abr–jun</th>
        <th scope="col">Jul–sep</th>
        <th scope="col">Oct–dic</th>
        <th scope="col">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr><th scope="row">Sala infantil</th><td>1240</td><td>1180</td><td>1530</td><td>1310</td><td>5260</td></tr>
      <tr><th scope="row">Sala juvenil</th><td>860</td><td>790</td><td>640</td><td>910</td><td>3200</td></tr>
      <tr><th scope="row">Sala general</th><td>2150</td><td>2030</td><td>1720</td><td>2260</td><td>8160</td></tr>
      <tr><th scope="row">Fonoteca</th><td>430</td><td>410</td><td>520</td><td>460</td><td>1820</td></tr>
    </tbody>
    <!-- tfoot: la fila de totales. Su th también es una cabecera de fila -->
    <tfoot>
      <tr><th scope="row">Total</th><td>4680</td><td>4410</td><td>4410</td><td>4940</td><td>18&nbsp;440</td></tr>
    </tfoot>
  </table>
</div>

<p id="loans-note"><small>Los préstamos de julio a septiembre incluyen los del bibliobús de verano.</small></p>

<!-- download: descarga el archivo en lugar de abrirlo. El texto dice formato y tamaño -->
<p><a href="files/loans-2025.csv" download="prestamos-biblioteca-2025.csv">Descargar los datos (CSV, 1 KB)</a></p>
```

# CSS

```css
/* Solo para que se lea bien: el CSS se estudia en el capítulo 3 */
body {
  font-family: system-ui, sans-serif;
  color: #1f2937;
}

/* Si la tabla no cabe, este contenedor se desplaza en horizontal (overflow: capítulo de CSS) */
.table-scroll {
  overflow-x: auto;
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
  border-bottom: 1px solid #d1d5db;
}

/* Los números, alineados a la derecha para compararlos cifra a cifra */
td {
  text-align: right;
}

th[scope="row"] {
  text-align: left;
}

thead th {
  text-align: right;
}

thead th:first-child {
  text-align: left;
}

tfoot {
  font-weight: 700;
}

.total-column {
  background: #f1f5f9;
}

:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Simulamos lo que anuncia un lector de
// pantalla: primero la tabla (nombre, tamaño y descripción) y luego algunas celdas con sus
// dos cabeceras, la de su fila (scope="row") y la de su columna (scope="col").
const table = document.querySelector('#loans');
const columnHeaders = table.tHead.rows[0].cells;

console.log(`al entrar → tabla «${table.caption.textContent}», ${table.rows.length} filas × ${columnHeaders.length} columnas`);
console.log('descripción →', document.getElementById(table.getAttribute('aria-describedby')).textContent);

function announce(cell) {
  const rowHeader = cell.parentElement.querySelector('th[scope="row"]').textContent;
  return `${rowHeader}, ${columnHeaders[cell.cellIndex].textContent}: ${cell.textContent}`;
}

console.log(announce(table.tBodies[0].rows[1].cells[3])); // juvenil, verano
console.log(announce(table.tBodies[0].rows[2].cells[5])); // general, total
console.log(announce(table.tFoot.rows[0].cells[5]));      // total de totales
```
