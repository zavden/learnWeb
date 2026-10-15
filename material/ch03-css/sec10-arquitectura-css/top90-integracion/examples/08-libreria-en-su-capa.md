---
example_description: "Una librería de reseñas (estrellas e insignia) metida en @layer vendor: se configura redefiniendo sus custom properties desde la capa components (sin pelear con su especificidad) y su único !important se arregla en vendor-fixes, una capa declarada antes que vendor. Tus tarjetas, anidadas y con tus tokens"
example_tags: "css|integracion|layer|librerias|important|design-tokens|anidamiento"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<section class="reviews" aria-labelledby="reviews-title">
  <h2 id="reviews-title">Opiniones del Café La Parroquia</h2>
  <article class="review-card">
    <div class="sr-widget">
      <span class="sr-stars" style="--sr-value: 4.5" role="img" aria-label="4,5 de 5 estrellas">★★★★★</span>
      <span class="sr-badge">Compra verificada</span>
    </div>
    <p class="review-card__text">El lechero, como en Veracruz: se pide golpeando el vaso con la cuchara.</p>
    <p class="review-card__author">Rocío V. · Xalapa</p>
  </article>
  <article class="review-card">
    <div class="sr-widget">
      <span class="sr-stars" style="--sr-value: 3" role="img" aria-label="3 de 5 estrellas">★★★★★</span>
      <span class="sr-badge">Compra verificada</span>
    </div>
    <p class="review-card__text">Buen café, pero el domingo esperamos media hora por una mesa.</p>
    <p class="review-card__author">Tomás G. · Ciudad de México</p>
  </article>
</section>
```

# CSS

```css
/* vendor-fixes ANTES que vendor: un !important solo pierde contra otro
   !important de una capa anterior. */
@layer reset, vendor-fixes, vendor, tokens, base, components;

/* ── La librería, tal cual la publican sus autores ─────────────────────
   (En un proyecto: @import url("star-rating.css") layer(vendor);) */
@layer vendor {
  .sr-widget {
    --sr-accent: #f59e0b;
    --sr-empty: #d1d5db;
    --sr-size: 1.1rem;
    display: flex;
    gap: 8px;
    align-items: center;
    font-family: Arial, sans-serif;
  }

  .sr-stars {
    font-size: var(--sr-size);
    letter-spacing: 2px;
    color: transparent;
    background: linear-gradient(90deg, var(--sr-accent) calc(var(--sr-value) / 5 * 100%), var(--sr-empty) 0);
    background-clip: text;
  }

  .sr-badge {
    padding: 1px 6px;
    border-radius: 3px;
    background: #6b7280 !important;   /* sus autores no quieren que nadie la pinte */
    color: #ffffff;
    font-size: 0.7rem;
  }
}

/* ── Los arreglos a la librería, en un solo sitio ───────────────────────
   Para ganar a su !important hace falta un !important en una capa
   ANTERIOR (con !important, el orden de las capas se invierte). */
@layer vendor-fixes {
  .sr-badge { background: var(--color-success) !important; }
}

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  body { line-height: 1.5; }
}

@layer tokens {
  :root {
    --color-text: #1c1917;
    --color-muted: #57534e;
    --color-surface: #fffbeb;
    --color-border: #e7e5e4;
    --color-accent: #b45309;
    --color-success: #166534;
  }
}

@layer base {
  body {
    padding: 16px;
    font-family: system-ui, sans-serif;
    color: var(--color-text);
    background: #ffffff;
  }
}

@layer components {
  .reviews { display: grid; gap: 10px; max-width: 28rem; }
  .reviews h2 { font-size: 1.05rem; }

  .review-card {
    display: grid;
    gap: 6px;
    padding: 12px 14px;
    border: 1px solid var(--color-border);
    border-radius: 10px;
    background: var(--color-surface);

    /* Configurar la librería: redefinir SUS custom properties. Esta
       regla está en components, que va después de vendor: gana sin subir
       la especificidad y sin !important. */
    .sr-widget {
      --sr-accent: var(--color-accent);
      --sr-size: 1.25rem;
      font-family: inherit;
    }
  }

  .review-card__author { color: var(--color-muted); font-size: 0.8rem; }
}
```
