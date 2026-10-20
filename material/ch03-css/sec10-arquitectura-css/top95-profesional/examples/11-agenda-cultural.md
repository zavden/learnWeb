---
example_description: "La agenda cultural de una ciudad con temas anidados sin una sola regla de tema extra: la franja de la Noche de Museos declara color-scheme: dark y su pase, dentro, color-scheme: light; los mismos tokens light-dark() eligen en cada elemento. Las tarjetas de evento se escriben con @scope (.event) to (.event__description), así que la descripción que llega del gestor de contenidos conserva sus estilos"
example_tags: "css|profesional|arquitectura|scope|donut|light-dark|color-scheme|temas-anidados|layer"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="agenda-header">
  <h1>Agenda cultural · Puebla</h1>
  <p class="agenda-header__theme">Tema activo: <span class="is-light-label">claro</span><span class="is-dark-label">oscuro</span>. La franja de la Noche de Museos es oscura en los dos.</p>
</header>

<main class="agenda">
  <section class="week" aria-labelledby="week-title">
    <h2 id="week-title">Esta semana</h2>
    <article class="event">
      <p class="date">Jue 15 oct · 19:00</p>
      <h3><a href="/agenda/cuarteto-de-cuerdas">Cuarteto de cuerdas en el Palafoxiano</a></h3>
      <div class="event__description">
        <p>Obras de Manuel M. Ponce. Entrada libre hasta llenar el aforo; consulta <a href="/biblioteca-palafoxiana/acceso">cómo llegar</a>.</p>
      </div>
    </article>
    <article class="event">
      <p class="date">Sáb 17 oct · 11:00</p>
      <h3><a href="/agenda/taller-de-talavera">Taller de talavera para principiantes</a></h3>
      <div class="event__description">
        <p>Pinta tu propio azulejo. Incluye materiales y horneado.</p>
      </div>
    </article>
  </section>

  <section class="night" aria-labelledby="night-title">
    <h2 id="night-title">Noche de Museos</h2>
    <p>El último miércoles del mes, catorce museos abren hasta las 22:00.</p>
    <article class="event">
      <p class="date">Mié 28 oct · 18:00</p>
      <h3><a href="/agenda/noche-de-museos/amparo">Recorrido nocturno por el Museo Amparo</a></h3>
      <div class="event__description">
        <p>Visita guiada a la colección prehispánica con linterna.</p>
      </div>
    </article>
    <div class="night__pass">
      <p><strong>Pase de la noche:</strong> gratis con tu credencial de estudiante.</p>
      <a class="button" href="/agenda/noche-de-museos/pase">Descargar el pase</a>
    </div>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Agenda cultural
   - Temas anidados con color-scheme: la franja nocturna declara dark y su
     pase, light. Todos los colores son tokens light-dark(), que eligen
     según el color-scheme de CADA elemento: ningún bloque de tema extra.
     (Con clases como .theme-dark a, el tema más cercano no ganaría: la
     cascada solo miraría el orden. @scope lo arreglaría con la proximidad;
     color-scheme lo evita.)
   - La tarjeta de evento: @scope (.event) to (.event__description).
     Dentro, nombres cortos (.date, h3, a); la descripción viene del gestor
     de contenidos y queda fuera del ámbito: sus enlaces son los de la base.
     Como el límite no frena la herencia, la descripción declara su color.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  :where(dialog, [popover]) { margin: auto; }
  body { min-height: 100dvh; line-height: 1.5; }
  h1, h2, h3 { text-wrap: balance; }
  p { text-wrap: pretty; }

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
    --color-band: light-dark(#f5f5f4, #292524);
    --color-text: light-dark(#1c1917, #f5f5f4);
    --color-muted: light-dark(#57534e, #a8a29e);
    --color-border: light-dark(#d6d3d1, #44403c);
    --color-link: light-dark(#1d4ed8, #93c5fd);
    --color-accent: light-dark(#be123c, #fda4af);
    --color-on-accent: light-dark(#ffffff, #4c0519);
  }
}

@layer base {
  body {
    font-family: system-ui, sans-serif;
    color: var(--color-text);
    background: var(--color-page);
  }

  a { color: var(--color-link); }

  :focus-visible {
    outline: 3px solid var(--color-accent);
    outline-offset: 2px;
  }
}

@layer components {
  .agenda-header {
    display: grid;
    gap: 4px;
    padding: 16px;

    h1 { font-size: 1.4rem; line-height: 1.2; }
  }

  .agenda-header__theme { color: var(--color-muted); font-size: 0.8rem; }

  .is-dark-label { display: none; }

  @media (prefers-color-scheme: dark) {
    .is-light-label { display: none; }
    .is-dark-label { display: inline; }
  }

  .agenda {
    display: grid;
    gap: 16px;
    padding: 0 16px 24px;
  }

  .week,
  .night {
    display: grid;
    gap: 10px;

    h2 { font-size: 1.15rem; }
  }

  /* La franja nocturna: oscura siempre. Los tokens hacen el resto. */
  .night {
    color-scheme: dark;
    padding: 16px;
    border-radius: 14px;
    background: var(--color-band);
    color: var(--color-text);
  }

  /* Y dentro, una isla clara. */
  .night__pass {
    color-scheme: light;
    display: grid;
    gap: 8px;
    justify-items: start;
    padding: 12px;
    border-radius: 10px;
    background: var(--color-surface);
    color: var(--color-text);
  }

  .button {
    padding: 6px 14px;
    border-radius: 999px;
    background: var(--color-accent);
    color: var(--color-on-accent);
    font-weight: 700;
    text-decoration: none;
  }

  /* ── La tarjeta de evento ───────────────────────────────────────────── */
  @scope (.event) to (.event__description) {
    :scope {
      display: grid;
      gap: 4px;
      padding: 12px 14px;
      border: 1px solid var(--color-border);
      border-left: 4px solid var(--color-accent);
      border-radius: 10px;
      background: var(--color-surface);
      color: var(--color-muted);
      font-size: 0.85rem;
    }

    .date { color: var(--color-accent); font-weight: 700; }
    h3 { font-size: 1rem; line-height: 1.3; }

    a {
      color: var(--color-text);
      text-decoration-color: var(--color-accent);
      text-underline-offset: 3px;
    }
  }

  /* El agujero: el texto del gestor de contenidos. Declara su color y su
     tamaño, que si no heredaría de la tarjeta. Sus enlaces, los de base. */
  .event__description {
    color: var(--color-text);
    font-size: 0.9rem;
  }
}
```
