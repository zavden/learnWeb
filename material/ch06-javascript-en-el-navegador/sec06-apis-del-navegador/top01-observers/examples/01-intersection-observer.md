---
example_description: "Un IntersectionObserver con el panel como raíz avisa de qué salas entran y salen de la vista al desplazar, sin escuchar scroll; rootBounds es la caja del panel, y con la raíz implícita es null porque la vista previa es un iframe de otro origen"
example_tags: "javascript|intersectionobserver|observers|scroll|root|rootbounds"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Ruta por el museo</h1>
  <p class="toolbar">
    <button id="to-end" type="button">⤓ Ir al final</button>
    <button id="to-start" type="button">⤒ Volver al inicio</button>
    <span>A la vista: <output id="in-view">—</output></span>
  </p>
  <div id="rooms" class="panel" tabindex="0" role="region" aria-label="Salas del museo">
    <ol class="rooms">
      <li data-room="Sala 1">Sala 1 · Poblamiento de América</li>
      <li data-room="Sala 2">Sala 2 · Preclásico del Altiplano</li>
      <li data-room="Sala 3">Sala 3 · Teotihuacan</li>
      <li data-room="Sala 4">Sala 4 · Los toltecas</li>
      <li data-room="Sala 5">Sala 5 · Mexica</li>
      <li data-room="Sala 6">Sala 6 · Oaxaca</li>
      <li data-room="Sala 7">Sala 7 · Costa del Golfo</li>
      <li data-room="Sala 8">Sala 8 · Maya</li>
      <li data-room="Sala 9">Sala 9 · Occidente</li>
      <li data-room="Sala 10">Sala 10 · Norte</li>
      <li data-room="Sala 11">Sala 11 · Pueblos indígenas de hoy</li>
      <li data-room="Sala 12">Sala 12 · Jardín y salida</li>
    </ol>
  </div>
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
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.5rem;
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
.panel:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
/* La raíz del observer: 12rem (192 px) de alto, sin relleno. */
.panel {
  height: 12rem;
  overflow-y: auto;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
}
.rooms {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0 0.5rem;
  list-style: none;
}
.rooms li {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  height: 3.5rem;
  padding: 0 0.75rem;
  border-radius: 0.375rem;
  background: #e4e7eb;
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
const panel = document.querySelector('#rooms');
const rooms = [...panel.querySelectorAll('li')];
const inView = document.querySelector('#in-view');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

const visibleRooms = new Set();
let calls = 0;

// El callback recibe un array de entradas (IntersectionObserverEntry): una
// por cada sala cuyo estado ha cambiado desde la última vez.
const observer = new IntersectionObserver((entries) => {
  calls += 1;
  for (const entry of entries) {
    if (entry.isIntersecting) visibleRooms.add(entry.target);
    else visibleRooms.delete(entry.target);
    if (calls > 1) logLine(`${entry.isIntersecting ? 'entra' : 'sale'} → ${entry.target.dataset.room}`);
  }
  const numbers = rooms.filter((room) => visibleRooms.has(room)).map((room) => room.dataset.room.slice(5));
  inView.textContent = `salas ${numbers.join(', ')}`;
  if (calls === 1) {
    logLine(`primera llamada → ${entries.length} entradas · rootBounds: ${entries[0].rootBounds.height} px de alto (el panel)`);
    checkImplicitRoot();
  }
  logLine(`a la vista → ${numbers.join(', ')}`);
}, { root: panel }); // la raíz: el panel con scroll

for (const room of rooms) observer.observe(room);

// Sin root, la raíz es la ventana de la PESTAÑA. La vista previa es un
// iframe de otro origen: el navegador no le revela ese rectángulo.
function checkImplicitRoot() {
  const implicitObserver = new IntersectionObserver((entries) => {
    logLine(`raíz implícita → rootBounds: ${entries[0].rootBounds} (la vista previa es un iframe de otro origen)`);
    implicitObserver.disconnect();
  });
  implicitObserver.observe(rooms[0]);
}

// Saltos instantáneos, para que el resultado se pueda repetir.
document.querySelector('#to-end').addEventListener('click', () => {
  panel.scrollTop = panel.scrollHeight;
});
document.querySelector('#to-start').addEventListener('click', () => {
  panel.scrollTop = 0;
});
logLine('Listo: desplaza el panel o usa «Ir al final»');

// Ni un listener de scroll ni una medida: el navegador calcula las
// intersecciones al preparar cada frame y llama al callback solo si algo cambió.
```
