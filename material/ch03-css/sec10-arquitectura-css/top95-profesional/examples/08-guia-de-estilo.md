---
example_description: "La guía de estilo de un sistema de diseño, hecha con sus propios tokens: la paleta de primitivos, los mismos componentes en dos muestras forzadas a claro y a oscuro con color-scheme (los tokens light-dark() no se repiten), la escala tipográfica fluida, la de espacios y un selector de tema para el resto de la página"
example_tags: "css|profesional|arquitectura|design-tokens|light-dark|color-scheme|guia-de-estilo|tipografia-fluida|layer"
example_stage: professional
example_importance: critical
---

# HTML

```html
<header class="guide-header">
  <h1>Guía de estilo · Agenda Clara</h1>
  <fieldset class="theme-picker">
    <legend>Tema de la página</legend>
    <label><input type="radio" name="theme" value="system" checked> Sistema</label>
    <label><input type="radio" name="theme" value="light"> Claro</label>
    <label><input type="radio" name="theme" value="dark"> Oscuro</label>
  </fieldset>
  <p class="guide-header__status">Tema activo: <span class="is-light-label">claro</span><span class="is-dark-label">oscuro</span></p>
</header>

<main class="guide">
  <section aria-labelledby="palette-title">
    <h2 id="palette-title">Primitivos</h2>
    <ul class="swatches" role="list">
      <li style="--swatch: var(--indigo-700)"><code>--indigo-700</code></li>
      <li style="--swatch: var(--indigo-300)"><code>--indigo-300</code></li>
      <li style="--swatch: var(--slate-900)"><code>--slate-900</code></li>
      <li style="--swatch: var(--slate-600)"><code>--slate-600</code></li>
      <li style="--swatch: var(--slate-100)"><code>--slate-100</code></li>
      <li style="--swatch: var(--red-700)"><code>--red-700</code></li>
    </ul>
  </section>

  <section aria-labelledby="themes-title">
    <h2 id="themes-title">Los mismos tokens en los dos temas</h2>
    <div class="previews">
      <div class="preview" data-scheme="light">
        <p class="preview__label">color-scheme: light</p>
        <p>Texto normal y <span class="muted">texto secundario</span>.</p>
        <p><span class="badge">Confirmada</span> <a href="/citas/1042">Cita 1042</a></p>
        <button class="button" type="button">Guardar</button>
      </div>
      <div class="preview" data-scheme="dark">
        <p class="preview__label">color-scheme: dark</p>
        <p>Texto normal y <span class="muted">texto secundario</span>.</p>
        <p><span class="badge">Confirmada</span> <a href="/citas/1042">Cita 1042</a></p>
        <button class="button" type="button">Guardar</button>
      </div>
    </div>
  </section>

  <section aria-labelledby="type-title">
    <h2 id="type-title">Escala tipográfica (fluida)</h2>
    <p class="type-sample" style="font-size: var(--step-3)">Paso 3 · Títulos de página</p>
    <p class="type-sample" style="font-size: var(--step-2)">Paso 2 · Secciones</p>
    <p class="type-sample" style="font-size: var(--step-1)">Paso 1 · Subtítulos</p>
    <p class="type-sample" style="font-size: var(--step-0)">Paso 0 · Texto</p>
    <p class="type-sample" style="font-size: var(--step--1)">Paso −1 · Notas y etiquetas</p>
  </section>

  <section aria-labelledby="space-title">
    <h2 id="space-title">Espacios</h2>
    <ul class="spaces" role="list">
      <li style="--size: var(--space-2xs)"><code>2xs</code></li>
      <li style="--size: var(--space-xs)"><code>xs</code></li>
      <li style="--size: var(--space-s)"><code>s</code></li>
      <li style="--size: var(--space-m)"><code>m</code></li>
      <li style="--size: var(--space-l)"><code>l</code></li>
    </ul>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Guía de estilo
   - La guía se pinta con los tokens que documenta: si un token cambia,
     la guía cambia sola.
   - Primitivos → semánticos con light-dark() → componentes. Las dos
     muestras fuerzan color-scheme: light y dark; los componentes de dentro
     son los mismos y leen los mismos tokens, que eligen su valor según el
     color-scheme de cada elemento.
   - El selector de tema cambia color-scheme en la raíz con :has(); las
     muestras no lo siguen, porque declaran el suyo.
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
    /* Primitivos */
    --slate-100: #f1f5f9;
    --slate-300: #cbd5e1;
    --slate-400: #94a3b8;
    --slate-600: #475569;
    --slate-700: #334155;
    --slate-800: #1e293b;
    --slate-900: #0f172a;
    --indigo-100: #e0e7ff;
    --indigo-300: #a5b4fc;
    --indigo-700: #4338ca;
    --indigo-900: #312e81;
    --indigo-950: #1e1b4b;
    --red-700: #b91c1c;

    /* Semánticos */
    color-scheme: light dark;
    --color-page: light-dark(#ffffff, var(--slate-900));
    --color-surface: light-dark(var(--slate-100), var(--slate-800));
    --color-text: light-dark(var(--slate-900), var(--slate-100));
    --color-muted: light-dark(var(--slate-600), var(--slate-400));
    --color-border: light-dark(var(--slate-300), var(--slate-700));
    --color-accent: light-dark(var(--indigo-700), var(--indigo-300));
    --color-on-accent: light-dark(#ffffff, var(--indigo-950));
    --color-badge-bg: light-dark(var(--indigo-100), var(--indigo-900));
    --color-badge-text: light-dark(var(--indigo-900), var(--indigo-100));

    /* Escalas */
    --step--1: clamp(0.8333rem, 0.7727rem + 0.303vw, 1rem);
    --step-0: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
    --step-1: clamp(1.2rem, 1.0682rem + 0.6591vw, 1.5625rem);
    --step-2: clamp(1.44rem, 1.2534rem + 0.933vw, 1.9531rem);
    --step-3: clamp(1.728rem, 1.4686rem + 1.2971vw, 2.4414rem);
    --space-2xs: clamp(0.5rem, 0.4545rem + 0.2273vw, 0.625rem);
    --space-xs: clamp(0.75rem, 0.6818rem + 0.3409vw, 0.9375rem);
    --space-s: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
    --space-m: clamp(1.5rem, 1.3636rem + 0.6818vw, 1.875rem);
    --space-l: clamp(2rem, 1.8182rem + 0.9091vw, 2.5rem);
  }

  :root:has(input[name="theme"][value="light"]:checked) { color-scheme: light; }
  :root:has(input[name="theme"][value="dark"]:checked) { color-scheme: dark; }
}

@layer base {
  body {
    font-family: system-ui, sans-serif;
    font-size: var(--step-0);
    color: var(--color-text);
    background: var(--color-page);
  }

  h1 { font-size: var(--step-2); line-height: 1.2; }
  h2 { margin-bottom: var(--space-xs); font-size: var(--step-1); }
  a { color: var(--color-accent); }
  code { font-family: ui-monospace, Menlo, monospace; font-size: 0.85em; }
  input { accent-color: var(--color-accent); }

  :focus-visible {
    outline: 3px solid var(--color-accent);
    outline-offset: 2px;
  }
}

@layer components {
  .guide-header {
    display: grid;
    gap: var(--space-2xs);
    padding: var(--space-s);
    border-bottom: 1px solid var(--color-border);
  }

  .theme-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    font-size: var(--step--1);
  }

  .guide-header__status { color: var(--color-muted); font-size: var(--step--1); }

  .is-dark-label { display: none; }

  :root:has(input[name="theme"][value="dark"]:checked) {
    .is-light-label { display: none; }
    .is-dark-label { display: inline; }
  }

  @media (prefers-color-scheme: dark) {
    :root:has(input[name="theme"][value="system"]:checked) {
      .is-light-label { display: none; }
      .is-dark-label { display: inline; }
    }
  }

  .guide {
    display: grid;
    gap: var(--space-l);
    padding: var(--space-s);
  }

  .swatches {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(7.5rem, 1fr));
    gap: var(--space-2xs);

    li {
      display: grid;
      gap: 4px;
      font-size: var(--step--1);

      /* El color de la muestra es el propio token. */
      &::before {
        content: "";
        block-size: 3rem;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        background: var(--swatch);
      }
    }
  }

  .previews {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
    gap: var(--space-xs);
  }

  /* Cada muestra fuerza su esquema. Lo de dentro no sabe nada: lee los
     tokens de siempre. */
  .preview {
    display: grid;
    gap: var(--space-2xs);
    justify-items: start;
    padding: var(--space-s);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    background: var(--color-page);
    color: var(--color-text);

    &[data-scheme="light"] { color-scheme: light; }
    &[data-scheme="dark"] { color-scheme: dark; }
  }

  .preview__label {
    font-family: ui-monospace, Menlo, monospace;
    font-size: var(--step--1);
    color: var(--color-muted);
  }

  .muted { color: var(--color-muted); }

  .badge {
    padding: 1px 8px;
    border-radius: 999px;
    background: var(--color-badge-bg);
    color: var(--color-badge-text);
    font-size: var(--step--1);
    font-weight: 700;
  }

  .button {
    padding: 6px 16px;
    border: 0;
    border-radius: 999px;
    background: var(--color-accent);
    color: var(--color-on-accent);
    font-weight: 700;
    cursor: pointer;
  }

  .type-sample { line-height: 1.25; }
  .type-sample + .type-sample { margin-top: var(--space-2xs); }

  .spaces {
    display: grid;
    gap: 6px;

    li {
      display: flex;
      gap: var(--space-xs);
      align-items: center;
      font-size: var(--step--1);

      &::before {
        content: "";
        inline-size: var(--size);
        block-size: 1rem;
        background: var(--color-accent);
      }
    }
  }
}
```
