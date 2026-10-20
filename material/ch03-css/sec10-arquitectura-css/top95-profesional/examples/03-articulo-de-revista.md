---
example_description: "El sistema de estilos de un artículo de revista: los estilos de texto largo viven en @scope (.prose) to (.not-prose), con la especificidad de una etiqueta y sin tocar los componentes incrustados (el recuadro del boletín); una nota destacada que los pisa con una clase; escala fluida, tema con light-dark() que se anuncia en la página y una capa print con las direcciones de los enlaces"
example_tags: "css|profesional|arquitectura|scope|donut|prose|design-tokens|light-dark|print|tipografia-fluida"
example_stage: professional
example_importance: critical
---

# HTML

```html
<header class="masthead">
  <p class="masthead__brand">Revista Trazo</p>
  <p class="masthead__theme">Tema activo: <span class="is-light-label">claro</span><span class="is-dark-label">oscuro</span></p>
</header>

<article class="article prose">
  <p class="article__kicker">Grabado japonés</p>
  <h1>La gran ola: un grabado que dio la vuelta al mundo</h1>
  <p class="article__lead">Una barca, una ola con dedos de espuma y, al fondo, diminuto, el monte Fuji. Así se hizo la estampa más reproducida del arte japonés.</p>

  <figure>
    <img src="hokusai-gran-ola-480.jpg" alt="Una ola enorme con la cresta rota en espuma se cierne sobre tres barcas; al fondo, pequeño, el monte Fuji nevado" width="480" height="323">
    <figcaption>Katsushika Hokusai, <cite>La gran ola de Kanagawa</cite>, hacia 1831. Dominio público.</figcaption>
  </figure>

  <h2>Una serie para viajeros</h2>
  <p>Hokusai la publicó dentro de la serie <cite>Treinta y seis vistas del monte Fuji</cite>, pensada para un público al que le encantaba viajar y que podía pagar estampas baratas. Era un <a href="/glosario/ukiyo-e">grabado ukiyo-e</a>: un dibujo tallado en bloques de madera, uno por color.</p>

  <aside class="callout" aria-label="Dato">
    <p><strong>El azul importado.</strong> El azul intenso de la ola es azul de Prusia, un pigmento sintético europeo que llegaba a Japón con los comerciantes holandeses y chinos.</p>
  </aside>

  <h2>Cómo se imprimía</h2>
  <ol>
    <li>El pintor dibujaba sobre papel fino.</li>
    <li>El tallador pegaba el dibujo sobre madera de cerezo y vaciaba lo blanco.</li>
    <li>El impresor entintaba cada bloque y frotaba el papel con un <em>baren</em>.</li>
  </ol>

  <blockquote>
    <p>Desde los seis años tenía la manía de dibujar la forma de las cosas.</p>
  </blockquote>
  <p class="quote-source">Hokusai, en el epílogo de <cite>Cien vistas del monte Fuji</cite> (1834).</p>

  <section class="newsletter not-prose" aria-labelledby="newsletter-title">
    <h2 id="newsletter-title" class="newsletter__title">Recibe un grabado cada viernes</h2>
    <p class="newsletter__text">Una obra comentada, sin publicidad.</p>
    <a class="newsletter__button" href="/boletin/alta">Suscribirme</a>
  </section>

  <p>Hoy se conservan copias de las primeras tiradas en museos de Tokio, Nueva York, París y Londres.</p>
</article>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Artículo de revista
   - Los estilos de TEXTO LARGO (títulos, párrafos, listas, citas, figuras)
     van en @scope (.prose) to (.not-prose):
     · sus selectores son de etiqueta, (0,0,1), porque la raíz del ámbito
       no suma especificidad: cualquier componente con una clase los pisa,
       sin :where() (la nota destacada lo hace);
     · el límite .not-prose deja fuera los componentes incrustados (el
       recuadro del boletín): sus h2, p y a no reciben estilos de texto.
   - Tokens con light-dark() y la escala fluida (--step-n, --space-*).
   - Capa print: letra en puntos, sin cabecera ni boletín, figuras sin
     partir y la dirección de cada enlace del texto.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components, print;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  :where(dialog, [popover]) { margin: auto; }
  html { -webkit-text-size-adjust: none; text-size-adjust: none; }
  body { min-height: 100dvh; line-height: 1.5; }
  img { display: block; max-width: 100%; height: auto; }
  h1, h2, h3 { text-wrap: balance; overflow-wrap: break-word; }
  p { text-wrap: pretty; overflow-wrap: break-word; }

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
    --color-page: light-dark(#fffdf7, #0c0a09);
    --color-text: light-dark(#1c1917, #f5f5f4);
    --color-muted: light-dark(#57534e, #a8a29e);
    --color-rule: light-dark(#d6d3d1, #44403c);
    --color-accent: light-dark(#1e40af, #93c5fd);
    --color-on-accent: light-dark(#ffffff, #172554);
    --color-callout: light-dark(#eff6ff, #172554);

    --font-text: Georgia, "Times New Roman", serif;
    --font-ui: system-ui, sans-serif;
    --step--1: clamp(0.8333rem, 0.7727rem + 0.303vw, 1rem);
    --step-0: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
    --step-1: clamp(1.2rem, 1.0682rem + 0.6591vw, 1.5625rem);
    --step-2: clamp(1.44rem, 1.2534rem + 0.933vw, 1.9531rem);
    --step-4: clamp(2.0736rem, 1.7179rem + 1.7785vw, 3.0518rem);
    --space-2xs: clamp(0.5rem, 0.4545rem + 0.2273vw, 0.625rem);
    --space-xs: clamp(0.75rem, 0.6818rem + 0.3409vw, 0.9375rem);
    --space-s: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
    --space-m: clamp(1.5rem, 1.3636rem + 0.6818vw, 1.875rem);
    --space-s-l: clamp(1rem, 0.4545rem + 2.7273vw, 2.5rem);
  }
}

@layer base {
  body {
    font-family: var(--font-ui);
    font-size: var(--step-0);
    color: var(--color-text);
    background: var(--color-page);
  }

  a { color: var(--color-accent); }

  :focus-visible {
    outline: 3px solid var(--color-accent);
    outline-offset: 2px;
  }
}

@layer components {
  .masthead {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 2px var(--space-s);
    padding: var(--space-2xs) var(--space-s-l);
    border-bottom: 1px solid var(--color-rule);
    font-size: var(--step--1);
  }

  .masthead__brand { font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; }
  .masthead__theme { color: var(--color-muted); }

  .is-dark-label { display: none; }

  @media (prefers-color-scheme: dark) {
    .is-light-label { display: none; }
    .is-dark-label { display: inline; }
  }

  .article { padding: var(--space-m) var(--space-s-l); }

  .article__kicker {
    color: var(--color-accent);
    font-family: var(--font-ui);
    font-size: var(--step--1);
    font-weight: 700;
    text-transform: uppercase;
  }

  .article__lead { color: var(--color-muted); font-size: var(--step-1); line-height: 1.4; }
  .quote-source { color: var(--color-muted); font-size: var(--step--1); }

  /* ── El texto largo ──────────────────────────────────────────────────── */
  @scope (.prose) to (.not-prose) {
    :scope {
      max-inline-size: 38rem;
      font-family: var(--font-text);
    }

    /* El ritmo: espacio entre hermanos seguidos, más antes de un título. */
    :scope > * + * { margin-block-start: var(--space-s); }
    :scope > h2 { margin-block-start: var(--space-m); }

    h1 { font-family: var(--font-ui); font-size: var(--step-4); line-height: 1.1; }
    h2 { font-family: var(--font-ui); font-size: var(--step-2); line-height: 1.2; }

    a {
      text-decoration-thickness: 1px;
      text-underline-offset: 0.2em;
    }

    ol, ul { padding-inline-start: 1.4em; }
    li + li { margin-block-start: var(--space-2xs); }
    li::marker { color: var(--color-accent); font-family: var(--font-ui); font-weight: 700; }

    figcaption { margin-top: var(--space-2xs); color: var(--color-muted); font-family: var(--font-ui); font-size: var(--step--1); }

    blockquote {
      padding-inline-start: var(--space-s);
      border-inline-start: 4px solid var(--color-accent);
      font-size: var(--step-1);
      font-style: italic;
    }
  }

  /* Un componente DENTRO del texto: una clase (0,1,0) gana a las reglas
     de etiqueta del ámbito sin pelear. */
  .callout {
    padding: var(--space-xs) var(--space-s);
    border-radius: 10px;
    background: var(--color-callout);
    font-family: var(--font-ui);
    font-size: var(--step--1);
  }

  /* Fuera del ámbito por el límite (.not-prose): sus títulos, párrafos y
     enlaces no reciben nada del texto largo. */
  .newsletter {
    display: grid;
    margin-block: var(--space-m);           /* el ritmo del texto no le llega */
    gap: var(--space-2xs);
    padding: var(--space-s);
    border: 1px solid var(--color-rule);
    border-radius: 12px;
  }

  .newsletter__title { font-size: var(--step-1); }
  .newsletter__text { color: var(--color-muted); font-size: var(--step--1); }

  .newsletter__button {
    justify-self: start;
    padding: 8px 16px;
    border-radius: 999px;
    background: var(--color-accent);
    color: var(--color-on-accent);
    font-weight: 700;
    text-decoration: none;
  }
}

@layer print {
  @media print {
    @page { margin: 2cm; }
    :root { color-scheme: light; }
    body { font-size: 11pt; }
    .masthead, .newsletter { display: none; }
    .article { padding: 0; }
    .prose a::after { content: " (revistatrazo.mx" attr(href) ")"; font-size: 0.85em; }
    figure, blockquote, .callout { break-inside: avoid; }
    h1, h2 { break-after: avoid; }
    .callout { border: 0.5pt solid #000000; background: none; }
  }
}
```
