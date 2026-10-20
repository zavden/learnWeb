---
example_description: "Una galería de obras de dominio público que se filtra y se ordena: las que salen se desvanecen y se ocultan al terminar (await de finished), las que se quedan viajan a su nuevo sitio con FLIP y las que entran aparecen. Un cambio a mitad cancela la transición anterior sin saltos ni errores"
example_tags: "javascript|web-animations|flip|finished|galeria|aria-pressed|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="gallery">
  <h1>Colección: la Tierra y el cielo</h1>
  <div class="gallery__toolbar">
    <div class="gallery__filters" role="group" aria-label="Mostrar">
      <button type="button" data-kind="all" aria-pressed="true">Todas</button>
      <button type="button" data-kind="painting" aria-pressed="false">Pinturas</button>
      <button type="button" data-kind="space" aria-pressed="false">Espacio</button>
    </div>
    <label>Ordenar por
      <select id="sort">
        <option value="year">año</option>
        <option value="title">título</option>
      </select>
    </label>
  </div>
  <p id="status" class="gallery__status" role="status"></p>
  <ul id="grid" class="gallery__grid"></ul>
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
.gallery {
  max-width: 48rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.gallery__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
}
.gallery__filters {
  display: flex;
  gap: 0.3rem;
}
button,
select {
  font: inherit;
  padding: 0.3rem 0.7rem;
}
.gallery__filters button[aria-pressed="true"] {
  background: #1f2933;
  color: #ffffff;
}
button:focus-visible,
select:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.gallery__status {
  color: #52606d;
  font-size: 0.9rem;
}
.gallery__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
  gap: 0.75rem;
  padding: 0;
  list-style: none;
}
.gallery__grid li[hidden] {
  display: none;
}
.gallery__item {
  margin: 0;
  padding: 0.4rem;
  border-radius: 0.5rem;
  background: #ffffff;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.1);
}
.gallery__item img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 0.3rem;
}
.gallery__item figcaption {
  margin-top: 0.3rem;
  font-size: 0.8rem;
}
.gallery__item small {
  display: block;
  color: #52606d;
}
```

# JavaScript

```javascript
// Galería con filtros y orden animados.
//
// Decisiones de diseño:
// - Los datos mandan: computeView(filtro, orden) dice qué obras se ven y en qué orden; las
//   animaciones solo cuentan el paso de una vista a otra.
// - Tres fases: (1) las que salen se desvanecen y, cuando su finished se cumple, se ocultan;
//   (2) FLIP para las que se quedan (medir, reordenar, medir, translate de la diferencia a 0);
//   (3) las que entran aparecen con opacity. Las animaciones usan el estilo final como estado
//   (sin fill), así que cancelarlas nunca deja a nadie a medias.
// - Un cambio a mitad cancela lo que esté en marcha: Promise.allSettled espera sin lanzar el
//   AbortError, y un número de «versión» descarta la secuencia vieja.
// - Con «reducir movimiento», nada viaja: solo fundidos.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

const ARTWORKS = [
  { id: 'wave', title: 'La gran ola de Kanagawa', author: 'Katsushika Hokusai', year: 1831, kind: 'painting', file: 'great-wave.jpg' },
  { id: 'valley', title: 'Valle de México', author: 'José María Velasco', year: 1877, kind: 'painting', file: 'valley-of-mexico.jpg' },
  { id: 'aldrin', title: 'Buzz Aldrin en la Luna', author: 'NASA, Apolo 11', year: 1969, kind: 'space', file: 'aldrin-apollo-11.jpg' },
  { id: 'earth', title: 'La Tierra desde el Apolo 17', author: 'NASA, Apolo 17', year: 1972, kind: 'space', file: 'earth-apollo-17.jpg' },
  { id: 'pillars', title: 'Pilares de la creación', author: 'NASA, ESA y Hubble', year: 2014, kind: 'space', file: 'pillars-of-creation.jpg' },
];

