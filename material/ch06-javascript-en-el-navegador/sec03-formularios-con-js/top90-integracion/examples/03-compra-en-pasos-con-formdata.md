---
example_description: "Una compra en tres pasos, cada uno su propio <form>: la validación nativa decide si llega el submit, cada paso vuelca su FormData en uno acumulado (delete + append, también los nombres repetidos), «Atrás» conserva lo escrito y «Confirmar» envía el FormData acumulado al servidor de pruebas (adelanto de fetch)"
example_tags: "javascript|formularios|integracion|formdata|pasos|submit|fetch"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Café por suscripción</h1>
  <p id="card-notice" class="notice" hidden>Esta tarjeta es un iframe aislado y aquí los formularios no se envían: ábrelo con «▶ Run» o en el editor.</p>
  <ol class="steps" aria-label="Pasos">
    <li data-step-label aria-current="step">Café</li>
    <li data-step-label>Envío</li>
    <li data-step-label>Confirmar</li>
  </ol>
  <form class="step" data-step="1" action="/suscripcion" method="post">
    <h2 tabindex="-1">1. Tu café</h2>
    <fieldset>
      <legend>Molienda</legend>
      <label><input type="radio" name="grind" value="beans" required> En grano</label>
      <label><input type="radio" name="grind" value="espresso" checked> Para espresso</label>
    </fieldset>
    <fieldset>
      <legend>Extras</legend>
      <label><input type="checkbox" name="extras" value="cinnamon" checked> Canela</label>
      <label><input type="checkbox" name="extras" value="piloncillo" checked> Piloncillo</label>
    </fieldset>
    <button type="submit">Siguiente</button>
  </form>
  <form class="step" data-step="2" action="/suscripcion" method="post" hidden>
    <h2 tabindex="-1">2. Envío</h2>
    <label>Nombre <input name="customer" required autocomplete="name"></label>
    <label>Código postal <input name="postal_code" required pattern="\d{5}" inputmode="numeric" autocomplete="postal-code"></label>
    <p class="nav"><button type="button" data-back>Atrás</button> <button type="submit">Siguiente</button></p>
  </form>
  <form class="step" data-step="3" action="/suscripcion" method="post" hidden>
    <h2 tabindex="-1">3. Confirma</h2>
    <dl id="summary" class="summary"></dl>
    <p class="nav"><button type="button" data-back>Atrás</button> <button type="submit">Confirmar pedido</button></p>
  </form>
  <ol id="log" class="log" aria-label="Registro"></ol>
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
h2 {
  font-size: 1rem;
  margin: 0;
}
.notice {
  padding: 0.5rem 0.75rem;
  border-left: 4px solid #1d4ed8;
  background: #ffffff;
}
.steps {
  display: flex;
  gap: 1.5rem;
  color: #52606d;
}
.steps [aria-current="step"] {
  color: #1d4ed8;
  font-weight: 700;
}
.step {
  display: grid;
  gap: 0.6rem;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
.step[hidden] {
  display: none;
}
fieldset {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 0;
  border: 1px solid #cbd2d9;
  border-radius: 0.375rem;
}
.summary {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.2rem 1rem;
  margin: 0;
}
.summary dd {
  margin: 0;
}
input:not([type="radio"], [type="checkbox"]),
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
// Combina: «FormData y envío» (FormData, delete/append, submit, fetch como adelanto)
// y «Validación con JavaScript» (la validación nativa decide si llega el submit).
const steps = [...document.querySelectorAll('form.step')];
const labels = [...document.querySelectorAll('[data-step-label]')];
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
// En una tarjeta (iframe aislado, origen null) el navegador no envía formularios.
if (window.origin === 'null') document.querySelector('#card-notice').hidden = false;

const order = new FormData(); // los datos de todos los pasos
const MULTIPLE = new Set(['extras']); // los nombres que pueden repetirse
const toObject = (formData) => Object.fromEntries([...new Set(formData.keys())].map((key) => (
  [key, MULTIPLE.has(key) ? formData.getAll(key) : formData.get(key)]
)));

function show(index) {
  steps.forEach((step, i) => { step.hidden = i !== index; });
  labels.forEach((label, i) => {
    if (i === index) label.setAttribute('aria-current', 'step');
    else label.removeAttribute('aria-current');
  });
  steps[index].querySelector('h2').focus(); // el lector de pantalla anuncia el paso
}

function renderSummary() {
  const rows = [['Molienda', order.get('grind')], ['Extras', order.getAll('extras').join(', ') || 'ninguno'],
    ['Nombre', order.get('customer')], ['Código postal', order.get('postal_code')]];
  document.querySelector('#summary').replaceChildren(...rows.flatMap(([term, value]) => {
    const dt = document.createElement('dt');
    dt.textContent = term;
    const dd = document.createElement('dd');
    dd.textContent = value; // texto del usuario: siempre textContent
    return [dt, dd];
  }));
}

steps.forEach((step, index) => {
  step.addEventListener('submit', async (event) => {
    event.preventDefault(); // la validación nativa ya pasó: si no, no habría submit
    if (index < steps.length - 1) {
      const stepData = new FormData(step);
      // Borra lo que este paso guardó antes (por si se volvió atrás: también las casillas
      // que ahora están sin marcar) y añade lo actual, con append para los repetidos.
      for (const field of step.elements) if (field.name) order.delete(field.name);
      for (const [key, value] of stepData) order.append(key, value);
      logLine(`➡️ paso ${index + 1} guardado → ${JSON.stringify(toObject(order))}`);
      if (index === steps.length - 2) renderSummary();
      show(index + 1);
      return;
    }
    // Adelanto: fetch (módulo «Red y almacenamiento») al servidor de pruebas de LearnWeb.
    logLine(`📤 enviando ${[...order].length} pares…`);
    const response = await fetch('/api/demo/echo', { method: 'POST', body: order });
    const echo = await response.json();
    logLine(`✅ ${response.status} · el servidor recibió → ${JSON.stringify(echo.body)}`);
  });
});
for (const button of document.querySelectorAll('[data-back]')) {
  button.addEventListener('click', () => show(steps.indexOf(button.form) - 1));
}
logLine('Listo: pulsa «Siguiente»; escribe nombre y código postal (06700); vuelve «Atrás» hasta el paso 1, quita la canela y sigue hasta «Confirmar pedido»');
```
