---
example_description: "Un monitor de eventos como el de DevTools: un objeto con handleEvent escucha en captura muchos tipos a la vez (filtrables por familia), anota target, fase e isTrusted, y lee defaultPrevented con un setTimeout, cuando el viaje ya terminó (una microtarea llegaría demasiado pronto)"
example_tags: "javascript|eventos|integracion|handleevent|captura|defaultprevented|depuracion"
example_stage: intermediate
example_importance: useful
console: true
---

# HTML

```html
<main>
  <h1>Monitor de eventos</h1>
  <fieldset class="filters">
    <legend>Familias que se registran</legend>
    <label><input type="checkbox" value="pointer" checked> puntero</label>
    <label><input type="checkbox" value="keyboard" checked> teclado</label>
    <label><input type="checkbox" value="focus"> foco</label>
    <label><input type="checkbox" value="form" checked> formulario</label>
  </fieldset>
  <form id="demo" class="demo" action="/suscribir">
    <label>Correo <input name="email" type="email" value="lucia@example.com"></label>
    <label><input type="checkbox" name="news"> Novedades</label>
    <a href="/condiciones" id="terms">Condiciones</a>
    <button type="submit">Enviar</button>
  </form>
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
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
}
.demo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  margin: 0.75rem 0;
  padding: 0.75rem;
  border: 2px dashed #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
}
input,
button {
  font: inherit;
}
a {
  color: #1d4ed8;
}
input:focus-visible,
button:focus-visible,
a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.log {
  padding: 0.5rem 0.5rem 0.5rem 2.5rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.75rem;
}
```

# JavaScript

```javascript
const logList = document.querySelector('#log');
const demo = document.querySelector('#demo');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
  if (logList.children.length > 12) logList.firstElementChild.remove();
}

const families = {
  pointer: ['pointerdown', 'pointerup', 'click', 'dblclick', 'contextmenu'],
  keyboard: ['keydown', 'keyup'],
  focus: ['focusin', 'focusout'],
  form: ['input', 'change', 'submit'],
};
const describe = (node) => (node.id ? `#${node.id}` : node.name ? `${node.tagName.toLowerCase()}[name=${node.name}]` : node.tagName.toLowerCase());

// UN objeto listener para todos los tipos: el navegador llama a handleEvent.
const monitor = {
  enabled: new Set(),
  handleEvent(event) {
    if (!this.enabled.has(event.type) || !demo.contains(event.target)) return;
    const where = describe(event.target);
    const extra = event.type.startsWith('key') ? ` key=${JSON.stringify(event.key)}` : '';
    // En captura, el viaje acaba de empezar: defaultPrevented aún es false.
    // Lo leemos al terminar la TAREA con setTimeout. Con queueMicrotask no
    // valdría: con un evento real, las microtareas se ejecutan entre un
    // listener y el siguiente (lección «Eventos personalizados»).
    setTimeout(() => {
      const prevented = event.defaultPrevented ? ' · cancelado' : '';
      logLine(`${event.type} → ${where}${extra} · trusted: ${event.isTrusted}${prevented}`);
    });
  },
};
for (const type of Object.values(families).flat()) {
  window.addEventListener(type, monitor, { capture: true }); // en window y en captura: lo primero de todo
}
function applyFilters() {
  monitor.enabled.clear();
  for (const box of document.querySelectorAll('.filters input:checked')) {
    families[box.value].forEach((type) => monitor.enabled.add(type));
  }
}
document.querySelector('.filters').addEventListener('change', applyFilters);
applyFilters();

// La página de prueba: el enlace y el formulario cancelan su acción.
document.querySelector('#terms').addEventListener('click', (event) => event.preventDefault());
demo.addEventListener('submit', (event) => event.preventDefault());
logLine('Listo: pulsa «Condiciones», la casilla de «Novedades» y «Enviar»; luego escribe en el correo');

// El orden de las líneas es el orden en que empezó cada evento. Fíjate en
// que un clic en el botón de envío dispara click y DESPUÉS submit, y en que
// marcar la casilla da click, input y change.
```
