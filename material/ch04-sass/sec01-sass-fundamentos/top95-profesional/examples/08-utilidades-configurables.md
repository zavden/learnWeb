---
example_description: "Una librería de utilidades configurable como las de los frameworks: un mapa describe cada utilidad (propiedad, nombre, valores, si es responsive), las opciones van con !default, el prefijo evita choques y @debug cuenta las clases generadas"
example_tags: "sass|profesional|utilidades|mapas|default|each|meta|breakpoints|layer"
example_stage: professional
example_importance: critical
---

# HTML

```html
<main class="u-p-4 u-p-md-6">
  <section class="u-d-flex u-flex-col u-flex-md-row u-gap-4 u-items-md-center u-p-4 u-p-md-6 u-bg-surface u-rounded">
    <div class="u-grow">
      <p class="u-m-0 u-text-sm u-fw-bold u-text-accent">Temporada de otoño</p>
      <h1 class="u-mt-2 u-mb-2">Kits de huerto con un 20 % de descuento</h1>
      <p class="u-m-0 u-text-muted">Hasta el 31 de octubre o fin de existencias. Envío gratis en la zona metropolitana.</p>
    </div>
    <a class="promo__button u-d-block u-px-6 u-py-2 u-rounded u-fw-bold u-text-center" href="/tienda/kits">Ver los kits</a>
  </section>

  <ul class="u-d-grid u-gap-3 u-p-0 u-mt-4 features">
    <li class="u-p-4 u-bg-surface u-rounded"><strong>Semillas de temporada</strong><br><span class="u-text-muted u-text-sm">Variedades que germinan con el fresco.</span></li>
    <li class="u-p-4 u-bg-surface u-rounded"><strong>Asesoría por chat</strong><br><span class="u-text-muted u-text-sm">Un agrónomo responde en menos de un día.</span></li>
    <li class="u-p-4 u-bg-surface u-rounded"><strong>Devolución en 30 días</strong><br><span class="u-text-muted u-text-sm">Si algo no te convence, lo recogemos.</span></li>
  </ul>
</main>
```

# SCSS

```scss
// ─────────────────────────────────────────────────────────────────────────────
// Librería de utilidades configurable
// - Todo lo configurable va arriba con !default. Quien la use la ajusta al
//   cargarla: @use "utilities" with ($utility-prefix: "", $breakpoints: (…)).
// - $utilities describe CADA utilidad con un mapa (la «API» de utilidades de
//   Bootstrap, en pequeño): propiedad, nombre corto, valores (lista o mapa) y
//   si tiene versiones responsive. Añadir una utilidad no exige tocar código.
// - Control del tamaño: solo las utilidades con responsive: true se repiten
//   en cada breakpoint, y $enabled permite apagar grupos enteros. @debug dice
//   cuántas clases salen.
// - Prefijo «u-» para no chocar con las clases de componentes (.flex, .grid…).
// - Todo en @layer utilities: ganan a los componentes sin !important.
// ─────────────────────────────────────────────────────────────────────────────
@use "sass:list";
@use "sass:map";
@use "sass:meta";

// ── Configuración ────────────────────────────────────────────────────────────
$utility-prefix: "u-" !default;
$breakpoints: (md: 40rem) !default;
$space: (0: 0, 2: 0.5rem, 3: 0.75rem, 4: 1rem, 6: 1.5rem) !default;

$colors: (
  accent: #9a3412,
  muted: #57534e,
  surface: #fff7ed,
) !default;

$utilities: (
  display: (property: display, class: d, values: (block, flex, grid, none), responsive: true),
  flex-direction: (property: flex-direction, class: flex, values: (row: row, col: column), responsive: true),
  align-items: (property: align-items, class: items, values: (start: flex-start, center: center), responsive: true),
  flex-grow: (property: flex-grow, class: grow, values: ("": 1)),
  gap: (property: gap, class: gap, values: $space),
  margin: (property: margin, class: m, values: $space),
  margin-top: (property: margin-top, class: mt, values: $space),
  margin-bottom: (property: margin-bottom, class: mb, values: $space),
  padding: (property: padding, class: p, values: $space, responsive: true),
  padding-inline: (property: padding-inline, class: px, values: $space),
  padding-block: (property: padding-block, class: py, values: $space),
  font-size: (property: font-size, class: text, values: (sm: 0.875rem)),
  font-weight: (property: font-weight, class: fw, values: (bold: 700)),
  text-align: (property: text-align, class: text, values: (center: center)),
  color: (property: color, class: text, values: (accent: var(--color-accent), muted: var(--color-muted))),
  background: (property: background, class: bg, values: (surface: var(--color-surface))),
  radius: (property: border-radius, class: rounded, values: ("": 12px)),
) !default;

$enabled: map.keys($utilities) !default;   // quita nombres para no generarlos

// ── Generador ────────────────────────────────────────────────────────────────
$generated: 0;   // contador para el @debug final; los mixins lo suben con !global

// Una clase: .u-{class}{-bp}{-valor}. Un valor con clave "" da .u-{class}.
@mixin utility-class($config, $key, $value, $infix) {
  $suffix: if(sass($key == ""): ""; else: "-#{$key}");
  .#{$utility-prefix}#{map.get($config, class)}#{$infix}#{$suffix} {
    #{map.get($config, property)}: $value;
  }
  $generated: $generated + 1 !global;
}

@mixin utility($config, $infix: "") {
  $values: map.get($config, values);
  @if meta.type-of($values) == map {
    @each $key, $value in $values {
      @include utility-class($config, $key, $value, $infix);
    }
  } @else {
    // Una lista: el valor es también el nombre (.u-d-flex → display: flex).
    @each $value in $values {
      @include utility-class($config, $value, $value, $infix);
    }
  }
}

@layer base, components, utilities;

@layer utilities {
  @each $name, $config in $utilities {
    @if list.index($enabled, $name) {
      @include utility($config);
    }
  }

  @each $bp, $min in $breakpoints {
    @media (width >= $min) {
      @each $name, $config in $utilities {
        @if list.index($enabled, $name) and map.get($config, responsive) {
          @include utility($config, "-#{$bp}");
        }
      }
    }
  }
}

@debug "#{$generated} clases de utilidad generadas";

// ── Lo que NO es utilidad: tokens, base y un componente ──────────────────────
:root {
  @each $name, $value in $colors {
    --color-#{$name}: #{$value};
  }
}

@layer base {
  body {
    margin: 0;
    background: #ffffff;
    color: #1c1917;
    font-family: system-ui, sans-serif;
    line-height: 1.5;
  }

  h1 {
    font-size: clamp(1.5rem, 1.1rem + 2vw, 2.25rem);
    line-height: 1.15;
  }
}

@layer components {
  .promo__button {
    background: var(--color-accent);
    color: #ffffff;
    text-decoration: none;

    &:hover {
      background: #7c2d12;
    }

    &:focus-visible {
      outline: 3px solid var(--color-accent);
      outline-offset: 2px;
    }
  }

  .features {
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
    list-style: none;
  }
}
```
