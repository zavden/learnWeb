---
example_description: "El catálogo de láminas de un museo que usa una librería de tienda ajena (insignias, precio y estrellas) metida en @layer vendor: se configura con sus custom properties desde la capa components, su !important de las ofertas se arregla en vendor-fixes (declarada antes que vendor) y tus tarjetas, anidadas, la envuelven. Tema con light-dark() anunciado en la página"
example_tags: "css|profesional|arquitectura|layer|librerias|important|design-tokens|light-dark|object-fit|grid"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="shop-header">
  <h1>Láminas del museo</h1>
  <p class="shop-header__theme">Tema activo: <span class="is-light-label">claro</span><span class="is-dark-label">oscuro</span></p>
</header>

<ul class="catalog" role="list">
  <li class="product-card">
    <img class="product-card__image" src="hokusai-gran-ola-480.jpg" alt="" width="480" height="323">
    <span class="vt-badge vt-badge--sale">−20 %</span>
    <h2 class="product-card__title"><a class="product-card__link" href="/laminas/la-gran-ola">La gran ola de Kanagawa</a></h2>
    <p class="vt-price"><del>$450</del> <ins>$360</ins></p>
    <p class="vt-rating" style="--vt-value: 4.8" role="img" aria-label="4,8 de 5 estrellas">★★★★★</p>
  </li>
  <li class="product-card">
    <img class="product-card__image" src="velasco-valle-de-mexico-480.jpg" alt="" width="480" height="330">
    <span class="vt-badge">Nueva</span>
    <h2 class="product-card__title"><a class="product-card__link" href="/laminas/valle-de-mexico">Valle de México</a></h2>
    <p class="vt-price">$520</p>
    <p class="vt-rating" style="--vt-value: 4.5" role="img" aria-label="4,5 de 5 estrellas">★★★★★</p>
  </li>
  <li class="product-card">
    <img class="product-card__image" src="hokusai-gran-ola-480.jpg" alt="" width="480" height="323" style="--focus: 15% 80%">
    <h2 class="product-card__title"><a class="product-card__link" href="/laminas/la-gran-ola-detalle-barcas">La gran ola, detalle de las barcas</a></h2>
    <p class="vt-price">$290</p>
    <p class="vt-rating" style="--vt-value: 4" role="img" aria-label="4 de 5 estrellas">★★★★★</p>
  </li>
  <li class="product-card">
    <img class="product-card__image" src="velasco-valle-de-mexico-480.jpg" alt="" width="480" height="330" style="--focus: 62% 82%">
    <span class="vt-badge vt-badge--sale">−15 %</span>
    <h2 class="product-card__title"><a class="product-card__link" href="/laminas/valle-de-mexico-detalle-aguila">Valle de México, detalle del águila</a></h2>
    <p class="vt-price"><del>$340</del> <ins>$289</ins></p>
    <p class="vt-rating" style="--vt-value: 3.5" role="img" aria-label="3,5 de 5 estrellas">★★★★★</p>
  </li>
</ul>
<p class="credits">Katsushika Hokusai, <cite>La gran ola de Kanagawa</cite>, hacia 1831; José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</p>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Catálogo con una librería ajena
   - La librería («Vitrina UI», sus clases empiezan por vt-) va entera en
     @layer vendor. En un proyecto: @import url("vitrina.css") layer(vendor);
   - Se CONFIGURA, no se pelea: sus custom properties (--vt-accent,
     --vt-radius, --vt-font) se redefinen en la tarjeta, en components.
   - Su !important (el rojo de las ofertas) solo cede ante otro !important
     de una capa ANTERIOR: vendor-fixes va antes que vendor en la lista.
   - Las fotos son decorativas (alt=""): el título del enlace ya nombra la
     lámina. Los detalles son la misma foto recortada con object-position.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, vendor-fixes, vendor, tokens, base, layout, components;

