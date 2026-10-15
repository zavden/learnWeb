---
example_description: "Un visor de registros de servidor que nunca frena el teclado: 40 000 líneas (o tu archivo) viven en un worker que las resume, las filtra por palabras o por /expresión regular/ y devuelve solo las 200 primeras ya troceadas para resaltarlas; la página espera a que dejes de teclear, descarta respuestas viejas y reinicia el worker si un patrón tarda más de 1 s"
example_tags: "javascript|workers|regex|resaltado|debounce|protocolo|timeout|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>Visor de registros</h1>
  <div class="filters">
    <label class="query">Filtrar (palabras o /expresión/)
      <input id="query" autocomplete="off" spellcheck="false" value="error 503">
    </label>
    <fieldset>
      <legend>Niveles</legend>
      <label><input type="checkbox" name="level" value="ERROR" checked> ERROR</label>
      <label><input type="checkbox" name="level" value="WARN" checked> WARN</label>
      <label><input type="checkbox" name="level" value="INFO" checked> INFO</label>
      <label><input id="slow" type="checkbox"> Solo lentas (≥ 500 ms)</label>
    </fieldset>
    <label>Abrir un registro tuyo <input id="file" type="file" accept=".log,.txt,text/plain"></label>
  </div>
  <p id="summary" class="summary"></p>
  <p id="count" class="count" role="status"></p>
  <div class="lines-wrap" tabindex="0" role="region" aria-labelledby="count">
    <ol id="lines" class="lines"></ol>
  </div>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.app { max-width: 48rem; margin: 0 auto; padding: 1rem; display: grid; gap: 0.6rem; }
