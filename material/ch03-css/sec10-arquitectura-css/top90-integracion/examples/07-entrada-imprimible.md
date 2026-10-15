---
example_description: "Una entrada de museo para la pantalla y para el papel: tokens con light-dark() (la página dice qué tema está activo), un sello «Pagado» que entra una sola vez, la red de movimiento reducido en el reset y una capa print que fuerza el tema claro, esconde los enlaces y deja la entrada con bordes negros en una hoja"
example_tags: "css|integracion|print|light-dark|design-tokens|reset|prefers-reduced-motion|layer"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<main class="page">
  <p class="theme-note">Tema activo: <span class="is-light-label">claro</span><span class="is-dark-label">oscuro</span> (el de tu sistema). En papel, siempre claro: ↗ y <kbd>⌘</kbd> <kbd>P</kbd>.</p>
  <article class="ticket" aria-labelledby="ticket-title">
    <header class="ticket__header">
      <p class="ticket__museum">Museo de Arte Popular</p>
      <h1 id="ticket-title" class="ticket__title">Exposición «Juguetes de madera»</h1>
      <p class="ticket__stamp">Pagado</p>
    </header>
    <dl class="ticket__details">
      <div><dt>Fecha</dt><dd>Sábado 24 de octubre de 2026</dd></div>
      <div><dt>Hora de entrada</dt><dd>11:30</dd></div>
      <div><dt>Visitantes</dt><dd>2 adultos, 1 menor</dd></div>
      <div><dt>Total</dt><dd>$140</dd></div>
    </dl>
    <footer class="ticket__footer">
      <p class="ticket__code">Código <strong>MAP-4417-2026</strong></p>
      <p class="ticket__note">Muestra este código en taquilla, en papel o en el teléfono.</p>
    </footer>
  </article>
  <p class="links">
    <a href="/visita/como-llegar">Cómo llegar</a> ·
    <a href="/entradas/MAP-4417-2026.ics">Añadir al calendario</a>
  </p>
</main>
```

# CSS

```css
@layer reset, tokens, base, components, print;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  body { line-height: 1.5; }

  /* La red de seguridad: con «reducir movimiento», el sello aparece al
     instante (y animationend seguiría llegando). */
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
    --color-page: light-dark(#f8fafc, #020617);
    --color-surface: light-dark(#ffffff, #0f172a);
    --color-text: light-dark(#0f172a, #f1f5f9);
    --color-muted: light-dark(#475569, #94a3b8);
    --color-border: light-dark(#cbd5e1, #334155);
    --color-accent: light-dark(#be123c, #fda4af);
    --color-stamp: light-dark(#15803d, #86efac);
  }
}

@layer base {
  body {
    font-family: system-ui, sans-serif;
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
  .page { display: grid; gap: 12px; max-width: 26rem; padding: 16px; }

  .theme-note,
  .links { color: var(--color-muted); font-size: 0.8rem; }

  .is-dark-label { display: none; }

  @media (prefers-color-scheme: dark) {
    .is-light-label { display: none; }
    .is-dark-label { display: inline; }
  }

  .ticket {
    border: 1px solid var(--color-border);
    border-radius: 14px;
    background: var(--color-surface);
  }

  .ticket__header {
    position: relative;
    padding: 14px 16px;
    border-bottom: 2px dashed var(--color-border);
  }

  .ticket__museum { color: var(--color-accent); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
  .ticket__title { font-size: 1.15rem; line-height: 1.25; }

  .ticket__stamp {
    position: absolute;
    top: 10px;
    right: 12px;
    padding: 0 8px;
    border: 2px solid var(--color-stamp);
    border-radius: 6px;
    color: var(--color-stamp);
    font-size: 0.8rem;
    font-weight: 800;
    text-transform: uppercase;
    rotate: -8deg;
    animation: stamp-in 500ms cubic-bezier(0.2, 0, 0, 1) 300ms both;
  }

  .ticket__details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 16px;
    padding: 14px 16px;

    dt { color: var(--color-muted); font-size: 0.75rem; }
    dd { margin: 0; font-weight: 700; }
  }

  .ticket__footer {
    display: grid;
    gap: 2px;
    padding: 12px 16px;
    border-top: 1px solid var(--color-border);
    font-size: 0.85rem;
  }

  .ticket__code strong { font-family: ui-monospace, monospace; letter-spacing: 0.08em; }
  .ticket__note { color: var(--color-muted); font-size: 0.8rem; }

  /* Una sola vez, sin bucle. Con «reducir movimiento», la red del reset
     la deja en 0.01ms: el sello aparece en su sitio sin girar. */
  @keyframes stamp-in {
    from { opacity: 0; scale: 1.6; rotate: -30deg; }
  }
}

@layer print {
  @media print {
    @page { margin: 1.5cm; }
    :root { color-scheme: light; }

    body { color: #000000; background: #ffffff; font-size: 11pt; }
    .theme-note, .links { display: none; }
    .page { padding: 0; }

    .ticket { border: 1pt solid #000000; break-inside: avoid; }
    .ticket__header { border-bottom: 1pt dashed #000000; }
    .ticket__museum, .ticket__stamp { color: #000000; border-color: #000000; }
    .ticket__stamp { animation: none; }
  }
}
```
