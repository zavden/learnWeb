---
example_description: "Tokens de movimiento: duraciones y curvas en mapas publicados como custom properties, @keyframes generados desde un mapa, un mixin de transición y movimiento reducido resuelto en un solo sitio"
example_tags: "sass|profesional|animaciones|transiciones|keyframes|mapas|each|prefers-reduced-motion|accesibilidad"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="page">
  <h1>Tu huerto esta semana</h1>

  <p class="toast" role="status">Riego programado para mañana a las 7:00.</p>

  <section class="cards" aria-label="Resumen">
    <a class="card" href="/huerto/riego">
      <h2>Riego</h2>
      <p>3 sectores · 20 minutos cada uno</p>
    </a>
    <a class="card" href="/huerto/cosecha">
      <h2>Cosecha</h2>
      <p>Rábanos listos el jueves</p>
    </a>
    <div class="card" aria-busy="true">
      <span class="visually-hidden">Cargando el pronóstico del tiempo…</span>
      <span class="skeleton skeleton--title" aria-hidden="true"></span>
      <span class="skeleton" aria-hidden="true"></span>
      <span class="skeleton skeleton--short" aria-hidden="true"></span>
    </div>
  </section>

  <details class="faq">
    <summary>¿Por qué se mueve menos con «reducir movimiento»?</summary>
    <p>Si tu sistema pide menos movimiento, todas las duraciones de esta página pasan a casi cero desde un único sitio del CSS: los tokens.</p>
  </details>
</main>
```

# SCSS

```scss
// ─────────────────────────────────────────────────────────────────────────────
// Tokens de movimiento
// - Duraciones y curvas en mapas, publicadas como custom properties
//   (--duration-base, --ease-enter…). Ningún componente escribe «200ms».
// - Movimiento reducido en UN sitio: con prefers-reduced-motion: reduce,
//   todas las duraciones pasan a 1ms. Las transiciones siguen ocurriendo (y
//   disparando sus eventos), pero sin movimiento visible. Las animaciones
//   infinitas, además, se detienen.
// - @keyframes generados desde un mapa: cada animación es un mapa de pasos
//   (from/to) y cada paso, un mapa de propiedades.
// - El mixin transition() solo acepta tokens existentes: una errata en el
//   nombre detiene la compilación con un mensaje claro.
// ─────────────────────────────────────────────────────────────────────────────
@use "sass:map";

// ── Configuración ────────────────────────────────────────────────────────────
$durations: (
  fast: 120ms,
  base: 200ms,
  slow: 400ms,
  shimmer: 1.4s,
) !default;

$easings: (
  standard: cubic-bezier(0.2, 0, 0, 1),
  enter: cubic-bezier(0, 0, 0.2, 1),
  exit: cubic-bezier(0.4, 0, 1, 1),
) !default;

$keyframes: (
  slide-up: (
    from: (opacity: 0, translate: 0 0.75rem),
    to: (opacity: 1, translate: 0 0),
  ),
  shimmer: (
    from: (background-position: 100% 0),
    to: (background-position: 0 0),
  ),
) !default;

// ── Herramientas ─────────────────────────────────────────────────────────────
@function duration($name) {
  @if not map.has-key($durations, $name) {
    @error "duration(): no existe «#{$name}». Opciones: #{map.keys($durations)}.";
  }
  @return var(--duration-#{$name});
}

@function ease($name) {
  @if not map.has-key($easings, $name) {
    @error "ease(): no existe «#{$name}». Opciones: #{map.keys($easings)}.";
  }
  @return var(--ease-#{$name});
}

// transition(transform box-shadow, fast, standard)
@mixin transition($properties, $duration: base, $easing: standard) {
  transition-property: $properties;
  transition-duration: duration($duration);
  transition-timing-function: ease($easing);
}

// ── Tokens ───────────────────────────────────────────────────────────────────
:root {
  @each $name, $value in $durations {
    --duration-#{$name}: #{$value};
  }

  @each $name, $value in $easings {
    --ease-#{$name}: #{$value};
  }

  @media (prefers-reduced-motion: reduce) {
    @each $name, $_ in $durations {
      --duration-#{$name}: 1ms;
    }
  }
}

// ── Keyframes generados ──────────────────────────────────────────────────────
@each $name, $steps in $keyframes {
  @keyframes #{$name} {
    @each $step, $declarations in $steps {
      #{$step} {
        @each $property, $value in $declarations {
          #{$property}: $value;
        }
      }
    }
  }
}

// ── Página ───────────────────────────────────────────────────────────────────
body {
  margin: 0;
  background: #f8fafc;
  color: #1e293b;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.page {
  display: grid;
  gap: 1.25rem;
  max-width: 48rem;
  margin-inline: auto;
  padding: 2rem 1rem;

  h1 {
    margin: 0;
  }
}

.toast {
  justify-self: start;
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: #1e293b;
  color: #f1f5f9;
  animation: slide-up duration(slow) ease(enter) both;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: 1rem;
}

.card {
  display: grid;
  gap: 0.5rem;
  align-content: start;
  padding: 1rem 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  color: inherit;
  text-decoration: none;
  @include transition(translate box-shadow, fast);

  h2,
  p {
    margin: 0;
  }

  h2 {
    font-size: 1.1rem;
  }

  p {
    color: #475569;
  }

  &:is(a):hover,
  &:is(a):focus-visible {
    translate: 0 -3px;
    box-shadow: 0 10px 24px rgb(15 23 42 / 0.12);
  }

  &:focus-visible {
    outline: 3px solid #15803d;
    outline-offset: 2px;
  }
}

.skeleton {
  display: block;
  height: 0.875rem;
  border-radius: 4px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%) 0 0 / 300% 100%;
  animation: shimmer duration(shimmer) linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;      // nada de movimiento infinito
  }

  &--title {
    width: 60%;
    height: 1.25rem;
  }

  &--short {
    width: 40%;
  }
}

.faq {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: #ffffff;

  summary {
    cursor: pointer;
    font-weight: 600;
  }

  p {
    margin: 0.5rem 0 0;
  }
}
```
