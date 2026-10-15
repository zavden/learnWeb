---
example_description: "En una caja apaisada, 45deg no va de esquina a esquina: la línea del degradado forma 45° con la pantalla. to top right se adapta a la caja y su mitad pasa exactamente por las otras dos esquinas"
example_tags: "css|degradados|linear-gradient|angulos|to-top-right|bug"
example_stage: common-error
example_importance: useful
---

# HTML

```html
<p class="caption">Cajas de 400 × 100 con una parada dura al 50 %: el borde entre los dos colores es la línea que marca la mitad del degradado.</p>

<p class="label">❌ <code>45deg</code>: el borde cruza la caja a 45° por el centro y corta los lados largos en 150 y 250px</p>
<div class="box is-angle"></div>

<p class="label">✅ <code>to top right</code>: el borde va de la esquina superior izquierda a la inferior derecha (aquí equivale a unos <code>14deg</code>)</p>
<div class="box is-corner"></div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="label">En una caja cuadrada, las dos formas coinciden</p>
<div class="squares">
  <div class="square is-angle"></div>
  <div class="square is-corner"></div>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption,
.label {
  margin: 8px 0 4px;
  font-size: 0.72rem;
}

.box {
  width: 400px;
  height: 100px;
}

.ruler {
  display: block;
  margin-top: 4px;
}

.squares {
  display: flex;
  gap: 16px;
}

.square {
  width: 100px;
  height: 100px;
}

/* 🐛 Un ángulo es un ángulo respecto a la PANTALLA: 45deg apunta arriba a la
   derecha formando 45° exactos, sea cual sea la forma de la caja. La mitad
   del degradado es una línea perpendicular a esa dirección que pasa por el
   centro (200, 50): con pendiente de 45°, toca el borde de arriba en x = 150
   y el de abajo en x = 250. Las esquinas se quedan con un solo color. */
.is-angle {
  background-image: linear-gradient(45deg, #1d4ed8 50%, #f59e0b 50%);
}

/* ✅ Con palabras clave de esquina, el navegador calcula el ángulo para que
   la línea del 50 % pase por las OTRAS dos esquinas: la diagonal de la caja.
   En 400 × 100 son unos 14deg; en un cuadrado, 45deg. */
.is-corner {
  background-image: linear-gradient(to top right, #1d4ed8 50%, #f59e0b 50%);
}
```
