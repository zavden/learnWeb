---
example_description: "Ejercicio: tres funciones que miden y cambian la página: reescribe las dos que leen y escriben alternando para que lean todo primero y escriban después (las comprobaciones miran el orden de las operaciones y el resultado), y desplaza una lista con la medida correcta"
example_tags: "javascript|dom|ejercicio|layout-thrashing|medidas|offsettop|scroll"
exercise: true
exercise_title: "Medir sin thrashing"
exercise_instructions: "fitThumbs(thumbs): reescríbela para que lea TODOS los anchos con readWidth y después escriba TODAS las alturas con writeHeight (alto = ancho / 2) || markOverflowing(boxes): lo mismo, con readOverflow primero y writeHasMore después || scrollToRecipe(list, recipe): desplaza la lista para que la receta quede arriba del todo, con una medida relativa a la lista y no a la ventana || Usa solo las funciones de lectura y escritura del principio: las comprobaciones cuentan sus llamadas || Ejecuta hasta que las tres comprobaciones salgan ✓"
exercise_hints: "Guarda las lecturas en un array con map y escribe después con forEach, usando el mismo índice || Las comprobaciones resumen el orden: R×12 W×12 son doce lecturas seguidas y doce escrituras seguidas || La lista tiene position: relative, así que es el offsetParent de las recetas || scrollTo({ top }) del propio elemento desplaza solo ese elemento"
exercise_solution_example: 11-ej-medir-sin-thrashing-solucion.md
exercise_locked_files: index.html,styles.css
example_stage: exercise
example_importance: important
console: true
---

# HTML

```html
<main class="measure">
  <h1>Medir sin thrashing</h1>
  <h2>1. Miniaturas en proporción 2:1</h2>
  <div class="thumbs" id="thumbs">
    <div class="thumb"></div><div class="thumb"></div><div class="thumb"></div>
    <div class="thumb"></div><div class="thumb"></div><div class="thumb"></div>
    <div class="thumb"></div><div class="thumb"></div><div class="thumb"></div>
    <div class="thumb"></div><div class="thumb"></div><div class="thumb"></div>
  </div>
  <h2>2. Opiniones que no caben</h2>
  <div class="boxes" id="boxes">
    <p class="box">Muy rico.</p>
    <p class="box">Llegó a tiempo.<br>Bien empacado.<br>Aroma intenso.<br>Molienda pareja.<br>Repetiré.</p>
    <p class="box">Un poco ácido.<br>Mejor en prensa.</p>
    <p class="box">El molinillo es firme.<br>Muele parejo.<br>Se limpia fácil.<br>Pesa poco.<br>Lo recomiendo.</p>
  </div>
  <h2>3. Ir a una receta</h2>
  <ol class="recipe-list" id="recipe-list" aria-label="Recetas" tabindex="0">
    <li class="recipe">Sopa de lima</li>
    <li class="recipe">Cochinita pibil</li>
    <li class="recipe">Chiles en nogada</li>
    <li class="recipe">Mole poblano</li>
    <li class="recipe">Tamales verdes</li>
    <li class="recipe" id="pozole">Pozole verde</li>
    <li class="recipe">Enmoladas</li>
    <li class="recipe">Esquites</li>
    <li class="recipe">Pan de elote</li>
    <li class="recipe">Café de olla</li>
  </ol>
</main>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}
h1 {
  font-size: 1.3rem;
}
h2 {
  margin: 1rem 0 0.5rem;
  font-size: 1rem;
}
.thumbs {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  width: 300px; /* ancho fijo: las medidas no dependen de la vista previa */
}
.thumb {
  height: 10px;
  background: #93c5fd;
  border-radius: 4px;
}
.boxes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.box {
  width: 12rem;
  height: 60px;
  margin: 0;
  overflow: hidden;
  line-height: 20px;
  border: 1px solid #cbd5e1;
}
.has-more {
  border-bottom: 3px dashed #64748b;
}
.recipe-list {
  position: relative; /* offsetParent de las recetas */
  height: 150px;
  margin: 0;
  padding: 0 0 0 2rem;
  overflow-y: auto;
  border: 2px solid #64748b;
}
.recipe {
  height: 40px;
  margin: 0 0 8px;
  line-height: 40px;
}
```

