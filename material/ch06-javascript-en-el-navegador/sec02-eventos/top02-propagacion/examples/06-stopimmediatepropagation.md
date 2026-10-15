---
example_description: "stopPropagation no detiene a los demás listeners del MISMO elemento; stopImmediatePropagation sí: un guardián registrado primero bloquea el pago mientras hay otro en curso"
example_tags: "javascript|eventos|stopimmediatepropagation|stoppropagation|orden"
example_stage: minimal
example_importance: useful
console: true
---

# HTML

```html
<main>
  <h1>Pedido P-3310 · $1,280.00</h1>
  <p class="notice">⏳ Hay un pago en curso: cualquier otro intento debe bloquearse.</p>
  <p class="actions">
    <button id="pay-a" type="button">Pagar (guardián con stopPropagation)</button>
    <button id="pay-b" type="button">Pagar (guardián con stopImmediatePropagation)</button>
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
.notice {
  padding: 0.5rem 0.75rem;
  border-left: 4px solid #b45309;
  background: #ffffff;
}
.actions {
  display: grid;
  gap: 0.5rem;
  justify-items: start;
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
const paymentInProgress = true;
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

function setUpPayButton(button, stop) {
  // 1. El guardián, registrado PRIMERO: los listeners de un elemento se
  //    ejecutan en el orden en que se registraron.
  button.addEventListener('click', (event) => {
    if (!paymentInProgress) return;
    logLine(`⛔ #${button.id}: bloqueado, ya hay un pago en curso`);
    if (stop === 'immediate') event.stopImmediatePropagation(); // corta TODO
    else event.stopPropagation(); // solo impide que suba a los antepasados
  });
  // 2. El pago, en el mismo botón.
  button.addEventListener('click', () => {
    logLine(`🐛 #${button.id}: 💳 cobro $1,280.00 otra vez (el guardián no lo frenó)`);
  });
}
setUpPayButton(document.querySelector('#pay-a'), 'normal');
setUpPayButton(document.querySelector('#pay-b'), 'immediate');

// Un antepasado que también escucha: ninguno de los dos guardianes le deja pasar.
document.addEventListener('click', (event) => {
  if (event.target.closest('button')) logLine('document recibió el clic');
});
logLine('Listo: pulsa los dos botones');

// En la práctica, un guardián así se escribe mejor DENTRO del listener de pago
// (if (paymentInProgress) return;) o desactivando el botón (disabled).
// stopImmediatePropagation sirve cuando no controlas el otro listener.
```
