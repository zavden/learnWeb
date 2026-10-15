---
example_description: "Un gestor de subidas con interfaz: cada archivo se sube por partes con su barra de progreso, se puede pausar (una «compuerta» que es una promesa pendiente), reanudar y cancelar (AbortController); como mucho dos a la vez; la demostración automática reacciona a eventos de progreso, no a relojes"
example_tags: "javascript|profesional|async|subidas|abortcontroller|withresolvers|interfaz"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="uploads">
  <header>
    <h1>Fotos de la fonda</h1>
    <p class="intro">Como mucho dos subidas a la vez. Pausa, reanuda o cancela cada una.</p>
  </header>
  <ul id="upload-list" class="upload-list"></ul>
  <p id="announcer" class="announcer" role="status"></p>
  <button id="restart" type="button">Repetir la demostración</button>
</main>
```

# CSS

```css
:root {
  --text: #1f2933;
  --muted: #52606d;
  --page: #f5f7fa;
  --surface: #ffffff;
  --border: #c3cad3;
  --accent: #1d4ed8;
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
.uploads {
  max-width: 40rem;
  margin: 0 auto;
  padding: 1.25rem 1rem 2rem;
}
h1 {
  font-size: 1.3rem;
  margin: 0;
}
.intro,
.announcer {
  color: var(--muted);
}
.upload-list {
  list-style: none;
  margin: 1rem 0;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}
.upload {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.25rem 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--surface);
}
.upload progress {
  grid-column: 1 / -1;
  width: 100%;
  height: 0.75rem;
}
.upload .file {
  font-weight: 600;
  overflow-wrap: anywhere;
}
.upload .state {
  color: var(--muted);
}
.upload .controls {
  grid-column: 1 / -1;
  display: flex;
  gap: 0.5rem;
}
button {
  font: inherit;
  padding: 0.3rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  background: var(--surface);
  color: var(--text);
}
button:disabled {
  opacity: 0.55;
}
button:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// UN GESTOR DE SUBIDAS con pausa, reanudación y cancelación.
//
// Decisiones:
// - Cada subida envía 10 partes; entre parte y parte mira dos cosas: la
//   COMPUERTA de pausa (una promesa pendiente creada con Promise.withResolvers:
//   pausar la crea, reanudar la cumple) y la señal de cancelación.
// - Pausar no corta la parte en curso: termina y se detiene antes de la siguiente.
// - Cancelar usa un AbortController: corta incluso la espera de una parte.
// - Como mucho 2 subidas en marcha; una en pausa conserva su hueco.
// - La demostración no usa relojes: espera a eventos de progreso
//   (upload.reached(40)), así que el orden de la salida es siempre el mismo.
// - La interfaz se pinta con createElement y textContent (capítulo 6); un
//   párrafo con role="status" anuncia los cambios importantes.
//
// Alcance: módulos 1-7 (+ un mínimo de DOM y eventos, capítulo 6).

function wait(ms, { signal } = {}) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    const timerId = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timerId);
      reject(signal.reason);
    }, { once: true });
  });
}

class Upload {
  #controller = new AbortController();
  #gate = null; // compuerta de pausa: { promise, resolve } mientras está en pausa
  #watchers = []; // { percent, resolve } de quien espera un porcentaje
  #finished = Promise.withResolvers();
  state = 'en cola';
  percent = 0;

  constructor(file, { chunkMs, chunks = 10, onChange = () => {} }) {
    Object.assign(this, { file, chunkMs, chunks, onChange });
    this.done = this.#finished.promise;
  }

  #changed() {
    this.onChange(this);
    this.#watchers = this.#watchers.filter((watcher) => {
      if (this.percent < watcher.percent) return true;
      watcher.resolve(this);
      return false;
    });
  }
  reached(percent) {
    const { promise, resolve } = Promise.withResolvers();
    this.#watchers.push({ percent, resolve });
    this.#changed();
    return promise;
  }

  pause() {
    if (this.state !== 'subiendo') return;
    this.state = 'en pausa';
    this.#gate = Promise.withResolvers();
    this.#changed();
  }
  resume() {
    if (this.state !== 'en pausa') return;
    this.state = 'subiendo';
    this.#gate.resolve();
    this.#gate = null;
    this.#changed();
  }
  cancel() {
    if (['completada', 'cancelada', 'error'].includes(this.state)) return;
    this.state = 'cancelada';
    this.#controller.abort(new DOMException(`${this.file} cancelada`, 'AbortError'));
    this.#gate?.resolve(); // si estaba en pausa, que despierte y vea la cancelación
    this.#changed();
  }

  async run() {
    const { signal } = this.#controller;
    if (this.state === 'en cola') this.state = 'subiendo';
    this.#changed();
    try {
      for (let part = 1; part <= this.chunks; part++) {
        if (this.#gate) await this.#gate.promise; // ⏸️ en pausa: espera aquí
        signal.throwIfAborted();
        await wait(this.chunkMs, { signal }); // «envía» una parte
        this.percent = Math.round((part / this.chunks) * 100);
        this.#changed();
      }
      this.state = 'completada';
    } catch (error) {
      this.state = error.name === 'AbortError' ? 'cancelada' : 'error';
    }
    this.#changed();
    this.#finished.resolve(this.state);
  }
}

