---
example_description: "Una tienda de artesanía con tres niveles de tokens, tema claro u oscuro con light-dark() y color-scheme, y una zona de temporada ([data-season]) que solo redefine el acento. Los tokens derivados (el fondo suave con color-mix() y el anillo) se declaran en :where(:root, [data-season]), así que se recalculan en la zona y no se quedan congelados"
example_tags: "css|integracion|design-tokens|light-dark|color-scheme|color-mix|temas|layer"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<fieldset class="theme-picker">
  <legend>Tema</legend>
  <label><input type="radio" name="theme" value="system" checked> Sistema</label>
  <label><input type="radio" name="theme" value="light"> Claro</label>
  <label><input type="radio" name="theme" value="dark"> Oscuro</label>
</fieldset>
<p class="theme-status">Tema activo: <span class="is-light-label">claro</span><span class="is-dark-label">oscuro</span></p>

<div class="shelf">
  <article class="product-card">
    <p class="product-card__badge">Hecho a mano</p>
    <h2 class="product-card__title">Alebrije pequeño de San Martín Tilcajete</h2>
    <p class="product-card__price">$350</p>
    <button class="product-card__button" type="button">Añadir a la cesta</button>
  </article>
  <section class="season" data-season="muertos" aria-labelledby="season-title">
    <h2 id="season-title" class="season__title">Día de Muertos</h2>
    <article class="product-card">
      <p class="product-card__badge">Temporada</p>
      <h2 class="product-card__title">Calavera de azúcar con tu nombre</h2>
      <p class="product-card__price">$120</p>
      <button class="product-card__button" type="button">Añadir a la cesta</button>
    </article>
  </section>
</div>
```

# CSS

```css
@layer reset, tokens, base, components;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  button { font: inherit; }
}

@layer tokens {
  :root {
    /* 1. Primitivos: no cambian con el tema ni con la temporada. */
    --slate-50: #f8fafc;
    --slate-300: #cbd5e1;
    --slate-400: #94a3b8;
    --slate-600: #475569;
    --slate-700: #334155;
    --slate-900: #0f172a;
    --slate-950: #020617;
    --teal-200: #99f6e4;
    --teal-300: #5eead4;
    --teal-700: #0f766e;
    --teal-800: #115e59;
    --teal-950: #042f2e;
    --orange-200: #fed7aa;
    --orange-300: #fdba74;
    --orange-700: #c2410c;
    --orange-800: #9a3412;
    --orange-950: #431407;

    /* 2. Semánticos, con sus dos valores. */
    color-scheme: light dark;
    --color-page: light-dark(var(--slate-50), var(--slate-950));
    --color-surface: light-dark(#ffffff, var(--slate-900));
    --color-text: light-dark(var(--slate-900), var(--slate-50));
    --color-muted: light-dark(var(--slate-600), var(--slate-400));
    --color-border: light-dark(var(--slate-300), var(--slate-700));
    --color-accent: light-dark(var(--teal-700), var(--teal-300));
    --color-accent-strong: light-dark(var(--teal-800), var(--teal-200));
    --color-on-accent: light-dark(#ffffff, var(--teal-950));
  }

  /* Los DERIVADOS se declaran en todos los sitios donde se redefine su
     base: así cada uno se calcula con su propio --color-accent. Si solo
     estuvieran en :root, la zona de temporada heredaría el verde ya
     calculado (lección de tokens, ejemplo 8). :where() deja la regla en
     especificidad cero. */
  :where(:root, [data-season]) {
    --color-accent-soft: color-mix(in oklab, var(--color-accent) 12%, var(--color-surface));
    --ring: 0 0 0 3px var(--color-accent);
  }

  /* La temporada: solo los tokens de acento. */
  [data-season="muertos"] {
    --color-accent: light-dark(var(--orange-700), var(--orange-300));
    --color-accent-strong: light-dark(var(--orange-800), var(--orange-200));
    --color-on-accent: light-dark(#ffffff, var(--orange-950));
  }

  /* El selector de tema solo cambia color-scheme. */
  :root:has(input[name="theme"][value="light"]:checked) { color-scheme: light; }
  :root:has(input[name="theme"][value="dark"]:checked) { color-scheme: dark; }
}

@layer base {
  body {
    padding: 16px;
    font-family: system-ui, sans-serif;
    line-height: 1.5;
    color: var(--color-text);
    background: var(--color-page);
  }

  /* El anillo sale del token derivado. El contorno transparente reaparece
     en los modos de alto contraste, donde box-shadow no se pinta. */
  :focus-visible {
    outline: 2px solid transparent;
    box-shadow: var(--ring);
  }
}

@layer components {
  .theme-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    font-size: 0.85rem;
    accent-color: var(--color-accent);
  }

  .theme-status {
    margin-block: 8px 12px;
    font-size: 0.85rem;
    font-weight: 700;
  }

  .is-dark-label { display: none; }
  :root:has(input[value="dark"]:checked) .is-light-label { display: none; }
  :root:has(input[value="dark"]:checked) .is-dark-label { display: inline; }

  @media (prefers-color-scheme: dark) {
    :root:has(input[value="system"]:checked) .is-light-label { display: none; }
    :root:has(input[value="system"]:checked) .is-dark-label { display: inline; }
  }

  .shelf {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
    gap: 12px;
    align-items: start;
  }

  .season {
    display: grid;
    gap: 8px;
    padding: 10px;
    border: 2px dashed var(--color-accent);
    border-radius: 12px;
  }

  .season__title { color: var(--color-accent-strong); font-size: 1rem; }

  .product-card {
    display: grid;
    gap: 6px;
    padding: 12px;
    border: 1px solid var(--color-border);
    border-top: 4px solid var(--color-accent);
    border-radius: 10px;
    background: var(--color-surface);
  }

  .product-card__badge {
    justify-self: start;
    padding: 0 10px;
    border-radius: 999px;
    background: var(--color-accent-soft);
    color: var(--color-accent-strong);
    font-size: 0.75rem;
    font-weight: 700;
  }

  .product-card__title { font-size: 0.95rem; }
  .product-card__price { font-weight: 700; }

  .product-card__button {
    justify-self: start;
    padding: 6px 14px;
    border: 0;
    border-radius: 999px;
    background: var(--color-accent);
    color: var(--color-on-accent);
    font-weight: 700;
    cursor: pointer;
  }
}
```
