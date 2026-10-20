---
example_description: "Un canvas accesible: role=\"img\" + aria-label para una imagen sencilla, o una tabla con los datos como contenido alternativo para un gráfico"
example_tags: "html|canvas|accesibilidad|role|aria-label|fallback|tabla"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<!-- Para un lector de pantalla, un canvas sin más es un hueco vacío. Compruébalo en DevTools →
     Elements → pestaña Accessibility, seleccionando cada canvas. -->

<!-- 1. Una imagen sencilla: role="img" y un aria-label que diga lo que se ve.
     (role="img" convierte el canvas en UNA imagen: lo que tenga dentro ya no se lee.) -->
<figure>
  <canvas id="logo" width="200" height="80" role="img" aria-label="Logotipo: Huerto Comunitario de Ribera"></canvas>
</figure>

<!-- 2. Un gráfico con datos: sin role, y con los datos en una tabla DENTRO del canvas.
     No se ve, pero un lector de pantalla puede recorrerla celda a celda. -->
<figure>
  <figcaption>Cosecha de tomates por mes</figcaption>
  <canvas id="chart" width="260" height="120">
    <table>
      <caption>Cosecha de tomates por mes</caption>
      <thead>
        <tr><th scope="col">Mes</th><th scope="col">Kilos</th></tr>
      </thead>
      <tbody>
        <tr><td>Julio</td><td>12</td></tr>
        <tr><td>Agosto</td><td>30</td></tr>
        <tr><td>Septiembre</td><td>18</td></tr>
      </tbody>
    </table>
  </canvas>
</figure>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

figure {
  margin: 0 0 1rem;
}
```

# JavaScript

```javascript
// Adelanto: la API 2D se estudia en el capítulo 6.
const logo = document.getElementById('logo').getContext('2d');
logo.fillStyle = '#15803d';
logo.fillRect(0, 0, 200, 80);
logo.fillStyle = '#ffffff';
logo.font = 'bold 17px system-ui, sans-serif';
logo.fillText('Huerto Comunitario', 12, 34);
logo.font = '16px system-ui, sans-serif';
logo.fillText('de Ribera', 12, 60);

const chart = document.getElementById('chart').getContext('2d');
const harvest = [['jul', 12], ['ago', 30], ['sep', 18]];
chart.font = '13px system-ui, sans-serif';
harvest.forEach(([month, kilos], index) => {
  const x = 20 + index * 80;
  chart.fillStyle = '#be123c';
  chart.fillRect(x, 95 - kilos * 2, 50, kilos * 2);
  chart.fillStyle = '#1e293b';
  chart.fillText(`${month} · ${kilos} kg`, x, 112);
});
```
