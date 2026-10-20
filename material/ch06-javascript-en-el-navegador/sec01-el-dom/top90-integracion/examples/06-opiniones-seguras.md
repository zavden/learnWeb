---
example_description: "Opiniones de clientes pintadas con la etiqueta html (que escapa cada valor) y ampliadas con insertAdjacentHTML: una opinión nueva, aunque traiga un <img onerror>, entra como texto, y los botones «Útil» que ya estaban conservan su listener y su contador"
example_tags: "javascript|dom|integracion|tagged-templates|insertadjacenthtml|xss|listeners"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main class="reviews">
  <h1>Opiniones: Café de Chiapas 500 g</h1>
  <ul class="review-list" id="reviews"></ul>
  <p>
    <label for="new-review">Tu opinión</label>
    <input id="new-review" type="text" maxlength="140">
    <button type="button" id="publish">Publicar</button>
  </p>
</main>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}
.reviews {
  max-width: 34rem;
}
h1 {
  font-size: 1.2rem;
}
.review-list {
  padding: 0;
  list-style: none;
}
.review {
  margin-bottom: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
}
.review p {
  margin: 0.25rem 0;
}
```

# JavaScript

```javascript
// La etiqueta html (lección «Plantillas etiquetadas», versión corta).
function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
class SafeHtml {
  #markup;
  constructor(markup) { this.#markup = markup; }
  toString() { return this.#markup; }
}
function html(strings, ...values) {
  let markup = strings[0];
  values.forEach((value, i) => {
    markup += (value instanceof SafeHtml ? String(value) : escapeHtml(value)) + strings[i + 1];
  });
  return new SafeHtml(markup);
}

const stars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);
const reviewHtml = (review) => html`
  <li class="review" data-review-id="${review.id}">
    <p><b>${review.author}</b> <span role="img" aria-label="${review.rating} de 5 estrellas">${stars(review.rating)}</span></p>
    <p>${review.text}</p>
    <button type="button" class="helpful">Útil (<span class="votes">0</span>)</button>
  </li>`;

// Cada botón «Útil» lleva su listener (eventos: módulo siguiente).
function connectHelpful(item) {
  const button = item.querySelector('.helpful');
  let votes = 0;
  button.addEventListener('click', () => {
    votes += 1;
    button.querySelector('.votes').textContent = votes;
  });
}

const list = document.querySelector('#reviews');
const reviews = [
  { id: 1, author: 'Marta', rating: 5, text: 'Aroma a chocolate y a nuez. Repetiré.' },
  { id: 2, author: 'Luis', rating: 4, text: 'Muy bueno en prensa francesa; un poco ácido en espresso.' },
];
list.innerHTML = reviews.map((review) => String(reviewHtml(review))).join(''); // marcado tuyo, datos escapados
list.querySelectorAll('.review').forEach(connectHelpful);

let nextId = 3;
function publish(author, text) {
  // insertAdjacentHTML añade SOLO lo nuevo: no reconstruye las opiniones de antes.
  list.insertAdjacentHTML('beforeend', String(reviewHtml({ id: nextId++, author, rating: 5, text })));
  connectHelpful(list.lastElementChild);
}

// Comprobaciones al cargar
const firstButton = list.querySelector('.helpful');
firstButton.click();
publish('anónimo', '<img src="x" onerror="document.body.style.background = \'crimson\'">¡El mejor!');
console.log('opiniones →', list.children.length);
console.log('<img> en la lista →', list.querySelectorAll('img').length);
console.log('texto de la nueva →', list.lastElementChild.querySelectorAll('p')[1].textContent);
console.log('¿el primer botón es el mismo objeto? →', list.querySelector('.helpful') === firstButton);
firstButton.click();
console.log('votos del primer botón tras otro clic →', firstButton.textContent);
console.log('data-review-id →', [...list.children].map((item) => item.dataset.reviewId));

const input = document.querySelector('#new-review');
document.querySelector('#publish').addEventListener('click', () => {
  if (input.value.trim() === '') return;
  publish('tú', input.value.trim());
  input.value = '';
});
```
