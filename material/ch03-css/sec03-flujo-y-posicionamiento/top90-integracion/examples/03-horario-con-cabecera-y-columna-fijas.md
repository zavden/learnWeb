---
example_description: "Un horario de autobuses en un contenedor con scroll en los dos ejes: la fila de paradas y la columna de servicios son sticky, y la esquina queda por encima de ambas"
example_tags: "css|sticky|z-index|overflow|tablas|scroll"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="hint">↔ ↕ Desplaza el horario en los dos sentidos: las paradas y los servicios se quedan a la vista.</p>

<div class="timetable" tabindex="0" role="region" aria-labelledby="timetable-caption">
  <table>
    <caption id="timetable-caption">Autobús Madrid (Moncloa) – Segovia, días laborables</caption>
    <thead>
      <tr>
        <th scope="col">Servicio</th>
        <th scope="col">Moncloa</th>
        <th scope="col">Las Rozas</th>
        <th scope="col">Collado Villalba</th>
        <th scope="col">Guadarrama</th>
        <th scope="col">El Espinar</th>
        <th scope="col">Segovia</th>
      </tr>
    </thead>
    <tbody>
      <tr><th scope="row">101 · directo</th><td>6:30</td><td>—</td><td>—</td><td>—</td><td>—</td><td>7:40</td></tr>
      <tr><th scope="row">103</th><td>7:00</td><td>7:20</td><td>7:38</td><td>7:50</td><td>8:05</td><td>8:30</td></tr>
      <tr><th scope="row">105 · directo</th><td>7:30</td><td>—</td><td>—</td><td>—</td><td>—</td><td>8:40</td></tr>
      <tr><th scope="row">107</th><td>8:15</td><td>8:35</td><td>8:53</td><td>9:05</td><td>9:20</td><td>9:45</td></tr>
      <tr><th scope="row">109</th><td>9:30</td><td>9:50</td><td>10:08</td><td>10:20</td><td>10:35</td><td>11:00</td></tr>
      <tr><th scope="row">111 · directo</th><td>11:00</td><td>—</td><td>—</td><td>—</td><td>—</td><td>12:10</td></tr>
      <tr><th scope="row">113</th><td>12:30</td><td>12:50</td><td>13:08</td><td>13:20</td><td>13:35</td><td>14:00</td></tr>
      <tr><th scope="row">115</th><td>14:15</td><td>14:35</td><td>14:53</td><td>15:05</td><td>15:20</td><td>15:45</td></tr>
      <tr><th scope="row">117 · directo</th><td>16:00</td><td>—</td><td>—</td><td>—</td><td>—</td><td>17:10</td></tr>
      <tr><th scope="row">119</th><td>18:30</td><td>18:50</td><td>19:08</td><td>19:20</td><td>19:35</td><td>20:00</td></tr>
    </tbody>
  </table>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.hint {
  font-size: 0.85rem;
}

/* Un único contenedor de scroll para los dos ejes. Ojo con la lección 4: si solo pusieras
   overflow-x: auto (para el scroll horizontal), el contenedor sería igualmente el contenedor
   de scroll de la cabecera sticky… y, sin altura máxima, nunca se desplazaría en vertical:
   la cabecera no se pegaría. Por eso tiene max-height y hace scroll en los dos ejes. */
.timetable {
  max-width: 36rem;
  max-height: 13rem;
  overflow: auto;
  border: 1px solid #94a3b8;
  border-radius: 8px;
}

.timetable:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

/* separate + border-spacing: 0 en lugar de collapse: con bordes colapsados, los bordes son
   de la tabla y no viajan con las celdas sticky (se quedan atrás al desplazar). */
table {
  min-width: 40rem;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.85rem;
}

caption {
  padding: 0.5rem 0.75rem;
  font-weight: bold;
  text-align: start;
}

th,
td {
  padding: 0.4rem 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
  text-align: start;
}

/* Las celdas sticky necesitan fondo: si no, se vería el contenido que pasa por debajo. */
thead th {
  position: sticky;
  top: 0;
  z-index: 1;                        /* lección 5: por encima de la columna fija */
  border-bottom: 2px solid #1e3a8a;
  background: #dbeafe;
}

tbody th {
  position: sticky;
  left: 0;
  border-right: 2px solid #cbd5e1;
  background: #f1f5f9;
}

/* La esquina es sticky en los dos ejes y debe quedar encima de todo lo demás. */
thead th:first-child {
  left: 0;
  z-index: 2;
}
```
