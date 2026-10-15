---
example_description: "El objeto evento que recibe cada listener: type, target, currentTarget, isTrusted y timeStamp; una sola función sirve a dos botones porque el evento dice cuál se pulsó"
example_tags: "javascript|eventos|objeto-evento|target|currenttarget|timestamp|istrusted"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Atardecer en Tulum</h1>
  <p class="actions">
    <button id="like" type="button">♥ Me gusta</button>
    <button id="save" type="button">🔖 Guardar</button>
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

// El navegador llama al listener con UN argumento: el objeto evento, que
// describe lo que ha pasado. Por eso una función sirve para muchos elementos.
function describeClick(event) {
  logLine(`type → ${event.type}`);
  logLine(`target.id → ${event.target.id}`);               // dónde ocurrió
  logLine(`currentTarget.id → ${event.currentTarget.id}`); // quién escucha
  logLine(`isTrusted (lo hizo el usuario) → ${event.isTrusted}`);
  // timeStamp: ms desde que se abrió la página, el mismo reloj que performance.now()
  logLine(`timeStamp ≤ performance.now() → ${event.timeStamp <= performance.now()}`);
  logLine(`instanceof MouseEvent → ${event instanceof MouseEvent}`);
}

document.querySelector('#like').addEventListener('click', describeClick);
document.querySelector('#save').addEventListener('click', describeClick);
logLine('Listo: pulsa «♥ Me gusta» o «🔖 Guardar»');

// Cada tipo de evento trae su clase con propiedades propias: los clics son
// MouseEvent (en Chrome, incluso PointerEvent, su subclase) y traen la posición
// (clientX, clientY); las teclas son KeyboardEvent y traen key y code.
// Nunca imprimas el objeto entero para comparar: sus valores cambian en cada
// clic y en cada ordenador. Imprime las propiedades que te interesan.
```
