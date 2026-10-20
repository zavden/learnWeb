---
example_description: "preventDefault() en el clic de un enlace: el navegador no navega y la ficha del producto se muestra en la misma página; con Cmd/Ctrl/Shift pulsada se deja actuar al navegador (abrir en otra pestaña)"
example_tags: "javascript|eventos|preventdefault|enlaces|defaultprevented|cancelable"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Catálogo</h1>
  <ul id="catalog" class="catalog">
    <li><a href="/productos/cafe-de-chiapas" data-product="Café de Chiapas 500 g · $210.00 · tueste medio">Café de Chiapas</a></li>
    <li><a href="/productos/cacao-de-tabasco" data-product="Cacao de Tabasco 250 g · $145.00 · 70 % cacao">Cacao de Tabasco</a></li>
  </ul>
  <p id="detail" class="detail" aria-live="polite">Elige un producto.</p>
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
a {
  color: #1d4ed8;
}
a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.detail {
  padding: 0.5rem 0.75rem;
  border-left: 4px solid #1d4ed8;
  background: #ffffff;
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
const catalog = document.querySelector('#catalog');
const detail = document.querySelector('#detail');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

catalog.addEventListener('click', (event) => {
  const link = event.target.closest('a[data-product]');
  if (!link) return;
  // Cmd/Ctrl + clic = «ábrelo en otra pestaña»; Shift = otra ventana. Es una
  // decisión del usuario: no la impidas. (Aquí la ruta es inventada, así que
  // esa pestaña mostraría «no encontrado».)
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    logLine('↗ con tecla modificadora: dejo actuar al navegador');
    return;
  }
  logLine(`cancelable → ${event.cancelable} · defaultPrevented → ${event.defaultPrevented}`);
  event.preventDefault(); // ← no sigas el enlace
  logLine(`tras preventDefault() → defaultPrevented: ${event.defaultPrevented}`);
  detail.textContent = link.dataset.product;
  logLine(`📦 ficha de «${link.textContent}» sin salir de la página`);
});
logLine('Listo: pulsa «Café de Chiapas» (con el ratón o con Tab y Enter)');

// La acción por defecto de un clic en un enlace es navegar a su href. Se
// decide DESPUÉS de los listeners: si alguno llamó a preventDefault(), el
// navegador no navega. El enlace sigue siendo un enlace de verdad (se puede
// copiar, abrir en otra pestaña, lo entienden los buscadores); el JS solo
// mejora la experiencia. Para cambiar también la URL, history.pushState
// (módulo «Red y almacenamiento»).
```
