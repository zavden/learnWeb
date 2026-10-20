---
example_description: "La documentación de una API con avisos de tres tipos (nota, cuidado, peligro) que son un solo componente con tokens propios elegidos por data-kind, bloques de código desplazables con el teclado, código en línea y teclas, índice que se pega en pantallas anchas, :target con scroll-margin, tema con light-dark() anunciado en la página y una capa print"
example_tags: "css|profesional|arquitectura|design-tokens|componentes|light-dark|codigo|sticky|print|layer"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="doc-header">
  <p class="doc-header__brand">Agenda Clara · Desarrolladores</p>
  <p class="doc-header__theme">Tema activo: <span class="is-light-label">claro</span><span class="is-dark-label">oscuro</span></p>
</header>

<div class="doc">
  <nav class="toc" aria-labelledby="toc-title">
    <h2 id="toc-title" class="toc__title">En esta página</h2>
    <ol role="list">
      <li><a href="#autenticacion">Autenticación</a></li>
      <li><a href="#listar-citas">Listar citas</a></li>
      <li><a href="#limites">Límites</a></li>
    </ol>
  </nav>

  <main class="doc__content">
    <h1>Primeros pasos con la API de citas</h1>
    <p>La API devuelve las citas de tu consultorio en JSON. Todas las direcciones empiezan por <code>https://api.agendaclara.mx/v1</code>.</p>

    <h2 id="autenticacion">Autenticación</h2>
    <p>Envía tu clave en la cabecera <code>Authorization</code> de cada petición.</p>
    <div class="callout" data-kind="danger">
      <p class="callout__title">No publiques tu clave</p>
      <p>Quien la tenga puede leer los datos de tus pacientes. Guárdala en el servidor, nunca en el código de una página web.</p>
    </div>

    <h2 id="listar-citas">Listar citas</h2>
    <pre class="code" tabindex="0" role="region" aria-label="Ejemplo: listar las citas de un día con curl"><code>curl "https://api.agendaclara.mx/v1/citas?fecha=2026-10-24" \
  -H "Authorization: Bearer TU_CLAVE"</code></pre>
    <div class="callout" data-kind="note">
      <p class="callout__title">Fechas en tu zona</p>
      <p>Las horas llegan con su desfase, por ejemplo <code>2026-10-24T11:30:00-06:00</code>.</p>
    </div>

    <h2 id="limites">Límites</h2>
    <p>Puedes hacer 60 peticiones por minuto. En la consola de pruebas, <kbd>⌘</kbd> <kbd>Enter</kbd> repite la última.</p>
    <div class="callout" data-kind="warning">
      <p class="callout__title">Respuesta 429</p>
      <p>Si te pasas, la API responde <code>429 Too Many Requests</code>: espera los segundos que indica la cabecera <code>Retry-After</code>.</p>
    </div>
  </main>
