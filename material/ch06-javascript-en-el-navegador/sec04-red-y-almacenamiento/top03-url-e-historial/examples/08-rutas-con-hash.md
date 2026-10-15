---
example_description: "Rutas con fragmento (#/pasos): los enlaces normales cambian location.hash, crean una entrada en el historial y disparan hashchange (también al volver atrás); el servidor nunca ve el fragmento, así que recargar siempre funciona. Sin pushState ni preventDefault"
example_tags: "javascript|hashchange|location-hash|router|historial"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Mole poblano</h1>
  <nav id="tabs" aria-label="Partes de la receta">
    <a href="#/ingredientes">Ingredientes</a>
    <a href="#/pasos">Pasos</a>
    <a href="#/notas">Notas</a>
  </nav>
  <p class="actions"><button id="back" type="button">← Atrás</button></p>
  <section class="panel">
    <h2 id="title">Ingredientes</h2>
    <p id="text"></p>
  </section>
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
nav {
  display: flex;
  gap: 1rem;
}
a {
  color: #1d4ed8;
}
a[aria-current="page"] {
  font-weight: 700;
  text-decoration-thickness: 3px;
}
.panel {
  padding: 0.25rem 0.75rem;
  border-left: 4px solid #1d4ed8;
  background: #ffffff;
}
.panel h2 {
  font-size: 1.05rem;
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
button:disabled {
  color: #616e7c;
  cursor: not-allowed;
}
a:focus-visible,
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
const SECTIONS = {
  '#/ingredientes': ['Ingredientes', 'Chiles mulato, ancho y pasilla, chocolate de metate, ajonjolí, plátano macho y caldo de pollo.'],
  '#/pasos': ['Pasos', 'Tuesta y remoja los chiles, muele con las especias, fríe la pasta y aclara con caldo a fuego lento.'],
  '#/notas': ['Notas', 'Mejor de un día para otro: el mole asienta y se espesa en el refrigerador.'],
};
const backButton = document.querySelector('#back');
const logList = document.querySelector('#log');
let depthShown = 0; // profundidad de la entrada que se está viendo
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

function render() {
  const route = Object.hasOwn(SECTIONS, location.hash) ? location.hash : '#/ingredientes';
  const [title, text] = SECTIONS[route];
  document.querySelector('#title').textContent = title;
  document.querySelector('#text').textContent = text;
  for (const link of document.querySelectorAll('#tabs a')) {
    if (link.getAttribute('href') === route) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  backButton.disabled = (history.state?.depth ?? 0) === 0;
}

// hashchange salta cuando cambia el fragmento: con un enlace, con
// location.hash = '…' y también al volver atrás o adelante.
window.addEventListener('hashchange', (event) => {
  const before = new URL(event.oldURL).hash;
  // Una entrada nueva (un enlace) llega sin estado: le apuntamos su profundidad
  // para que «← Atrás» sepa cuándo parar.
  try {
    if (history.state === null) history.replaceState({ depth: depthShown + 1 }, '');
    depthShown = history.state.depth;
  } catch {
    // tarjeta aislada: sin historial propio («← Atrás» queda desactivado)
  }
  logLine(`#️⃣ hashchange: ${before} → ${location.hash}`);
  render();
});
backButton.addEventListener('click', () => history.back());

try {
  // Sin fragmento, la receta empieza en #/ingredientes (sin entrada nueva).
  history.replaceState({ depth: 0 }, '', location.hash || '#/ingredientes');
} catch (error) {
  logLine(`⚠️ ${error.name}: esta tarjeta es un iframe aislado (origen null); ábrela con ▶ o en el editor`);
}
render();
logLine('Listo: pulsa «Pasos» y «Notas», y vuelve con «← Atrás»');

// Los enlaces son enlaces normales: ni preventDefault ni pushState. Y como el
// navegador nunca envía el fragmento al servidor, recargar …/index.html#/pasos
// siempre funciona (el servidor solo ve …/index.html).
```
