---
example_description: "@function calcula y devuelve UN valor con @return: space(3) → 12px. A diferencia de un mixin, se usa dentro de un valor"
example_tags: "sass|funciones|function|return"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<article class="card">
  <h2 class="card__title">Calendario de siembra</h2>
  <p class="card__text">Octubre: ajos, habas, guisantes y espinacas.</p>
  <a class="card__link" href="/calendario/octubre">Ver todo octubre</a>
</article>
```

# SCSS

```scss
// Una escala de espaciado: todos los espacios son múltiplos de 4px.
$space-unit: 4px;

// @function define una función; @return devuelve su resultado.
// En Python sería: def space(step): return step * 4  (en px)
@function space($step) {
  @return $step * $space-unit;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.card {
  max-width: 22rem;
  padding: space(4) space(5);          // → 16px 20px
  border: 1px solid #cbd5e1;
  border-radius: space(2);             // → 8px

  &__title {
    margin: 0 0 space(2);              // → 0 0 8px
    font-size: 1.2rem;
  }

  &__text {
    margin: 0 0 space(3);              // → 0 0 12px
  }

  &__link {
    display: inline-block;
    padding: space(1) space(3);        // → 4px 12px
    border-radius: space(1);
    background: #15803d;
    color: #ffffff;
    text-decoration: none;
  }
}

// Mixin → genera DECLARACIONES y se usa con @include.
// Función → devuelve UN VALOR y se usa donde iría un valor (padding: space(4)).
```
