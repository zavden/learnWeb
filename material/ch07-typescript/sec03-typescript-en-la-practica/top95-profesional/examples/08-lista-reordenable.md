---
example_description: "El orden de canciones de un concierto, reordenable arrastrando (DragEvent y DataTransfer con un tipo propio) y con teclado (botones Subir/Bajar y Alt + flechas): una sola función genérica move<T> cambia el orden, el foco sigue a la canción movida y un aviso aria-live dice su nueva posición"
example_tags: "typescript|profesional|drag-and-drop|datatransfer|dragevent|genericos|teclado|aria-live|accesibilidad|dom"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Concierto de son · orden de canciones</h1>
  <p class="hint" id="hint">Arrastra una canción, o enfócala y usa Alt + ↑ / ↓ o sus botones.</p>
  <ol id="setlist" class="setlist" aria-describedby="hint"></ol>
  <p id="total" class="total"></p>
  <p id="announce" class="visually-hidden" aria-live="assertive"></p>
  <ol class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #cbd2d9; --accent: #9a3412; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: #f5f7fa; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.25rem; }
.hint { margin: 0 0 0.5rem; color: var(--muted); }
.setlist { margin: 0; padding: 0; list-style: none; display: grid; gap: 0.35rem; counter-reset: song; }
.setlist li { counter-increment: song; display: flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0.5rem; border: 1px solid var(--line); border-radius: 0.5rem; background: #fff; cursor: grab; }
.setlist li::before { content: counter(song) '.'; min-width: 1.5rem; font-weight: 700; color: var(--accent); }
.setlist li[data-dragging] { opacity: 0.5; }
.setlist li[data-drop="before"] { box-shadow: inset 0 3px 0 var(--accent); }
.setlist li[data-drop="after"] { box-shadow: inset 0 -3px 0 var(--accent); }
.song { flex: 1; }
.song small { display: block; color: var(--muted); }
button { font: inherit; color: inherit; padding: 0.15rem 0.5rem; border: 1px solid #7b8794; border-radius: 0.4rem; background: #fff; cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: 0.45; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.total { font-weight: 600; }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: #fff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; color: var(--muted); }
```

# TypeScript

```typescript
// Orden de canciones reordenable.
//
// Decisiones de diseño:
// - El orden es un array inmutable; move<T> devuelve uno nuevo y todo se repinta desde él.
//   Arrastrar, los botones y el teclado acaban en la misma función.
// - Arrastrar usa un tipo propio en el DataTransfer («application/x-lw-track»): dragover solo
//   acepta lo que trae ese tipo (un texto o un archivo arrastrado desde fuera no hace nada).
//   event.dataTransfer es DataTransfer | null en los tipos: se comprueba siempre.
// - Arrastrar no es accesible con teclado: cada canción tiene «Subir» y «Bajar» y responde a
//   Alt + ↑/↓. El foco sigue a la canción movida, y un aviso aria-live dice dónde quedó.
//
// Alcance: todo el curso hasta el módulo «TypeScript en la práctica».

type Track = { id: string; title: string; artist: string; seconds: number };
const TRACK_TYPE = 'application/x-lw-track';

function move<T>(items: readonly T[], from: number, to: number): T[] {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  if (moved === undefined) return next;
  next.splice(Math.max(0, Math.min(to, next.length)), 0, moved);
  return next;
}

let tracks: readonly Track[] = [
  { id: 'bamba', title: 'La Bamba', artist: 'son jarocho', seconds: 174 },
  { id: 'cielito', title: 'Cielito lindo', artist: 'Quirino Mendoza', seconds: 185 },
  { id: 'cascabel', title: 'El Cascabel', artist: 'Lorenzo Barcelata', seconds: 200 },
  { id: 'llorona', title: 'La Llorona', artist: 'son istmeño', seconds: 296 },
  { id: 'besame', title: 'Bésame mucho', artist: 'Consuelo Velázquez', seconds: 211 },
];

function $<T extends Element>(selector: string, type: new () => T): T {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Falta «${selector}» o no es un ${type.name}`);
  return element;
}
const setlist = $('#setlist', HTMLOListElement);
const totalLine = $('#total', HTMLParagraphElement);
const announcer = $('#announce', HTMLParagraphElement);
const logList = $('.log', HTMLOListElement);
const report = (text: string): void => {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
};
const duration = (seconds: number): string => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

// focusTarget: qué hay que enfocar después de repintar ('item', 'up' o 'down' de una canción).
function render(focusTarget?: { id: string; part: 'item' | 'up' | 'down' }): void {
  setlist.replaceChildren(...tracks.map((track, index) => {
    const li = Object.assign(document.createElement('li'), { draggable: true, tabIndex: 0 });
    li.dataset.id = track.id;
    li.setAttribute('aria-label', `${index + 1}. ${track.title}, ${track.artist}, ${duration(track.seconds)}`);
    const song = Object.assign(document.createElement('span'), { className: 'song', textContent: track.title });
    song.append(Object.assign(document.createElement('small'), { textContent: `${track.artist} · ${duration(track.seconds)}` }));
    const up = Object.assign(document.createElement('button'), { type: 'button', textContent: 'Subir', disabled: index === 0 });
    const down = Object.assign(document.createElement('button'), { type: 'button', textContent: 'Bajar', disabled: index === tracks.length - 1 });
    up.dataset.move = 'up';
    down.dataset.move = 'down';
    up.setAttribute('aria-label', `Subir ${track.title}`);
    down.setAttribute('aria-label', `Bajar ${track.title}`);
    li.append(song, up, down);
    return li;
  }));
  totalLine.textContent = `${tracks.length} canciones · ${duration(tracks.reduce((sum, track) => sum + track.seconds, 0))}`;
  if (!focusTarget) return;
  const item = setlist.querySelector(`li[data-id="${focusTarget.id}"]`);
  const target = focusTarget.part === 'item' ? item : item?.querySelector(`[data-move="${focusTarget.part}"]`);
  // Si el botón quedó desactivado (la canción llegó al extremo), el foco va a la canción.
  if (target instanceof HTMLButtonElement && target.disabled) {
    if (item instanceof HTMLElement) item.focus();
  } else if (target instanceof HTMLElement) {
    target.focus();
  }
}

function moveTrack(id: string, to: number, how: string, part: 'item' | 'up' | 'down'): void {
  const from = tracks.findIndex((track) => track.id === id);
  const track = tracks[from];
  if (!track || from === to || to < 0 || to >= tracks.length) return;
  tracks = move(tracks, from, to);
  render({ id, part });
  announcer.textContent = `${track.title}: posición ${to + 1} de ${tracks.length}`;
  report(`↕ ${how} «${track.title}»: ${from + 1} → ${to + 1}`);
}

// ── Teclado y botones ─────────────────────────────────────────────────────
setlist.addEventListener('click', (event) => {
  const button = event.target instanceof Element ? event.target.closest('button') : null;
  const id = button?.closest('li')?.dataset.id;
  const direction = button?.dataset.move;
  if (!id || (direction !== 'up' && direction !== 'down')) return;
  const index = tracks.findIndex((track) => track.id === id);
  moveTrack(id, direction === 'up' ? index - 1 : index + 1, 'botón', direction);
});
setlist.addEventListener('keydown', (event) => {
  if (!event.altKey || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return;
  if (!(event.target instanceof HTMLLIElement)) return; // solo con la canción enfocada
  const id = event.target.dataset.id;
  if (!id) return;
  event.preventDefault();
  const index = tracks.findIndex((track) => track.id === id);
  moveTrack(id, event.key === 'ArrowUp' ? index - 1 : index + 1, 'teclado', 'item');
});

// ── Arrastrar y soltar ────────────────────────────────────────────────────
function clearDropMarks(): void {
  for (const item of setlist.querySelectorAll('li')) delete item.dataset.drop;
}
function dropPosition(event: DragEvent): { item: HTMLLIElement; after: boolean } | null {
  const item = event.target instanceof Element ? event.target.closest('li') : null;
  if (!item) return null;
  const box = item.getBoundingClientRect();
  return { item, after: event.clientY > box.top + box.height / 2 };
}

setlist.addEventListener('dragstart', (event) => {
  const item = event.target instanceof HTMLLIElement ? event.target : null;
  if (!item?.dataset.id || !event.dataTransfer) return;
  event.dataTransfer.setData(TRACK_TYPE, item.dataset.id);
  event.dataTransfer.effectAllowed = 'move';
  item.dataset.dragging = '';
});
setlist.addEventListener('dragover', (event) => {
  if (!event.dataTransfer?.types.includes(TRACK_TYPE)) return; // solo nuestras canciones
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  const position = dropPosition(event);
  clearDropMarks();
  if (position) position.item.dataset.drop = position.after ? 'after' : 'before';
});
setlist.addEventListener('dragleave', (event) => {
  if (event.relatedTarget instanceof Node && setlist.contains(event.relatedTarget)) return;
  clearDropMarks();
});
setlist.addEventListener('drop', (event) => {
  event.preventDefault();
  clearDropMarks();
  const id = event.dataTransfer?.getData(TRACK_TYPE);
  const position = dropPosition(event);
  const targetId = position?.item.dataset.id;
  if (!id || !position || !targetId) return;
  const from = tracks.findIndex((track) => track.id === id);
  let to = tracks.findIndex((track) => track.id === targetId) + (position.after ? 1 : 0);
  if (from < to) to -= 1; // al sacar la canción, las de detrás suben un puesto
  moveTrack(id, to, 'arrastrando', 'item');
});
setlist.addEventListener('dragend', () => {
  for (const item of setlist.querySelectorAll('li')) delete item.dataset.dragging;
  clearDropMarks();
});

render();
report(`🎵 ${totalLine.textContent} · empieza con «${tracks[0]?.title}»`);
report('Listo: arrastra una canción a otra posición, pulsa «Subir»/«Bajar» o usa Alt + ↑/↓ con una canción enfocada');
```
