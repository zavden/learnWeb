---
example_description: "El acertijo clásico del event loop: con un clic real, las microtareas se ejecutan ENTRE un listener y el siguiente (la pila queda vacía); con button.click() desde un script, todos los listeners van seguidos y las microtareas esperan al final del script. Comprobado en Chrome"
example_tags: "javascript|eventos|microtareas|event-loop|click|dispatchevent|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>¿En qué orden?</h1>
  <p>El botón tiene dos listeners; cada uno programa una microtarea.</p>
  <button id="pay" type="button">Pagar $640.00</button>
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
const payButton = document.querySelector('#pay');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

payButton.addEventListener('click', (event) => {
  logLine(`listener 1 (isTrusted: ${event.isTrusted})`);
  Promise.resolve().then(() => logLine('   microtarea 1'));
});
payButton.addEventListener('click', () => {
  logLine('listener 2');
  Promise.resolve().then(() => logLine('   microtarea 2'));
});

// Simulado: el script llama a click(). Mientras tanto, el script SIGUE en la
// pila: las microtareas esperan a que termine.
logLine('— simulado: payButton.click() —');
payButton.click();
logLine('script: después de click()');
setTimeout(() => logLine('— Listo: ahora pulsa tú «Pagar» —'));

// Con un clic real, el navegador llama a cada listener desde un event loop
// con la pila VACÍA. Tras cada callback se vacía la cola de microtareas, así
// que la microtarea 1 sale antes que el listener 2.
// Por qué importa: un test automático que usa click() puede ver un orden
// distinto del que verá el usuario. No hagas que tu código dependa de él.
```
