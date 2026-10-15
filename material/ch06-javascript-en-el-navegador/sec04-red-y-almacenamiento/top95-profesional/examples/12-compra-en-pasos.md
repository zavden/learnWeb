---
example_description: "Una compra en pasos (carrito, envío, pago, revisar) con el paso en la URL (?paso=…) y los datos en sessionStorage, que es por pestaña; un enlace profundo a un paso sin sus datos previos redirige con replaceState, la confirmación es un POST con clave de idempotencia que se reutiliza al reintentar, y tras confirmar no se puede volver al pago"
example_tags: "javascript|sessionstorage|pushstate|replacestate|popstate|fetch|idempotencia|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="checkout">
  <header class="bar"><h1>Finalizar compra</h1><button id="back" type="button">← Atrás</button></header>
  <ol class="steps" aria-label="Pasos de la compra">
    <li data-step="carrito">Carrito</li><li data-step="envio">Envío</li><li data-step="pago">Pago</li><li data-step="revisar">Revisar</li>
  </ol>
  <section data-panel="carrito">
    <h2 tabindex="-1">Tu carrito</h2>
    <ul><li>Pluma Hidalgo · 500 g × 1 — $245</li><li>Café de Coatepec · 250 g × 2 — $270</li></ul>
    <p class="total">Total: $515</p>
    <a class="button" href="?paso=envio">Continuar al envío</a>
  </section>
  <section data-panel="envio" hidden>
    <h2 tabindex="-1">Envío</h2>
    <form id="shipping-form">
      <label for="recipient">Nombre de quien recibe</label><input id="recipient" name="recipient" required autocomplete="name">
      <label for="street">Calle y número</label><input id="street" name="street" required autocomplete="street-address">
      <label for="city">Ciudad</label><input id="city" name="city" required autocomplete="address-level2">
      <label for="postal">Código postal</label><input id="postal" name="postal" required inputmode="numeric" pattern="[0-9]{5}" autocomplete="postal-code">
      <button type="submit">Continuar al pago</button>
    </form>
  </section>
  <section data-panel="pago" hidden>
    <h2 tabindex="-1">Pago</h2>
    <form id="payment-form">
      <fieldset>
        <legend>Forma de pago</legend>
        <label><input type="radio" name="method" value="contra-entrega" required> Pago contra entrega</label>
        <label><input type="radio" name="method" value="transferencia"> Transferencia</label>
        <label><input type="radio" name="method" value="tarjeta"> Tarjeta (en la pasarela del banco)</label>
      </fieldset>
      <button type="submit">Revisar el pedido</button>
    </form>
  </section>
  <section data-panel="revisar" hidden>
    <h2 tabindex="-1">Revisa tu pedido</h2>
    <p id="review"></p>
    <label><input id="fail-first" type="checkbox"> Simular un fallo de red en el primer envío</label>
    <p><button id="confirm" type="button">Confirmar pedido</button></p>
  </section>
  <section data-panel="hecho" hidden>
    <h2 tabindex="-1">¡Pedido confirmado!</h2>
    <p id="done-text"></p>
    <button id="new-order" type="button">Hacer otra compra</button>
  </section>
  <p id="status" class="status" role="status"></p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1f2933; --muted: #52606d; --line: #cbd2d9; --surface: #ffffff; --page: #f5f7fa; --accent: #1d4ed8; --error: #b91c1c; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.checkout { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0; font-size: 1.25rem; }
