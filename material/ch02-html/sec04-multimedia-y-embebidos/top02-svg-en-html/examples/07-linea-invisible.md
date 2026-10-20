---
example_description: "Valores por defecto traicioneros: una line sin stroke no se ve y una polyline sin fill=\"none\" se rellena de negro"
example_tags: "html|svg|line|polyline|fill|stroke|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<!-- Dos veces el mismo gráfico: la temperatura máxima de la semana, con la línea de 20 °C. -->
<h2>❌ Con los valores por defecto</h2>
<svg viewBox="0 0 300 120" width="300" height="120" role="img" aria-label="Temperatura máxima de lunes a domingo: 16, 18, 21, 24, 22, 19 y 20 °C">
  <!-- 🐛 Por defecto, stroke es none y fill es black. Una line solo tiene borde: sin stroke
       no se ve. Una polyline se rellena por dentro (aunque esté abierta): sale una mancha negra. -->
  <line x1="0" y1="60" x2="300" y2="60"/>
  <polyline points="10,100 55,80 100,50 145,20 190,40 235,70 280,60"/>
</svg>

<h2>✅ Con fill y stroke</h2>
<svg viewBox="0 0 300 120" width="300" height="120" role="img" aria-label="Temperatura máxima de lunes a domingo: 16, 18, 21, 24, 22, 19 y 20 °C">
  <!-- La línea de referencia necesita stroke; la polyline, fill="none" y stroke -->
  <line x1="0" y1="60" x2="300" y2="60" stroke="#64748b" stroke-dasharray="6 4"/>
  <polyline points="10,100 55,80 100,50 145,20 190,40 235,70 280,60" fill="none" stroke="#be123c" stroke-width="3"/>
  <text x="296" y="54" text-anchor="end">20 °C</text>
</svg>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

h2 {
  font-size: 1.1rem;
}

/* Un borde punteado para ver el hueco de cada SVG (CSS: capítulo 3) */
svg {
  outline: 1px dashed #64748b;
}

text {
  font-size: 12px;
  fill: #334155;
}
```
