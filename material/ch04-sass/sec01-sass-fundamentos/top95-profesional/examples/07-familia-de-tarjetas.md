---
example_description: "Una familia de componentes BEM: tarjeta de artículo que se pone en horizontal con una container query, variantes por categoría generadas desde un mapa, tarjeta destacada, media object para el autor y tarjeta de perfil"
example_tags: "sass|profesional|tarjetas|bem|anidamiento|container-queries|mapas|each"
example_stage: professional
example_importance: critical
---

# HTML

```html
<main class="blog">
  <h1 class="blog__title">Blog de La Huerta</h1>

  <div class="blog__grid">
    <article class="card card--featured card--compost">
      <div class="card__layout">
        <div class="card__media" role="img" aria-label="Caja de composta con restos de verdura"></div>
        <div class="card__body">
          <p class="card__eyebrow">Composta · Destacado</p>
          <h2 class="card__title"><a class="card__link" href="/blog/composta-en-departamento">Composta en un departamento, sin olores</a></h2>
          <p class="card__text">La proporción de seco y húmedo que mantiene la caja sana, y qué hacer cuando algo sale mal.</p>
          <div class="media">
            <span class="media__avatar" aria-hidden="true">MR</span>
            <p class="media__body"><strong>Mariana Ruiz</strong><br>12 de octubre · 8 min</p>
          </div>
        </div>
      </div>
    </article>

    <article class="card card--riego">
      <div class="card__layout">
        <div class="card__media" role="img" aria-label="Gotero regando una maceta de albahaca"></div>
        <div class="card__body">
          <p class="card__eyebrow">Riego</p>
          <h2 class="card__title"><a class="card__link" href="/blog/riego-en-otono">Cuánto regar en otoño</a></h2>
          <p class="card__text">Las noches frescas cambian la cuenta: baja la frecuencia, no la cantidad.</p>
        </div>
      </div>
    </article>

    <article class="card card--huerto">
      <div class="card__layout">
        <div class="card__media" role="img" aria-label="Plántulas de lechuga en una mesa de cultivo"></div>
        <div class="card__body">
          <p class="card__eyebrow">Huerto</p>
          <h2 class="card__title"><a class="card__link" href="/blog/que-sembrar-en-octubre">Qué sembrar en octubre</a></h2>
          <p class="card__text">Lechugas, rábanos y cilantro: rápidos y agradecidos con el fresco.</p>
        </div>
      </div>
    </article>

    <aside class="card card--profile" aria-labelledby="author-name">
      <div class="card__body">
        <span class="media__avatar media__avatar--large" aria-hidden="true">JL</span>
        <h2 class="card__title" id="author-name">Jorge López</h2>
        <p class="card__text">Agrónomo y profesor de los talleres de riego. Escribe sobre agua y suelos.</p>
        <a class="card__action" href="/autores/jorge-lopez">Ver sus artículos</a>
      </div>
    </aside>
  </div>
</main>
```

# SCSS

