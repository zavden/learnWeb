---
example_description: "Cambiar la dirección sin recargar: pushState añade una entrada al historial (cambiar de categoría), replaceState sustituye la actual (un filtro) y popstate avisa cuando el usuario vuelve atrás o adelante; la página se pinta siempre desde la URL. Un «← Atrás» propio que nunca sale de la página"
example_tags: "javascript|history|pushstate|replacestate|popstate|url|spa"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Tienda de la sierra</h1>
  <nav id="categories" aria-label="Categorías">
    <a href="?categoria=cafe">Cafés</a>
    <a href="?categoria=cacao">Cacaos</a>
    <a href="?categoria=cajeta">Cajetas</a>
  </nav>
  <p class="actions">
    <label><input id="free-shipping" type="checkbox"> Solo con envío gratis</label>
    <button id="back" type="button">← Atrás</button>
  </p>
  <h2 id="title">Cafés</h2>
  <ul id="products"></ul>
  <p>Query de la dirección: <output id="address"></output></p>
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
h2 {
  font-size: 1.05rem;
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
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
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
input:focus-visible,
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
output {
  font-family: Menlo, Consolas, monospace;
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
const CATALOG = {
  cafe: { title: 'Cafés', items: [['Café de Chiapas · 500 g', true], ['Café de Veracruz · 250 g', false]] },
  cacao: { title: 'Cacaos', items: [['Cacao de Tabasco · 250 g', false], ['Chocolate de metate', true]] },
  cajeta: { title: 'Cajetas', items: [['Cajeta de Celaya · 370 g', true], ['Cajeta envinada', false]] },
};
const freeShipping = document.querySelector('#free-shipping');
const backButton = document.querySelector('#back');
const logList = document.querySelector('#log');
let currentUrl = new URL(location.href); // la URL que está pintada
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// La página se pinta SIEMPRE a partir de una URL: lo que se ve = lo que dice la dirección.
function render(url) {
  currentUrl = url;
  const requested = url.searchParams.get('categoria');
  const category = Object.hasOwn(CATALOG, requested) ? requested : 'cafe';
  const freeOnly = url.searchParams.get('envio') === 'gratis';
  document.querySelector('#title').textContent = CATALOG[category].title;
  const items = CATALOG[category].items.filter(([, free]) => free || !freeOnly);
  document.querySelector('#products').replaceChildren(...items.map(([itemName, free]) =>
    Object.assign(document.createElement('li'), { textContent: free ? `${itemName} · envío gratis` : itemName })));
  freeShipping.checked = freeOnly;
  for (const link of document.querySelectorAll('#categories a')) {
    if (new URL(link.href).searchParams.get('categoria') === category) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  document.querySelector('#address').textContent = url.search || '(sin query)';
  backButton.disabled = (history.state?.depth ?? 0) === 0; // ← nunca sale de esta página
}

// pushState/replaceState(estado, '', url). En una tarjeta (iframe aislado) lanzan SecurityError.
function changeUrl(method, url) {
  try {
    const depth = history.state?.depth ?? 0;
    history[method]({ depth: method === 'pushState' ? depth + 1 : depth }, '', url);
    return true;
  } catch (error) {
    logLine(`⚠️ ${error.name}: esta tarjeta es un iframe aislado (origen null); ábrela con ▶ o en el editor`);
    return false;
  }
}

document.querySelector('#categories').addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return; // ⌘/Ctrl + clic: otra pestaña
  event.preventDefault();
  const next = new URL(link.href);
  if (freeShipping.checked) next.searchParams.set('envio', 'gratis');
  if (changeUrl('pushState', next)) logLine(`➡️ pushState → ${next.search} (entrada nueva)`);
  render(next);
});

freeShipping.addEventListener('change', () => {
  const next = new URL(currentUrl);
  if (freeShipping.checked) next.searchParams.set('envio', 'gratis');
  else next.searchParams.delete('envio');
  if (changeUrl('replaceState', next)) logLine(`🔁 replaceState → ${next.search || '(sin query)'} (sin entrada nueva)`);
  render(next);
});

// popstate: el usuario recorrió el historial (← Atrás, el botón del navegador, ⌘[).
window.addEventListener('popstate', (event) => {
  logLine(`⬅️ popstate → ${location.search || '(sin query)'} · state.depth: ${event.state?.depth ?? 0}`);
  render(new URL(location.href));
});
backButton.addEventListener('click', () => history.back());

changeUrl('replaceState', location.href); // marca la entrada inicial con depth 0
render(new URL(location.href));
logLine('Listo: pulsa «Cacaos» y «Cajetas», marca «Solo con envío gratis» y vuelve con «← Atrás»');

// La vista previa es un iframe: su historial se mezcla con el de la pestaña
// de LearnWeb. Por eso «← Atrás» se desactiva en la primera entrada.
```
