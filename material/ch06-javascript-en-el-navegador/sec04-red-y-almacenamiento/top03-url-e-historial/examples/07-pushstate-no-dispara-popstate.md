---
example_description: "Un router que solo pinta en popstate: al pulsar un enlace, pushState cambia la dirección pero la vista no cambia, porque popstate solo salta al recorrer el historial (atrás/adelante), nunca con pushState ni replaceState. El arreglo: pintar justo después de pushState"
example_tags: "javascript|history|pushstate|popstate|router|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Mi tienda</h1>
  <nav id="views" aria-label="Vistas">
    <a href="?vista=catalogo">Catálogo</a>
    <a href="?vista=carrito">Carrito</a>
    <a href="?vista=cuenta">Mi cuenta</a>
  </nav>
  <p class="actions">
    <label><input id="render-after-push" type="checkbox"> Pintar después de pushState (el arreglo)</label>
    <button id="back" type="button">← Atrás</button>
  </p>
  <h2 id="view-title">Catálogo</h2>
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
  padding: 0.5rem 0.75rem;
  border-left: 4px solid #1d4ed8;
  background: #ffffff;
}
nav {
  display: flex;
  gap: 1rem;
}
a {
  color: #1d4ed8;
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
const TITLES = { catalogo: 'Catálogo', carrito: 'Carrito', cuenta: 'Mi cuenta' };
const viewTitle = document.querySelector('#view-title');
const fixBox = document.querySelector('#render-after-push');
const backButton = document.querySelector('#back');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

function viewOf(url) {
  const view = url.searchParams.get('vista');
  return Object.hasOwn(TITLES, view) ? view : 'catalogo';
}
function render() {
  viewTitle.textContent = TITLES[viewOf(new URL(location.href))];
  backButton.disabled = (history.state?.depth ?? 0) === 0;
}

// 🐛 El router «escucha la URL» solo con popstate…
window.addEventListener('popstate', () => {
  render();
  logLine(`⬅️ popstate → ${location.search || '(sin query)'}: pinto «${viewTitle.textContent}»`);
});

document.querySelector('#views').addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
  event.preventDefault();
  const next = new URL(link.href);
  try {
    history.pushState({ depth: (history.state?.depth ?? 0) + 1 }, '', next);
  } catch (error) {
    logLine(`⚠️ ${error.name}: esta tarjeta es un iframe aislado (origen null); ábrela con ▶ o en el editor`);
    return;
  }
  logLine(`➡️ pushState → ${next.search}`);
  if (fixBox.checked) {
    render(); // ✅ quien cambia la URL, pinta
    logLine(`✅ pinto «${viewTitle.textContent}» yo mismo`);
    return;
  }
  // …y pushState NO dispara popstate: nadie pinta. Lo comprobamos un poco después.
  setTimeout(() => {
    logLine(`🐛 la dirección dice «${viewOf(next)}», pero la vista sigue en «${viewTitle.textContent}»: popstate no saltó`);
  }, 50);
});
backButton.addEventListener('click', () => history.back());

try {
  history.replaceState({ depth: 0 }, '', location.href);
} catch (error) {
  logLine(`⚠️ ${error.name}: esta tarjeta es un iframe aislado (origen null); ábrela con ▶ o en el editor`);
}
render();
logLine('Listo: pulsa «Carrito» sin marcar la casilla; luego márcala, pulsa «Mi cuenta» y prueba «← Atrás»');

// popstate significa «el usuario se movió por el historial» (atrás, adelante,
// history.back(), history.go(n)). Los cambios que haces TÚ con pushState o
// replaceState no lo disparan: ya sabes que los hiciste, así que pinta tú.
```
