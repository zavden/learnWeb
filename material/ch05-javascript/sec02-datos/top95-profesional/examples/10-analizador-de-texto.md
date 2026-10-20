---
example_description: "Analizador de texto en vivo: unidades UTF-16, code points y grafemas, palabras y frases con Intl.Segmenter, palabras frecuentes con Map y búsqueda sin tildes"
example_tags: "javascript|profesional|strings|unicode|intl|interfaz"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>Analizador de texto</h1>
  <p class="intro">Pega cualquier texto: el análisis se actualiza mientras escribes. Prueba con emojis, banderas y palabras con tilde.</p>

  <section class="card editor" aria-labelledby="text-label">
    <label id="text-label" for="text">Texto</label>
    <textarea id="text" rows="9" spellcheck="false" aria-describedby="limit">Primer día en Kioto 🇯🇵. Paseamos por Gion al atardecer y tomamos un cafe&#x301; minúsculo en una casa de té de 1912. ¡Qué tranquilidad!

Mañana, templo Kiyomizu-dera a primera hora, antes de que lleguen los grupos. Mi hija 👩‍👧 quiere ver ciervos en Nara; el templo puede esperar… o no.</textarea>
    <p id="limit" class="limit" data-state="ok">—</p>
  </section>

  <section class="card" aria-labelledby="stats-title">
    <h2 id="stats-title">Recuentos</h2>
    <dl class="stats">
      <div><dt>Grafemas (lo que ves)</dt><dd id="stat-graphemes">—</dd></div>
      <div><dt>Code points</dt><dd id="stat-code-points">—</dd></div>
      <div><dt>Unidades UTF-16 (<code>length</code>)</dt><dd id="stat-length">—</dd></div>
      <div><dt>Palabras</dt><dd id="stat-words">—</dd></div>
      <div><dt>Frases</dt><dd id="stat-sentences">—</dd></div>
      <div><dt>Párrafos</dt><dd id="stat-paragraphs">—</dd></div>
      <div><dt>Lectura</dt><dd id="stat-reading">—</dd></div>
      <div><dt>Palabra más larga</dt><dd id="stat-longest">—</dd></div>
    </dl>
  </section>

  <section class="card" aria-labelledby="top-title">
    <h2 id="top-title">Palabras más frecuentes</h2>
    <p class="hint">Sin artículos, preposiciones ni otras palabras vacías.</p>
    <ol id="top-words" class="top-words"></ol>
  </section>

  <section class="card" aria-labelledby="search-title">
    <h2 id="search-title">Buscar sin tildes ni mayúsculas</h2>
    <label for="search">Buscar</label>
    <input id="search" type="search" value="cafe" autocomplete="off" aria-describedby="search-result">
    <p id="search-result" class="search-result" aria-live="polite">—</p>
  </section>
</main>
```

# CSS

```css
:root {
  --text: #1b1f24;
  --muted: #545b66;
  --page: #f4f6f8;
  --surface: #ffffff;
  --border: #c4c9d0;
  --field-border: #8a929c;
  --accent: #0b5cad;
  --accent-bg: #e7f0fa;
  --ok: #1a6b3c;
  --warn: #7a4b00;
  --danger: #9b1c1c;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  line-height: 1.5;
  color: var(--text);
  background: var(--page);
}

.app {
  max-width: 64rem;
  margin: 0 auto;
  padding: 1.5rem 1rem 2.5rem;
  display: grid;
  gap: 1.25rem;
}

h1 {
  margin: 0;
  font-size: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);
}

h2 {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
}

.intro,
.hint {
  margin: 0;
  color: var(--muted);
}

.hint {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.25rem;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.35rem;
}

textarea,
input {
  width: 100%;
  font: inherit;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--field-border);
  border-radius: 0.5rem;
  color: var(--text);
  background: var(--surface);
}

textarea {
  resize: vertical;
  line-height: 1.6;
}

:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

