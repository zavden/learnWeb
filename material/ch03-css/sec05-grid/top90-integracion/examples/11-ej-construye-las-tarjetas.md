---
exercise: true
exercise_title: "Construye las tarjetas de talleres"
exercise_instructions: "Convierte las dos listas .cards en rejillas de columnas de al menos 8rem, tantas como quepan, con 12px de separación, y que en la columna lateral de 7rem no se salgan (TODO 1) || Haz que cada tarjeta use cuatro filas de la rejilla para la foto, el título, la fecha y el botón, de modo que los botones de una fila queden a la misma altura (TODO 2) || Pon la insignia encima de la foto, en su esquina de arriba a la derecha (TODO 3) || Comprueba que las cuatro líneas de la lista marcan ✅"
exercise_hints: "repeat() con auto-fill y minmax(). El mínimo de 8rem no cabe en 7rem: min() elige el menor de dos valores || Una tarjeta abarca filas con span y las comparte con subgrid; dale su propio row-gap si quieres menos espacio dentro || Dos elementos en la misma celda: grid-area: 1 / 1 en los dos. Después, justify-self y align-self"
exercise_solution_example: 11-ej-construye-las-tarjetas-solucion.md
exercise_locked_files: index.html,script.js
example_stage: exercise
console: true
example_description: "Ejercicio: construir con grid unas tarjetas de talleres: columnas auto-fill protegidas con min(), filas alineadas con subgrid y una insignia superpuesta a la foto; un pequeño script lo comprueba"
example_tags: "css|ejercicio|grid|auto-fill|min|subgrid|capas"
---

# HTML

