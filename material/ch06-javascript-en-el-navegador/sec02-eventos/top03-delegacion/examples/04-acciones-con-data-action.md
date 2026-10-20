---
example_description: "Delegación con data-action: una lista de reproducción con botones play/like/quitar en cada canción y un solo listener que busca la acción en un Map; aria-pressed para el «me gusta»"
example_tags: "javascript|eventos|delegacion|dataset|map|reproductor|aria-pressed"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Lista: boleros</h1>
  <p id="now-playing" class="now" aria-live="polite">Nada sonando.</p>
  <ol id="playlist" class="playlist">
    <li data-track-id="t1" data-title="Bésame mucho">
      <span>Bésame mucho · 3:12</span>
      <button type="button" data-action="play">▶ Reproducir</button>
      <button type="button" data-action="like" aria-pressed="false" aria-label="Me gusta">♥</button>
      <button type="button" data-action="remove" aria-label="Quitar de la lista">✕</button>
    </li>
    <li data-track-id="t2" data-title="Sabor a mí">
      <span>Sabor a mí · 2:58</span>
      <button type="button" data-action="play">▶ Reproducir</button>
      <button type="button" data-action="like" aria-pressed="false" aria-label="Me gusta">♥</button>
      <button type="button" data-action="remove" aria-label="Quitar de la lista">✕</button>
    </li>
    <li data-track-id="t3" data-title="Contigo aprendí">
      <span>Contigo aprendí · 3:05</span>
      <button type="button" data-action="play">▶ Reproducir</button>
      <button type="button" data-action="like" aria-pressed="false" aria-label="Me gusta">♥</button>
      <button type="button" data-action="remove" aria-label="Quitar de la lista">✕</button>
    </li>
  </ol>
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
  margin-top: 0;
}
.now {
  font-weight: 600;
}
.playlist {
  display: grid;
  gap: 0.35rem;
  padding-left: 1.5rem;
}
.playlist li span {
  display: inline-block;
  min-width: 11rem;
}
button {
  font: inherit;
  padding: 0.2rem 0.55rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button[aria-pressed="true"] {
  border-color: #b91c1c;
  background: #fee2e2;
  color: #991b1b;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
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
const playlist = document.querySelector('#playlist');
const nowPlaying = document.querySelector('#now-playing');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// Cada acción es una función que recibe la canción (el <li>) y el botón.
// Un Map, no un objeto literal: con {} una acción llamada «toString» o
// «constructor» encontraría un método heredado de Object.prototype.
const actions = new Map([
  ['play', (track) => {
    nowPlaying.textContent = `Sonando: ${track.dataset.title}`;
    logLine(`▶ play → ${track.dataset.trackId}`);
  }],
  ['like', (track, button) => {
    const liked = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(liked));
    logLine(`♥ like → ${track.dataset.trackId}: ${liked}`);
  }],
  ['remove', (track) => {
    logLine(`✕ remove → ${track.dataset.trackId}`);
    track.remove();
  }],
]);

playlist.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const action = actions.get(button.dataset.action);
  if (!action) return; // una acción que no conocemos: la ignoramos
  action(button.closest('li'), button);
});
logLine('Listo: reproduce una canción, dale ♥ a otra y quita la tercera');

// El HTML dice QUÉ hace cada botón (data-action) y el JS, CÓMO. Añadir
// una canción o una acción nueva no obliga a tocar los listeners.
```
