---
example_description: "Un cliente RPC para workers: con un Proxy, api.quote('Jalisco', 2.5) envía { id, method, args } y devuelve una promesa; cada llamada tiene plazo (AbortSignal.timeout) y se puede cancelar (AbortSignal.any), el worker recibe la señal de la llamada, y los errores (también subclases propias con sus campos) se reconstruyen en la página"
example_tags: "javascript|workers|rpc|proxy|abortsignal|errores|protocolo|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>Cotizador de envíos</h1>
  <section aria-labelledby="quote-title">
    <h2 id="quote-title">Cotizar un paquete</h2>
    <div class="fields">
      <label>Estado de destino <select id="state"></select></label>
      <label>Peso (kg) <input id="kg" type="number" min="0.1" max="30" step="0.1" value="2.5" inputmode="decimal"></label>
      <label>Código postal <input id="postal-code" inputmode="numeric" autocomplete="postal-code" value="44100"></label>
    </div>
    <button id="quote" type="button">Cotizar</button>
    <p><output id="quote-result" aria-live="polite"></output></p>
  </section>
  <section aria-labelledby="report-title">
    <h2 id="report-title">Informe del mes</h2>
    <p class="note">El servicio tarda 1,5 s en prepararlo.</p>
    <div class="buttons">
      <button id="report-short" type="button">Pedir con plazo de 1 s</button>
      <button id="report-long" type="button">Pedir con plazo de 3 s</button>
      <button id="report-cancel" type="button" disabled>Cancelar</button>
    </div>
    <p><output id="report-result" aria-live="polite"></output></p>
  </section>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.app { max-width: 36rem; margin: 0 auto; padding: 1rem; display: grid; gap: 1rem; }
h1 { margin: 0; font-size: 1.25rem; }
h2 { margin: 0 0 0.5rem; font-size: 1rem; }
section { padding: 0.75rem 1rem; border: 1px solid var(--line); border-radius: 0.6rem; background: var(--surface); }
.fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr)); gap: 0.5rem; margin-block-end: 0.6rem; }
label { display: grid; gap: 0.2rem; font-size: 0.9rem; }
input, select, button { font: inherit; color: var(--ink); }
input, select { padding: 0.3rem 0.4rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); }
button { padding: 0.35rem 0.75rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: 0.6; }
:is(input, select, button):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.buttons { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.note { margin: 0 0 0.5rem; color: var(--muted); font-size: 0.85rem; }
output { font-weight: 600; }
.log { margin: 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-size: 0.8rem; }
```

# JavaScript

```javascript
// CLIENTE RPC CON PROXY
//
// Decisiones de diseño:
// - 01-rpc/rpc.js tiene las dos mitades: exposeWorkerApi(api) en el worker y
//   createWorkerClient(worker) en la página. El servicio (01-rpc/shipping-worker.js)
//   son funciones normales: no sabe nada de mensajes ni de ids.
// - El cliente es un Proxy (módulo «Iteradores, generadores y metaprogramación»): cualquier
//   propiedad es un método remoto. 'then' devuelve undefined a propósito: si no,
//   `await api` tomaría el Proxy por una promesa.
// - Plazo por defecto de 1 s con AbortSignal.timeout, combinado con la señal de quien
//   llama mediante AbortSignal.any. Al abortar, la promesa se rechaza al momento con
//   el motivo de la señal y el worker recibe { id, cancel: true } para dejar de trabajar.
// - Los errores viajan como datos (nombre, mensaje y campos propios) y se reconstruyen:
//   el clonado estructurado convertiría un ValidationError en un Error sin su campo.
// - Nunca se imprime el Proxy en la consola (LearnWeb ejecutaría sus trampas al mostrarlo).
//
// Alcance: HTML, CSS, el capítulo de JavaScript (clases, Proxy, promesas, módulos),
// eventos y formularios del capítulo 6, y este módulo.
import { createWorkerClient } from './01-rpc/rpc.js';

const $ = (selector) => document.querySelector(selector);
const formatMXN = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
function report(text) {
  console.log(text);
  $('#log').append(Object.assign(document.createElement('li'), { textContent: text }));
}

const worker = new Worker('01-rpc/shipping-worker.js', { type: 'module' });
const api = createWorkerClient(worker, { timeout: 1000 });
addEventListener('pagehide', () => api.terminate());

// Por qué hace falta reconstruir los errores:
class ValidationError extends Error {
  name = 'ValidationError';
  constructor(message, field) {
    super(message);
    this.field = field;
  }
}
const cloned = structuredClone(new ValidationError('prueba', 'state'));
report(`🧪 structuredClone de un ValidationError → llega como «${cloned.name}» y con field ${cloned.field}`);

function describeError(error) {
  if (error.name === 'ValidationError') return `ValidationError en «${error.field}»: ${error.message}`;
  if (error instanceof RangeError) return `RangeError (instanceof RangeError: true): ${error.message}`;
  return `${error.name}: ${error.message}`;
}

async function quote(state, kg, postalCode) {
  try {
    const { zone } = await api.validatePostalCode(postalCode);
    const { total } = await api.quote(state, kg);
    const text = `🚚 ${state}, ${kg} kg (CP ${postalCode}, zona ${zone}) → ${formatMXN(total)}`;
    $('#quote-result').textContent = text;
    report(text);
  } catch (error) {
    const text = `⚠️ ${state}, ${kg} kg → ${describeError(error)}`;
    $('#quote-result').textContent = text;
    report(text);
  }
}

// Los estados los da el servicio; se añade uno al que no se envía, para ver el error.
for (const state of [...(await api.states()), 'Sonora']) {
  $('#state').append(new Option(state, state));
}
$('#state').value = 'Jalisco';
$('#quote').addEventListener('click', () => quote($('#state').value, $('#kg').valueAsNumber, $('#postal-code').value.trim()));

let reportController = null;
async function requestReport(timeout) {
  reportController = new AbortController();
  for (const id of ['#report-short', '#report-long']) $(id).disabled = true;
  $('#report-cancel').disabled = false;
  $('#report-result').textContent = 'Preparando…';
  try {
    const { month, shipments, revenue } = await api.withOptions({ timeout, signal: reportController.signal }).monthlyReport('octubre');
    report(`📊 informe de ${month}: ${shipments.toLocaleString('es-MX')} envíos · ${formatMXN(revenue)}`);
  } catch (error) {
    const reason = error.name === 'TimeoutError' ? 'el informe tarda 1,5 s y el plazo era 1 s' : 'cancelado por ti';
    report(`${error.name === 'TimeoutError' ? '⏱️' : '⏹'} informe de octubre → ${error.name}: ${reason}`);
  } finally {
    $('#report-result').textContent = $('#log').lastElementChild.textContent;
    for (const id of ['#report-short', '#report-long']) $(id).disabled = false;
    $('#report-cancel').disabled = true;
    reportController = null;
  }
}
$('#report-short').addEventListener('click', () => requestReport(1000));
$('#report-long').addEventListener('click', () => requestReport(3000));
$('#report-cancel').addEventListener('click', () => reportController?.abort());

// Al cargar: una cotización correcta y dos que fallan de formas distintas.
await quote('Jalisco', 2.5, '44100');
await quote('Sonora', 1, '83000');
await quote('Jalisco', 45, '44100');
report('Listo: cotiza otro envío, o pide el informe con plazo de 1 s (vence) o de 3 s (y prueba «Cancelar»)');
```
