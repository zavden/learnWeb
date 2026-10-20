---
example_description: "Un almacén de estado (store) que avisa a sus suscriptores como mucho una vez por frame: los votos de un concurso llegan de /api/demo/stream (NDJSON leído con for await), cada línea es un dispatch y el render se agrupa en requestAnimationFrame. Cada componente se suscribe a una parte del estado con un selector y solo se repinta si esa parte cambió (Object.is), gracias a un reductor que conserva las referencias de lo que no cambia"
example_tags: "javascript|rendimiento|store|requestanimationframe|selectores|streams|ndjson|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="contest">
  <h1>Concurso de altares de Día de Muertos</h1>
  <p class="actions">
    <button id="connect" type="button">Conectar a la votación (50 votos)</button>
    <button id="disconnect" type="button" disabled>Desconectar</button>
  </p>
  <p id="leader" class="leader" role="status"></p>
  <ol id="board" class="board" aria-label="Puntos por altar"></ol>
  <p id="last-vote" class="last-vote"></p>
  <p class="progress-line"><label for="progress">Votos recibidos</label> <progress id="progress" max="50" value="0"></progress> <span id="progress-text">0 de 50</span></p>
  <p id="renders" class="renders"></p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --accent: #1d4ed8; --paper: #ffffff; --page: #f8fafc; --marigold: #b45309; }
