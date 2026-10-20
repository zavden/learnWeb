---
example_description: "Un mosaico tipo masonry calculado en JavaScript: el número de columnas sale del ancho del contenedor, cada tarjeta va a la columna más baja y todo se hace en tres pasadas (escribir anchos, leer todas las alturas, escribir todas las posiciones) para que el layout se calcule una sola vez"
example_tags: "javascript|dom|profesional|masonry|medidas|layout-thrashing|getboundingclientrect"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="board">
  <h1>Recetas de la comunidad</h1>
  <p class="controls">
    <label for="columns">Columnas</label>
    <select id="columns">
      <option value="auto">Automático</option>
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
    </select>
  </p>
  <div class="masonry" id="masonry"></div>
  <p id="layout-info" role="status"></p>
</main>
```

# CSS

```css
html {
  overflow-y: scroll; /* la barra siempre reservada: el ancho no cambia al crecer la página */
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #f1f5f9;
}
.board {
  max-width: 64rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  margin-top: 0;
  font-size: 1.3rem;
}
select {
  font: inherit;
}
.masonry {
  position: relative; /* las tarjetas se colocan con top/left dentro */
}
.card {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  margin: 0;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
}
.photo {
  aspect-ratio: var(--ratio);
  background: linear-gradient(135deg, hsl(var(--hue) 70% 72%), hsl(var(--hue) 60% 45%));
}
.card h2 {
  margin: 0.5rem 0.75rem 0.25rem;
  font-size: 1rem;
}
.card p {
  margin: 0 0.75rem 0.75rem;
  font-size: 0.9rem;
  color: #475569;
}
```

# JavaScript

```javascript
// MOSAICO DE RECETAS (MASONRY) CALCULADO EN JAVASCRIPT.
//
// Decisiones:
// - Columnas: tantas de al menos MIN_COLUMN px como quepan en el clientWidth
//   del contenedor (o las que elija el <select>).
// - Tres pasadas, sin intercalar (lección «Medidas y layout»):
//   1. ESCRIBIR el ancho de todas las tarjetas;
//   2. LEER todas las alturas (aquí se calcula el layout, una vez);
//   3. ESCRIBIR todas las posiciones y el alto del contenedor.
//   Las alturas dependen del ancho (la foto tiene aspect-ratio y el texto se
//   parte en líneas), por eso hay que medir después de fijar el ancho.
// - Cada tarjeta va a la columna más baja en ese momento (algoritmo voraz).
// - Las tarjetas están en el DOM en el orden de los datos, que es también el
//   orden de lectura y de Tab, aunque se vean en columnas.
// - Con CSS Grid y grid-template-rows: masonry esto no haría falta, pero aún no
//   está en todos los navegadores.
// - Si cambia el ancho del contenedor, hay que volver a calcular: lo hará un
//   ResizeObserver (módulo «APIs del navegador»); aquí, el <select>.
//
// Alcance: HTML, CSS (módulos 1-7), el capítulo de JavaScript y el módulo «El DOM».

const MIN_COLUMN = 200;
const GAP = 12;
const recipes = [
  { title: 'Chiles en nogada', note: 'De agosto a septiembre, con granada fresca.', ratio: '4 / 5', hue: 0 },
  { title: 'Sopa de lima', note: 'Caldo de pollo, lima agria y tiras de tortilla.', ratio: '4 / 3', hue: 70 },
  { title: 'Mole poblano', note: 'Más de veinte ingredientes y una tarde entera.', ratio: '1 / 1', hue: 20 },
  { title: 'Esquites', note: 'Elote desgranado con epazote, mayonesa y chile.', ratio: '3 / 2', hue: 50 },
  { title: 'Pozole verde', note: 'Pepita, tomatillo y maíz cacahuazintle.', ratio: '3 / 4', hue: 110 },
  { title: 'Pan de muerto', note: 'Azahar, mantequilla y huesitos de masa.', ratio: '4 / 3', hue: 35 },
  { title: 'Cochinita pibil', note: 'Achiote, naranja agria y hojas de plátano.', ratio: '2 / 3', hue: 15 },
  { title: 'Café de olla', note: 'Piloncillo, canela y jarro de barro.', ratio: '1 / 1', hue: 25 },
  { title: 'Tamales de rajas', note: 'Chile poblano, queso y salsa verde.', ratio: '3 / 2', hue: 90 },
  { title: 'Marquesitas', note: 'Barquillo crujiente con queso de bola.', ratio: '4 / 5', hue: 45 },
];

