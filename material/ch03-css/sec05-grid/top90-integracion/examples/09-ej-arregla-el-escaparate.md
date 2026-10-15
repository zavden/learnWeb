---
exercise: true
exercise_title: "Arregla el escaparate"
exercise_instructions: "Las cuatro columnas deberían medir lo mismo, pero el código largo de la calathea ensancha la suya: quítale el mínimo a las columnas y deja que el código se parta (TODO 1) || La monstera destacada debería ocupar dos columnas y ocupa una (TODO 2) || Solo la primera fila mide 7rem; la segunda mide lo que su texto: haz que todas midan 7rem (TODO 3) || Con solo dos novedades, sus tarjetas se estiran: que midan lo mismo que una columna del escaparate (TODO 4) || Comprueba que las cuatro líneas de la lista marcan ✅"
exercise_hints: "1fr es minmax(auto, 1fr), y auto es el ancho mínimo del contenido. El texto que no se puede partir necesita overflow-wrap || Los números de grid-column son líneas, no columnas || Las filas que no están en grid-template-rows son implícitas: ¿qué propiedad les da tamaño? || auto-fit colapsa las pistas vacías; su hermano las conserva"
exercise_solution_example: 09-ej-arregla-el-escaparate-solucion.md
exercise_locked_files: index.html,script.js
example_stage: exercise
console: true
example_description: "Ejercicio: un escaparate en grid con cuatro errores (1fr que no iguala por un código largo, una línea final mal contada, filas implícitas sin tamaño y auto-fit en lugar de auto-fill) que un pequeño script comprueba en directo"
example_tags: "css|ejercicio|grid|minmax|span|grid-auto-rows|auto-fill"
---

# HTML

```html
<h2 class="title">Más vendidas</h2>
<ul class="products">
  <li class="tile is-featured"><b>Monstera variegada</b> La estrella de la temporada</li>
  <li class="tile"><b>Pothos</b> <span class="sku">POT-DOR-12</span></li>
  <li class="tile"><b>Calathea</b> <span class="sku">CAL_MEDALLON_ROSEOPICTA_XL</span></li>
  <li class="tile"><b>Peperomia</b> <span class="sku">PEP-OBT-10</span></li>
  <li class="tile"><b>Cactus</b> <span class="sku">CAC-CAN-14</span></li>
  <li class="tile"><b>Sansevieria</b> <span class="sku">SAN-TRI-17</span></li>
  <li class="tile"><b>Helecho</b> <span class="sku">HEL-BOS-15</span></li>
</ul>

<h2 class="title">Novedades</h2>
<ul class="news">
  <li class="tile"><b>Ficus lira</b> <span class="sku">FIC-LIR-20</span></li>
  <li class="tile"><b>Alocasia</b> <span class="sku">ALO-POL-12</span></li>
</ul>

<ul class="checklist">
  <li>Las cuatro columnas, iguales: <output id="check-columns">…</output></li>
  <li>La destacada, dos columnas: <output id="check-featured">…</output></li>
  <li>Todas las filas, de 7rem: <output id="check-rows">…</output></li>
  <li>Las novedades, del ancho de una columna: <output id="check-news">…</output></li>
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
  margin: 10px 0 4px;
  font-size: 1rem;
}

.products,
.news {
  display: grid;
  gap: 8px;
  width: 400px;
  margin: 0;
  padding: 0;
  outline: 2px dashed #0f766e;
  list-style: none;
}

/* TODO 1: cuatro columnas que deberían medir lo mismo. El código de la calathea
   no se puede partir y ensancha su columna. Quita el mínimo automático a las
   columnas y deja que el código (.sku) se parta por cualquier letra. */
/* TODO 3: solo la primera fila mide 7rem. Haz que TODAS las filas midan 7rem. */
.products {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: 7rem;
}

/* TODO 2: la destacada debería ocupar las dos primeras columnas. */
.is-featured {
  grid-column: 1 / 2;
  border-color: #b45309;
  background: #fef3c7;
}

/* TODO 4: con dos novedades, auto-fit las estira. Que midan lo mismo que una
   columna del escaparate, aunque haya pocas. */
.news {
  grid-template-columns: repeat(auto-fit, minmax(5.5rem, 1fr));
}

.tile {
  padding: 6px;
  border: 1px solid #0f766e;
  background: #ccfbf1;
}

.tile b {
  display: block;
}

.sku {
  color: #334155;
  font-family: ui-monospace, monospace;
  font-size: 0.7rem;
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

const products = document.querySelector('.products');
// getComputedStyle devuelve las columnas ya resueltas en px: "94px 94px 94px 94px"
const columns = getComputedStyle(products).gridTemplateColumns.split(' ').map(parseFloat);
const widest = Math.max(...columns);
const narrowest = Math.min(...columns);
check('check-columns', columns.length === 4 && widest - narrowest < 1,
  `${columns.map((width) => Math.round(width)).join(', ')} px`);

const gap = parseFloat(getComputedStyle(products).columnGap);
const featured = document.querySelector('.is-featured').getBoundingClientRect().width;
const twoColumns = columns[0] + gap + columns[1];
check('check-featured', Math.abs(featured - twoColumns) < 1,
  `mide ${Math.round(featured)} px (dos columnas: ${Math.round(twoColumns)})`);

const heights = [...products.children].map((tile) => tile.getBoundingClientRect().height);
const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
const allRows = heights.every((height) => Math.abs(height - 7 * rem) < 1);
check('check-rows', allRows, `alturas: ${[...new Set(heights.map(Math.round))].join(', ')} px`);

const newsTile = document.querySelector('.news .tile').getBoundingClientRect().width;
check('check-news', Math.abs(newsTile - columns[0]) < 1,
  `mide ${Math.round(newsTile)} px (una columna: ${Math.round(columns[0])})`);
```
