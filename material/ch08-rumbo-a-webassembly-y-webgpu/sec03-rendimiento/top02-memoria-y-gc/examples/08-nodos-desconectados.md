---
example_description: "Nodos desconectados (detached): una lista de notificaciones que muestra las 5 últimas quita las viejas del DOM, pero un Map id → elemento las sigue apuntando: tras 200 notificaciones hay 195 <li> fuera de la página que el recolector no puede liberar. Borrar la entrada al quitar el nodo, o un WeakMap elemento → datos, lo evita"
example_tags: "javascript|memoria|fugas|dom|detached|map|weakmap|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Notificaciones</h1>
  <div class="columns">
    <section aria-labelledby="buggy-title">
      <h2 id="buggy-title">🐛 Map id → elemento</h2>
      <ul id="buggy-list" class="list"></ul>
    </section>
    <section aria-labelledby="fixed-title">
      <h2 id="fixed-title">✅ Se borra al quitar</h2>
      <ul id="fixed-list" class="list"></ul>
    </section>
  </div>
  <p class="actions">
    <button id="more" type="button">Llegan 50 más</button>
    <button id="clean" type="button">Limpiar el Map 🐛</button>
  </p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
h2 { font-size: 0.95rem; margin: 0 0 0.25rem; }
.columns { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.actions { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0; }
.list { margin: 0 0 0.75rem; padding: 0.4rem 0.4rem 0.4rem 1.4rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-size: 0.85rem; }
button { font: inherit; padding: 0.3rem 0.7rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; cursor: pointer; }
button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
const VISIBLE = 5;
const buggyList = document.querySelector('#buggy-list');
const fixedList = document.querySelector('#fixed-list');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const products = ['café de olla', 'pan de muerto', 'mole poblano', 'cajeta', 'tamales'];
function createItem(id) {
  return Object.assign(document.createElement('li'), { textContent: `#${id} · bajó de precio: ${products[id % products.length]}` });
}

// 🐛 El Map sirve para marcar una notificación como leída por su id… y apunta a TODOS los
//    elementos que se han creado, también a los que ya salieron de la página.
const buggyElements = new Map();
function notifyBuggy(id) {
  const item = createItem(id);
  buggyElements.set(id, item);
  buggyList.prepend(item);
  if (buggyList.children.length > VISIBLE) buggyList.lastElementChild.remove(); // sale del DOM, no del Map
}

// ✅ La misma lista, pero al quitar un elemento se borra también su entrada.
//    (Otra opción: no guardar elementos, sino ids, y buscar con querySelector cuando haga falta;
//    o un WeakMap elemento → datos, que no retiene al elemento.)
const fixedElements = new Map();
function notifyFixed(id) {
  const item = createItem(id);
  item.dataset.id = String(id);
  fixedElements.set(id, item);
  fixedList.prepend(item);
  if (fixedList.children.length > VISIBLE) {
    const oldest = fixedList.lastElementChild;
    oldest.remove();
    fixedElements.delete(Number(oldest.dataset.id));
  }
}

let nextId = 1;
function receive(count) {
  for (let i = 0; i < count; i++) {
    notifyBuggy(nextId);
    notifyFixed(nextId);
    nextId += 1;
  }
}
function reportCounts() {
  const detached = [...buggyElements.values()].filter((item) => !item.isConnected).length;
  logLine(`🐛 elementos en el Map: ${buggyElements.size} · en la página: ${buggyList.children.length} · desconectados: ${detached}`);
  logLine(`✅ elementos en el Map: ${fixedElements.size} · en la página: ${fixedList.children.length} · desconectados: ${[...fixedElements.values()].filter((item) => !item.isConnected).length}`);
}

receive(200);
logLine('tras 200 notificaciones:');
reportCounts();
console.log('Listo: pulsa «Llegan 50 más» y después «Limpiar el Map 🐛»');
const moreButton = document.querySelector('#more');
moreButton.addEventListener('click', () => {
  receive(50);
  moreButton.disabled = nextId > 1000; // límite de la demostración: 1000 notificaciones
  logLine(`tras ${nextId - 1} notificaciones:`);
  reportCounts();
});
document.querySelector('#clean').addEventListener('click', () => {
  for (const [id, item] of buggyElements) if (!item.isConnected) buggyElements.delete(id);
  logLine('🧹 borradas del Map las entradas de elementos que ya no están en la página:');
  reportCounts();
});

// Para verlo en DevTools (con ↗): Memory › Heap snapshot, y escribe «Detached» en el filtro de
// clases. Cada <li> desconectado sale como un elemento «Detached»; en «Retainers» se ve que lo
// sujeta el Map. Un nodo desconectado retiene además a todos sus hijos y a sus listeners.
```
