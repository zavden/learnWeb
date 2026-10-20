---
example_description: "La colocación automática nunca vuelve atrás: una foto ancha que no cabe al final de una fila salta a la siguiente y deja un hueco; grid-auto-flow: dense rellena los huecos con las fotos que vienen después"
example_tags: "css|grid|grid-auto-flow|dense|span|colocacion-automatica|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">❌ Las fotos 4, 6 y 9 (en ámbar) abarcan 2 o 3 columnas. Cuando no caben al final de una fila, saltan a la siguiente y dejan un hueco</p>
<ul class="gallery">
  <li>1 · Bosque</li>
  <li>2 · Río</li>
  <li>3 · Volcán</li>
  <li class="wide">4 · Panorámica del valle</li>
  <li>5 · Cascada</li>
  <li class="wider">6 · Atardecer en la costa</li>
  <li>7 · Faro</li>
  <li>8 · Dunas</li>
  <li class="wide">9 · Vista del lago</li>
  <li>10 · Cañón</li>
</ul>

<p class="caption">✅ <code>grid-auto-flow: dense</code>: cada foto busca el primer hueco desde el principio. Sin huecos… y fuera de orden (mira los números)</p>
<ul class="gallery is-dense">
  <li>1 · Bosque</li>
  <li>2 · Río</li>
  <li>3 · Volcán</li>
  <li class="wide">4 · Panorámica del valle</li>
  <li>5 · Cascada</li>
  <li class="wider">6 · Atardecer en la costa</li>
  <li>7 · Faro</li>
  <li>8 · Dunas</li>
  <li class="wide">9 · Vista del lago</li>
  <li>10 · Cañón</li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 8px 0 4px;
  font-size: 0.75rem;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  width: 400px;
  margin: 0;
  padding: 0;
  outline: 2px dashed #0f766e;
  background: url(hatch.svg);
  list-style: none;
  font-size: 0.75rem;
}

.gallery li {
  padding: 8px 6px;
  border: 1px solid #0f766e;
  background: #ccfbf1;
}

.gallery .wide,
.gallery .wider {
  border-color: #b45309;
  background: #fef3c7;
}

.wide {
  grid-column: span 2;
}

.wider {
  grid-column: span 3;
}

/* 🐛 El algoritmo automático (grid-auto-flow: row, el valor por defecto) recorre
   las celdas con un CURSOR que solo avanza. Tras 1, 2 y 3, la foto 4 necesita dos
   columnas y solo queda una en la fila 1: salta a la fila 2 y la celda libre de la
   fila 1 se queda vacía para siempre, aunque la foto 5 cabría en ella. Lo mismo
   pasa con la 6 al final de la fila 2. Resultado: dos huecos rayados. */

/* ✅ dense: para cada elemento, el cursor vuelve al principio y busca el PRIMER
   hueco donde quepa. La 5 sube al hueco de la fila 1, la 7 y la 8 al de la fila 2…
   Ya no hay huecos, pero el orden visual ya no es el del HTML: 1, 2, 3, 5, 4, 7… */
.is-dense {
  grid-auto-flow: dense;
}
```
