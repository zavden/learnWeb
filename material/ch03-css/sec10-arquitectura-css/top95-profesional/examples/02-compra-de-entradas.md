---
example_description: "La compra de entradas de un museo: pasos con aria-current=\"step\" y contadores, tipos de entrada con campos numéricos, y un resumen escrito con @scope (nombres cortos que no salen de él) que se pone al lado y pegado cuando el formulario, un contenedor, mide 36rem. Tokens con light-dark() y la escala fluida; la página dice qué tema está activo"
example_tags: "css|profesional|arquitectura|scope|layer|design-tokens|light-dark|container-queries|formularios|counters"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="site-header">
  <p class="site-header__brand">Museo Nacional de Antropología</p>
  <p class="site-header__theme">Tema activo: <span class="is-light-label">claro</span><span class="is-dark-label">oscuro</span> (el de tu sistema)</p>
</header>

<main class="checkout">
  <ol class="steps" role="list" aria-label="Pasos de la compra">
    <li class="steps__item is-done">Fecha</li>
    <li class="steps__item" aria-current="step">Entradas</li>
    <li class="steps__item">Pago</li>
  </ol>

  <h1>Elige tus entradas</h1>
  <p class="checkout__date">Sábado 24 de octubre de 2026 · 11:00</p>

  <form class="tickets" action="/compra/pago" method="post">
    <div class="tickets__layout">
      <div class="tickets__list">
        <div class="ticket-type">
          <label for="adults">General <span class="ticket-type__price">$105</span></label>
          <input id="adults" name="adults" type="number" min="0" max="10" value="2" inputmode="numeric">
        </div>
        <div class="ticket-type">
          <label for="students">Estudiantes y docentes con credencial <span class="ticket-type__price">Gratis</span></label>
          <input id="students" name="students" type="number" min="0" max="10" value="0" inputmode="numeric">
        </div>
        <div class="ticket-type">
          <label for="kids">Menores de 13 años <span class="ticket-type__price">Gratis</span></label>
          <input id="kids" name="kids" type="number" min="0" max="10" value="1" inputmode="numeric">
        </div>
        <label class="check"><input type="checkbox" name="audioguide" checked> Audioguía en español para los adultos ($75 cada una)</label>
      </div>

      <aside class="summary" aria-labelledby="summary-title">
        <h2 id="summary-title">Resumen</h2>
        <dl>
          <div><dt>2 × General</dt><dd>$210</dd></div>
          <div><dt>1 × Menor de 13 años</dt><dd>$0</dd></div>
          <div><dt>2 × Audioguía</dt><dd>$150</dd></div>
        </dl>
        <p class="total">Total <strong>$360</strong></p>
        <button class="button" type="submit">Continuar al pago</button>
        <p class="note">Puedes cambiar la hora hasta 24 horas antes.</p>
      </aside>
    </div>
  </form>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Compra de entradas
   - Capas: reset < tokens < base < components.
   - Tokens: semánticos con light-dark() (sigue al sistema) y la escala
     fluida de la lección de tokens (letra y espacio).
   - Los pasos son una lista ordenada: el número sale de un contador de
     CSS, el paso actual de aria-current="step" (lo anuncia el lector de
     pantalla) y el hecho, de una clase de estado.
   - El resumen va en @scope (.summary): dentro, nombres cortos (dl, dt,
     .total, .note) que no se escapan al resto de la página.
   - El formulario es un contenedor: con 36rem, el resumen se pone al lado
     y se queda pegado al hacer scroll. El resumen es estático; calcularlo
     es trabajo de JavaScript (capítulo 6).
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  :where(dialog, [popover]) { margin: auto; }
  body { min-height: 100dvh; line-height: 1.5; }
  input, button { font: inherit; }
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
    --slate-50: #f8fafc;
    --slate-100: #f1f5f9;
    --slate-300: #cbd5e1;
    --slate-400: #94a3b8;
    --slate-500: #64748b;
    --slate-600: #475569;
    --slate-700: #334155;
    --slate-800: #1e293b;
    --slate-900: #0f172a;
    --slate-950: #020617;
    --orange-300: #fdba74;
    --orange-700: #c2410c;
    --orange-950: #431407;

    color-scheme: light dark;
    --color-page: light-dark(var(--slate-50), var(--slate-950));
    --color-surface: light-dark(#ffffff, var(--slate-900));
    --color-surface-alt: light-dark(var(--slate-100), var(--slate-800));
    --color-text: light-dark(var(--slate-900), var(--slate-100));
    --color-muted: light-dark(var(--slate-600), var(--slate-400));
    --color-border: light-dark(var(--slate-300), var(--slate-700));
    --color-control: light-dark(var(--slate-500), var(--slate-400));
    --color-accent: light-dark(var(--orange-700), var(--orange-300));
    --color-on-accent: light-dark(#ffffff, var(--orange-950));

    --step--1: clamp(0.8333rem, 0.7727rem + 0.303vw, 1rem);
    --step-0: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
    --step-1: clamp(1.2rem, 1.0682rem + 0.6591vw, 1.5625rem);
    --step-3: clamp(1.728rem, 1.4686rem + 1.2971vw, 2.4414rem);
    --space-2xs: clamp(0.5rem, 0.4545rem + 0.2273vw, 0.625rem);
    --space-xs: clamp(0.75rem, 0.6818rem + 0.3409vw, 0.9375rem);
    --space-s: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
    --space-m: clamp(1.5rem, 1.3636rem + 0.6818vw, 1.875rem);
  }
}