const container = document.querySelector('#masonry');
const columnSelect = document.querySelector('#columns');
const layoutInfo = document.querySelector('#layout-info');

const cards = recipes.map((recipe) => {
  const card = document.createElement('article');
  card.className = 'card';
  const photo = document.createElement('div');
  photo.className = 'photo';
  photo.setAttribute('aria-hidden', 'true'); // decorativa
  photo.style.setProperty('--ratio', recipe.ratio);
  photo.style.setProperty('--hue', recipe.hue);
  const title = document.createElement('h2');
  title.textContent = recipe.title;
  const note = document.createElement('p');
  note.textContent = recipe.note;
  card.append(photo, title, note);
  return card;
});
container.append(...cards);

function layout() {
  // Lectura 0: el ancho disponible (sin la barra de scroll).
  const width = container.clientWidth;
  const chosen = columnSelect.value;
  const columns = chosen === 'auto'
    ? Math.max(1, Math.floor((width + GAP) / (MIN_COLUMN + GAP)))
    : Number(chosen);
  const columnWidth = (width - GAP * (columns - 1)) / columns;

  // 1. Escrituras: todos los anchos.
  for (const card of cards) card.style.width = `${columnWidth}px`;
  // 2. Lecturas: todas las alturas (un solo layout).
  const heights = cards.map((card) => card.getBoundingClientRect().height);
  // 3. Cálculo y escrituras: todas las posiciones.
  const columnHeights = new Array(columns).fill(0);
  cards.forEach((card, index) => {
    const column = columnHeights.indexOf(Math.min(...columnHeights));
    card.style.left = `${column * (columnWidth + GAP)}px`;
    card.style.top = `${columnHeights[column]}px`;
    columnHeights[column] += heights[index] + GAP;
  });
  const tallest = Math.max(...columnHeights) - GAP;
  container.style.height = `${tallest}px`;
  layoutInfo.textContent = `${columns} columna(s) de ${Math.round(columnWidth)} px`;
  return { columns, columnHeights: columnHeights.map((height) => height - GAP), heights, tallest };
}

// Cambiar el número de columnas (eventos: módulo siguiente).
columnSelect.addEventListener('change', layout);

// ── Comprobaciones al cargar ────────────────────────────────────────────
function audit(label, ok) {
  if (ok) console.log('✅', label);
  else console.error('❌', label);
}
function overlaps(a, b) {
  return a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
}
function verify(result) {
  const rects = cards.map((card) => card.getBoundingClientRect());
  const box = container.getBoundingClientRect();
  const anyOverlap = rects.some((a, i) => rects.some((b, j) => i < j && overlaps(a, b)));
  audit(`${result.columns} columna(s): ninguna tarjeta se pisa con otra`, !anyOverlap);
  audit('todas dentro del contenedor', rects.every((rect) => rect.left >= box.left - 0.5 && rect.right <= box.right + 0.5));
  audit('el contenedor mide lo que la columna más alta', Math.abs(box.height - result.tallest) < 1);
  const spread = Math.max(...result.columnHeights) - Math.min(...result.columnHeights);
  audit('columnas equilibradas (diferencia ≤ la tarjeta más alta + el hueco)', spread <= Math.max(...result.heights) + GAP + 0.5);
}

const auto = layout();
console.log(`automático → ${auto.columns} columna(s) (varía con el ancho de la vista previa)`);
verify(auto);
columnSelect.value = '1';
verify(layout());
columnSelect.value = '3';
verify(layout());
columnSelect.value = 'auto';
layout();
```
