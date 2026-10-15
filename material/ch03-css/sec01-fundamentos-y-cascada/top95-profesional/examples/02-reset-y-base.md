---
example_description: "Un reset moderno y una capa base comentados, aplicados a un muestrario de todos los elementos de contenido de HTML"
example_tags: "css|profesional|reset|base|layer|where"
example_stage: professional
example_importance: critical
---

# HTML

```html
<main class="sampler">
  <h1>Muestrario de la capa base</h1>
  <p>Este documento usa casi todos los elementos de contenido de HTML <strong>sin una sola clase</strong>. Lo que ves es el resultado del <em>reset</em> y de la capa <code>base</code>: el punto de partida de cualquier página del proyecto.</p>

  <h2>Texto</h2>
  <p>Un enlace <a href="#">interno</a> y otro <a href="https://example.com">externo</a>. Abreviaturas como <abbr title="Hojas de estilo en cascada">CSS</abbr>, atajos como <kbd>Ctrl</kbd> + <kbd>S</kbd>, texto <mark>resaltado</mark>, fórmulas como H<sub>2</sub>O y notas <small>en letra pequeña</small>.</p>
  <blockquote>
    <p>La simplicidad es la máxima sofisticación.</p>
  </blockquote>

  <h2>Listas</h2>
  <ul>
    <li>Una lista sin ordenar</li>
    <li>Con dos elementos</li>
  </ul>
  <ol>
    <li>Una lista ordenada</li>
    <li>Con su numeración</li>
  </ol>

  <h2>Código</h2>
  <pre><code>:where(h1, h2, h3) {
  line-height: 1.2;
}</code></pre>

  <h2>Tabla</h2>
  <table>
    <caption>Navegadores de prueba</caption>
    <thead>
      <tr><th scope="col">Navegador</th><th scope="col">Motor</th></tr>
    </thead>
    <tbody>
      <tr><td>Chrome</td><td>Blink</td></tr>
      <tr><td>Firefox</td><td>Gecko</td></tr>
      <tr><td>Safari</td><td>WebKit</td></tr>
    </tbody>
  </table>

  <h2>Formulario</h2>
  <p>
    <label for="sampler-name">Nombre</label><br>
    <input id="sampler-name" type="text" placeholder="Escribe tu nombre">
  </p>
  <p>
    <label><input type="checkbox"> Recordarme</label>
  </p>
  <p><button type="button">Guardar</button></p>

  <hr>
  <p><small>Muestrario del sistema de diseño Brisa.</small></p>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Reset + base
   El reset deshace lo que estorba de la hoja del navegador; la base vuelve a
   dar estilo a los elementos de HTML con selectores de especificidad cero, para
   que cualquier componente posterior los ajuste sin pelear.
   Nota: las propiedades de caja y de texto se usan de forma básica; se estudian
   en los módulos del modelo de cajas y de tipografía.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, base;

@layer reset {
  /* Que width incluya padding y borde: los tamaños hacen lo que esperas.
     (El modelo de cajas se estudia en el próximo módulo.) */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  /* Sin márgenes del navegador (body 8px, p 1em, h1 0.67em…).
     La base los vuelve a poner, pero coherentes entre sí. */
  * {
    margin: 0;
  }

  /* Imágenes y SVG como bloques que nunca desbordan su contenedor */
  img,
  svg {
    display: block;
    max-width: 100%;
  }

  /* Los controles no heredan la fuente: se la pedimos (lección de herencia) */
  input,
  button,
  textarea,
  select {
    font: inherit;
  }
}

@layer base {
  :root {
    --color-bg: oklch(98.5% 0.005 260);
    --color-surface: oklch(96% 0.01 260);
    --color-border: oklch(85% 0.02 260);
    --color-text: oklch(25% 0.03 260);
    --color-text-muted: oklch(45% 0.03 260);
    --color-brand: oklch(50% 0.18 260);
    --color-brand-strong: oklch(42% 0.18 260);
    --color-highlight: oklch(90% 0.08 95);
    --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    --font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    --flow-space: 1rem;
  }

  body {
    background: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-sans);
    line-height: 1.6;
    padding: 1.5rem 1rem;
  }

  /* Ritmo vertical: un único espacio entre bloques, solo por debajo */
  :where(p, ul, ol, blockquote, pre, table, hr) {
    margin-block-end: var(--flow-space);
  }

  :where(h1, h2, h3) {
    line-height: 1.2;
    margin-block: 2em 0.5em;          /* em: proporcional al tamaño de cada título */
  }

  :where(h1) {
    font-size: clamp(1.75rem, 1.4rem + 1.5vw, 2.25rem);
    margin-top: 0;
  }

  :where(ul, ol) {
    padding-inline-start: 1.5rem;
  }

  :where(li)::marker {
    color: var(--color-brand);
  }

  :where(a) {
    color: var(--color-brand);
  }

  :where(a):hover {
    color: var(--color-brand-strong);
  }

  /* Un solo estilo de foco, visible y con buen contraste, para todo lo enfocable */
  :where(:focus-visible) {
    outline: 3px solid var(--color-brand);
    outline-offset: 2px;
  }

  :where(code, kbd, pre) {
    font-family: var(--font-mono);
    font-size: 0.9em;
  }

  :where(kbd) {
    border: 1px solid var(--color-border);
    border-bottom-width: 2px;
    border-radius: 0.25rem;
    padding: 0 0.3em;
    background: var(--color-surface);
  }

  :where(pre) {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    padding: 1rem;
    overflow-x: auto;                 /* el código largo se desplaza, no rompe la página */
  }

  :where(blockquote) {
    border-left: 4px solid var(--color-brand);
    padding-inline-start: 1rem;
    color: var(--color-text-muted);
    font-style: italic;
  }

  :where(mark) {
    background: var(--color-highlight);
    color: inherit;
  }

  :where(abbr[title]) {
    text-decoration: underline dotted;
    cursor: help;
  }

  :where(small) {
    color: var(--color-text-muted);
  }

  :where(table) {
    border-collapse: collapse;
  }

  :where(caption) {
    text-align: start;
    font-weight: bold;
  }

  :where(th, td) {
    text-align: start;
    padding: 0.4rem 0.8rem;
    border-bottom: 1px solid var(--color-border);
  }

  :where(input:not([type="checkbox"], [type="radio"])) {
    border: 1px solid var(--color-text-muted);
    border-radius: 0.25rem;
    padding: 0.35rem 0.5rem;
    background: #ffffff;
  }

  :where(input)::placeholder {
    color: var(--color-text-muted);
  }

  :where(button) {
    background: var(--color-brand);
    color: #ffffff;
    border: 0;
    border-radius: 0.25rem;
    padding: 0.45rem 1rem;
  }

  :where(hr) {
    border: 0;
    border-top: 1px solid var(--color-border);
  }

  ::selection {
    background: var(--color-highlight);
    color: var(--color-text);
  }
}
```
