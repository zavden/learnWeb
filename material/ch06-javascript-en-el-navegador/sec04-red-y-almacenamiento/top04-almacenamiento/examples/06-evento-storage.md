---
example_description: "El evento storage avisa a las DEMÁS pestañas del mismo origen cuando una cambia localStorage (key, oldValue, newValue): un carrito que se mantiene igual en dos pestañas. La pestaña que hace el cambio no recibe el evento"
example_tags: "javascript|localstorage|evento-storage|pestanas|sincronizar"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Tu carrito</h1>
  <p class="cart">☕ Café de Chiapas · 500 g × <output id="units">0</output></p>
  <p class="actions">
    <button id="add" type="button">Añadir uno</button>
    <button id="empty" type="button">Vaciar</button>
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
.cart {
  padding: 0.5rem 0.75rem;
  border-left: 4px solid #1d4ed8;
  background: #ffffff;
}
output {
  font-weight: 700;
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
const CART_KEY = 'lw-almacen-carrito-unidades';
const unitsOutput = document.querySelector('#units');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const readUnits = () => Number(localStorage.getItem(CART_KEY) ?? 0);
const show = () => { unitsOutput.textContent = readUnits(); };

document.querySelector('#add').addEventListener('click', () => {
  localStorage.setItem(CART_KEY, String(readUnits() + 1));
  show();
  logLine(`🛒 aquí: ${readUnits()} (esta pestaña no recibe «storage»)`);
});
document.querySelector('#empty').addEventListener('click', () => {
  localStorage.removeItem(CART_KEY);
  show();
  logLine('🗑️ aquí: carrito vacío');
});

// «storage» llega a las OTRAS pestañas (y vistas previas) del mismo origen.
window.addEventListener('storage', (event) => {
  if (event.key !== CART_KEY && event.key !== null) return; // otras claves: no son nuestras
  show();
  logLine(`📨 storage desde otra pestaña: ${event.oldValue ?? '(nada)'} → ${event.newValue ?? '(nada)'}`);
});

show();
logLine('Listo: abre este ejemplo con ↗ y pulsa «Añadir uno» en la pestaña nueva; los avisos llegan aquí');

// event.key es null cuando alguien llama a localStorage.clear(). El evento
// también existe para sessionStorage, pero solo entre iframes de la MISMA
// pestaña. En una tarjeta de la teoría (almacenamiento en memoria) no llega.
```
