---
example_description: "min-content, max-content y fit-content: tamaños calculados a partir del contenido, sin escribir píxeles"
example_tags: "css|modelo-de-cajas|min-content|max-content|fit-content"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<div class="container">
  <p class="min">width: min-content → tan estrecho como la palabra más larga</p>
  <p class="max">width: max-content → todo en una línea, aunque se salga del contenedor</p>
  <p class="fit">width: fit-content → como max-content, pero sin pasar del ancho disponible</p>
  <p class="fit short">fit-content con poco texto</p>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.container {
  width: 360px;
  border: 2px dashed #94a3b8;
  padding: 8px;
}

p {
  background: #bfdbfe;
  padding: 6px 10px;
  margin: 0 0 10px;
}

/* Tamaños INTRÍNSECOS: se calculan a partir del contenido, no del contenedor. */
.min { width: min-content; }   /* el texto se corta en todos los sitios posibles */
.max { width: max-content; }   /* el texto no se corta nunca */
.fit { width: fit-content; }   /* = min(max-content, max(min-content, ancho disponible)) */

/* fit-content es lo que hace un inline-block con width: auto, pero en una caja de bloque:
   ideal para etiquetas, botones o títulos con fondo que deben ajustarse a su texto. */
```
