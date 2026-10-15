---
example_description: "Una guía de cuidados con el reset y la base de la lección 5, la escala fluida de tokens (--step-n, --space-*) y estilos de texto largo con :where(.prose). La cabecera es pegada, así que :target recibe un scroll-margin calculado con su altura; y la capa print la deja lista para el papel"
example_tags: "css|integracion|reset|design-tokens|clamp|where|target|print|layer"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<header class="topbar">
  <p class="topbar__brand">Vivero Xochimilco</p>
  <nav aria-label="En esta guía" class="topbar__toc">
    <a href="#riego">Riego</a>
    <a href="#luz">Luz</a>
    <a href="#poda">Poda</a>
  </nav>
</header>
<main class="guide prose">
  <h1>Cómo cuidar un ficus bonsái</h1>
  <p class="guide__lead">Es el bonsái más agradecido para empezar: aguanta el interior, perdona algún olvido y brota con fuerza tras la poda.</p>
  <h2 id="riego">Riego</h2>
  <p>Riega cuando los dos primeros centímetros de tierra estén secos, hasta que el agua salga por los agujeros de la maceta. En verano será cada dos o tres días.</p>
  <h2 id="luz">Luz</h2>
  <p>Junto a una ventana luminosa, sin sol directo a mediodía. Gira la maceta cada semana para que crezca parejo.</p>
  <h2 id="poda">Poda</h2>
  <p>Cuando una rama tenga ocho hojas, córtala dejando dos. Usa tijeras limpias y sella los cortes grandes con pasta cicatrizante.</p>
  <p class="guide__source">Guía del <a href="/guias/ficus-bonsai">Vivero Xochimilco</a>, revisada en octubre de 2026.</p>
</main>
```

# CSS

```css
@layer reset, tokens, base, components, print;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  :where(dialog, [popover]) { margin: auto; }
  html { -webkit-text-size-adjust: none; text-size-adjust: none; }
  body { min-height: 100dvh; line-height: 1.5; }
  h1, h2 { text-wrap: balance; }
  p { text-wrap: pretty; }
  :target { scroll-margin-block: 5ex; }
}

@layer tokens {
  :root {
    --step--1: clamp(0.8333rem, 0.7727rem + 0.303vw, 1rem);
    --step-0: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
    --step-1: clamp(1.2rem, 1.0682rem + 0.6591vw, 1.5625rem);
    --step-3: clamp(1.728rem, 1.4686rem + 1.2971vw, 2.4414rem);
    --space-2xs: clamp(0.5rem, 0.4545rem + 0.2273vw, 0.625rem);
    --space-s: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
    --space-m: clamp(1.5rem, 1.3636rem + 0.6818vw, 1.875rem);
    --space-s-l: clamp(1rem, 0.4545rem + 2.7273vw, 2.5rem);
    --color-text: #1c1917;
    --color-muted: #57534e;
    --color-accent: #15803d;
    --color-rule: #d6d3d1;
    --header-height: 3rem;
  }
}

@layer base {
  body {
    font-family: system-ui, sans-serif;
    font-size: var(--step-0);
    color: var(--color-text);
    background: #ffffff;
  }

  a { color: var(--color-accent); }

  /* La cabecera pegada taparía el título al saltar a un ancla: el aire del
     reset (5ex) no basta. La base lo ajusta con la altura de la cabecera. */
  :target { scroll-margin-block-start: calc(var(--header-height) + var(--space-s)); }

  :focus-visible {
    outline: 3px solid #1d4ed8;
    outline-offset: 2px;
  }

  /* Textos largos: especificidad cero, para que cualquier componente los
     pise con una clase. */
  :where(.prose) {
    max-inline-size: 65ch;
  }

  :where(.prose) > * + * { margin-block-start: var(--space-s); }
  :where(.prose) > h2 { margin-block-start: var(--space-m); font-size: var(--step-1); }
  :where(.prose) h1 { font-size: var(--step-3); line-height: 1.15; }
}

@layer components {
  .topbar {
    position: sticky;
    top: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0 var(--space-s);
    align-items: center;
    justify-content: space-between;
    min-height: var(--header-height);
    padding-inline: var(--space-s-l);
    border-bottom: 1px solid var(--color-rule);
    background: #ffffff;
    font-size: var(--step--1);
  }

  .topbar__brand { font-weight: 700; }

  .topbar__toc {
    display: flex;
    gap: var(--space-2xs);
  }

  .guide { padding: var(--space-s-l); }

  .guide__lead { color: var(--color-muted); font-size: var(--step-1); line-height: 1.4; }

  .guide__source {
    padding-top: var(--space-2xs);
    border-top: 1px solid var(--color-rule);
    color: var(--color-muted);
    font-size: var(--step--1);
  }

  /* El título al que se salta se marca con una raya: así se ve adónde se
     llegó, aunque la página no haya tenido que desplazarse. */
  h2:target {
    padding-left: var(--space-2xs);
    border-left: 4px solid var(--color-accent);
  }
}

@layer print {
  @media print {
    @page { margin: 2cm; }
    body { font-family: Georgia, serif; font-size: 11pt; }
    .topbar__toc { display: none; }
    .topbar { position: static; padding: 0 0 6pt; }
    .guide { padding: 0; }
    .guide__source a::after { content: " (viveroxochimilco.mx" attr(href) ")"; }
    h2 { break-after: avoid; }
  }
}
```
