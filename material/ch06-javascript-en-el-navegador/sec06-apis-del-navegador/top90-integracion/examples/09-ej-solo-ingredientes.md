---
example_description: "Ejercicio: la olla debe aceptar solo ingredientes (un tipo propio, application/x-ingredient) y rechazar enlaces o texto; ahora decide con getData en dragover, que durante un arrastre real devuelve '', y en drop no cancela ni lee el tipo correcto. Las comprobaciones despachan DragEvents y simulan el modo protegido"
example_tags: "javascript|drag-and-drop|datatransfer|types|dragover|drop|ejercicio"
exercise: true
exercise_title: "Una olla que solo acepta ingredientes"
exercise_instructions: "Cada ingrediente viaja con dos tipos: application/x-ingredient (su nombre) y text/plain (un texto para quien lo suelte en otro sitio) || En dragover, decide con event.dataTransfer.types: si incluye el tipo propio, preventDefault() y dropEffect = 'copy'; si no, no hagas nada || En drop, llama a preventDefault() y añade a la olla el valor de getData(INGREDIENT), no el de text/plain || Ejecuta hasta que las cuatro comprobaciones salgan ✓; después arrastra de verdad un ingrediente y el enlace"
exercise_hints: "event.dataTransfer.types es una lista de textos: usa includes(INGREDIENT) || Mientras se arrastra (dragenter, dragover), getData devuelve '' en un arrastre real: por eso hay que decidir con los tipos || En drop los datos ya se pueden leer"
exercise_solution_example: 09-ej-solo-ingredientes-solucion.md
example_stage: exercise
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
  // TODO: decide con event.dataTransfer.types (getData devuelve '' mientras arrastras)
  if (event.dataTransfer.getData(INGREDIENT)) event.preventDefault();
});

pot.addEventListener('drop', (event) => {
  // TODO: preventDefault() y el nombre del tipo propio (INGREDIENT)
  addToPot(event.dataTransfer.getData('text/plain'));
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
