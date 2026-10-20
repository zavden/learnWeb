---
example_description: "Las mismas cuatro alertas escritas de tres maneras (placeholder + @extend, mixin, clase base + custom properties generadas con @each) para comparar el CSS que genera cada una"
example_tags: "sass|integracion|extend|placeholders|mixins|custom-properties|each|rendimiento"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<h2>A · <code>%alert</code> + <code>@extend</code></h2>
<div class="a-info">Tu pedido sale mañana.</div>
<div class="a-danger">No pudimos cobrar la tarjeta.</div>

<h2>B · <code>@mixin alert</code></h2>
<div class="b-info">Tu pedido sale mañana.</div>
<div class="b-danger">No pudimos cobrar la tarjeta.</div>

<h2>C · <code>.alert</code> + custom properties</h2>
<div class="alert alert--info">Tu pedido sale mañana.</div>
<div class="alert alert--danger">No pudimos cobrar la tarjeta.</div>
```

# SCSS

```scss
@use "sass:color";

// Cuatro variantes; la página enseña dos de cada técnica.
$alerts: (
  info: #0369a1,
  success: #15803d,
  warning: #b45309,
  danger: #b91c1c,
);

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

h2 {
  margin: 16px 0 6px;
  font-size: 0.95rem;
}

// ── A) Placeholder + @extend ───────────────────────────────────────────────
%alert {
  max-width: 26rem;
  margin-bottom: 6px;
  padding: 10px 14px;
  border-left: 6px solid;
  border-radius: 4px;
}

@each $name, $color in $alerts {
  .a-#{$name} {
    @extend %alert;
    border-left-color: $color;
    background: color.scale($color, $lightness: 90%);
    color: color.scale($color, $lightness: -55%);
  }
}
// → 1 regla compartida con 4 selectores + 4 reglas de 3 declaraciones.

// ── B) Mixin ───────────────────────────────────────────────────────────────
@mixin alert($color) {
  max-width: 26rem;
  margin-bottom: 6px;
  padding: 10px 14px;
  border-left: 6px solid $color;
  border-radius: 4px;
  background: color.scale($color, $lightness: 90%);
  color: color.scale($color, $lightness: -55%);
}

@each $name, $color in $alerts {
  .b-#{$name} {
    @include alert($color);
  }
}
// → 4 reglas de 7 declaraciones: lo común, repetido 4 veces.

// ── C) Clase base + custom properties ─────────────────────────────────────
.alert {
  max-width: 26rem;
  margin-bottom: 6px;
  padding: 10px 14px;
  border-left: 6px solid var(--alert-color);
  border-radius: 4px;
  background: var(--alert-bg);
  color: var(--alert-ink);
}

@each $name, $color in $alerts {
  .alert--#{$name} {
    --alert-color: #{$color};
    --alert-bg: #{color.scale($color, $lightness: 90%)};
    --alert-ink: #{color.scale($color, $lightness: -55%)};
  }
}
// → 1 regla base + 4 reglas de 3 custom properties. En el HTML, dos clases.

// Tamaño del CSS de cada técnica por separado (medido con Dart Sass 1.98):
//   4 variantes:   A ≈ 0,7 KB   B ≈ 0,9 KB   C ≈ 0,8 KB
//   12 variantes:  A ≈ 1,9 KB   B ≈ 2,7 KB   C ≈ 2,0 KB
// A gana por poco, pero arrastra los problemas de @extend (lección 7). B crece
// más deprisa porque copia lo común en cada variante. C queda casi igual que A,
// cada variante es solo un cambio de DATOS y esos datos se pueden cambiar en el
// navegador (un tema puede redefinir --alert-color). Comprimido con gzip, como
// se sirve en producción, las diferencias se reducen todavía más.
```
