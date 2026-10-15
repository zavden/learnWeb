---
example_description: "removeEventListener con una flecha escrita en el sitio o con otro bind no quita nada: cada una es una función NUEVA; el listener sigue respondiendo. La solución: guardar la función en una variable"
example_tags: "javascript|eventos|removeeventlistener|bind|flecha|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Carta a Lucía</h1>
  <p>Se registraron tres listeners en «Guardar borrador» y se intentó quitar los tres.</p>
  <button id="save" type="button">Guardar borrador</button>
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
const saveButton = document.querySelector('#save');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

class Draft {
  constructor(title) {
    this.title = title;
  }
  save() {
    logLine(`🐛 bind → «${this.title}» guardado`);
  }
}
const draft = new Draft('Carta a Lucía');

// 🐛 1. Una flecha escrita en el sitio: la de removeEventListener es OTRA
//    función, aunque el código sea idéntico. No encuentra nada que quitar.
saveButton.addEventListener('click', () => logLine('🐛 flecha → sigo aquí'));
saveButton.removeEventListener('click', () => logLine('🐛 flecha → sigo aquí'));

// 🐛 2. bind crea una función nueva CADA vez que se evalúa.
saveButton.addEventListener('click', draft.save.bind(draft));
saveButton.removeEventListener('click', draft.save.bind(draft));

// ✅ 3. Guarda la función en una variable y usa ESA para registrar y quitar.
const saveDraft = () => logLine('✅ esta línea no debería salir nunca');
saveButton.addEventListener('click', saveDraft);
saveButton.removeEventListener('click', saveDraft);

console.log('¿dos flechas iguales son la misma función? →', (() => {}) === (() => {}));
console.log('¿dos bind son la misma función? →', draft.save.bind(draft) === draft.save.bind(draft));
logLine('Listo: pulsa «Guardar borrador»');

// removeEventListener compara por IDENTIDAD (===), como el off del
// EventEmitter del módulo «Clases y POO»: mismo tipo, misma función y misma
// fase (capture, en el ejemplo siguiente). Si no encuentra nada, no avisa.
```
