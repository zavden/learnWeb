---
example_description: "Un generador de paleta: nueve tonos por color de marca mezclados con sass:color según una receta en un mapa, publicados como custom properties, con el contraste WCAG de cada muestra calculado al compilar y escrito en la propia página"
example_tags: "sass|profesional|color|paleta|sass-color|sass-math|contraste|mapas|each|warn"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="palette-page">
  <header class="palette-page__header">
    <h1>Paleta de La Huerta</h1>
    <p>Tres colores de marca y nueve tonos de cada uno, generados con Sass. Cada muestra indica el contraste de su texto (blanco o tinta) calculado al compilar.</p>
  </header>
  <section class="palette" aria-labelledby="green-title">
    <h2 id="green-title">Verde «Huerta»</h2>
    <ul class="palette__swatches">
      <li class="swatch swatch--green-100"><span class="swatch__name">green-100</span></li>
      <li class="swatch swatch--green-200"><span class="swatch__name">green-200</span></li>
      <li class="swatch swatch--green-300"><span class="swatch__name">green-300</span></li>
      <li class="swatch swatch--green-400"><span class="swatch__name">green-400</span></li>
      <li class="swatch swatch--green-500"><span class="swatch__name">green-500</span></li>
      <li class="swatch swatch--green-600"><span class="swatch__name">green-600</span></li>
      <li class="swatch swatch--green-700"><span class="swatch__name">green-700</span></li>
      <li class="swatch swatch--green-800"><span class="swatch__name">green-800</span></li>
      <li class="swatch swatch--green-900"><span class="swatch__name">green-900</span></li>
    </ul>
  </section>
  <section class="palette" aria-labelledby="blue-title">
    <h2 id="blue-title">Azul «Riego»</h2>
    <ul class="palette__swatches">
      <li class="swatch swatch--blue-100"><span class="swatch__name">blue-100</span></li>
      <li class="swatch swatch--blue-200"><span class="swatch__name">blue-200</span></li>
      <li class="swatch swatch--blue-300"><span class="swatch__name">blue-300</span></li>
      <li class="swatch swatch--blue-400"><span class="swatch__name">blue-400</span></li>
      <li class="swatch swatch--blue-500"><span class="swatch__name">blue-500</span></li>
      <li class="swatch swatch--blue-600"><span class="swatch__name">blue-600</span></li>
      <li class="swatch swatch--blue-700"><span class="swatch__name">blue-700</span></li>
      <li class="swatch swatch--blue-800"><span class="swatch__name">blue-800</span></li>
      <li class="swatch swatch--blue-900"><span class="swatch__name">blue-900</span></li>
    </ul>
  </section>
  <section class="palette" aria-labelledby="amber-title">
    <h2 id="amber-title">Ámbar «Cosecha»</h2>
    <ul class="palette__swatches">
      <li class="swatch swatch--amber-100"><span class="swatch__name">amber-100</span></li>
      <li class="swatch swatch--amber-200"><span class="swatch__name">amber-200</span></li>
      <li class="swatch swatch--amber-300"><span class="swatch__name">amber-300</span></li>
      <li class="swatch swatch--amber-400"><span class="swatch__name">amber-400</span></li>
      <li class="swatch swatch--amber-500"><span class="swatch__name">amber-500</span></li>
      <li class="swatch swatch--amber-600"><span class="swatch__name">amber-600</span></li>
      <li class="swatch swatch--amber-700"><span class="swatch__name">amber-700</span></li>
      <li class="swatch swatch--amber-800"><span class="swatch__name">amber-800</span></li>
      <li class="swatch swatch--amber-900"><span class="swatch__name">amber-900</span></li>
    </ul>
  </section>
  <section class="usage" aria-labelledby="usage-title">
    <h2 id="usage-title">Cómo leer el contraste</h2>
    <ul>
      <li><strong>AAA</strong> (7:1 o más) y <strong>AA</strong> (4,5:1 o más): sirven para cualquier texto.</li>
      <li><strong>AA grande</strong> (3:1 a 4,5:1): solo para texto grande, iconos y bordes de controles.</li>
      <li>Los botones de la marca usan <code>green-700</code> con texto blanco; los fondos suaves, los tonos 100 y 200 con texto <code>-900</code>.</li>
    </ul>
  </section>
</main>
```

# SCSS

```scss
// ─────────────────────────────────────────────────────────────────────────────
// Generador de paleta con contraste comprobado
// - Entrada: un color base por tono ($hues). Salida: 9 tonos de cada uno
//   (100 … 900) como custom properties, listos para los tokens semánticos.
// - Receta de cada paso en un mapa: con qué se mezcla el color base (blanco
//   para los claros, negro para los oscuros) y en qué proporción. Cambiar el
//   carácter de la paleta es cambiar ese mapa, no el código.
// - Al compilar, contrast() aplica la fórmula de WCAG; text-for() elige el
//   texto (blanco o tinta) con más contraste y la muestra lo enseña con su
//   nivel (AAA, AA, AA grande). Si algún tono no llega a 4,5:1 con ninguno
//   de los dos, un @warn lo dice en sass-output.txt: le pasa a amber-600, que
//   solo vale para texto grande o elementos de interfaz.
// - Esta página de documentación genera 27 reglas de muestra: es una página
//   para el equipo de diseño, no CSS de producción. En producción solo se
//   publican las 27 custom properties de :root.
// ─────────────────────────────────────────────────────────────────────────────
@use "sass:color";
@use "sass:list";
@use "sass:map";
@use "sass:math";

