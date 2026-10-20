---
example_description: "keydown y keyup con sus dos nombres de tecla: key es el carácter o la función según la distribución del teclado ('ñ', 'Ñ', 'Enter') y code la posición física ('Semicolon', 'KeyA'); más los modificadores y repeat"
example_tags: "javascript|eventos|teclado|keydown|key|code|modificadores"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Probador de teclas</h1>
  <p class="hint">Haz clic en esta vista previa y pulsa teclas: una letra, la <kbd>ñ</kbd>, <kbd>Shift</kbd> + una letra, <kbd>Enter</kbd>, una flecha.</p>
  <dl class="last-key">
    <dt><code>key</code></dt><dd id="key">—</dd>
    <dt><code>code</code></dt><dd id="code">—</dd>
    <dt>modificadores</dt><dd id="modifiers">—</dd>
  </dl>
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
.hint {
  color: #52606d;
}
.last-key {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.25rem 1rem;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
.last-key dd {
  margin: 0;
  font-family: Menlo, Consolas, monospace;
  font-weight: 700;
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
  if (logList.children.length > 8) logList.firstElementChild.remove(); // solo las últimas 8
}

// Las teclas llegan al elemento que tiene el foco (aquí, el <body>) y suben
// hasta document: un listener en document las recibe todas.
document.addEventListener('keydown', (event) => {
  const modifiers = ['shiftKey', 'altKey', 'ctrlKey', 'metaKey'].filter((name) => event[name]);
  document.querySelector('#key').textContent = JSON.stringify(event.key);
  document.querySelector('#code').textContent = JSON.stringify(event.code);
  document.querySelector('#modifiers').textContent = modifiers.join(' + ') || 'ninguno';
  logLine(`keydown · key: ${JSON.stringify(event.key)} · code: ${JSON.stringify(event.code)}${event.repeat ? ' · repeat' : ''}`);
});
document.addEventListener('keyup', (event) => {
  logLine(`keyup   · key: ${JSON.stringify(event.key)}`);
});
logLine('Listo: haz clic en la vista previa y pulsa teclas');

// key  → QUÉ significa la tecla con la distribución actual: 'a', 'A' (con
//        Shift), 'ñ', ' ' (espacio), 'Enter', 'ArrowUp', 'Shift'…
// code → DÓNDE está físicamente, con nombres del teclado estadounidense:
//        'KeyA', 'Space', 'Enter', 'ArrowUp', 'ShiftLeft'… La ñ de un
//        teclado español está donde el ; del estadounidense: 'Semicolon'.
// Con Cmd (macOS) pulsada, Chrome no envía el keyup de las otras teclas.
```
