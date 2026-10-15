---
example_description: "Un componente de tarjeta BEM escrito con anidamiento de Sass: elementos y modificadores con &__ y &--, estados con & y :has(), una container query anidada y un mixin de foco; todo sale en selectores de una clase"
example_tags: "sass|integracion|bem|anidamiento|selector-padre|container-queries|mixins|accesibilidad"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<div class="shelf">
  <article class="card">
    <div class="card__inner">
      <div class="card__media" role="img" aria-label="Plántulas de jitomate en macetas pequeñas"></div>
      <div class="card__body">
        <h2 class="card__title"><a class="card__link" href="/tienda/plantulas-jitomate">Plántulas de jitomate</a></h2>
        <p class="card__price">6 plántulas · 120 MXN</p>
      </div>
    </div>
  </article>
  <article class="card card--featured">
    <div class="card__inner">
      <div class="card__media" role="img" aria-label="Kit de huerto vertical colgado en una pared"></div>
      <div class="card__body">
        <p class="card__badge">Más vendido</p>
        <h2 class="card__title"><a class="card__link" href="/tienda/huerto-vertical">Kit de huerto vertical</a></h2>
        <p class="card__price">12 bolsillos · 890 MXN</p>
      </div>
    </div>
  </article>
  <article class="card is-sold-out">
    <div class="card__inner">
      <div class="card__media" role="img" aria-label="Saco de sustrato de fibra de coco"></div>
      <div class="card__body">
        <h2 class="card__title"><a class="card__link" href="/tienda/fibra-de-coco">Fibra de coco</a></h2>
        <p class="card__price">Saco de 20 L · Agotado</p>
      </div>
    </div>
  </article>
</div>
<p class="hint">Toda la tarjeta muestra el foco cuando el enlace lo recibe (prueba con el tabulador). Cada tarjeta decide por su propio ancho: si mide más de 26rem (por ejemplo, cuando la rejilla cabe en una sola columna), se pone en horizontal. Cambia el ancho de la vista previa (↗).</p>
```

# SCSS

```scss
$accent: #15803d;
$ink: #1e293b;
$muted: #475569;

@mixin hover-and-focus {
  &:hover,
  &:focus-within {
    @content;
  }
}

body {
  font-family: system-ui, sans-serif;
  color: $ink;
}

.shelf {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 12px;
}

// ── Bloque ─────────────────────────────────────────────────────────────────
.card {
  container-type: inline-size;     // las tarjetas se adaptan a SU ancho
  position: relative;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #ffffff;

  @include hover-and-focus {
    border-color: $accent;
  }

  // Estado: el anillo de foco rodea TODA la tarjeta cuando el enlace tiene foco.
  &:has(.card__link:focus-visible) {
    outline: 3px solid $accent;
    outline-offset: 2px;
  }

  // ── Elementos ────────────────────────────────────────────────────────────
  &__inner {
    display: grid;       // una columna; en horizontal, dos (container query, abajo)
    height: 100%;
  }

  &__media {
    aspect-ratio: 16 / 9;
    background: linear-gradient(135deg, #bbf7d0, #15803d);
  }

  &__body {
    padding: 12px 16px;
  }

  &__badge {
    display: inline-block;
    margin: 0 0 6px;
    padding: 2px 8px;
    border-radius: 999px;
    background: #fef3c7;
    color: #78350f;
    font-size: 0.75rem;
    font-weight: bold;
  }

  &__title {
    margin: 0;
    font-size: 1.05rem;
  }

  &__link {
    color: inherit;
    text-decoration: none;

    // El enlace cubre toda la tarjeta: un solo punto de clic y de foco.
    &::after {
      content: "";
      position: absolute;
      inset: 0;
    }

    &:focus-visible {
      outline: none;      // el anillo lo dibuja la tarjeta (ver :has() arriba)
    }
  }

  &__price {
    margin: 4px 0 0;
    color: $muted;
  }

  // Container query anidada: burbujea como una @media (lección 3). Pregunta por
  // el ancho del contenedor más cercano de .card__inner, que es la propia .card.
  @container (width >= 26rem) {
    &__inner {
      grid-template-columns: 10rem 1fr;
    }

    &__media {
      aspect-ratio: auto;          // se estira a la altura de la fila
    }

    &__body {
      align-self: center;
    }
  }

  // ── Modificadores ────────────────────────────────────────────────────────
  &--featured {
    border-width: 2px;
    border-color: $accent;
  }

  &.is-sold-out {
    .card__media {
      filter: grayscale(1);
    }

    .card__price {
      color: #b91c1c;
      font-weight: bold;
    }
  }
}

.hint {
  color: $muted;
  font-size: 0.875rem;
}

// En compiled.css, casi todo es una sola clase (.card__title, .card--featured),
// con especificidad (0,1,0). Si pasaras esto a anidamiento NATIVO de CSS, los
// &__… y &--… dejarían de funcionar (lección 3): habría que escribirlos enteros.
```
