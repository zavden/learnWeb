---
example_description: "Una página de documentación técnica: pila monoespaciada con font-size-adjust para que el código tenga la misma altura de x que el texto, bloques de código con tab-size y scroll propio, atajos con kbd, identificadores largos que se parten y avisos con propiedades lógicas"
example_tags: "css|profesional|tipografia|monospace|font-size-adjust|code|kbd|white-space|documentacion"
example_stage: professional
example_importance: important
---

# HTML

```html
<article class="doc">
  <p class="crumbs">Guías / Primeros pasos</p>
  <h1>Publicar tu primera carta con Hornito</h1>
  <p class="lead">Hornito convierte una carpeta de archivos Markdown en la carta web de un restaurante. Esta guía te lleva de la instalación a la primera publicación.</p>

  <h2 id="instalar">Instalar</h2>
  <p>Necesitas Node 22 o posterior. Instala la herramienta de forma global con <code>npm install --global hornito</code> y comprueba la versión con <code>hornito --version</code>.</p>

  <figure class="code">
    <figcaption>hornito.config.json</figcaption>
<pre><code>{
	"titulo": "Fonda Doña Lupe",
	"idioma": "es-MX",
	"moneda": "MXN",
	"carpetaDeSalida": "publico",
	"imagenes": { "calidad": 80, "anchoMaximo": 1600 }
}</code></pre>
  </figure>

  <h2 id="opciones">Opciones más usadas</h2>
  <dl class="options">
    <div>
      <dt><code>carpetaDeSalida</code></dt>
      <dd>Dónde se escribe la carta generada. Por defecto, <code>publico</code>.</dd>
    </div>
    <div>
      <dt><code>generar<wbr>Paginas<wbr>Por<wbr>Categoria</code></dt>
      <dd>Si es <code>true</code>, cada sección de la carta (entradas, guisados, postres) tiene su propia página.</dd>
    </div>
  </dl>

  <div class="note" role="note">
    <p class="note-title">Vista previa en directo</p>
    <p>Con <code>hornito servir</code>, la carta se recarga sola al guardar. Para detener el servidor, pulsa <kbd>Ctrl</kbd> + <kbd>C</kbd> en la terminal.</p>
  </div>

  <h2 id="publicar">Publicar</h2>
<pre class="terminal"><code>hornito generar --carpeta-de-salida=publico --minificar --con-mapa-del-sitio --dominio=https://fondadonalupe.example</code></pre>
  <p>El comando crea la carpeta <code>publico</code>, lista para subir a cualquier alojamiento estático.</p>
</article>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Documentación técnica
   - Pila monoespaciada de verdad (ui-monospace para Safari, Menlo en Mac,
     Consolas en Windows): con varias familias, Chrome no aplica sus 13px.
   - font-size-adjust (Chrome 127): el código se escala para que su altura de x
     sea 0,508 × font-size, la de San Francisco, el texto de alrededor. Menlo
     tiene la x más alta (0,547): sin el ajuste, el código parece más grande
     que el texto aunque mida lo mismo. Con otra fuente de texto, otro número.
   - Bloques de código: white-space: pre (lo pone <pre>), tab-size: 2 para los
     tabuladores del JSON y scroll horizontal propio; el comando larguísimo no
     ensancha la página.
   - Identificadores largos con <wbr> en el HTML y overflow-wrap: anywhere como
     red de seguridad; nada de guiones en el código (hyphens: manual).
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
    --font-text: system-ui, sans-serif;
    --font-mono: ui-monospace, Menlo, Consolas, "Liberation Mono", monospace;
    --x-height-text: 0.508;     /* San Francisco: 1040 / 2048 */
    --color-text: #0f172a;
    --color-muted: #475569;
    --color-line: #e2e8f0;
    --color-code-bg: #0f172a;
    --color-code: #e2e8f0;
    --color-inline-bg: #eef2ff;
    --color-link: #1d4ed8;
    --color-note: #eff6ff;
  }
}

@layer base {
  body {
    padding: 16px;
    color: var(--color-text);
    font-family: var(--font-text);
    line-height: 1.55;
  }

  code,
  kbd,
  pre {
    font-family: var(--font-mono);
    font-size-adjust: var(--x-height-text);
    hyphens: manual;
  }

  a {
    color: var(--color-link);
    text-underline-offset: 0.2em;
  }
}

@layer components {
  .doc {
    display: grid;
    gap: 12px;
    max-inline-size: 68ch;
    margin-inline: auto;
  }

  .crumbs {
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  .doc h1 {
    font-size: 1.8rem;
    line-height: 1.15;
    text-wrap: balance;
  }

  .doc h2 {
    margin-block-start: 8px;
    font-size: 1.25rem;
    line-height: 1.25;
  }

  .lead {
    color: var(--color-muted);
    font-size: 1.05rem;
    text-wrap: pretty;
  }

  .doc p {
    text-wrap: pretty;
  }

  /* Código dentro del texto. */
  :not(pre) > code {
    padding: 0.1em 0.3em;
    border-radius: 4px;
    background: var(--color-inline-bg);
    overflow-wrap: anywhere;
  }

  /* ─── Bloques de código ─── */
  .code {
    overflow: hidden;
    border-radius: 8px;
    background: var(--color-code-bg);
    color: var(--color-code);
  }

  .code figcaption {
    padding: 4px 12px;
    border-block-end: 1px solid #334155;
    font-family: var(--font-mono);
    font-size: 0.75rem;
  }

  pre {
    padding: 12px;
    overflow-x: auto;
    font-size: 0.9rem;
    line-height: 1.5;
    tab-size: 2;
  }

  .terminal {
    border-radius: 8px;
    background: var(--color-code-bg);
    color: var(--color-code);
  }

  .terminal code::before {
    content: "$ " / "";
    color: #94a3b8;
  }

  /* ─── Opciones ─── */
  .options {
    display: grid;
    gap: 8px;
  }

  .options div {
    padding-block-end: 8px;
    border-block-end: 1px solid var(--color-line);
  }

  .options dt code {
    font-weight: 700;
  }

  .options dd {
    margin-inline-start: 1rem;
  }

  /* ─── Aviso ─── */
  .note {
    padding: 10px 14px;
    border-inline-start: 4px solid var(--color-link);
    background: var(--color-note);
  }

  .note-title {
    font-weight: 700;
  }

  kbd {
    padding: 0.05em 0.4em;
    border: 1px solid #94a3b8;
    border-block-end-width: 2px;
    border-radius: 4px;
    background: #ffffff;
    font-size: 0.85em;
  }
}
```
