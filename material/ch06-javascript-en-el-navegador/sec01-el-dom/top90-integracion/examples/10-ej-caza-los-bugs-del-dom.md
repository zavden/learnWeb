---
example_description: "Ejercicio: siete funciones con un bug cada una, sacados del Bestiario del módulo: childNodes, una colección viva en un bucle, className, un atributo booleano, dataset, innerHTML += y template.content sin clonar"
example_tags: "javascript|dom|ejercicio|bugs|childnodes|colecciones-vivas|classlist|dataset|innerhtml|template"
exercise: true
exercise_title: "Caza los bugs del DOM"
exercise_instructions: "Ejecuta el ejemplo: las siete comprobaciones salen ✗ y ninguna detiene el script || Lee cada función y el mensaje de su ✗: cada una tiene uno de los bugs del Bestiario de las lecciones || Arregla las funciones sin tocar el HTML ni las comprobaciones || Ejecuta hasta que las siete salgan ✓"
exercise_hints: "1: entre los <li> sangrados hay textos en blanco || 2: ¿qué pasa con la colección cuando un elemento pierde la clase pending? || 3: hay una propiedad para cambiar las clases de una en una || 4: un atributo booleano funciona por presencia || 5: dataset siempre devuelve strings || 6: += serializa y vuelve a parsear todo el hilo; además, el texto es de un usuario || 7: ¿qué queda en template.content después del primer append?"
exercise_solution_example: 10-ej-caza-los-bugs-del-dom-solucion.md
exercise_locked_files: index.html
example_stage: exercise
example_importance: important
console: true
---

# HTML

```html
<main class="bugs">
  <h1>Siete bugs del DOM</h1>
  <section aria-labelledby="t1">
    <h2 id="t1">1. Platos del menú</h2>
    <ul id="menu">
      <li>Sopa de lima</li>
      <li>Cochinita pibil</li>
      <li>Marquesitas</li>
    </ul>
  </section>
  <section aria-labelledby="t2">
    <h2 id="t2">2. Tareas</h2>
    <ul id="tasks">
      <li class="pending">Comprar la masa</li>
      <li class="pending">Preparar el relleno</li>
      <li class="pending">Calentar el comal</li>
      <li class="pending">Servir con salsa</li>
    </ul>
  </section>
  <section aria-labelledby="t3">
    <h2 id="t3">3. Tarjeta</h2>
    <article class="card featured" id="card">Café de Nayarit 500 g</article>
  </section>
  <section aria-labelledby="t4">
    <h2 id="t4">4. Pagar</h2>
    <button type="button" id="pay" disabled>Pagar $487.20</button>
  </section>
  <section aria-labelledby="t5">
    <h2 id="t5">5. Existencias</h2>
    <ul id="stock">
      <li data-in-stock="true">Café de Chiapas</li>
      <li data-in-stock="false">Café de Veracruz</li>
    </ul>
  </section>
  <section aria-labelledby="t6">
    <h2 id="t6">6. Comentarios</h2>
    <div id="thread">
      <p>Marta: ¡Qué buena pinta! <button type="button" class="like">👍 <span>0</span></button></p>
    </div>
  </section>
  <section aria-labelledby="t7">
    <h2 id="t7">7. Platos desde una plantilla</h2>
    <ul id="dishes"></ul>
    <template id="dish-template">
      <li class="dish"></li>
    </template>
  </section>
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
  margin: 1rem 0 0.25rem;
  font-size: 1rem;
}
.card {
  padding: 0.5rem 0.75rem;
  border: 2px solid #cbd5e1;
  border-radius: 0.5rem;
}
.featured {
  border-color: #1d4ed8;
}
.sold-out {
  color: #475569;
  border-style: dashed;
}
.pending::before {
  content: '⏳ ';
}
.done::before {
  content: '✅ ';
}
```

# JavaScript

```javascript
// EJERCICIO: siete funciones, siete bugs del Bestiario de este módulo.
// Ninguno detiene el script (las comprobaciones atrapan los errores): lee
// cada ✗, busca el bug y arréglalo sin tocar el HTML.

// 1. Cuántos platos hay en el menú.
function countDishes(menu) {
  return menu.childNodes.length;
}

// 2. Marca todas las tareas como hechas: la clase pending pasa a ser done.
function markAllDone(list) {
  const pending = list.getElementsByClassName('pending');
  for (let i = 0; i < pending.length; i++) {
    pending[i].classList.replace('pending', 'done');
  }
}

// 3. Marca la tarjeta como agotada (sin perder su aspecto).
function markSoldOut(card) {
  card.className = 'sold-out';
}

// 4. Activa el botón de pagar.
function enablePayButton(button) {
  button.setAttribute('disabled', 'false');
}

// 5. ¿Hay existencias? data-in-stock vale "true" o "false".
function isInStock(item) {
  return Boolean(item.dataset.inStock);
}

// 6. Añade un comentario al final del hilo. El texto lo escribe un usuario.
function addComment(thread, author, text) {
  thread.innerHTML += `<p>${author}: ${text}</p>`;
}

// 7. Pinta un <li class="dish"> por plato con la plantilla #dish-template.
function renderDishes(list, names) {
  const template = document.querySelector('#dish-template');
  for (const name of names) {
    const content = template.content;
    content.querySelector('.dish').textContent = name;
    list.append(content);
  }
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
const $ = (selector) => document.querySelector(selector);

check('1. countDishes cuenta 3 platos', () => countDishes($('#menu')), 3);
check('2. markAllDone marca todas las tareas', () => {
  markAllDone($('#tasks'));
  return `${$('#tasks').querySelectorAll('.pending').length} pendientes, ${$('#tasks').querySelectorAll('.done').length} hechas`;
}, '0 pendientes, 4 hechas');
check('3. markSoldOut conserva las otras clases', () => {
  markSoldOut($('#card'));
  return $('#card').className;
}, 'card featured sold-out');
check('4. enablePayButton activa el botón', () => {
  enablePayButton($('#pay'));
  return $('#pay').disabled;
}, false);
check('5. isInStock lee bien "true" y "false"', () => {
  const [chiapas, veracruz] = $('#stock').children;
  return `${isInStock(chiapas)} ${isInStock(veracruz)}`;
}, 'true false');
check('6. addComment añade texto sin rehacer el hilo', () => {
  const likeButton = $('#thread .like');
  addComment($('#thread'), 'anónimo', '<em>¡Delicioso!</em>');
  const last = $('#thread').lastElementChild;
  return $('#thread .like') === likeButton && $('#thread em') === null
    && last.textContent === 'anónimo: <em>¡Delicioso!</em>';
}, true);
check('7. renderDishes pinta los 3 platos', () => {
  renderDishes($('#dishes'), ['Sopa de lima', 'Pozole verde', 'Tamales']);
  return [...$('#dishes').querySelectorAll('.dish')].map((dish) => dish.textContent).join(', ');
}, 'Sopa de lima, Pozole verde, Tamales');
```