.limit {
  margin: 0.5rem 0 0;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.limit[data-state='ok'] {
  color: var(--ok);
}

.limit[data-state='near'] {
  color: var(--warn);
}

.limit[data-state='over'] {
  color: var(--danger);
}

.stats {
  margin: 0;
  display: grid;
  gap: 0.4rem;
}

.stats div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--accent-bg);
  padding-bottom: 0.3rem;
}

.stats dt {
  color: var(--muted);
}

.stats dd {
  margin: 0;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.top-words {
  margin: 0;
  padding-left: 1.5rem;
  columns: 2;
}

.top-words li {
  break-inside: avoid;
}

.count {
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.search-result {
  margin: 0.6rem 0 0;
}

@media (width >= 48rem) {
  .app {
    grid-template-columns: 1fr 1fr;
  }

  h1,
  .intro,
  .editor {
    grid-column: 1 / -1;
  }
}
```

# JavaScript

```javascript
// ANALIZADOR DE TEXTO.
//
// Tres formas de contar «caracteres», y cuándo usar cada una:
// - text.length: unidades UTF-16. Es lo que mide JavaScript, no lo que ve una persona.
// - [...text].length: code points (un emoji simple cuenta 1; una bandera, 2).
// - Intl.Segmenter con granularity 'grapheme': grafemas, lo que una persona ve.
// Los límites que se muestran a una persona (una bio, un mensaje) se cuentan en grafemas.
//
// El texto se normaliza (NFC) antes de analizarlo: el ejemplo trae un «café» escrito
// con la tilde como carácter aparte (NFD) para que veas la diferencia.
//
// Alcance: function y las flechas, en «Funciones y ámbito»; querySelector, textContent,
// createElement, append y addEventListener, en el capítulo 6 (el DOM y los eventos).

const LIMIT = 280; // límite de un mensaje corto, en grafemas
const WORDS_PER_MINUTE = 200;
const STOP_WORDS = new Set([
  'a', 'al', 'antes', 'de', 'del', 'el', 'en', 'la', 'las', 'lo', 'los', 'mi', 'o', 'para',
  'por', 'que', 'qué', 'se', 'su', 'un', 'una', 'y', 'ya', 'no',
]);

const graphemeSegmenter = new Intl.Segmenter('es', { granularity: 'grapheme' });
const wordSegmenter = new Intl.Segmenter('es', { granularity: 'word' });
const sentenceSegmenter = new Intl.Segmenter('es', { granularity: 'sentence' });
const collator = new Intl.Collator('es');

// ── Lógica (no toca el DOM) ─────────────────────────────────────────────

function wordsOf(text) {
  const words = [];
  for (const part of wordSegmenter.segment(text)) {
    if (part.isWordLike) words.push(part.segment);
  }
  return words;
}

function countSentences(text) {
  let count = 0;
  for (const part of sentenceSegmenter.segment(text)) {
    if (part.segment.trim() !== '') count++;
  }
  return count;
}

function countGraphemes(text) {
  return [...graphemeSegmenter.segment(text)].length;
}

function topWords(words, limit) {
  const counts = new Map(); // un objeto fallaría con palabras como «constructor»
  for (const word of words) {
    const key = word.toLocaleLowerCase('es');
    // Fuera palabras vacías, letras sueltas y números (1912 no es una «palabra frecuente»).
    if (STOP_WORDS.has(key) || key.length < 2 || !Number.isNaN(Number(key))) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts]
    .toSorted(([wordA, countA], [wordB, countB]) => countB - countA || collator.compare(wordA, wordB))
    .slice(0, limit);
}

function analyze(rawText) {
  const text = rawText.normalize(); // NFC: «e + ́» pasa a ser «é»
  const words = wordsOf(text);
  // La palabra más larga, medida en grafemas (no en length).
  let longest = '';
  for (const word of words) {
    if (countGraphemes(word) > countGraphemes(longest)) longest = word;
  }
  return {
    rawLength: rawText.length,
    length: text.length,
    codePoints: [...text].length,
    graphemes: countGraphemes(text),
    words: words.length,
    sentences: countSentences(text),
    paragraphs: text.split('\n').filter((line) => line.trim() !== '').length,
    readingMinutes: words.length / WORDS_PER_MINUTE,
    longest,
    top: topWords(words, 8),
  };
}

// Clave de búsqueda: NFD, sin marcas combinables y en minúsculas. Solo para comparar.
function searchKey(text) {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('es'); // \p{M}: regex
}

function countMatches(text, query) {
  const haystack = searchKey(text);
  const needle = searchKey(query.trim());
  if (needle === '') return 0;
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count++;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

// ── Formatos ────────────────────────────────────────────────────────────

const integer = new Intl.NumberFormat('es-ES');
const minutes = new Intl.NumberFormat('es-ES', { style: 'unit', unit: 'minute', unitDisplay: 'long', maximumFractionDigits: 0 });
const plural = new Intl.PluralRules('es-ES');
const MATCH_WORDS = { one: 'coincidencia', other: 'coincidencias' };

// ── Interfaz ────────────────────────────────────────────────────────────

const textInput = document.querySelector('#text');
const searchInput = document.querySelector('#search');
const limitText = document.querySelector('#limit');
const topList = document.querySelector('#top-words');
const searchResult = document.querySelector('#search-result');

function show(id, value) {
  document.querySelector(id).textContent = value;
}

function render() {
  const result = analyze(textInput.value);
  show('#stat-graphemes', integer.format(result.graphemes));
  show('#stat-code-points', integer.format(result.codePoints));
  const normalizeNote = result.rawLength === result.length ? '' : ` (${integer.format(result.rawLength)} antes de normalizar)`;
  show('#stat-length', `${integer.format(result.length)}${normalizeNote}`);
  show('#stat-words', integer.format(result.words));
  show('#stat-sentences', integer.format(result.sentences));
  show('#stat-paragraphs', integer.format(result.paragraphs));
  show('#stat-reading', result.readingMinutes < 1 ? 'menos de 1 minuto' : minutes.format(result.readingMinutes));
  show('#stat-longest', result.longest === '' ? '—' : result.longest);

  const left = LIMIT - result.graphemes;
  const lengthLeft = LIMIT - result.length;
  limitText.setAttribute('data-state', left < 0 ? 'over' : left <= 20 ? 'near' : 'ok');
  const status = left < 0
    ? `Te pasas ${integer.format(-left)} del límite de ${LIMIT} grafemas.`
    : `Quedan ${integer.format(left)} de ${LIMIT} grafemas.`;
  const lengthNote = lengthLeft < 0
    ? ` Contando con length, te pasarías ${integer.format(-lengthLeft)}.`
    : ` Contando con length, quedarían ${integer.format(lengthLeft)}.`;
  limitText.textContent = status + lengthNote;

  topList.textContent = '';
  for (const [word, count] of result.top) {
    const item = document.createElement('li');
    const amount = document.createElement('span');
    amount.className = 'count';
    amount.textContent = ` × ${count}`;
    item.append(word, amount);
    topList.append(item);
  }
  renderSearch();
}

function renderSearch() {
  const query = searchInput.value;
  if (query.trim() === '') {
    searchResult.textContent = 'Escribe algo para buscar.';
    return;
  }
  const count = countMatches(textInput.value, query);
  searchResult.textContent = `«${query.trim()}»: ${count} ${MATCH_WORDS[plural.select(count)]}`;
}

textInput.addEventListener('input', render);
searchInput.addEventListener('input', renderSearch);
render();

const initial = analyze(textInput.value);
console.log('length →', initial.rawLength, '| normalizado →', initial.length, '| code points →', initial.codePoints, '| grafemas →', initial.graphemes);
console.log('frecuentes →', initial.top);
```
