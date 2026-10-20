---
example_description: "Solución: children en vez de childNodes, querySelectorAll en vez de la colección viva, classList.add, la propiedad disabled, dataset comparado con 'true', createElement + textContent en vez de innerHTML += y una copia de template.content"
example_tags: "javascript|dom|solucion|bugs|childnodes|colecciones-vivas|classlist|dataset|innerhtml|template"
example_stage: final-solution
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
// SOLUCIÓN: los siete bugs, arreglados (el comentario de cada uno dice cuál era).

// 1. childNodes contaba también los textos en blanco: children solo cuenta elementos.
function countDishes(menu) {
  return menu.children.length;
}

// 2. getElementsByClassName es una colección VIVA que se encogía en el bucle:
//    querySelectorAll da una foto estática.
function markAllDone(list) {
  for (const task of list.querySelectorAll('.pending')) {
    task.classList.replace('pending', 'done');
  }
}

// 3. className = … sustituía todas las clases: classList.add solo añade una.
function markSoldOut(card) {
  card.classList.add('sold-out');
}

// 4. disabled es booleano: funciona por presencia, sea cual sea su valor.
//    La propiedad (o removeAttribute) lo quita de verdad.
function enablePayButton(button) {
  button.disabled = false;
}

// 5. dataset siempre da strings, y 'false' es truthy: compara con 'true'.
function isInStock(item) {
  return item.dataset.inStock === 'true';
}

// 6. innerHTML += reconstruía el hilo (el botón perdía su listener) e
//    interpretaba el texto del usuario como HTML: nodos nuevos con textContent.
function addComment(thread, author, text) {
  const comment = document.createElement('p');
  comment.textContent = `${author}: ${text}`;
  thread.append(comment);
}

// 7. template.content se vaciaba al primer append: hay que insertar una copia.
function renderDishes(list, names) {
  const template = document.querySelector('#dish-template');
  for (const name of names) {
    const copy = template.content.cloneNode(true);
    copy.querySelector('.dish').textContent = name;
    list.append(copy);
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
