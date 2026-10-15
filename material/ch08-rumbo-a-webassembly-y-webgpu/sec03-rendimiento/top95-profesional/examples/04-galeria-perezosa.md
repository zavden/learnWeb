---
example_description: "Una galería de 15 obras que carga solo lo que se ve: la primera imagen con fetchpriority=high (es el LCP), las demás con loading=lazy y decoding=async, todas con width y height (cero desplazamientos de layout), srcset 480w/960w para pantallas de 1x y 2x, y cada tarjeta con content-visibility: auto. Un observador cuenta las imágenes descargadas y los desplazamientos"
example_tags: "html|javascript|rendimiento|imagenes|lazy-loading|content-visibility|lcp|cls|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="museum">
  <h1>Obras de dominio público</h1>
  <p class="intro">Tres salas, cinco obras cada una. Desplázate por la galería: las imágenes llegan cuando se acercan.</p>
  <p id="counters" class="counters" role="status"></p>
  <div id="gallery" class="gallery"></div>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --paper: #ffffff; --page: #f8fafc; }
body { margin: 0; font-family: system-ui, sans-serif; color: var(--ink); background: var(--page); }
.museum { max-width: 46rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.25rem; margin-top: 0; }
.intro, .counters { color: var(--muted); }
.counters { font-variant-numeric: tabular-nums; }
.gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr)); gap: 1rem; }
.room { grid-column: 1 / -1; margin: 0.5rem 0 0; font-size: 1rem; }
.artwork {
  margin: 0;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: var(--paper);
  overflow: hidden;
  /* Fuera de pantalla, el navegador se salta su layout y su pintado; 260 px de reserva
     (auto: una vez pintada, recuerda su altura real). */
  content-visibility: auto;
  contain-intrinsic-size: auto 260px;
}
.artwork img { display: block; inline-size: 100%; block-size: auto; background: #e2e8f0; } /* width/height del HTML dan la proporción */
.artwork figcaption { padding: 0.5rem 0.75rem; font-size: 0.85rem; }
.artwork figcaption small { display: block; color: var(--muted); }
.log { margin: 1rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--paper); font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
// GALERÍA QUE CARGA LO QUE SE VE
// - width y height en cada <img>: el navegador reserva el hueco antes de descargar, así que
//   nada se mueve al llegar la imagen (CLS 0). El CSS deja el ancho al 100 % y el alto en auto.
// - La primera imagen es la más grande del primer vistazo (el LCP): carga ya, con prioridad.
//   Las demás, loading="lazy": el navegador las pide al acercarse a la pantalla.
// - decoding="async": decodificar una foto no bloquea el hilo principal.
// - srcset 480w/960w + sizes: en una pantalla 2x llega la de 960 px, en una 1x la de 480.
// - content-visibility: auto en cada tarjeta: las que no se ven no cuestan layout ni pintado.
// - Las imágenes están en assets/gallery/ (dominio público; créditos en cada pie de foto).

const WORKS = [
  { file: 'velasco-valley', width: 480, height: 330, title: 'Valle de México', credit: 'José María Velasco, 1877. Dominio público.' },
  { file: 'hokusai-wave', width: 480, height: 323, title: 'La gran ola de Kanagawa', credit: 'Katsushika Hokusai, c. 1831. Dominio público.' },
  { file: 'earth-apollo17', width: 480, height: 480, title: 'La Tierra desde el Apolo 17', credit: 'NASA, 1972. Dominio público.' },
  { file: 'pillars-creation', width: 480, height: 501, title: 'Pilares de la creación', credit: 'NASA, ESA y Hubble Heritage Team, 2014. Dominio público.' },
  { file: 'aldrin-apollo11', width: 480, height: 483, title: 'Buzz Aldrin en la Luna', credit: 'NASA, Apolo 11, 1969. Dominio público.' },
];
const ROOMS = ['Sala 1 · Paisajes y mares', 'Sala 2 · Vistas del espacio', 'Sala 3 · Préstamos de otros museos'];

const gallery = document.querySelector('#gallery');
const counters = document.querySelector('#counters');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const stats = { requested: new Set(), loaded: 0, shifts: 0 };
function showCounters() {
  counters.textContent = `imágenes descargadas: ${stats.loaded} de 15 · archivos distintos pedidos: ${stats.requested.size} · desplazamientos de layout: ${stats.shifts}`;
}

let cardIndex = 0;
ROOMS.forEach((room, r) => {
  gallery.append(Object.assign(document.createElement('h2'), { className: 'room', textContent: room }));
  WORKS.forEach((work, w) => {
    const first = cardIndex === 0;
    const figure = Object.assign(document.createElement('figure'), { className: 'artwork' });
    const image = document.createElement('img');
    Object.assign(image, {
      src: `gallery/${work.file}-480.jpg`,
      srcset: `gallery/${work.file}-480.jpg 480w, gallery/${work.file}-960.jpg 960w`,
      sizes: '(min-width: 46rem) 14rem, (min-width: 30rem) 45vw, 92vw',
      width: work.width,
      height: work.height,
      alt: `${work.title}, ${work.credit.split(',')[0]}`,
      decoding: 'async',
      loading: first ? 'eager' : 'lazy',
    });
    if (first) image.fetchPriority = 'high';
    image.addEventListener('load', () => {
      stats.loaded += 1;
      stats.requested.add(image.currentSrc.split('/').pop());
      showCounters();
    }, { once: true });
    const caption = document.createElement('figcaption');
    caption.append(`${work.title} `, Object.assign(document.createElement('small'), { textContent: `${work.credit} · ${room.split(' · ')[0]}, n.º ${w + 1}` }));
    figure.append(image, caption);
    gallery.append(figure);
    cardIndex += 1;
  });
});

// Auditoría de la propia página: lo que se puede comprobar sin depender del tamaño de la ventana.
const images = [...gallery.querySelectorAll('img')];
logLine(`${images.length} obras · con width y height: ${images.filter((img) => img.getAttribute('width') && img.getAttribute('height')).length}`
  + ` · loading=lazy: ${images.filter((img) => img.loading === 'lazy').length} · fetchpriority=high: ${images.filter((img) => img.fetchPriority === 'high').length}`
  + ` · decoding=async: ${images.filter((img) => img.decoding === 'async').length}`);
// Desplazamientos de layout: deberían ser 0 aunque las imágenes lleguen tarde.
if (PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) if (!entry.hadRecentInput) stats.shifts += 1;
    showCounters();
  }).observe({ type: 'layout-shift', buffered: true });
}
showCounters();
setTimeout(() => {
  logLine(`a los 2 s · desplazamientos de layout: ${stats.shifts} · la primera imagen ¿cargada? ${images[0].complete}`);
  logLine(`a los 2 s · imágenes descargadas: ≈ ${stats.loaded} de 15 (las que el navegador ve cerca de la pantalla)`);
}, 2000);
console.log('Listo: desplázate por la galería y mira cómo sube «imágenes descargadas»');
```
