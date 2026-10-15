---
example_description: "Asignar input.value desde JavaScript no dispara input ni change: el código que escucha esos eventos (aquí, el costo de envío) no se entera. Si alguien escucha, dispara tú el evento con dispatchEvent(new Event('input', { bubbles: true }))"
example_tags: "javascript|formularios|value|input|dispatchevent|eventos|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Envío de tu pedido</h1>
  <form id="shipping" action="/pedidos/envio" method="post">
    <p>
      <label for="postal-code">Código postal</label>
      <input id="postal-code" name="postal_code" inputmode="numeric" maxlength="5" autocomplete="postal-code">
    </p>
    <p class="actions">
      <button id="fill-buggy" type="button">Usar mi dirección de casa (🐛)</button>
      <button id="fill-fixed" type="button">Usar mi dirección del trabajo (✅)</button>
    </p>
  </form>
  <p>Envío: <output id="cost">escribe tu código postal</output></p>
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
  padding: 0.35rem 0.5rem;
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
output {
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
const form = document.querySelector('#shipping');
const postalCode = document.querySelector('#postal-code');
const cost = document.querySelector('#cost');
const logList = document.querySelector('#log');
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// Otra parte de la página (otro componente) recalcula el envío en cada input.
form.addEventListener('input', (event) => {
  if (event.target !== postalCode) return;
  const code = postalCode.value;
  // CDMX: códigos que empiezan por 0 o 1; el resto del país, tarifa nacional.
  cost.textContent = code.length < 5 ? 'escribe tu código postal' : money.format(/^[01]/.test(code) ? 49 : 99);
  logLine(`📦 input (isTrusted: ${event.isTrusted}) → CP '${code}': ${cost.textContent}`);
});

// 🐛 Asignar value NO dispara ningún evento: el envío no se recalcula.
document.querySelector('#fill-buggy').addEventListener('click', () => {
  postalCode.value = '06700';
  logLine(`🐛 value = '06700' → sin eventos; el envío sigue diciendo «${cost.textContent}»`);
});

// ✅ Si otro código escucha, avísale: dispatchEvent con bubbles para que llegue al form.
document.querySelector('#fill-fixed').addEventListener('click', () => {
  postalCode.value = '64000';
  logLine("✅ value = '64000' y dispatchEvent(new Event('input', { bubbles: true }))");
  postalCode.dispatchEvent(new Event('input', { bubbles: true }));
});
logLine('Listo: escribe un código postal, o pulsa los dos botones');
```
