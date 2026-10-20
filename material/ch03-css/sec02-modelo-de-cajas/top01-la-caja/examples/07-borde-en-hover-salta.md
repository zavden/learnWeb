---
example_description: "Engordar el borde en :hover agranda la caja y empuja a las vecinas; outline se dibuja por fuera sin ocupar sitio"
example_tags: "css|modelo-de-cajas|outline|border|hover"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p>Pasa el ratón por los botones de cada fila (o recórrelos con <kbd>Tab</kbd>). ¿Cuál se mueve?</p>
<p class="label">❌ border de 1px → 4px en <code>:hover</code></p>
<div class="row">
  <button class="chip chip-border" type="button">Todas</button>
  <button class="chip chip-border" type="button">Recetas</button>
  <button class="chip chip-border" type="button">Viajes</button>
  <button class="chip chip-border" type="button">Ciencia</button>
</div>
<p class="label">✅ outline de 3px en <code>:hover</code></p>
<div class="row">
  <button class="chip chip-outline" type="button">Todas</button>
  <button class="chip chip-outline" type="button">Recetas</button>
  <button class="chip chip-outline" type="button">Viajes</button>
  <button class="chip chip-outline" type="button">Ciencia</button>
</div>
<p class="after">Este párrafo también salta con la primera fila.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.label {
  font-size: 0.85rem;
  margin-bottom: 6px;
}

.chip {
  font: inherit;
  padding: 6px 14px;
  border: 1px solid #64748b;
  border-radius: 999px;
  background: #f8fafc;
}

/* 🐛 El borde forma parte de la caja: pasar de 1px a 4px la hace 6px más ancha
   y 6px más alta. Las vecinas se desplazan y la línea entera crece. */
.chip-border:hover,
.chip-border:focus-visible {
  border: 4px solid #2563eb;
}

/* ✅ outline se dibuja POR FUERA del borde y no ocupa sitio: nada se mueve.
   outline-offset separa la línea de la caja (también admite valores negativos). */
.chip-outline:hover,
.chip-outline:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 2px;
}

/* Otra solución con border: reservar el sitio desde el principio
   (border: 4px solid transparent) y cambiar solo el color. */
```
