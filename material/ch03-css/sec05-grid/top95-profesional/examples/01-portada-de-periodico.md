---
example_description: "La portada de un periódico local: noticia principal con el titular sobre la foto (capas grid), noticias secundarias alineadas con subgrid, columnas de opinión y lo más leído"
example_tags: "css|profesional|grid|subgrid|capas|auto-fit|periodico"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="site-header">
  <div class="masthead">
    <p class="date"><time datetime="2026-10-13">Martes 13 de octubre de 2026</time></p>
    <a class="logo" href="/">La Gaceta del Valle</a>
    <a class="subscribe" href="/suscripcion">Suscríbete</a>
  </div>
  <nav aria-label="Secciones">
    <ul class="sections">
      <li><a href="/" aria-current="page">Portada</a></li>
      <li><a href="/ciudad">Ciudad</a></li>
      <li><a href="/estado">Estado</a></li>
      <li><a href="/economia">Economía</a></li>
      <li><a href="/cultura">Cultura</a></li>
      <li><a href="/deportes">Deportes</a></li>
      <li><a href="/opinion">Opinión</a></li>
    </ul>
  </nav>
</header>

<main class="front">
  <article class="lead">
    <div class="lead-photo" role="img" aria-label="La presa vista desde la cortina, con el agua a media altura"></div>
    <div class="lead-text">
      <p class="kicker">Agua</p>
      <h1><a href="/ciudad/2026/10/13/la-presa-llega-al-62">La presa llega al 62 % tras las lluvias de octubre y se suspenden los tandeos</a></h1>
      <p class="summary">Es el nivel más alto desde 2021. El organismo operador restablece el servicio continuo en las 14 colonias del poniente a partir del jueves.</p>
      <p class="byline">Por Andrea Salinas · Hace 2 horas</p>
    </div>
  </article>

  <section aria-labelledby="more-title">
    <h2 id="more-title" class="section-title">Más noticias</h2>
    <ul class="stories">
      <li class="story">
        <img src="trail-sierra.svg" alt="" width="320" height="200">
        <p class="kicker">Estado</p>
        <h3><a href="/estado/2026/10/13/nuevo-sendero-en-la-sierra">Abre el nuevo sendero de la sierra con tres miradores</a></h3>
        <p>Tiene 9 km y es gratuito; se recomienda subir antes de las 10.</p>
      </li>
      <li class="story">
        <img src="cover-ciudad.svg" alt="" width="240" height="240">
        <p class="kicker">Ciudad</p>
        <h3><a href="/ciudad/2026/10/13/ruta-nocturna">La ruta nocturna del transporte público amplía su horario hasta la 1:00</a></h3>
        <p>Pasará cada 20 minutos por las cuatro estaciones del centro.</p>
      </li>
      <li class="story">
        <img src="trail-canon.svg" alt="" width="320" height="200">
        <p class="kicker">Cultura</p>
        <h3><a href="/cultura/2026/10/12/festival-del-canon">Festival del cañón: cartel completo</a></h3>
        <p>Tres días de música al aire libre; los boletos salen el lunes.</p>
      </li>
    </ul>
  </section>

  <div class="bottom">
    <section class="opinion" aria-labelledby="opinion-title">
      <h2 id="opinion-title" class="section-title">Opinión</h2>
      <ul class="columns">
        <li class="column">
          <img src="avatar-2.svg" alt="" width="48" height="48">
          <p class="author">Inés Carrillo</p>
          <h3><a href="/opinion/ines-carrillo/agua-tratada">Regar los parques con agua tratada ya no es opcional</a></h3>
        </li>
        <li class="column">
          <img src="avatar-3.svg" alt="" width="48" height="48">
          <p class="author">Tomás Villarreal</p>
          <h3><a href="/opinion/tomas-villarreal/banquetas">Banquetas</a></h3>
        </li>
      </ul>
    </section>

    <aside class="most-read" aria-labelledby="most-read-title">
      <h2 id="most-read-title" class="section-title">Lo más leído</h2>
      <ol>
        <li><a href="/ciudad/2026/10/13/la-presa-llega-al-62">La presa llega al 62 %</a></li>
        <li><a href="/deportes/2026/10/12/final-de-la-liga-estatal">Final de la liga estatal: horarios</a></li>
        <li><a href="/economia/2026/10/12/precio-de-la-tortilla">Sube el precio de la tortilla</a></li>
        <li><a href="/ciudad/2026/10/11/cierre-de-avenida">Cierre parcial de la avenida Juárez</a></li>
      </ol>
    </aside>
  </div>
</main>

<footer class="site-footer">
  <p>© 2026 La Gaceta del Valle · <a href="/aviso-de-privacidad">Aviso de privacidad</a></p>
</footer>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Portada de periódico
   - Cabecera: flexbox (una fila que se parte): fecha, logo y suscripción.
   - Noticia principal: dos capas en la misma celda (foto y texto); la celda
     crece si el titular es largo, y la foto con ella.
   - Más noticias: auto-fit con mínimo protegido por min(); cada noticia ocupa
     4 filas (foto, sección, titular y entradilla) compartidas con subgrid, así
     los titulares de una fila empiezan a la misma altura.
   - Opinión: lo mismo en horizontal: foto, autor y título alineados.
   - Opinión y lo más leído se reparten la fila con flex-wrap (barra lateral
     que se apila): no son una rejilla, son dos bloques que se ponen juntos.
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
    --color-text: #1c1917;
    --color-muted: #57534e;
    --color-line: #d6d3d1;
    --color-accent: #b91c1c;
    --color-paper: #ffffff;
    --color-soft: #f5f5f4;
    --color-focus: #1d4ed8;
    --font-serif: Georgia, "Times New Roman", serif;

    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
  }
}

