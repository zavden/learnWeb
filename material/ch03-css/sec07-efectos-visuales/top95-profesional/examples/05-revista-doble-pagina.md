---
example_description: "Una doble página de revista: la estampa de Hokusai recortada con un polygon() en diagonal y el texto siguiendo la diagonal con shape-outside, la Tierra recortada en círculo con el texto alrededor, letra capital, una cita destacada con filetes hechos con degradados y dos páginas que se apilan solas"
example_tags: "css|profesional|clip-path|shape-outside|polygon|circle|editorial|degradados"
example_stage: professional
example_importance: important
---

# HTML

```html
<article class="spread">
  <header class="spread__header">
    <p class="spread__section">Ensayo · Imagen</p>
    <h1 class="spread__title">Mirar desde lejos</h1>
    <p class="spread__byline">Por Lucía Arreola</p>
  </header>

  <div class="spread__pages">
    <section class="page">
      <img class="cutout cutout--wave" src="hokusai-gran-ola.jpg" alt="La gran ola de Kanagawa: la ola se curva sobre las barcas y el Fuji queda al fondo" width="220" height="148">
      <p class="page__lead">Hokusai puso el monte Fuji, la montaña sagrada de Japón, en el fondo de su estampa más famosa, tan pequeño que parece otra cresta de espuma. La ola ocupa todo el primer plano y los pescadores se agachan en sus barcas.</p>
      <p>Durante siglos, los grabadores japoneses habían pintado el Fuji grande y solemne. Hokusai lo alejó, y al alejarlo cambió lo que vemos: no un monumento, sino una pieza más del mundo, tan expuesta como las barcas.</p>
    </section>

    <section class="page">
      <img class="cutout cutout--earth" src="tierra-apolo-17.jpg" alt="La Tierra entera vista desde el espacio" width="150" height="150">
      <p>Ciento cuarenta años después, la tripulación del Apolo 17 hizo lo mismo con el planeta entero. Desde 29&nbsp;000 kilómetros, la Tierra cabía en una sola foto, sin fronteras dibujadas, con las nubes en espiral sobre la Antártida.</p>
      <blockquote class="pullquote">
        <p>Alejarse no empequeñece lo que se mira: lo devuelve a su sitio.</p>
      </blockquote>
      <p>Las dos imágenes se imprimieron millones de veces. Las dos piden lo mismo a quien las mira: un paso atrás.</p>
    </section>
  </div>

  <footer class="spread__credits">
    <p>Katsushika Hokusai, <cite>La gran ola de Kanagawa</cite>, c. 1831; NASA, Apolo 17, 1972. Dominio público.</p>
  </footer>
</article>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Doble página de revista
   - Dos páginas en una rejilla auto-fit: lado a lado si caben (unos 34rem),
     una debajo de otra si no. Sin media queries.
   - Recortes con texto alrededor: la MISMA forma en clip-path (lo que se ve)
     y en shape-outside (lo que esquiva el texto), las dos medidas con
     border-box; el aire lo da shape-margin.
       · la estampa: un polígono con el lado izquierdo en diagonal;
       · la Tierra: circle(44%), el radio del planeta en la foto.
   - Letra capital con initial-letter (módulo de tipografía).
   - Cita: dos filetes (arriba y abajo) que son dos capas de degradado de 3px,
     del color de acento a transparente; sin bordes ni elementos extra.
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

  img {
    display: block;
    max-width: 100%;
    height: auto;
  }
}

@layer tokens {
  :root {
    --color-paper: #fffdf7;
    --color-text: #1c1917;
    --color-muted: #57534e;
    --color-accent: #1e3a8a;
    --font-text: Georgia, "Times New Roman", serif;
    --font-ui: system-ui, sans-serif;
  }
}

@layer base {
  body {
    padding: 16px;
    background: var(--color-paper);
    color: var(--color-text);
    font-family: var(--font-text);
    font-size: 0.95rem;
    line-height: 1.6;
  }

  p + p {
    margin-top: 0.8em;
  }
}

@layer components {
  .spread {
    max-width: 64rem;
  }

  .spread__header {
    margin-bottom: 16px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--color-text);
  }

  .spread__section,
  .spread__byline,
  .spread__credits {
    color: var(--color-muted);
    font-family: var(--font-ui);
    font-size: 0.8rem;
  }

  .spread__section {
    color: var(--color-accent);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .spread__title {
    font-size: 2.4rem;
    line-height: 1.05;
  }

  .spread__pages {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
    gap: 24px 32px;
  }

  /* Cada página contiene sus flotantes. */
  .page {
    display: flow-root;
    hyphens: auto;
    text-wrap: pretty;
  }

  .page__lead::first-letter {
    initial-letter: 3;
    margin-inline-end: 8px;
    color: var(--color-accent);
    font-weight: 700;
  }

  .cutout {
    shape-margin: 12px;
  }

  /* La estampa, a la derecha: su lado izquierdo baja en diagonal del 35 %
     al 0 %, y el texto lo sigue renglón a renglón. */
  .cutout--wave {
    float: right;
    clip-path: polygon(35% 0, 100% 0, 100% 100%, 0 100%);
    shape-outside: polygon(35% 0, 100% 0, 100% 100%, 0 100%) border-box;
  }

  .cutout--earth {
    float: left;
    clip-path: circle(44%);
    shape-outside: circle(44%) border-box;
  }

  .pullquote {
    clear: both;
    margin: 14px 0;
    padding: 12px 0;
    background:
      linear-gradient(to right, var(--color-accent), transparent) top / 100% 3px no-repeat,
      linear-gradient(to right, var(--color-accent), transparent) bottom / 100% 3px no-repeat;
    color: var(--color-accent);
    font-size: 1.25rem;
    font-style: italic;
    line-height: 1.3;
    text-wrap: balance;
  }

  .spread__credits {
    margin-top: 18px;
  }
}
```
