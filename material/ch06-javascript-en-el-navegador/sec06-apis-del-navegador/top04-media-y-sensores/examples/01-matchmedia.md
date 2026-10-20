---
example_description: "matchMedia(consulta) evalúa una media query desde JavaScript, con la misma sintaxis que @media: devuelve un MediaQueryList con matches y media, y su evento change avisa cuando el resultado cambia (al cambiar el ancho de la vista previa o el tema del sistema)"
example_tags: "javascript|matchmedia|media-queries|mediaquerylist|prefers-color-scheme|responsive"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Lo que ve el navegador ahora</h1>
  <table class="queries">
    <thead><tr><th scope="col">Consulta</th><th scope="col">Qué pregunta</th><th scope="col">¿Coincide?</th></tr></thead>
    <tbody id="rows"></tbody>
  </table>
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
.queries {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  font-size: 0.85rem;
}
.queries th,
.queries td {
  padding: 0.3rem 0.5rem;
  border-bottom: 1px solid #e4e7eb;
  text-align: start;
}
.queries code {
  font-size: 0.8rem;
}
.yes {
  color: #15803d;
  font-weight: 700;
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
const QUERIES = [
  ['(prefers-color-scheme: dark)', 'tema oscuro del sistema'],
  ['(prefers-reduced-motion: reduce)', 'pide menos movimiento'],
  ['(hover: hover) and (pointer: fine)', 'ratón o trackpad'],
  ['(width >= 40rem)', 'vista previa de 640 px o más'],
];
const rows = document.querySelector('#rows');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
function showAnswer(cell, matches) {
  cell.textContent = matches ? 'sí' : 'no';
  cell.className = matches ? 'yes' : '';
}

for (const [query, meaning] of QUERIES) {
  const list = matchMedia(query); // un MediaQueryList: la consulta, viva
  const row = rows.insertRow();
  const code = document.createElement('code');
  code.textContent = list.media;
  row.insertCell().append(code);
  row.insertCell().textContent = meaning;
  const answer = row.insertCell();
  showAnswer(answer, list.matches);
  logLine(`${list.media} → ${list.matches}`);

  // change llega solo cuando el resultado CAMBIA, no en cada píxel de resize.
  list.addEventListener('change', (event) => {
    showAnswer(answer, event.matches);
    logLine(`change → ${event.media}: ${event.matches}`);
  });
}
logLine('Listo: cambia el ancho de la vista previa (cruza los 640 px) o el tema del sistema');

// El ancho de la vista previa es el de su iframe, no el de la ventana:
// en una tarjeta de 480 px, (width >= 40rem) es false.
```
