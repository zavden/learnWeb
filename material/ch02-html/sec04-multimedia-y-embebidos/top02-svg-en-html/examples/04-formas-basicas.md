---
example_description: "Las seis formas básicas de SVG: rect (con esquinas redondeadas), circle, ellipse, line, polyline y polygon, cada una con sus atributos de posición"
example_tags: "html|svg|formas|rect|circle|ellipse|line|polyline|polygon"
example_stage: minimal
example_importance: important
---

# HTML

```html
<!-- Todas las coordenadas están en unidades del viewBox (0 0 600 150). -->
<svg viewBox="0 0 600 150" width="600" height="150" role="img" aria-label="Las seis formas básicas de SVG">
  <!-- rect: esquina superior izquierda (x, y), width, height; rx redondea las esquinas -->
  <rect x="10" y="20" width="80" height="80" rx="12" fill="#0e7490"/>
  <text x="50" y="130" text-anchor="middle">rect</text>

  <!-- circle: centro (cx, cy) y radio r -->
  <circle cx="150" cy="60" r="40" fill="#15803d"/>
  <text x="150" y="130" text-anchor="middle">circle</text>

  <!-- ellipse: centro y dos radios, rx (horizontal) y ry (vertical) -->
  <ellipse cx="250" cy="60" rx="45" ry="28" fill="#b45309"/>
  <text x="250" y="130" text-anchor="middle">ellipse</text>

  <!-- line: de (x1, y1) a (x2, y2). Solo tiene borde: sin stroke no se ve -->
  <line x1="310" y1="100" x2="380" y2="20" stroke="#be123c" stroke-width="6"/>
  <text x="345" y="130" text-anchor="middle">line</text>

  <!-- polyline: una lista de puntos «x,y» unidos por líneas, abierta -->
  <polyline points="410,100 430,40 450,80 470,30 490,90" fill="none" stroke="#6d28d9" stroke-width="5"/>
  <text x="450" y="130" text-anchor="middle">polyline</text>

  <!-- polygon: igual, pero se cierra solo (el último punto se une con el primero) -->
  <polygon points="550,15 590,95 510,95" fill="#0369a1"/>
  <text x="550" y="130" text-anchor="middle">polygon</text>
</svg>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* En una vista estrecha, el SVG se encoge (CSS: capítulo 3) */
svg {
  max-width: 100%;
  height: auto;
}

text {
  font-size: 16px;
  fill: #1e293b;
}
```
