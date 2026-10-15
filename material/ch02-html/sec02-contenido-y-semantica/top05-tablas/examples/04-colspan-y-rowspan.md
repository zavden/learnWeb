---
example_description: "colspan y rowspan hacen que una celda ocupe varias columnas o filas; las celdas «tapadas» no se escriben en las filas siguientes"
example_tags: "html|tablas|colspan|rowspan"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<table>
  <caption>Programa del taller</caption>
  <thead>
    <tr><th scope="col">Hora</th><th scope="col">Sala A</th><th scope="col">Sala B</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">10:00</th><td colspan="2">Bienvenida (las dos salas juntas)</td></tr>
    <tr><th scope="row">11:00</th><td rowspan="2">Taller de CSS Grid (2 horas)</td><td>Accesibilidad</td></tr>
    <!-- Esta fila solo tiene 2 celdas: la tercera posición la ocupa el rowspan de arriba. -->
    <tr><th scope="row">12:00</th><td>Rendimiento web</td></tr>
    <tr><th scope="row">13:00</th><td colspan="2">Comida</td></tr>
  </tbody>
</table>
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
  padding: 8px 12px;
}

td[colspan] { background: #fef3c7; text-align: center; }
td[rowspan] { background: #dbeafe; }

/* Si escribes una celda de más donde ya hay un rowspan, la tabla se «desplaza» y aparece
   una columna fantasma a la derecha: cuenta siempre las posiciones ocupadas. */
```