body { margin: 0; font-family: system-ui, sans-serif; color: var(--ink); background: var(--page); }
.contest { max-width: 34rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
.actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: var(--paper); color: var(--ink); cursor: pointer; }
button:disabled { cursor: not-allowed; color: #64748b; }
button:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.leader { min-block-size: 1.5em; font-weight: 600; color: var(--marigold); }
.board { display: grid; gap: 0.3rem; margin: 0; padding: 0; list-style: none; }
.board li { display: grid; grid-template-columns: 11rem 1fr 2.5rem; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
.bar { block-size: 0.7rem; border-radius: 0.35rem; background: #f59e0b; transform-origin: left; }
.points { text-align: end; font-variant-numeric: tabular-nums; font-weight: 600; }
.last-vote, .renders { color: var(--muted); font-size: 0.85rem; min-block-size: 1.3em; }
.progress-line { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--paper); font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
@media (max-width: 30rem) { .board li { grid-template-columns: 8.5rem 1fr 2.2rem; font-size: 0.8rem; } }
```

# JavaScript

```javascript
// UN ALMACÉN QUE PINTA UNA VEZ POR FRAME
// - El estado vive en un solo sitio (el store). dispatch(acción) lo cambia AL MOMENTO, pero los
//   suscriptores se avisan como mucho una vez por frame, en requestAnimationFrame: diez votos que
//   llegan entre dos frames cuestan un render (lección «Render y frames»).
// - Cada componente se suscribe con un SELECTOR (la parte del estado que le importa) y solo se
//   repinta si esa parte cambió (Object.is). Para que funcione, el reductor nunca modifica el
//   estado: crea objetos nuevos para lo que cambia y CONSERVA las referencias de lo demás. El
//   líder se recalcula en cada voto, pero si sigue siendo el mismo, es el mismo valor.
// - Los votos llegan de la API de prueba: /api/demo/stream?format=ndjson manda 50 líneas JSON
//   ({ n, of, text }), una cada 10 ms. Se leen con for await (módulo «Red y almacenamiento») y
//   el número de cada línea decide el voto (en una aplicación real lo mandaría el servidor).
// - Con la pestaña oculta no hay frames: el estado se sigue actualizando y se pinta una sola vez
//   al volver. Nadie paga renders que nadie ve.

const ALTARS = ['Frida Kahlo (1.º A)', 'Pedro Infante (1.º B)', 'La Catrina (2.º A)', 'Juan Rulfo (2.º B)', 'Chavela Vargas (3.º A)'];
const TOTAL_VOTES = 50;
const STREAM_URL = `/api/demo/stream?format=ndjson&chunks=${TOTAL_VOTES}&interval=10`;
const voteFor = (n) => ({ type: 'vote', n, altar: ((n * 13) ^ (n >> 2)) % ALTARS.length, points: 1 + (n % 3) });

const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// ── El store: estado inmediato, avisos agrupados por frame ──
const NOT_PAINTED = Symbol('todavía sin pintar');
function createStore(reducer, initialState) {
  let state = initialState;
  const subscribers = new Set();
  let framePending = false;
  const stats = { dispatches: 0, notifications: 0 };
  let flushed = [];
  function flush() {
    framePending = false;
    stats.notifications += 1;
    for (const subscriber of subscribers) subscriber.check(state);
    for (const resolve of flushed.splice(0)) resolve();
  }
  return {
    stats,
    getState: () => state,
    dispatch(action) {
      state = reducer(state, action);
      stats.dispatches += 1;
      if (!framePending) {
        framePending = true;
        requestAnimationFrame(flush);
      }
    },
    // select: estado → la parte que le importa al componente; render: pinta esa parte.
    subscribe(select, render) {
      const subscriber = {
        renders: 0,
        last: NOT_PAINTED,
        check(current) {
          const slice = select(current);
          if (Object.is(slice, subscriber.last)) return; // nada nuevo: no se toca el DOM
          subscriber.last = slice;
          subscriber.renders += 1;
          render(slice);
        },
      };
      subscribers.add(subscriber);
      subscriber.check(state);
      return subscriber;
    },
    nextFlush: () => (framePending ? new Promise((resolve) => flushed.push(resolve)) : Promise.resolve()),
  };
}

// ── El reductor: nunca modifica; conserva lo que no cambia ──
const initialState = { totals: Object.freeze(ALTARS.map(() => 0)), votes: 0, leader: -1, last: null };
function leaderOf(totals, previous) {
  let best = previous;
  for (let k = 0; k < totals.length; k++) if (best === -1 || totals[k] > totals[best]) best = k; // un empate no destrona
  return best;
}
function reducer(state, action) {
  switch (action.type) {
    case 'vote': {
      const totals = state.totals.slice();
      totals[action.altar] += action.points;
      return { totals: Object.freeze(totals), votes: state.votes + 1, leader: leaderOf(totals, state.leader), last: action };
    }
    case 'reset':
      return initialState;
    default:
      return state;
  }
}

// ── Los componentes: cada uno con su selector ──
const store = createStore(reducer, initialState);
const board = document.querySelector('#board');
const rows = ALTARS.map((altar) => {
  const item = document.createElement('li');
  const bar = Object.assign(document.createElement('span'), { className: 'bar' });
  const points = Object.assign(document.createElement('span'), { className: 'points' });
  bar.setAttribute('aria-hidden', 'true');
  item.append(Object.assign(document.createElement('span'), { textContent: altar }), bar, points);
  board.append(item);
  return { bar, points };
});
const components = {
  board: store.subscribe((state) => state.totals, (totals) => {
    const max = Math.max(1, ...totals);
    totals.forEach((value, k) => {
      rows[k].points.textContent = String(value);
      rows[k].bar.style.transform = `scaleX(${value / max})`; // transform: no cambia el layout
    });
  }),
  leader: store.subscribe((state) => state.leader, (leader) => {
    document.querySelector('#leader').textContent = leader === -1 ? 'Todavía no hay votos' : `🏵️ Va ganando: ${ALTARS[leader]}`;
  }),
  last: store.subscribe((state) => state.last, (last) => {
    document.querySelector('#last-vote').textContent = last ? `Último voto: n.º ${last.n} · ${last.points} punto${last.points === 1 ? '' : 's'} para ${ALTARS[last.altar]}` : '';
  }),
  progress: store.subscribe((state) => state.votes, (votes) => {
    document.querySelector('#progress').value = votes;
    document.querySelector('#progress-text').textContent = `${votes} de ${TOTAL_VOTES}`;
  }),
};
const LABELS = { board: 'marcador', leader: 'líder', last: 'último voto', progress: 'progreso' };
const renderLine = () => Object.entries(components).map(([key, subscriber]) => `${LABELS[key]} ${subscriber.renders}`).join(' · ');
const rendersText = document.querySelector('#renders');
const showRenders = () => { rendersText.textContent = `renders: ${renderLine()} · avisos del store: ${store.stats.notifications}`; };
// Suscribirse ya pinta el estado inicial; la prueba pone los contadores a cero antes de empezar.

// ── Prueba al cargar: 12 votos en la misma tarea y, en otra, 3 que no cambian al líder ──
const resetCounts = () => {
  for (const subscriber of Object.values(components)) subscriber.renders = 0;
  store.stats.notifications = 0;
  store.stats.dispatches = 0;
};
resetCounts();
for (let n = 1; n <= 12; n++) store.dispatch(voteFor(n));
logLine(`12 votos en la misma tarea → dispatches: ${store.stats.dispatches} · renders hasta ahora: ${renderLine()}`);
store.nextFlush().then(() => {
  logLine(`… en el siguiente frame (1 aviso): ${renderLine()}`);
  for (let n = 13; n <= 15; n++) store.dispatch(voteFor(n));
  return store.nextFlush();
}).then(() => {
  logLine(`3 votos más, el líder no cambia → ${renderLine()} · avisos del store: ${store.stats.notifications}`);
  showRenders();
  console.log('Listo: pulsa «Conectar a la votación» (50 votos en medio segundo)');
});

// ── La votación en vivo: NDJSON por la red, un dispatch por línea ──
const connectButton = document.querySelector('#connect');
const disconnectButton = document.querySelector('#disconnect');
let controller = null;
async function* ndjsonLines(body) { // trozos de bytes → líneas completas
  let pending = '';
  for await (const text of body.pipeThrough(new TextDecoderStream())) {
    pending += text;
    let newline;
    while ((newline = pending.indexOf('\n')) !== -1) {
      const line = pending.slice(0, newline);
      pending = pending.slice(newline + 1);
      if (line) yield line;
    }
  }
}
connectButton.addEventListener('click', async () => {
  controller = new AbortController();
  connectButton.disabled = true;
  disconnectButton.disabled = false;
  store.dispatch({ type: 'reset' });
  await store.nextFlush();
  resetCounts();
  let frames = 0;
  let counting = true;
  const countFrames = () => { frames += 1; if (counting) requestAnimationFrame(countFrames); };
  requestAnimationFrame(countFrames);
  try {
    const response = await fetch(STREAM_URL, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    for await (const line of ndjsonLines(response.body)) store.dispatch(voteFor(JSON.parse(line).n));
    await store.nextFlush(); // el último render, antes del resumen
    const { totals, leader } = store.getState();
    const ranking = ALTARS.map((altar, k) => [altar, totals[k]]).sort((a, b) => b[1] - a[1]);
    logLine(`📡 votos recibidos: ${store.stats.dispatches} · 🏆 gana ${ALTARS[leader]} con ${totals[leader]} puntos`);
    logLine(`clasificación: ${ranking.map(([altar, points]) => `${altar.split(' (')[0]} ${points}`).join(' · ')}`);
    logLine(`¿el marcador pintó como mucho una vez por frame? ${components.board.renders <= frames} · ¿el líder se pintó menos veces que el marcador? ${components.leader.renders < components.board.renders}`);
    logLine(`renders: ≈ ${renderLine()} · frames: ≈ ${frames} (para ${store.stats.dispatches} votos)`);
  } catch (error) {
    if (error.name === 'AbortError') {
      await store.nextFlush(); // lo que llegó antes de cortar también se pinta
      logLine(`⏹ desconectado a mitad · ¿el marcador enseña todos los votos que llegaron? ${document.querySelector('#progress').value === store.getState().votes}`);
    } else {
      logLine(`⚠️ la votación falló: ${error.message}`);
    }
  } finally {
    counting = false;
    showRenders();
    connectButton.disabled = false;
    disconnectButton.disabled = true;
  }
});
disconnectButton.addEventListener('click', () => controller?.abort());
```
