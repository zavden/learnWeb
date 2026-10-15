---
example_description: "writeText al cargar la página se rechaza con NotAllowedError («Document is not focused»): Chrome exige que la página tenga el foco, y otros navegadores, un gesto reciente del usuario; desde un clic funciona, y una copia retrasada falla si mientras tanto haces clic fuera de la vista previa"
example_tags: "javascript|clipboard|writetext|notallowederror|foco|gesto-del-usuario|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Número de seguimiento</h1>
  <p><code id="tracking">MX-4471-2093-OAX</code></p>
  <p class="actions">
    <button id="copy-now" type="button">Copiar ya</button>
    <button id="copy-later" type="button">Copiar dentro de 3 s</button>
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
  margin: 0 0 0.5rem;
}
code {
  font-size: 1.1rem;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
button {
  font: inherit;
  padding: 0.3rem 0.7rem;
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
const tracking = document.querySelector('#tracking').textContent;
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

async function copyTracking(label) {
  try {
    await navigator.clipboard.writeText(tracking);
    logLine(`✅ ${label} → copiado ${tracking}`);
  } catch (error) {
    // En una tarjeta, el motivo es la política de permisos del iframe
    // (el mensaje trae además un enlace largo): lo resumimos.
    const reason = error.message.includes('permissions policy')
      ? 'esta tarjeta es un iframe aislado sin permiso para el portapapeles'
      : error.message;
    logLine(`🐛 ${label} → ${error.name}: ${reason}`);
  }
}

// 🐛 Al cargar: nadie ha hecho clic y la página no tiene el foco.
copyTracking('al cargar');

// ✅ Desde un clic: el clic da el foco a la página (y es un gesto del usuario).
document.querySelector('#copy-now').addEventListener('click', () => copyTracking('clic'));

// Chrome no exige el gesto en sí, sino que la página tenga el FOCO cuando
// copia. Pulsa y quédate en la vista previa: funciona. Pulsa y haz clic en el
// editor antes de 3 s: falla.
document.querySelector('#copy-later').addEventListener('click', () => {
  logLine('⏳ copiaré dentro de 3 s…');
  setTimeout(() => copyTracking('3 s después'), 3000);
});
logLine('Listo: pulsa «Copiar ya»; luego «Copiar dentro de 3 s» y haz clic fuera de la vista previa');
```
