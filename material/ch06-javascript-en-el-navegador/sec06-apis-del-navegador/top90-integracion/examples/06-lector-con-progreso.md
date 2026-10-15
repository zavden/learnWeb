---
example_description: "Un lector con progreso: IntersectionObserver marca como leído cada párrafo que pasa por la franja de arriba del panel, «Continuar» salta al primero sin leer con un desplazamiento que respeta prefers-reduced-motion, el reloj de lectura se pausa con visibilitychange y el botón «Modo lectura» pone el artículo a pantalla completa"
example_tags: "javascript|intersectionobserver|progress|prefers-reduced-motion|visibilitychange|fullscreen"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Breve historia del chocolate</h1>
  <p class="toolbar">
    <button id="resume" type="button">↓ Continuar</button>
    <button id="focus-mode" type="button">⛶ Modo lectura</button>
  </p>
  <p class="meter">
    <label for="progress">Leído</label>
    <progress id="progress" max="8" value="0"></progress>
    <output id="progress-text">0 de 8</output> · <output id="reading-time">0 s</output> leyendo
  </p>
  <article id="article" class="article" tabindex="0" aria-label="Artículo">
    <p><strong>Del cacao al chocolate.</strong> El árbol del cacao crece en tierras cálidas y húmedas, a la sombra de árboles más altos.</p>
    <p><strong>Los olmecas.</strong> Hace más de tres mil años ya fermentaban y tostaban sus semillas en la costa del Golfo.</p>
    <p><strong>Una bebida sagrada.</strong> Mayas y mexicas lo tomaban amargo y espumoso, con chile y vainilla, en ceremonias y banquetes.</p>
    <p><strong>Moneda de cambio.</strong> Las semillas servían para pagar: un guajolote costaba unas cien.</p>
    <p><strong>El viaje a Europa.</strong> En el siglo XVI cruzó el Atlántico y allí empezó a endulzarse con azúcar y canela.</p>
    <p><strong>El molinillo.</strong> En Nueva España se popularizó el molinillo de madera para sacarle espuma.</p>
    <p><strong>Chocolate de metate.</strong> En Oaxaca aún se muele a mano con canela y almendras, en tablillas para disolver en agua o leche.</p>
    <p><strong>La tableta.</strong> En el siglo XIX, las prensas industriales permitieron el chocolate sólido que se come en barra.</p>
  </article>
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
  gap: 0.5rem;
  margin: 0 0 0.5rem;
}
.meter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 0.5rem;
}
.article {
  height: 12rem;
  overflow-y: auto;
  padding: 0 1rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #fdf6e3;
  line-height: 1.6;
}
.article p {
  margin: 0;
  padding: 0.6rem 0;
  border-bottom: 1px solid #e4e7eb;
}
.article p.read strong::after {
  content: " ✓";
  color: #15803d;
}
/* Modo lectura: el artículo a pantalla completa, con columna cómoda. */
.article:fullscreen {
  height: auto;
  padding: 2rem max(1rem, calc(50vw - 20rem));
  font-size: 1.25rem;
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
.article:focus-visible {
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
const article = document.querySelector('#article');
const paragraphs = [...article.querySelectorAll('p')];
const progress = document.querySelector('#progress');
const progressText = document.querySelector('#progress-text');
const readingTime = document.querySelector('#reading-time');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
const titleOf = (paragraph) => paragraph.querySelector('strong').textContent.replace(/\.$/, '');

// ── Progreso: un párrafo está leído cuando pasa por la franja de arriba ──
let read = 0;
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue; // la primera llamada trae a todos
    entry.target.classList.add('read');
    observer.unobserve(entry.target);
    read += 1;
    logLine(`📖 leído → ${read} de ${paragraphs.length} (${titleOf(entry.target)})`);
  }
  progress.value = read;
  progressText.textContent = `${read} de ${paragraphs.length}`;
  if (read === paragraphs.length) observer.disconnect();
}, { root: article, rootMargin: '0px 0px -80% 0px' }); // franja: el 20 % de arriba
for (const paragraph of paragraphs) observer.observe(paragraph);

// ── «Continuar»: al primer párrafo sin leer, con o sin animación ─────────
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
document.querySelector('#resume').addEventListener('click', () => {
  const next = paragraphs.find((paragraph) => !paragraph.classList.contains('read'));
  if (!next) {
    logLine('🎉 ya lo has leído todo');
    return;
  }
  const behavior = reduceMotion.matches ? 'instant' : 'smooth';
  article.scrollTo({ top: next.offsetTop - article.offsetTop, behavior });
  logLine(`↓ continuar → ${titleOf(next)} (behavior: '${behavior}')`);
});

// ── Reloj de lectura: solo cuenta mientras alguien puede ver la página ───
let seconds = 0;
let clock = null;
const MAX_SECONDS = 600; // la demo se para sola a los 10 minutos
function startClock() {
  clock ??= setInterval(() => {
    seconds += 1;
    readingTime.textContent = `${seconds} s`;
    if (seconds >= MAX_SECONDS) stopClock();
  }, 1000);
}
function stopClock() {
  clearInterval(clock);
  clock = null;
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    stopClock();
    logLine('⏸ hidden → pauso el reloj de lectura');
  } else if (seconds < MAX_SECONDS) {
    startClock();
    logLine('▶ visible → el reloj sigue');
  }
});
startClock();

// ── Modo lectura: pantalla completa, si este documento la permite ────────
if (!document.fullscreenEnabled) document.querySelector('#card-notice').hidden = false;
document.querySelector('#focus-mode').addEventListener('click', async () => {
  try {
    await article.requestFullscreen();
    article.focus(); // para desplazar con el teclado (Espacio, flechas)
  } catch (error) {
    logLine(`⚠️ ${error.name}: ${error.message}`);
  }
});
document.addEventListener('fullscreenchange', () => {
  logLine(document.fullscreenElement ? '⛶ modo lectura (Esc para salir)' : '⛶ fin del modo lectura');
});

logLine(`movimiento reducido → ${reduceMotion.matches} · visibilityState → ${document.visibilityState} · fullscreenEnabled → ${document.fullscreenEnabled}`);
logLine('Listo: baja poco a poco por el artículo; «Continuar» salta al primer párrafo sin leer; cambia de pestaña y vuelve');
```
