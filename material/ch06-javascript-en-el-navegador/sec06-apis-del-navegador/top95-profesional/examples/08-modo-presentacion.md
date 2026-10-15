---
example_description: "Unas diapositivas para un taller de café: se pasan con botones o con el teclado (flechas, AvPág/RePág, Inicio/Fin, F), se anuncian en una región aria-live, cambian con un fundido que desaparece con prefers-reduced-motion, se ponen a pantalla completa con la Fullscreen API y mantienen la pantalla encendida con Wake Lock, que se vuelve a pedir al volver a la pestaña; todo con su alternativa cuando el iframe no lo permite"
example_tags: "javascript|fullscreen|wake-lock|visibilitychange|teclado|aria-live|web-animations|prefers-reduced-motion|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <section id="deck" class="deck" tabindex="0" aria-roledescription="presentación" aria-label="Taller: del grano a la taza">
    <article class="slide" aria-roledescription="diapositiva">
      <h2>Del grano a la taza</h2>
      <p>Taller de café de especialidad · Cafetería La Ceiba</p>
    </article>
    <article class="slide" aria-roledescription="diapositiva" hidden>
      <h2>Del cafetal al beneficio</h2>
      <ul><li>Cosecha a mano, cereza a cereza</li><li>Despulpado, fermentado y lavado</li><li>Secado al sol dos semanas</li></ul>
    </article>
    <article class="slide" aria-roledescription="diapositiva" hidden>
      <h2>El tueste</h2>
      <ul><li>Claro: fruta y acidez</li><li>Medio: equilibrio y dulzor</li><li>Oscuro: cuerpo y chocolate</li></ul>
    </article>
    <article class="slide" aria-roledescription="diapositiva" hidden>
      <h2>La receta</h2>
      <p>60 g de café por litro · agua a 93 °C · molienda según el método</p>
    </article>
    <article class="slide" aria-roledescription="diapositiva" hidden>
      <h2>¡A catar!</h2>
      <p>Aroma, acidez, cuerpo y final: apunta lo que notes en cada taza.</p>
    </article>
  </section>
  <nav class="controls" aria-label="Controles de la presentación">
    <button id="previous" type="button">← Anterior</button>
    <output id="counter" class="counter">1 / 5</output>
    <button id="next" type="button">Siguiente →</button>
    <button id="fullscreen" type="button" aria-pressed="false">⛶ Pantalla completa (F)</button>
    <button id="awake" type="button" aria-pressed="false">🔆 Pantalla siempre encendida</button>
  </nav>
  <p id="announcer" class="visually-hidden" aria-live="polite"></p>
  <p id="notice" class="notice" role="status"></p>
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
  max-width: 40rem;
  margin: 0 auto;
  padding: 1rem;
}
.deck {
  display: grid;
  min-height: 14rem;
  padding: 1.5rem;
  border-radius: 0.75rem;
  background: #3f2a1e;
  color: #fdf6e3;
}
.slide {
  align-self: center;
}
.slide[hidden] {
  display: none;
}
.slide h2 {
  margin: 0 0 0.5rem;
  font-size: 1.6rem;
}
.slide p,
.slide li {
  font-size: 1.1rem;
  line-height: 1.5;
}
/* A pantalla completa: letra grande y centrada. */
.deck:fullscreen {
  place-content: center;
  padding: 4rem;
}
.deck:fullscreen .slide h2 {
  font-size: 3.5rem;
}
.deck:fullscreen .slide p,
.deck:fullscreen .slide li {
  font-size: 2rem;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
.counter {
  min-width: 3.5rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
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
button[aria-pressed="true"] {
  border-color: #92400e;
  background: #fef3c7;
}
button:disabled {
  color: #52606d;
  cursor: not-allowed;
}
button:focus-visible,
.deck:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.notice {
  min-height: 1.4em;
  color: #92400e;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```

# JavaScript

```javascript
// MODO PRESENTACIÓN.
//
// Decisiones de diseño:
// - Una sola función, show(índice), para botones y teclado. Las diapositivas
//   usan hidden (con su regla [hidden] en el CSS) y aria-roledescription; el
//   número va a una región aria-live junto con el título.
// - Teclado con el foco en la presentación: ← → AvPág RePág Inicio Fin, y F
//   para la pantalla completa. Sin atajos globales: no estorban a quien
//   escribe en otra parte ni a los lectores de pantalla.
// - El cambio de diapositiva es un fundido con element.animate; con
//   prefers-reduced-motion (matchMedia, en vivo) no hay animación.
// - Fullscreen API desde un clic o una tecla (gesto del usuario); si el
//   documento no lo permite (fullscreenEnabled false: una tarjeta de la
//   teoría), el botón se desactiva y lo explica.
// - Wake Lock solo al pulsar su botón; el navegador lo suelta al ocultarse
//   la pestaña, así que se vuelve a pedir en visibilitychange si sigue activo.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos,
// gráficos y animación, y este módulo.

const deck = document.querySelector('#deck');
const slides = [...deck.querySelectorAll('.slide')];
const counter = document.querySelector('#counter');
const announcer = document.querySelector('#announcer');
const notice = document.querySelector('#notice');
const previousButton = document.querySelector('#previous');
const nextButton = document.querySelector('#next');
const fullscreenButton = document.querySelector('#fullscreen');
const awakeButton = document.querySelector('#awake');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let current = 0;

slides.forEach((slide, index) => slide.setAttribute('aria-label', `${index + 1} de ${slides.length}`));

// ── Pasar diapositivas ───────────────────────────────────────────────────
function show(index) {
  const next = Math.max(0, Math.min(slides.length - 1, index));
  if (next === current) return false;
  slides[current].hidden = true;
  slides[next].hidden = false;
  if (!reduceMotion.matches) {
    slides[next].animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, easing: 'ease-out' });
  }
  current = next;
  counter.textContent = `${current + 1} / ${slides.length}`;
  previousButton.disabled = current === 0;
  nextButton.disabled = current === slides.length - 1;
  announcer.textContent = `Diapositiva ${current + 1} de ${slides.length}: ${slides[current].querySelector('h2').textContent}`;
  console.log(`🖼 ${announcer.textContent}`);
  return true;
}
previousButton.addEventListener('click', () => show(current - 1));
nextButton.addEventListener('click', () => show(current + 1));
previousButton.disabled = true;

const KEYS = {
  ArrowRight: () => current + 1,
  PageDown: () => current + 1,
  ArrowLeft: () => current - 1,
  PageUp: () => current - 1,
  Home: () => 0,
  End: () => slides.length - 1,
};
deck.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key in KEYS) {
    event.preventDefault();
    show(KEYS[event.key]());
  } else if (event.key === 'f' || event.key === 'F') {
    event.preventDefault();
    toggleFullscreen();
  }
});

// ── Pantalla completa ────────────────────────────────────────────────────
async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await deck.requestFullscreen();
  } catch (error) {
    notice.textContent = `No se pudo cambiar a pantalla completa (${error.name}).`;
  }
}
fullscreenButton.addEventListener('click', toggleFullscreen);
document.addEventListener('fullscreenchange', () => {
  const on = document.fullscreenElement === deck;
  fullscreenButton.setAttribute('aria-pressed', String(on));
  if (on) deck.focus(); // para seguir con las flechas
  console.log(on ? '⛶ pantalla completa (Esc para salir)' : '⛶ fuera de pantalla completa');
});
if (!document.fullscreenEnabled) {
  fullscreenButton.disabled = true;
  notice.textContent = 'Aquí no hay pantalla completa (iframe sin permiso): ábrela con «▶ Run» o en el editor.';
}

// ── Pantalla siempre encendida ───────────────────────────────────────────
let wakeLock = null;
let keepAwake = false;
async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => {
      wakeLock = null;
      if (keepAwake) console.log('💤 el navegador soltó el bloqueo (pestaña oculta); lo pediré al volver');
    });
    console.log('🔆 la pantalla no se apagará mientras presentas');
  } catch (error) {
    keepAwake = false;
    awakeButton.setAttribute('aria-pressed', 'false');
    notice.textContent = `No se puede mantener la pantalla encendida aquí (${error.name}).`;
  }
}
awakeButton.addEventListener('click', async () => {
  keepAwake = !keepAwake;
  awakeButton.setAttribute('aria-pressed', String(keepAwake));
  if (keepAwake) await requestWakeLock();
  else await wakeLock?.release();
});
document.addEventListener('visibilitychange', () => {
  if (keepAwake && document.visibilityState === 'visible' && !wakeLock) requestWakeLock();
});
if (!('wakeLock' in navigator)) awakeButton.disabled = true;

// ── Comprobaciones al cargar ─────────────────────────────────────────────
function audit(label, actual, expected) {
  if (actual === expected) console.log('✅', label, '→', actual);
  else console.error('❌', label, '→', actual, '(esperaba', expected, ')');
}
const press = (key) => deck.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
audit('5 diapositivas y solo se ve la primera', `${slides.length} · ${slides.filter((slide) => !slide.hidden).length}`, '5 · 1');
press('ArrowRight');
audit('→ pasa a la 2.ª y lo anuncia', announcer.textContent, 'Diapositiva 2 de 5: Del cafetal al beneficio');
press('End');
audit('Fin → la última; «Siguiente» desactivado', `${counter.textContent} · ${nextButton.disabled}`, '5 / 5 · true');
press('Home');
audit('Inicio → la primera; «Anterior» desactivado', `${counter.textContent} · ${previousButton.disabled}`, '1 / 5 · true');
audit('cada diapositiva dice su posición', slides.map((slide) => slide.getAttribute('aria-label')).join(' | '), '1 de 5 | 2 de 5 | 3 de 5 | 4 de 5 | 5 de 5');
console.log(`fullscreenEnabled → ${document.fullscreenEnabled} · 'wakeLock' in navigator → ${'wakeLock' in navigator}`);
console.log('Listo: haz clic en la presentación y usa las flechas (F: pantalla completa); prueba «Pantalla siempre encendida» y cambia de pestaña');
```