class UploadManager {
  #queue = [];
  #active = 0;
  maxActive = 0;
  constructor({ limit = 2, onChange }) {
    Object.assign(this, { limit, onChange });
  }
  add(file, options) {
    const upload = new Upload(file, { ...options, onChange: this.onChange });
    this.onChange(upload); // aparece en la lista, «en cola»
    this.#queue.push(upload);
    this.#next();
    return upload;
  }
  #next() {
    while (this.#active < this.limit && this.#queue.length > 0) {
      const upload = this.#queue.shift();
      if (upload.state === 'cancelada') continue;
      this.#active += 1;
      this.maxActive = Math.max(this.maxActive, this.#active);
      upload.run().finally(() => {
        this.#active -= 1;
        this.#next();
      });
    }
  }
}

// ── La interfaz (createElement, textContent, addEventListener: capítulo 6) ─
const list = document.querySelector('#upload-list');
const announcer = document.querySelector('#announcer');
const rows = new Map();

function createRow(upload) {
  const item = document.createElement('li');
  item.className = 'upload';
  const name = document.createElement('span');
  name.className = 'file';
  name.textContent = upload.file;
  const state = document.createElement('span');
  state.className = 'state';
  const bar = document.createElement('progress');
  bar.max = 100;
  bar.setAttribute('aria-label', `Progreso de ${upload.file}`);
  const controls = document.createElement('div');
  controls.className = 'controls';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.addEventListener('click', () => (upload.state === 'en pausa' ? upload.resume() : upload.pause()));
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.textContent = 'Cancelar';
  cancel.setAttribute('aria-label', `Cancelar ${upload.file}`);
  cancel.addEventListener('click', () => upload.cancel());
  controls.append(toggle, cancel);
  item.append(name, state, bar, controls);
  list.append(item);
  return { state, bar, toggle, cancel };
}

function render(upload) {
  if (!rows.has(upload)) rows.set(upload, createRow(upload));
  const row = rows.get(upload);
  const finished = ['completada', 'cancelada', 'error'].includes(upload.state);
  row.state.textContent = `${upload.state} · ${upload.percent} %`;
  row.bar.value = upload.percent;
  row.toggle.textContent = upload.state === 'en pausa' ? 'Reanudar' : 'Pausar';
  row.toggle.setAttribute('aria-label', `${row.toggle.textContent} ${upload.file}`);
  row.toggle.disabled = finished || upload.state === 'en cola';
  row.cancel.disabled = finished;
}

function say(text) {
  announcer.textContent = text;
  console.log(text);
}

// ── La demostración ──────────────────────────────────────────────────────
async function demo() {
  list.replaceChildren();
  rows.clear();
  const manager = new UploadManager({ limit: 2, onChange: render });
  const facade = manager.add('fachada.jpg', { chunkMs: 20 });
  const terrace = manager.add('terraza.jpg', { chunkMs: 35 });
  const menu = manager.add('carta.pdf', { chunkMs: 25 });
  say('▶ 3 archivos: suben fachada y terraza; la carta espera su turno');

  await facade.reached(40);
  facade.pause();
  say('⏸️ fachada.jpg: pausa pedida al 40 % (termina la parte en curso)');

  await terrace.done;
  say('✅ terraza.jpg completada: la carta toma su hueco');

  await menu.reached(50);
  say(`▶️ fachada.jpg reanudada (se detuvo al ${facade.percent} %)`);
  facade.resume();

  await menu.reached(80);
  menu.cancel();
  say('🛑 carta.pdf cancelada al 80 %');

  await facade.done;
  say('✅ fachada.jpg completada');

  console.log('estados →', [facade, terrace, menu].map((upload) => `${upload.file}: ${upload.state}`).join(' · '));
  console.log('nunca más de 2 subiendo a la vez →', manager.maxActive <= 2);
}

const restartButton = document.querySelector('#restart');
async function runDemo() {
  restartButton.disabled = true;
  await demo();
  restartButton.disabled = false;
}
restartButton.addEventListener('click', runDemo);
runDemo();
```
