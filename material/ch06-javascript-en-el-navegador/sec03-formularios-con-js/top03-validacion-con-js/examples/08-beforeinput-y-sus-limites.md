---
example_description: "beforeinput se puede cancelar y su inputType dice qué edición es (insertText, insertFromPaste, deleteContentBackward…). Un filtro que cancela todo lo que no son cifras rechaza también el teléfono pegado con espacios; mejor dejar pasar y limpiar en input, sin tocar la composición de un IME, y validar al final"
example_tags: "javascript|formularios|beforeinput|inputtype|input|pegar|ime|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Te llamamos para confirmar</h1>
  <p>Cópialo para probar el pegado: <code>55 1234 5678</code></p>
  <form id="callback" action="/llamadas" method="post">
    <p>
      <label for="phone-strict">🐛 Teléfono (filtro estricto)</label>
      <input id="phone-strict" name="phone_strict" inputmode="numeric" autocomplete="off">
    </p>
    <p>
      <label for="phone-clean">✅ Teléfono (filtro amable)</label>
      <input id="phone-clean" name="phone" inputmode="numeric" pattern="\d{10}" autocomplete="tel-national">
    </p>
  </form>
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
code {
  padding: 0.1rem 0.3rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.25rem;
  background: #ffffff;
}
form {
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
form p {
  display: grid;
  gap: 0.2rem;
  margin: 0 0 0.6rem;
}
input {
  font: inherit;
  color: #1f2933;
  padding: 0.3rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
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
const strict = document.querySelector('#phone-strict');
const clean = document.querySelector('#phone-clean');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
// El texto que se va a insertar: en un <input> llega en data; por si acaso, dataTransfer.
const insertedText = (event) => event.data ?? event.dataTransfer?.getData('text/plain') ?? '';

// 🐛 Estricto: cancela CUALQUIER inserción que traiga algo que no sea una cifra.
strict.addEventListener('beforeinput', (event) => {
  const text = insertedText(event);
  const blocked = /\D/.test(text);
  if (blocked) event.preventDefault();
  logLine(`🐛 ${event.inputType} '${text}' → ${blocked ? 'cancelado' : 'pasa'}`);
});

// ✅ Amable: solo cancela una TECLA que no es cifra (insertText de un carácter)…
clean.addEventListener('beforeinput', (event) => {
  if (event.isComposing) return; // nunca toques la escritura con un IME a medias
  const text = insertedText(event);
  const typedLetter = event.inputType === 'insertText' && /\D/.test(text);
  if (typedLetter) event.preventDefault();
  logLine(`✅ ${event.inputType} '${text}' → ${typedLetter ? 'cancelado' : 'pasa'}`);
});
// …y lo que llegue por otros caminos (pegar, arrastrar, autocompletar) se limpia en input.
clean.addEventListener('input', () => {
  const digits = clean.value.replace(/\D/g, '');
  if (digits !== clean.value) {
    clean.value = digits;
    logLine(`✅ input: limpiado a '${digits}'`);
  }
});
logLine('Listo: escribe «55a» en cada campo; luego vacíalos y pega 55 1234 5678 en cada uno');

// Ningún filtro sustituye a la validación: pattern="\d{10}" (y el servidor) deciden.
```
