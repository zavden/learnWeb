---
example_description: "Sin preventDefault() en dragover, la zona no admite soltar: el cursor muestra 🚫 y el evento drop no se dispara nunca, aunque haya un listener de drop perfecto; al cargar, una simulación hace lo mismo que el navegador con las dos zonas"
example_tags: "javascript|drag-and-drop|dragover|preventdefault|drop|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Arma tu pedido</h1>
  <ul class="products">
    <li draggable="true" data-product="Café de Chiapas">☕ Café de Chiapas <button type="button">Añadir</button></li>
    <li draggable="true" data-product="Pan de muerto">🍞 Pan de muerto <button type="button">Añadir</button></li>
  </ul>
  <div class="zones">
    <section id="zone-buggy" class="zone" aria-label="Pedido 🐛"><h2>🐛 Sin preventDefault</h2><ul class="items"></ul></section>
    <section id="zone-fixed" class="zone" aria-label="Pedido ✅"><h2>✅ Con preventDefault</h2><ul class="items"></ul></section>
  </div>
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
.products {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0 0 0.75rem;
  padding: 0;
  list-style: none;
}
.products li {
  padding: 0.35rem 0.6rem;
  border-radius: 0.375rem;
  background: #ffffff;
  cursor: grab;
}
.zones {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.zone {
  min-height: 6rem;
  padding: 0.4rem 0.6rem;
  border: 2px dashed #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
}
.zone h2 {
  margin: 0;
  font-size: 0.9rem;
}
.items {
  margin: 0.25rem 0 0;
  padding-left: 1.2rem;
}
button {
  font: inherit;
  font-size: 0.85rem;
  padding: 0.1rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 1px;
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
const zoneBuggy = document.querySelector('#zone-buggy');
const zoneFixed = document.querySelector('#zone-fixed');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
function addToOrder(zone, product) {
  const item = document.createElement('li');
  item.textContent = product;
  zone.querySelector('.items').append(item);
}

let warned = false; // dragover llega decenas de veces por segundo: avisa una vez
document.querySelector('.products').addEventListener('dragstart', (event) => {
  event.dataTransfer.setData('text/plain', event.target.dataset.product);
  warned = false;
});

// 🐛 Escucha dragover, pero no lo cancela: para el navegador, esta zona no
//    admite soltar. El listener de drop está bien… y nunca se ejecuta.
zoneBuggy.addEventListener('dragover', () => {
  if (!warned) logLine('🐛 dragover sin preventDefault → la zona no acepta: no habrá drop');
  warned = true;
});
zoneBuggy.addEventListener('drop', (event) => {
  addToOrder(zoneBuggy, event.dataTransfer.getData('text/plain'));
  logLine('🐛 drop (con un arrastre real, esta línea no sale nunca)');
});

// ✅ preventDefault() en dragover dice «aquí sí se puede soltar».
zoneFixed.addEventListener('dragover', (event) => {
  event.preventDefault();
});
zoneFixed.addEventListener('drop', (event) => {
  event.preventDefault(); // y en drop, que el navegador no intente abrir lo soltado
  const product = event.dataTransfer.getData('text/plain');
  addToOrder(zoneFixed, product);
  logLine(`✅ drop → ${product} añadido al pedido`);
});

// Alternativa de teclado: el botón añade al pedido ✅.
document.querySelector('.products').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const product = button.closest('li').dataset.product;
  addToOrder(zoneFixed, product);
  logLine(`✅ botón → ${product} añadido al pedido`);
});

// Lo que hace el navegador con un arrastre real, resumido: dispara dragover
// en la zona y, solo si alguien lo canceló (dispatchEvent devuelve false),
// dispara drop al soltar.
function simulateDrag(productItem, zone) {
  const data = new DataTransfer();
  productItem.dispatchEvent(new DragEvent('dragstart', { dataTransfer: data, bubbles: true }));
  const accepted = !zone.dispatchEvent(new DragEvent('dragover', { dataTransfer: data, bubbles: true, cancelable: true }));
  if (accepted) zone.dispatchEvent(new DragEvent('drop', { dataTransfer: data, bubbles: true, cancelable: true }));
}
logLine('— simulado: arrastrar «Café de Chiapas» a cada zona —');
const coffee = document.querySelector('[data-product="Café de Chiapas"]');
simulateDrag(coffee, zoneBuggy);
simulateDrag(coffee, zoneFixed);
logLine('Listo: arrastra los productos a las dos zonas (o usa «Añadir»)');
```