@layer base {
  body {
    font-family: system-ui, sans-serif;
    font-size: var(--step-0);
    color: var(--color-text);
    background: var(--color-page);
  }

  h1 { font-size: var(--step-3); line-height: 1.15; }
  h2 { font-size: var(--step-1); }
  input { accent-color: var(--color-accent); }

  :focus-visible {
    outline: 3px solid var(--color-accent);
    outline-offset: 2px;
  }
}

@layer components {
  .site-header {
    display: flex;
    flex-wrap: wrap;
    gap: 2px var(--space-s);
    justify-content: space-between;
    padding: var(--space-2xs) var(--space-s);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
    font-size: var(--step--1);
  }

  .site-header__brand { font-weight: 800; }
  .site-header__theme { color: var(--color-muted); }

  .is-dark-label { display: none; }

  @media (prefers-color-scheme: dark) {
    .is-light-label { display: none; }
    .is-dark-label { display: inline; }
  }

  .checkout {
    display: grid;
    gap: var(--space-xs);
    max-width: 56rem;
    padding: var(--space-s);
  }

  .checkout__date { color: var(--color-muted); }

  .steps {
    display: flex;
    gap: var(--space-s);
    counter-reset: step;
    font-size: var(--step--1);
  }

  .steps__item {
    display: flex;
    gap: 6px;
    align-items: center;
    color: var(--color-muted);
    counter-increment: step;

    &::before {
      content: counter(step);
      display: grid;
      place-items: center;
      width: 1.6em;
      aspect-ratio: 1;
      border: 2px solid currentColor;
      border-radius: 50%;
      font-weight: 700;
    }

    /* El texto después de la barra es el que lee el lector de pantalla. */
    &.is-done::before { content: "✓" / "Hecho:"; }

    &[aria-current="step"] {
      color: var(--color-text);
      font-weight: 700;

      &::before {
        border-color: var(--color-accent);
        background: var(--color-accent);
        color: var(--color-on-accent);
      }
    }
  }

  /* El formulario es el contenedor, y la rejilla va en un envoltorio de
     dentro: una consulta @container mira al contenedor ANTEPASADO más
     cercano, nunca al propio elemento (un .tickets con la rejilla y la
     consulta a la vez no cambiaría nunca). */
  .tickets { container-type: inline-size; }

  .tickets__layout {
    display: grid;
    gap: var(--space-s);
    margin-top: var(--space-2xs);

    @container (width >= 36rem) {
      grid-template-columns: 1fr 15rem;
      align-items: start;
    }
  }

  .tickets__list { display: grid; gap: var(--space-2xs); }

  .ticket-type {
    display: flex;
    gap: var(--space-xs);
    align-items: center;
    justify-content: space-between;
    padding: var(--space-xs);
    border: 1px solid var(--color-border);
    border-radius: 10px;
    background: var(--color-surface);

    &:has(input:focus-visible) { border-color: var(--color-accent); }

    label { display: grid; }

    input {
      width: 4.5rem;
      padding: 4px 8px;
      border: 1px solid var(--color-control);
      border-radius: 6px;
      background: var(--color-surface);
      color: var(--color-text);
      font-variant-numeric: tabular-nums;
    }
  }

  .ticket-type__price { color: var(--color-muted); font-size: var(--step--1); }

  .check { display: flex; gap: 8px; align-items: baseline; font-size: var(--step--1); }

  .button {
    padding: 10px 18px;
    border: 0;
    border-radius: 999px;
    background: var(--color-accent);
    color: var(--color-on-accent);
    font-weight: 700;
    cursor: pointer;
  }

  /* El resumen: un ámbito con nombres cortos. */
  @scope (.summary) {
    :scope {
      display: grid;
      gap: var(--space-xs);
      padding: var(--space-s);
      border-radius: 12px;
      background: var(--color-surface-alt);
    }

    @container (width >= 36rem) {
      :scope { position: sticky; top: var(--space-s); }
    }

    dl { display: grid; gap: 4px; font-size: var(--step--1); }
    dl div { display: flex; justify-content: space-between; gap: 8px; }
    dd { margin: 0; font-variant-numeric: tabular-nums; }

    .total {
      display: flex;
      justify-content: space-between;
      padding-top: var(--space-2xs);
      border-top: 1px solid var(--color-border);
      font-size: var(--step-1);
    }

    .note { color: var(--color-muted); font-size: var(--step--1); }
  }
}
```
