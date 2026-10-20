---
example_description: "El evento termina su viaje antes de que vuelva un await: después, event.currentTarget es null y composedPath() está vacío (target se conserva); hay que guardar el elemento en una variable antes de esperar"
example_tags: "javascript|eventos|currenttarget|composedpath|async|await|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Receta: pozole rojo</h1>
  <p class="actions">
    <button id="save-buggy" type="button">Guardar (🐛)</button>
    <button id="save-fixed" type="button">Guardar (✅)</button>
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
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
// Simula una petición al servidor que tarda 300 ms.
const saveRecipe = () => new Promise((resolve) => setTimeout(resolve, 300));

document.querySelector('#save-buggy').addEventListener('click', async (event) => {
  logLine(`antes del await → currentTarget: #${event.currentTarget.id} · camino: ${event.composedPath().length} nodos`);
  await saveRecipe();
  // 🐛 El viaje del evento terminó hace 300 ms: el navegador ya limpió
  //    currentTarget (null) y el camino. target sí se conserva.
  logLine(`después → currentTarget: ${event.currentTarget} · camino: ${event.composedPath().length} nodos · target: #${event.target.id}`);
  try {
    event.currentTarget.textContent = '✓ Guardado';
  } catch (error) {
    logLine(`🐛 ${error.name}: ${error.message}`);
  }
});

document.querySelector('#save-fixed').addEventListener('click', async (event) => {
  const button = event.currentTarget; // ✅ guárdalo ANTES de esperar
  button.disabled = true;
  await saveRecipe();
  button.textContent = '✓ Guardado';
  logLine('✅ guardado: el botón se guardó en una variable antes del await');
});
logLine('Listo: pulsa los dos botones');

// composedPath() devuelve el camino del evento (button, p, main, body, html,
// document y window: 7 nodos) solo MIENTRAS se entrega. Lo mismo pasa si lees el
// evento en un setTimeout o en un then. Tampoco sirve llamar a
// preventDefault() después de un await (lección «Eventos personalizados»).
```
