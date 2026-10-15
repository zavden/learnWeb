---
example_description: "Una imagen dentro de una caja deja un hueco de unos píxeles debajo: es una caja inline alineada a la línea base del texto"
example_tags: "html|imagenes|baseline|inline|bug"
example_stage: common-error
example_importance: useful
---

# HTML

```html
<div class="frame">
  <img src="badge-1x.svg" alt="Insignia" width="120" height="120">
</div>
<p class="label">❌ Hay un hueco amarillo entre la imagen y el borde inferior.</p>

<div class="frame">
  <img class="block" src="badge-1x.svg" alt="Insignia" width="120" height="120">
</div>
<p class="label">✅ Con display: block la imagen ya no vive en una línea de texto.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* 🐛 <img> es un elemento INLINE: se coloca sobre la línea base (baseline) de una línea de
   texto, como si fuera una letra. Debajo de la línea base queda el espacio reservado para
   los «descendentes» de letras como g, j, p o y: ese es el hueco.
   Las líneas de texto y vertical-align se estudian a fondo en el capítulo de CSS. */
.frame {
  width: max-content;
  border: 3px solid #1d4ed8;
  background: #fde68a;         /* amarillo: lo que asoma es el espacio de los descendentes */
}

/* Soluciones: display: block, o vertical-align: middle/bottom en la imagen. */
.block {
  display: block;
}

.label {
  margin-top: 4px;
}
```
