---
example_description: "Un feed de reseñas con el patrón ARIA feed: páginas JSON pedidas con fetch y AbortController, un centinela con IntersectionObserver (y raíz explícita) que carga solo al acercarse al final, el botón «Cargar más» como vía principal, aria-busy, aria-posinset/aria-setsize, AvPág/RePág entre reseñas y un cambio de orden que cancela la petición en curso"
example_tags: "javascript|intersectionobserver|feed|fetch|abortcontroller|aria-feed|accesibilidad|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <header class="top">
    <h1 id="feed-title">Reseñas de nuestros cafés</h1>
    <fieldset class="order">
      <legend>Ordenar</legend>
      <label><input type="radio" name="order" value="recent" checked> Más recientes</label>
      <label><input type="radio" name="order" value="top"> Mejor valoradas</label>
    </fieldset>
  </header>
  <div id="scroller" class="scroller" tabindex="0" role="region" aria-labelledby="feed-title">
    <div id="feed" class="feed" role="feed" aria-busy="false" aria-labelledby="feed-title"></div>
    <footer id="sentinel" class="feed-end">
      <p id="status" role="status"></p>
      <button id="more" type="button">Cargar más reseñas</button>
    </footer>
  </div>
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
  max-width: 36rem;
  margin: 0 auto;
  padding: 1rem;
}
.top {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  margin-bottom: 0.5rem;
}
h1 {
  margin: 0;
  font-size: 1.25rem;
}
.order {
  display: flex;
  gap: 0.75rem;
  margin: 0;
  padding: 0.25rem 0.6rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
}
.order legend {
  padding: 0 0.25rem;
  font-size: 0.85rem;
  color: #52606d;
}
.scroller {
  height: 22rem;
  overflow-y: auto;
  overscroll-behavior: contain;
  border: 1px solid #7b8794;
  border-radius: 0.75rem;
  background: #ffffff;
}
.feed {
  display: grid;
  gap: 0.6rem;
  padding: 0.75rem;
}
.review {
  padding: 0.6rem 0.8rem;
  border: 1px solid #e4e7eb;
  border-radius: 0.5rem;
}
.review header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.25rem 0.75rem;
}
.review h2 {
  margin: 0;
  font-size: 1rem;
}
.review p {
  margin: 0.3rem 0 0;
  line-height: 1.45;
}
.stars {
  color: #92400e;
  letter-spacing: 0.08em;
}
.meta {
  font-size: 0.85rem;
  color: #52606d;
}
.feed-end {
  display: grid;
  justify-items: center;
  gap: 0.4rem;
  padding: 0 0.75rem 1rem;
}
.feed-end p {
  margin: 0;
  color: #52606d;
}
button {
  font: inherit;
  padding: 0.35rem 0.8rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button[hidden] {
  display: none;
}
button:disabled {
  cursor: progress;
  color: #52606d;
}
button:focus-visible,
.scroller:focus-visible,
.review:focus-visible,
.order input:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// FEED DE RESEÑAS CON CARGA PROGRESIVA.
//
// Decisiones de diseño:
// - Patrón ARIA «feed»: un contenedor role="feed" con un <article> por reseña,
//   aria-posinset (su posición) y aria-setsize (-1 mientras no se sabe el total).
//   aria-busy="true" mientras llega una página, para que el lector de pantalla
//   no anuncie una lista a medias. AvPág/RePág saltan de reseña en reseña.
// - El botón «Cargar más» es la vía principal (teclado, lector de pantalla, sin
//   desplazarse); el centinela con IntersectionObserver es un extra. Su raíz es
//   el panel con scroll, y se vuelve a observar tras cada página: el observer
//   avisa de CAMBIOS, y si el centinela sigue a la vista, no volvería a llamar.
// - Una petición a la vez, con su AbortController. Cambiar el orden cancela la
//   que esté en curso y empieza de cero; una respuesta cancelada no toca nada.
// - Las páginas son JSON de assets/01-feed/ (recent-N.json y top-N.json), como
//   las serviría una API: { page, total, next, items }.
// - Los datos se pintan con textContent; la fecha, con Intl en la zona de la
//   tienda (Ciudad de México).
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos, red y
// almacenamiento, y este módulo.

const scroller = document.querySelector('#scroller');
const feed = document.querySelector('#feed');
const sentinel = document.querySelector('#sentinel');
const statusText = document.querySelector('#status');
const moreButton = document.querySelector('#more');
const dateFormat = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeZone: 'America/Mexico_City' });
const ORDER_NAMES = { recent: 'más recientes', top: 'mejor valoradas' };

const state = { order: 'recent', next: 'recent-1.json', total: null, controller: null };
let watcher = null; // el IntersectionObserver, cuando la página ya está lista

