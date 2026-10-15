---
example_description: "aspect-ratio da a una caja una proporción fija (16/9, 1/1…) aunque no tenga contenido; si el contenido no cabe, la caja crece"
example_tags: "css|modelo-de-cajas|aspect-ratio|responsive"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="video">16 / 9 → reserva el hueco de un vídeo antes de que cargue</div>
<div class="row">
  <div class="square">1 / 1</div>
  <div class="square">1 / 1</div>
  <div class="square">1 / 1</div>
</div>
<div class="square overflow">1 / 1 con mucho texto: aspect-ratio es un mínimo, así que la caja crece en alto para que quepa todo este contenido sin desbordar, cosa que no pasaría con una height fija.</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* Con un solo lado definido (width), el otro se calcula con la proporción. */
.video {
  width: min(100%, 480px);
  aspect-ratio: 16 / 9;
  background: #1e293b;
  color: white;
  display: grid;            /* solo para centrar el texto: grid se estudia más adelante */
  place-items: center;
}

.row .square {
  display: inline-block;
  width: 120px;
  margin: 12px 8px 12px 0;
}

.square {
  aspect-ratio: 1 / 1;
  background: #bfdbfe;
  padding: 8px;
  font-size: 0.85rem;
}

.overflow {
  width: 140px;
}
```
