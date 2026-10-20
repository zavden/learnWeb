---
example_description: "Un sistema de botones generado desde dos mapas: @each crea cada variante, sass:color deriva hover y anillo de foco, una función con @if elige el color del texto y las variantes solo fijan custom properties"
example_tags: "sass|integracion|botones|each|mapas|sass-color|custom-properties|accesibilidad"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<section class="demo" aria-labelledby="variants-title">
  <h2 id="variants-title">Variantes</h2>
  <div class="row">
    <button type="button" class="btn btn--primary">Guardar cambios</button>
    <button type="button" class="btn btn--success">Publicar receta</button>
    <button type="button" class="btn btn--danger">Eliminar pedido</button>
    <button type="button" class="btn btn--warning">Revisar stock</button>
    <button type="button" class="btn btn--neutral">Cancelar</button>
  </div>
</section>
<section class="demo" aria-labelledby="outline-title">
  <h2 id="outline-title">Contorno y tamaños</h2>
  <div class="row">
    <button type="button" class="btn btn--primary btn--outline btn--sm">Pequeño</button>
    <button type="button" class="btn btn--danger btn--outline">Mediano</button>
    <button type="button" class="btn btn--success btn--lg">Grande</button>
    <button type="button" class="btn btn--primary" disabled>Desactivado</button>
  </div>
</section>
<p class="hint">Pasa el ratón, pulsa y usa el tabulador: hover, active y foco salen del mismo color base.</p>
```

# SCSS

```scss
@use "sass:color";
@use "sass:map";
@use "sass:math";

// ── Configuración: añadir una variante es añadir una línea ─────────────
$button-variants: (
  primary: #1d4ed8,
  success: #15803d,
  danger: #b91c1c,
  warning: #f59e0b,
  neutral: #e2e8f0,
);

$button-sizes: (
  sm: (padding: 4px 10px, font-size: 0.8125rem),
  md: (padding: 8px 16px, font-size: 0.9375rem),
  lg: (padding: 12px 22px, font-size: 1.0625rem),
);

// Lección 6: texto oscuro sobre fondos claros, blanco sobre oscuros.
@function text-on($bg) {
  @if color.channel($bg, "lightness", $space: oklch) > 65% {
    @return #1e293b;
  }
  @return #ffffff;
}

// Lecciones 5 y 8: desde Dart Sass 1.79, los colores calculados conservan los
// decimales (rgb(25.52, 68.64, 190.08)). Redondear los canales deja un CSS más
// corto y legible, y el color es el mismo a simple vista.
@function tidy($color) {
  @return rgb(
    math.round(color.channel($color, "red", $space: rgb)),
    math.round(color.channel($color, "green", $space: rgb)),
    math.round(color.channel($color, "blue", $space: rgb))
  );
}

// Lección 4: un mixin para lo que se repite en cada tamaño.
@mixin button-size($name) {
  $size: map.get($button-sizes, $name);
  padding: map.get($size, padding);
  font-size: map.get($size, font-size);
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.demo h2 {
  font-size: 1rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

// ── El componente: TODAS las declaraciones, una sola vez ──────────────
.btn {
  @include button-size(md);
  border: 2px solid transparent;
  border-radius: 6px;
  background: var(--btn-bg);
  color: var(--btn-fg);
  font: inherit;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: var(--btn-bg-hover);
  }

  &:active {
    background: var(--btn-bg-active);
  }

  &:focus-visible {
    outline: 3px solid var(--btn-ring);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &--outline {
    border-color: currentColor;
    background: #ffffff;
    color: var(--btn-ink);

    &:hover {
      background: var(--btn-tint);
    }
  }

  &--sm {
    @include button-size(sm);
  }

  &--lg {
    @include button-size(lg);
  }
}

// ── Las variantes: solo DATOS, calculados al compilar (lección 5) ──────
// Lección 2: cada valor de Sass pasa a una custom property con #{}.
@each $name, $bg in $button-variants {
  .btn--#{$name} {
    --btn-bg: #{$bg};
    --btn-bg-hover: #{tidy(color.scale($bg, $lightness: -12%))};
    --btn-bg-active: #{tidy(color.scale($bg, $lightness: -18%))};
    --btn-fg: #{text-on($bg)};
    --btn-ring: #{tidy(color.scale($bg, $lightness: -35%))};
    --btn-ink: #{tidy(color.scale($bg, $lightness: -55%))};    // texto del contorno: ≥ 4.5:1 sobre blanco
    --btn-tint: #{tidy(color.scale($bg, $lightness: 88%))};
  }
}

// Resultado en compiled.css: UNA regla .btn con todo el componente y cinco
// reglas pequeñas de 7 custom properties. Con un mixin por variante, cada una
// repetiría las 10 declaraciones del botón (lección de mixins).
```
