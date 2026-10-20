---
example_stage: final-solution
example_description: "Solución: repeat(auto-fill, minmax(min(100%, 8rem), 1fr)) en las listas, grid-row: span 4 con grid-template-rows: subgrid en cada tarjeta y la insignia en la celda de la foto con justify-self: end"
example_tags: "css|solucion|grid|auto-fill|min|subgrid|capas"
console: true
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

/* ✅ 1: auto-fill crea tantas columnas de 8rem como quepan y 1fr las reparte.
   min(100%, 8rem) baja el mínimo al ancho de la lista cuando es más estrecha que
   8rem, como en la columna lateral. */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 8rem), 1fr));
  gap: 12px;
  max-width: 420px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* La columna lateral: 7rem. */
.sidebar {
  width: 7rem;
}

/* ✅ 2: la tarjeta ocupa 4 filas de la rejilla y las usa con subgrid: la fila del
   título mide lo que el título más alto, y los botones quedan alineados. Dentro,
   su propio row-gap de 6px. */
.card {
  display: grid;
  grid-row: span 4;
  grid-template-rows: subgrid;
  row-gap: 6px;
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

/* ✅ 3: foto e insignia en la misma celda; la insignia, en la esquina. */
.media {
  display: grid;
}

.media > * {
  grid-area: 1 / 1;
}

.media img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 6px;
}

.badge {
  justify-self: end;
  align-self: start;
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