/* ── La librería, tal cual ──────────────────────────────────────────────── */
@layer vendor {
  .vt-badge {
    padding: 2px 8px;
    border-radius: var(--vt-radius, 2px);
    background: var(--vt-accent, #2563eb);
    color: #ffffff;
    font: 700 0.75rem/1.4 var(--vt-font, Arial, sans-serif);
  }

  .vt-badge--sale { background: #dc2626 !important; }

  .vt-price {
    font: 700 1rem/1.4 var(--vt-font, Arial, sans-serif);

    del { color: #6b7280; font-weight: 400; }
    ins { text-decoration: none; }
  }

  .vt-rating {
    width: fit-content;
    font-size: 1rem;
    letter-spacing: 2px;
    color: transparent;
    background: linear-gradient(90deg, var(--vt-star, #f59e0b) calc(var(--vt-value) / 5 * 100%), var(--vt-star-empty, #d1d5db) 0);
    background-clip: text;
  }
}

/* ── Los arreglos a la librería, en un solo sitio ───────────────────────── */
@layer vendor-fixes {
  .vt-badge--sale { background: var(--color-sale) !important; }
}

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  :where(dialog, [popover]) { margin: auto; }
  body { min-height: 100dvh; line-height: 1.5; }
  img { display: block; max-width: 100%; height: auto; }
  h1, h2 { text-wrap: balance; }
  :where(ul, ol)[role="list"] { padding: 0; list-style: none; }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}

@layer tokens {
  :root {
    color-scheme: light dark;
    --color-page: light-dark(#fafaf9, #0c0a09);
    --color-surface: light-dark(#ffffff, #1c1917);
    --color-text: light-dark(#1c1917, #f5f5f4);
    --color-muted: light-dark(#57534e, #a8a29e);
    --color-border: light-dark(#e7e5e4, #44403c);
    --color-accent: light-dark(#1e40af, #93c5fd);
    --color-on-accent: light-dark(#ffffff, #172554);
    --color-sale: light-dark(#b91c1c, #fca5a5);
    --color-on-sale: light-dark(#ffffff, #450a0a);
    --color-star: light-dark(#b45309, #fcd34d);
    --color-star-empty: light-dark(#d6d3d1, #57534e);
    --radius-12: 12px;
  }
}

@layer base {
  body {
    font-family: system-ui, sans-serif;
    color: var(--color-text);
    background: var(--color-page);
  }

  :focus-visible {
    outline: 3px solid var(--color-accent);
    outline-offset: 2px;
  }
}

@layer layout {
  .catalog {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
    gap: 14px;
    padding: 0 16px;
  }
}

@layer components {
  .shop-header {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
    align-items: baseline;
    justify-content: space-between;
    padding: 14px 16px;

    h1 { font-size: 1.3rem; }
  }

  .shop-header__theme,
  .credits { color: var(--color-muted); font-size: 0.75rem; }

  .credits { padding: 14px 16px; }

  .is-dark-label { display: none; }

  @media (prefers-color-scheme: dark) {
    .is-light-label { display: none; }
    .is-dark-label { display: inline; }
  }

  .product-card {
    /* Configurar la librería: SUS custom properties, desde aquí. */
    --vt-accent: var(--color-accent);
    --vt-radius: 999px;
    --vt-font: system-ui, sans-serif;
    --vt-star: var(--color-star);
    --vt-star-empty: var(--color-star-empty);

    position: relative;
    display: grid;
    grid-template-rows: auto 1fr auto auto;          /* la insignia es absoluta: no ocupa fila */
    gap: 6px;
    padding: 10px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-12);
    background: var(--color-surface);

    &:has(.product-card__link:focus-visible) {
      outline: 3px solid var(--color-accent);
      outline-offset: 2px;
    }

    .vt-badge {
      position: absolute;
      top: 16px;
      left: 16px;
      color: var(--color-on-accent);
    }

    .vt-badge--sale { color: var(--color-on-sale); }

    .vt-price del { color: var(--color-muted); }
  }

  .product-card__image {
    width: 100%;
    aspect-ratio: 4 / 3;
    border-radius: 8px;
    object-fit: cover;
    object-position: var(--focus, 50% 50%);
  }

  .product-card__title { font-size: 0.95rem; line-height: 1.3; }

  .product-card__link {
    color: inherit;
    text-decoration: none;

    &::after { content: ""; position: absolute; inset: 0; }
    &:focus-visible { outline: none; }
  }
}
```