@layer base {
  body {
    margin: 0;
    background: var(--color-paper);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.45;
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
  /* ─── Cabecera ─── */
  .site-header {
    padding: var(--space-3) var(--space-4) 0;
    border-bottom: 3px solid var(--color-text);
  }

  .masthead {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-2) var(--space-4);
  }

  .date {
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  .logo {
    font-family: var(--font-serif);
    font-size: clamp(1.5rem, 1rem + 2.5vw, 2.4rem);
    font-weight: 700;
    text-decoration: none;
  }

  .subscribe {
    padding: var(--space-1) var(--space-3);
    border-radius: 999px;
    background: var(--color-accent);
    color: #ffffff;
    font-size: 0.85rem;
    font-weight: 700;
    text-decoration: none;
  }

  .sections {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-4);
    margin-top: var(--space-2);
    padding: var(--space-2) 0;
    border-top: 1px solid var(--color-line);
    list-style: none;
    font-size: 0.85rem;
  }

  .sections a {
    text-decoration: none;
  }

  .sections [aria-current="page"] {
    font-weight: 700;
    text-decoration: underline;
    text-decoration-thickness: 2px;
  }

  /* ─── Página ─── */
  .front {
    display: grid;
    gap: var(--space-6);
    max-width: 64rem;
    margin-inline: auto;
    padding: var(--space-4);
  }

  .section-title {
    margin-bottom: var(--space-3);
    padding-bottom: var(--space-1);
    border-bottom: 2px solid var(--color-text);
    font-family: var(--font-serif);
    font-size: 1.2rem;
  }

  .kicker {
    color: var(--color-accent);
    font-size: 0.75rem;
    font-weight: 700;
  }

  /* ─── Noticia principal: foto y texto en la misma celda ─── */
  .lead {
    display: grid;
    min-height: 18rem;
  }

  .lead > * {
    grid-area: 1 / 1;
  }

  /* role="img" con aria-label: la foto es contenido. Va como fondo para que
     llene la celda sin deformarse (object-fit llega en el módulo de responsive). */
  .lead-photo {
    background: #64748b url(lake.svg) center / cover;
  }

  .lead-text {
    display: grid;
    gap: var(--space-2);
    align-self: end;
    padding: var(--space-4);
    background: rgb(28 25 23 / 0.88);
    color: #ffffff;
  }

  .lead-text .kicker {
    color: #fca5a5;
  }

  .lead h1 {
    font-family: var(--font-serif);
    font-size: clamp(1.3rem, 1rem + 1.5vw, 2rem);
    line-height: 1.15;
  }

  .lead h1 a {
    text-decoration: none;
  }

  .lead h1 a:hover {
    text-decoration: underline;
  }

  .summary {
    max-width: 40rem;
  }

  .byline {
    color: #d6d3d1;
    font-size: 0.8rem;
  }

  /* ─── Más noticias: auto-fit + subgrid ─── */
  .stories {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
    gap: var(--space-6) var(--space-4);
    padding: 0;
    list-style: none;
  }

  .story {
    display: grid;
    grid-row: span 4;
    grid-template-rows: subgrid;
    row-gap: var(--space-1);
  }

  .story img {
    width: 100%;
    margin-bottom: var(--space-1);
  }

  .story h3 {
    font-family: var(--font-serif);
    font-size: 1.1rem;
    line-height: 1.25;
  }

  .story h3 a {
    text-decoration: none;
  }

  .story h3 a:hover {
    text-decoration: underline;
  }

  .story p:last-child {
    color: var(--color-muted);
    font-size: 0.9rem;
  }

  /* ─── Opinión y lo más leído ─── */
  .bottom {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-6);
  }

  .opinion {
    flex: 999 1 20rem;
  }

  .most-read {
    flex: 1 1 14rem;
  }

  /* Cada columna: foto a la izquierda, a lo alto de dos filas (autor y título).
     Las columnas de opinión comparten esas filas con subgrid. */
  .columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
    gap: var(--space-3) var(--space-4);
    padding: 0;
    list-style: none;
  }

  .column {
    display: grid;
    grid-row: span 2;
    grid-template-rows: subgrid;
    grid-template-columns: 3rem minmax(0, 1fr);
    column-gap: var(--space-3);
    row-gap: 0;
    padding: var(--space-3);
    background: var(--color-soft);
  }

  .column img {
    grid-row: 1 / -1;
    border-radius: 50%;
  }

  .author {
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  .column h3 {
    font-family: var(--font-serif);
    font-size: 1rem;
    font-style: italic;
    line-height: 1.3;
  }

  .most-read ol {
    display: grid;
    gap: var(--space-2);
    padding-left: 1.4em;
    font-family: var(--font-serif);
  }

  .most-read li::marker {
    color: var(--color-accent);
    font-weight: 700;
  }

  /* ─── Pie ─── */
  .site-footer {
    padding: var(--space-4);
    border-top: 1px solid var(--color-line);
    color: var(--color-muted);
    font-size: 0.8rem;
    text-align: center;
  }
}
```