function computeView(kind, sort) {
  return ARTWORKS
    .filter((artwork) => kind === 'all' || artwork.kind === kind)
    .toSorted(sort === 'year' ? (a, b) => a.year - b.year : (a, b) => a.title.localeCompare(b.title, 'es'))
    .map((artwork) => artwork.id);
}
console.log('espacio, por año →', computeView('space', 'year').join(', '));
console.log('todas, por título →', computeView('all', 'title').join(', '));

// ── Generar la galería ───────────────────────────────────────────────────
const grid = document.querySelector('#grid');
const items = new Map();
for (const artwork of ARTWORKS) {
  const item = document.createElement('li');
  item.innerHTML = `<figure class="gallery__item"><img alt="" width="480" height="480" loading="lazy"><figcaption></figcaption></figure>`;
  const img = item.querySelector('img');
  img.src = artwork.file;
  img.alt = `${artwork.title}, ${artwork.author}, ${artwork.year}`;
  item.querySelector('figcaption').append(artwork.title, Object.assign(document.createElement('small'), { textContent: `${artwork.author}, ${artwork.year}. Dominio público.` }));
  items.set(artwork.id, item);
  grid.append(item);
}

// ── Pasar de una vista a otra ────────────────────────────────────────────
const statusLine = document.querySelector('#status');
let kind = 'all';
let version = 0;
async function showView() {
  const myVersion = ++version;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; // matchMedia: módulo siguiente
  const ids = computeView(kind, document.querySelector('#sort').value);
  for (const item of items.values()) item.getAnimations().forEach((animation) => animation.cancel());

  // 1. Salen
  const leaving = [...items].filter(([id, item]) => !item.hidden && !ids.includes(id)).map(([, item]) => item);
  await Promise.allSettled(leaving.map((item) => item.animate({ opacity: [1, 0] }, 180).finished));
  if (myVersion !== version) return;            // otro clic llegó mientras tanto
  leaving.forEach((item) => { item.hidden = true; });

  // 2. FLIP de las que se quedan · 3. entran
  const staying = ids.map((id) => items.get(id)).filter((item) => !item.hidden);
  const first = new Map(staying.map((item) => [item, item.getBoundingClientRect()]));
  for (const id of ids) {
    items.get(id).hidden = false;
    grid.append(items.get(id));                  // el orden nuevo, de una vez
  }
  for (const item of staying) {
    const before = first.get(item);
    const after = item.getBoundingClientRect();
    const dx = before.left - after.left;
    const dy = before.top - after.top;
    if ((dx || dy) && !reduce) item.animate({ translate: [`${dx}px ${dy}px`, '0 0'] }, { duration: 380, easing: 'cubic-bezier(0.2, 0, 0, 1)' });
  }
  for (const id of ids) {
    const item = items.get(id);
    if (!staying.includes(item)) item.animate(reduce ? { opacity: [0, 1] } : { opacity: [0, 1], scale: [0.92, 1] }, { duration: 250, easing: 'ease-out' });
  }
  const titles = ids.map((id) => ARTWORKS.find((a) => a.id === id).title);
  statusLine.textContent = `Mostrando ${ids.length} de ${ARTWORKS.length}: ${titles.join(', ')}`;
  console.log(`🖼️ ${statusLine.textContent}`);
}

document.querySelector('.gallery__filters').addEventListener('click', (event) => {
  const button = event.target.closest('[data-kind]');
  if (!button) return;
  kind = button.dataset.kind;
  document.querySelectorAll('[data-kind]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
  showView();
});
document.querySelector('#sort').addEventListener('change', showView);

// La vista inicial, sin animar (aún no hay nada que mover)
for (const id of computeView(kind, 'year')) grid.append(items.get(id));
statusLine.textContent = `Mostrando ${ARTWORKS.length} de ${ARTWORKS.length}, por año`;
console.log('Listo: pulsa «Espacio», cambia el orden a «título» y vuelve a «Todas»');
```
