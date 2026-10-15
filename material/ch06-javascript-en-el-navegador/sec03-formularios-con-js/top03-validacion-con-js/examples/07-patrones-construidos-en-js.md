---
example_description: "Un pattern construido en JavaScript a partir de datos: los códigos de descuento activos se escapan con RegExp.escape antes de unirlos con |, porque «.» y «+» son metacaracteres. El navegador compila pattern como ^(?:…)$ con el flag v, así que conviene probar el patrón con new RegExp(…, 'v') antes de asignarlo"
example_tags: "javascript|formularios|validacion|pattern|regex|regexp-escape|flag-v"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Tu carrito · Librería El Faro</h1>
  <form id="promo" action="/carrito/cupon" method="post">
    <label for="code">Código de descuento</label>
    <input id="code" name="code" autocomplete="off" autocapitalize="characters" required aria-describedby="code-hint">
    <p id="code-hint" class="hint">Códigos de esta semana: <code>OTOÑO-10</code>, <code>BUEN.FIN</code> y <code>ENVIO+GRATIS</code>.</p>
    <button type="submit">Aplicar</button>
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
  display: grid;
  gap: 0.3rem;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
label {
  font-weight: 600;
}
.hint {
  margin: 0;
  color: #52606d;
}
input,
button {
  font: inherit;
  color: #1f2933;
  padding: 0.3rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
}
button {
  justify-self: start;
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
  overflow-wrap: anywhere;
}
```

# JavaScript

```javascript
const form = document.querySelector('#promo');
const code = document.querySelector('#code');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// Los códigos llegan como datos (de un servidor, de una hoja de cálculo…).
const activeCodes = ['OTOÑO-10', 'BUEN.FIN', 'ENVIO+GRATIS'];

// Así compila el navegador el atributo pattern: anclado y con el flag v.
const asBrowser = (pattern) => new RegExp(`^(?:${pattern})$`, 'v');

// 🐛 Sin escapar: «.» es «cualquier carácter» y «+» es «una o más veces».
const naive = activeCodes.join('|');
// ✅ Escapados, cada código vale exactamente su texto (RegExp.escape: Chrome 136+).
const escaped = activeCodes.map((text) => RegExp.escape(text)).join('|');
for (const value of ['ENVIO+GRATIS', 'BUENXFIN', 'OTOÑO-10']) {
  logLine(`'${value}' → 🐛 ${asBrowser(naive).test(value)} · ✅ ${asBrowser(escaped).test(value)}`);
}

// Un patrón inválido en pattern se IGNORA en silencio (el campo acepta todo).
// Pruébalo antes con el mismo flag que usa el navegador:
function setPattern(input, pattern) {
  try {
    asBrowser(pattern);
    input.pattern = pattern;
    logLine(`pattern = ${pattern}`);
  } catch (error) {
    logLine(`⚠️ patrón rechazado → ${error.message}`);
  }
}
setPattern(code, '[A-Z0-9_-]{4,12}'); // el guion sin escapar del capítulo de HTML
setPattern(code, escaped);

code.addEventListener('input', () => {
  logLine(`'${code.value}' → patternMismatch: ${code.validity.patternMismatch}`);
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  logLine(`📨 cupón ${code.value} aplicado`);
});
logLine('Listo: escribe BUENXFIN y pulsa «Aplicar»; luego escribe BUEN.FIN');
```
