---
example_description: "Página de documentación técnica: índice y secciones numerados con contadores, sección activa con :target, anclas por título, avisos con atributos y bloques de código"
example_tags: "css|profesional|documentacion|target|contadores"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="docs-header">
  <p class="product">Brisa CLI <span class="version">v2.3</span></p>
  <h1>Guía de inicio</h1>
  <p class="lead">Instala la herramienta, crea tu primer proyecto y publícalo en menos de diez minutos.</p>
</header>

<nav class="toc" aria-labelledby="toc-title">
  <h2 id="toc-title">En esta página</h2>
  <ol>
    <li><a href="#install">Instalación</a></li>
    <li><a href="#first-project">Tu primer proyecto</a></li>
    <li><a href="#commands">Comandos principales</a></li>
    <li><a href="#troubleshooting">Solución de problemas</a></li>
  </ol>
</nav>

<main class="docs">
  <section id="install">
    <h2>Instalación <a class="anchor" href="#install" aria-label="Enlace a la sección Instalación">#</a></h2>
    <p>Brisa necesita Node.js 20 o posterior. Descárgalo desde la <a href="https://nodejs.org">web oficial de Node.js</a> y después ejecuta:</p>
    <pre><code>npm install --global brisa-cli</code></pre>
    <div class="callout" data-type="note">
      <p><strong>Nota:</strong> en macOS y Linux quizá necesites permisos de administrador para instalar paquetes globales.</p>
    </div>
  </section>

  <section id="first-project">
    <h2>Tu primer proyecto <a class="anchor" href="#first-project" aria-label="Enlace a la sección Tu primer proyecto">#</a></h2>
    <p>Crea una carpeta con la plantilla básica y arranca el servidor de desarrollo:</p>
    <pre><code>brisa new mi-web
cd mi-web
brisa dev</code></pre>
    <p>Para detener el servidor, pulsa <kbd>Ctrl</kbd> + <kbd>C</kbd> en la terminal.</p>
  </section>

  <section id="commands">
    <h2>Comandos principales <a class="anchor" href="#commands" aria-label="Enlace a la sección Comandos principales">#</a></h2>
    <table>
      <caption>Comandos más usados</caption>
      <thead>
        <tr><th scope="col">Comando</th><th scope="col">Qué hace</th></tr>
      </thead>
      <tbody>
        <tr><td><code>brisa new &lt;nombre&gt;</code></td><td>Crea un proyecto a partir de la plantilla.</td></tr>
        <tr><td><code>brisa dev</code></td><td>Arranca un servidor local que recarga al guardar.</td></tr>
        <tr><td><code>brisa build</code></td><td>Genera la versión optimizada en la carpeta <code>dist/</code>.</td></tr>
        <tr><td><code>brisa deploy</code></td><td>Publica la carpeta <code>dist/</code>.</td></tr>
      </tbody>
    </table>
  </section>

  <section id="troubleshooting">
    <h2>Solución de problemas <a class="anchor" href="#troubleshooting" aria-label="Enlace a la sección Solución de problemas">#</a></h2>
    <p>Si <code>brisa dev</code> indica que el puerto está ocupado, cierra el otro servidor o elige otro puerto con <code>brisa dev --port 3001</code>.</p>
    <div class="callout" data-type="warning">
      <p><strong>Advertencia:</strong> <code>brisa deploy</code> sobrescribe la versión publicada. Revisa antes los <a href="#commands">comandos</a> y ejecuta <code>brisa build</code>.</p>
    </div>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Página de documentación
   - Numeración: el índice es un <ol> (números del navegador) y las secciones
     se numeran con un contador; los dos coinciden porque siguen el mismo orden.
   - :target resalta la sección a la que lleva el enlace, sin JavaScript.
   - Avisos: una sola regla .callout; el tipo (data-type) solo cambia --tone.
   Nota: las propiedades de caja y de texto se usan de forma básica.
   ────────────────────────────────────────────────────────────────────────── */
@layer tokens, base, docs;