</div>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Documentación de una API
   - Capas: reset < tokens < base < layout < components < print.
   - Los avisos son UN componente (.callout). Sus propiedades leen tokens
     de componente (--callout-bg, --callout-text, --callout-border,
     --callout-icon); data-kind solo elige qué semánticos van en cada uno.
   - El bloque de código se desplaza en horizontal y se puede enfocar con
     Tab (tabindex="0", role="region" y un nombre) para moverlo con las
     flechas.
   - Mobile-first: el índice arriba; desde 56rem, una columna pegada.
   - :target deja sitio para que el título al que se salta no quede pegado
     al borde; la capa print imprime el contenido sin índice.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, layout, components, print;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  :where(dialog, [popover]) { margin: auto; }
  body { min-height: 100dvh; line-height: 1.5; }
  h1, h2 { text-wrap: balance; }
  p { text-wrap: pretty; overflow-wrap: break-word; }
  :where(ul, ol)[role="list"] { padding: 0; list-style: none; }
  :target { scroll-margin-block: 5ex; }

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
    --color-page: light-dark(#ffffff, #0f172a);
    --color-surface-alt: light-dark(#f1f5f9, #1e293b);
    --color-text: light-dark(#0f172a, #f1f5f9);
    --color-muted: light-dark(#475569, #94a3b8);
    --color-border: light-dark(#cbd5e1, #334155);
    --color-accent: light-dark(#4338ca, #a5b4fc);

    --color-info-bg: light-dark(#e0f2fe, #082f49);
    --color-info-text: light-dark(#075985, #7dd3fc);
    --color-warning-bg: light-dark(#fef3c7, #422006);
    --color-warning-text: light-dark(#92400e, #fcd34d);
    --color-danger-bg: light-dark(#fee2e2, #450a0a);
    --color-danger-text: light-dark(#991b1b, #fca5a5);

    --font-code: ui-monospace, "SF Mono", Menlo, monospace;
    --radius-8: 8px;
  }
}

@layer base {
  body {
    font-family: system-ui, sans-serif;
    color: var(--color-text);
    background: var(--color-page);
  }

  h1 { font-size: 1.6rem; line-height: 1.2; }
  h2 { font-size: 1.2rem; }
  a { color: var(--color-accent); }

  code,
  kbd { font-family: var(--font-code); font-size: 0.9em; }

  :where(p, li) code {
    padding: 0.1em 0.3em;
    border-radius: 4px;
    background: var(--color-surface-alt);
    overflow-wrap: anywhere;
  }

  kbd {
    padding: 0 0.35em;
    border: 1px solid var(--color-muted);
    border-bottom-width: 2px;
    border-radius: 4px;
  }

  :focus-visible {
    outline: 3px solid var(--color-accent);
    outline-offset: 2px;
  }
}

@layer layout {
  .doc {
    display: grid;
    gap: 16px;
    padding: 16px;
  }

  @media (width >= 56rem) {
    .doc {
      grid-template-columns: 13rem minmax(0, 46rem);
      align-items: start;
    }

    .toc {
      position: sticky;
      top: 16px;
    }
  }
}

@layer components {
  .doc-header {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 16px;
    justify-content: space-between;
    padding: 10px 16px;
    border-bottom: 1px solid var(--color-border);
    font-size: 0.85rem;
  }

  .doc-header__brand { font-weight: 800; }
  .doc-header__theme { color: var(--color-muted); }

  .is-dark-label { display: none; }

  @media (prefers-color-scheme: dark) {
    .is-light-label { display: none; }
    .is-dark-label { display: inline; }
  }

  .toc {
    padding: 12px;
    border-radius: var(--radius-8);
    background: var(--color-surface-alt);
    font-size: 0.9rem;

    ol { display: grid; gap: 4px; counter-reset: section; }

    li {
      counter-increment: section;

      &::before { content: counter(section) ". "; color: var(--color-muted); }
    }
  }

  .toc__title {
    margin-bottom: 6px;
    color: var(--color-muted);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .doc__content {
    display: grid;
    gap: 12px;
    min-width: 0;

    > h2 { margin-top: 12px; }

    > h2:target { color: var(--color-accent); }
  }

  .code {
    overflow-x: auto;
    padding: 12px 14px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-8);
    background: var(--color-surface-alt);
    font-size: 0.85rem;
    line-height: 1.6;
    tab-size: 2;
  }

  /* Un componente, tres tipos: data-kind solo elige tokens. */
  .callout {
    --callout-bg: var(--color-info-bg);
    --callout-text: var(--color-info-text);
    --callout-icon: "i";

    display: grid;
    gap: 2px;
    padding: 10px 14px;
    border-inline-start: 4px solid var(--callout-text);
    border-radius: var(--radius-8);
    background: var(--callout-bg);
    font-size: 0.9rem;

    &[data-kind="warning"] {
      --callout-bg: var(--color-warning-bg);
      --callout-text: var(--color-warning-text);
      --callout-icon: "!";
    }

    &[data-kind="danger"] {
      --callout-bg: var(--color-danger-bg);
      --callout-text: var(--color-danger-text);
      --callout-icon: "×";
    }

    code { background: var(--color-page); }
  }

  .callout__title {
    display: flex;
    gap: 8px;
    align-items: center;
    color: var(--callout-text);
    font-weight: 700;

    /* El icono es decorativo: el título ya dice de qué tipo es el aviso.
       Lo que va tras la barra es el texto alternativo, vacío. */
    &::before {
      content: var(--callout-icon) / "";
      display: grid;
      place-items: center;
      width: 1.3em;
      aspect-ratio: 1;
      border-radius: 50%;
      background: var(--callout-text);
      color: var(--callout-bg);
      font-size: 0.8em;
    }
  }
}

@layer print {
  @media print {
    @page { margin: 2cm; }
    :root { color-scheme: light; }
    body { font-size: 10.5pt; }
    .doc-header, .toc { display: none; }
    .doc { display: block; padding: 0; }
    .code { overflow: visible; white-space: pre-wrap; border-color: #000000; }
    .callout, .code { break-inside: avoid; }
    h2 { break-after: avoid; }
  }
}
```
