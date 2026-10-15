---
example_description: "La página de una exposición sobre Velasco y Hokusai: portada con capas de fondo y velo calculado, borde en diagonal con clip-path, obras con un fundido lateral de mask-image hacia el color de la página, una línea del tiempo dibujada con degradados repetidos y créditos de cada imagen"
example_tags: "css|profesional|degradados|mask-image|clip-path|fondos-multicapa|museo"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="hero">
  <p class="hero__kicker">Museo de la Ciudad · Del 4 de noviembre al 28 de febrero</p>
  <h1 class="hero__title">Agua y montaña</h1>
  <p class="hero__lead">Dos miradas al paisaje del siglo XIX: José María Velasco y Katsushika Hokusai</p>
  <a class="button" href="/exposiciones/agua-y-montana/entradas">Reservar entrada gratuita</a>
</header>

<main class="page">
  <section class="artwork" aria-labelledby="velasco-title">
    <figure class="artwork__figure">
      <img src="velasco-valle-de-mexico.jpg" alt="Vista del valle de México desde un cerro: lagos, volcanes nevados al fondo y nubes altas" width="960" height="660">
      <figcaption>José María Velasco, <cite>Valle de México</cite>, 1877. Óleo sobre tela. Dominio público.</figcaption>
    </figure>
    <div class="artwork__text">
      <h2 id="velasco-title">El valle desde el cerro</h2>
      <p>Velasco pintó el valle de México decenas de veces. En esta versión, el lago de Texcoco brilla a la izquierda y los volcanes cierran el horizonte; en primer plano, un águila cruza sobre los nopales.</p>
    </div>
  </section>

  <section class="artwork artwork--reverse" aria-labelledby="hokusai-title">
    <figure class="artwork__figure">
      <img src="hokusai-gran-ola.jpg" alt="Una ola gigante a punto de caer sobre tres barcas; al fondo, el monte Fuji nevado" width="960" height="646">
      <figcaption>Katsushika Hokusai, <cite>La gran ola de Kanagawa</cite>, c. 1831. Xilografía. Dominio público.</figcaption>
    </figure>
    <div class="artwork__text">
      <h2 id="hokusai-title">El monte detrás de la ola</h2>
      <p>Medio siglo antes y al otro lado del océano, Hokusai convirtió el Fuji en un pico diminuto entre la espuma. La estampa se imprimió miles de veces y llegó a Europa en el equipaje de los comerciantes.</p>
    </div>
  </section>

  <section class="timeline" aria-labelledby="timeline-title">
    <h2 id="timeline-title">Cronología</h2>
    <ol class="timeline__list">
      <li><span class="timeline__year">c. 1831</span> Hokusai publica <cite>Treinta y seis vistas del monte Fuji</cite>.</li>
      <li><span class="timeline__year">1840</span> Nace José María Velasco en Temascalcingo.</li>
      <li><span class="timeline__year">1877</span> Velasco pinta <cite>Valle de México</cite>.</li>
    </ol>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Exposición «Agua y montaña»
   - Portada: tres capas de fondo (velo, brillo, pintura). Bajo el texto, el
     velo tiene al menos un 70 % de opacidad: sobre un píxel blanco (el peor
     caso) queda rgb(87 93 106) y el texto blanco tiene 6.6:1. El texto ocupa
     como mucho las tres cuartas partes de abajo; el velo llega al 75 % hasta
     el 72 % de la altura.
   - Borde inferior en diagonal con clip-path; el padding deja el botón por
     encima del corte, y el anillo de foco no se recorta porque el botón no
     está en el borde.
   - Obras: el lado de la imagen que toca el texto se funde con el color de la
     página con mask-image (no con un degradado encima: así funciona sobre
     cualquier fondo). El pie de foto va fuera de la máscara.
   - Cronología: la línea y sus marcas son degradados (sin elementos extra).
   - Sin media queries: las obras son una rejilla auto-fit que pasa de dos
     columnas a una cuando no caben.
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
    --color-page: #fdf8ef;
    --color-text: #292524;
    --color-muted: #57534e;
    --color-accent: #9a3412;
    --color-night: 15 23 42;            /* canales, para usarlos con alfa */
    --radius: 10px;
    --space: 1rem;
  }
}

