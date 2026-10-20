---
example_description: "Una ruta con barra (…/carrito) creada con pushState funciona mientras la página está abierta, pero al recargar o compartir el enlace el navegador pide /carrito al servidor, que no lo conoce: 404. Se comprueba con fetch(location.href); las rutas con query o con # no tienen el problema"
example_tags: "javascript|history|pushstate|router|servidor|404|spa|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>¿Sobrevive la ruta a una recarga?</h1>
  <p>Al cargar, la página prueba tres formas de escribir la ruta «carrito» y pregunta al servidor qué contestaría si recargaras.</p>
  <p class="actions">
    <button id="go" type="button">Cambiar la dirección a …/carrito</button>
    <button id="back" type="button" disabled>← Atrás</button>
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
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
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
const backButton = document.querySelector('#back');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
// Solo el final de la dirección: el resto cambia en cada ejecución.
const tail = () => `…/${location.pathname.split('/').pop()}${location.search}${location.hash}`;

// Cambia la dirección SIN pedir nada (replaceState), pide al servidor lo que
// pediría una recarga (fetch descarta el #fragmento, como el navegador) y
// deja la dirección como estaba.
async function reloadWouldGet(route) {
  const original = location.href;
  history.replaceState(history.state, '', route);
  const shown = tail();
  try {
    const response = await fetch(location.href);
    const type = response.headers.get('content-type').split(';')[0];
    logLine(`${response.ok ? '✅' : '🐛'} ${shown} → al recargar: ${response.status} ${type}`);
  } finally {
    history.replaceState(history.state, '', original);
  }
}

try {
  await reloadWouldGet('carrito');                 // 🐛 ruta con barra
  await reloadWouldGet('index.html?vista=carrito'); // ✅ ruta en la query
  await reloadWouldGet('#/carrito');               // ✅ ruta con #
  logLine(`dirección restaurada → ${tail()}`);
} catch (error) {
  logLine(`⚠️ ${error.name}: esta tarjeta es un iframe aislado (origen null); ábrela con ▶ o en el editor`);
}

// Para verlo de verdad: abre el ejemplo con ↗, pulsa el botón y recarga (⌘R).
document.querySelector('#go').addEventListener('click', () => {
  try {
    history.pushState({ depth: 1 }, '', 'carrito');
  } catch (error) {
    logLine(`⚠️ ${error.name}: ábrela con ▶ o en el editor`);
    return;
  }
  backButton.disabled = false;
  logLine(`➡️ pushState → ${tail()}: la página sigue igual. Recarga ahora (⌘R en la pestaña de ↗)`);
});
backButton.addEventListener('click', () => history.back());
window.addEventListener('popstate', () => {
  backButton.disabled = true;
  logLine(`⬅️ de vuelta en ${tail()}`);
});
logLine('Listo: para la prueba real, abre el ejemplo con ↗, pulsa «Cambiar la dirección a …/carrito» y recarga');

// pushState solo cambia la barra de direcciones. Una recarga, un enlace
// compartido o abrir en otra pestaña PIDEN esa dirección al servidor, y aquí
// el servidor de LearnWeb busca un archivo «carrito» en assets/: 404.
```
