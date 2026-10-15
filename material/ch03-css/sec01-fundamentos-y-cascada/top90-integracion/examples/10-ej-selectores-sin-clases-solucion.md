---
example_stage: final-solution
example_description: "Solución: h2 + p, a[href^=\"https\"]::after con texto alternativo, tbody tr:nth-child(even) y td:empty::before"
example_tags: "css|solucion|selectores|pseudoclases|pseudoelementos"
---

# HTML

```html
<article>
  <h2>Ruta por la sierra</h2>
  <p>Una caminata de dificultad media, de unas cuatro horas, con vistas al embalse.</p>
  <p>Sal temprano: en verano, a mediodía, el calor aprieta.</p>

  <h2>Antes de salir</h2>
  <p>Lleva agua, protección solar y calzado de montaña.</p>
  <ul>
    <li><a href="#horarios">Horarios del autobús</a></li>
    <li><a href="https://example.com/tiempo">Previsión del tiempo</a></li>
  </ul>

  <table id="horarios">
    <caption>Horarios del autobús</caption>
    <thead>
      <tr><th scope="col">Salida</th><th scope="col">Llegada</th></tr>
    </thead>
    <tbody>
      <tr><td>08:00</td><td>09:10</td></tr>
      <tr><td>10:30</td><td></td></tr>
      <tr><td>13:00</td><td>14:10</td></tr>
      <tr><td>17:45</td><td>18:55</td></tr>
    </tbody>
  </table>
</article>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: oklch(25% 0.03 260);
}

table {
  border-collapse: collapse;
}

caption {
  font-weight: bold;
  text-align: start;
}

th,
td {
  padding: 0.3rem 1rem;
  text-align: start;
}

/* ✅ 1: + elige solo el p que va JUSTO después de un h2 (el segundo párrafo no) */
h2 + p {
  font-size: 1.15rem;
  color: oklch(45% 0.03 260);
}

/* ✅ 2: ^= «empieza por»; tras la barra, el texto que leen los lectores de pantalla */
a[href^="https"]::after {
  content: " ↗" / " (sitio externo)";
}

/* ✅ 3: even = 2n → filas 2 y 4 del tbody (el thead no cuenta: es otro padre) */
tbody tr:nth-child(even) {
  background: oklch(96% 0.01 260);
}

/* ✅ 4: <td></td> no tiene ningún hijo, ni siquiera espacios → coincide con :empty */
td:empty::before {
  content: "—";
}
```
