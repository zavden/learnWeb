---
example_description: "Galería de azulejos que combina tres lecciones: IntersectionObserver con el panel como raíz carga cada imagen poco antes de verse, la aparición con element.animate dura 0 ms si matchMedia dice que la persona prefiere menos movimiento, y cada azulejo se abre a pantalla completa (con su aviso en una tarjeta)"
example_tags: "javascript|intersectionobserver|lazy-load|matchmedia|prefers-reduced-motion|fullscreen|web-animations"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Azulejos de Talavera</h1>
  <p class="toolbar">
    <button id="to-end" type="button">⤓ Ir al final</button>
    <span>Pedidos: <output id="requested">0 de 9</output></span>
  </p>
  <!-- Usa tile-01.svg … tile-09.svg de assets/. -->
  <div id="gallery" class="gallery" tabindex="0" role="region" aria-label="Galería de azulejos"></div>
  <p id="card-notice" class="notice" hidden>En esta tarjeta (un iframe aislado) no hay pantalla completa: ábrela con «▶ Run» o en el editor.</p>
  <ol id="log" class="log" aria-live="polite"></ol>
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
.toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 0.5rem;
}
/* La raíz del observer: 160 px de alto, sin relleno, filas de 120 px. */
.gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  height: 10rem;
  overflow-y: auto;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
}
.tile {
  display: grid;
  justify-items: center;
  align-content: start;
  height: 120px;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  font-size: 0.8rem;
  cursor: zoom-in;
}
.tile img {
  border-radius: 0.25rem;
  background: #e4e7eb;
}
.tile img:not([src]) {
  color: transparent;
}
/* El azulejo a pantalla completa: grande y centrado. */
.tile:fullscreen {
  align-content: center;
  gap: 1rem;
  background: #111827;
  color: #e5e7eb;
  font-size: 1.2rem;
  cursor: zoom-out;
}
.tile:fullscreen img {
  width: min(70vw, 70vh);
  height: auto;
}
button {
  font: inherit;
  padding: 0.3rem 0.7rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:focus-visible,
.gallery:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.notice {
  color: #92400e;
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
const TILES = ['Pétalos', 'Estrella', 'Rosetón', 'Trébol', 'Lucero', 'Jazmín', 'Margarita', 'Sol', 'Girasol'];
const gallery = document.querySelector('#gallery');
const requestedOutput = document.querySelector('#requested');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// ── Los azulejos: botones (teclado) con una imagen sin src ───────────────
const images = TILES.map((name, index) => {
  const tile = document.createElement('button');
  tile.type = 'button';
  tile.className = 'tile';
  const image = document.createElement('img');
  image.dataset.src = `tile-${String(index + 1).padStart(2, '0')}.svg`;
  image.width = 96;
  image.height = 96; // el hueco reservado: nada salta al llegar la imagen
  image.alt = `Azulejo «${name}»`;
  const label = document.createElement('span');
  label.textContent = name;
  tile.append(image, label);
  gallery.append(tile);
  return image;
});

// ── Movimiento: la preferencia, viva (lección «Media queries en JS») ────
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
function fadeIn(image) {
  image.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduceMotion.matches ? 0 : 400, easing: 'ease-out' });
}

// ── Carga diferida (lección «Observers») ───────────────────────────────
let requested = 0;
const observer = new IntersectionObserver((entries) => {
  const now = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target);
  for (const image of now) {
    image.addEventListener('load', () => fadeIn(image), { once: true });
    image.src = image.dataset.src;
    observer.unobserve(image);
  }
  if (now.length === 0) return;
  requested += now.length;
  requestedOutput.textContent = `${requested} de ${images.length}`;
  logLine(`⬇️ pido ${now.map((image) => image.dataset.src).join(', ')} (${requested} de ${images.length})`);
  if (requested === images.length) {
    observer.disconnect();
    logLine('✅ todo pedido: disconnect()');
  }
}, { root: gallery, rootMargin: '0px 0px 80px 0px' });
for (const image of images) observer.observe(image);

// ── Pantalla completa (lección «Media queries en JS, visibilidad y pantalla») ──
logLine(`fullscreenEnabled → ${document.fullscreenEnabled} · movimiento reducido → ${reduceMotion.matches}`);
if (!document.fullscreenEnabled) document.querySelector('#card-notice').hidden = false;
gallery.addEventListener('click', async (event) => {
  const tile = event.target.closest('.tile');
  if (!tile) return;
  if (document.fullscreenElement) {
    await document.exitFullscreen(); // un segundo clic sale
    return;
  }
  try {
    await tile.requestFullscreen();
  } catch (error) {
    logLine(`⚠️ ${error.name}: ${error.message}`);
  }
});
document.addEventListener('fullscreenchange', () => {
  const tile = document.fullscreenElement;
  logLine(tile ? `⛶ pantalla completa → ${tile.textContent}` : '⛶ fuera de pantalla completa');
});

document.querySelector('#to-end').addEventListener('click', () => {
  gallery.scrollTop = gallery.scrollHeight;
});
logLine('Listo: desplaza la galería; pulsa un azulejo para verlo en grande (Esc o un clic para salir)');
```
