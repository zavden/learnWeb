---
example_description: "Un sistema de layout: contenedor, primitivas stack, cluster, barra lateral y rejilla automática, una rejilla de 12 columnas con clases responsive generadas y mixins up/down/between validados con @error"
example_tags: "sass|profesional|layout|grid|flexbox|breakpoints|mixins|for|each"
example_stage: professional
example_importance: critical
---

# HTML

```html
<header class="site-header">
  <div class="container cluster cluster--between">
    <a class="logo" href="/">La Huerta</a>
    <nav aria-label="Principal">
      <ul class="cluster nav-list">
        <li><a href="/tienda">Tienda</a></li>
        <li><a href="/talleres">Talleres</a></li>
        <li><a href="/blog">Blog</a></li>
        <li><a href="/cuenta">Mi cuenta</a></li>
      </ul>
    </nav>
  </div>
</header>

<main class="container stack stack--lg">
  <section class="hero stack">
    <h1>Talleres de otoño</h1>
    <p>Aprende a compostar, a podar y a regar mejor en grupos pequeños, en Coyoacán y en línea.</p>
  </section>

  <div class="with-sidebar">
    <aside class="filters stack" aria-labelledby="filters-title">
      <h2 id="filters-title">Filtrar</h2>
      <label><input type="checkbox" checked> Presencial</label>
      <label><input type="checkbox" checked> En línea</label>
      <label><input type="checkbox"> Solo fines de semana</label>
    </aside>

    <ul class="auto-grid workshops">
      <li class="workshop stack stack--sm"><h3>Compostaje en casa</h3><p>Sábado 24 · 10:00 · 350 MXN</p></li>
      <li class="workshop stack stack--sm"><h3>Poda de frutales</h3><p>Domingo 25 · 9:00 · 420 MXN</p></li>
      <li class="workshop stack stack--sm"><h3>Riego por goteo</h3><p>Sábado 31 · 11:00 · 380 MXN</p></li>
      <li class="workshop stack stack--sm"><h3>Huerto en balcón</h3><p>En línea · a tu ritmo · 290 MXN</p></li>
    </ul>
  </div>
</main>

<footer class="site-footer">
  <div class="container grid">
    <p class="span-12 span-md-6 span-lg-4">La Huerta · Ciudad de México</p>
    <p class="span-12 span-md-6 span-lg-4">Lunes a sábado, de 9:00 a 18:00</p>
    <p class="span-12 span-lg-4">hola@lahuerta.mx</p>
  </div>
</footer>
```

# SCSS