// ── Configuración ────────────────────────────────────────────────────────────
// Las claves van ENTRE COMILLAS: sin ellas, green y blue son colores para
// Sass, no palabras, y al interpolarlas en un nombre de clase avisa con
// «You probably don't mean to use the color value green in interpolation».
$hues: (
  "green": #15803d,
  "blue": #2563eb,
  "amber": #d97706,
) !default;

// paso: (con qué se mezcla, cuánto color base queda). null = el color base.
$steps: (
  100: (#ffffff, 12%),
  200: (#ffffff, 25%),
  300: (#ffffff, 45%),
  400: (#ffffff, 72%),
  500: null,
  600: (#000000, 85%),
  700: (#000000, 70%),
  800: (#000000, 55%),
  900: (#000000, 40%),
) !default;

$ink: #0f172a !default;      // el texto oscuro de la marca

// ── Funciones de color ───────────────────────────────────────────────────────
@function tidy($color) {
  @return rgb(
    math.round(color.channel($color, "red", $space: rgb)),
    math.round(color.channel($color, "green", $space: rgb)),
    math.round(color.channel($color, "blue", $space: rgb))
  );
}

@function shade($base, $step) {
  $recipe: map.get($steps, $step);
  @if $recipe == null {
    @return $base;
  }
  @return tidy(color.mix($base, list.nth($recipe, 1), list.nth($recipe, 2)));
}

@function linear-channel($value) {
  $c: math.div($value, 255);
  @if $c <= 0.04045 {
    @return math.div($c, 12.92);
  }
  @return math.pow(math.div($c + 0.055, 1.055), 2.4);
}

@function luminance($color) {
  $r: linear-channel(color.channel($color, "red", $space: rgb));
  $g: linear-channel(color.channel($color, "green", $space: rgb));
  $b: linear-channel(color.channel($color, "blue", $space: rgb));
  @return 0.2126 * $r + 0.7152 * $g + 0.0722 * $b;
}

@function contrast($a, $b) {
  $la: luminance($a);
  $lb: luminance($b);
  @return math.div(math.max($la, $lb) + 0.05, math.min($la, $lb) + 0.05);
}

@function text-for($background) {
  @if contrast(#ffffff, $background) >= contrast($ink, $background) {
    @return #ffffff;
  }
  @return $ink;
}

@function rating($ratio) {
  @if $ratio >= 7 {
    @return "AAA";
  } @else if $ratio >= 4.5 {
    @return "AA";
  } @else if $ratio >= 3 {
    @return "AA grande";
  }
  @return "insuficiente";
}

// 4.8333 → "4,8"
@function format-ratio($ratio) {
  $rounded: math.div(math.round($ratio * 10), 10);
  @return "#{math.floor($rounded)},#{math.round(($rounded - math.floor($rounded)) * 10)}";
}

// ── Tokens: lo único que iría a producción ───────────────────────────────────
:root {
  @each $hue, $base in $hues {
    @each $step, $_ in $steps {
      --#{$hue}-#{$step}: #{shade($base, $step)};
    }
  }
}

// ── Página de documentación ──────────────────────────────────────────────────
body {
  margin: 0;
  background: #f8fafc;
  color: $ink;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}

.palette-page {
  max-width: 60rem;
  margin-inline: auto;
  padding: 2rem 1rem;

  &__header p {
    max-width: 60ch;
  }
}

.palette {
  margin-top: 1.5rem;

  h2 {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
  }

  &__swatches {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr));
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }
}

.swatch {
  display: grid;
  gap: 0.25rem;
  min-height: 5.5rem;
  padding: 0.5rem;
  border-radius: 8px;
  font-size: 0.8125rem;

  &__name {
    font-weight: 700;
  }

  &::after {
    align-self: end;
    font-variant-numeric: tabular-nums;
  }
}

@each $hue, $base in $hues {
  @each $step, $_ in $steps {
    $background: shade($base, $step);
    $text: text-for($background);
    $ratio: contrast($text, $background);

    @if $ratio < 4.5 {
      @warn "#{$hue}-#{$step}: el mejor texto solo llega a #{format-ratio($ratio)}:1.";
    }

    .swatch--#{$hue}-#{$step} {
      background: var(--#{$hue}-#{$step});
      color: $text;

      &::after {
        content: "#{if(sass($text == #ffffff): "Blanco"; else: "Tinta")} #{format-ratio($ratio)}:1 · #{rating($ratio)}";
      }
    }
  }
}

.usage {
  margin-top: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  background: #ffffff;

  h2 {
    margin-top: 0;
    font-size: 1.1rem;
  }
}
```
