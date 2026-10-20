---
example_description: "Los mapas son los diccionarios de Sass: map.get (también anidado), map.merge, map.has-key y map.keys, y un mixin de breakpoints por nombre"
example_tags: "sass|sass-map|mapas|mixins|breakpoints"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<article class="card">
  <p class="card__tag">Novedad</p>
  <h2 class="card__title">Huerto en balcón</h2>
  <p>Todo lo que necesitas para cultivar en 2 m²: jardineras, sustrato y semillas.</p>
</article>
<p class="legend">Colores disponibles: </p>
```

# SCSS

```scss
@use "sass:map";

// Un mapa: pares clave: valor entre paréntesis. Es el dict de Python.
$palette: (
  brand: #15803d,
  text: #1e293b,
  surface: #f0fdf4,
);

// map.merge devuelve un mapa NUEVO con las claves de los dos (los mapas son
// inmutables; por eso se reasigna la variable). Como {**a, **b} en Python.
$palette: map.merge($palette, (accent: #b45309));

// Los mapas se pueden anidar: map.get acepta varias claves seguidas.
$theme: (
  radius: (sm: 4px, lg: 12px),
);

$breakpoints: (md: 30rem, lg: 48rem);

// Un mixin de breakpoints por NOMBRE: @include from(md)
@mixin from($name) {
  @media (width >= map.get($breakpoints, $name)) {
    @content;
  }
}

body {
  font-family: system-ui, sans-serif;
  color: map.get($palette, text);
}

.card {
  max-width: 24rem;
  padding: 4px 16px 12px;
  border-left: 6px solid map.get($palette, brand);
  border-radius: map.get($theme, radius, lg);   // → 12px (clave dentro de clave)
  background: map.get($palette, surface);

  @include from(md) {
    padding-inline: 24px;
  }

  &__tag {
    margin: 8px 0 0;
    color: map.get($palette, accent);
    font-size: 0.8rem;
    font-weight: bold;
    text-transform: uppercase;
  }

  &__title {
    margin: 4px 0;
    color: map.get($palette, brand);
  }
}

// map.keys devuelve la lista de claves; interpolada en un texto se ve así:
.legend::after {
  content: "#{map.keys($palette)}";    // → "brand, text, surface, accent"
  font-weight: bold;
}

// Otras: map.has-key($palette, brand) → true, map.values($palette),
// map.remove($palette, accent), map.set($palette, danger, #b91c1c).
```
