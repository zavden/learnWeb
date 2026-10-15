---
example_description: "Un cartel de aire antiguo: la estampa en duotono (gris + una capa multiply y otra lighten, aisladas con isolation), una trama de puntos que se desvanece con mask-image, grano de papel con un SVG de ruido en una URL de datos mezclado con multiply, un título en una franja girada y un sello"
example_tags: "css|profesional|mix-blend-mode|isolation|duotono|mask-image|radial-gradient|cartel"
example_stage: professional
example_importance: useful
---

# HTML

```html
<article class="poster" aria-labelledby="poster-title">
  <figure class="poster__art">
    <img src="hokusai-gran-ola.jpg" alt="La gran ola de Kanagawa, en tonos azul y crema" width="960" height="646">
  </figure>
  <p class="poster__stamp">Entrada<br>libre</p>
  <div class="poster__text">
    <h1 id="poster-title" class="poster__title">La ola</h1>
    <p class="poster__subtitle">Estampas japonesas del periodo Edo</p>
    <p class="poster__meta">Museo de la Ciudad · Del 4 de noviembre al 28 de febrero</p>
  </div>
  <p class="poster__credit">Katsushika Hokusai, <cite>La gran ola de Kanagawa</cite>, c. 1831. Dominio público.</p>
</article>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Cartel antiguo
   - Duotono: la estampa en gris; encima, una capa crema con multiply (los
     claros se vuelven crema) y otra azul con lighten (los oscuros se vuelven
     azules). La figura tiene isolation: isolate para que las capas solo se
     mezclen con la estampa. En pantallas de gama amplia los tonos exactos
     varían un poco: la mezcla se hace en el espacio de color de la pantalla.
   - Trama de puntos: un radial-gradient en baldosas de 9px en la esquina de
     abajo, desvanecido hacia arriba con una máscara.
   - Grano: un SVG con un filtro de ruido (feTurbulence, sin color) escrito
     en una URL de datos, en un ::after que cubre el cartel con multiply al
     35 %. Oscurece texto y papel a la vez: el azul tiene 10:1 sobre el papel
     y más de 6:1 en los granos más oscuros (que oscurecen hasta un 28 %).
   - Título: una franja roja girada con rotate (una caja de bloque: se puede
     transformar). El sello, un círculo con borde discontinuo, también girado.
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
    --color-paper: #f3e7cf;
    --color-ink: #1d3557;
    --color-red: #9f1239;
    --color-cream: #f6d7a7;
    --grain: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }
}

@layer base {
  body {
    padding: 16px;
    background: #d6d3d1;
    font-family: Georgia, "Times New Roman", serif;
  }
}

@layer components {
  .poster {
    position: relative;
    isolation: isolate;                 /* el grano solo se mezcla con el cartel */
    display: grid;
    gap: 14px;
    max-width: 22rem;
    padding: 18px 18px 14px;
    background-color: var(--color-paper);
    background-image: radial-gradient(circle, rgb(29 53 87 / 0.35) 0 2px, transparent 2.5px);
    background-position: right bottom;
    background-repeat: repeat;
    background-size: 9px 9px;
    color: var(--color-ink);
    box-shadow: 0 6px 16px rgb(28 25 23 / 0.35);
  }

  /* La trama ocupa todo el cartel, pero la máscara solo la deja ver abajo a
     la derecha. Se pone en una capa aparte (::before) para no enmascarar el
     contenido. */
  .poster::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    background: var(--color-paper);
    mask-image: radial-gradient(circle at 100% 100%, transparent 25%, black 55%);
  }

  .poster::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 2;
    background-image: var(--grain);
    mix-blend-mode: multiply;
    opacity: 0.35;
  }

  /* Duotono */
  .poster__art {
    position: relative;
    isolation: isolate;
    border: 3px solid var(--color-ink);
  }

  .poster__art img {
    filter: grayscale(1) contrast(1.3);
  }

  .poster__art::before,
  .poster__art::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;                          /* encima de la imagen filtrada */
  }

  .poster__art::before {
    background: var(--color-cream);
    mix-blend-mode: multiply;
  }

  .poster__art::after {
    background: var(--color-ink);
    mix-blend-mode: lighten;
  }

  .poster__stamp {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 1;
    display: grid;
    place-items: center;
    width: 76px;
    aspect-ratio: 1;
    border: 3px dashed var(--color-red);
    border-radius: 50%;
    background: var(--color-paper);
    color: var(--color-red);
    font-family: system-ui, sans-serif;
    font-size: 0.75rem;
    font-weight: 800;
    line-height: 1.1;
    text-align: center;
    text-transform: uppercase;
    rotate: 12deg;
  }

  .poster__text {
    display: grid;
    gap: 6px;
    justify-items: start;
  }

  .poster__title {
    padding: 2px 14px 4px;
    background: var(--color-red);
    color: var(--color-paper);
    font-size: 2.6rem;
    letter-spacing: 0.04em;
    line-height: 1;
    text-transform: uppercase;
    rotate: -3deg;
  }

  .poster__subtitle {
    font-size: 1.1rem;
    font-style: italic;
  }

  .poster__meta,
  .poster__credit {
    font-family: system-ui, sans-serif;
    font-size: 0.75rem;
  }

  .poster__meta {
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .poster__credit {
    font-style: italic;
  }
}
```
