---
example_description: "Dos menús desplegables accesibles e independientes: se abren con clic, Enter o ↓, se recorren con las flechas, Escape cierra y devuelve el foco, y se cierran con un clic fuera escuchado en captura (así ni el widget que llama a stopPropagation los deja abiertos); los listeners de «abierto» se quitan con un abort()"
example_tags: "javascript|eventos|integracion|menu|teclado|captura|abortcontroller|accesibilidad"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Pedidos de octubre</h1>
  <div class="toolbar">
    <div class="menu-button" data-menu="Ordenar por">
      <button type="button" class="trigger" aria-haspopup="true" aria-expanded="false" aria-controls="sort-menu">Ordenar por ▾</button>
      <ul id="sort-menu" class="menu" role="menu" hidden>
        <li role="none"><button type="button" role="menuitem" tabindex="-1">Fecha</button></li>
        <li role="none"><button type="button" role="menuitem" tabindex="-1">Importe</button></li>
        <li role="none"><button type="button" role="menuitem" tabindex="-1">Cliente</button></li>
      </ul>
    </div>
    <div class="menu-button" data-menu="Exportar">
      <button type="button" class="trigger" aria-haspopup="true" aria-expanded="false" aria-controls="export-menu">Exportar ▾</button>
      <ul id="export-menu" class="menu" role="menu" hidden>
        <li role="none"><button type="button" role="menuitem" tabindex="-1">CSV</button></li>
        <li role="none"><button type="button" role="menuitem" tabindex="-1">PDF</button></li>
      </ul>
    </div>
  </div>
  <!-- Un widget de otra persona que detiene la propagación de sus clics. -->
  <p id="chat" class="chat">💬 Widget de ayuda (ajeno): detiene la propagación de sus clics</p>
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
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.menu-button {
  position: relative;
}
.menu {
  position: absolute;
  z-index: 1;
  min-width: 100%;
  margin: 0.25rem 0 0;
  padding: 0.25rem;
  list-style: none;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
}
.menu [role="menuitem"] {
  display: block;
  width: 100%;
  border-color: transparent;
  text-align: start;
}
button {
  font: inherit;
  padding: 0.35rem 0.75rem;
  border: 1px solid #7b8794;
  border-radius: 0.4rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.chat {
  margin-top: 5rem;
  padding: 0.5rem 0.75rem;
  border: 1px dashed #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
}
.log {
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
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

function createMenuButton(root) {
  const name = root.dataset.menu;
  const trigger = root.querySelector('.trigger');
  const menu = root.querySelector('[role="menu"]');
  const items = [...menu.querySelectorAll('[role="menuitem"]')];
  let openLife = null; // el AbortController de los listeners de «abierto»

  function open(focusIndex) {
    if (openLife) return;
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    items.at(focusIndex).focus();
    openLife = new AbortController();
    const { signal } = openLife;
    // En CAPTURA: lo vemos antes de que nadie pueda detener el clic.
    document.addEventListener('click', (event) => {
      if (!root.contains(event.target)) close('clic fuera', false);
    }, { capture: true, signal });
    // Si el foco sale del componente (Tab), se cierra.
    root.addEventListener('focusout', (event) => {
      if (event.relatedTarget && !root.contains(event.relatedTarget)) close('el foco salió', false);
    }, { signal });
    logLine(`▾ «${name}» abierto`);
  }

  function close(reason, returnFocus) {
    if (!openLife) return;
    openLife.abort(); // fuera los listeners de document y de focusout
    openLife = null;
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (returnFocus) trigger.focus();
    logLine(`▴ «${name}» cerrado: ${reason}`);
  }

  trigger.addEventListener('click', () => (openLife ? close('botón', true) : open(0)));
  trigger.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    open(event.key === 'ArrowDown' ? 0 : -1);
  });
  menu.addEventListener('keydown', (event) => {
    const index = items.indexOf(event.target);
    const moves = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: items.length - 1 };
    if (event.key in moves) {
      event.preventDefault();
      items.at(moves[event.key] % items.length).focus();
    } else if (event.key === 'Escape') {
      close('Escape (el foco vuelve al botón)', true);
    }
  });
  menu.addEventListener('click', (event) => {
    const item = event.target.closest('[role="menuitem"]');
    if (!item) return;
    logLine(`✔ ${name} → ${item.textContent}`);
    close('elegido', true);
  });
}
document.querySelectorAll('.menu-button').forEach(createMenuButton);

// El widget ajeno: stopPropagation en sus clics. Los menús escuchan en
// captura, así que se cierran igual. (Si pulsas un botón fuera del menú, el
// menú se cierra ya antes, por focusout: el clic mueve el foco al botón.)
document.querySelector('#chat').addEventListener('click', (event) => {
  event.stopPropagation();
  logLine('💬 el widget de ayuda detuvo la propagación');
});
logLine('Listo: abre «Ordenar por» y pulsa «Exportar»; abre uno con ↓, usa las flechas y Escape; abre uno y pulsa el widget 💬');
```
