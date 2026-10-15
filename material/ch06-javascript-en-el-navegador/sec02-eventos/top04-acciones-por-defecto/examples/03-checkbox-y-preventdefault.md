---
example_description: "En el click de una casilla, checked YA tiene el valor nuevo aunque luego se llame a preventDefault(), que lo deshace al terminar el evento: un total calculado en el click queda mal; calcularlo en change (que no llega si se canceló) es correcto"
example_tags: "javascript|eventos|preventdefault|checkbox|click|change|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Tu pedido: helado de cajeta y queso fresco ($210.00)</h1>
  <p class="notice">❄️ El envío exprés no admite productos refrigerados.</p>
  <fieldset>
    <legend>Envío exprés (+$50.00)</legend>
    <label><input type="checkbox" id="express-buggy"> 🐛 total calculado en <code>click</code></label>
    <p>Total: <output id="total-buggy">$210.00</output></p>
    <label><input type="checkbox" id="express-fixed"> ✅ total calculado en <code>change</code></label>
    <p>Total: <output id="total-fixed">$210.00</output></p>
  </fieldset>
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
  margin-top: 0;
}
.notice {
  padding: 0.5rem 0.75rem;
  border-left: 4px solid #1d4ed8;
  background: #ffffff;
}
fieldset {
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
fieldset p {
  margin: 0.25rem 0 0.75rem 1.6rem;
}
input:focus-visible {
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
const BASE = 210;
const EXPRESS = 50;
const hasRefrigerated = true;
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
const formatTotal = (withExpress) => `$${(BASE + (withExpress ? EXPRESS : 0)).toFixed(2)}`;

// 🐛 En el click de una casilla, checked ya está CAMBIADO. Si después se
//    cancela, el navegador lo devuelve a su valor al terminar el evento.
const buggy = document.querySelector('#express-buggy');
buggy.addEventListener('click', (event) => {
  logLine(`🐛 dentro del click: checked → ${buggy.checked}`);
  document.querySelector('#total-buggy').textContent = formatTotal(buggy.checked);
  if (hasRefrigerated) event.preventDefault();
  setTimeout(() => {
    logLine(`🐛 después: checked → ${buggy.checked}, pero el total dice ${document.querySelector('#total-buggy').textContent}`);
  });
});

// ✅ El click solo decide si se permite; el total se calcula en change, que
//    solo llega cuando el valor ha cambiado DE VERDAD (no tras un preventDefault).
const fixed = document.querySelector('#express-fixed');
fixed.addEventListener('click', (event) => {
  if (hasRefrigerated) {
    event.preventDefault();
    logLine('✅ click cancelado: no se dispara change y el total no se toca');
  }
});
fixed.addEventListener('change', () => {
  document.querySelector('#total-fixed').textContent = formatTotal(fixed.checked);
  logLine(`change → checked: ${fixed.checked}`);
});
logLine('Listo: marca las dos casillas');

// Lo más claro para el usuario: no le dejes marcar algo que se va a deshacer.
// Desactiva la casilla (disabled) y explica por qué junto a ella.
```
