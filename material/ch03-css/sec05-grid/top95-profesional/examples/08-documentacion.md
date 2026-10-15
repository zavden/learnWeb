---
example_description: "La documentación de una API: cabecera en tres columnas, menú y contenido que se apilan, índice «En esta página» sticky, avisos con icono a lo alto de dos filas, tabla de parámetros con subgrid y enlaces de anterior/siguiente en auto-fit"
example_tags: "css|profesional|grid|flexbox|subgrid|sticky|minmax|documentacion"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="docs-header">
  <a class="logo" href="/docs">Riego Listo <span>API</span></a>
  <form class="search" role="search" action="/docs/buscar">
    <input type="search" name="q" aria-label="Buscar en la documentación" placeholder="Buscar…">
  </form>
  <label class="version">Versión
    <select name="version"><option>v2</option><option>v1</option></select>
  </label>
</header>

<div class="docs-layout">
  <nav class="docs-nav" aria-label="Documentación">
    <p class="nav-group">Primeros pasos</p>
    <ul>
      <li><a href="/docs/instalar">Instalar el controlador</a></li>
      <li><a href="/docs/claves">Claves de acceso</a></li>
    </ul>
    <p class="nav-group">Referencia</p>
    <ul>
      <li><a href="/docs/zonas">Zonas</a></li>
      <li><a href="/docs/programas" aria-current="page">Programas de riego</a></li>
      <li><a href="/docs/sensores">Sensores</a></li>
    </ul>
  </nav>

  <div class="docs-main">
    <article class="doc">
      <p class="crumbs">Referencia / Programas de riego</p>
      <h1>Programas de riego</h1>
      <p class="lead">Un programa abre una zona a una hora y durante unos minutos. Cada zona admite hasta cuatro programas al día.</p>

      <h2 id="crear">Crear un programa</h2>
      <figure class="code">
        <figcaption>POST /api/v2/zonas/{zona}/programas</figcaption>
        <pre><code>curl -X POST https://riego.local/api/v2/zonas/jardin-trasero/programas -H "Authorization: Bearer $CLAVE" --data '{"inicio":"06:30","minutos":12,"dias":["lun","mie","vie"]}'</code></pre>
      </figure>

      <div class="callout" role="note">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 7v6M12 16v1"/></svg>
        <p class="callout-title">Programas que se solapan</p>
        <p>Si dos programas de la misma zona coinciden, el controlador ejecuta el primero y pospone el segundo hasta que termine.</p>
      </div>

      <h2 id="parametros">Parámetros</h2>
      <dl class="params">
        <div><dt><code>inicio</code></dt><dd class="type">texto</dd><dd>Hora de inicio en formato 24 h, en la zona horaria del controlador.</dd></div>
        <div><dt><code>minutos</code></dt><dd class="type">número</dd><dd>Duración, de 1 a 60.</dd></div>
        <div><dt><code>dias</code></dt><dd class="type">lista</dd><dd>Días de la semana (<code>lun</code>…<code>dom</code>). Si falta, todos.</dd></div>
      </dl>

      <h2 id="respuestas">Respuestas</h2>
      <p><code>201</code> si el programa se creó; <code>409</code> si la zona ya tiene cuatro programas.</p>

      <nav class="pager" aria-label="Más páginas">
        <a href="/docs/zonas"><span>Anterior</span> Zonas</a>
        <a class="is-next" href="/docs/sensores"><span>Siguiente</span> Sensores</a>
      </nav>
    </article>

    <nav class="toc" aria-label="En esta página">
      <p>En esta página</p>
      <ul>
        <li><a href="#crear">Crear un programa</a></li>
        <li><a href="#parametros">Parámetros</a></li>
        <li><a href="#respuestas">Respuestas</a></li>
      </ul>
    </nav>
  </div>
</div>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Documentación
   - Cabecera: una fila de tres columnas (logo y versión a su medida, buscador
     con el resto, sin mínimo automático).
   - Menú | contenido, y dentro, artículo | índice: dos niveles del patrón de
     barra lateral que se apila (flexbox). El índice va DESPUÉS del artículo en
     el HTML: es un atajo, no contenido. Es sticky y lleva align-self:
     flex-start para tener recorrido.
   - Dentro del artículo, grid: el aviso (icono a lo alto de dos filas), la
     tabla de parámetros (subgrid) y anterior/siguiente (auto-fit).
   - El artículo tiene min-width: 0 (es un elemento flex): así el bloque de
     código se desplaza en lugar de ensanchar la página.
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

  input,
  select {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --color-text: #0f172a;
    --color-muted: #475569;
    --color-line: #e2e8f0;
    --color-soft: #f8fafc;
    --color-brand: #0f766e;
    --color-brand-dark: #134e4a;
    --color-code-bg: #0f172a;
    --color-code: #e2e8f0;
    --color-note: #eff6ff;
    --color-note-edge: #1d4ed8;
    --color-focus: #1d4ed8;

    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
  }
}

