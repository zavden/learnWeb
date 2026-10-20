---
example_description: "Delegación: un solo listener en la lista atiende los botones «Quitar» de todos sus productos; closest sube desde target hasta el botón y desde el botón hasta su <li>"
example_tags: "javascript|eventos|delegacion|closest|burbuja|lista"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Lista de la compra</h1>
  <ul id="shopping" class="shopping">
    <li data-name="Tortillas">Tortillas de maíz <button type="button" data-action="remove">Quitar</button></li>
    <li data-name="Aguacates">Aguacates (3) <button type="button" data-action="remove">Quitar</button></li>
    <li data-name="Queso">Queso Oaxaca <button type="button" data-action="remove">Quitar</button></li>
    <li data-name="Chiles">Chiles poblanos <button type="button" data-action="remove">Quitar</button></li>
    <li data-name="Limones">Limones <button type="button" data-action="remove">Quitar</button></li>
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
  font-size: 1.2rem;
  margin-top: 0;
}
.shopping {
  display: grid;
  gap: 0.35rem;
  padding: 0;
  list-style: none;
}
.shopping li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.35rem 0.6rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
button {
  font: inherit;
  padding: 0.25rem 0.6rem;
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
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// UN listener en la lista, en lugar de cinco (uno por botón).
shopping.addEventListener('click', (event) => {
  // 1. ¿El clic fue en (o dentro de) un botón «Quitar»? Si no, no es asunto nuestro.
  const button = event.target.closest('[data-action="remove"]');
  if (!button) return;
  // 2. ¿De qué producto? El <li> que contiene al botón.
  const item = button.closest('li');
  logLine(`🗑️ quito «${item.dataset.name}» · quedan ${shopping.children.length - 1}`);
  item.remove();
});
logLine(`Listo: ${shopping.children.length} productos y 1 listener. Pulsa «Quitar» en dos de ellos`);

// Funciona porque click burbujea: el clic en el botón sube hasta la lista.
// El listener no sabe cuántos botones hay ni le importa.
```
