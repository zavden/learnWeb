---
example_description: "Un documento completo con la carga de fuentes preparada para no mover la página: preload de la fuente principal en el head, font-display: swap y una reserva ajustada (Georgia con size-adjust, ascent-override y descent-override) calculada con las medidas de los dos archivos"
example_tags: "css|profesional|tipografia|font-face|preload|font-display|size-adjust|cls"
example_stage: professional
example_importance: critical
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cómo evitamos que nuestra web salte al cargar la fuente · Estudio Albarrada</title>
  <!-- 1. Pedir la fuente del texto principal desde el principio, sin esperar al CSS.
          crossorigin es obligatorio para las fuentes, aunque sean del mismo sitio. -->
  <link rel="preload" href="fonts/literata-normal.woff2" as="font" type="font/woff2" crossorigin>
  <style>
    /* 2. La fuente web, con font-display: swap: el texto se lee desde el primer
          momento con la fuente de reserva. */
    @font-face {
      font-family: "Literata";
      src: url("fonts/literata-normal.woff2") format("woff2");
      font-weight: 200 900;
      font-style: normal;
      font-display: swap;
    }

    @font-face {
      font-family: "Literata";
      src: url("fonts/literata-italic.woff2") format("woff2");
      font-weight: 200 900;
      font-style: italic;
      font-display: swap;
    }

    /* 3. La reserva ajustada: Georgia (instalada en Mac y Windows) con las
          medidas de Literata. Los números están explicados en el artículo. */
    @font-face {
      font-family: "Literata Fallback";
      src: local("Georgia");
      size-adjust: 107%;
      ascent-override: 110%;
      descent-override: 28.8%;
      line-gap-override: 0%;
    }

    :root {
      --font-text: Literata, "Literata Fallback", Georgia, serif;
      --font-ui: system-ui, sans-serif;
      --font-mono: ui-monospace, Menlo, Consolas, monospace;
      --color-text: #1c1917;
      --color-muted: #57534e;
      --color-line: #e7e5e4;
      --color-code-bg: #1c1917;
      --color-code: #f5f5f4;
      --color-link: #1d4ed8;
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 16px;
      color: var(--color-text);
      font-family: var(--font-text);
      line-height: 1.55;
    }

    article {
      max-inline-size: 65ch;
      margin-inline: auto;
    }

    .kicker {
      margin: 0;
      color: var(--color-muted);
      font-family: var(--font-ui);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    h1 {
      margin: 6px 0 8px;
      font-size: 1.9rem;
      line-height: 1.15;
      text-wrap: balance;
    }

    h2 {
      margin: 24px 0 6px;
      font-size: 1.25rem;
      line-height: 1.25;
      text-wrap: balance;
    }

    p {
      margin: 0 0 12px;
      hyphens: auto;
      text-wrap: pretty;
    }

    .dek {
      color: var(--color-muted);
      font-size: 1.1rem;
      font-style: italic;
    }

    a {
      color: var(--color-link);
      text-underline-offset: 0.2em;
    }

    a:focus-visible {
      outline: 3px solid var(--color-link);
      outline-offset: 2px;
    }

    /* Tabla de medidas: cifras tabulares alineadas al final. */
    table {
      inline-size: 100%;
      margin-block-end: 12px;
      border-collapse: collapse;
      font-family: var(--font-ui);
      font-size: 0.85rem;
    }

    caption {
      margin-block-end: 4px;
      font-weight: 700;
      text-align: start;
    }

    th,
    td {
      padding: 4px 8px;
      border-block-end: 1px solid var(--color-line);
      text-align: start;
    }

    td {
      font-variant-numeric: tabular-nums;
      text-align: end;
    }

    pre {
      margin: 0 0 12px;
      padding: 12px;
      overflow-x: auto;
      border-radius: 8px;
      background: var(--color-code-bg);
      color: var(--color-code);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      line-height: 1.5;
    }

    :not(pre) > code {
      font-family: var(--font-mono);
      font-size: 0.9em;
    }

    ol {
      padding-inline-start: 1.4em;
    }

    li {
      margin-block-end: 6px;
    }
  </style>
</head>
<body>
  <article>
    <p class="kicker">Rendimiento</p>
    <h1>Cómo evitamos que nuestra web salte al cargar la fuente</h1>
    <p class="dek">Tres líneas en el head y una fuente de reserva bien medida bastaron para que el texto no se moviera ni un píxel.</p>

    <p>Nuestro blog usa Literata. Mientras se descarga, el navegador pinta el texto con la siguiente fuente de la pila, y cuando llega la buena lo vuelve a componer. Si las dos no miden lo mismo, cada párrafo cambia de alto y todo lo que hay debajo se desplaza: justo lo que mide el <abbr title="Cumulative Layout Shift">CLS</abbr>.</p>

    <h2>Las medidas de los dos archivos</h2>
    <table>
      <caption>Literata frente a Georgia (en em)</caption>
      <thead><tr><th scope="col">Medida</th><th scope="col">Literata</th><th scope="col">Georgia</th></tr></thead>
      <tbody>
        <tr><th scope="row">Sube sobre la línea base</th><td>1,177</td><td>0,917</td></tr>
        <tr><th scope="row">Baja bajo la línea base</th><td>0,308</td><td>0,219</td></tr>
        <tr><th scope="row"><code>line-height: normal</code></th><td>1,485</td><td>1,136</td></tr>
        <tr><th scope="row">Ancho de un párrafo de prueba</th><td>127,6</td><td>119,2</td></tr>
      </tbody>
    </table>

    <p>Literata es un 7&nbsp;% más ancha y mucho más alta. La reserva se escala un 107&nbsp;% con <code>size-adjust</code>, y sus medidas verticales se fijan a las de Literata divididas entre ese mismo factor (porque <code>size-adjust</code> también las escala): 1,177 / 1,07 = 110&nbsp;% y 0,308 / 1,07 = 28,8&nbsp;%.</p>

<pre><code>@font-face {
  font-family: "Literata Fallback";
  src: local("Georgia");
  size-adjust: 107%;
  ascent-override: 110%;
  descent-override: 28.8%;
  line-gap-override: 0%;
}</code></pre>

    <h2>El resultado</h2>
    <p>Medimos en Chrome un párrafo de 190&nbsp;px de ancho y 14&nbsp;px de letra: 128&nbsp;px de alto con Georgia tal cual, 189&nbsp;px con Literata y 189&nbsp;px con la reserva ajustada, con los mismos cortes de línea. El cambio de fuente ya no mueve nada.</p>

    <h2>La receta completa</h2>
    <ol>
      <li><code>&lt;link rel="preload"&gt;</code> en el <code>head</code> para la fuente del texto, y solo para esa.</li>
      <li><code>font-display: swap</code> en su <code>@font-face</code>.</li>
      <li>Una reserva ajustada en la pila, justo detrás: <code>Literata, "Literata Fallback", serif</code>.</li>
    </ol>
  </article>
</body>
</html>
```
