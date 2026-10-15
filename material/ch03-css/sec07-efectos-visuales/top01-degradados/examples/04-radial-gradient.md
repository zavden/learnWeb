---
example_description: "radial-gradient() crece desde un punto: por defecto es una elipse con la forma de la caja que llega a la esquina más lejana; circle, el tamaño (closest-side…) y at cambian la forma, el alcance y el centro"
example_tags: "css|degradados|radial-gradient|circle|closest-side"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">Cajas de 200 × 110. Cada parada se mide desde el centro hacia fuera.</p>
<ul class="tiles">
  <li><div class="tile r-default"></div><code>(ámbar, marrón)</code><br>elipse con la forma de la caja</li>
  <li><div class="tile r-circle"></div><code>(circle, …)</code><br>círculo hasta la esquina más lejana</li>
  <li><div class="tile r-closest"></div><code>(circle closest-side, … 100%, blanco 0)</code><br>círculo que toca los lados más cercanos</li>
  <li><div class="tile r-at"></div><code>(circle at 30% 35%, …)</code><br>centro desplazado: una esfera con su brillo</li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 0 0 8px;
  font-size: 0.75rem;
}

.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, 200px);
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.7rem;
}

.tile {
  width: 200px;
  height: 110px;
  margin-bottom: 4px;
  outline: 1px solid #cbd5e1;
}

/* Por defecto: forma ellipse, tamaño farthest-corner (la elipse que pasa por
   la esquina más lejana) y centro en el centro de la caja. Por eso, en una caja
   apaisada, el degradado sale alargado. */
.r-default { background-image: radial-gradient(#fde68a, #92400e); }

/* circle: el radio es el mismo en todas direcciones. */
.r-circle  { background-image: radial-gradient(circle, #fde68a, #92400e); }

/* El tamaño también se puede elegir con palabras clave: closest-side,
   farthest-side, closest-corner, farthest-corner (o una longitud: 40px).
   Con una parada dura al 100 %, el resultado es un disco liso: aquí, de 110px
   de diámetro, porque los lados más cercanos son el de arriba y el de abajo. */
.r-closest { background-image: radial-gradient(circle closest-side, #f59e0b 100%, #ffffff 0); }

/* «at» mueve el centro (con la misma sintaxis que background-position). Un
   punto blanco pequeño y un color que se oscurece imitan una esfera iluminada. */
.r-at {
  background-image: radial-gradient(circle at 30% 35%, #ffffff 0 4%, #60a5fa 25%, #1e3a8a 70%, #0f172a);
}
```
