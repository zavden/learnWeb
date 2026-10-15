---
example_description: "El catálogo de una exposición presentado como un libro en 3D: portada, lomo, cantos de las páginas (un degradado repetido) y contraportada colocados con rotate y translateZ dentro de un preserve-3d; una casilla de verificación da la vuelta al libro con :has(), sin JavaScript y con el teclado"
example_tags: "css|profesional|preserve-3d|perspective|translateZ|backface-visibility|has|libro"
example_stage: professional
example_importance: important
---

# HTML

```html
<section class="showcase" aria-labelledby="book-title">
  <div class="stage">
    <div class="book" aria-hidden="true">
      <div class="book__face book__cover">
        <p class="book__label">Catálogo</p>
        <p class="book__name">Agua y montaña</p>
        <p class="book__publisher">Museo de la Ciudad</p>
      </div>
      <div class="book__face book__spine">Agua y montaña</div>
      <div class="book__face book__pages"></div>
      <div class="book__face book__back">
        <p>Velasco y Hokusai, dos maneras de mirar el paisaje en el siglo XIX.</p>
        <p class="book__isbn">160 páginas · 98 ilustraciones</p>
      </div>
    </div>
  </div>

  <div class="details">
    <h1 id="book-title" class="details__title">Agua y montaña. Catálogo de la exposición</h1>
    <p>Velasco y Hokusai, dos maneras de mirar el paisaje en el siglo XIX: ensayos, cronología y las obras de la exposición a toda página.</p>
    <p class="details__meta">160 páginas · 98 ilustraciones · Tapa dura</p>
    <p class="details__price">$380</p>
    <label class="toggle"><input type="checkbox"> Ver la contraportada</label>
    <a class="button" href="/tienda/catalogo-agua-y-montana">Comprar el catálogo</a>
  </div>
</section>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Libro en 3D
   - Escena: perspective en .stage. El libro (.book) tiene preserve-3d y
     ninguna propiedad que lo aplane (ni overflow, ni opacity, ni filter):
     la sombra va en el escenario, como un degradado radial en el «suelo».
   - Medidas: 150 × 210 y 30px de grosor (--depth). Cada cara va a su sitio:
       · portada: translate 15px hacia ti;
       · contraportada: translate 15px hacia el fondo y rotate 180° en su
         sitio. Las propiedades sueltas aplican SIEMPRE translate antes que
         rotate: la cara se mueve en los ejes del libro y luego gira;
       · lomo (30px de ancho, centrado): transform: rotateY(-90deg)
         translateZ(75px). Aquí hace falta girar ANTES de avanzar (por el eje
         ya girado, hacia la izquierda), y ese orden solo lo da transform;
       · cantos de las páginas: rotateY(90deg) translateZ(73px), a la
         derecha, un poco hacia dentro (las tapas sobresalen).
   - La casilla gira el libro 180° con :has(:checked): se maneja con el
     teclado (Tab y espacio) y el lector de pantalla la anuncia. El libro es
     decorativo (aria-hidden): sus textos están también en .details.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  * {
    margin: 0;
  }

  input {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --color-text: #1c1917;
    --color-muted: #57534e;
    --color-cover: #1d3557;
    --color-accent: #9f1239;
    --book-w: 150px;
    --book-h: 210px;
    --depth: 30px;
  }
}

@layer base {
  body {
    padding: 16px;
    color: var(--color-text);
    font-family: system-ui, sans-serif;
    line-height: 1.45;
  }

  :focus-visible {
    outline: 3px solid #1d4ed8;
    outline-offset: 2px;
  }
}

@layer components {
  .showcase {
    display: flex;
    flex-wrap: wrap;
    gap: 16px 28px;
    align-items: center;
    max-width: 44rem;
  }

  .stage {
    display: grid;
    place-items: center;
    width: 220px;
    height: 270px;
    border-radius: 14px;
    background:
      radial-gradient(ellipse 45% 8% at 50% 90%, rgb(28 25 23 / 0.35), transparent),
      linear-gradient(#f5f5f4, #e7e5e4);
    perspective: 900px;
  }

  .book {
    position: relative;
    width: var(--book-w);
    height: var(--book-h);
    transform-style: preserve-3d;
    rotate: y 28deg;
  }

  .showcase:has(.toggle :checked) .book {
    rotate: y 208deg;                  /* 180 + 28: la otra cara */
  }

  .book__face {
    position: absolute;
    backface-visibility: hidden;
  }

  .book__cover,
  .book__back {
    inset: 0;
    border-radius: 2px 6px 6px 2px;
  }

  .book__cover {
    display: grid;
    align-content: end;
    padding: 14px 12px;
    background:
      linear-gradient(to top, rgb(15 23 42 / 0.9) 30%, transparent 70%),
      url("hokusai-gran-ola.jpg") 30% center / auto 100%;
    color: #ffffff;
    translate: 0 0 calc(var(--depth) / 2);
  }

  .book__label {
    color: #fde68a;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .book__name {
    font-family: Georgia, serif;
    font-size: 1.3rem;
    line-height: 1.1;
  }

  .book__publisher {
    margin-top: 4px;
    font-size: 0.65rem;
  }

  .book__back {
    display: grid;
    align-content: space-between;
    padding: 14px 12px;
    background: var(--color-cover);
    color: #f8fafc;
    font-family: Georgia, serif;
    font-size: 0.8rem;
    translate: 0 0 calc(var(--depth) / -2);   /* 15px hacia el fondo… */
    rotate: y 180deg;                         /* …y de espaldas */
  }

  .book__isbn {
    font-family: system-ui, sans-serif;
    font-size: 0.65rem;
  }

  .book__spine {
    top: 0;
    left: calc((var(--book-w) - var(--depth)) / 2);
    display: grid;
    place-items: center;
    width: var(--depth);
    height: 100%;
    background: var(--color-accent);
    color: #ffffff;
    font-family: Georgia, serif;
    font-size: 0.75rem;
    writing-mode: vertical-rl;
    transform: rotateY(-90deg) translateZ(calc(var(--book-w) / 2));
  }

  .book__pages {
    top: 3px;
    left: calc((var(--book-w) - var(--depth)) / 2 + 1px);
    width: calc(var(--depth) - 2px);
    height: calc(100% - 6px);
    background: repeating-linear-gradient(to right, #fafaf9 0 1px, #d6d3d1 1px 2px);
    transform: rotateY(90deg) translateZ(calc(var(--book-w) / 2 - 2px));
  }

  .details {
    display: grid;
    flex: 1 1 15rem;
    gap: 8px;
    justify-items: start;
  }

  .details__title {
    font-family: Georgia, serif;
    font-size: 1.4rem;
    line-height: 1.15;
    text-wrap: balance;
  }

  .details__meta {
    color: var(--color-muted);
    font-size: 0.85rem;
  }

  .details__price {
    font-size: 1.4rem;
    font-weight: 800;
  }

  .toggle {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    cursor: pointer;
  }

  .button {
    padding: 8px 16px;
    border-radius: 999px;
    background: var(--color-accent);
    color: #ffffff;
    font-weight: 700;
    text-decoration: none;
  }
}
```
