---
example_description: "El centro de ayuda de un servicio de bicicletas públicas: buscador con su etiqueta oculta, temas en una fila .cluster, preguntas en <details name> que se abren hasta height: auto gracias al interpolate-size del reset (solo con movimiento permitido; con «reducir», la red de seguridad), tema con light-dark() anunciado y una capa print que imprime todas las respuestas, también las cerradas"
example_tags: "css|profesional|arquitectura|details|interpolate-size|reset|prefers-reduced-motion|light-dark|print|layer"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="help-header">
  <h1>Centro de ayuda de BiciRuta</h1>
  <p class="help-header__theme">Tema activo: <span class="is-light-label">claro</span><span class="is-dark-label">oscuro</span></p>
  <form class="search" role="search" action="/ayuda/buscar">
    <label class="visually-hidden" for="q">Buscar en la ayuda</label>
    <input id="q" name="q" type="search" placeholder="Por ejemplo: perdí mi tarjeta">
    <button class="search__button" type="submit">Buscar</button>
  </form>
</header>

<main class="help">
  <nav aria-label="Temas">
    <ul class="cluster" role="list">
      <li><a class="chip" href="/ayuda/cuenta">Cuenta y pagos</a></li>
      <li><a class="chip" href="/ayuda/estaciones">Estaciones</a></li>
      <li><a class="chip" href="/ayuda/averias">Averías</a></li>
      <li><a class="chip" href="/ayuda/seguridad">Seguridad vial</a></li>
    </ul>
  </nav>

  <section class="faq" aria-labelledby="faq-title">
    <h2 id="faq-title">Preguntas frecuentes</h2>
    <details class="faq__item" name="faq" open>
      <summary>¿Cuánto tiempo puedo usar una bici en cada viaje?</summary>
      <p>Hasta 45 minutos por viaje con la suscripción anual. Pasado ese tiempo, cada 30 minutos extra cuestan $15.</p>
    </details>
    <details class="faq__item" name="faq">
      <summary>¿Qué hago si la estación está llena?</summary>
      <p>Acerca la tarjeta a la pantalla de la estación: te da 15 minutos extra sin costo y te dice cuál es la estación con lugares más cercana.</p>
    </details>
    <details class="faq__item" name="faq">
      <summary>Perdí mi tarjeta, ¿cómo la bloqueo?</summary>
      <p>Entra en tu cuenta, ve a «Tarjeta» y pulsa «Bloquear». La reposición llega en cinco días hábiles.</p>
    </details>
  </section>

  <aside class="contact" aria-labelledby="contact-title">
    <h2 id="contact-title">¿No encuentras la respuesta?</h2>
    <p>Atención por chat todos los días de 6:00 a 23:00. <a href="/ayuda/contacto">Escríbenos</a></p>
  </aside>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Centro de ayuda
   - El reset activa interpolate-size: allow-keywords SOLO con
     prefers-reduced-motion: no-preference; con eso, el contenido de cada
     <details> (::details-content, Chrome 131+) se anima hasta height: auto.
     Con «reducir movimiento», la red de seguridad deja la transición en
     0.01ms: se abre al instante y los eventos siguen llegando.
   - <details name="faq">: un acordeón exclusivo sin JavaScript.
   - El buscador tiene una etiqueta real, oculta con .visually-hidden
     (utilidad en la última capa); el placeholder no es una etiqueta.
   - Capa print: ningún buscador ni tema, y TODAS las respuestas, también
     las cerradas (content-visibility: visible en ::details-content).
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components, utilities, print;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  :where(dialog, [popover]) { margin: auto; }
  body { min-height: 100dvh; line-height: 1.5; }
  input, button { font: inherit; }
  h1, h2 { text-wrap: balance; }
  p { text-wrap: pretty; }
  :where(ul, ol)[role="list"] { padding: 0; list-style: none; }

  @media (prefers-reduced-motion: no-preference) {
    html { interpolate-size: allow-keywords; }
  }

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
    --color-control: light-dark(#64748b, #94a3b8);
    --color-accent: light-dark(#15803d, #86efac);
    --color-accent-soft: light-dark(#dcfce7, #052e16);
    --color-accent-strong: light-dark(#14532d, #bbf7d0);
    --color-on-accent: light-dark(#ffffff, #052e16);
    --duration-open: 250ms;
  }
}

@layer base {
  body {
    font-family: system-ui, sans-serif;
    color: var(--color-text);
    background: var(--color-page);
  }

  h1 { font-size: 1.4rem; line-height: 1.2; }
  h2 { font-size: 1.1rem; }
  a { color: var(--color-accent-strong); }

  :focus-visible {
    outline: 3px solid var(--color-accent);
    outline-offset: 2px;
  }
}

@layer components {
  .help-header {
    display: grid;
    gap: 8px;
    padding: 16px;
    background: var(--color-accent-soft);
  }

  .help-header__theme { color: var(--color-muted); font-size: 0.8rem; }

  .is-dark-label { display: none; }

  @media (prefers-color-scheme: dark) {
    .is-light-label { display: none; }
    .is-dark-label { display: inline; }
  }

  .search {
    display: flex;
    gap: 8px;

    input {
      flex: 1 1 10rem;
      min-width: 0;
      padding: 8px 12px;
      border: 1px solid var(--color-control);
      border-radius: 999px;
      background: var(--color-surface);
      color: var(--color-text);
    }
  }

  .search__button {
    padding: 8px 16px;
    border: 0;
    border-radius: 999px;
    background: var(--color-accent);
    color: var(--color-on-accent);
    font-weight: 700;
    cursor: pointer;
  }

  .help {
    display: grid;
    gap: 20px;
    max-width: 40rem;
    padding: 16px;
  }

  .chip {
    display: inline-block;
    padding: 4px 12px;
    border: 1px solid var(--color-control);
    border-radius: 999px;
    color: var(--color-text);
    font-size: 0.85rem;
    text-decoration: none;

    &:hover { border-color: var(--color-accent); }
  }

  .faq { display: grid; gap: 8px; }

  .faq__item {
    border: 1px solid var(--color-border);
    border-radius: 10px;
    background: var(--color-surface);

    summary {
      padding: 10px 14px;
      font-weight: 700;
      cursor: pointer;

      &::marker { color: var(--color-accent); }
    }

    p {
      padding: 0 14px 12px;
      color: var(--color-muted);
    }

    /* La caja del contenido: de 0 a auto. content-visibility entra en la
       transición (allow-discrete) para que el texto no desaparezca antes
       de terminar de cerrarse. */
    &::details-content {
      block-size: 0;
      overflow: clip;
      transition: block-size var(--duration-open), content-visibility var(--duration-open) allow-discrete;
    }

    &[open]::details-content { block-size: auto; }

    &[open] { border-color: var(--color-accent); }
  }

  .contact {
    display: grid;
    gap: 4px;
    padding: 14px;
    border-radius: 10px;
    background: var(--color-accent-soft);
  }
}

@layer utilities {
  .cluster { display: flex; flex-wrap: wrap; gap: 8px; }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}

@layer print {
  @media print {
    @page { margin: 2cm; }
    :root { color-scheme: light; }
    body { font-size: 11pt; }
    .search, .help-header__theme, nav { display: none; }
    .help-header, .contact { background: none; padding: 0; }

    /* Todas las respuestas, también las de los <details> cerrados. */
    .faq__item::details-content {
      content-visibility: visible;
      block-size: auto;
    }

    .faq__item { break-inside: avoid; border-color: #000000; }
  }
}
```
