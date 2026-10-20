---
example_description: "Un chat donde Enter envía y Shift+Enter hace un salto de línea; mientras se compone un carácter (tecla muerta para la tilde, teclados de idiomas asiáticos) event.isComposing es true y Enter no debe enviar"
example_tags: "javascript|eventos|teclado|keydown|iscomposing|chat|textarea"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Chat con la tostaduría</h1>
  <ol id="messages" class="messages" aria-live="polite">
    <li class="them">¡Hola! ¿En qué te ayudamos?</li>
  </ol>
  <label for="draft">Mensaje <small>(Enter envía · Shift + Enter, nueva línea)</small></label>
  <textarea id="draft" rows="2"></textarea>
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
.messages {
  display: grid;
  gap: 0.35rem;
  padding: 0;
  list-style: none;
}
.messages li {
  max-width: 80%;
  padding: 0.35rem 0.6rem;
  border-radius: 0.75rem;
  white-space: pre-line;
}
.messages .them {
  background: #e4e7eb;
}
.messages .me {
  justify-self: end;
  background: #dbeafe;
}
textarea {
  display: block;
  width: 100%;
  box-sizing: border-box;
  margin-top: 0.25rem;
  font: inherit;
  padding: 0.35rem 0.5rem;
}
textarea:focus-visible {
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
const draft = document.querySelector('#draft');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

draft.addEventListener('keydown', (event) => {
  if (event.key === 'Dead') logLine('tecla muerta (key: "Dead") → empieza a componerse un carácter');
  if (event.key !== 'Enter') return;
  // Mientras se compone un carácter (la tilde de una tecla muerta, o una
  // palabra en un teclado japonés o chino), Enter CONFIRMA la composición.
  if (event.isComposing) {
    logLine('⏸️ Enter durante una composición (isComposing: true) → no envío');
    return;
  }
  if (event.shiftKey) return; // Shift + Enter: deja que el textarea haga su salto de línea
  event.preventDefault();     // Enter solo: no metas el salto de línea, envía
  const text = draft.value.trim();
  if (!text) return;
  const bubble = document.createElement('li');
  bubble.className = 'me';
  bubble.textContent = text;
  document.querySelector('#messages').append(bubble);
  draft.value = '';
  logLine(`📤 enviado: ${JSON.stringify(text)}`);
});
logLine('Listo: escribe «Hola», Shift + Enter, «¿Tienen cajeta?» y Enter');

// Para probar isComposing en un Mac con teclado español, pulsa la tecla de la
// tilde (´) y después Enter; con el teclado estadounidense, Option + E y
// Enter. En otros sistemas, la tilde puede no componerse y no verás la línea.
```