@layer base {
  body {
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.55;
  }

  a {
    color: var(--color-brand-dark);
  }

  code {
    font-size: 0.9em;
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  /* ─── Cabecera: tres columnas ─── */
  .docs-header {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--color-line);
  }

  .logo {
    color: var(--color-text);
    font-weight: 800;
    text-decoration: none;
  }

  .logo span {
    color: var(--color-brand);
  }

  .search input {
    width: 100%;
    max-width: 22rem;
    padding: var(--space-1) var(--space-3);
    border: 1px solid #64748b;
    border-radius: 999px;
  }

  .version {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  /* ─── Menú y contenido ─── */
  .docs-layout {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: var(--space-6);
    max-width: 72rem;
    margin-inline: auto;
    padding: var(--space-4);
  }

  .docs-nav {
    flex: 1 1 11rem;
    font-size: 0.9rem;
  }

  .nav-group {
    margin: var(--space-3) 0 var(--space-1);
    color: var(--color-muted);
    font-size: 0.75rem;
    font-weight: 700;
  }

  .docs-nav ul {
    padding: 0;
    list-style: none;
  }

  .docs-nav a {
    display: block;
    padding: var(--space-1) var(--space-2);
    border-left: 2px solid var(--color-line);
    color: var(--color-text);
    text-decoration: none;
  }

  .docs-nav [aria-current="page"] {
    border-left-color: var(--color-brand);
    color: var(--color-brand-dark);
    font-weight: 700;
  }

  .docs-main {
    display: flex;
    flex: 999 1 22rem;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: var(--space-6);
    min-width: 0;
  }

  .doc {
    display: grid;
    flex: 999 1 20rem;
    gap: var(--space-3);
    min-width: 0;
  }

  /* El índice: sticky, a su medida (sin estirarse), al lado o debajo. */
  .toc {
    position: sticky;
    top: var(--space-4);
    flex: 1 1 10rem;
    align-self: flex-start;
    padding-left: var(--space-3);
    border-left: 2px solid var(--color-line);
    font-size: 0.85rem;
  }

  .toc p {
    font-weight: 700;
  }

  .toc ul {
    padding: 0;
    list-style: none;
  }

  /* ─── Artículo ─── */
  .crumbs {
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  .doc h1 {
    font-size: clamp(1.5rem, 1.1rem + 2vw, 2.1rem);
    line-height: 1.15;
  }

  .lead {
    color: var(--color-muted);
    font-size: 1.05rem;
  }

  .doc h2 {
    margin-top: var(--space-4);
    font-size: 1.2rem;
  }

  .code {
    overflow: hidden;
    border-radius: 8px;
    background: var(--color-code-bg);
    color: var(--color-code);
  }

  .code figcaption {
    padding: var(--space-1) var(--space-3);
    border-bottom: 1px solid #334155;
    font-family: ui-monospace, monospace;
    font-size: 0.75rem;
  }

  .code pre {
    padding: var(--space-3);
    overflow-x: auto;
    font-size: 0.8rem;
  }

  /* Aviso: icono a lo alto de las dos filas (título y texto). */
  .callout {
    display: grid;
    grid-template-columns: 1.5rem minmax(0, 1fr);
    column-gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-left: 4px solid var(--color-note-edge);
    border-radius: 0 8px 8px 0;
    background: var(--color-note);
  }

  .callout svg {
    grid-row: span 2;
    width: 1.5rem;
    fill: none;
    stroke: var(--color-note-edge);
    stroke-width: 2;
    stroke-linecap: round;
  }

  .callout-title {
    font-weight: 700;
  }

  /* Parámetros: tres columnas en el dl; cada fila las hereda con subgrid. */
  .params {
    display: grid;
    grid-template-columns: max-content max-content minmax(0, 1fr);
    column-gap: var(--space-4);
    border-top: 1px solid var(--color-line);
    font-size: 0.9rem;
  }

  .params div {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--color-line);
  }

  .params dd {
    margin: 0;
  }

  .params .type {
    color: var(--color-muted);
  }

  /* Anterior y siguiente: dos tarjetas que se apilan si no caben. */
  .pager {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr));
    gap: var(--space-3);
    margin-top: var(--space-6);
  }

  .pager a {
    padding: var(--space-3);
    border: 1px solid var(--color-line);
    border-radius: 8px;
    font-weight: 700;
    text-decoration: none;
  }

  .pager a span {
    display: block;
    color: var(--color-muted);
    font-size: 0.75rem;
    font-weight: 400;
  }

  .pager .is-next {
    text-align: right;
  }
}
```
