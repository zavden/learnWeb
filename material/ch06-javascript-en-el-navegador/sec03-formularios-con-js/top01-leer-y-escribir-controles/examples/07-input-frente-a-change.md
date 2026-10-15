---
example_description: "En un campo de texto, change solo llega al confirmar (al salir del campo o con Enter): una vista previa calculada en change va por detrás. input llega con cada cambio, después de beforeinput; en casillas y listas, change llega en el acto"
example_tags: "javascript|formularios|input|change|beforeinput|eventos|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Tarjeta para tu regalo</h1>
  <form id="card" action="/regalos" method="post">
    <p>
      <label for="dedication">Dedicatoria</label>
      <input id="dedication" name="dedication" maxlength="40">
    </p>
    <p><label><input type="checkbox" name="kraft"> Papel kraft</label></p>
    <p>
      <label for="design">Diseño</label>
      <select id="design" name="design">
        <option value="flowers">Flores</option>
        <option value="papel-picado">Papel picado</option>
      </select>
    </p>
  </form>
  <div class="previews">
    <p>🐛 con change: <output id="preview-change">—</output></p>
    <p>✅ con input: <output id="preview-input">—</output></p>
  </div>
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
input:not([type="checkbox"]),
select {
  font: inherit;
  color: #1f2933;
  padding: 0.35rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
}
:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.previews p {
  margin: 0.5rem 0;
}
output {
  font-style: italic;
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
const form = document.querySelector('#card');
const dedication = document.querySelector('#dedication');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// beforeinput: el valor TODAVÍA no ha cambiado (se puede cancelar; lección de validación).
dedication.addEventListener('beforeinput', (event) => {
  logLine(`beforeinput · ${event.inputType} · '${event.data}' · value aún '${dedication.value}'`);
});
// input: el valor YA cambió. Llega con cada tecla, cada pegado, cada borrado.
dedication.addEventListener('input', () => {
  logLine(`input · value '${dedication.value}'`);
  document.querySelector('#preview-input').textContent = dedication.value || '—';
});
// 🐛 change en un campo de texto: solo al CONFIRMAR (salir del campo o Enter),
//    y solo si el valor es distinto del que tenía al entrar.
dedication.addEventListener('change', () => {
  logLine(`change · value '${dedication.value}'`);
  document.querySelector('#preview-change').textContent = dedication.value || '—';
});

// En casillas y listas, change llega en el acto (después de input).
form.addEventListener('change', (event) => {
  if (event.target === dedication) return;
  const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
  logLine(`change en ${event.target.name} → ${value}`);
});
logLine('Listo: escribe «Ana» en la dedicatoria y pulsa Tab; luego marca la casilla y cambia el diseño');
```
