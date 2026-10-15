---
example_description: "closest no se detiene en el contenedor que escucha: un clic en el hueco entre dos productos encuentra el .item del panel que envuelve a la lista y lo tacha entero; comprobar list.contains(item) lo evita"
example_tags: "javascript|eventos|delegacion|closest|contains|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <ul class="dashboard">
    <li class="item panel" data-name="Panel de la lista de la compra">
      <h1>Lista de la compra</h1>
      <ul id="shopping" class="shopping">
        <li class="item" data-name="Tortillas"><button type="button">Tortillas de maíz</button></li>
        <li class="item" data-name="Aguacates"><button type="button">Aguacates (3)</button></li>
        <li class="item" data-name="Queso"><button type="button">Queso Oaxaca</button></li>
      </ul>
      <label><input type="checkbox" id="check-contains"> Comprobar <code>shopping.contains(item)</code> (✅)</label>
    </li>
  </ul>
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
  font-size: 1.1rem;
  margin: 0 0 0.5rem;
}
.dashboard {
  margin: 0;
  padding: 0;
  list-style: none;
}
.panel {
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
/* Mucho hueco entre productos: ahí el target es la propia lista. */
.shopping {
  display: grid;
  gap: 1rem;
  margin: 0 0 0.75rem;
  padding: 0.75rem;
  list-style: none;
  border: 2px dashed #7b8794;
  border-radius: 0.5rem;
}
.item.bought,
.item.bought button {
  color: #52606d;
  text-decoration: line-through;
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
const shopping = document.querySelector('#shopping');
const checkContains = document.querySelector('#check-contains');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// Pulsar un producto lo marca como comprado (o lo desmarca).
shopping.addEventListener('click', (event) => {
  const item = event.target.closest('.item');
  // 🐛 closest sube por TODO el documento, no solo dentro de la lista. Desde
  //    el hueco entre productos (target = la lista) encuentra el .item del
  //    PANEL que envuelve a la lista.
  if (!item) return;
  // ✅ Asegúrate de que lo encontrado está DENTRO del contenedor que escucha.
  if (checkContains.checked && !shopping.contains(item)) {
    logLine(`✅ clic en el hueco (target: ${event.target.tagName}#${event.target.id}): ignorado`);
    return;
  }
  item.classList.toggle('bought');
  const mark = shopping.contains(item) ? '🛒' : '🐛';
  logLine(`${mark} comprado → «${item.dataset.name}»: ${item.classList.contains('bought')}`);
});
logLine('Listo: pulsa «Aguacates»; luego, el hueco entre dos productos (con y sin la casilla)');

// Otra forma: un selector que no pueda escaparse, como
// event.target.closest('#shopping > .item'), o no reutilizar nombres de
// clase entre la lista y lo que la rodea.
```
