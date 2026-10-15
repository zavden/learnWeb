---
example_description: "Un catálogo que se filtra y se ordena con View Transitions: cada tarjeta tiene su propio view-transition-name y la clase común card, así que las que se quedan viajan a su nuevo sitio, las que salen se encogen y se funden (::view-transition-old(*.card):only-child) y las que entran crecen desde el 90 %. Un texto de estado anuncia cuántas plantas se muestran. Adelanto de JavaScript: filtros, orden y startViewTransition"
example_tags: "css|profesional|view-transitions|view-transition-name|view-transition-class|only-child|filtros|grid|javascript|prefers-reduced-motion"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="catalog">
  <h1>Plantas</h1>
  <div class="toolbar">
    <div class="filters" role="group" aria-label="Filtrar por lugar">
      <button type="button" aria-pressed="true" onclick="filterBy(this, 'all')">Todas</button>
      <button type="button" aria-pressed="false" onclick="filterBy(this, 'interior')">Interior</button>
      <button type="button" aria-pressed="false" onclick="filterBy(this, 'exterior')">Exterior</button>
    </div>
    <button type="button" class="sort" aria-pressed="false" onclick="toggleSort(this)">Ordenar por precio</button>
  </div>
  <p class="count" role="status">Mostrando 8 plantas</p>
  <ul class="grid">
    <li class="card" data-place="exterior" data-price="185" style="--vt: card-nopal"><span class="card__icon" aria-hidden="true">🌵</span><h2>Nopal</h2><p>$185 · Exterior</p></li>
    <li class="card" data-place="interior" data-price="95" style="--vt: card-echeveria"><span class="card__icon" aria-hidden="true">🪴</span><h2>Echeveria</h2><p>$95 · Interior</p></li>
    <li class="card" data-place="interior" data-price="210" style="--vt: card-helecho"><span class="card__icon" aria-hidden="true">🌿</span><h2>Helecho</h2><p>$210 · Interior</p></li>
    <li class="card" data-place="exterior" data-price="45" style="--vt: card-albahaca"><span class="card__icon" aria-hidden="true">🌱</span><h2>Albahaca</h2><p>$45 · Exterior</p></li>
    <li class="card" data-place="exterior" data-price="320" style="--vt: card-bugambilia"><span class="card__icon" aria-hidden="true">🌸</span><h2>Bugambilia</h2><p>$320 · Exterior</p></li>
    <li class="card" data-place="exterior" data-price="540" style="--vt: card-limonero"><span class="card__icon" aria-hidden="true">🍋</span><h2>Limonero enano</h2><p>$540 · Exterior</p></li>
    <li class="card" data-place="interior" data-price="160" style="--vt: card-pothos"><span class="card__icon" aria-hidden="true">🍃</span><h2>Pothos</h2><p>$160 · Interior</p></li>
    <li class="card" data-place="interior" data-price="275" style="--vt: card-monstera"><span class="card__icon" aria-hidden="true">🌴</span><h2>Monstera</h2><p>$275 · Interior</p></li>
  </ul>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Catálogo que se reordena
   - Filtrar (hidden) y ordenar (mover los elementos) son cambios de layout:
     dentro de una View Transition, cada tarjeta con nombre se fotografía y
     viaja de su sitio viejo al nuevo, sin animar ni una propiedad de layout.
   - Nombres únicos (de --vt en línea) y una clase común, card, para darles
     estilo a todas: ::view-transition-group(*.card).
   - Las tarjetas que SALEN solo tienen foto vieja; las que ENTRAN, solo
     nueva. En ese caso, la foto es la única hija de su image-pair:
     :only-child las distingue, y les damos otra animación (encoger y fundir,
     crecer y fundir).
   - Los botones dicen su estado con aria-pressed; un role="status" anuncia
     el número de plantas.
   - Movimiento reducido: sin nombres; la cuadrícula entera se funde de un
     estado al otro.
   ────────────────────────────────────────────────────────────────────────── */

