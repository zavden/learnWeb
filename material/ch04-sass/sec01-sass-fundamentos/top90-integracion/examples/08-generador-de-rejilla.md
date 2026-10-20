---
example_description: "Una rejilla de 12 columnas con clases responsive (.span-6, .span-md-4, .span-lg-3) generadas con @for, un mixin con @content y un mapa de breakpoints configurable"
example_tags: "sass|integracion|grid|for|each|mixins|breakpoints|utilidades"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<main class="grid">
  <section class="tile span-12 span-md-6 span-lg-3"><h2>Pedidos hoy</h2><p class="figure">48</p></section>
  <section class="tile span-12 span-md-6 span-lg-3"><h2>Ingresos</h2><p class="figure">23 410 MXN</p></section>
  <section class="tile span-12 span-md-6 span-lg-3"><h2>Clientes nuevos</h2><p class="figure">12</p></section>
  <section class="tile span-12 span-md-6 span-lg-3"><h2>Devoluciones</h2><p class="figure">1</p></section>
  <section class="tile span-12 span-lg-8"><h2>Ventas de la semana</h2><p>Lunes 31 · Martes 27 · Miércoles 40 · Jueves 35 · Viernes 52</p></section>
  <section class="tile span-12 span-lg-4"><h2>Más vendido</h2><p>Kit de goteo para 20 macetas</p></section>
</main>
<p class="hint">Cambia el ancho de la vista previa (↗): una columna, luego dos por fila y luego el panel completo. El número de clases generadas está en <code>sass-output.txt</code>.</p>
```

# SCSS

```scss
@use "sass:list";
@use "sass:map";

// ── Configuración ──────────────────────────────────────────────────────────
$grid-columns: 12 !default;
$grid-gap: 1rem !default;
$breakpoints: (md: 40rem, lg: 64rem) !default;

@mixin up($name) {
  @if not map.has-key($breakpoints, $name) {
    @error "up(): no existe «#{$name}». Opciones: #{map.keys($breakpoints)}.";
  }
  @media (width >= map.get($breakpoints, $name)) {
    @content;
  }
}

// Genera .span-1 … .span-12 (o .span-md-1 … con un infijo).
// through: queremos del 1 al 12, ambos incluidos (lección 6).
@mixin span-classes($infix: "") {
  @for $i from 1 through $grid-columns {
    .span#{$infix}-#{$i} {
      grid-column: span $i;
    }
  }
}

// ── La rejilla ─────────────────────────────────────────────────────────────
.grid {
  display: grid;
  // minmax(0, 1fr): las columnas pueden encoger aunque el contenido sea ancho.
  grid-template-columns: repeat($grid-columns, minmax(0, 1fr));
  gap: $grid-gap;
}

@include span-classes;

@each $name, $_ in $breakpoints {
  @include up($name) {
    @include span-classes("-#{$name}");
  }
}

// No existe map.length: un mapa también es una lista de pares, y list.length
// cuenta cuántos tiene.
@debug "#{$grid-columns * (1 + list.length($breakpoints))} clases .span-*";

// ── Aspecto del panel ──────────────────────────────────────────────────────
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.tile {
  padding: 12px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;

  h2 {
    margin: 0;
    color: #475569;
    font-size: 0.875rem;
  }

  p {
    margin: 4px 0 0;
  }
}

.figure {
  font-size: 1.75rem;
  font-weight: bold;
}

// El orden importa: las clases -lg- van DESPUÉS de las -md- en el CSS, así que
// en pantallas anchas ganan (misma especificidad, aparecen más tarde). El orden
// del mapa $breakpoints decide el orden de los bloques @media.
```
