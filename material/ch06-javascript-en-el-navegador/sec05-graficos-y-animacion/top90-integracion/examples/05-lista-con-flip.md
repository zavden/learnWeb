---
example_description: "Una lista de reproducción que se reordena con botones ↑/↓ y «Ordenar por duración»: FLIP anima cada cambio con translate, el foco se queda en la canción movida y el anuncio para lectores de pantalla espera a que terminen las animaciones (Promise.allSettled, porque un clic rápido cancela las anteriores)"
example_tags: "javascript|web-animations|flip|finished|foco|accesibilidad|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Lista para la fiesta</h1>
  <button id="sort" type="button">Ordenar por duración</button>
  <ol id="playlist" class="playlist">
    <li data-seconds="245"><span>La Bamba</span> <span class="time">4:05</span>
      <button type="button" data-move="-1" aria-label="Subir La Bamba">↑</button><button type="button" data-move="1" aria-label="Bajar La Bamba">↓</button></li>
    <li data-seconds="198"><span>El Cascabel</span> <span class="time">3:18</span>
      <button type="button" data-move="-1" aria-label="Subir El Cascabel">↑</button><button type="button" data-move="1" aria-label="Bajar El Cascabel">↓</button></li>
    <li data-seconds="312"><span>Cielito lindo</span> <span class="time">5:12</span>
      <button type="button" data-move="-1" aria-label="Subir Cielito lindo">↑</button><button type="button" data-move="1" aria-label="Bajar Cielito lindo">↓</button></li>
    <li data-seconds="176"><span>La Llorona</span> <span class="time">2:56</span>
      <button type="button" data-move="-1" aria-label="Subir La Llorona">↑</button><button type="button" data-move="1" aria-label="Bajar La Llorona">↓</button></li>
  </ol>
  <p id="status" class="visually-hidden" aria-live="polite"></p>
  <ol id="log" class="log"></ol>
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
.playlist {
  display: grid;
  gap: 0.4rem;
  max-width: 22rem;
  padding-left: 1.5rem;
}
.playlist li {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.6rem;
  border-radius: 0.5rem;
  background: #e0f2fe;
}
.playlist li > span:first-child {
  flex: 1;
}
.time {
  font-variant-numeric: tabular-nums;
  color: #334e68;
}
button {
  font: inherit;
  padding: 0.2rem 0.6rem;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.log {
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
const playlist = document.querySelector('#playlist');
const statusLine = document.querySelector('#status');
const logList = document.querySelector('#log');
const titleOf = (item) => item.querySelector('span').textContent;
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// FLIP: medir, cambiar el DOM, invertir y animar. Devuelve las animaciones creadas.
function flip(changeDom) {
  const items = [...playlist.children];
  const first = new Map(items.map((item) => [item, item.getBoundingClientRect().top]));
  items.forEach((item) => item.getAnimations().forEach((animation) => animation.cancel()));
  changeDom();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return [];   // matchMedia: módulo siguiente
  return items
    .map((item) => [item, first.get(item) - item.getBoundingClientRect().top])
    .filter(([, dy]) => dy !== 0)
    .map(([item, dy]) => item.animate({ translate: [`0 ${dy}px`, '0 0'] }, { duration: 350, easing: 'cubic-bezier(0.2, 0, 0, 1)' }));
}

async function announce(animations, text) {
  // allSettled: si otro clic cancela estas animaciones, su finished se rechaza (AbortError)
  // y aun así queremos anunciar el estado final
  await Promise.allSettled(animations.map((animation) => animation.finished));
  statusLine.textContent = text;
  logLine(text);
}

playlist.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-move]');
  if (!button) return;
  const item = button.closest('li');
  const items = [...playlist.children];
  const target = items.indexOf(item) + Number(button.dataset.move);
  if (target < 0 || target >= items.length) return;
  const animations = flip(() => {
    if (Number(button.dataset.move) < 0) items[target].before(item);
    else items[target].after(item);
  });
  button.focus();                               // mover el elemento no le quita el foco al botón
  announce(animations, `«${titleOf(item)}» ahora es la ${target + 1}.ª de ${items.length}`);
});

document.querySelector('#sort').addEventListener('click', () => {
  const sorted = [...playlist.children].toSorted((a, b) => a.dataset.seconds - b.dataset.seconds);
  const animations = flip(() => playlist.append(...sorted));
  announce(animations, `Ordenada por duración: ${sorted.map(titleOf).join(', ')}`);
});
logLine(`Orden inicial: ${[...playlist.children].map(titleOf).join(', ')}`);
logLine('Listo: sube «Cielito lindo» con ↑ y luego pulsa «Ordenar por duración»');
```
