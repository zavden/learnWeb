---
example_description: "La portada de un periódico con escala tipográfica y espacios fluidos, tema claro u oscuro con light-dark(), esqueleto mobile-first con una media query (una columna; desde 48rem, noticia principal y columna de «Lo último») y noticias secundarias que se adaptan a su hueco con container queries"
example_tags: "css|profesional|responsive|tipografia-fluida|light-dark|container-queries|grid|periodico"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="masthead">
  <p class="masthead__date"><time datetime="2026-10-14">Miércoles 14 de octubre de 2026</time> · Ciudad de México</p>
  <p class="masthead__name"><a href="/">El Diario del Valle</a></p>
  <nav class="sections" aria-label="Secciones">
    <ul>
      <li><a href="/nacional">Nacional</a></li>
      <li><a href="/ciudad">Ciudad</a></li>
      <li><a href="/cultura" aria-current="page">Cultura</a></li>
      <li><a href="/ciencia">Ciencia</a></li>
      <li><a href="/deportes">Deportes</a></li>
    </ul>
  </nav>
</header>

<main class="front">
  <article class="lead">
    <figure class="lead__media">
      <img src="velasco-valle-de-mexico-480.jpg" srcset="velasco-valle-de-mexico-480.jpg 480w, velasco-valle-de-mexico.jpg 960w" sizes="(width >= 48rem) 60vw, 100vw" alt="Pintura de un cerro en primer plano y el Valle de México con sus lagos al fondo" width="960" height="660">
      <figcaption>José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</figcaption>
    </figure>
    <p class="kicker">Cultura</p>
    <h1 class="lead__title"><a href="/cultura/velasco-y-el-agua">El valle que pintó Velasco ya no tiene lagos: una exposición los compara con el mapa de hoy</a></h1>
    <p class="lead__standfirst">El Museo Nacional de Arte reúne 60 paisajes del pintor junto a fotografías aéreas tomadas desde los mismos cerros, casi siglo y medio después.</p>
    <p class="byline">Por <a href="/autores/ana-solis">Ana Solís</a> · 8 min de lectura</p>
  </article>

  <section class="latest" aria-labelledby="latest-title">
    <h2 id="latest-title">Lo último</h2>
    <ol>
      <li><time datetime="2026-10-14T09:40-06:00">9:40</time> <a href="/ciudad/linea-1-completa">La línea 1 del Metro, completa de nuevo</a></li>
      <li><time datetime="2026-10-14T09:12-06:00">9:12</time> <a href="/ciudad/lluvias-tarde">Lluvia fuerte por la tarde en el poniente</a></li>
      <li><time datetime="2026-10-14T08:55-06:00">8:55</time> <a href="/deportes/maraton">Cierres viales por el maratón del domingo</a></li>
      <li><time datetime="2026-10-14T08:20-06:00">8:20</time> <a href="/cultura/feria-del-libro">La Feria del Libro del Zócalo anuncia invitados</a></li>
    </ol>
  </section>

  <section class="more" aria-labelledby="more-title">
    <h2 id="more-title">Más noticias</h2>
    <div class="more__grid">
      <article class="story">
        <img src="tierra-apolo-17-480.jpg" alt="La Tierra vista desde el espacio" width="480" height="480">
        <div class="story__text">
          <p class="kicker">Ciencia</p>
          <h3><a href="/ciencia/canica-azul">La foto de la «canica azul» cumple 54 años</a></h3>
          <p>La tomó la tripulación del Apolo 17 a 29&nbsp;000 km de la Tierra.</p>
        </div>
      </article>
      <article class="story">
        <img src="hokusai-gran-ola-480.jpg" alt="Grabado de una gran ola con el monte Fuji al fondo" width="480" height="323">
        <div class="story__text">
          <p class="kicker">Exposiciones</p>
          <h3><a href="/cultura/hokusai">Hokusai llega al Museo Franz Mayer</a></h3>
          <p>Treinta y seis vistas del monte Fuji, por primera vez en México.</p>
        </div>
      </article>
      <article class="story">
        <img src="aldrin-apolo-11-480.jpg" alt="Un astronauta de pie sobre la superficie lunar" width="480" height="483">
        <div class="story__text">
          <p class="kicker">Ciencia</p>
          <h3><a href="/ciencia/regreso-a-la-luna">Así será el regreso a la Luna</a></h3>
          <p>Cuatro astronautas y diez días: el calendario de la misión.</p>
        </div>
      </article>
    </div>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Portada de periódico
   - Escala tipográfica y espacios FLUIDOS (lección 3): cada paso es la recta
     entre su valor con 320px de ventana (base 16px, razón 1,2) y con 1200px
     (base 20px, razón 1,25). Todo en rem salvo la pendiente: respeta el zoom
     y la letra del usuario.
   - Tema: color-scheme: light dark y tokens con light-dark() (lección 2).
   - Esqueleto mobile-first (lección 1): una columna; desde 48rem, la
     principal a la izquierda y «Lo último» a la derecha. Una media query.
   - Noticias secundarias: rejilla auto-fill sin consultas; cada noticia es un
     contenedor y pone la foto al lado desde 24rem (lección 4).
   - Fotos: srcset + sizes que describe el esqueleto; miniaturas 4:3 con
     object-fit (lección 5).
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components, layout;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  img { display: block; max-width: 100%; height: auto; }
}

