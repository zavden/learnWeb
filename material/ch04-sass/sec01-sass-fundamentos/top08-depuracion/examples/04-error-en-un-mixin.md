---
example_description: "@error detiene la compilación con tu propio mensaje: el mixin de breakpoints rechaza from(xl) y explica qué nombres existen"
example_tags: "sass|depuracion|error|mixins|breakpoints|mapas"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<ul class="gallery">
  <li>Tomate rosa</li>
  <li>Pimiento italiano</li>
  <li>Berenjena listada</li>
</ul>
<p>❌ Sin estilos: el mixin detuvo la compilación. Lee su mensaje en <code>sass-output.txt</code>.</p>
```

# SCSS

```scss
@use "sass:map";

$breakpoints: (md: 30rem, lg: 48rem);

@mixin from($name) {
  // Sin esta comprobación, map.get devolvería null y la media query saldría
  // como «@media (width >= )»… sin ningún aviso. Mejor fallar pronto y claro.
  @if not map.has-key($breakpoints, $name) {
    @error "from(): no existe el breakpoint «#{$name}». Usa uno de estos: #{map.keys($breakpoints)}.";
  }

  @media (width >= map.get($breakpoints, $name)) {
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

  @include from(md) {
    grid-template-columns: repeat(2, 1fr);
  }

  // 🐛 «xl» no está en $breakpoints. El @error detiene TODO, como un raise
  // en Python: no se genera CSS y el mensaje explica qué pasa y cómo arreglarlo.
  @include from(xl) {
    grid-template-columns: repeat(4, 1fr);
  }

  li {
    padding: 16px;
    border-radius: 8px;
    background: #dcfce7;
  }
}

// ✅ Solución: @include from(lg), o añade xl al mapa: (md: 30rem, lg: 48rem, xl: 64rem).
```
