---
example_description: "Slots en un shadow DOM declarativo (<template shadowrootmode>, creado por el parser sin JavaScript): slot con nombre, slot por defecto, contenido de reserva, assignedElements() y slotchange; ::slotted() solo alcanza a los hijos directos del host, no al <li> dentro del <ul>"
example_tags: "javascript|web-components|shadow-dom|slot|shadowrootmode|slotted|slotchange"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Recetario</h1>
  <recipe-card id="lime-soup">
    <!-- Shadow DOM declarativo: el parser crea el shadow root con esto. -->
    <template shadowrootmode="open">
      <style>
        :host {
          display: block;
          overflow: hidden;
          border: 1px solid #cbd2d9;
          border-radius: 0.5rem;
          background: #ffffff;
        }
        header {
          padding: 0.5rem 1rem;
          background: #fdf6e3;
        }
        .body {
          padding: 0.25rem 1rem 0.75rem;
        }
        .fallback {
          color: #52606d;
          font-style: italic;
        }
        ::slotted(h2) {
          margin: 0;
          font-size: 1.1rem;
        }
        ::slotted(ul) {
          color: #15803d;
        }
        /* No hace nada: el <li> no es hijo directo de <recipe-card>. */
        ::slotted(li) {
          color: #b91c1c;
        }
      </style>
      <header><slot name="title">Receta sin título</slot></header>
      <div class="body">
        <slot name="meta"><p class="fallback">Sin tiempo ni porciones</p></slot>
        <slot></slot>
      </div>
    </template>
    <!-- Contenido «de luz»: lo escribe la página y se proyecta en los slots. -->
    <h2 slot="title">Sopa de lima</h2>
    <ul>
      <li>1 l de caldo de pollo</li>
      <li>4 limas de Yucatán</li>
      <li>Tiras de tortilla frita</li>
    </ul>
    <p>Sirve con aguacate y chile habanero al gusto.</p>
  </recipe-card>
  <p><button id="toggle-meta" type="button">Añadir tiempo y porciones</button></p>
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
  margin: 0 0 0.5rem;
}
button {
  font: inherit;
  padding: 0.3rem 0.7rem;
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
const card = document.querySelector('#lime-soup');
const toggleButton = document.querySelector('#toggle-meta');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
function describeSlot(slot) {
  const label = slot.name ? `slot «${slot.name}»` : 'slot por defecto';
  const assigned = slot.assignedElements(); // los elementos proyectados en él
  const content = assigned.length > 0
    ? assigned.map((element) => element.localName).join(', ')
    : 'vacío: se ve su contenido de reserva';
  return `${label} → ${content}`;
}

// Ningún script ha llamado a attachShadow: el shadow root viene del HTML.
logLine(`shadowRoot → ${card.shadowRoot.mode} (lo creó el parser: shadow DOM declarativo)`);
logLine(`¿queda el <template> en el DOM? → ${card.querySelector('template') !== null}`);
for (const slot of card.shadowRoot.querySelectorAll('slot')) logLine(describeSlot(slot));

const color = (element) => getComputedStyle(element).color;
logLine(`::slotted(ul) → ${color(card.querySelector('ul'))}`);
logLine(`::slotted(li) → no se aplica: el li sale ${color(card.querySelector('li'))}, heredado del ul`);

// slotchange avisa cuando cambia lo que se proyecta en un slot.
card.shadowRoot.addEventListener('slotchange', (event) => {
  logLine(`slotchange → ${describeSlot(event.target)}`);
});

let meta = null;
toggleButton.addEventListener('click', () => {
  if (meta) {
    meta.remove();
    meta = null;
    toggleButton.textContent = 'Añadir tiempo y porciones';
    return;
  }
  meta = document.createElement('p');
  meta.slot = 'meta'; // el atributo slot elige el hueco
  meta.textContent = '⏱ 45 min · 4 porciones';
  card.append(meta);
  toggleButton.textContent = 'Quitar tiempo y porciones';
});
logLine('Listo: pulsa «Añadir tiempo y porciones»');
```
