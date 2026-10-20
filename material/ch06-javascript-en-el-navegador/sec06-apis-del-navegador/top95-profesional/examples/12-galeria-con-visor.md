---
example_description: "Una galería de obras de dominio público con visor: miniaturas con loading=\"lazy\", un <dialog> modal que se recorre con botones y flechas y precarga la obra anterior y la siguiente, un fundido que respeta prefers-reduced-motion, pantalla completa dentro del visor, «Compartir» con Web Share o copiando el enlace, un IntersectionObserver (root: document) que cuenta las obras vistas y el foco de vuelta en la miniatura al cerrar"
example_tags: "javascript|dialog|fullscreen|web-share|clipboard|intersectionobserver|prefers-reduced-motion|imagenes|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Paisajes y cielos</h1>
  <p class="intro">Cinco obras de dominio público. Has visto <output id="seen">0</output> de 5.</p>
  <ul id="gallery" class="gallery"></ul>

  <dialog id="viewer" class="viewer" aria-labelledby="viewer-title">
    <figure id="stage" class="stage">
      <img id="viewer-image" alt="">
      <figcaption>
        <strong id="viewer-title"></strong>
        <span id="viewer-credit"></span>
      </figcaption>
    </figure>
    <nav class="viewer-controls" aria-label="Visor">
      <button id="previous" type="button" aria-label="Obra anterior">←</button>
      <output id="position" class="position">1 / 5</output>
      <button id="next" type="button" aria-label="Obra siguiente">→</button>
      <button id="fullscreen" type="button">⛶ Pantalla completa</button>
      <button id="share" type="button">↗ Compartir</button>
      <button id="close" type="button">Cerrar</button>
    </nav>
    <p id="viewer-status" class="viewer-status" role="status"></p>
  </dialog>
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
  max-width: 44rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  margin: 0;
  font-size: 1.25rem;
}
.intro {
  margin: 0.25rem 0 0.75rem;
  color: #52606d;
}
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.thumb {
  display: grid;
  gap: 0.3rem;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: zoom-in;
}
.thumb img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 0.5rem;
  background: #e4e7eb;
}
.thumb span {
  font-size: 0.85rem;
}
.thumb:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 3px;
  border-radius: 0.5rem;
}
.viewer {
  width: min(48rem, calc(100vw - 2rem));
  padding: 1rem;
  border: 0;
  border-radius: 0.75rem;
  background: #111827;
  color: #e5e7eb;
}
.viewer::backdrop {
  background: rgb(0 0 0 / 0.7);
}
.stage {
  display: grid;
  gap: 0.5rem;
  margin: 0;
}
.stage img {
  width: 100%;
  max-height: 60vh;
  object-fit: contain;
}
.stage figcaption {
  display: grid;
  font-size: 0.9rem;
}
.stage figcaption span {
  color: #cbd2d9;
}
/* El visor a pantalla completa: la obra ocupa todo lo posible. */
.stage:fullscreen {
  place-content: center;
  padding: 1rem;
  background: #000000;
}
.stage:fullscreen img {
  max-height: 88vh;
}
.viewer-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
.position {
  min-width: 3rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.viewer button {
  font: inherit;
  padding: 0.3rem 0.7rem;
  border: 1px solid #9aa5b1;
  border-radius: 0.5rem;
  background: #1f2933;
  color: #e5e7eb;
  cursor: pointer;
}
.viewer button:disabled {
  color: #9aa5b1;
  cursor: not-allowed;
}
.viewer button:focus-visible {
  outline: 3px solid #93c5fd;
  outline-offset: 2px;
}
.viewer-status {
  min-height: 1.4em;
  margin: 0.5rem 0 0;
  color: #cbd2d9;
  font-size: 0.85rem;
}
```

# JavaScript

```javascript
// GALERÍA CON VISOR.
//
// Decisiones de diseño:
// - Miniaturas con loading="lazy" (lo hace el navegador: no hace falta un
//   observer para eso) y el ancho y alto que reservan su hueco.
// - El visor es un <dialog> abierto con showModal(): atrapa el foco, Esc lo
//   cierra y el resto de la página queda inerte. Al cerrar, el foco vuelve a
//   la miniatura que lo abrió.
// - ← y → (y los botones) recorren las obras en bucle; al mostrar una, se
//   precargan la anterior y la siguiente con new Image() + decode(), para que
//   el cambio sea inmediato. El fundido solo sin prefers-reduced-motion.
// - Pantalla completa sobre la figura del visor (un gesto del usuario; si el
//   iframe no lo permite, el botón se desactiva). «Compartir» usa Web Share si
//   puede (canShare) y, si no, copia el enlace; si tampoco puede, lo enseña.
// - Un IntersectionObserver con root: document (la ventana de este
//   documento) cuenta las obras vistas al menos a la mitad, una vez cada una.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

const ARTWORKS = [
  { id: 'valle', title: 'Valle de México', credit: 'José María Velasco, 1877. Dominio público.', file: 'velasco-valle-de-mexico', alt: 'Valle de México visto desde un cerro: llanura verde, lagos y volcanes al fondo', width: 960, height: 660 },
  { id: 'ola', title: 'La gran ola de Kanagawa', credit: 'Katsushika Hokusai, c. 1831. Dominio público.', file: 'hokusai-gran-ola', alt: 'Una ola enorme con crestas como garras sobre tres barcas, con el monte Fuji al fondo', width: 960, height: 646 },
  { id: 'tierra', title: 'La canica azul', credit: 'NASA, Apolo 17, 1972. Dominio público.', file: 'tierra-apolo-17', alt: 'La Tierra entera vista desde el espacio, con África y la Antártida bajo las nubes', width: 960, height: 960 },
  { id: 'pilares', title: 'Pilares de la creación', credit: 'NASA, ESA y Hubble Heritage Team, 2014. Dominio público.', file: 'pilares-de-la-creacion', alt: 'Tres columnas de gas y polvo oscuras sobre un fondo estrellado', width: 960, height: 1002 },
  { id: 'luna', title: 'Buzz Aldrin en la Luna', credit: 'NASA, Apolo 11, 1969. Dominio público.', file: 'aldrin-apolo-11', alt: 'Un astronauta con traje blanco de pie sobre el suelo gris de la Luna', width: 960, height: 966 },
];
const BASE = '12-galeria/';
const gallery = document.querySelector('#gallery');
const viewer = document.querySelector('#viewer');
const viewerImage = document.querySelector('#viewer-image');
const stage = document.querySelector('#stage');
const viewerStatus = document.querySelector('#viewer-status');
const fullscreenButton = document.querySelector('#fullscreen');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let current = 0;
let opener = null;
const preloaded = new Set();

// ── Miniaturas ───────────────────────────────────────────────────────────
const thumbs = ARTWORKS.map((artwork, index) => {
  const item = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'thumb';
  button.dataset.index = index;
  const image = document.createElement('img');
  image.src = `${BASE}${artwork.file}-480.jpg`;
  image.width = artwork.width / 2;
  image.height = artwork.height / 2;
  image.loading = 'lazy';
  image.alt = '';  // el nombre accesible del botón lo da el texto
  const label = document.createElement('span');
  label.textContent = artwork.title;
  button.append(image, label);
  button.setAttribute('aria-label', `Ver «${artwork.title}» en grande`);
  item.append(button);
  gallery.append(item);
  return button;
});

// ── El visor ─────────────────────────────────────────────────────────────
const largeUrl = (index) => `${BASE}${ARTWORKS[index].file}.jpg`;
const wrap = (index) => (index + ARTWORKS.length) % ARTWORKS.length;
function preload(index) {
  const url = largeUrl(index);
  if (preloaded.has(url)) return;
  preloaded.add(url);
  const image = new Image();
  image.src = url;
  image.decode().catch(() => preloaded.delete(url)); // si falla, se reintentará
}
function show(index) {
  current = wrap(index);
  const artwork = ARTWORKS[current];
  viewerImage.src = largeUrl(current);
  viewerImage.alt = artwork.alt;
  viewerImage.width = artwork.width;
  viewerImage.height = artwork.height;
  document.querySelector('#viewer-title').textContent = artwork.title;
  document.querySelector('#viewer-credit').textContent = artwork.credit;
  document.querySelector('#position').textContent = `${current + 1} / ${ARTWORKS.length}`;
  viewerStatus.textContent = '';
  if (!reduceMotion.matches) viewerImage.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: 250, easing: 'ease-out' });
  preload(wrap(current + 1));
  preload(wrap(current - 1));
}
function openViewer(index, from) {
  opener = from ?? null;
  show(index);
  if (!viewer.open) viewer.showModal();
}
gallery.addEventListener('click', (event) => {
  const thumb = event.target.closest('.thumb');
  if (thumb) openViewer(Number(thumb.dataset.index), thumb);
});
document.querySelector('#previous').addEventListener('click', () => show(current - 1));
document.querySelector('#next').addEventListener('click', () => show(current + 1));
document.querySelector('#close').addEventListener('click', () => viewer.close());
viewer.addEventListener('keydown', (event) => {
  if (event.target.closest('button') && (event.key === 'Enter' || event.key === ' ')) return;
  if (event.key === 'ArrowRight') show(current + 1);
  else if (event.key === 'ArrowLeft') show(current - 1);
});
viewer.addEventListener('close', async () => {
  if (document.fullscreenElement) await document.exitFullscreen();
  opener?.focus(); // de vuelta a la miniatura que abrió el visor
});