/* ── Tokens ── */
:root {
  --color-text: #1e293b;
  --color-muted: #475569;
  --color-brand: #14532d;
  --color-tint: #f0fdf4;
  --color-surface: #ffffff;
  --color-focus: #1d4ed8;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
}

/* ── Base ── */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #f8fafc;
  color: var(--color-text);
  font-family: system-ui, sans-serif;
  line-height: 1.4;
}

:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.catalog {
  max-width: 48rem;
  margin-inline: auto;
  padding: 1rem;
}

.catalog h1 {
  margin: 0 0 0.75rem;
  font-size: 1.4rem;
}

/* ── Barra de herramientas ── */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem;
}

.filters {
  display: flex;
  gap: 0.25rem;
}

.toolbar button {
  padding: 0.4rem 0.8rem;
  border: 1px solid #64748b;
  border-radius: 999px;
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms, color 150ms;
}

.toolbar button[aria-pressed="true"] {
  border-color: var(--color-brand);
  background: var(--color-brand);
  color: #ffffff;
}

.count {
  margin: 0.5rem 0 0.75rem;
  color: var(--color-muted);
  font-size: 0.85rem;
}

/* ── Cuadrícula ── */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.card {
  padding: 0.75rem;
  border-radius: 12px;
  background: var(--color-surface);
  box-shadow: 0 1px 3px rgb(15 23 42 / 0.18);
}

.card__icon {
  font-size: 2rem;
}

.card h2 {
  margin: 0.25rem 0 0;
  font-size: 0.95rem;
}

.card p {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.8rem;
}

/* ── View Transition ── */
@media (prefers-reduced-motion: no-preference) {
  .card {
    view-transition-name: var(--vt);
    view-transition-class: card;
  }

  ::view-transition-group(*.card) {
    animation-duration: 400ms;
    animation-timing-function: var(--ease-standard);
  }

  /* Sale (solo hay foto vieja): encoge y se funde. */
  ::view-transition-old(*.card):only-child {
    animation: card-out 200ms ease-in both;
  }

  /* Entra (solo hay foto nueva): crece y aparece, un poco después. */
  ::view-transition-new(*.card):only-child {
    animation: card-in 300ms var(--ease-standard) 100ms both;
  }
}

@keyframes card-out {
  to {
    opacity: 0;
    scale: 0.9;
  }
}

@keyframes card-in {
  from {
    opacity: 0;
    scale: 0.9;
  }
}
```

# JavaScript

```javascript
// Adelanto: JavaScript del navegador (capítulo 6). Los botones cambian el filtro y el
// orden; cada cambio del DOM va dentro de startViewTransition para que el CSS lo anime.
const grid = document.querySelector('.grid');
const cards = [...grid.querySelectorAll('.card')];
const count = document.querySelector('.count');
const state = { place: 'all', byPrice: false };

function render() {
  for (const card of cards) {
    card.hidden = state.place !== 'all' && card.dataset.place !== state.place;
  }
  const ordered = state.byPrice
    ? [...cards].sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price))
    : cards;
  grid.append(...ordered);
  const visible = cards.filter((card) => !card.hidden).length;
  count.textContent = `Mostrando ${visible} plantas`;
}

function animate(update) {
  if (!document.startViewTransition) {
    update();
    return;
  }
  document.startViewTransition(update);
}

// Todo el cambio (botones incluidos) dentro de la transición: la foto «de antes» es
// el estado anterior completo.
function filterBy(button, place) {
  animate(() => {
    for (const other of button.parentElement.children) {
      other.setAttribute('aria-pressed', String(other === button));
    }
    state.place = place;
    render();
  });
}

function toggleSort(button) {
  animate(() => {
    state.byPrice = !state.byPrice;
    button.setAttribute('aria-pressed', String(state.byPrice));
    render();
  });
}
```
