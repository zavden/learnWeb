---
example_description: "Solución: read y write encolan y piden frame, schedule pide como mucho uno (requestFrame inyectable para poder probarlo), y flush ejecuta todas las lecturas, después todas las escrituras (también las encoladas por las lecturas) y solo al final permite otro frame: un layout forzado en lugar de 30"
example_tags: "javascript|rendimiento|layout-thrashing|requestanimationframe|planificador|solucion"
example_stage: final-solution
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Postales del Caribe mexicano</h1>
  <div id="grid" class="grid"></div>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
.grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
.card { font-size: 0.7rem; }
.photo { block-size: 1rem; border-radius: 4px; background: linear-gradient(135deg, #0e7490, #1d4ed8); }
.caption { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
```

# JavaScript

```javascript
// El planificador por fases (lección «Render y frames»): en el próximo frame, primero todas
// las lecturas y después todas las escrituras, vengan de la tarjeta que vengan.
const frameTasks = {
  reads: [],
  writes: [],
  scheduled: false,
  requestFrame: (callback) => requestAnimationFrame(callback), // las comprobaciones lo sustituyen
  read(task) {
    this.reads.push(task);
    this.schedule();
  },
  write(task) {
    this.writes.push(task);
    this.schedule();
  },
  schedule() {
    if (this.scheduled) return;
    this.scheduled = true;
    this.requestFrame(() => this.flush());
  },
  flush() {
    for (const task of this.reads.splice(0)) task();  // las lecturas encolan escrituras…
    for (const task of this.writes.splice(0)) task(); // …que van todas después
    this.scheduled = false; // al final: lo encolado durante el flush no pide otro frame
  },
};

// ── Las tarjetas (no hace falta tocarlas) ──────────────────────────────
// readWidth y writeStyle llevan la cuenta de los layouts forzados y del orden.
const trace = { forcedReads: 0, pendingWrite: false, sequence: [] };
function readWidth(element) {
  if (trace.pendingWrite) { trace.forcedReads += 1; trace.pendingWrite = false; }
  trace.sequence.push('R');
  return element.offsetWidth;
}
function writeStyle(element, property, value) {
  element.style[property] = value;
  trace.pendingWrite = true;
  trace.sequence.push('W');
}
const places = ['Tulum', 'Bacalar', 'Holbox', 'Cozumel', 'Isla Mujeres', 'Mahahual'];
class Postcard {
  constructor(index) {
    this.element = Object.assign(document.createElement('article'), { className: 'card' });
    this.photo = Object.assign(document.createElement('div'), { className: 'photo' });
    this.caption = Object.assign(document.createElement('span'), { className: 'caption', textContent: `${places[index % places.length]} ${index + 1}` });
    this.element.append(this.photo, this.caption);
  }
  fit() { // la foto, a 3:4 de su ancho; el pie de foto, 4 px más estrecho
    frameTasks.read(() => {
      const width = readWidth(this.photo);
      frameTasks.write(() => {
        writeStyle(this.photo, 'blockSize', `${Math.round(width * 0.75)}px`);
        writeStyle(this.caption, 'maxWidth', `${width - 4}px`);
      });
    });
  }
}
const cards = Array.from({ length: 30 }, (_, i) => new Postcard(i));
document.querySelector('#grid').append(...cards.map((card) => card.element));

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
// Un frame simulado: así se comprueba al instante, también sin pantalla.
let frameCallback = null;
let frameRequests = 0;
frameTasks.requestFrame = (callback) => { frameRequests += 1; frameCallback = callback; };
function check(description, actual, expected) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) console.log('✅', description);
  else console.error('❌', description, '→ esperaba', JSON.stringify(expected), 'y obtuve', JSON.stringify(actual));
}
trace.pendingWrite = true; // las tarjetas se acaban de insertar
for (const card of cards) card.fit();
const tasksBeforeFrame = trace.sequence.length;
frameCallback?.();
check('nada se ejecuta antes del frame', tasksBeforeFrame, 0);
check('se pide un solo frame para las 30 tarjetas', frameRequests, 1);
check('lecturas que forzaron un layout: 1', trace.forcedReads, 1);
const firstWrite = trace.sequence.indexOf('W');
check('todas las lecturas van antes que todas las escrituras', firstWrite >= 0 && !trace.sequence.slice(firstWrite).includes('R'), true);
check('cada pie de foto mide 4 px menos que su foto', cards.every((card) => card.caption.style.maxWidth === `${card.photo.offsetWidth - 4}px`), true);
frameTasks.read(() => {});
check('después del frame se puede pedir otro', frameRequests, 2);
```
