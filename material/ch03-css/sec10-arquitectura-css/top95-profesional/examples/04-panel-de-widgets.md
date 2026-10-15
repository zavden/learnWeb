---
example_description: "El panel de una biblioteca municipal con widgets tematizables: cada widget elige su acento con data-accent, que solo redefine dos tokens; los derivados (fondo suave y barras) se declaran en :where(:root, [data-accent]) y se recalculan en cada widget. Container queries por widget, cifras tabulares, barras medidas con custom properties y tema con light-dark() anunciado en la página"
example_tags: "css|profesional|arquitectura|design-tokens|light-dark|color-mix|container-queries|dashboard|layer"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="topbar">
  <h1 class="topbar__title">Biblioteca Vasconcelos · Hoy</h1>
  <p class="topbar__theme">Tema activo: <span class="is-light-label">claro</span><span class="is-dark-label">oscuro</span></p>
</header>

<main class="dashboard">
  <section class="widget" data-accent="teal" aria-labelledby="loans-title">
    <h2 id="loans-title" class="widget__title">Préstamos</h2>
    <p class="widget__figure">412 <span class="widget__unit">libros</span></p>
    <p class="widget__trend">+12 % respecto al miércoles pasado</p>
    <ul class="bars" role="list" aria-label="Préstamos por hora">
      <li style="--value: 35"><span>10 h</span> <span class="bars__value">35</span></li>
      <li style="--value: 80"><span>12 h</span> <span class="bars__value">80</span></li>
      <li style="--value: 100"><span>14 h</span> <span class="bars__value">100</span></li>
      <li style="--value: 60"><span>16 h</span> <span class="bars__value">60</span></li>
    </ul>
  </section>

  <section class="widget" data-accent="indigo" aria-labelledby="rooms-title">
    <h2 id="rooms-title" class="widget__title">Salas de estudio</h2>
    <p class="widget__figure">78 <span class="widget__unit">% ocupadas</span></p>
    <meter class="widget__meter" min="0" max="100" low="60" high="90" optimum="40" value="78" aria-labelledby="rooms-title">78 %</meter>
    <p class="widget__trend">Quedan 11 lugares en la sala 3</p>
  </section>

  <section class="widget" data-accent="rose" aria-labelledby="late-title">
    <h2 id="late-title" class="widget__title">Devoluciones atrasadas</h2>
    <p class="widget__figure">27</p>
    <p class="widget__trend">5 llevan más de un mes</p>
    <a class="widget__link" href="/panel/atrasos">Enviar recordatorios</a>
  </section>

  <section class="widget" data-accent="amber" aria-labelledby="events-title">
    <h2 id="events-title" class="widget__title">Actividades de la semana</h2>
    <ul class="agenda" role="list">
      <li><time datetime="2026-10-15T17:00">Jue 17:00</time> Club de lectura juvenil</li>
      <li><time datetime="2026-10-17T11:00">Sáb 11:00</time> Cuentacuentos en la sala infantil</li>
    </ul>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Panel de widgets
   - Capas: reset < tokens < base < layout < components.
   - Cada widget elige un acento con data-accent. Esas reglas solo
     redefinen --color-accent y --color-accent-strong; los DERIVADOS
     (--color-accent-soft, --color-bar) se declaran en :where(:root,
     [data-accent]), así que cada widget los calcula con su acento. Si se
     declararan solo en :root, todos los widgets tendrían las barras y los
     fondos del acento de la raíz.
   - Las mezclas, in oklab: un tinte en línea recta, sin girar el tono.
   - Cada widget es un contenedor: con 20rem de ancho, la cifra crece y la
     tendencia se pone a su lado.
   - Las barras miden --value (un número de 0 a 100) y escriben su valor:
     el dato no depende del color ni de la longitud.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, layout, components;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  :where(dialog, [popover]) { margin: auto; }
  body { min-height: 100dvh; line-height: 1.5; }
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
    --color-page: light-dark(#f1f5f9, #020617);
    --color-surface: light-dark(#ffffff, #0f172a);
    --color-text: light-dark(#0f172a, #f1f5f9);
    --color-muted: light-dark(#475569, #94a3b8);
    --color-border: light-dark(#cbd5e1, #334155);
    --color-accent: light-dark(#0f766e, #5eead4);
    --color-accent-strong: light-dark(#115e59, #99f6e4);
  }

  /* Los derivados, en todos los sitios donde cambia el acento. */
  :where(:root, [data-accent]) {
    --color-accent-soft: color-mix(in oklab, var(--color-accent) 14%, var(--color-surface));
    --color-bar: color-mix(in oklab, var(--color-accent) 85%, var(--color-surface));
  }

  [data-accent="teal"] {
    --color-accent: light-dark(#0f766e, #5eead4);
    --color-accent-strong: light-dark(#115e59, #99f6e4);
  }

  [data-accent="indigo"] {
    --color-accent: light-dark(#4338ca, #a5b4fc);
    --color-accent-strong: light-dark(#3730a3, #c7d2fe);
  }

  [data-accent="rose"] {
    --color-accent: light-dark(#be123c, #fda4af);
    --color-accent-strong: light-dark(#9f1239, #fecdd3);
  }

  [data-accent="amber"] {
    --color-accent: light-dark(#b45309, #fcd34d);
    --color-accent-strong: light-dark(#92400e, #fde68a);
  }
}

@layer base {
  body {
    font-family: system-ui, sans-serif;
    color: var(--color-text);
    background: var(--color-page);
  }

  a { color: var(--color-accent-strong); }

  :focus-visible {
    outline: 3px solid var(--color-accent);
    outline-offset: 2px;
  }
}

@layer layout {
  .dashboard {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
    gap: 12px;
    padding: 12px 16px 24px;
  }
}

@layer components {
  .topbar {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
    align-items: baseline;
    justify-content: space-between;
    padding: 12px 16px;
  }

  .topbar__title { font-size: 1.2rem; }
  .topbar__theme { color: var(--color-muted); font-size: 0.8rem; }

  .is-dark-label { display: none; }

  @media (prefers-color-scheme: dark) {
    .is-light-label { display: none; }
    .is-dark-label { display: inline; }
  }

  .widget {
    container-type: inline-size;
    display: grid;
    gap: 6px;
    align-content: start;
    padding: 14px;
    border: 1px solid var(--color-border);
    border-top: 4px solid var(--color-accent);
    border-radius: 12px;
    background: var(--color-surface);
  }

  .widget__title {
    color: var(--color-muted);
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .widget__figure {
    color: var(--color-accent-strong);
    font-size: 2rem;
    font-weight: 800;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;

    @container (width >= 20rem) { font-size: 2.6rem; }
  }

  .widget__unit { color: var(--color-muted); font-size: 0.9rem; font-weight: 400; }

  .widget__trend {
    justify-self: start;
    padding: 2px 8px;
    border-radius: 6px;
    background: var(--color-accent-soft);
    color: var(--color-accent-strong);
    font-size: 0.8rem;
  }

  /* El color del <meter> lo decide el navegador según low, high y optimum
     (aquí, amarillo: 78 queda entre low y high, fuera de la zona óptima). accent-color no
     le afecta: solo tiñe casillas, radios, deslizadores y <progress>. */
  .widget__meter {
    inline-size: 100%;
    block-size: 0.8rem;
  }

  .widget__link { font-weight: 700; }

  .bars {
    display: grid;
    gap: 4px;
    margin-top: 4px;
    font-size: 0.75rem;

    li {
      display: grid;
      grid-template-columns: 2.5rem 1fr 2rem;
      gap: 6px;
      align-items: center;

      &::after {
        content: "";
        grid-column: 2;
        grid-row: 1;
        inline-size: calc(var(--value) * 1%);
        block-size: 0.7rem;
        border-radius: 3px;
        background: var(--color-bar);
      }
    }
  }

  /* El número, escrito al final de la fila: el dato no depende de que se
     vea la longitud de la barra. */
  .bars__value {
    grid-column: 3;
    grid-row: 1;
    text-align: end;
    font-variant-numeric: tabular-nums;
  }

  .agenda {
    display: grid;
    gap: 6px;
    font-size: 0.85rem;

    time {
      display: block;
      color: var(--color-accent-strong);
      font-weight: 700;
    }
  }
}
```
