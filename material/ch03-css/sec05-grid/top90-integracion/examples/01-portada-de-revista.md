---
example_description: "La portada de una revista de jardinería: esqueleto con grid-template-areas, la columna de opinión a lo alto de dos filas, el reportaje principal con el titular superpuesto a la foto y una franja de breves con auto-fill"
example_tags: "css|grid|grid-template-areas|capas|auto-fill|minmax|revista"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<main class="front">
  <header class="masthead">
    <p class="brand">Raíz</p>
    <p class="issue">Número 48 · octubre de 2026</p>
  </header>

  <article class="lead">
    <div class="lead-image"></div>
    <div class="lead-text">
      <p class="kicker">Reportaje</p>
      <h2><a href="/revista/48/huertos-en-azoteas">Los huertos que cambiaron las azoteas de Monterrey</a></h2>
    </div>
  </article>

  <article class="story second">
    <p class="kicker">Guía</p>
    <h3><a href="/revista/48/compost-en-departamento">Compost en un departamento sin olores</a></h3>
    <p>Un balde con tapa, cartón y diez minutos a la semana.</p>
  </article>

  <article class="story third">
    <p class="kicker">Entrevista</p>
    <h3><a href="/revista/48/semillas-criollas">La guardiana de las semillas criollas</a></h3>
    <p>Lleva veinte años intercambiando maíz azul con sus vecinas.</p>
  </article>

  <aside class="opinion" aria-labelledby="opinion-title">
    <h3 id="opinion-title">Opinión</h3>
    <blockquote>
      <p>«Una ciudad que riega sus parques con agua tratada no tiene que elegir entre sombra y agua potable.»</p>
      <footer>— Inés Carrillo, urbanista</footer>
    </blockquote>
  </aside>

  <section class="briefs" aria-labelledby="briefs-title">
    <h3 id="briefs-title">Breves</h3>
    <ul>
      <li><a href="/revista/48/heladas-tempranas">Heladas tempranas en el Bajío</a></li>
      <li><a href="/revista/48/feria-de-cactaceas">Feria de cactáceas en Saltillo</a></li>
      <li><a href="/revista/48/riego-por-goteo">Riego por goteo con botellas</a></li>
      <li><a href="/revista/48/abejas-nativas">Abejas nativas sin aguijón</a></li>
    </ul>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Portada de revista
   - Esqueleto: grid-template-areas en dos columnas (2fr y 1fr, las dos con
     mínimo 0 para que ninguna palabra larga las ensanche). La opinión ocupa
     dos filas de alto; la cabecera, el reportaje y los breves, toda la fila.
   - Reportaje: dos capas en la misma celda (foto de fondo y texto abajo).
   - Breves: una rejilla interior con auto-fill y el mínimo protegido con min().
   ────────────────────────────────────────────────────────────────────────── */
* {
  box-sizing: border-box;
}

body {
  margin: 8px;
  color: #1c1917;
  font-family: system-ui, sans-serif;
  line-height: 1.4;
}

a {
  color: inherit;
}

a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.front {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  grid-template-areas:
    "masthead masthead"
    "lead     lead"
    "second   opinion"
    "third    opinion"
    "briefs   briefs";
  gap: 12px;
  max-width: 44rem;
}

.masthead { grid-area: masthead; }
.lead     { grid-area: lead; }
.second   { grid-area: second; }
.third    { grid-area: third; }
.opinion  { grid-area: opinion; }
.briefs   { grid-area: briefs; }

/* Cabecera: nombre y número en una fila (flexbox: una sola dimensión). */
.masthead {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 12px;
  border-bottom: 3px solid #1c1917;
}

.masthead p {
  margin: 0;
}

.brand {
  font-family: Georgia, serif;
  font-size: 2.2rem;
  font-weight: bold;
}

.issue {
  color: #57534e;
  font-size: 0.8rem;
}

/* Reportaje: foto y texto en la misma celda; la celda mide lo que la capa más
   alta, con un mínimo de 12rem. */
.lead {
  display: grid;
  min-height: 12rem;
}

.lead > * {
  grid-area: 1 / 1;
}

.lead-image {
  background: #7dd3fc url(lake.svg) center / cover;
}

.lead-text {
  align-self: end;
  padding: 10px 14px;
  background: rgb(28 25 23 / 0.85);
  color: #ffffff;
}

.lead-text h2 {
  margin: 0;
  font-family: Georgia, serif;
  font-size: 1.4rem;
  line-height: 1.2;
}

.kicker {
  margin: 0 0 2px;
  color: #b45309;
  font-size: 0.75rem;
  font-weight: bold;
}

.lead-text .kicker {
  color: #fcd34d;
}

.story h3,
.opinion h3,
.briefs h3 {
  margin: 0 0 4px;
  font-family: Georgia, serif;
  font-size: 1.05rem;
  line-height: 1.25;
}

.story p:last-child {
  margin: 0;
  color: #44403c;
  font-size: 0.85rem;
}

.second {
  padding-bottom: 12px;
  border-bottom: 1px solid #d6d3d1;
}

/* Opinión: dos filas de alto; el fondo la marca como columna aparte. */
.opinion {
  padding: 10px;
  background: #fef3c7;
}

.opinion blockquote {
  margin: 0;
  font-family: Georgia, serif;
  font-style: italic;
}

.opinion blockquote p {
  margin: 0 0 6px;
}

.opinion footer {
  color: #57534e;
  font-size: 0.8rem;
  font-style: normal;
}

/* Breves: tantas columnas de 8rem como quepan; con min(), nunca más anchas que
   la franja. */
.briefs {
  padding-top: 8px;
  border-top: 3px solid #1c1917;
}

.briefs ul {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 8rem), 1fr));
  gap: 8px 16px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.85rem;
}

.briefs li {
  padding-left: 8px;
  border-left: 3px solid #b45309;
}
```
