---
example_description: "Un editor de artículos con estadísticas en vivo (palabras, palabras distintas, frases, párrafos, tiempo de lectura, frase más larga, palabras más repetidas) calculadas en los ratos libres: requestIdleCallback con timeout, un análisis que se reanuda donde lo dejó (los iteradores de Intl.Segmenter se guardan entre rato y rato), los resultados viejos se descartan al teclear y el DOM se escribe en requestAnimationFrame. Con un capítulo de 30 000 palabras, la casilla 🐛 calcula en cada tecla para comparar"
example_tags: "javascript|rendimiento|requestidlecallback|intl-segmenter|requestanimationframe|editor|longtask|profesional"
example_stage: professional
example_importance: important
console: true
loop_protect: false
---

# HTML

```html
<main class="editor">
  <h1>Revista de cocina · borrador</h1>
  <p class="field">
    <label for="draft">Artículo: «Los siete moles de Oaxaca»</label>
    <textarea id="draft" rows="10" spellcheck="false"></textarea>
  </p>
  <p class="options">
    <label><input id="bug-mode" type="checkbox" autocomplete="off"> Calcular en cada tecla 🐛 (sin ratos libres)</label>
    <button id="long-text" type="button">Pegar un capítulo largo (unas 120 000 palabras)</button>
  </p>
  <section class="stats" aria-labelledby="stats-title">
    <h2 id="stats-title">Estadísticas <span id="state" class="state" role="status">al día</span></h2>
    <progress id="progress" max="1" value="1" aria-label="Progreso del análisis"></progress>
    <dl id="stats"></dl>
  </section>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --accent: #1d4ed8; --paper: #ffffff; --page: #f8fafc; }
body { margin: 0; font-family: system-ui, sans-serif; color: var(--ink); background: var(--page); }
.editor { max-width: 40rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
h2 { font-size: 1rem; margin: 0 0 0.3rem; }
.field { display: grid; gap: 0.3rem; }
textarea { font: 0.95rem/1.5 Georgia, serif; padding: 0.5rem 0.6rem; border: 1px solid #64748b; border-radius: 0.4rem; background: var(--paper); color: var(--ink); resize: vertical; }
.options { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 1rem; font-size: 0.9rem; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: var(--paper); color: var(--ink); cursor: pointer; }
button:focus-visible, input:focus-visible, textarea:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.stats { padding: 0.75rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--paper); }
.state { margin-inline-start: 0.4rem; font-weight: normal; font-size: 0.85rem; color: var(--muted); }
progress { inline-size: 100%; block-size: 0.5rem; }
#stats { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 0.15rem 1rem; margin: 0.4rem 0 0; font-size: 0.9rem; font-variant-numeric: tabular-nums; }
#stats dt { color: var(--muted); }
#stats dd { margin: 0; font-weight: 600; overflow-wrap: anywhere; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--paper); font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
// EDITOR CON ESTADÍSTICAS EN LOS RATOS LIBRES
// - Escribir tiene que ser instantáneo: el manejador de input solo apunta que el texto cambió.
//   Las estadísticas se calculan con requestIdleCallback, en los huecos entre frames, y con
//   { timeout: 1000 } para que lleguen aunque la página nunca esté libre del todo.
// - El análisis es REANUDABLE: los iteradores de Intl.Segmenter (frases y luego palabras) se
//   guardan en el «trabajo» y cada rato libre avanza mientras timeRemaining() > 1 ms. Si llega
//   por timeout (timeRemaining() vale 0), hace 5 ms igualmente y vuelve a pedir turno.
// - Si se teclea a mitad, el trabajo viejo se descarta: nadie quiere estadísticas de un texto
//   que ya no existe. Y el DOM se escribe solo en requestAnimationFrame (lección «Render y
//   frames»: nada de DOM en el rato libre). Leer textarea.value no fuerza ningún layout.
// - Con la casilla 🐛, todo el análisis va dentro del manejador de input: con el capítulo largo,
//   cada tecla carga con decenas de milisegundos (la API Long Tasks las cuenta).
// - La consola da un informe cuando dejas de escribir (700 ms): estadísticas exactas y los
//   tiempos con ≈. (loop_protect: false porque se mide el análisis; todos los bucles terminan.)

const DRAFT = [
  'Oaxaca presume de siete moles, y cada familia defiende el suyo. El negro es el más famoso: lleva chiles chilhuacle tostados casi hasta quemarse, chocolate de metate, plátano macho y más de veinte ingredientes que se muelen por separado. El coloradito es más dulce y se sirve en las bodas. El amarillo, en cambio, no lleva chocolate y espesa con masa de maíz.',
  'En los mercados de la capital, las cocineras venden la pasta del mole lista para disolver en caldo. Basta con una cucharada grande por persona, un poco de caldo de pollo y paciencia: el mole se mueve sin parar hasta que brilla. Si se pega, amarga.',
  'El verde, el chichilo, el rojo y el manchamanteles completan los siete. ¿Cuál es el mejor? Depende de a quién le preguntes, y de la hora. Para empezar, prueba el mole coloradito con arroz blanco y tortillas recién hechas.',
].join('\n\n');
const POOL = [ // frases del capítulo largo
  'En la cocina de humo, el comal de barro se calienta desde antes del amanecer.',
  'Las tortillas de maíz nativo se tuestan hasta que se inflan y huelen a tierra mojada.',
  'Doña Rosa muele el cacao en metate con canela y azúcar morena, sin ninguna prisa.',
  'Los chiles se desvenan, se tuestan y se remojan en agua caliente durante media hora.',
  'Cada mercado tiene su puesto de tlayudas, y cada puesto, su asiento de manteca.',
  'El chapulín se dora con ajo, limón y sal de gusano, y se come en taco.',
  'Las hojas de plátano envuelven los tamales de mole negro para la fiesta del pueblo.',
  'El quesillo se estira en tiras largas y se enrolla como una madeja de hilo blanco.',
  'Al mediodía, el caldo de piedra hierve en una jícara con una piedra ardiente del río.',
  'Los mezcaleros cuecen el agave en hornos de tierra durante tres días con sus noches.',
  'En diciembre, los buñuelos se bañan con miel de piloncillo y se rompen los platos.',
  'La receta pasa de abuela a nieta, y nadie la escribe completa en ningún cuaderno.',
];
const STOPWORDS = new Set(['para', 'como', 'pero', 'este', 'esta', 'esto', 'estos', 'estas', 'porque', 'entre', 'cuando', 'sobre', 'también', 'hasta', 'donde', 'desde', 'todo', 'todos', 'toda', 'todas', 'durante', 'otro', 'otra', 'otros', 'otras', 'ante', 'ellos', 'ellas', 'antes', 'después', 'unos', 'unas', 'algo', 'cada', 'tanto', 'mucho', 'muchos', 'nada', 'poco', 'cual', 'cuál', 'quien', 'quién', 'quienes', 'ella', 'estar', 'tiene', 'tienen', 'hace']);
const IDLE_TIMEOUT_MS = 1000;
const REPORT_AFTER_MS = 700;

const textarea = document.querySelector('#draft');
const bugMode = document.querySelector('#bug-mode');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// ── El análisis: un «trabajo» que avanza a trozos ──
const sentenceSegmenter = new Intl.Segmenter('es', { granularity: 'sentence' });
const wordSegmenter = new Intl.Segmenter('es', { granularity: 'word' });
const HAS_LETTER = /\p{L}/u;
const BLANK_LINE_AT_END = /\n[^\S\n]*\n\s*$/;
function createJob(text, version) {
  return {
    text, version, phase: 'frases', iterator: sentenceSegmenter.segment(text)[Symbol.iterator](), position: 0,
    sentences: 0, paragraphs: 0, blankBefore: true, sentenceEnds: [],
    words: 0, distinct: new Set(), frequencies: new Map(), sentenceIndex: 0, wordsInSentence: 0, longest: 0,
    slices: 0, timeouts: 0, workMs: 0,
  };
}
// Avanza mientras keepGoing() diga que sí (se pregunta cada 32 trozos); true cuando termina.
function advance(job, keepGoing) {
  for (let steps = 1; ; steps++) {
    if ((steps & 31) === 0 && !keepGoing()) return false;
    const { value, done } = job.iterator.next();
    if (done && job.phase === 'frases') { // segunda fase: las palabras, sabiendo dónde acaba cada frase
      job.phase = 'palabras';
      job.iterator = wordSegmenter.segment(job.text)[Symbol.iterator]();
      continue;
    }
    if (done) {
      job.longest = Math.max(job.longest, job.wordsInSentence);
      return true;
    }
    job.position = value.index;
    if (job.phase === 'frases') {
      if (HAS_LETTER.test(value.segment)) {
        job.sentences += 1;
        if (job.blankBefore) job.paragraphs += 1; // una línea en blanco antes: párrafo nuevo
        job.blankBefore = BLANK_LINE_AT_END.test(value.segment);
        job.sentenceEnds.push(value.index + value.segment.length);
      } else if (value.segment.includes('\n')) {
        job.blankBefore = true;
      }
    } else if (value.isWordLike) {
      while (job.sentenceIndex < job.sentenceEnds.length && value.index >= job.sentenceEnds[job.sentenceIndex]) {
        job.longest = Math.max(job.longest, job.wordsInSentence);
        job.wordsInSentence = 0;
        job.sentenceIndex += 1;
      }
      job.wordsInSentence += 1;
      job.words += 1;
      const word = value.segment.toLocaleLowerCase('es');
      job.distinct.add(word);
      if (word.length >= 4 && !STOPWORDS.has(word)) job.frequencies.set(word, (job.frequencies.get(word) ?? 0) + 1);
    }
  }
}
const progressOf = (job) => (job.phase === 'frases' ? 0.3 : 0.3 + 0.7 * (job.position / Math.max(1, job.text.length)));
function summarize(job, mode) {
  const top = [...job.frequencies].filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es')).slice(0, 5);
  return {
    mode, version: job.version, words: job.words, distinct: job.distinct.size, sentences: job.sentences,
    paragraphs: job.paragraphs, minutes: Math.max(1, Math.round(job.words / 200)), longest: job.longest, top,
    slices: job.slices, timeouts: job.timeouts, workMs: job.workMs,
  };
}

// ── Pintar: solo en requestAnimationFrame, como mucho una vez por frame ──
const statsList = document.querySelector('#stats');
const FIELDS = { words: 'Palabras', distinct: 'Palabras distintas', sentences: 'Frases', paragraphs: 'Párrafos', minutes: 'Lectura', longest: 'Frase más larga', top: 'Más repetidas' };
const fieldCells = Object.fromEntries(Object.entries(FIELDS).map(([key, label]) => {
  const cell = Object.assign(document.createElement('dd'), { textContent: '—' });
  statsList.append(Object.assign(document.createElement('dt'), { textContent: label }), cell);
  return [key, cell];
}));
const topText = (top) => top.map(([word, count]) => `${word} ${count}`).join(' · ') || 'ninguna';
let view = { result: null, progress: 1, analyzing: false };
let paintPending = false;
function paintSoon(changes) {
  Object.assign(view, changes);
  if (paintPending) return;
  paintPending = true;
  requestAnimationFrame(() => {
    paintPending = false;
    document.querySelector('#progress').value = view.progress;
    document.querySelector('#state').textContent = view.analyzing ? 'analizando…' : 'al día';
    const { result } = view;
    if (!result) return;
    fieldCells.words.textContent = result.words.toLocaleString('es-MX');
    fieldCells.distinct.textContent = result.distinct.toLocaleString('es-MX');
    fieldCells.sentences.textContent = result.sentences.toLocaleString('es-MX');
    fieldCells.paragraphs.textContent = result.paragraphs.toLocaleString('es-MX');
    fieldCells.minutes.textContent = `${result.minutes} min`;
    fieldCells.longest.textContent = `${result.longest} palabras`;
    fieldCells.top.textContent = topText(result.top);
  });
}

// ── Cuándo analizar: en los ratos libres, o (🐛) en cada tecla ──
let version = 0;
let job = null;
let idlePending = false;
let latest = null;
let lastInputAt = -Infinity;
let longTasks = 0;
if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
  new PerformanceObserver((list) => { longTasks += list.getEntries().length; }).observe({ type: 'longtask' });
}
function runIdle(deadline) {
  idlePending = false;
  if (!job || job.version !== version) job = createJob(textarea.value, version); // el texto de AHORA
  job.slices += 1;
  if (deadline.didTimeout) job.timeouts += 1;
  const start = performance.now();
  const forcedEnd = start + 5;
  const finished = advance(job, () => deadline.timeRemaining() > 1 || (deadline.didTimeout && performance.now() < forcedEnd));
  job.workMs += performance.now() - start;
  if (!finished) {
    paintSoon({ progress: progressOf(job), analyzing: true });
    scheduleIdle();
    return;
  }
  latest = summarize(job, '✅ en ratos libres');
  job = null;
  paintSoon({ result: latest, progress: 1, analyzing: false });
  maybeReport();
}
function scheduleIdle() {
  if (idlePending) return;
  idlePending = true;
  requestIdleCallback(runIdle, { timeout: IDLE_TIMEOUT_MS });
}
function onTextChanged({ typed }) {
  version += 1;
  if (typed) lastInputAt = performance.now();
  if (bugMode.checked) { // 🐛 todo aquí y ahora, dentro del manejador
    const now = createJob(textarea.value, version);
    const start = performance.now();
    advance(now, () => true);
    now.workMs = performance.now() - start;
    latest = summarize(now, '🐛 en cada tecla');
    paintSoon({ result: latest, progress: 1, analyzing: false });
  } else {
    job = null; // el trabajo a medias ya no sirve
    paintSoon({ analyzing: true, progress: 0 });
    scheduleIdle();
  }
  maybeReport();
}

// ── El informe de la consola: cuando dejas de escribir ──
let reportedVersion = 0;
let reportTimer = 0;
function maybeReport() {
  clearTimeout(reportTimer);
  const wait = lastInputAt + REPORT_AFTER_MS - performance.now();
  if (wait > 0) {
    reportTimer = setTimeout(maybeReport, wait);
    return;
  }
  if (!latest || latest.version !== version || reportedVersion === version) return; // aún analizando: informará al terminar
  reportedVersion = version;
  logLine(`📊 ${latest.words} palabras · ${latest.distinct} distintas · ${latest.sentences} frases · ${latest.paragraphs} párrafos · lectura: ${latest.minutes} min · frase más larga: ${latest.longest} palabras`);
  logLine(`🔁 más repetidas: ${topText(latest.top)}`);
  const slices = latest.mode.startsWith('✅') ? ` en ≈ ${latest.slices} rato(s) libre(s), ≈ ${latest.timeouts} por timeout` : ' (la última tecla)';
  logLine(`${latest.mode}: análisis ≈ ${latest.workMs.toFixed(1)} ms${slices} · tareas largas desde el informe anterior: ≈ ${longTasks}`);
  longTasks = 0;
}

textarea.addEventListener('input', () => onTextChanged({ typed: true }));
bugMode.addEventListener('change', () => onTextChanged({ typed: false }));
document.querySelector('#long-text').addEventListener('click', () => {
  const paragraphs = Array.from({ length: 1320 }, (_, p) => Array.from({ length: 6 }, (_, k) => POOL[(p * 5 + k) % POOL.length]).join(' '));
  textarea.value = paragraphs.join('\n\n');
  onTextChanged({ typed: false });
});
textarea.value = DRAFT;
onTextChanged({ typed: false });
console.log('Listo: escribe al final del artículo « Sirve el mole caliente.» y espera; luego pega el capítulo largo y prueba a escribir con y sin 🐛');
```
