---
example_description: "Un carrusel de productos que se desliza con el dedo o el ratón (Pointer Events, captura, touch-action: pan-y para no bloquear el scroll vertical, umbral por distancia o velocidad) y se maneja con botones, indicadores y flechas; evita el arrastre nativo de los enlaces y el clic accidental tras deslizar, y avisa con carousel:change"
example_tags: "javascript|eventos|profesional|carrusel|pointer-events|touch-action|accesibilidad|customevent"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="shop">
  <h1>Temporada de otoño</h1>
  <section class="carousel" id="seasonal" aria-roledescription="carrusel" aria-label="Productos de temporada">
    <div class="viewport" id="viewport">
      <div class="track" id="track">
        <div class="slide" role="group" aria-roledescription="diapositiva" aria-label="1 de 5">
          <p class="art" aria-hidden="true">☕</p><h2>Café de olla</h2><p>Con canela y piloncillo · $185.00</p>
          <a href="/productos/cafe-de-olla">Ver producto</a>
        </div>
        <div class="slide" role="group" aria-roledescription="diapositiva" aria-label="2 de 5">
          <p class="art" aria-hidden="true">🎃</p><h2>Tamales de calabaza</h2><p>Media docena · $210.00</p>
          <a href="/productos/tamales-de-calabaza">Ver producto</a>
        </div>
        <div class="slide" role="group" aria-roledescription="diapositiva" aria-label="3 de 5">
          <p class="art" aria-hidden="true">🍫</p><h2>Champurrado</h2><p>Mezcla para 8 tazas · $120.00</p>
          <a href="/productos/champurrado">Ver producto</a>
        </div>
        <div class="slide" role="group" aria-roledescription="diapositiva" aria-label="4 de 5">
          <p class="art" aria-hidden="true">🥮</p><h2>Pan de muerto</h2><p>Con ralladura de naranja · $95.00</p>
          <a href="/productos/pan-de-muerto">Ver producto</a>
        </div>
        <div class="slide" role="group" aria-roledescription="diapositiva" aria-label="5 de 5">
          <p class="art" aria-hidden="true">🌰</p><h2>Castañas asadas</h2><p>Bolsa de 300 g · $80.00</p>
          <a href="/productos/castanas-asadas">Ver producto</a>
        </div>
      </div>
    </div>
    <div class="controls">
      <button type="button" data-step="-1" aria-label="Producto anterior">‹</button>
      <div class="dots" id="dots"></div>
      <button type="button" data-step="1" aria-label="Producto siguiente">›</button>
    </div>
    <p id="carousel-status" class="visually-hidden" aria-live="polite"></p>
  </section>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root {
  --ink: #1f2933;
  --muted: #52606d;
  --line: #cbd2d9;
  --surface: #ffffff;
  --page: #f5f7fa;
  --accent: #1d4ed8;
  --accent-soft: #dbeafe;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: var(--ink);
  background: var(--page);
}
.shop {
  max-width: 30rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.25rem;
  margin-top: 0;
}
.viewport {
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 0.75rem;
  background: var(--surface);
  touch-action: pan-y; /* el desplazamiento vertical sigue siendo del navegador */
  user-select: none;
  cursor: grab;
}
.track {
  display: flex;
}
.slide {
  flex: 0 0 100%;
  padding: 1rem 1.25rem;
  text-align: center;
}
.slide h2 {
  font-size: 1.05rem;
  margin: 0;
}
.art {
  font-size: 3rem;
  margin: 0;
}
a {
  color: var(--accent);
}
.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}
.dots {
  display: flex;
  gap: 0.35rem;
}
.dots button {
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border-radius: 50%;
}
.dots button[aria-current="true"] {
  border-color: var(--accent);
  background: var(--accent);
}
button {
  font: inherit;
  padding: 0.2rem 0.7rem;
  border: 1px solid var(--muted);
  border-radius: 0.4rem;
  background: var(--surface);
  color: var(--ink);
  cursor: pointer;
}
button:disabled {
  color: var(--muted);
  cursor: not-allowed;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
.log {
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: var(--surface);
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Carrusel deslizable con puntero, botones y teclado.
//
// Decisiones de diseño:
// - Sin reproducción automática: el usuario decide cuándo avanza. Los botones
//   ‹ › y los indicadores son la vía principal; deslizar es un extra.
// - touch-action: pan-y en la ventana: el navegador se queda el gesto vertical
//   (la página sigue desplazándose) y nos deja el horizontal. Si el gesto se
//   lo queda él, llega pointercancel y el carrusel vuelve a su sitio.
// - El ancho se mide al empezar el gesto (una lectura), y el puntero se captura
//   solo cuando el gesto ya es un deslizamiento (más de 5 px). Se cambia de producto
//   si el dedo recorre más del 20 % del ancho, o si va deprisa (más de
//   0,5 px/ms aunque sea poco recorrido).
// - Dos trampas de los carruseles: un enlace se puede «arrastrar» de forma
//   nativa (dragstart) y nos quitaría el puntero, y al soltar tras deslizar
//   llega un click que abriría el enlace. Se cancelan las dos acciones por
//   defecto (sin stopPropagation: nadie más pierde el evento).
// - Cada cambio avisa con carousel:change y se anuncia en una región
//   aria-live; los indicadores marcan el actual con aria-current.
// - Los cambios son instantáneos (el módulo de animaciones de CSS llega más
//   adelante).
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM y este módulo.

const logList = document.querySelector('#log');
let quiet = false;
function logLine(text) {
  if (quiet) return;
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

function createCarousel(root) {
  const viewport = root.querySelector('.viewport');
  const track = root.querySelector('.track');
  const slides = [...track.children];
  const count = slides.length;
  const dots = root.querySelector('.dots');
  const [prevButton, nextButton] = root.querySelectorAll('[data-step]');
  let index = 0;

  dots.replaceChildren(...slides.map((slide, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.dataset.index = i;
    dot.setAttribute('aria-label', `Ir al producto ${i + 1}: ${slide.querySelector('h2').textContent}`);
    return dot;
  }));

  // Ojo: un porcentaje en translate es del PROPIO elemento, no de su contenido.
  // La pista es un contenedor flex tan ancho como la ventana (las diapositivas
  // se desbordan a la derecha), así que -100 % la mueve exactamente UNA
  // diapositiva. (Con -20 % «porque son 5» solo se movería una quinta parte.)
  const offset = (extraPx = 0) => `calc(${-index * 100}% + ${extraPx}px)`;
  function render() {
    track.style.translate = offset();
    slides.forEach((slide, i) => {
      slide.inert = i !== index; // las diapositivas ocultas no reciben el foco
    });
    [...dots.children].forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
    prevButton.disabled = index === 0;
    nextButton.disabled = index === count - 1;
  }
  function goTo(next, source) {
    const target = Math.min(count - 1, Math.max(0, next));
    if (target === index) {
      render(); // vuelve a su sitio tras un gesto corto
      return;
    }
    index = target;
    render();
    const title = slides[index].querySelector('h2').textContent;
    root.querySelector('[aria-live]').textContent = `Producto ${index + 1} de ${count}: ${title}`;
    root.dispatchEvent(new CustomEvent('carousel:change', { bubbles: true, detail: { index, title, source } }));
  }

  // Botones e indicadores: un listener delegado.
  root.addEventListener('click', (event) => {
    const step = event.target.closest('[data-step]');
    const dot = event.target.closest('[data-index]');
    if (step) goTo(index + Number(step.dataset.step), 'botón');
    if (dot) goTo(Number(dot.dataset.index), 'indicador');
  });
  // Teclado: flechas con el foco dentro del carrusel.
  root.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    goTo(index + (event.key === 'ArrowRight' ? 1 : -1), 'teclado');
  });

  // Deslizar.
  let gesture = null; // { pointerId, startX, startTime, width, dx, captured }
  let suppressClick = false;
  viewport.addEventListener('dragstart', (event) => event.preventDefault()); // nada de arrastre nativo
  viewport.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    suppressClick = false; // un gesto nuevo: lo de antes ya no cuenta
    gesture = { pointerId: event.pointerId, startX: event.clientX, startTime: event.timeStamp, width: viewport.clientWidth, dx: 0, captured: false };
  });
  viewport.addEventListener('pointermove', (event) => {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    if (event.buttons === 0) { // se soltó fuera antes de empezar a deslizar
      gesture = null;
      return;
    }
    gesture.dx = event.clientX - gesture.startX;
    if (!gesture.captured && Math.abs(gesture.dx) > 5) {
      // Capturamos cuando YA es un deslizamiento: con la captura puesta, el
      // click de un simple toque iría a la ventana y no al enlace.
      viewport.setPointerCapture(event.pointerId);
      gesture.captured = true;
    }
    if (gesture.captured) track.style.translate = offset(gesture.dx);
  });
  viewport.addEventListener('pointerup', (event) => {
    if (!gesture) return;
    const { dx, width, startTime, captured } = gesture;
    gesture = null;
    if (!captured) return; // fue un toque o un clic: lo atiende el click normal
    suppressClick = true;  // y el click que llega ahora no debe abrir el enlace
    const speed = Math.abs(dx) / Math.max(1, event.timeStamp - startTime);
    if (Math.abs(dx) > width * 0.2 || (speed > 0.5 && Math.abs(dx) > 20)) goTo(index + (dx < 0 ? 1 : -1), 'deslizar');
    else goTo(index, 'deslizar');
  });
  viewport.addEventListener('pointercancel', () => {
    gesture = null;
    render();
  });
  viewport.addEventListener('click', (event) => {
    if (suppressClick) event.preventDefault(); // el clic que llega al soltar no abre el enlace
    suppressClick = false;
  }, { capture: true });

  render();
  return { get index() { return index; }, goTo };
}

