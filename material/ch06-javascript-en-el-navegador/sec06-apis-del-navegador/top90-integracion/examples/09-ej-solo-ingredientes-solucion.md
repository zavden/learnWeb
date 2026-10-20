---
example_description: "Solución: la olla decide en dragover con dataTransfer.types (el tipo propio application/x-ingredient), cancela y pone dropEffect = 'copy'; en drop cancela la acción por defecto y lee el nombre del tipo propio. Los enlaces y el texto se rechazan"
example_tags: "javascript|drag-and-drop|datatransfer|types|dragover|drop|solucion"
example_stage: final-solution
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
    <a href="/recetas/pozole-rojo">Receta completa</a>
  </p>
  <section id="pot" class="pot" aria-label="Olla">
    <h2>🍲 La olla</h2>
    <ul id="pot-items"></ul>
  </section>
  <p>Sin ratón: <button id="add-all" type="button">Añadir los ingredientes</button></p>
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
.pot {
  min-height: 6rem;
  padding: 0.4rem 0.75rem;
  border: 2px dashed #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
}
.pot h2 {
  margin: 0;
  font-size: 1rem;
}
button {
  font: inherit;
  padding: 0.2rem 0.6rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:focus-visible,
a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
const INGREDIENT = 'application/x-ingredient';
const pot = document.querySelector('#pot');
const potItems = document.querySelector('#pot-items');
function addToPot(ingredient) {
  const item = document.createElement('li');
  item.textContent = ingredient;
  potItems.append(item);
}

document.querySelector('.chips').addEventListener('dragstart', (event) => {
  const chip = event.target.closest?.('.chip');
  if (!chip) return; // el enlace lleva sus propios datos (una URL)
  event.dataTransfer.setData(INGREDIENT, chip.textContent);
  event.dataTransfer.setData('text/plain', `🌿 ${chip.textContent} (ingrediente)`);
});
document.querySelector('#add-all').addEventListener('click', () => {
  for (const chip of document.querySelectorAll('.chip')) addToPot(chip.textContent);
});

pot.addEventListener('dragover', (event) => {
  // ✅ Los tipos sí se leen durante el arrastre; los datos, no.
  if (!event.dataTransfer.types.includes(INGREDIENT)) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
});

pot.addEventListener('drop', (event) => {
  event.preventDefault(); // ✅ que el navegador no intente abrir lo soltado
  addToPot(event.dataTransfer.getData(INGREDIENT)); // ✅ en drop, ya legible
});

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
// Despachan DragEvents con un DataTransfer. En dragover, protectedMode()
// imita al navegador: getData devuelve '' y solo se ven los tipos.
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
function dragData(entries) {
  const data = new DataTransfer();
  for (const [type, value] of Object.entries(entries)) data.setData(type, value);
  return data;
}
function protectedMode(data, run) {
  data.getData = () => ''; // como en un arrastre real, durante dragover
  try {
    return run();
  } finally {
    delete data.getData;
  }
}
const fire = (type, data) => !pot.dispatchEvent(new DragEvent(type, { dataTransfer: data, bubbles: true, cancelable: true }));
const epazote = dragData({ [INGREDIENT]: 'Epazote', 'text/plain': '🌿 Epazote (ingrediente)' });
const link = dragData({ 'text/uri-list': '/recetas/pozole-rojo', 'text/plain': '/recetas/pozole-rojo' });

check('un ingrediente: dragover se cancela (la olla lo acepta)', () => protectedMode(epazote, () => fire('dragover', epazote)), true);
check('un enlace: dragover NO se cancela (la olla lo rechaza)', () => protectedMode(link, () => fire('dragover', link)), false);
check('drop cancela la acción por defecto', () => fire('drop', epazote), true);
check('en la olla entra «Epazote», el valor del tipo propio', () => potItems.lastElementChild?.textContent, 'Epazote');
potItems.replaceChildren(); // la olla empieza vacía para tus pruebas
```