// ── Pantalla completa y compartir ────────────────────────────────────────
fullscreenButton.disabled = !document.fullscreenEnabled;
fullscreenButton.title = document.fullscreenEnabled ? '' : 'Este iframe no permite la pantalla completa';
fullscreenButton.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await stage.requestFullscreen();
  } catch (error) {
    viewerStatus.textContent = `No se pudo (${error.name}).`;
  }
});
document.querySelector('#share').addEventListener('click', async () => {
  const artwork = ARTWORKS[current];
  const data = { title: artwork.title, text: artwork.credit, url: `https://paisajes-y-cielos.example/obras/${artwork.id}` };
  try {
    if (navigator.canShare?.(data)) {
      await navigator.share(data);
      viewerStatus.textContent = 'Compartida.';
    } else {
      await navigator.clipboard.writeText(data.url);
      viewerStatus.textContent = 'Enlace copiado al portapapeles.';
    }
  } catch (error) {
    viewerStatus.textContent = error.name === 'AbortError' ? '' : `Enlace: ${data.url}`;
  }
});

// ── Obras vistas: al menos la mitad a la vista, una vez cada una ─────────
const seen = new Set();
function countSeen(entries, observer) {
  for (const entry of entries) {
    if (entry.intersectionRatio < 0.5) continue;
    seen.add(entry.target.dataset.index);
    observer.unobserve(entry.target);
  }
  document.querySelector('#seen').textContent = seen.size;
  return seen.size;
}

