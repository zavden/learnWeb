---
example_description: "checkValidity() responde en silencio; reportValidity() además muestra el aviso del primer campo inválido y le da el foco. Los dos disparan invalid en cada campo inválido, un evento que NO burbujea: en el formulario solo se oye en la fase de captura"
example_tags: "javascript|formularios|validacion|checkvalidity|reportvalidity|invalid|captura"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Reserva en la Fonda Doña Lupe</h1>
  <form id="booking" action="/reservas" method="post">
    <p><label>Correo <input name="email" type="email" required autocomplete="email"></label></p>
    <p><label>Personas (1 a 12) <input name="guests" type="number" min="1" max="12" value="15"></label></p>
    <p class="actions">
      <button id="check" type="button">Comprobar en silencio</button>
      <button id="report" type="button">Comprobar y avisar</button>
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
form {
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
form p {
  margin: 0 0 0.5rem;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
input,
button {
  font: inherit;
  color: #1f2933;
  padding: 0.3rem 0.6rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
}
button {
  cursor: pointer;
}
:focus-visible {
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
const form = document.querySelector('#booking');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// invalid llega a CADA campo inválido, pero no burbujea (como focus, lección «Propagación»).
// 🐛 En la fase de burbuja, el formulario nunca lo oye:
form.addEventListener('invalid', (event) => {
  logLine(`🐛 invalid (burbuja) en ${event.target.name}`); // no se ejecuta nunca
});
// ✅ En la fase de captura, sí: baja por el formulario camino del campo.
form.addEventListener('invalid', (event) => {
  logLine(`   invalid (captura) en ${event.target.name}`);
}, { capture: true });

document.querySelector('#check').addEventListener('click', () => {
  logLine('▶ checkValidity()');
  const ok = form.checkValidity();
  logLine(`→ ${ok} (nada cambia en la pantalla)`);
});
document.querySelector('#report').addEventListener('click', () => {
  logLine('▶ reportValidity()');
  const ok = form.reportValidity();
  logLine(ok ? '→ true' : `→ false (aviso y foco en ${document.activeElement.name})`);
});
logLine('Listo: pulsa «Comprobar en silencio» y después «Comprobar y avisar»');
```
