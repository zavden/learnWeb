---
example_description: "Página de artículo de blog: cabecera del sitio, metadatos, figura SVG, cita, notas al pie con :target, letra capital y etiquetas, todo con selectores de baja especificidad"
example_tags: "css|profesional|articulo|target|pseudoelementos"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="site-header">
  <a class="site-name" href="#">Raíces</a>
  <nav aria-label="Principal">
    <ul>
      <li><a href="#">Huerto</a></li>
      <li><a href="#" aria-current="page">Balcón</a></li>
      <li><a href="#">Recetas</a></li>
    </ul>
  </nav>
</header>

<main>
  <article class="post">
    <header class="post-header">
      <p class="category">Huerto urbano</p>
      <h1>Cómo empezar un huerto en el balcón</h1>
      <p class="byline">Por <a href="#" rel="author">Elena Martín</a> · <time datetime="2026-03-14">14 de marzo de 2026</time> · 6 minutos de lectura</p>
    </header>

    <div class="post-body">
      <p>No hace falta un jardín para cultivar tus propias verduras. Con cuatro horas de sol al día, unas cuantas macetas y algo de paciencia, un balcón de dos metros puede darte tomates, lechugas y hierbas aromáticas durante buena parte del año.</p>

      <figure>
        <svg viewBox="0 0 320 140" role="img" aria-label="Tres macetas en fila con una tomatera, unas lechugas y una mata de albahaca">
          <rect x="0" y="120" width="320" height="20" fill="currentColor" opacity="0.15" />
          <rect x="30" y="80" width="60" height="40" fill="#b45309" />
          <circle cx="60" cy="55" r="22" fill="#15803d" />
          <circle cx="52" cy="50" r="5" fill="#dc2626" />
          <circle cx="68" cy="62" r="5" fill="#dc2626" />
          <rect x="130" y="90" width="60" height="30" fill="#b45309" />
          <circle cx="148" cy="80" r="14" fill="#65a30d" />
          <circle cx="172" cy="80" r="14" fill="#65a30d" />
          <rect x="230" y="90" width="60" height="30" fill="#b45309" />
          <circle cx="260" cy="72" r="20" fill="#16a34a" />
        </svg>
        <figcaption>Una distribución sencilla: lo más alto, al fondo, para que no haga sombra al resto.</figcaption>
      </figure>

      <h2>Elige bien el sitio</h2>
      <p>Antes de comprar semillas, observa el balcón durante un día entero. Las hortalizas de fruto, como el tomate o el pimiento, necesitan al menos seis horas de sol directo; las de hoja, como la lechuga, se conforman con cuatro<sup><a href="#note-1" id="ref-1" aria-label="Nota 1">1</a></sup>.</p>

      <h2>Qué plantar primero</h2>
      <ul>
        <li><strong>Lechugas:</strong> crecen rápido y perdonan los errores.</li>
        <li><strong>Albahaca y perejil:</strong> caben en macetas pequeñas.</li>
        <li><strong>Tomates cherry:</strong> más resistentes que las variedades grandes.</li>
      </ul>

      <blockquote>
        <p>El mejor abono para un huerto es la sombra del hortelano.</p>
        <footer>— Refrán popular</footer>
      </blockquote>

      <h2>El riego</h2>
      <p>En maceta, la tierra se seca mucho antes que en el suelo. Riega a primera hora de la mañana o al atardecer, y comprueba la humedad metiendo un dedo en la tierra: si los dos primeros centímetros están secos, toca regar<sup><a href="#note-2" id="ref-2" aria-label="Nota 2">2</a></sup>.</p>
    </div>

    <footer class="post-footer">
      <h2 class="footnotes-title">Notas</h2>
      <ol class="footnotes">
        <li id="note-1">En climas muy calurosos, la lechuga agradece sombra en las horas centrales del día. <a href="#ref-1" aria-label="Volver a la referencia 1">↩</a></li>
        <li id="note-2">Un plato bajo la maceta conserva el agua sobrante, pero vacíalo si se queda encharcado: las raíces se pudren. <a href="#ref-2" aria-label="Volver a la referencia 2">↩</a></li>
      </ol>
      <ul class="tags" aria-label="Etiquetas">
        <li><a href="#">balcón</a></li>
        <li><a href="#">principiantes</a></li>
        <li><a href="#">riego</a></li>
      </ul>
    </footer>
  </article>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Artículo de blog
   - Base con :where(): especificidad cero para los elementos sueltos.
   - Componentes con UNA clase por bloque (.site-header, .post, .footnotes…) y
     selectores de elemento dentro: ningún id, y la regla más específica pesa (0,2,2).
   - Interacción sin JavaScript: notas al pie que se resaltan con :target.
   Nota: las propiedades de caja y de texto se usan de forma básica.
   ────────────────────────────────────────────────────────────────────────── */