.bar { display: flex; justify-content: space-between; align-items: center; }
button:disabled { color: #616e7c; cursor: not-allowed; }
h2 { font-size: 1.05rem; }
h2:focus { outline: none; }
.steps { display: flex; gap: 0.25rem; margin: 0.5rem 0; padding: 0; list-style: none; counter-reset: step; font-size: 0.85rem; }
.steps li { flex: 1; padding: 0.25rem 0.4rem; border-bottom: 3px solid var(--line); color: var(--muted); counter-increment: step; }
.steps li::before { content: counter(step) ". "; }
.steps li[aria-current="step"] { border-color: var(--accent); color: var(--ink); font-weight: 700; }
section { padding: 0 0.75rem 0.75rem; border-radius: 0.75rem; background: var(--surface); }
form { display: grid; gap: 0.25rem; }
input:not([type]), button, .button { font: inherit; padding: 0.35rem 0.6rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: var(--surface); color: var(--ink); }
button, .button { justify-self: start; cursor: pointer; text-decoration: none; display: inline-block; }
:is(input, button, a):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
fieldset { display: grid; gap: 0.2rem; border: 1px solid var(--line); border-radius: 0.5rem; }
.total { font-weight: 700; }
.status.is-error { color: var(--error); }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
```

# JavaScript

```javascript
// Compra en pasos.
//
// Decisiones de diseño:
// - El paso vive en la URL (?paso=envio): «atrás» del navegador vuelve al
//   paso anterior y una recarga no te saca de la compra.
// - Los datos viven en sessionStorage («lw-red-compra»): sobreviven a una
//   recarga, pero cada pestaña es una compra distinta, y desaparecen al
//   cerrarla. El método de pago se guarda; un número de tarjeta, NUNCA (eso
//   va directo a la pasarela del banco).
// - Un enlace a un paso sin los datos de los anteriores redirige con
//   replaceState (no deja una entrada rota en el historial).
// - Confirmar envía un POST con una clave de idempotencia (X-Idempotency-Key)
//   que se guarda ANTES de enviar: si la red falla y el usuario reintenta, el
//   servidor recibe la misma clave y puede reconocer el pedido repetido en
//   vez de cobrarlo dos veces. La clave no se imprime: cambia en cada compra.
// - Tras confirmar, los pasos anteriores redirigen a «hecho».
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

const SESSION_KEY = 'lw-red-compra';
const STEPS = ['carrito', 'envio', 'pago', 'revisar', 'hecho'];
const PAYMENT_NAMES = { 'contra-entrega': 'pago contra entrega', transferencia: 'transferencia', tarjeta: 'tarjeta' };
const statusText = document.querySelector('#status');
const logList = document.querySelector('#log');
let historyWorks = true;
let attempts = [];
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
function load() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    return saved?.version === 1 ? saved : { version: 1 };
  } catch {
    return { version: 1 };
  }
}
const save = (data) => sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));

// ¿Se puede estar en este paso con estos datos? Si no, ¿adónde ir?
function allowedStep(wanted, data) {
  if (data.orderNumber) return ['hecho', 'el pedido ya está confirmado'];
  if (!STEPS.includes(wanted) || wanted === 'hecho') return ['carrito', 'ese paso no existe'];
  if (['pago', 'revisar'].includes(wanted) && !data.shipping) return ['envio', 'faltan los datos de envío'];
  if (wanted === 'revisar' && !data.payment) return ['pago', 'falta la forma de pago'];
  return [wanted, ''];
}

function show(step, { focus = true } = {}) {
  const data = load();
  for (const panel of document.querySelectorAll('[data-panel]')) panel.hidden = panel.dataset.panel !== step;
  for (const item of document.querySelectorAll('[data-step]')) {
    if (item.dataset.step === step) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  }
  if (step === 'envio' && data.shipping) {
    for (const [field, value] of Object.entries(data.shipping)) document.querySelector('#shipping-form').elements[field].value = value;
  }
  if (step === 'revisar') {
    const { recipient, street, city, postal } = data.shipping;
    document.querySelector('#review').textContent = `Para ${recipient}, ${street}, ${city} ${postal}. Pago: ${PAYMENT_NAMES[data.payment]}. Total: $515.`;
  }
  if (step === 'hecho') document.querySelector('#done-text').textContent = `Tu número de pedido es ${data.orderNumber}. Te avisaremos cuando salga del tostador.`;
  document.title = `${document.querySelector(`[data-panel="${step}"] h2`).textContent} · Finalizar compra`;
  document.querySelector('#back').disabled = (history.state?.depth ?? 0) === 0; // nunca sale de la página
  if (focus) document.querySelector(`[data-panel="${step}"] h2`).focus();
}