@layer tokens {
  :root {
    color-scheme: light dark;
    --color-page: light-dark(#fffdf8, #12100e);
    --color-text: light-dark(#1c1917, #ece7df);
    --color-muted: light-dark(#57534e, #a8a29e);
    --color-rule: light-dark(#d6d3d1, #3f3a36);
    --color-accent: light-dark(#9f1239, #fda4af);

    --step--1: clamp(0.8333rem, 0.7727rem + 0.303vw, 1rem);
    --step-0: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
    --step-1: clamp(1.2rem, 1.0682rem + 0.6591vw, 1.5625rem);
    --step-2: clamp(1.44rem, 1.2534rem + 0.933vw, 1.9531rem);
    --step-3: clamp(1.728rem, 1.4686rem + 1.2971vw, 2.4414rem);
    --step-4: clamp(2.0736rem, 1.7179rem + 1.7785vw, 3.0518rem);

    --space-2xs: clamp(0.5rem, 0.4545rem + 0.2273vw, 0.625rem);
    --space-xs: clamp(0.75rem, 0.6818rem + 0.3409vw, 0.9375rem);
    --space-s: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
    --space-m: clamp(1.5rem, 1.3636rem + 0.6818vw, 1.875rem);
    --space-l: clamp(2rem, 1.8182rem + 0.9091vw, 2.5rem);
    --space-s-l: clamp(1rem, 0.4545rem + 2.7273vw, 2.5rem);

    --font-news: Georgia, "Times New Roman", serif;
    --font-ui: system-ui, sans-serif;
  }
}

@layer base {
  body {
    padding: var(--space-s-l);
    background: var(--color-page);
    color: var(--color-text);
    font-family: var(--font-news);
    font-size: var(--step-0);
    line-height: 1.5;
  }

  a { color: inherit; text-underline-offset: 0.15em; }
  a:hover { color: var(--color-accent); }
  :focus-visible { outline: 3px solid var(--color-accent); outline-offset: 2px; }
  h1, h2, h3 { line-height: 1.15; text-wrap: balance; }
}

@layer components {
  .masthead {
    display: grid;
    justify-items: center;
    gap: var(--space-2xs);
    padding-bottom: var(--space-xs);
    border-bottom: 3px double var(--color-rule);
    text-align: center;
  }

  .masthead__date { color: var(--color-muted); font-family: var(--font-ui); font-size: var(--step--1); }
  .masthead__name { font-size: var(--step-4); font-weight: 700; letter-spacing: -0.01em; line-height: 1; }
  .masthead__name a { text-decoration: none; }

  .sections ul {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0 var(--space-s);
    padding: 0;
    list-style: none;
    font-family: var(--font-ui);
    font-size: var(--step--1);
  }

  .sections a { display: inline-block; padding-block: 0.25em; text-decoration: none; }
  .sections [aria-current="page"] { border-bottom: 2px solid var(--color-accent); font-weight: 700; }

  .kicker {
    color: var(--color-accent);
    font-family: var(--font-ui);
    font-size: var(--step--1);
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .lead { display: grid; gap: var(--space-2xs); }
  .lead__media figcaption { margin-top: 4px; color: var(--color-muted); font-family: var(--font-ui); font-size: var(--step--1); }
  .lead__title { font-size: var(--step-3); }
  .lead__title a { text-decoration: none; }
  .lead__standfirst { max-inline-size: 60ch; font-size: var(--step-1); line-height: 1.35; }
  .byline { color: var(--color-muted); font-family: var(--font-ui); font-size: var(--step--1); }

  .latest h2,
  .more h2 {
    margin-bottom: var(--space-2xs);
    padding-bottom: 4px;
    border-bottom: 1px solid var(--color-rule);
    font-family: var(--font-ui);
    font-size: var(--step-0);
    text-transform: uppercase;
  }

  .latest ol { display: grid; gap: var(--space-xs); padding: 0; list-style: none; }
  .latest li { font-size: var(--step-0); line-height: 1.3; }
  .latest time { display: block; color: var(--color-accent); font-family: var(--font-ui); font-size: var(--step--1); font-weight: 700; }

  /* Noticias secundarias: la rejilla reparte sin consultas; cada noticia
     decide su forma según su hueco. */
  .more__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 15rem), 1fr));
    gap: var(--space-m);
  }

  .story { container: story / inline-size; }
  .story img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; margin-bottom: var(--space-2xs); }
  .story h3 { font-size: var(--step-1); }
  .story h3 a { text-decoration: none; }
  .story__text p:last-child { color: var(--color-muted); font-size: var(--step--1); }

  /* Un hueco ancho (una sola columna en una tableta): foto al lado. Como el
     contenedor es .story, la regla da estilo a sus hijos. */
  @container story (width >= 24rem) {
    .story img { float: left; width: 40%; margin: 0 var(--space-s) 0 0; }
  }
}

@layer layout {
  .front { display: grid; gap: var(--space-m); margin-top: var(--space-m); }

  /* Desde 48rem: la principal y «Lo último» lado a lado. El HTML sigue en el
     orden de lectura: principal, lo último, más noticias. */
  @media (width >= 48rem) {
    .front {
      grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
      grid-template-areas:
        "lead latest"
        "more more";
      column-gap: var(--space-l);
    }

    .lead { grid-area: lead; }
    .latest { grid-area: latest; padding-left: var(--space-m); border-left: 1px solid var(--color-rule); }
    .more { grid-area: more; }
  }
}
```
