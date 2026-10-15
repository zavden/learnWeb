---
example_description: "Registrar la misma función dos veces la registra UNA sola; pero una flecha escrita dentro de una función de render es nueva cada vez: tras tres renders, un clic se atiende tres veces"
example_tags: "javascript|eventos|addeventlistener|duplicados|render|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Precios del día</h1>
  <p>La función <code>render()</code> se ejecutó 3 veces al cargar (una por producto recibido).</p>
  <p class="actions">
    <button id="refresh-buggy" type="button">Actualizar (🐛 flecha)</button>
    <button id="refresh-fixed" type="button">Actualizar (✅ con nombre)</button>
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
const buggyButton = document.querySelector('#refresh-buggy');
const fixedButton = document.querySelector('#refresh-fixed');
const logList = document.querySelector('#log');
const products = [];
let requests = 0;
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

function refreshPrices() {
  requests += 1;
  logLine(`✅ petición ${requests}: precios de ${products.length} productos`);
}

function render() {
  // 🐛 Una flecha escrita aquí es una función NUEVA en cada render: el botón
  //    acumula un listener más cada vez que se pinta la lista.
  buggyButton.addEventListener('click', () => {
    requests += 1;
    logLine(`🐛 petición ${requests}: precios de ${products.length} productos`);
  });
  // ✅ La MISMA función (mismo tipo y misma fase) se registra una sola vez:
  //    las llamadas repetidas a addEventListener no hacen nada.
  fixedButton.addEventListener('click', refreshPrices);
}

for (const product of ['café', 'cacao', 'vainilla']) {
  products.push(product);
  render();
}
logLine('Listo: pulsa cada botón una vez');

// Mejor aún: registra los listeners UNA vez, fuera de render(), y deja que
// render() solo cambie lo que se ve. En la lección «Delegación» verás cómo
// escuchar una lista entera con un solo listener.
```