@layer tokens, base, components;

@layer tokens {
  :root {
    --color-bg: oklch(98.5% 0.005 80);
    --color-surface: oklch(95% 0.03 80);
    --color-text: oklch(25% 0.03 60);
    --color-text-muted: oklch(45% 0.06 60);
    --color-accent: oklch(45% 0.12 40);
    --color-highlight: oklch(90% 0.08 95);
    --font-body: Charter, "Bitstream Charter", Georgia, serif;
    --font-ui: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    --measure: 65ch;
  }
}

@layer base {
  body {
    margin: 0;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-body);
    font-size: 1.0625rem;
    line-height: 1.65;
  }

  :where(h1, h2) {
    font-family: var(--font-ui);
    line-height: 1.2;
  }

  :where(a) {
    color: var(--color-accent);
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-accent);
    outline-offset: 2px;
  }

  ::selection {
    background: var(--color-highlight);
  }
}

@layer components {
  /* Cabecera del sitio */
  .site-header {
    font-family: var(--font-ui);
    border-bottom: 1px solid color-mix(in oklch, var(--color-text) 15%, transparent);
    padding: 0.75rem 1rem;
  }

  .site-name {
    font-weight: 800;
    font-size: 1.25rem;
    color: var(--color-text);
    text-decoration: none;
  }

  .site-header ul {
    list-style: none;
    padding: 0;
    margin: 0.25rem 0 0;
  }

  /* display: inline pone los elementos de la lista en la misma línea (modelo de cajas) */
  .site-header li {
    display: inline;
    margin-inline-end: 1rem;
  }

  .site-header a[aria-current="page"] {
    font-weight: 700;
    text-decoration-thickness: 2px;
  }

  /* El artículo: una columna de lectura centrada */
  .post {
    max-width: var(--measure);
    margin-inline: auto;
    padding: 1.5rem 1rem 3rem;
  }

  .category {
    margin: 0;
    font-family: var(--font-ui);
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-accent);
  }

  .post h1 {
    font-size: clamp(1.8rem, 1.4rem + 2vw, 2.6rem);
    margin: 0.25em 0 0.4em;
  }

  .byline {
    margin: 0 0 2rem;
    font-family: var(--font-ui);
    font-size: 0.9rem;
    color: var(--color-text-muted);
  }

  .post-body h2 {
    font-size: 1.5rem;
    margin: 2em 0 0.5em;
  }

  /* Letra capital en el primer párrafo del cuerpo */
  .post-body > p:first-child::first-letter {
    font-family: var(--font-ui);
    font-size: 3em;
    font-weight: 800;
    line-height: 1;
    color: var(--color-accent);
  }

  .post-body li::marker {
    color: var(--color-accent);
  }

  .post figure {
    margin: 2rem 0;
    color: var(--color-text);             /* el suelo del SVG usa currentColor */
  }

  /* El SVG ocupa el ancho de la columna; su viewBox fija la proporción */
  .post figure svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .post figcaption {
    font-family: var(--font-ui);
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .post blockquote {
    margin: 2rem 0;
    padding: 0.75rem 1.25rem;
    background: var(--color-surface);
    border-left: 4px solid var(--color-accent);
  }

  .post blockquote p {
    margin: 0;
    font-size: 1.2rem;
    font-style: italic;
  }

  .post blockquote p::before { content: "«"; }
  .post blockquote p::after  { content: "»"; }

  .post blockquote footer {
    font-family: var(--font-ui);
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  /* Llamadas a nota: sin subrayado, con un número algo más visible */
  .post sup a {
    text-decoration: none;
    font-family: var(--font-ui);
    font-weight: 700;
    padding-inline: 0.1em;
  }

  /* Notas al pie */
  .post-footer {
    margin-top: 3rem;
    border-top: 1px solid color-mix(in oklch, var(--color-text) 15%, transparent);
  }

  .footnotes-title {
    font-size: 1rem;
  }

  .footnotes {
    font-size: 0.9rem;
    color: var(--color-text-muted);
  }

  /* :target: la nota a la que acabas de saltar, y la llamada a la que vuelves */
  .footnotes li:target,
  .post sup a:target {
    background: var(--color-highlight);
    color: var(--color-text);
  }

  /* Etiquetas en línea, con # generado */
  .tags {
    list-style: none;
    padding: 0;
    font-family: var(--font-ui);
  }

  .tags li {
    display: inline;
    margin-inline-end: 0.75rem;
  }

  .tags a::before {
    content: "#";
  }
}
```