// ── Comprobaciones al cargar ─────────────────────────────────────────────
function audit(label, actual, expected) {
  if (actual === expected) console.log('✅', label, '→', actual);
  else console.error('❌', label, '→', actual, '(esperaba', expected, ')');
}
audit('5 miniaturas con nombre accesible', thumbs.filter((thumb) => thumb.getAttribute('aria-label').startsWith('Ver «')).length, 5);
openViewer(1, thumbs[1]);
audit('abrir la 2.ª: diálogo modal con la obra grande', `${viewer.open} · ${viewerImage.getAttribute('src')} · ${document.querySelector('#position').textContent}`, 'true · 12-galeria/hokusai-gran-ola.jpg · 2 / 5');
audit('se precargan la anterior y la siguiente', [...preloaded].join(' '), '12-galeria/tierra-apolo-17.jpg 12-galeria/velasco-valle-de-mexico.jpg');
viewer.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
viewer.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
audit('← dos veces: de la 2.ª a la 5.ª (en bucle)', `${document.querySelector('#position').textContent} · ${document.querySelector('#viewer-title').textContent}`, '5 / 5 · Buzz Aldrin en la Luna');
const closed = new Promise((resolve) => viewer.addEventListener('close', () => setTimeout(resolve), { once: true }));
viewer.close();
await closed; // el evento close llega en una tarea, y su listener devuelve el foco
audit('al cerrar, el foco vuelve a la miniatura', document.activeElement === thumbs[1], true);
const fakeObserver = { unobserve() {} };
countSeen([{ target: thumbs[0], intersectionRatio: 1 }, { target: thumbs[1], intersectionRatio: 0.3 }], fakeObserver);
audit('vistas: solo cuenta lo que se ve al menos a la mitad, una vez', countSeen([{ target: thumbs[0], intersectionRatio: 0.9 }, { target: thumbs[2], intersectionRatio: 0.6 }], fakeObserver), 2);
seen.clear();
document.querySelector('#seen').textContent = 0;
const seenObserver = new IntersectionObserver(countSeen, { root: document, threshold: 0.5 });
thumbs.forEach((thumb) => seenObserver.observe(thumb));
console.log('Listo: pulsa una obra; recórrelas con ← → o los botones; prueba «Pantalla completa», «Compartir» y Esc');
```