function writeUrl(method, step) {
  if (!historyWorks) return;
  try {
    const depth = history.state?.depth ?? 0;
    history[method]({ depth: method === 'pushState' ? depth + 1 : depth }, '', `?paso=${step}`);
  } catch (error) {
    historyWorks = false;
    logLine(`⚠️ ${error.name}: en esta tarjeta los pasos no cambian la dirección; ábrela con ▶ o en el editor`);
  }
}
function go(step) {
  writeUrl('pushState', step);
  show(step);
  logLine(`🧭 paso: ${step}`);
}
function arrive(wanted, { focus }) {
  const [step, reason] = allowedStep(wanted, load());
  if (step !== wanted) {
    writeUrl('replaceState', step);
    logLine(`↪️ «${wanted}» no está disponible (${reason}): voy a «${step}»`);
  }
  show(step, { focus });
}

document.addEventListener('click', (event) => {
  const anchor = event.target.closest('a[href^="?paso="]');
  if (!anchor || event.metaKey || event.ctrlKey || event.shiftKey) return;
  event.preventDefault();
  go(new URL(anchor.href).searchParams.get('paso'));
});
document.querySelector('#shipping-form').addEventListener('submit', (event) => {
  event.preventDefault();
  save({ ...load(), shipping: Object.fromEntries(new FormData(event.currentTarget)) });
  logLine('💾 envío guardado (sessionStorage de esta pestaña)');
  go('pago');
});
document.querySelector('#payment-form').addEventListener('submit', (event) => {
  event.preventDefault();
  save({ ...load(), payment: new FormData(event.currentTarget).get('method') });
  go('revisar');
});

document.querySelector('#confirm').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  const data = load();
  data.idempotencyKey ??= crypto.randomUUID(); // se guarda ANTES de enviar
  save(data);
  attempts.push(data.idempotencyKey);
  const failNow = document.querySelector('#fail-first').checked && attempts.length === 1;
  button.disabled = true; // nada de dobles clics mientras se envía
  statusText.textContent = 'Confirmando…';
  try {
    const response = await fetch(failNow ? 'http://localhost:59999/' : '/api/demo/echo?status=201', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': data.idempotencyKey },
      body: JSON.stringify({ shipping: data.shipping, payment: data.payment, total: 515 }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const echo = await response.json();
    const sameKey = attempts.every((key) => key === echo.headers['x-idempotency-key']);
    save({ version: 1, orderNumber: 'P-2042' }); // los datos de envío ya no hacen falta
    writeUrl('replaceState', 'hecho'); // «revisar» deja de estar en el historial
    statusText.textContent = '';
    show('hecho');
    logLine(`📨 ${response.status} ${response.statusText} · pedido P-2042 · ${attempts.length} intento(s), misma clave en todos: ${sameKey}`);
  } catch (error) {
    statusText.className = 'status is-error';
    statusText.textContent = 'No se pudo confirmar (sin conexión). Vuelve a pulsar: no se cobrará dos veces.';
    logLine(`📡 ${error.name}: el pedido no se confirmó; la clave se conserva para reintentar`);
  } finally {
    button.disabled = false;
  }
});
document.querySelector('#new-order').addEventListener('click', () => {
  sessionStorage.removeItem(SESSION_KEY);
  attempts = [];
  go('carrito');
});
document.querySelector('#back').addEventListener('click', () => history.back());
window.addEventListener('popstate', () => arrive(new URL(location.href).searchParams.get('paso') ?? 'carrito', { focus: true }));

try {
  if (history.state === null) history.replaceState({ depth: 0 }, '');
} catch (error) {
  historyWorks = false;
  logLine(`⚠️ ${error.name}: en esta tarjeta los pasos no cambian la dirección; ábrela con ▶ o en el editor`);
}
arrive(new URL(location.href).searchParams.get('paso') ?? 'carrito', { focus: false });
logLine(`🛒 compra en esta pestaña: ${load().shipping ? 'con datos de envío guardados' : 'empieza en el carrito'}`);
logLine('Listo: avanza hasta «Revisar», marca «Simular un fallo de red», confirma dos veces y vuelve con «← Atrás»');
```
