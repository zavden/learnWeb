---
example_description: "&__elemento y &--modificador construyen nombres BEM pegando texto al selector padre: .card__title, .card--featured, todo con especificidad (0,1,0)"
example_tags: "sass|anidamiento|selector-padre|bem|sufijos"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<article class="card">
  <h2 class="card__title">Kit de semillas de otoño</h2>
  <p class="card__body">Espinacas, rabanitos y habas: todo lo que puedes sembrar en octubre.</p>
  <a class="card__link" href="/tienda/semillas-otono">Ver el kit</a>
</article>
<article class="card card--featured">
  <h2 class="card__title">Kit de huerto urbano</h2>
  <p class="card__body">Mesa de cultivo, sustrato y seis variedades de aromáticas.</p>
  <a class="card__link" href="/tienda/huerto-urbano">Ver el kit</a>
</article>
```

# SCSS

```scss
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.card {
  max-width: 24rem;
  margin-bottom: 12px;
  padding: 4px 16px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;

  // Con Sass, & seguido de texto PEGA ese texto al nombre del padre.
  // Es la forma habitual de escribir BEM (bloque__elemento--modificador).
  &__title {                // → .card__title
    font-size: 1.15rem;
    color: #14532d;
  }

  &__body {                 // → .card__body
    line-height: 1.5;
  }

  &__link {                 // → .card__link
    color: #15803d;
    font-weight: bold;
  }

  &--featured {             // → .card--featured
    border: 2px solid #15803d;
    background: #f0fdf4;
  }
}

// En el código fuente todo está agrupado bajo .card, pero en compiled.css
// cada selector es UNA sola clase: especificidad (0,1,0) y ninguna dependencia
// de dónde esté el elemento. Es justo lo que busca BEM.
//
// Ojo: esto solo funciona en Sass. El anidamiento nativo de CSS no pega texto
// (lo verás en el ejemplo 9).
```
