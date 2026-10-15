---
example_description: "Durante dragenter y dragover, los datos del arrastre están protegidos: getData devuelve '' y solo se pueden leer los tipos (dataTransfer.types); una zona que decide si acepta con getData no acepta nunca, y la correcta decide con types (un tipo propio, application/x-ingredient) y lee los datos en drop"
example_tags: "javascript|drag-and-drop|getdata|types|dragover|modo-protegido|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>A la olla</h1>
  <p class="chips">
    <span class="chip" draggable="true">Epazote</span>
    <span class="chip" draggable="true">Chile guajillo</span>
    <span class="chip" draggable="true">Maíz pozolero</span>
    <a href="/recetas/pozole-rojo">Receta completa</a>
  </p>
  <div class="pots">
    <section id="pot-buggy" class="pot" aria-label="Olla 🐛"><h2>🐛 Decide con getData</h2><ul class="items"></ul></section>
    <section id="pot-fixed" class="pot" aria-label="Olla ✅"><h2>✅ Decide con types</h2><ul class="items"></ul></section>
  </div>
  <p class="hint">Sin ratón: los ingredientes también se añaden con <button id="add-all" type="button">Añadir todos a la olla ✅</button></p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
main {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin: 0 0 0.5rem;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
.chip {
  padding: 0.25rem 0.6rem;
  border-radius: 1rem;
  background: #dcfce7;
  cursor: grab;
}
a {
  color: #1d4ed8;
}
.pots {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.pot {
  min-height: 6rem;
  padding: 0.4rem 0.6rem;
  border: 2px dashed #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
}
.pot h2 {
  margin: 0;
  font-size: 0.9rem;
}
.items {
  margin: 0.25rem 0 0;
  padding-left: 1.2rem;
}
.hint {
  font-size: 0.9rem;
}
button {
  font: inherit;
  padding: 0.1rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:focus-visible,
a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 1px;
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
const INGREDIENT = 'application/x-ingredient'; // un tipo propio: solo lo ponemos nosotros
const potBuggy = document.querySelector('#pot-buggy');
const potFixed = document.querySelector('#pot-fixed');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
function addToPot(pot, ingredient) {
  const item = document.createElement('li');
  item.textContent = ingredient;
  pot.querySelector('.items').append(item);
}

const reported = new Set(); // un aviso por zona y arrastre
document.addEventListener('dragstart', (event) => {
  reported.clear();
  const chip = event.target.closest?.('.chip');
  if (!chip) return; // el enlace se arrastra con sus propios datos (una URL)
  event.dataTransfer.setData(INGREDIENT, chip.textContent);
  event.dataTransfer.setData('text/plain', chip.textContent);
});
function reportOnce(pot, text) {
  if (!reported.has(pot)) logLine(text);
  reported.add(pot);
}

// 🐛 Durante el arrastre, getData devuelve '' (modo protegido: una página
//    no puede leer lo que arrastras por encima de ella hasta que lo sueltas).
potBuggy.addEventListener('dragover', (event) => {
  const ingredient = event.dataTransfer.getData(INGREDIENT);
  if (ingredient) event.preventDefault();
  // (El navegador puede añadir tipos propios a la lista: aquí solo miramos el nuestro.)
  const hasType = event.dataTransfer.types.includes(INGREDIENT);
  reportOnce(potBuggy, `🐛 dragover → getData: '${ingredient}' · ¿types incluye ${INGREDIENT}? ${hasType} → ${ingredient ? 'acepto' : 'no acepto'}`);
});
potBuggy.addEventListener('drop', (event) => {
  addToPot(potBuggy, event.dataTransfer.getData(INGREDIENT));
});

// ✅ Los TIPOS sí se pueden leer: decide con types; los datos, en drop.
potFixed.addEventListener('dragover', (event) => {
  const isIngredient = event.dataTransfer.types.includes(INGREDIENT);
  if (isIngredient) event.preventDefault();
  reportOnce(potFixed, `✅ dragover → ${isIngredient ? `types incluye ${INGREDIENT} → acepto` : 'no es un ingrediente → no acepto'}`);
});
potFixed.addEventListener('drop', (event) => {
  event.preventDefault();
  const ingredient = event.dataTransfer.getData(INGREDIENT); // en drop, ya legible
  addToPot(potFixed, ingredient);
  logLine(`✅ drop → getData: ${ingredient}`);
});

document.querySelector('#add-all').addEventListener('click', () => {
  for (const chip of document.querySelectorAll('.chip')) addToPot(potFixed, chip.textContent);
  logLine('✅ botón → los tres ingredientes, a la olla ✅');
});
logLine('Listo: arrastra un ingrediente a cada olla, y después el enlace «Receta completa»');

// Un DragEvent creado desde JS con new DataTransfer() no está protegido:
// este bicho solo se ve con un arrastre de verdad, con el ratón.
```
