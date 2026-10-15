---
example_description: "FormData (y el envío) se salta los controles disabled (también dentro de un fieldset disabled), las casillas sin marcar y los controles sin name; readonly sí se envía"
example_tags: "javascript|formularios|formdata|disabled|readonly|checkbox|name|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Renovar la membresía · Huerta Urbana</h1>
  <form id="renewal" action="/socios/renovar" method="post">
    <p><label>Nombre <input name="member_name" value="Lucía Méndez"></label></p>
    <!-- readonly: no se puede editar, pero SÍ se envía -->
    <p><label>Socio <input name="member_id" value="HU-0042" readonly></label></p>
    <!-- 🐛 disabled: no se puede editar y NO se envía -->
    <p><label>Cupón <input name="coupon" value="OTOÑO10" disabled></label></p>
    <!-- 🐛 sin name: el navegador no sabe con qué nombre enviarlo -->
    <p><label>Teléfono <input id="phone" value="55 1234 5678"></label></p>
    <!-- 🐛 una casilla sin marcar no envía nada (ni false ni su nombre) -->
    <p><label><input type="checkbox" name="invoice"> Quiero factura</label></p>
    <p><label><input type="checkbox" name="newsletter" checked> Boletín mensual</label></p>
    <!-- 🐛 un fieldset disabled desactiva todo lo que contiene -->
    <fieldset disabled>
      <legend>Dirección de facturación (marca «Quiero factura»)</legend>
      <label>Calle <input name="billing_street" value="Calle Morelos 12"></label>
    </fieldset>
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
fieldset {
  border: 1px solid #cbd2d9;
  border-radius: 0.375rem;
}
input:not([type="checkbox"]) {
  font: inherit;
  color: #1f2933;
  padding: 0.3rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
}
input:disabled {
  color: #52606d;
  background: #f5f7fa;
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
const form = document.querySelector('#renewal');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

function report() {
  const formData = new FormData(form);
  logLine(`FormData → ${JSON.stringify([...formData])}`);
  logLine(`🐛 coupon (disabled) → ${formData.get('coupon')}`);
  logLine(`invoice → ${formData.get('invoice')} · billing_street → ${formData.get('billing_street')}`);
  logLine(`✅ member_id (readonly) → ${formData.get('member_id')}`);
}

report();
// Al marcar «Quiero factura», se activa el fieldset y su calle entra en FormData.
form.elements.invoice.addEventListener('change', (event) => {
  form.querySelector('fieldset').disabled = !event.target.checked;
  report();
});
logLine('Listo: marca «Quiero factura» y mira qué entra');

// El teléfono no aparece nunca: sin name no hay forma de pedirlo a FormData.
// Las soluciones: readonly en vez de disabled si el valor debe viajar; name en todo
// lo que se envía; y en el servidor, «no está» significa «casilla sin marcar».
```
