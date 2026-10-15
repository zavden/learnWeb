---
example_description: "Ejercicio: el panel de chat tiene tres fugas: un listener de resize en window que nadie quita, un setInterval que sigue tras cerrar y un Map con los mensajes de cada sala que nunca se vacía. Ciérralas en open/close; la auditoría abre y cierra el panel cinco veces y cuenta listeners, temporizadores y salas guardadas"
example_tags: "javascript|memoria|fugas|abortcontroller|setinterval|map|ejercicio"
exercise: true
exercise_title: "Tapa las fugas del panel de chat"
exercise_instructions: "Lee ChatPanel: open() registra un listener de resize en window, arranca un setInterval y guarda los mensajes en messagesByRoom; close() solo oculta el panel || Crea un AbortController en open() y pasa { signal } al addEventListener; en close(), llama a abort() || Guarda el id del setInterval en el panel y páralo con clearInterval en close() || En close(), borra la sala de messagesByRoom || Ejecuta hasta que las cinco comprobaciones salgan ✅"
exercise_hints: "this.controller = new AbortController(); y después window.addEventListener('resize', …, { signal: this.controller.signal }) || this.typingTimer = setInterval(…) en open(); clearInterval(this.typingTimer) en close() || messagesByRoom.delete(this.room) antes de olvidar la sala"
exercise_solution_example: 09-ej-tapa-la-fuga-solucion.md
example_stage: exercise
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Atención al cliente</h1>
  <section id="panel" class="panel" hidden aria-labelledby="panel-title">
    <h2 id="panel-title">Sala</h2>
    <p id="typing" class="typing"></p>
    <ul id="messages" class="messages"></ul>
  </section>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
h2 { font-size: 1rem; margin: 0; }
.panel { display: grid; gap: 0.3rem; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; }
.panel[hidden] { display: none; }
.typing { margin: 0; color: #475569; font-size: 0.85rem; }
.messages { margin: 0; padding-inline-start: 1.2rem; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
const panelElement = document.querySelector('#panel');
const messagesByRoom = new Map(); // sala → mensajes descargados (vive mientras viva la página)

class ChatPanel {
  room = null;
  resizes = 0;
  open(room) {
    this.room = room;
    messagesByRoom.set(room, Array.from({ length: 200 }, (_, i) => `${room} · mensaje ${i + 1}`));
    document.querySelector('#panel-title').textContent = `Sala de ${room}`;
    document.querySelector('#messages').replaceChildren(...messagesByRoom.get(room).slice(-3).map((text) => Object.assign(document.createElement('li'), { textContent: text })));
    // TODO: un AbortController para este panel abierto, y { signal } en este listener
    window.addEventListener('resize', () => { this.resizes += 1; });
    // TODO: guarda el id del temporizador para poder pararlo al cerrar
    setInterval(() => { document.querySelector('#typing').textContent = `alguien escribe en ${room}…`; }, 1000);
    panelElement.hidden = false;
  }
  close() {
    panelElement.hidden = true;
    // TODO: abort() del controlador, clearInterval del temporizador y borrar la sala de messagesByRoom
    this.room = null;
  }
}

// ── Auditoría (no hace falta tocarla) ───────────────────────────────────
// Lleva la cuenta de los listeners de window y de los temporizadores mientras se abre y se
// cierra el panel cinco veces; al terminar, deja window como estaba y para lo que quede vivo.
const live = { listeners: new Set(), intervals: new Set() };
const original = {
  add: window.addEventListener, remove: window.removeEventListener, every: window.setInterval, stop: window.clearInterval,
};
const keys = ['addEventListener', 'removeEventListener', 'setInterval', 'clearInterval'];
const descriptors = keys.map((key) => [key, Object.getOwnPropertyDescriptor(window, key)]);
window.addEventListener = function (type, listener, options) {
  const entry = { type, listener };
  live.listeners.add(entry);
  options?.signal?.addEventListener('abort', () => live.listeners.delete(entry));
  return original.add.call(window, type, listener, options);
};
window.removeEventListener = function (type, listener, options) {
  for (const entry of live.listeners) if (entry.type === type && entry.listener === listener) live.listeners.delete(entry);
  return original.remove.call(window, type, listener, options);
};
window.setInterval = function (callback, ms, ...args) {
  const id = original.every.call(window, callback, ms, ...args);
  live.intervals.add(id);
  return id;
};
window.clearInterval = function (id) {
  live.intervals.delete(id);
  return original.stop.call(window, id);
};

const logList = document.querySelector('#log');
function check(description, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) console.log('✅', description);
  else console.error('❌', description, '→ esperaba', JSON.stringify(expected), 'y obtuve', JSON.stringify(actual));
  logList.append(Object.assign(document.createElement('li'), { textContent: `${ok ? '✅' : '❌'} ${description}` }));
}
const chat = new ChatPanel();
for (const room of ['soporte', 'ventas', 'pagos', 'envíos', 'devoluciones']) {
  chat.open(room);
  chat.close();
}
check('listeners de window vivos tras 5 aperturas y cierres: 0', live.listeners.size, 0);
check('temporizadores vivos tras cerrar: 0', live.intervals.size, 0);
check('salas guardadas en messagesByRoom tras cerrar: 0', messagesByRoom.size, 0);
chat.open('facturas');
chat.resizes = 0;
window.dispatchEvent(new Event('resize'));
check('con el panel abierto, un resize ejecuta su manejador 1 vez', chat.resizes, 1);
check('el panel abierto enseña su sala', document.querySelector('#panel-title').textContent, 'Sala de facturas');
chat.close();
// Limpieza de la auditoría: para lo que el código haya dejado vivo y devuelve window a su estado.
for (const entry of live.listeners) original.remove.call(window, entry.type, entry.listener);
for (const id of live.intervals) original.stop.call(window, id);
for (const [key, descriptor] of descriptors) {
  if (descriptor) Object.defineProperty(window, key, descriptor);
  else delete window[key]; // era heredado (EventTarget.prototype): vuelve a verse el original
}
```
