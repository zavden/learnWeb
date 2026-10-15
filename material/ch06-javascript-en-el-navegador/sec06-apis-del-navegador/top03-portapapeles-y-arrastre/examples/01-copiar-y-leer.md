---
example_description: "navigator.clipboard.writeText copia un código de descuento al pulsar un botón y readText lee el portapapeles (pide permiso la primera vez); las dos devuelven promesas que se rechazan con NotAllowedError si falta el permiso, como en una tarjeta de la teoría"
example_tags: "javascript|clipboard|portapapeles|writetext|readtext|permisos"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Tu cupón de otoño</h1>
  <p class="coupon">
    <code id="coupon-code">OTONO-CAFE-15</code>
    <button id="copy" type="button">Copiar código</button>
  </p>
  <p>Pégalo en el carrito para un 15 % de descuento en cafés de origen.</p>
  <p><button id="read" type="button">Leer el portapapeles</button></p>
  <p id="card-notice" class="notice" hidden>Esta tarjeta es un iframe aislado sin permiso para el portapapeles: ábrela con «▶ Run» o en el editor.</p>
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
.coupon {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.coupon code {
  padding: 0.35rem 0.75rem;
  border: 2px dashed #92400e;
  border-radius: 0.375rem;
  background: #fef3c7;
  font-size: 1.1rem;
  letter-spacing: 0.05em;
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
.notice {
  color: #92400e;
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
const copyButton = document.querySelector('#copy');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
const inCard = window.origin === 'null'; // tarjeta de la teoría: iframe aislado
if (inCard) document.querySelector('#card-notice').hidden = false;

function explain() {
  if (inCard) return 'la tarjeta no tiene permiso para el portapapeles; ábrela con ▶ o en el editor';
  return 'el navegador no lo ha permitido (permiso denegado o la página sin foco)';
}

copyButton.addEventListener('click', async () => {
  const code = document.querySelector('#coupon-code').textContent;
  try {
    await navigator.clipboard.writeText(code); // una promesa: el sistema copia aparte
    copyButton.textContent = '✓ Copiado';
    logLine(`✅ copiado → ${code}`);
  } catch (error) {
    logLine(`⚠️ ${error.name}: ${explain()}`);
  }
});

document.querySelector('#read').addEventListener('click', async () => {
  try {
    // Leer es más delicado que escribir: la primera vez, Chrome pregunta.
    const text = await navigator.clipboard.readText();
    logLine(`📋 el portapapeles tiene → ${text}`);
  } catch (error) {
    logLine(`⚠️ ${error.name}: ${explain()}`);
  }
});

logLine('Listo: pulsa «Copiar código» y pégalo donde quieras; luego pulsa «Leer el portapapeles»');

// Nunca leas el portapapeles al cargar ni sin que la persona lo pida: además
// del permiso, es una cuestión de confianza (ahí puede haber una contraseña).
```
