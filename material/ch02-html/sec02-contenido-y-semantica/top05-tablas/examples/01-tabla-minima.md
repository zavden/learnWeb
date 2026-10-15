---
example_description: "Una tabla mínima: table contiene filas tr, y cada fila contiene celdas de cabecera th o de datos td"
example_tags: "html|tablas|table|tr|td|th"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<!-- Una tabla es una cuadrícula de FILAS (tr); cada fila tiene CELDAS (th o td).
     No hay elementos para las columnas: una columna es «la celda N de cada fila». -->
<table>
  <tr>
    <th>Ciudad</th>
    <th>Habitantes</th>
  </tr>
  <tr>
    <td>Madrid</td>
    <td>3 422 416</td>
  </tr>
  <tr>
    <td>Barcelona</td>
    <td>1 686 208</td>
  </tr>
</table>

<p>Sin CSS, el navegador solo pone en negrita y centra los th, y separa un poco las celdas.</p>
```
