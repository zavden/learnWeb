---
example_description: "Observar tareas largas y frames largos con PerformanceObserver: un clic que trabaja 120 ms produce una entrada longtask (name: self) y una long-animation-frame con tiempo de bloqueo; un callback de requestAnimationFrame que bloquea 100 ms produce también un frame largo"
example_tags: "javascript|rendimiento|long-tasks|long-animation-frame|loaf|performanceobserver"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Tareas largas y frames largos</h1>
  <p class="actions">
    <button id="task" type="button">Tarea de 120 ms (clic)</button>
    <button id="frame" type="button">Frame de 100 ms (rAF)</button>
  </p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
.actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; cursor: pointer; }
button:disabled { cursor: progress; }
button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
function busyFor(ms) {
  const end = performance.now() + ms;
  while (performance.now() < end) {} // simula un cálculo que no cede el turno
}

// Un solo observador para los dos tipos (una llamada a observe por tipo).
const seen = [];
const observer = new PerformanceObserver((list) => seen.push(...list.getEntries()));
for (const type of ['longtask', 'long-animation-frame']) {
  if (PerformanceObserver.supportedEntryTypes.includes(type)) observer.observe({ type });
}

// Tras cada botón, espera a que lleguen las entradas y resume las que terminaron después del clic.
function summarize(title, pressedAt) {
  setTimeout(() => {
    const recent = seen.filter((entry) => entry.startTime + entry.duration >= pressedAt);
    const tasks = recent.filter((entry) => entry.entryType === 'longtask');
    const frames = recent.filter((entry) => entry.entryType === 'long-animation-frame');
    logLine(`— ${title} —`);
    logLine(`longtask: ${tasks.length}${tasks.length ? ` · name: ${tasks[0].name} · ¿más de 50 ms? ${tasks[0].duration > 50}` : ''}`);
    logLine(`long-animation-frame: ${frames.length}${frames.length
      ? ` · ¿más de 50 ms? ${frames[0].duration > 50} · ¿con tiempo de bloqueo? ${frames[0].blockingDuration > 0}`
      : ''}`);
    for (const button of buttons) button.disabled = false;
  }, 700);
}

const buttons = document.querySelectorAll('button');
document.querySelector('#task').addEventListener('click', () => {
  for (const button of buttons) button.disabled = true;
  const pressedAt = performance.now();
  busyFor(120); // 🐛 el clic no deja responder ni pintar durante 120 ms
  summarize('tarea de 120 ms (clic)', pressedAt);
});
document.querySelector('#frame').addEventListener('click', () => {
  for (const button of buttons) button.disabled = true;
  const pressedAt = performance.now();
  requestAnimationFrame(() => busyFor(100)); // 🐛 el bloqueo cae justo antes de pintar
  summarize('frame de 100 ms (rAF)', pressedAt);
});
console.log('Listo: pulsa «Tarea de 120 ms (clic)» y, cuando vuelva a estar activo, «Frame de 100 ms (rAF)»');

// Una entrada longtask dice CUÁNDO y CUÁNTO (y name: 'self', este documento); una
// long-animation-frame dice además cuánto bloqueó el frame (blockingDuration) y, en una página
// normal, QUÉ scripts lo causaron (scripts[]). En la vista previa de LearnWeb esa lista llega
// vacía (comprobado en Chrome 155), así que el ejemplo no la imprime.
```
