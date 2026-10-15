---
example_description: "viewBox define el sistema de coordenadas (origen arriba a la izquierda, y hacia abajo): con el mismo viewBox el dibujo escala, y con otro viewBox se hace zoom"
example_tags: "html|svg|viewbox|coordenadas|escala"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<!-- Los tres SVG contienen exactamente el mismo dibujo: una cuadrícula de 100 × 100 unidades
     con el punto (70, 30). Solo cambian width, height y viewBox. -->
<div class="row">
  <figure>
    <!-- viewBox="x y ancho alto": la parte del lienzo que se muestra. Aquí, todo: de (0,0) a (100,100) -->
    <svg width="150" height="150" viewBox="0 0 100 100" role="img" aria-label="Cuadrícula con el punto 70, 30">
      <!-- (path dibuja las líneas de la cuadrícula: lo verás en esta misma lección) -->
      <path d="M25 0 V100 M50 0 V100 M75 0 V100 M0 25 H100 M0 50 H100 M0 75 H100" stroke="#64748b" stroke-width="0.5"/>
      <rect x="0" y="0" width="100" height="100" fill="none" stroke="#334155"/>
      <circle cx="70" cy="30" r="3" fill="#be123c"/>
      <text x="2" y="8" font-size="7" fill="#1e293b">(0,0)</text>
      <text x="64" y="40" font-size="7" fill="#be123c">(70,30)</text>
    </svg>
    <figcaption>150 px, <code>viewBox="0 0 100 100"</code></figcaption>
  </figure>

  <figure>
    <!-- Mismo viewBox, doble de width y height: cada unidad mide ahora 3 px en lugar de 1,5 -->
    <svg width="300" height="300" viewBox="0 0 100 100" role="img" aria-label="La misma cuadrícula, al doble de tamaño">
      <path d="M25 0 V100 M50 0 V100 M75 0 V100 M0 25 H100 M0 50 H100 M0 75 H100" stroke="#64748b" stroke-width="0.5"/>
      <rect x="0" y="0" width="100" height="100" fill="none" stroke="#334155"/>
      <circle cx="70" cy="30" r="3" fill="#be123c"/>
      <text x="2" y="8" font-size="7" fill="#1e293b">(0,0)</text>
      <text x="64" y="40" font-size="7" fill="#be123c">(70,30)</text>
    </svg>
    <figcaption>300 px, el mismo <code>viewBox</code>: escala</figcaption>
  </figure>

  <figure>
    <!-- viewBox="50 0 50 50": solo el cuarto de arriba a la derecha, estirado a 150 px: un zoom ×2 -->
    <svg width="150" height="150" viewBox="50 0 50 50" role="img" aria-label="Zoom al cuarto superior derecho de la cuadrícula">
      <path d="M25 0 V100 M50 0 V100 M75 0 V100 M0 25 H100 M0 50 H100 M0 75 H100" stroke="#64748b" stroke-width="0.5"/>
      <rect x="0" y="0" width="100" height="100" fill="none" stroke="#334155"/>
      <circle cx="70" cy="30" r="3" fill="#be123c"/>
      <text x="2" y="8" font-size="7" fill="#1e293b">(0,0)</text>
      <text x="64" y="40" font-size="7" fill="#be123c">(70,30)</text>
    </svg>
    <figcaption>150 px, <code>viewBox="50 0 50 50"</code>: zoom</figcaption>
  </figure>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* Las figuras una al lado de otra (flexbox: capítulo de CSS) */
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 1rem;
}

figure {
  margin: 0;
}
```
