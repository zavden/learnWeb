---
example_description: "Unidades tipográficas: ch para limitar la longitud de línea, lh para medir en líneas de texto y ex para la altura de la x"
example_tags: "css|unidades|ch|lh|ex"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p class="measure">max-width: 45ch → el párrafo no pasa de unos 45 caracteres por línea, una longitud cómoda de leer. Ensancha la vista previa todo lo que quieras: el texto no se estirará más.</p>
<div class="three-lines">height: 3lh → la caja amarilla mide exactamente tres líneas de alto. Lo que no cabe se sale por debajo del fondo, para que veas dónde termina.</div>
<p class="after">Y esto es una caja de 1ex × 1ex <span class="x-box"></span> junto a una «x»: la altura de la x de la fuente.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* ch = el ancho del carácter «0» de la fuente actual. 45ch ≈ 45 caracteres. */
.measure {
  max-width: 45ch;
  background: #e0f2fe;
}

/* lh = el line-height del propio elemento. 3lh = tres líneas, sea cual sea la fuente. */
.three-lines {
  line-height: 1.5;
  height: 3lh;
  max-width: 32ch;
  background: #fde68a;
}

.after {
  margin-top: 3rem;           /* deja sitio para el texto que se sale de la caja amarilla */
}

/* ex = la altura de la letra «x» minúscula de la fuente actual.
   (display: inline-block deja dar tamaño a una caja dentro de una línea: módulo del modelo de cajas.) */
.x-box {
  display: inline-block;
  width: 1ex;
  height: 1ex;
  background: tomato;
}
```