# JavaScript

```javascript
// Lecturas y escrituras pasan por estas funciones, que apuntan cada operación
// (R = leer, W = escribir) para que las comprobaciones vean el orden.
const operations = [];
function readWidth(element) {
  operations.push('R');
  return element.offsetWidth;
}
function writeHeight(element, px) {
  operations.push('W');
  element.style.height = `${px}px`;
}
function readOverflow(element) {
  operations.push('R');
  return element.scrollHeight > element.clientHeight;
}
function writeHasMore(element, hasMore) {
  operations.push('W');
  element.classList.toggle('has-more', hasMore);
}

// EJERCICIO: las tres funciones hacen lo que deben… a costa del layout, o
// casi. Reescríbelas usando SOLO las funciones de lectura y escritura de
// arriba: primero todas las lecturas, después todas las escrituras.

// TODO 1: cada miniatura debe medir de alto la mitad de su ancho.
//         Lee TODOS los anchos y después escribe TODAS las alturas.
function fitThumbs(thumbs) {
  for (const thumb of thumbs) {
    const width = readWidth(thumb);
    writeHeight(thumb, width / 2);
  }
}

// TODO 2: la clase has-more marca las cajas cuyo texto no cabe.
//         Lee TODOS los desbordamientos y después escribe TODAS las clases.
function markOverflowing(boxes) {
  for (const box of boxes) {
    writeHasMore(box, readOverflow(box));
  }
}

// TODO 3: desplaza la LISTA (no la página) para que la receta quede arriba.
//         getBoundingClientRect().top es relativo a la ventana, no a la lista.
function scrollToRecipe(list, recipe) {
  list.scrollTo({ top: recipe.getBoundingClientRect().top });
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, compute, expected) {
  let actual;
  try {
    actual = compute();
  } catch (error) {
    actual = `${error.name}: ${error.message}`;
  }
  if (Object.is(actual, expected)) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}
// 'RRRWW' → 'R×3 W×2' (si hay muchos tramos, solo los cuatro primeros)
function runsOf(ops) {
  const runs = [];
  for (const op of ops) {
    const last = runs.at(-1);
    if (last && last.op === op) last.count += 1;
    else runs.push({ op, count: 1 });
  }
  const text = runs.slice(0, 4).map((run) => `${run.op}×${run.count}`).join(' ');
  return runs.length > 4 ? `${text} … (${runs.length} tramos)` : text;
}

check('fitThumbs: primero 12 lecturas, después 12 escrituras, y las alturas bien', () => {
  operations.length = 0;
  const thumbs = [...document.querySelectorAll('.thumb')];
  fitThumbs(thumbs);
  const heightsOk = thumbs.every((thumb) => thumb.style.height === `${thumb.offsetWidth / 2}px`);
  return `${runsOf(operations)} | alturas: ${heightsOk ? 'bien' : 'mal'}`;
}, 'R×12 W×12 | alturas: bien');
check('markOverflowing: primero 4 lecturas, después 4 escrituras, y las clases bien', () => {
  operations.length = 0;
  const boxes = [...document.querySelectorAll('.box')];
  markOverflowing(boxes);
  return `${runsOf(operations)} | has-more: ${boxes.map((box) => (box.classList.contains('has-more') ? 'sí' : 'no')).join(' ')}`;
}, 'R×4 W×4 | has-more: no sí no sí');
check('scrollToRecipe deja el Pozole arriba de la lista (scrollTop 240)', () => {
  const list = document.querySelector('#recipe-list');
  scrollToRecipe(list, document.querySelector('#pozole'));
  return list.scrollTop;
}, 240);
```