@layer base {
  body {
    background: var(--color-page);
    color: var(--color-text);
    font-family: system-ui, sans-serif;
    line-height: 1.5;
  }

  h1,
  h2 {
    font-family: Georgia, serif;
    line-height: 1.15;
    text-wrap: balance;
  }

  a:focus-visible {
    outline: 3px solid var(--color-accent);
    outline-offset: 3px;
  }
}

@layer components {
  /* Portada */
  .hero {
    display: grid;
    align-content: end;
    gap: 6px;
    min-height: 380px;
    padding: 24px 20px 64px;
    background-color: #44403c;
    background-image:
      linear-gradient(to top, rgb(var(--color-night) / 0.92), rgb(var(--color-night) / 0.75) 72%, transparent),
      radial-gradient(circle at 80% 15%, rgb(253 230 138 / 0.4), transparent 35%),
      url("velasco-valle-de-mexico.jpg");
    background-position: center, center, center 60%;
    background-size: auto, auto, cover;
    color: #ffffff;
    clip-path: polygon(0 0, 100% 0, 100% 86%, 0 100%);
  }

  .hero__kicker {
    font-size: 0.8rem;
    font-weight: 600;
  }

  .hero__title {
    font-size: 2.2rem;
  }

  .hero__lead {
    max-width: 34ch;
  }

  .button {
    justify-self: start;
    margin-top: 8px;
    padding: 8px 16px;
    border-radius: 999px;
    background: #fde68a;
    color: #451a03;
    font-weight: 700;
    text-decoration: none;
  }

  .button:focus-visible {
    outline-color: #fde68a;
  }

  .page {
    display: grid;
    gap: calc(var(--space) * 2);
    max-width: 60rem;
    margin-inline: auto;
    padding: var(--space);
  }

  /* Obra: imagen y texto en una rejilla que se pliega sola. */
  .artwork {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
    gap: var(--space);
    align-items: center;
  }

  .artwork--reverse .artwork__figure {
    order: 2;                         /* solo visual: el HTML sigue imagen → texto */
  }

  /* El fundido: la imagen se desvanece hacia el lado del texto. En la versión
     invertida, hacia el otro lado. */
  .artwork__figure img {
    border-radius: var(--radius);
    mask-image: linear-gradient(to right, black 70%, transparent);
  }

  .artwork--reverse .artwork__figure img {
    mask-image: linear-gradient(to left, black 70%, transparent);
  }

  .artwork__figure figcaption {
    margin-top: 6px;
    color: var(--color-muted);
    font-size: 0.75rem;
  }

  .artwork__text h2 {
    margin-bottom: 6px;
    color: var(--color-accent);
    font-size: 1.4rem;
  }

  /* Cronología: una línea vertical de 2px (un degradado de un solo color en
     una franja) y una marca circular por año (radial-gradient en el ::before
     de cada elemento). */
  .timeline h2 {
    margin-bottom: 10px;
    font-size: 1.3rem;
  }

  .timeline__list {
    padding: 0;
    list-style: none;
    background: linear-gradient(var(--color-accent), var(--color-accent)) 7px 0 / 2px 100% no-repeat;
  }

  .timeline__list li {
    position: relative;
    padding: 0 0 12px 28px;
  }

  .timeline__list li::before {
    content: "";
    position: absolute;
    top: 4px;
    left: 0;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: radial-gradient(circle, var(--color-accent) 0 4px, var(--color-page) 4.5px 6px, var(--color-accent) 6.5px);
  }

  .timeline__year {
    display: block;
    color: var(--color-accent);
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
}
```