// ── Pintar ───────────────────────────────────────────────────────────────
function renderReview(review, position) {
  const article = document.createElement('article');
  article.className = 'review';
  article.tabIndex = 0;
  article.dataset.rating = review.rating;
  article.setAttribute('aria-posinset', position);
  article.setAttribute('aria-setsize', state.total ?? -1);
  article.setAttribute('aria-labelledby', `${review.id}-title`);
  const header = document.createElement('header');
  const title = document.createElement('h2');
  title.id = `${review.id}-title`;
  title.textContent = `Café de ${review.coffee}, por ${review.author}`;
  const stars = document.createElement('span');
  stars.className = 'stars';
  stars.setAttribute('role', 'img');
  stars.setAttribute('aria-label', `${review.rating} de 5 estrellas`);
  stars.textContent = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
  header.append(title, stars);
  const text = document.createElement('p');
  text.textContent = review.text;
  const meta = document.createElement('p');
  meta.className = 'meta';
  const time = document.createElement('time');
  time.dateTime = review.date;
  time.textContent = dateFormat.format(new Date(review.date));
  meta.append(time);
  article.append(header, text, meta);
  return article;
}

function renderPage(page) {
  const start = feed.children.length;
  feed.append(...page.items.map((review, index) => renderReview(review, start + index + 1)));
  state.next = page.next;
  if (!page.next) {
    state.total = page.total; // ya se sabe el total: lo dicen todas
    for (const article of feed.children) article.setAttribute('aria-setsize', page.total);
  }
  moreButton.hidden = !page.next;
  statusText.textContent = page.next
    ? `${feed.children.length} reseñas (${ORDER_NAMES[state.order]})`
    : `Has llegado al final: ${page.total} reseñas`;
  rewatch();
}

function setBusy(busy) {
  feed.setAttribute('aria-busy', String(busy));
  moreButton.disabled = busy;
  if (busy) statusText.textContent = 'Cargando reseñas…';
}

// ── Cargar ───────────────────────────────────────────────────────────────
async function loadNext() {
  if (state.controller || !state.next) return 'idle'; // una a la vez; o ya no hay más
  const controller = new AbortController();
  state.controller = controller;
  setBusy(true);
  try {
    const response = await fetch(`01-feed/${state.next}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    renderPage(await response.json());
    moreButton.textContent = 'Cargar más reseñas';
    return 'loaded';
  } catch (error) {
    if (error.name === 'AbortError') return 'aborted'; // la canceló un cambio de orden
    statusText.textContent = 'No se pudieron cargar más reseñas. Vuelve a intentarlo.';
    moreButton.textContent = 'Reintentar';
    return 'error';
  } finally {
    // Solo la petición vigente libera el estado: una cancelada no toca nada.
    if (state.controller === controller) {
      state.controller = null;
      setBusy(false);
    }
  }
}

function changeOrder(order) {
  state.controller?.abort();
  state.controller = null;
  Object.assign(state, { order, next: `${order}-1.json`, total: null });
  feed.replaceChildren();
  scroller.scrollTop = 0;
  return loadNext();
}

// ── El centinela: cargar al acercarse al final ───────────────────────────
function rewatch() {
  if (!watcher) return;
  watcher.unobserve(sentinel);
  if (state.next) watcher.observe(sentinel); // una observación nueva = una primera llamada nueva
}
function startWatching() {
  watcher = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) loadNext();
  }, { root: scroller, rootMargin: '0px 0px 200px 0px' });
  rewatch();
}

// ── Teclado: AvPág/RePág entre reseñas (patrón feed) ─────────────────────
feed.addEventListener('keydown', (event) => {
  if (event.key !== 'PageDown' && event.key !== 'PageUp') return;
  const current = event.target.closest('.review');
  if (!current) return;
  const target = event.key === 'PageDown' ? current.nextElementSibling : current.previousElementSibling;
  if (!target) return;
  event.preventDefault();
  target.focus();
});
moreButton.addEventListener('click', loadNext);
document.querySelector('.order').addEventListener('change', (event) => {
  changeOrder(event.target.value);
});

// ── Comprobaciones al cargar (el centinela empieza a vigilar después) ────
function audit(label, actual, expected) {
  if (actual === expected) console.log('✅', label, '→', actual);
  else console.error('❌', label, '→', actual, '(esperaba', expected, ')');
}
const count = () => feed.children.length;

audit('página 1', `${await loadNext()} · ${count()} reseñas · aria-busy ${feed.getAttribute('aria-busy')}`, 'loaded · 10 reseñas · aria-busy false');
await loadNext();
audit('«Cargar más»', `${count()} reseñas · aria-setsize ${feed.firstElementChild.getAttribute('aria-setsize')}`, '20 reseñas · aria-setsize -1');
await loadNext();
audit('última página', `${count()} · aria-setsize ${feed.lastElementChild.getAttribute('aria-setsize')} · botón ${moreButton.hidden ? 'oculto' : 'visible'}`, '25 · aria-setsize 25 · botón oculto');
const cancelled = changeOrder('top');
const restarted = changeOrder('recent');
audit('cambiar el orden a mitad de carga cancela la petición anterior', await cancelled, 'aborted');
await restarted;
await changeOrder('top');
audit('«Mejor valoradas»: las 10 primeras tienen 5 estrellas', [...feed.children].every((article) => article.dataset.rating === '5'), true);
await changeOrder('recent');
audit('de vuelta a «Más recientes»', `${count()} · ${statusText.textContent}`, '10 · 10 reseñas (más recientes)');

startWatching();
console.log('Listo: baja por el panel (carga sola al llegar al final) o pulsa «Cargar más reseñas»; cambia el orden; AvPág y RePág saltan entre reseñas');
```
