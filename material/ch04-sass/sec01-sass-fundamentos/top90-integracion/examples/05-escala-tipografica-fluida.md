---
example_description: "Una escala tipográfica fluida: math.pow calcula cada paso con dos ratios, una función devuelve clamp(), @for la publica como custom properties y @debug enseña los valores"
example_tags: "sass|integracion|tipografia|sass-math|clamp|for|funciones|custom-properties|debug"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<article class="post">
  <p class="post__kicker">Guía · Huerto en casa</p>
  <h1>Cómo empezar un huerto en tu azotea</h1>
  <p class="post__lead">Con cuatro cajones, buena tierra y seis horas de sol puedes cosechar desde el primer mes.</p>
  <h2>Elige el sitio</h2>
  <p>Busca la zona con más horas de sol directo y comprueba que el techo aguante el peso de la tierra mojada.</p>
  <h3>¿Y si no hay tanto sol?</h3>
  <p>Las hojas verdes, como lechugas y espinacas, se conforman con cuatro horas.</p>
  <p class="post__note">Escala: 1,2 en móvil y 1,333 en pantallas anchas. Los valores calculados están en <code>sass-output.txt</code>.</p>
</article>
```

# SCSS

```scss
@use "sass:math";

// ── Configuración ──────────────────────────────────────────────────────────
$base-min: 1rem;         // tamaño base con una ventana de 20rem
$base-max: 1.125rem;     // tamaño base con una ventana de 80rem
$ratio-min: 1.2;         // «tercera menor»: saltos suaves en móvil
$ratio-max: 1.333;       // «cuarta justa»: más contraste en pantallas anchas
$viewport-min: 20rem;
$viewport-max: 80rem;

// Redondea a 3 decimales: el CSS queda legible (lecciones 5 y 8).
@function round-to($value, $places: 3) {
  $factor: math.pow(10, $places);
  @return math.div(math.round($value * $factor), $factor);
}

// clamp() de mínimo a máximo, con una recta entre los dos anchos de ventana.
@function fluid($min, $max) {
  $slope: math.div($max - $min, $viewport-max - $viewport-min);
  $intercept: $min - $slope * $viewport-min;
  // Sass entiende clamp(): opera dentro y deja para el navegador lo que no
  // puede resolver (rem + vw), igual que con calc() (lección 1).
  @return clamp(round-to($min), round-to($intercept) + round-to($slope * 100) * 1vw, round-to($max));
}

// ── La escala: paso n = base × ratioⁿ, con un ratio en cada extremo ────────
:root {
  @for $step from -1 through 4 {
    $min: $base-min * math.pow($ratio-min, $step);
    $max: $base-max * math.pow($ratio-max, $step);
    @debug "paso #{$step}: #{round-to($min)} → #{round-to($max)}";
    --step-#{$step}: #{fluid($min, $max)};
  }
}

// ── Uso: los componentes solo conocen los pasos ────────────────────────────
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  font-size: var(--step-0);
  line-height: 1.5;
}

.post {
  max-width: 38rem;

  h1,
  h2,
  h3 {
    line-height: 1.15;
    text-wrap: balance;
  }

  h1 { font-size: var(--step-4); }
  h2 { font-size: var(--step-2); }
  h3 { font-size: var(--step-1); }

  &__kicker,
  &__note {
    font-size: var(--step--1);   // «--step-» + «-1»: el paso menos uno
    color: #475569;
  }

  &__lead {
    font-size: var(--step-1);
  }
}

// Abre la vista previa con ↗ y cambia el ancho: los títulos crecen más deprisa
// que el texto, porque su ratio también crece (1,2 → 1,333).
```
