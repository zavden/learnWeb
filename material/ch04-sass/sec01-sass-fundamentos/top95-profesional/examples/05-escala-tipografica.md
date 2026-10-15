---
example_description: "Un sistema tipográfico: escala modular fluida calculada con math.pow y clamp(), pilas de fuentes en un mapa, títulos asignados a pasos con @each y estilos de texto largo (.prose) con ritmo vertical, listas, citas y código"
example_tags: "sass|profesional|tipografia|escala|clamp|sass-math|mapas|each|prose"
example_stage: professional
example_importance: critical
---

# HTML

```html
<main class="page">
  <article class="prose">
    <p class="eyebrow">Guía práctica · 8 minutos de lectura</p>
    <h1>Cómo hacer composta en un departamento</h1>
    <p class="lead">No necesitas jardín: con una caja de 40 litros y un poco de constancia, los restos de la cocina se convierten en tierra fértil en tres meses.</p>

    <h2>Lo que necesitas</h2>
    <ul>
      <li>Una caja con tapa y agujeros de ventilación.</li>
      <li>Material seco: cartón sin tinta, hojas secas o aserrín.</li>
      <li>Restos de fruta y verdura, posos de café y cáscaras de huevo trituradas.</li>
    </ul>

    <h2>Paso a paso</h2>
    <ol>
      <li>Pon una capa de 5&nbsp;cm de material seco en el fondo.</li>
      <li>Añade los restos de cocina troceados y cúbrelos siempre con material seco.</li>
      <li>Remueve una vez por semana para que entre aire.</li>
    </ol>

    <h3>¿Y si huele mal?</h3>
    <p>Casi siempre es exceso de humedad. Añade material seco y remueve: en dos días el olor desaparece. La regla práctica es <strong>dos partes de seco por una de húmedo</strong>.</p>

    <blockquote>
      <p>«Empecé con una caja de zapatos en el balcón y ahora abono todas mis macetas con mi propia composta.»</p>
      <footer>— Mariana, alumna del taller de octubre</footer>
    </blockquote>

    <h3>Cuándo está lista</h3>
    <p>Cuando huele a bosque y ya no reconoces los restos. Tamízala y guarda los trozos grandes para la siguiente tanda. Si usas un termómetro, apunta la lectura con <code>temp_c</code> en tu cuaderno de huerto.</p>

    <p class="note">¿Dudas? Escríbenos a <a href="mailto:talleres@lahuerta.mx">talleres@lahuerta.mx</a>.</p>
  </article>
</main>
```

# SCSS

