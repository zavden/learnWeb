---
example_description: "Tarjetas de rutas de senderismo: cada una apila foto, pie de foto y dificultad en la misma celda grid y las alinea con *-self; las tarjetas se reparten en columnas auto-fit y crecen si el texto lo pide"
example_tags: "css|grid|capas|grid-area|align-self|justify-self|auto-fit|tarjetas"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<section aria-labelledby="routes-title">
  <h2 id="routes-title" class="title">Rutas para este fin de semana</h2>
  <ul class="routes">
    <li class="route">
      <div class="route-photo is-lake"></div>
      <p class="level is-easy">Fácil</p>
      <div class="route-caption">
        <h3><a href="/rutas/laguna-azul">Laguna Azul</a></h3>
        <p>6 km · 2 h · sombra casi todo el camino</p>
      </div>
    </li>
    <li class="route">
      <div class="route-photo is-sierra"></div>
      <p class="level is-hard">Difícil</p>
      <div class="route-caption">
        <h3><a href="/rutas/cumbre-del-picacho">Cumbre del Picacho</a></h3>
        <p>14 km · 6 h · 1100 m de desnivel; sal antes de las 7 para bajar antes de la tormenta de la tarde</p>
      </div>
    </li>
    <li class="route">
      <div class="route-photo is-canyon"></div>
      <p class="level">Media</p>
      <div class="route-caption">
        <h3><a href="/rutas/canon-del-rio">Cañón del río</a></h3>
        <p>9 km · 4 h · lleva calzado que se pueda mojar</p>
      </div>
    </li>
  </ul>
</section>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Rutas con pie de foto
   - Rejilla de tarjetas: auto-fit, mínimo de 10rem protegido con min().
     Las tarjetas de una fila miden lo mismo (la fila las estira).
   - Cada tarjeta: TRES capas en la celda 1 / 1. La foto (fondo decorativo) se
     estira; la dificultad va arriba a la izquierda; el pie, abajo. Si el pie es
     largo, la celda crece y la foto con ella: nada se sale ni se tapa.
   ────────────────────────────────────────────────────────────────────────── */
* {
  box-sizing: border-box;
}

body {
  margin: 8px;
  color: #1e293b;
  font-family: system-ui, sans-serif;
}

.title {
  margin: 0 0 8px;
  font-size: 1.15rem;
}

.routes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.route {
  display: grid;
  min-height: 11rem;
  overflow: hidden;              /* recorta la foto con las esquinas redondeadas */
  border-radius: 12px;
}

.route > * {
  grid-area: 1 / 1;
}

.route-photo {
  background-color: #94a3b8;
  background-position: center;
  background-size: cover;
}

.is-lake   { background-image: url(lake.svg); }
.is-sierra { background-image: url(trail-sierra.svg); }
.is-canyon { background-image: url(trail-canon.svg); }

.level {
  justify-self: start;
  align-self: start;
  margin: 8px;
  padding: 1px 8px;
  border-radius: 999px;
  background: #fef3c7;
  color: #78350f;
  font-size: 0.75rem;
  font-weight: bold;
}

.level.is-easy {
  background: #dcfce7;
  color: #14532d;
}

.level.is-hard {
  background: #fee2e2;
  color: #7f1d1d;
}

.route-caption {
  align-self: end;
  padding: 8px 10px;
  background: rgb(15 23 42 / 0.85);
  color: #ffffff;
  font-size: 0.8rem;
}

.route-caption h3 {
  margin: 0;
  font-size: 1rem;
}

.route-caption p {
  margin: 2px 0 0;
}

.route-caption a {
  color: inherit;
}

.route-caption a:focus-visible {
  outline: 3px solid #fde68a;
  outline-offset: 2px;
}
```
