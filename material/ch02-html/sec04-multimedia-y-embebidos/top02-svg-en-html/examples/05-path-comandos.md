---
example_description: "path dibuja cualquier forma con comandos en d: M mueve, L/H/V trazan rectas, C curvas de Bézier, A arcos y Z cierra; en minúscula, las coordenadas son relativas"
example_tags: "html|svg|path|comandos|bezier|arco"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<svg viewBox="0 0 480 175" width="480" height="175" role="img" aria-label="Cuatro trazados: dos casas iguales, una curva y un arco">
  <!-- 1. Absolutos (mayúsculas): cada número es una posición del viewBox.
       M x y: mueve el lápiz sin pintar · V y: recta vertical hasta y · L x y: recta hasta (x, y)
       Z: cierra la figura volviendo al punto de partida -->
  <path d="M 20 140 V 80 L 60 40 L 100 80 V 140 Z" fill="#ccfbf1" stroke="#0f766e" stroke-width="4"/>
  <text x="60" y="165" text-anchor="middle">M V L L V Z</text>

  <!-- 2. La MISMA casa con comandos relativos (minúsculas): cada número es un desplazamiento
       desde el punto anterior. Solo cambia el primer m, que la lleva 110 unidades a la derecha. -->
  <path d="m 130 140 v -60 l 40 -40 l 40 40 v 60 z" fill="#ccfbf1" stroke="#0f766e" stroke-width="4"/>
  <text x="170" y="165" text-anchor="middle">m v l l v z</text>

  <!-- 3. C x1 y1, x2 y2, x y: curva de Bézier hasta (x, y). Los dos primeros puntos son de
       control: tiran de la curva sin que pase por ellos (en gris, sus «tiradores»). -->
  <path d="M 250 140 V 40 M 350 140 V 40" stroke="#64748b" stroke-dasharray="4 4"/>
  <circle cx="250" cy="40" r="4" fill="#64748b"/>
  <circle cx="350" cy="40" r="4" fill="#64748b"/>
  <path d="M 250 140 C 250 40, 350 40, 350 140" fill="none" stroke="#be123c" stroke-width="4"/>
  <text x="300" y="165" text-anchor="middle">C (Bézier)</text>

  <!-- 4. A rx ry giro arco-grande sentido x y: arco de elipse hasta (x, y).
       Aquí, media circunferencia de radio 40 por arriba (sentido = 1), cerrada con Z. -->
  <path d="M 380 140 A 40 40 0 0 1 460 140 Z" fill="#fde68a" stroke="#b45309" stroke-width="4"/>
  <text x="420" y="165" text-anchor="middle">A (arco)</text>
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
  font-size: 15px;
  fill: #1e293b;
}
```