```html
<h2 class="title">Próximos talleres</h2>
<ul class="cards main-cards">
  <li class="card">
    <div class="media">
      <img src="plant-monstera.svg" alt="" width="240" height="240">
      <p class="badge">Quedan 3</p>
    </div>
    <h3>Esquejes de monstera</h3>
    <p class="date">Sáb 17 oct · 10:00</p>
    <a class="button" href="/talleres/esquejes" aria-label="Inscribirme: Esquejes de monstera">Inscribirme</a>
  </li>
  <li class="card">
    <div class="media">
      <img src="plant-calathea.svg" alt="" width="240" height="240">
      <p class="badge">Nuevo</p>
    </div>
    <h3>Kokedamas: bolas de musgo con helechos y calatheas</h3>
    <p class="date">Dom 18 oct · 11:00</p>
    <a class="button" href="/talleres/kokedamas" aria-label="Inscribirme: Kokedamas">Inscribirme</a>
  </li>
  <li class="card">
    <div class="media">
      <img src="plant-cactus.svg" alt="" width="240" height="240">
      <p class="badge">Quedan 8</p>
    </div>
    <h3>Injertos de cactus</h3>
    <p class="date">Sáb 24 oct · 10:00</p>
    <a class="button" href="/talleres/injertos" aria-label="Inscribirme: Injertos de cactus">Inscribirme</a>
  </li>
</ul>

<aside class="sidebar" aria-labelledby="side-title">
  <h2 id="side-title" class="title">En línea</h2>
  <ul class="cards side-cards">
    <li class="card">
      <div class="media">
        <img src="plant-pothos.svg" alt="" width="240" height="240">
        <p class="badge">Gratis</p>
      </div>
      <h3>Huerto en el balcón</h3>
      <p class="date">Jue 22 oct · 19:00</p>
      <a class="button" href="/talleres/huerto-en-balcon" aria-label="Inscribirme: Huerto en el balcón">Inscribirme</a>
    </li>
  </ul>
</aside>

<ul class="checklist">
  <li>Varias columnas iguales: <output id="check-columns">…</output></li>
  <li>En la columna de 7rem, nada se sale: <output id="check-narrow">…</output></li>
  <li>Botones de la primera fila, alineados: <output id="check-buttons">…</output></li>
  <li>La insignia, en la esquina de la foto: <output id="check-badge">…</output></li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  font-size: 0.8rem;
}

.title {
  margin: 10px 0 6px;
  font-size: 1rem;
}

/* TODO 1: las dos listas, rejillas de columnas de al menos 8rem (tantas como
   quepan), con 12px de separación. En la columna lateral de 7rem, una columna de
   8rem se saldría: protege el mínimo. */
.cards {
  max-width: 420px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* La columna lateral: 7rem. */
.sidebar {
  width: 7rem;
}

/* TODO 2: cada tarjeta, cuatro filas de la rejilla (foto, título, fecha y botón)
   compartidas con las demás tarjetas, y 6px entre ellas. */
.card {
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
}

.card > * {
  margin: 0;
}

.card h3 {
  font-size: 0.9rem;
  line-height: 1.25;
}

.date {
  color: #475569;
}

/* TODO 3: la insignia, encima de la foto y en su esquina de arriba a la derecha. */
.media img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 6px;
}

.badge {
  margin: 6px;
  padding: 1px 8px;
  border-radius: 999px;
  background: #9d174d;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: bold;
}

.button {
  justify-self: start;
  padding: 4px 12px;
  border-radius: 999px;
  background: #0f766e;
  color: #ffffff;
  font-weight: bold;
  text-decoration: none;
}

.button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.checklist {
  padding-left: 1.2em;
  color: #475569;
}

.checklist output {
  color: #1e293b;
  font-weight: bold;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Este script solo mide las cajas y
// escribe ✅ o ❌ en la lista (y en la consola). No hace falta tocarlo: se vuelve a
// ejecutar con cada cambio.
function check(id, ok, detail) {
  const text = `${ok ? '✅' : '❌'} ${detail}`;
  document.getElementById(id).textContent = text;
  console.log(`${id}: ${text}`);
}

const mainCards = document.querySelector('.main-cards');
const mainStyle = getComputedStyle(mainCards);
const columns = mainStyle.display === 'grid' ? mainStyle.gridTemplateColumns.split(' ').map(parseFloat) : [];
const equal = columns.length >= 2 && Math.max(...columns) - Math.min(...columns) < 1;
check('check-columns', equal, columns.length ? `${columns.length} columnas de ${columns.map(Math.round).join(', ')} px` : 'no es una rejilla');

const sideCards = document.querySelector('.side-cards');
const sidebar = document.querySelector('.sidebar').getBoundingClientRect();
const sideCard = sideCards.querySelector('.card').getBoundingClientRect();
const isGrid = getComputedStyle(sideCards).display === 'grid';
const fits = sideCards.scrollWidth <= sideCards.clientWidth && sideCard.right <= sidebar.right + 0.5;
check('check-narrow', isGrid && fits,
  !isGrid ? 'la lista lateral no es una rejilla' : fits ? 'cabe' : `la tarjeta se sale ${Math.round(sideCard.right - sidebar.right)} px`);

const cards = [...mainCards.querySelectorAll('.card')];
const firstTop = cards[0].getBoundingClientRect().top;
const firstRow = cards.filter((card) => Math.abs(card.getBoundingClientRect().top - firstTop) < 1);
const buttonTops = firstRow.map((card) => Math.round(card.querySelector('.button').getBoundingClientRect().top));
const aligned = firstRow.length >= 2 && Math.max(...buttonTops) - Math.min(...buttonTops) < 1;
const heightsCount = new Set(buttonTops).size;
check('check-buttons', aligned, firstRow.length < 2 ? 'solo hay una tarjeta en la primera fila' : aligned ? 'a la misma altura' : `a ${heightsCount} alturas distintas`);

const image = cards[0].querySelector('img').getBoundingClientRect();
const badge = cards[0].querySelector('.badge').getBoundingClientRect();
const inCorner = Math.abs(image.right - 6 - badge.right) < 2 && Math.abs(image.top + 6 - badge.top) < 2;
check('check-badge', inCorner, inCorner ? 'arriba a la derecha' : 'no está en la esquina de la foto');
```
