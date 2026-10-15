---
example_description: "Un generador de utilidades de espaciado con versiones responsive: mapas configurables con !default, un mixin que genera reglas, @each anidados, interpolación y @layer para ordenar la cascada"
example_tags: "sass|integracion|utilidades|each|mapas|default|mixins|layer"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<article class="card p-3 p-md-5">
  <h2 class="mt-0 mb-2">Huerto comunitario de Coyoacán</h2>
  <p class="mt-0 mb-3">Parcelas de 4 m² con riego compartido. Abierto de martes a domingo.</p>
  <div class="actions gap-2 gap-md-4">
    <a class="btn px-3 py-1" href="/huertos/coyoacan/reservar">Reservar parcela</a>
    <a class="btn btn--ghost px-3 py-1" href="/huertos/coyoacan">Ver horarios</a>
  </div>
</article>
<p class="note mt-3">Con la vista previa a más de 40rem (↗), el padding y el hueco entre botones crecen: actúan las clases <code>-md-</code>.</p>
```

# SCSS

```scss
@use "sass:map";

// ── Configuración (!default: quien use este archivo puede cambiarla antes) ──
$spacers: (0: 0, 1: 0.25rem, 2: 0.5rem, 3: 1rem, 4: 1.5rem, 5: 2rem) !default;

$spacing-properties: (
  mt: margin-block-start,
  mb: margin-block-end,
  p: padding,
  px: padding-inline,
  py: padding-block,
  gap: gap,
) !default;

$breakpoints: (md: 40rem) !default;

// ── Herramientas ────────────────────────────────────────────────────────────
@mixin from($name) {
  @if not map.has-key($breakpoints, $name) {
    @error "from(): no existe «#{$name}». Opciones: #{map.keys($breakpoints)}.";
  }
  @media (width >= map.get($breakpoints, $name)) {
    @content;
  }
}

// Un mixin que genera REGLAS completas (se incluye en la raíz o en una @media).
// $infix va entre el prefijo y la clave: «» → .p-3 ; «-md» → .p-md-3
@mixin spacing-utilities($infix: "") {
  @each $prefix, $property in $spacing-properties {
    @each $key, $value in $spacers {
      .#{$prefix}#{$infix}-#{$key} {
        #{$property}: $value;
      }
    }
  }
}

// ── Capas: las utilidades, al final, para que ganen a los componentes ────────
@layer base, components, utilities;

@layer base {
  body {
    font-family: system-ui, sans-serif;
    color: #1e293b;
  }
}

@layer components {
  .card {
    max-width: 30rem;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 2rem;          // ← lo sobrescriben p-3 / p-md-5 aunque tengan la misma especificidad
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
  }

  .btn {
    border: 2px solid #15803d;
    border-radius: 6px;
    background: #15803d;
    color: #ffffff;
    text-decoration: none;

    &--ghost {
      background: transparent;
      color: #14532d;
    }
  }

  .note {
    font-size: 0.875rem;
  }
}

@layer utilities {
  @include spacing-utilities;                  // 6 propiedades × 6 tamaños = 36 clases

  @each $name, $_ in $breakpoints {               // $_: el valor no se usa (como _ en Python)
    @include from($name) {
      @include spacing-utilities("-#{$name}");  // y otras 36 dentro de la @media
    }
  }
}

// compiled.css tiene 72 reglas de utilidad (más de 200 líneas) para 10 clases
// usadas en esta página. Así se controla el tamaño:
//   · recorta los mapas: $spacing-properties solo con lo que tu diseño usa;
//   · cada breakpoint nuevo DUPLICA el total (otro bloque de 36);
//   · en producción, herramientas como PurgeCSS eliminan las clases no usadas.
```
