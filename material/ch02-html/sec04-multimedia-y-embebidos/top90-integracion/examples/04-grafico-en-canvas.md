---
example_description: "Un gráfico de lluvia en canvas nítido en pantallas Retina (bitmap × devicePixelRatio), con una tabla de datos como contenido alternativo y la tabla visible pintada desde un <template>"
example_tags: "integracion|canvas|devicepixelratio|fallback|accesibilidad|template|tabla"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<h1>Lluvia en el huerto, primer semestre</h1>

<!-- El canvas: sin role, porque es un gráfico con datos. Su contenido alternativo es una tabla
     de verdad: no se ve mientras el canvas funciona, pero la leen los lectores de pantalla
     y aparece si no hay JavaScript. -->
<canvas id="rain-chart" width="320" height="180">
  <table>
    <caption>Lluvia mensual en litros por metro cuadrado</caption>
    <tr><th scope="col">Mes</th><th scope="col">Lluvia</th></tr>
    <tr><td>enero</td><td>38</td></tr><tr><td>febrero</td><td>42</td></tr>
    <tr><td>marzo</td><td>31</td></tr><tr><td>abril</td><td>55</td></tr>
    <tr><td>mayo</td><td>47</td></tr><tr><td>junio</td><td>12</td></tr>
  </table>
</canvas>

<!-- La misma tabla, visible para todo el mundo, construida con una plantilla -->
<details>
  <summary>Ver los datos en una tabla</summary>
  <table>
    <caption>Lluvia mensual (l/m²)</caption>
    <thead><tr><th scope="col">Mes</th><th scope="col">Lluvia</th></tr></thead>
    <tbody id="rain-rows"></tbody>
  </table>
</details>

<!-- Una fila inerte; se clona una vez por mes -->
<template id="rain-row">
  <tr><td class="month"></td><td class="amount num"></td></tr>
</template>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  max-width: 42rem;
  padding: 0 1rem;
}

/* La CAJA del canvas se fija en CSS; el script ajusta su mapa de bits a la pantalla */
#rain-chart {
  width: 320px;
  height: 180px;
  border: 1px solid #64748b;
}

th, td {
  padding: 0.2rem 0.75rem;
  text-align: left;
}

.num {
  text-align: right;
}

summary:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript (y la API 2D del canvas) se explican en sus capítulos.
const rain = [['ene', 'enero', 38], ['feb', 'febrero', 42], ['mar', 'marzo', 31],
  ['abr', 'abril', 55], ['may', 'mayo', 47], ['jun', 'junio', 12]];

// 1. La tabla visible, desde la plantilla (una COPIA por fila)
const rowTemplate = document.getElementById('rain-row');
const rows = document.getElementById('rain-rows');
for (const [, monthName, liters] of rain) {
  const row = rowTemplate.content.cloneNode(true);
  row.querySelector('.month').textContent = monthName;
  row.querySelector('.amount').textContent = liters;
  rows.append(row);
}

// 2. El gráfico: mapa de bits = caja CSS × devicePixelRatio, y scale para dibujar en px CSS
const chart = document.getElementById('rain-chart');
function drawChart() {
  const ratio = window.devicePixelRatio;
  chart.width = Math.round(320 * ratio);   // asignar width BORRA el dibujo: se redibuja todo
  chart.height = Math.round(180 * ratio);
  const ctx = chart.getContext('2d');
  ctx.scale(ratio, ratio);
  ctx.font = '12px system-ui, sans-serif';
  rain.forEach(([shortName, , liters], index) => {
    const x = 20 + index * 50;
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(x, 150 - liters * 2.2, 32, liters * 2.2);
    ctx.fillStyle = '#1e293b';
    ctx.fillText(shortName, x + 4, 168);
    ctx.fillText(String(liters), x + 6, 145 - liters * 2.2);
  });
  console.log(`devicePixelRatio ${ratio} → mapa de bits ${chart.width} × ${chart.height} para una caja de 320 × 180`);
}
drawChart();
console.log('filas de la tabla visible →', rows.children.length);
```
