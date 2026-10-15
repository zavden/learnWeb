---
example_description: "Un mixin de breakpoints con @content: @include from($bp-md) { … } escribe la media query sin repetir la condición en cada componente"
example_tags: "sass|mixins|content|media-queries|responsive"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<ul class="gallery">
  <li>Tomate rosa</li>
  <li>Pimiento italiano</li>
  <li>Berenjena listada</li>
  <li>Calabacín redondo</li>
  <li>Judía verde</li>
  <li>Pepino holandés</li>
</ul>
<p class="hint">Abre la vista previa en una pestaña (↗) y cambia el ancho: 1, 2 y 3 columnas.</p>
```

# SCSS

```scss
// Los breakpoints del proyecto, definidos UNA vez.
$bp-md: 30rem;
$bp-lg: 48rem;

// «Desde este ancho en adelante» (mobile-first).
@mixin from($min) {
  @media (width >= $min) {
    @content;
  }
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.gallery {
  display: grid;
  gap: 8px;
  padding: 0;
  list-style: none;

  @include from($bp-md) {          // → @media (width >= 30rem) { .gallery { … } }
    grid-template-columns: repeat(2, 1fr);
  }

  @include from($bp-lg) {          // → @media (width >= 48rem) { .gallery { … } }
    grid-template-columns: repeat(3, 1fr);
  }

  li {
    padding: 16px;
    border-radius: 8px;
    background: #dcfce7;
    color: #14532d;
  }
}

.hint {
  font-size: 0.875rem;

  @include from($bp-lg) {
    font-size: 1rem;
  }
}

// Si mañana el breakpoint grande pasa a 60rem, se cambia en UN sitio.
```
