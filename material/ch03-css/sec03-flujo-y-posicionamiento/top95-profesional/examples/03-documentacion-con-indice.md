---
example_description: "Una página de documentación con cabecera sticky, un índice «En esta página» también sticky que se despliega encima del contenido, anclas que no quedan tapadas, avisos con iconos posicionados y bloques de código con su etiqueta en la esquina"
example_tags: "css|profesional|sticky|z-index|scroll-padding|target|position"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="site-header">
  <a class="brand" href="#">Reservas<span class="brand-api">API</span></a>
  <span class="version">v2.3</span>
</header>

<main class="doc">
  <h1 class="doc-title">Guía rápida de la API de reservas</h1>
  <p class="doc-lede">Cómo autenticarte, crear tu primera reserva y qué hacer cuando algo sale mal.</p>

  <details class="toc">
    <summary>En esta página</summary>
    <ol class="toc-list">
      <li><a href="#auth">Autenticación</a></li>
      <li><a href="#create">Crear una reserva</a></li>
      <li><a href="#errors">Errores</a></li>
      <li><a href="#limits">Límites de uso</a></li>
    </ol>
  </details>

  <section class="doc-section" id="auth">
    <h2><a class="anchor" href="#auth" aria-label="Enlace a esta sección">#</a>Autenticación</h2>
    <p>Todas las peticiones llevan tu clave en la cabecera <code>Authorization</code>. Encontrarás la clave en el panel, en <strong>Ajustes → Claves</strong>.</p>
    <div class="code"><span class="code-lang">HTTP</span><pre><code>GET /v2/pistas HTTP/1.1
Host: api.reservas.example
Authorization: Bearer rk_live_4f9c2a7e81b3</code></pre></div>
    <aside class="callout callout--warning"><p><strong>Cuidado:</strong> no publiques tu clave en el código del navegador. Haz las peticiones desde tu servidor.</p></aside>
  </section>

  <section class="doc-section" id="create">
    <h2><a class="anchor" href="#create" aria-label="Enlace a esta sección">#</a>Crear una reserva</h2>
    <p>Envía un <code>POST</code> con la pista, el día y la hora de inicio. Las reservas duran una hora.</p>
    <div class="code"><span class="code-lang">JSON</span><pre><code>{
  "pista": "padel-2",
  "fecha": "2026-10-15",
  "hora": "18:00"
}</code></pre></div>
    <aside class="callout"><p><strong>Consejo:</strong> la respuesta incluye un <code>id</code>; guárdalo para poder cancelar la reserva más tarde.</p></aside>
  </section>

  <section class="doc-section" id="errors">
    <h2><a class="anchor" href="#errors" aria-label="Enlace a esta sección">#</a>Errores</h2>
    <p>Los errores devuelven un código HTTP y un objeto con un mensaje legible. El más habitual es <code>409</code>: la pista ya estaba reservada a esa hora.</p>
    <div class="code"><span class="code-lang">JSON</span><pre><code>{ "error": "pista_ocupada", "mensaje": "La pista padel-2 ya está reservada a las 18:00." }</code></pre></div>
  </section>

  <section class="doc-section" id="limits">
    <h2><a class="anchor" href="#limits" aria-label="Enlace a esta sección">#</a>Límites de uso</h2>
    <p>Puedes hacer 60 peticiones por minuto con cada clave. Si te pasas, recibirás un <code>429</code> con la cabecera <code>Retry-After</code>, que indica cuántos segundos esperar.</p>
    <p>Cada cuenta puede tener a la vez un máximo de diez reservas futuras.</p>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Documentación con índice sticky
   - Dos barras sticky apiladas: la cabecera (top: 0) y el índice «En esta
     página» (top: altura de la cabecera). El índice es un details: al abrirlo,
     su lista se despliega con position: absolute encima del contenido.
   - scroll-padding-top: las anclas y el foco quedan por debajo de las barras.
   - Avisos con el icono en el hueco del relleno (absolute) y bloques de código
     con su etiqueta en la esquina y scroll horizontal propio.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  * {
    margin: 0;
  }
}

@layer tokens {
  :root {
    --color-bg: #ffffff;
    --color-surface: #f8fafc;
    --color-text: #1e293b;
    --color-text-muted: #475569;
    --color-border: #e2e8f0;
    --color-brand: #4338ca;
    --color-code-bg: #0f172a;
    --color-code-text: #e2e8f0;

    --header-h: 3rem;
    --toc-h: 2.75rem;
    --measure: 46rem;

    --z-sticky: 200;
    --z-dropdown: 210;                  /* el índice abierto, por encima de la cabecera */
  }
}

@layer base {
  html {
    scroll-padding-top: calc(var(--header-h) + var(--toc-h) + 1rem);
  }

  body {
    background: var(--color-bg);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.6;
  }

  :where(a) {
    color: var(--color-brand);
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-brand);
    outline-offset: 2px;
  }

  :where(code) {
    font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    font-size: 0.9em;
  }

  :where(p code) {
    padding: 0.05em 0.3em;
    border-radius: 4px;
    background: #eef2ff;
  }
}