```scss
// ─────────────────────────────────────────────────────────────────────────────
// Familia de tarjetas (BEM)
// - Bloque .card con elementos (__media, __body, __eyebrow, __title, __text,
//   __link, __action) y modificadores (--featured, --profile y uno por
//   categoría). Todo se escribe anidado con &__ y &--, y el CSS generado son
//   selectores de UNA clase: especificidad (0,1,0) uniforme.
// - Cada tarjeta es un contenedor (container-type): se pone en horizontal
//   cuando ELLA mide más de 34rem, esté donde esté. La destacada ocupa toda la
//   fila de la rejilla y por eso suele estar en horizontal; las demás, solo
//   cuando la rejilla tiene una columna ancha.
// - Categorías desde un mapa: cada una fija solo --card-accent.
// - Enlace «estirado»: el título es el único enlace y su ::after cubre la
//   tarjeta; el anillo de foco lo dibuja la tarjeta con :has().
// - .media (avatar + texto) es otro bloque, reutilizable fuera de las tarjetas.
// ─────────────────────────────────────────────────────────────────────────────
@use "sass:map";

$categories: (
  huerto: #15803d,
  riego: #0369a1,
  compost: #a16207,
) !default;

$card-horizontal-from: 34rem !default;
$ink: #1c1917;
$muted: #57534e;
$line: #e7e5e4;

@mixin hover-and-focus-within {
  &:hover,
  &:focus-within {
    @content;
  }
}

// ── Página ───────────────────────────────────────────────────────────────────
body {
  margin: 0;
  background: #fafaf9;
  color: $ink;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}

.blog {
  max-width: 64rem;
  margin-inline: auto;
  padding: 2rem 1rem;

  &__title {
    margin: 0 0 1.5rem;
    font-size: 2rem;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(16rem, 100%), 1fr));
    gap: 1rem;
  }
}

// ── Tarjeta ──────────────────────────────────────────────────────────────────
.card {
  --card-accent: #{$muted};

  container-type: inline-size;     // cada tarjeta es un contenedor
  position: relative;
  overflow: hidden;
  border: 1px solid $line;
  border-radius: 12px;
  background: #ffffff;

  @include hover-and-focus-within {
    border-color: var(--card-accent);
  }

  &:has(.card__link:focus-visible) {
    outline: 3px solid var(--card-accent);
    outline-offset: 2px;
  }

  // Media + cuerpo: en columna por defecto. Una container query no puede
  // cambiar al propio contenedor, así que la dirección la lleva este hijo.
  &__layout {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  &__media {
    flex: none;
    min-height: 9rem;
    background:
      radial-gradient(circle at 30% 30%, rgb(255 255 255 / 0.35), transparent 60%),
      var(--card-accent);
  }

  &__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem 1.25rem 1.25rem;
  }

  &__eyebrow {
    margin: 0;
    color: var(--card-accent);
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  &__title {
    margin: 0;
    font-size: 1.15rem;
    line-height: 1.25;
    text-wrap: balance;
  }

  &__link {
    color: inherit;
    text-decoration: none;

    &::after {
      content: "";
      position: absolute;
      inset: 0;
    }

    &:focus-visible {
      outline: none;   // lo dibuja la tarjeta
    }
  }

  &__text {
    margin: 0;
    color: $muted;
  }

  &__action {
    margin-top: auto;
    color: var(--card-accent);
    font-weight: 600;
  }

  // En horizontal cuando la TARJETA es ancha (container query anidada: Sass la
  // saca fuera con los selectores completos).
  @container (width >= #{$card-horizontal-from}) {
    &__layout {
      flex-direction: row;
    }

    &__media {
      flex-basis: 40%;
    }

    &__body {
      justify-content: center;
      padding: 1.5rem 2rem;
    }
  }

  // ── Modificadores ──────────────────────────────────────────────────────────
  @each $name, $color in $categories {
    &--#{$name} {
      --card-accent: #{$color};
    }
  }

  &--featured {
    grid-column: 1 / -1;
    border-width: 2px;
    border-color: var(--card-accent);

    .card__title {
      font-size: 1.5rem;
    }
  }

  &--profile {
    text-align: center;

    .card__body {
      align-items: center;
      height: 100%;
    }
  }
}

// ── Media object ─────────────────────────────────────────────────────────────
.media {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid $line;

  &__avatar {
    display: grid;
    flex: none;
    place-items: center;
    width: 2.5rem;
    aspect-ratio: 1;
    border-radius: 50%;
    background: #e7e5e4;
    color: $ink;
    font-size: 0.875rem;
    font-weight: 700;

    &--large {
      width: 4.5rem;
      font-size: 1.25rem;
    }
  }

  &__body {
    margin: 0;
    color: $muted;
    font-size: 0.875rem;
    line-height: 1.4;

    strong {
      color: $ink;
    }
  }
}
```
