---
example_description: "Las cajas de bloque se apilan y ocupan toda la fila; las cajas en línea fluyen con el texto y se parten entre líneas"
example_tags: "css|display|block|inline"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<div class="column">
  <h3 class="block">h3 · bloque: empieza en una línea nueva y ocupa todo el ancho</h3>
  <p class="block">p · bloque. Dentro, el texto fluye y lleva elementos en línea:
    <span class="inline">este span es una caja en línea que, como es largo, se parte al llegar al final de la línea y continúa en la siguiente</span>,
    y aquí sigue el párrafo, con <a class="inline" href="#">un enlace</a> y <strong class="inline">un strong</strong>.</p>
  <div class="block">div · otro bloque, debajo del anterior</div>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.column {
  max-width: 420px;
}

/* Bloque (azul): cada uno en su propia línea, a todo el ancho del contenedor,
   aunque su texto sea corto. */
.block {
  background: #dbeafe;
  outline: 2px solid #2563eb;
}

/* En línea (naranja): ocupan solo lo que su texto y se colocan uno tras otro dentro
   de la línea. El span largo se parte en DOS fragmentos: fíjate en que el borde
   se abre al final de la primera línea y se cierra en la segunda. Una caja en línea
   no es necesariamente un rectángulo. */
.inline {
  background: #fed7aa;
  border: 2px solid #c2410c;
}
```