@layer components {
  /* ─── Cabecera sticky ─── */
  .site-header {
    position: sticky;
    top: 0;
    z-index: var(--z-sticky);
    height: var(--header-h);
    padding-inline: clamp(1rem, 4vw, 2rem);
    background: var(--color-brand);
    color: #ffffff;
    line-height: var(--header-h);
  }

  .brand {
    color: #ffffff;
    font-weight: 800;
    text-decoration: none;
  }

  /* Una etiqueta pegada al logotipo: inline-block, alineada con el centro de las minúsculas. */
  .brand-api {
    display: inline-block;
    margin-left: 0.3rem;
    padding: 0 0.35rem;
    border: 1px solid #c7d2fe;
    border-radius: 4px;
    font-size: 0.7rem;
    line-height: 1.4;
    vertical-align: middle;
  }

  .version {
    margin-left: 0.5rem;
    color: #e0e7ff;
    font-size: 0.875rem;
  }

  .doc {
    width: min(100% - 2rem, var(--measure));
    margin: 1.5rem auto 4rem;
  }

  .doc-title {
    font-size: clamp(1.6rem, 5vw, 2.2rem);
    line-height: 1.2;
  }

  .doc-lede {
    margin-block: 0.5rem 1rem;
    color: var(--color-text-muted);
    font-size: 1.1rem;
  }

  /* ─── Índice sticky, justo debajo de la cabecera ───
     Su padre es .doc, que mide toda la página: tiene recorrido para pegarse.
     Al abrirlo, la lista es absolute: flota sobre el contenido sin empujarlo. */
  .toc {
    position: sticky;
    top: var(--header-h);
    z-index: var(--z-dropdown);
    height: var(--toc-h);
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--color-border);
    background: #ffffff;
  }

  .toc summary {
    line-height: var(--toc-h);
    font-weight: 600;
    cursor: pointer;
  }

  .toc-list {
    position: absolute;
    top: 100%;
    left: 0;
    width: min(100%, 18rem);
    margin: 0;
    padding: 0.5rem 0.5rem 0.5rem 2rem;
    border: 1px solid var(--color-border);
    border-radius: 0 0 8px 8px;
    background: #ffffff;
    box-shadow: 0 10px 24px rgb(15 23 42 / 0.15);
  }

  .toc-list a {
    display: block;
    padding-block: 0.15rem;
  }

  /* ─── Secciones ─── */
  .doc-section {
    margin-bottom: 2.5rem;
  }

  .doc-section > p {
    margin-bottom: 1rem;
  }

  /* El título es la referencia de su enlace «#», que se coloca en el margen izquierdo
     (desplazamiento negativo) y solo se ve al pasar el ratón o con el foco. */
  .doc-section h2 {
    position: relative;
    margin-bottom: 0.5rem;
    padding: 0.1rem 0.4rem;
    border-radius: 6px;
    font-size: 1.4rem;
  }

  .anchor {
    position: absolute;
    right: 100%;
    padding-right: 0.3rem;
    color: transparent;                  /* invisible, pero sigue ahí para el teclado */
    text-decoration: none;
  }

  .doc-section h2:hover .anchor,
  .anchor:focus-visible {
    color: var(--color-text-muted);
  }

  /* La sección enlazada desde la URL se resalta. */
  .doc-section:target h2 {
    background: #fef9c3;
  }

  /* ─── Bloques de código ───
     El envoltorio es la referencia de la etiqueta del lenguaje (arriba a la derecha);
     el pre tiene su propio scroll horizontal para las líneas largas. */
  .code {
    position: relative;
    margin-bottom: 1rem;
  }

  .code-lang {
    position: absolute;
    top: 0.4rem;
    right: 0.6rem;
    color: #94a3b8;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .code pre {
    overflow-x: auto;
    padding: 1.6rem 1rem 1rem;
    border-radius: 8px;
    background: var(--color-code-bg);
    color: var(--color-code-text);
    line-height: 1.5;
  }

  /* ─── Avisos: el icono en el hueco del relleno, centrado en la primera línea ─── */
  .callout {
    position: relative;
    margin-bottom: 1rem;
    padding: 0.75rem 1rem 0.75rem 2.75rem;
    border-left: 4px solid var(--color-brand);
    border-radius: 0 8px 8px 0;
    background: #eef2ff;
  }

  .callout::before {
    content: "";
    position: absolute;
    top: calc(0.75rem + (1lh - 1.25rem) / 2);
    left: 0.9rem;
    width: 1.25rem;
    height: 1.25rem;
    background: url("icon-info.svg") center / contain no-repeat;
  }

  .callout--warning {
    border-left-color: #b45309;
    background: #fffbeb;
  }

  .callout--warning::before {
    background-image: url("icon-warning.svg");
  }
}
```
