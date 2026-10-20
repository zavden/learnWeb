---
example_description: "Un evento creado con new CustomEvent no burbujea salvo que se pida bubbles: true: el aviso de «favorito» llega al botón pero no al listener de document; al cargar se despachan las dos versiones para comparar"
example_tags: "javascript|eventos|customevent|bubbles|dispatchevent|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Recetas guardadas: <output id="saved">0</output></h1>
  <p class="actions">
    <button id="fav-buggy" type="button">♥ Pozole rojo (🐛 sin bubbles)</button>
    <button id="fav-fixed" type="button">♥ Chiles en nogada (✅ bubbles: true)</button>
  </p>
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
.actions {
  display: grid;
  gap: 0.5rem;
  justify-items: start;
}
button {
  font: inherit;
  padding: 0.4rem 0.8rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
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
const logList = document.querySelector('#log');
let saved = 0;
let heard = false; // ¿llegó el último aviso hasta document?
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// El contador de recetas guardadas escucha en document.
document.addEventListener('recipe:favorite', () => {
  heard = true;
  saved += 1;
  document.querySelector('#saved').textContent = saved;
});

function announceFavorite(button, options) {
  heard = false;
  const favorite = new CustomEvent('recipe:favorite', options);
  button.dispatchEvent(favorite); // síncrono: al volver, ya sabemos si llegó
  logLine(`${heard ? '✅' : '🐛'} #${button.id} · bubbles: ${favorite.bubbles} → ¿document lo oyó? ${heard}`);
}

const buggyButton = document.querySelector('#fav-buggy');
const fixedButton = document.querySelector('#fav-fixed');
// 🐛 Sin opciones, bubbles es false: el evento se queda en el botón.
buggyButton.addEventListener('click', () => announceFavorite(buggyButton, {}));
// ✅ Con bubbles: true sube por los antepasados como un clic.
fixedButton.addEventListener('click', () => announceFavorite(fixedButton, { bubbles: true }));

// Al cargar, una vez cada uno (simulado: el tema es el propio dispatch).
logLine('— simulado al cargar —');
announceFavorite(buggyButton, {});
announceFavorite(fixedButton, { bubbles: true });
logLine('Listo: pulsa los dos botones');

// Los eventos del navegador traen bubbles (y cancelable) ya decididos; los
// tuyos empiezan con todo en false. Con Shadow DOM (módulo «APIs modernas
// del navegador»), composed: true deja salir el evento del componente.
```
