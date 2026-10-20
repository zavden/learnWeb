---
example_description: "El portafolio de una fotógrafa: un mosaico de fotos de distintos tamaños con filas implícitas de 7rem, span en filas y columnas, dense para que no queden huecos y reading-flow para que el teclado siga el orden visual"
example_tags: "css|profesional|grid|dense|span|grid-auto-rows|reading-flow|capas|portafolio"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="site-header">
  <a class="name" href="/">Mariana Robles</a>
  <nav aria-label="Principal">
    <ul class="nav">
      <li><a href="/" aria-current="page">Portafolio</a></li>
      <li><a href="/sobre-mi">Sobre mí</a></li>
      <li><a href="/contacto">Contacto</a></li>
    </ul>
  </nav>
</header>

<main class="portfolio">
  <h1>Paisajes de México</h1>
  <p class="intro">Diez años recorriendo el país con una cámara y una mochila. Cada foto lleva a su historia.</p>

  <nav class="filters" aria-label="Filtrar por tema">
    <a href="/portafolio" aria-current="page">Todas</a>
    <a href="/portafolio/montana">Montaña</a>
    <a href="/portafolio/agua">Agua</a>
    <a href="/portafolio/ciudad">Ciudad</a>
  </nav>

  <ul class="mosaic">
    <li class="is-big"><a href="/fotos/laguna-azul"><span class="photo" style="--photo: url(lake.svg)"></span><span class="caption">Laguna Azul, Durango</span></a></li>
    <li><a href="/fotos/bosque-de-oyameles"><span class="photo" style="--photo: url(photo-bosque.svg)"></span><span class="caption">Bosque de oyameles</span></a></li>
    <li class="is-wide"><a href="/fotos/mazunte"><span class="photo" style="--photo: url(photo-costa.svg)"></span><span class="caption">Atardecer en Mazunte</span></a></li>
    <li><a href="/fotos/monterrey-de-noche"><span class="photo" style="--photo: url(cover-ciudad.svg)"></span><span class="caption">Monterrey de noche</span></a></li>
    <li><a href="/fotos/sierra-de-arteaga"><span class="photo" style="--photo: url(trail-sierra.svg)"></span><span class="caption">Sierra de Arteaga</span></a></li>
    <li class="is-tall"><a href="/fotos/pico-de-orizaba"><span class="photo" style="--photo: url(photo-volcan.svg)"></span><span class="caption">Pico de Orizaba</span></a></li>
    <li class="is-wide"><a href="/fotos/samalayuca"><span class="photo" style="--photo: url(photo-dunas.svg)"></span><span class="caption">Dunas de Samalayuca</span></a></li>
    <li><a href="/fotos/huasteca"><span class="photo" style="--photo: url(trail-canon.svg)"></span><span class="caption">Cañón de la Huasteca</span></a></li>
    <li class="is-tall"><a href="/fotos/cascada-de-basaseachi"><span class="photo" style="--photo: url(photo-cascada.svg)"></span><span class="caption">Cascada de Basaseachi</span></a></li>
  </ul>
</main>

<footer class="site-footer">
  <p>¿Quieres una foto impresa? Escríbeme a <a href="mailto:hola@marianarobles.mx">hola@marianarobles.mx</a></p>
</footer>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Portafolio en mosaico
   - Columnas auto-fill de al menos 7rem y filas implícitas de 7rem: cada foto
     ocupa 1 × 1, 2 × 1 (.is-wide), 1 × 2 (.is-tall) o 2 × 2 (.is-big).
   - span 2 en columnas no cabe en una rejilla de una sola columna (crearía una
     columna implícita): el mosaico tiene un min-width de dos columnas.
   - dense rellena los huecos que dejan las fotos grandes. Cambia el orden en que
     se VEN; reading-flow: grid-rows hace que el tabulador y los lectores de
     pantalla las recorran como se ven, fila a fila (Chrome 137+; los demás
     navegadores siguen el HTML, que está en un orden razonable).
   - Cada foto: la imagen de fondo y el pie en la misma celda. El nombre del
     enlace es el pie, siempre visible (no solo al pasar el ratón). Las imágenes
     van de fondo para llenar la celda sin deformarse; object-fit, con <img>,
     llega en el módulo de responsive.
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
    --color-text: #f5f5f4;
    --color-muted: #d6d3d1;
    --color-bg: #1c1917;
    --color-tile: #44403c;
    --color-accent: #fbbf24;
    --color-focus: #fbbf24;

    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --tile: 7rem;
    --gap: 6px;
  }
}

@layer base {
  body {
    background: var(--color-bg);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
  }

  a {
    color: inherit;
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  .site-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2) var(--space-4);
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--color-tile);
  }

  .name {
    font-size: 1.2rem;
    font-weight: 700;
    text-decoration: none;
  }

  .nav {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    padding: 0;
    list-style: none;
  }

  .nav a {
    text-decoration: none;
  }

  .nav [aria-current="page"] {
    color: var(--color-accent);
    font-weight: 700;
  }

  .portfolio {
    max-width: 68rem;
    margin-inline: auto;
    padding: var(--space-4);
  }

  .portfolio h1 {
    font-size: clamp(1.5rem, 1rem + 2.5vw, 2.4rem);
  }

  .intro {
    max-width: 36rem;
    margin: var(--space-1) 0 var(--space-4);
    color: var(--color-muted);
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
  }

  .filters a {
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--color-muted);
    border-radius: 999px;
    font-size: 0.85rem;
    text-decoration: none;
  }

  .filters [aria-current="page"] {
    border-color: var(--color-accent);
    background: var(--color-accent);
    color: var(--color-bg);
    font-weight: 700;
  }

  /* ─── El mosaico ─── */
  .mosaic {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--tile)), 1fr));
    grid-auto-rows: var(--tile);
    grid-auto-flow: dense;
    gap: var(--gap);
    min-width: calc(2 * var(--tile) + var(--gap));
    padding: 0;
    list-style: none;
    reading-flow: grid-rows;
  }

  .is-wide {
    grid-column: span 2;
  }

  .is-tall {
    grid-row: span 2;
  }

  .is-big {
    grid-column: span 2;
    grid-row: span 2;
  }

  /* Cada enlace llena su celda y apila foto y pie en una sola celda propia. */
  .mosaic a {
    display: grid;
    height: 100%;
    overflow: hidden;
    border-radius: 6px;
    text-decoration: none;
  }

  .mosaic a > * {
    grid-area: 1 / 1;
  }

  .photo {
    background: var(--color-tile) var(--photo) center / cover;
  }

  .caption {
    align-self: end;
    padding: var(--space-1) var(--space-2);
    background: rgb(28 25 23 / 0.85);
    font-size: 0.75rem;
    line-height: 1.3;
  }

  .mosaic a:hover .caption {
    background: rgb(28 25 23 / 0.95);
    text-decoration: underline;
  }

  /* El foco, por dentro de la foto: con solo 6px de hueco entre fotos, un
     contorno por fuera quedaría pegado a la vecina. */
  .mosaic a:focus-visible {
    outline-offset: -4px;
  }

  .site-footer {
    padding: var(--space-6) var(--space-4);
    color: var(--color-muted);
    font-size: 0.85rem;
    text-align: center;
  }

  .site-footer a {
    color: var(--color-accent);
  }
}
```
