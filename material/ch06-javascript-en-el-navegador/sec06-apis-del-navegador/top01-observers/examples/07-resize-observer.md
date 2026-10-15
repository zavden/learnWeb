---
example_description: "Un ResizeObserver avisa cuando cambia el tamaño de un elemento (no de la ventana): la fila de asistentes calcula cuántos avatares caben y resume el resto en «+N»; también llama una vez al empezar a observar, y cada entrada trae contentBoxSize, borderBoxSize y contentRect"
example_tags: "javascript|resizeobserver|observers|contentboxsize|borderboxsize|layout"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Cata de café del sábado</h1>
  <p class="hint">Arrastra la esquina inferior derecha del recuadro para cambiar su ancho.</p>
  <div id="guests" class="guests">
    <ul id="avatars" class="avatars" aria-label="Asistentes"></ul>
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
  margin: 0 0 0.25rem;
}
.hint {
  margin: 0 0 0.5rem;
  color: #52606d;
}
/* 322 px de borde a borde = 300 px de contenido + 10 px de relleno y 1 px
   de borde por lado. resize: horizontal deja que la persona cambie el ancho. */
.guests {
  box-sizing: border-box;
  width: 322px;
  min-width: 100px;
  max-width: 100%;
  padding: 10px;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  resize: horizontal;
  overflow: hidden;
}
/* La fila mide 40 px vacía o llena: si creciera al pintar los avatares, el
   alto observado cambiaría dentro del callback (el bucle del ejemplo 08). */
.avatars {
  display: flex;
  gap: 8px;
  min-height: 40px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.avatars li {
  display: grid;
  place-items: center;
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #92400e;
  color: #ffffff;
  font-weight: 700;
}
.avatars .more {
  background: #e4e7eb;
  color: #1f2933;
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
const GUESTS = ['Ana López', 'Bruno Díaz', 'Carmen Ruiz', 'Diego Soto', 'Elena Paz',
  'Fernando Gil', 'Gabriela Núñez', 'Héctor Vega', 'Inés Mora'];
const SLOT = 48; // 40 px de avatar + 8 px de hueco
const box = document.querySelector('#guests');
const avatarList = document.querySelector('#avatars');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
const initials = (fullName) => fullName.split(' ').map((word) => word[0]).join('');
function hiddenLabel(text) { // texto para lectores de pantalla
  const label = document.createElement('span');
  label.className = 'visually-hidden';
  label.textContent = text;
  return label;
}

function renderAvatars(width) {
  const slots = Math.max(1, Math.floor((width + 8) / SLOT)); // el último no lleva hueco
  const fits = GUESTS.length <= slots;
  const shown = fits ? GUESTS : GUESTS.slice(0, slots - 1); // deja sitio para «+N»
  const items = shown.map((guest) => {
    const item = document.createElement('li');
    item.title = guest;
    item.append(initials(guest), hiddenLabel(` ${guest}`));
    return item;
  });
  if (!fits) {
    const rest = GUESTS.length - shown.length;
    const more = document.createElement('li');
    more.className = 'more';
    more.title = GUESTS.slice(shown.length).join(', ');
    more.append(`+${rest}`, hiddenLabel(' personas más'));
    items.push(more);
  }
  avatarList.replaceChildren(...items);
  return fits ? `caben ${slots} → muestro los ${GUESTS.length}` : `caben ${slots} → muestro ${shown.length} + «+${GUESTS.length - shown.length}»`;
}

let calls = 0;
const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    calls += 1;
    // contentBoxSize y borderBoxSize son arrays (un fragmento por columna de
    // texto; casi siempre uno). inlineSize = ancho en texto horizontal.
    const content = entry.contentBoxSize[0].inlineSize;
    const border = entry.borderBoxSize[0].inlineSize;
    const when = calls === 1 ? 'llamada 1 (al observar)' : `llamada ${calls}`;
    logLine(`${when} → contenido ${content} px · borde ${border} px · contentRect.width ${entry.contentRect.width}`);
    logLine(renderAvatars(content));
  }
});
observer.observe(box);
logLine('Listo: cambia el ancho del recuadro desde su esquina');

// Para cambiar solo el aspecto según el ancho de una caja, usa container
// queries (CSS). ResizeObserver es para cuando JS necesita el número:
// cuántos elementos caben, el tamaño de un canvas, una lista virtualizada.
```
