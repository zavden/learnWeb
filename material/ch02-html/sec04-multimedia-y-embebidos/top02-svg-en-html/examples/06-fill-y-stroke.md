---
example_description: "fill rellena y stroke dibuja el borde: stroke-width, stroke-linecap, stroke-dasharray y opacidades; el borde va centrado sobre el contorno"
example_tags: "html|svg|fill|stroke|linecap|dasharray"
example_stage: minimal
example_importance: important
---

# HTML

```html
<svg viewBox="0 0 520 190" width="520" height="190" role="img" aria-label="Muestras de relleno y borde en SVG">
  <!-- fill: color de relleno · stroke: color del borde · stroke-width: grosor del borde -->
  <rect x="20" y="20" width="80" height="60" fill="#bae6fd" stroke="#0369a1" stroke-width="6"/>
  <text x="60" y="105" text-anchor="middle">fill + stroke</text>

  <!-- fill="none": solo borde · fill-opacity: relleno semitransparente -->
  <circle cx="170" cy="50" r="30" fill="none" stroke="#15803d" stroke-width="6"/>
  <circle cx="245" cy="50" r="30" fill="#15803d" fill-opacity="0.35" stroke="#15803d" stroke-width="2"/>
  <text x="207" y="105" text-anchor="middle">none · opacity</text>

  <!-- El borde va CENTRADO sobre el contorno: la mitad por dentro y la mitad por fuera.
       Este rect empieza en x=0, así que la mitad izquierda de su borde queda fuera del SVG. -->
  <rect x="0" y="125" width="100" height="50" fill="#fef3c7" stroke="#b45309" stroke-width="12"/>
  <text x="160" y="155" text-anchor="middle">borde cortado</text>

  <!-- stroke-linecap: cómo acaban las líneas: butt (en seco), round (redondo), square (cuadrado) -->
  <line x1="320" y1="25" x2="490" y2="25" stroke="#6d28d9" stroke-width="14" stroke-linecap="butt"/>
  <line x1="320" y1="55" x2="490" y2="55" stroke="#6d28d9" stroke-width="14" stroke-linecap="round"/>
  <line x1="320" y1="85" x2="490" y2="85" stroke="#6d28d9" stroke-width="14" stroke-linecap="square"/>
  <!-- Las guías grises marcan dónde acaban de verdad las líneas (x = 320 y x = 490) -->
  <path d="M 320 10 V 100 M 490 10 V 100" stroke="#64748b"/>
  <text x="405" y="120" text-anchor="middle">butt · round · square</text>

  <!-- stroke-dasharray: trazo y hueco (aquí, 12 y 6 unidades) -->
  <line x1="320" y1="150" x2="490" y2="150" stroke="#be123c" stroke-width="4" stroke-dasharray="12 6"/>
  <text x="405" y="175" text-anchor="middle">dasharray</text>
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
  outline: 1px dashed #64748b;
}

text {
  font-size: 14px;
  fill: #1e293b;
}
```