h1 { margin: 0; font-size: 1.25rem; }
.filters { display: flex; flex-wrap: wrap; gap: 0.6rem 1rem; align-items: end; }
.query { flex: 1 1 16rem; }
label { display: grid; gap: 0.2rem; font-size: 0.9rem; }
fieldset { display: flex; flex-wrap: wrap; gap: 0.25rem 0.75rem; margin: 0; padding: 0.3rem 0.6rem; border: 1px solid var(--line); border-radius: 0.4rem; }
fieldset label { display: flex; gap: 0.3rem; align-items: center; }
legend { font-size: 0.8rem; color: var(--muted); }
input { font: inherit; color: var(--ink); }
#query { padding: 0.35rem 0.5rem; border: 1px solid var(--muted); border-radius: 0.4rem; font-family: Menlo, Consolas, monospace; font-size: 0.85rem; }
:is(input, .lines-wrap):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.summary, .count { margin: 0; font-size: 0.9rem; }
.count { font-weight: 600; }
.lines-wrap { max-block-size: 20rem; overflow: auto; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); }
.lines { margin: 0; padding: 0.4rem 0.6rem 0.4rem 4.2rem; font: 0.75rem/1.6 Menlo, Consolas, monospace; white-space: pre; }
.lines li::marker { color: var(--muted); }
.time { color: #475569; }
.level-INFO { color: #1d4ed8; }
.level-WARN, .status-4 { color: #92400e; font-weight: 600; }
.level-ERROR, .status-5, .duration.slow { color: #b91c1c; font-weight: 600; }
.status-2 { color: #166534; }
.method { color: #6d28d9; }
.ip { color: #0f766e; }
.log { margin: 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-size: 0.8rem; overflow-wrap: anywhere; }
```

# JavaScript

```javascript
// VISOR DE REGISTROS
//
// Decisiones de diseño:
// - Las líneas viven en el worker (05-logs/log-worker.js); funciones puras en
//   05-logs/logs.js. La página nunca recibe 40 000 líneas: solo el resumen, el total
//   de coincidencias y las 200 primeras, cada una con sus fichas [inicio, fin, tipo].
// - El resaltado se construye con nodos de texto y <span> (nunca innerHTML): un
//   registro puede contener cualquier cosa, también «<script>».
// - Mientras se teclea: 150 ms de espera (debounce), un id por consulta y solo se pinta
//   la respuesta de la última.
// - Una /expresión/ escrita por el usuario puede tardar muchísimo: si una consulta no
//   responde en 1 s, el worker se termina y se crea otro (que vuelve a cargar el archivo
//   abierto, si lo hay). Los errores de sintaxis vuelven como datos.
// - Abrir un archivo: el File viaja como referencia y el worker lo lee con file.text().
//
// Alcance: HTML, CSS, el capítulo de JavaScript (expresiones regulares incluidas),
// formularios y File del capítulo 6, y este módulo.
const KINDS = ['time', 'level', 'ip', 'status', 'method', 'duration']; // como en logs.js
const LIMIT = 200;
const $ = (selector) => document.querySelector(selector);
const fmt = (n) => n.toLocaleString('es-MX');
function report(text) {
  console.log(text);
  $('#log').append(Object.assign(document.createElement('li'), { textContent: text }));
}

let worker = null;
let openedFile = null;  // para recargarlo si hay que reiniciar el worker
let latestId = 0;
let watchdog = 0;       // el temporizador del plazo de la consulta en curso
let onResults = null;   // para esperar la primera búsqueda al cargar
let firstSummary = null;
const summaryReady = new Promise((resolve) => { firstSummary = resolve; });

function startWorker() {
  worker = new Worker('05-logs/log-worker.js', { type: 'module' });
  worker.onmessage = (event) => {
    const message = event.data;
    if (message.type === 'summary') return showSummary(message);
    if (message.id !== latestId) return; // la respuesta de una consulta vieja
    clearTimeout(watchdog);
    if (message.type === 'error') {
      $('#count').textContent = `⚠️ ${message.name}: ${message.message}`;
      report($('#count').textContent);
    } else {
      showResults(message);
    }
  };
  if (openedFile) worker.postMessage({ id: 0, type: 'load', file: openedFile });
}
startWorker();
addEventListener('pagehide', () => worker.terminate());

function showSummary({ source, lines, levels, p95, worstIp, worstCount }) {
  const text = `📜 ${source}: ${fmt(lines)} líneas · ERROR ${fmt(levels.ERROR)} · WARN ${fmt(levels.WARN)} · INFO ${fmt(levels.INFO)}${p95 === null ? '' : ` · p95 ${p95} ms`}`;
  $('#summary').textContent = text;
  report(text);
  if (worstIp) report(`🚨 la IP con más errores: ${worstIp} (${fmt(worstCount)})`);
  firstSummary();
}

function renderLine({ number, line, tokens }) {
  const item = document.createElement('li');
  item.value = number;
  let position = 0;
  for (let i = 0; i < tokens.length; i += 3) {
    const [start, end, kind] = [tokens[i], tokens[i + 1], tokens[i + 2]];
    item.append(line.slice(position, start));
    const text = line.slice(start, end);
    const span = Object.assign(document.createElement('span'), { textContent: text });
    span.className = KINDS[kind];
    if (KINDS[kind] === 'level') span.className = `level-${text}`;
    if (KINDS[kind] === 'status') span.className = `status-${text[0]}`;
    if (KINDS[kind] === 'duration' && Number.parseInt(text, 10) >= 500) span.classList.add('slow');
    item.append(span);
    position = end;
  }
  item.append(line.slice(position));
  return item;
}
function showResults({ query, total, shown }) {
  $('#lines').replaceChildren(...shown.map(renderLine));
  const text = `🔎 «${query}» → ${fmt(total)} líneas${total > shown.length ? ` (se muestran ${shown.length})` : ''}`;
  $('#count').textContent = text;
  report(text);
  onResults?.();
}

function search() {
  latestId += 1;
  const levels = [...document.querySelectorAll('input[name="level"]:checked')].map((box) => box.value);
  worker.postMessage({ id: latestId, type: 'query', query: $('#query').value, levels, slowOnly: $('#slow').checked, limit: LIMIT });
  clearTimeout(watchdog);
  watchdog = setTimeout(() => { // sin respuesta en 1 s: el worker está atascado
    worker.terminate();
    startWorker();
    $('#count').textContent = '⏱️ la búsqueda tardaba más de 1 s: worker reiniciado';
    report($('#count').textContent);
  }, 1000);
}
let typingTimer = 0;
$('#query').addEventListener('input', () => {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(search, 150);
});
document.querySelector('.filters fieldset').addEventListener('change', search);
$('#file').addEventListener('change', () => {
  const [file] = $('#file').files;
  if (!file) return;
  openedFile = file;
  worker.postMessage({ id: 0, type: 'load', file });
  search(); // la consulta va detrás del archivo: el worker los atiende en orden
});

await summaryReady;
await new Promise((resolve) => {
  onResults = resolve;
  search();
});
onResults = null;
report('Listo: escribe otro filtro (prueba «post carrito» o /pagos.*[2-9]\\d{3}ms/), marca «Solo lentas» o abre un registro tuyo');
```
