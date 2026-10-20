---
example_description: "La versión web del boletín de una cooperativa de café: una columna de lectura sin media queries, la edición de cosecha como un data-edition que redefine dos tokens (con sus derivados en :where()), un pie que es siempre oscuro con color-scheme: dark (los mismos tokens light-dark() eligen su valor oscuro), tema anunciado en la página y una capa print"
example_tags: "css|profesional|arquitectura|design-tokens|light-dark|color-scheme|boletin|print|layer"
example_stage: professional
example_importance: useful
---

# HTML

```html
<div class="newsletter" data-edition="cosecha">
  <header class="newsletter__header">
    <p class="newsletter__brand">Cooperativa Cafetalera de Pluma Hidalgo</p>
    <p class="newsletter__edition">Boletín de octubre · Edición de cosecha</p>
  </header>

  <main class="newsletter__body">
    <p class="newsletter__theme">Tema activo: <span class="is-light-label">claro</span><span class="is-dark-label">oscuro</span>. El pie es oscuro en los dos.</p>
    <h1>Empieza la cosecha en la sierra</h1>
    <p>Las primeras cerezas maduras ya están en los beneficios de la cooperativa. Este año esperamos 38 toneladas de café pluma, un 10 % más que el anterior, gracias a la renovación de cafetales de 2024.</p>

    <h2>Lo nuevo este mes</h2>
    <ul>
      <li><strong>Café de una sola finca.</strong> Lotes pequeños de las fincas de don Eusebio y doña Matilde, con su nombre en la bolsa.</li>
      <li><strong>Visitas al beneficio.</strong> Los sábados de noviembre, con reservación.</li>
    </ul>

    <aside class="recipe" aria-labelledby="recipe-title">
      <h2 id="recipe-title" class="recipe__title">Receta del mes: café de olla</h2>
      <p>Un litro de agua, un trozo de canela y piloncillo al gusto. Cuando hierva, apaga, añade cuatro cucharadas de café molido grueso y deja reposar cinco minutos.</p>
    </aside>

    <p class="cta"><a class="button" href="/tienda/cosecha-2026">Aparta tu café de cosecha</a></p>
  </main>

  <footer class="newsletter__footer">
    <p>Cooperativa Cafetalera de Pluma Hidalgo · Pluma Hidalgo, Oaxaca.</p>
    <p>Recibes este boletín porque compraste en nuestra tienda. <a href="/boletin/baja">Darte de baja</a></p>
  </footer>
</div>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Boletín (versión web)
   - Una columna de lectura: width: min(100% - 2rem, 36rem). Sin media
     queries: los tamaños vienen de la escala fluida.
   - Edición de cosecha: data-edition solo redefine --color-accent y
     --color-accent-strong. Los derivados (--color-accent-soft) se
     declaran en :where(:root, [data-edition]) para que se calculen ahí.
   - El pie es SIEMPRE oscuro: color-scheme: dark en el pie, y los mismos
     tokens light-dark() eligen allí su valor oscuro. Ni un color repetido.
   - Capa print: sin botón ni baja, con las direcciones de los enlaces.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components, print;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  :where(dialog, [popover]) { margin: auto; }
  body { min-height: 100dvh; line-height: 1.5; }
  h1, h2 { text-wrap: balance; }
  p, li { text-wrap: pretty; }

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
    --color-accent: light-dark(#0f766e, #5eead4);
    --color-accent-strong: light-dark(#115e59, #99f6e4);
    --color-on-accent: light-dark(#ffffff, #042f2e);

    --step--1: clamp(0.8333rem, 0.7727rem + 0.303vw, 1rem);
    --step-0: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
    --step-1: clamp(1.2rem, 1.0682rem + 0.6591vw, 1.5625rem);
    --step-3: clamp(1.728rem, 1.4686rem + 1.2971vw, 2.4414rem);
    --space-2xs: clamp(0.5rem, 0.4545rem + 0.2273vw, 0.625rem);
    --space-s: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
    --space-m: clamp(1.5rem, 1.3636rem + 0.6818vw, 1.875rem);
  }

  :where(:root, [data-edition]) {
    --color-accent-soft: color-mix(in oklab, var(--color-accent) 12%, var(--color-surface));
  }

  /* La edición de cosecha: el rojo de la cereza del café. */
  [data-edition="cosecha"] {
    --color-accent: light-dark(#9f1239, #fda4af);
    --color-accent-strong: light-dark(#881337, #fecdd3);
    --color-on-accent: light-dark(#ffffff, #4c0519);
  }
}

@layer base {
  body {
    font-family: Georgia, serif;
    font-size: var(--step-0);
    color: var(--color-text);
    background: var(--color-page);
  }

  a { color: var(--color-accent-strong); }

  :focus-visible {
    outline: 3px solid var(--color-accent);
    outline-offset: 2px;
  }

  /* El texto del boletín: especificidad cero. */
  :where(.newsletter__body) > * + * { margin-block-start: var(--space-s); }
  :where(.newsletter__body) h1 { font-size: var(--step-3); line-height: 1.15; }
  :where(.newsletter__body) h2 { font-size: var(--step-1); }
  :where(.newsletter__body) li + li { margin-block-start: var(--space-2xs); }
}

@layer components {
  .newsletter {
    width: min(100% - 2rem, 36rem);
    margin: var(--space-s) auto;
    border: 1px solid var(--color-border);
    border-radius: 14px;
    overflow: clip;
    background: var(--color-surface);
  }

  .newsletter__header {
    padding: var(--space-s);
    background: var(--color-accent);
    color: var(--color-on-accent);
    font-family: system-ui, sans-serif;
  }

  .newsletter__brand { font-size: var(--step-1); font-weight: 800; line-height: 1.2; }
  .newsletter__edition { font-size: var(--step--1); }

  .newsletter__body { padding: var(--space-m) var(--space-s); }

  .newsletter__theme {
    color: var(--color-muted);
    font-family: system-ui, sans-serif;
    font-size: var(--step--1);
  }

  .is-dark-label { display: none; }

  @media (prefers-color-scheme: dark) {
    .is-light-label { display: none; }
    .is-dark-label { display: inline; }
  }

  .recipe {
    padding: var(--space-s);
    border-radius: 10px;
    background: var(--color-accent-soft);
  }

  .recipe__title { color: var(--color-accent-strong); }

  .cta { text-align: center; }

  .button {
    display: inline-block;
    padding: 10px 20px;
    border-radius: 999px;
    background: var(--color-accent);
    color: var(--color-on-accent);
    font-family: system-ui, sans-serif;
    font-weight: 700;
    text-decoration: none;
  }

  /* Siempre oscuro: el pie usa los MISMOS tokens, y light-dark() mira el
     color-scheme de cada elemento. */
  .newsletter__footer {
    color-scheme: dark;
    display: grid;
    gap: var(--space-2xs);
    padding: var(--space-s);
    background: var(--color-page);
    color: var(--color-muted);
    font-family: system-ui, sans-serif;
    font-size: var(--step--1);
  }
}

@layer print {
  @media print {
    @page { margin: 2cm; }
    :root { color-scheme: light; }
    body { font-size: 11pt; background: #ffffff; }
    .newsletter { width: auto; margin: 0; border: 0; }
    .newsletter__header { border-bottom: 1pt solid #000000; background: none; color: #000000; }
    .newsletter__theme, .cta, .newsletter__footer a { display: none; }
    .newsletter__footer { color-scheme: light; color: #000000; background: none; }
    .newsletter__body a::after { content: " (cafepluma.mx" attr(href) ")"; }
    .recipe { border: 0.5pt solid #000000; background: none; break-inside: avoid; }
  }
}
```