@layer tokens {
  :root {
    --color-bg: oklch(98.5% 0.005 260);
    --color-surface: oklch(96% 0.01 260);
    --color-border: oklch(85% 0.02 260);
    --color-text: oklch(25% 0.03 260);
    --color-text-muted: oklch(45% 0.03 260);
    --color-brand: oklch(50% 0.18 260);
    --color-note: oklch(50% 0.18 260);
    --color-warning: oklch(55% 0.13 70);
    --font-ui: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    --font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    --radius: 0.375rem;
    --content-width: 46rem;
  }
}

@layer base {
  body {
    margin: 0;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-ui);
    line-height: 1.6;
  }

  :where(a) {
    color: var(--color-brand);
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-brand);
    outline-offset: 2px;
  }

  :where(code, kbd, pre) {
    font-family: var(--font-mono);
    font-size: 0.9em;
  }

  :where(:not(pre) > code) {
    background: var(--color-surface);
    padding: 0.1em 0.3em;
    border-radius: 0.25rem;
  }

  :where(kbd) {
    border: 1px solid var(--color-border);
    border-bottom-width: 2px;
    border-radius: 0.25rem;
    padding: 0 0.35em;
    background: #ffffff;
  }

  :where(table) {
    border-collapse: collapse;
  }

  :where(caption) {
    text-align: start;
    color: var(--color-text-muted);
    padding-block: 0.25rem;
  }

  :where(th, td) {
    text-align: start;
    padding: 0.45rem 0.75rem;
    border-bottom: 1px solid var(--color-border);
  }
}

@layer docs {
  .docs-header,
  .toc,
  .docs {
    max-width: var(--content-width);
    margin-inline: auto;
    padding-inline: 1rem;
  }

  .docs-header {
    padding-block: 1.5rem 0.5rem;
  }

  .docs-header h1 {
    margin: 0;
    line-height: 1.2;
  }

  .product {
    margin: 0;
    font-weight: 700;
    color: var(--color-text-muted);
  }

  .version {
    font-family: var(--font-mono);
    font-size: 0.8em;
    font-weight: 400;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 999px;
    padding: 0 0.5em;
  }

  .lead {
    color: var(--color-text-muted);
    font-size: 1.125rem;
  }

  /* Índice */
  .toc {
    border-top: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
  }

  .toc h2 {
    font-size: 0.875rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .toc li::marker {
    color: var(--color-text-muted);
    font-weight: 700;
  }

  /* Secciones numeradas con un contador */
  .docs {
    counter-reset: section;
  }

  .docs section {
    counter-increment: section;
    border-left: 4px solid transparent;
    padding-inline-start: 1rem;
    margin-block: 1.5rem;
  }

  .docs h2 {
    line-height: 1.25;
    margin-block: 0.5em;
  }

  .docs h2::before {
    content: counter(section) ". ";
    color: var(--color-text-muted);
  }

  /* La sección a la que apunta la URL */
  .docs section:target {
    border-left-color: var(--color-brand);
    background: color-mix(in oklch, var(--color-brand) 5%, white);
  }

  /* Ancla de cada título: discreta, y en color al pasar o al enfocarla */
  .anchor {
    color: var(--color-text-muted);
    text-decoration: none;
    font-weight: 400;
  }

  .docs h2:hover .anchor,
  .anchor:focus-visible {
    color: var(--color-brand);
  }

  /* Enlaces externos: flecha decorativa, con texto alternativo para lectores de pantalla */
  .docs a[href^="http"]::after {
    content: " ↗" / " (sitio externo)";
  }

  .docs pre {
    background: oklch(22% 0.02 260);
    color: oklch(93% 0.01 260);
    border-radius: var(--radius);
    padding: 1rem;
    overflow-x: auto;                   /* el código largo se desplaza (modelo de cajas) */
  }

  /* Avisos: una regla para todos; el tipo solo cambia --tone */
  .callout {
    --tone: var(--color-note);
    border-left: 4px solid var(--tone);
    background: color-mix(in oklch, var(--tone) 8%, white);
    border-radius: 0 var(--radius) var(--radius) 0;
    padding: 0.25rem 1rem;
  }

  .callout[data-type="warning"] {
    --tone: var(--color-warning);
  }

  .callout strong {
    color: color-mix(in oklch, var(--tone) 70%, black);
  }
}
```