```scss
// ─────────────────────────────────────────────────────────────────────────────
// Sistema tipográfico
// - Escala modular FLUIDA: cada paso es base × ratioⁿ, con un ratio en móvil
//   (1,2) y otro en pantallas anchas (1,25). fluid() devuelve un clamp() con
//   una recta entre los dos anchos de ventana; los números se redondean a 3
//   decimales para un CSS legible.
// - Los pasos se publican como custom properties (--step--1 … --step-5): los
//   componentes eligen un paso, no un tamaño.
// - Los títulos se asignan a pasos con un mapa y @each: cambiar la jerarquía
//   es cambiar una línea.
// - .prose: estilos para texto largo que no tocan nada fuera del artículo.
//   Ritmo vertical con --flow-space (más aire antes de los títulos) y medida de
//   lectura en ch.
// ─────────────────────────────────────────────────────────────────────────────
@use "sass:map";
@use "sass:math";
@use "sass:meta";

// ── Configuración ────────────────────────────────────────────────────────────
$fonts: (
  body: (system-ui, -apple-system, "Segoe UI", sans-serif),
  heading: (Georgia, "Times New Roman", serif),
  mono: (ui-monospace, "SF Mono", Menlo, monospace),
) !default;

$type-scale: (
  base-min: 1rem,
  base-max: 1.125rem,
  ratio-min: 1.2,
  ratio-max: 1.25,
  viewport-min: 20rem,
  viewport-max: 75rem,
) !default;

$first-step: -1 !default;
$last-step: 5 !default;

$heading-steps: (h1: 5, h2: 3, h3: 2) !default;

$measure: 65ch !default;

// ── Funciones ────────────────────────────────────────────────────────────────
@function round-to($value, $places: 3) {
  $factor: math.pow(10, $places);
  @return math.div(math.round($value * $factor), $factor);
}

@function fluid($min, $max) {
  $vw-min: map.get($type-scale, viewport-min);
  $vw-max: map.get($type-scale, viewport-max);
  $slope: math.div($max - $min, $vw-max - $vw-min);
  $intercept: $min - $slope * $vw-min;
  @return clamp(round-to($min), round-to($intercept) + round-to($slope * 100) * 1vw, round-to($max));
}

@function step-size($step, $edge) {
  @return map.get($type-scale, base-#{$edge}) * math.pow(map.get($type-scale, ratio-#{$edge}), $step);
}

@function font($name) {
  @if not map.has-key($fonts, $name) {
    @error "font(): no existe la pila «#{$name}». Opciones: #{map.keys($fonts)}.";
  }
  @return map.get($fonts, $name);
}

// ── Tokens ───────────────────────────────────────────────────────────────────
:root {
  @for $step from $first-step through $last-step {
    --step-#{$step}: #{fluid(step-size($step, min), step-size($step, max))};
  }

  // La interpolación QUITA las comillas («Segoe UI» → Segoe UI); meta.inspect
  // escribe el valor tal como está en Sass, con ellas.
  --font-body: #{meta.inspect(font(body))};
  --font-heading: #{meta.inspect(font(heading))};
  --font-mono: #{meta.inspect(font(mono))};
}

// ── Base ─────────────────────────────────────────────────────────────────────
body {
  margin: 0;
  background: #fffdf8;
  color: #292524;
  font-family: var(--font-body);
  font-size: var(--step-0);
  line-height: 1.6;
}

.page {
  padding: var(--step-2) var(--step-0);
}

// ── Texto largo ──────────────────────────────────────────────────────────────
.prose {
  max-width: $measure;
  margin-inline: auto;

  > * {
    margin-block: 0;
  }

  > * + * {
    margin-block-start: var(--flow-space, 1em);
  }

  // Más aire ANTES de un título que después: el título pertenece a lo que sigue.
  > :is(h2, h3) {
    --flow-space: 1.75em;
  }

  > :is(h2, h3) + * {
    --flow-space: 0.5em;
  }

  :is(h1, h2, h3) {
    font-family: var(--font-heading);
    line-height: 1.15;
    text-wrap: balance;
  }

  @each $heading, $step in $heading-steps {
    #{$heading} {
      font-size: var(--step-#{$step});
    }
  }

  p,
  li {
    text-wrap: pretty;
  }

  ul,
  ol {
    padding-inline-start: 1.25em;
  }

  li + li {
    margin-block-start: 0.35em;
  }

  ::marker {
    color: #a16207;
  }

  a {
    color: #9a3412;
    text-decoration-thickness: 0.08em;
    text-underline-offset: 0.18em;

    &:hover {
      text-decoration-thickness: 0.16em;
    }
  }

  code {
    padding: 0.1em 0.3em;
    border-radius: 4px;
    background: #f5efe2;
    font-family: var(--font-mono);
    font-size: 0.9em;
  }

  blockquote {
    padding: var(--step--1) var(--step-0);
    border-inline-start: 4px solid #a16207;
    background: #fbf3e4;
    font-family: var(--font-heading);
    font-size: var(--step-1);
    font-style: italic;

    p {
      margin: 0;
    }

    footer {
      margin-top: 0.5em;
      font-family: var(--font-body);
      font-size: var(--step--1);
      font-style: normal;
    }
  }
}

.eyebrow,
.note {
  color: #57534e;
  font-size: var(--step--1);
}

.eyebrow {
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.lead {
  font-size: var(--step-1);
  line-height: 1.45;
}
```
