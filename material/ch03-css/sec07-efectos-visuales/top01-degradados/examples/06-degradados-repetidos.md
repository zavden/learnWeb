---
example_description: "repeating-linear-gradient, repeating-radial-gradient y repeating-conic-gradient repiten el tramo entre la primera y la última parada: rayas, anillos y rayos sin imágenes; sin longitudes, no se repite nada"
example_tags: "css|degradados|repeating-linear-gradient|repeating-radial-gradient|repeating-conic-gradient|rayas"
example_stage: minimal
example_importance: important
---

# HTML

```html
<ul class="tiles">
  <li><div class="tile stripes"></div>Rayas a −45°: <code>amarillo 0 14px, negro 14px 28px</code></li>
  <li><div class="tile lines"></div>Una línea cada 24px: <code>gris 0 1px, transparent 1px 24px</code></li>
  <li><div class="tile rings"></div>Anillos: <code>repeating-radial-gradient(circle, …)</code></li>
  <li><div class="tile rays"></div>Rayos: <code>repeating-conic-gradient(… 0 15deg, … 15deg 30deg)</code></li>
  <li><div class="tile no-repeat"></div>❌ Sin longitudes: el tramo es 0-100 % y no hay nada que repetir</li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, 140px);
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.7rem;
}

.tile {
  width: 140px;
  height: 90px;
  margin-bottom: 4px;
  outline: 1px solid #cbd5e1;
}

/* Un degradado repetido toma el tramo entre la PRIMERA y la ÚLTIMA parada
   (aquí, 0-28px) y lo repite en las dos direcciones hasta llenar la caja.
   Las paradas duras convierten la repetición en rayas: la cinta de «obras». */
.stripes {
  background-image: repeating-linear-gradient(-45deg, #facc15 0 14px, #1e293b 14px 28px);
}

/* Líneas finas sobre un fondo: el color va en background-color y el
   degradado pinta solo 1px de cada 24px. */
.lines {
  background-color: #f8fafc;
  background-image: repeating-linear-gradient(to bottom, #94a3b8 0 1px, transparent 1px 24px);
}

/* El mismo principio desde un centro: anillos de 16px. */
.rings {
  background-image: repeating-radial-gradient(circle, #1d4ed8 0 8px, #dbeafe 8px 16px);
}

/* Y alrededor de un centro: el tramo es de 30deg, así que hay 12 rayos. */
.rays {
  background-image: repeating-conic-gradient(#f59e0b 0 15deg, #fef3c7 15deg 30deg);
}

/* ❌ Sin posiciones, la primera parada está en 0 % y la última en 100 %: el
   tramo ocupa toda la caja y el resultado es un degradado normal. */
.no-repeat {
  background-image: repeating-linear-gradient(#1d4ed8, #dbeafe);
}
```