const carousel = createCarousel(document.querySelector('#seasonal'));
document.addEventListener('carousel:change', (event) => {
  logLine(`🎠 ${event.detail.index + 1}/5 «${event.detail.title}» (${event.detail.source})`);
});
// Los enlaces de ejemplo no navegan (las rutas son inventadas).
document.querySelector('#track').addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link || event.defaultPrevented) return;
  event.preventDefault();
  logLine(`🔗 abriría ${link.getAttribute('href')}`);
});

// ── Autocomprobación (simulada con clics, teclas y un dragstart).
function audit() {
  quiet = true;
  const results = [];
  const expect = (label, ok) => results.push(`${ok ? '✓' : '✗'} ${label}`);
  const root = document.querySelector('#seasonal');
  const visibleSlides = () => [...document.querySelectorAll('.slide')].filter((slide) => !slide.inert);
  expect('5 diapositivas con «n de 5»; solo la primera es accesible', visibleSlides().length === 1
    && document.querySelector('.slide').getAttribute('aria-label') === '1 de 5');
  expect('al empezar, «anterior» está desactivado', root.querySelector('[data-step="-1"]').disabled);
  root.querySelector('[data-step="1"]').click();
  expect('«siguiente» lleva al producto 2', carousel.index === 1 && visibleSlides()[0].getAttribute('aria-label') === '2 de 5');
  root.querySelectorAll('.dots button')[4].click();
  expect('el último indicador lleva al 5 y marca aria-current', carousel.index === 4
    && root.querySelectorAll('.dots [aria-current="true"]').length === 1);
  root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
  expect('← vuelve al 4', carousel.index === 3);
  const drag = new DragEvent('dragstart', { bubbles: true, cancelable: true });
  document.querySelector('.slide a').dispatchEvent(drag);
  expect('el arrastre nativo de los enlaces está cancelado', drag.defaultPrevented);
  // Lo que se VE, no solo el estado: la diapositiva 4 empieza donde la ventana.
  const viewportLeft = document.querySelector('#viewport').getBoundingClientRect().left;
  const slideLeft = document.querySelectorAll('.slide')[3].getBoundingClientRect().left;
  expect('la diapositiva 4 está alineada con la ventana (±1 px)', Math.abs(slideLeft - viewportLeft) <= 1);
  carousel.goTo(0, 'prueba');
  quiet = false;
  console.log('Autocomprobación (simulada):');
  results.forEach((line) => console.log(`  ${line}`));
}
audit();
logLine('Listo: desliza el carrusel (o arrástralo con el ratón); usa ‹ › y los puntos; o Tab hasta un botón y ← →');
```
