---
example_description: "contextmenu + preventDefault() sustituye el menú del navegador por uno propio (un popover colocado en el puntero) sobre las fotos de una galería; un botón «⋯» abre el mismo menú con el teclado"
example_tags: "javascript|eventos|contextmenu|preventdefault|popover|accesibilidad"
example_stage: minimal
example_importance: useful
console: true
---

# HTML

```html
<main>
  <h1>Álbum: Oaxaca 2026</h1>
  <ul id="album" class="album">
    <li class="photo" data-title="Monte Albán al amanecer">🏛️ Monte Albán al amanecer
      <button type="button" class="more" aria-label="Acciones para Monte Albán al amanecer">⋯</button></li>
    <li class="photo" data-title="Mercado 20 de Noviembre">🌶️ Mercado 20 de Noviembre
      <button type="button" class="more" aria-label="Acciones para Mercado 20 de Noviembre">⋯</button></li>
  </ul>
  <div id="photo-menu" class="photo-menu" popover>
    <button type="button" data-action="descargar">⬇️ Descargar</button>
    <button type="button" data-action="compartir">🔗 Compartir</button>
    <button type="button" data-action="eliminar">🗑️ Eliminar</button>
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
  margin-top: 0;
}
.album {
  display: grid;
  gap: 0.5rem;
  padding: 0;
  list-style: none;
}
.photo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
/* Un popover está en la capa superior; por defecto se centra. Aquí se
   coloca con left/top desde JS. */
.photo-menu {
  position: fixed;
  inset: auto;
  margin: 0;
  padding: 0.25rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
}
.photo-menu button {
  display: block;
  width: 100%;
  text-align: start;
}
button {
  font: inherit;
  padding: 0.3rem 0.7rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
.more {
  border-color: #7b8794;
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
const album = document.querySelector('#album');
const photoMenu = document.querySelector('#photo-menu');
const logList = document.querySelector('#log');
let currentPhoto = null;
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

function openMenu(photo, x, y) {
  currentPhoto = photo;
  photoMenu.style.left = `${x}px`;
  photoMenu.style.top = `${y}px`;
  // popover: Escape y el clic fuera lo cierran solos.
  if (!photoMenu.matches(':popover-open')) photoMenu.showPopover();
  photoMenu.querySelector('button').focus();
  logLine(`📋 menú propio para «${photo.dataset.title}»`);
}

// Clic derecho (o Ctrl + clic en macOS): la acción por defecto es el menú del
// navegador. preventDefault() lo sustituye por el nuestro.
album.addEventListener('contextmenu', (event) => {
  const photo = event.target.closest('.photo');
  if (!photo) return;
  event.preventDefault();
  openMenu(photo, event.clientX, event.clientY);
});

// La alternativa de teclado (y de pantalla táctil): el botón «⋯».
album.addEventListener('click', (event) => {
  const button = event.target.closest('.more');
  if (!button) return;
  const box = button.getBoundingClientRect();
  openMenu(button.closest('.photo'), box.left, box.bottom);
});

photoMenu.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]');
  if (!action) return;
  logLine(`${action.dataset.action} → «${currentPhoto.dataset.title}»`);
  photoMenu.hidePopover();
});
logLine('Listo: haz clic derecho en una foto, o pulsa su botón «⋯»');

// Sustituye el menú del navegador solo donde el tuyo aporta algo (fotos,
// archivos, celdas): fuera de ahí, el usuario espera «Copiar», «Inspeccionar»…
// Un menú de verdad accesible (role="menu", flechas para moverse) es más
// largo; aquí bastan los botones dentro del popover.
```