```scss
// ─────────────────────────────────────────────────────────────────────────────
// Sistema de layout
// - Primitivas que no saben nada del contenido (al estilo de «Every Layout»):
//     .container     ancho máximo y márgenes laterales
//     .stack         columna con separación uniforme (gap)
//     .cluster       fila que se parte en líneas (menús, etiquetas, botones)
//     .with-sidebar  barra lateral que se apila sola, SIN media query
//     .auto-grid     tantas columnas como quepan, SIN media query
//   Casi todo el responsive sale de flex-wrap y auto-fit: las media queries
//   quedan para la rejilla de 12 columnas.
// - Breakpoints en un mapa; up/down/between validan el nombre con @error.
// - Rejilla de 12 columnas con clases .span-N y .span-{bp}-N generadas. Solo
//   se generan los breakpoints de $grid-breakpoints: cada uno añade 12 reglas.
// ─────────────────────────────────────────────────────────────────────────────
@use "sass:map";

// ── Configuración ────────────────────────────────────────────────────────────
$breakpoints: (sm: 30rem, md: 48rem, lg: 64rem) !default;
$grid-breakpoints: (md, lg) !default;   // para qué tamaños hay clases responsive
$grid-columns: 12 !default;
$container-max: 70rem !default;
$space: (sm: 0.5rem, md: 1rem, lg: 2rem) !default;

// ── Breakpoints ──────────────────────────────────────────────────────────────
@function breakpoint($name) {
  @if not map.has-key($breakpoints, $name) {
    @error "breakpoint(): no existe «#{$name}». Opciones: #{map.keys($breakpoints)}.";
  }
  @return map.get($breakpoints, $name);
}

@mixin up($name) {
  @media (width >= breakpoint($name)) {
    @content;
  }
}

@mixin down($name) {
  @media (width < breakpoint($name)) {
    @content;
  }
}

@mixin between($from, $to) {
  @media (breakpoint($from) <= width < breakpoint($to)) {
    @content;
  }
}

// ── Reset y base ─────────────────────────────────────────────────────────────
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1e293b;
  line-height: 1.5;
}

h1,
h2,
h3,
p,
ul {
  margin: 0;
}

a {
  color: #15803d;
}

// ── Primitivas ───────────────────────────────────────────────────────────────
.container {
  width: min(100% - 2 * map.get($space, md), $container-max);
  margin-inline: auto;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: var(--stack-gap, #{map.get($space, md)});

  @each $name, $value in $space {
    &--#{$name} {
      --stack-gap: #{$value};
    }
  }
}

.cluster {
  display: flex;
  flex-wrap: wrap;
  gap: map.get($space, sm) map.get($space, md);
  align-items: center;

  &--between {
    justify-content: space-between;
  }
}

// La barra lateral mide 14rem; el contenido crece «infinitamente» (999) pero
// nunca baja del 60 %: cuando no cabe, flex-wrap la pone encima.
.with-sidebar {
  display: flex;
  flex-wrap: wrap;
  gap: map.get($space, lg);

  > :first-child {
    flex: 1 1 14rem;
  }

  > :last-child {
    flex: 999 1 0;
    min-width: 60%;
  }
}

.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(var(--auto-grid-min, 12rem), 100%), 1fr));
  gap: map.get($space, md);
  padding: 0;
  list-style: none;
}

// ── Rejilla de 12 columnas ───────────────────────────────────────────────────
@mixin spans($infix: "") {
  @for $i from 1 through $grid-columns {
    .span#{$infix}-#{$i} {
      grid-column: span $i;
    }
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat($grid-columns, minmax(0, 1fr));
  gap: map.get($space, md);
}

@include spans;

@each $name in $grid-breakpoints {
  @include up($name) {
    @include spans("-#{$name}");
  }
}

// ── La página de demostración ────────────────────────────────────────────────
.site-header {
  padding-block: map.get($space, md);
  border-bottom: 1px solid #e2e8f0;

  // En móviles estrechos, logo y menú centrados en sus líneas.
  @include down(sm) {
    text-align: center;

    .cluster {
      justify-content: center;
    }
  }
}

.logo {
  color: #14532d;
  font-weight: 800;
  text-decoration: none;
}

.nav-list {
  padding: 0;
  list-style: none;
}

main.container {
  padding-block: map.get($space, lg);
}

.hero {
  h1 {
    font-size: clamp(1.75rem, 1.2rem + 2.5vw, 2.75rem);
    line-height: 1.1;
  }

  p {
    max-width: 40ch;

    // En tabletas, la entradilla algo más grande que el texto.
    @include between(sm, lg) {
      font-size: 1.125rem;
    }
  }
}

.filters {
  align-self: start;
  padding: map.get($space, md);
  border-radius: 8px;
  background: #f0fdf4;

  h2 {
    font-size: 1rem;
  }
}

.workshop {
  padding: map.get($space, md);
  border: 1px solid #cbd5e1;
  border-radius: 8px;

  h3 {
    font-size: 1.05rem;
  }

  p {
    color: #475569;
  }
}

.site-footer {
  margin-top: map.get($space, lg);
  padding-block: map.get($space, lg);
  background: #14532d;
  color: #f0fdf4;

  // En pantallas grandes, el pie se centra en cada columna.
  @include up(lg) {
    text-align: center;
  }
}
```
