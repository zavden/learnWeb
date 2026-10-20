---
example_description: "Un comprobador de CORS: para cada petición predice con las reglas del navegador qué pasará (mismo origen, permiso con *, sin permiso, preflight, cabeceras no permitidas, credenciales, no-cors, cabeceras expuestas), la hace de verdad y compara; nueve casos al cargar y un formulario para probar combinaciones propias"
example_tags: "javascript|cors|origen|preflight|credentials|no-cors|diagnostico|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="checker">
  <h1>Comprobador de CORS</h1>
  <p class="intro">Origen de esta página: <output id="page-origin"></output></p>
  <form id="custom" class="custom">
    <label>Destino
      <select name="target">
        <option value="same">este servidor (/api/demo/echo)</option>
        <option value="other">otro origen (127.0.0.1:3001)</option>
      </select>
    </label>
    <label>Política del servidor
      <select name="cors">
        <option value="*">Allow-Origin: *</option>
        <option value="no">sin cabeceras CORS</option>
        <option value="origin">refleja tu origen + credenciales</option>
      </select>
    </label>
    <label>Método
      <select name="method"><option>GET</option><option>PUT</option></select>
    </label>
    <label>Cabecera extra
      <select name="header">
        <option value="">ninguna</option>
        <option value="X-Pedido">X-Pedido</option>
        <option value="Idempotency-Key">Idempotency-Key</option>
      </select>
    </label>
    <label><input type="checkbox" name="credentials"> credentials: 'include'</label>
    <label><input type="checkbox" name="nocors"> mode: 'no-cors'</label>
    <label><input type="checkbox" name="expose"> el servidor expone X-Demo-Server</label>
    <button type="submit">Comprobar</button>
  </form>
  <table>
    <caption>Predicción y resultado real</caption>
    <thead><tr><th scope="col">Petición</th><th scope="col">Qué pasa y por qué</th></tr></thead>
    <tbody id="rows"></tbody>
  </table>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1f2933; --muted: #52606d; --line: #cbd2d9; --surface: #ffffff; --page: #f5f7fa; --accent: #1d4ed8; --ok: #166534; --error: #b91c1c; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.checker { max-width: 36rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0; font-size: 1.25rem; }
output { font-family: Menlo, Consolas, monospace; font-weight: 700; }
.custom { display: flex; flex-wrap: wrap; gap: 0.4rem 0.9rem; align-items: end; margin: 0.5rem 0 0.75rem; font-size: 0.9rem; }
.custom > label:has(select) { display: grid; gap: 0.15rem; }
select, button { font: inherit; padding: 0.25rem 0.5rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: var(--surface); color: var(--ink); }
button { cursor: pointer; }
:is(select, button, input):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
table { width: 100%; border-collapse: collapse; background: var(--surface); font-size: 0.8rem; }
caption { text-align: start; font-weight: 700; padding-bottom: 0.3rem; }
th, td { padding: 0.35rem 0.5rem; border: 1px solid var(--line); text-align: start; vertical-align: top; }
td:first-child { font-family: Menlo, Consolas, monospace; overflow-wrap: anywhere; }
.match { color: var(--ok); font-weight: 700; }
.mismatch { color: var(--error); font-weight: 700; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
```

# JavaScript

```javascript
// Comprobador de CORS: predicción con las reglas del navegador + prueba real.
//
// Decisiones de diseño:
// - predict() aplica las reglas de la lección «Orígenes y CORS» SIN hacer la
//   petición; check() la hace y compara. Si alguna vez no coinciden, la tabla
//   lo marca: la herramienta se comprueba a sí misma.
// - El «mismo origen» se calcula con los orígenes reales (location.origin):
//   en una tarjeta de la teoría (origen null) todo es de otro origen, y las
//   predicciones lo tienen en cuenta.
// - La consola de DevTools (abre con ↗) da el motivo exacto de cada bloqueo;
//   el script solo ve TypeError: Failed to fetch.
// - El servidor de prueba permite en el preflight Content-Type, Authorization,
//   Accept y las cabeceras X-…; su política se elige con ?cors= y ?expose=1.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

const OTHER = 'http://127.0.0.1:3001/api/demo/echo';
const SERVER_ALLOWS = (header) => ['content-type', 'authorization', 'accept'].includes(header) || header.startsWith('x-');
const SIMPLE_HEADERS = ['accept', 'accept-language', 'content-language', 'content-type'];
const SIMPLE_TYPES = ['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain'];
const rowsBody = document.querySelector('#rows');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

function needsPreflight({ method = 'GET', headers = {} }) {
  if (!['GET', 'HEAD', 'POST'].includes(method)) return true;
  return Object.entries(headers).some(([headerName, value]) => !SIMPLE_HEADERS.includes(headerName.toLowerCase())
    || (headerName.toLowerCase() === 'content-type' && !SIMPLE_TYPES.includes(value.split(';')[0].trim())));
}

function predict(url, init) {
  const target = new URL(url, document.baseURI);
  const policy = target.searchParams.get('cors') ?? '*';
  const exposed = target.searchParams.get('expose') === '1';
  if (target.origin === location.origin) return { outcome: 'basic', why: 'mismo origen: CORS no interviene' };
  if (init.mode === 'no-cors') return { outcome: 'opaque', why: 'no-cors: respuesta opaca (status 0, nada legible)' };
  const preflight = needsPreflight(init);
  if (policy === 'no') return { outcome: 'bloqueada', why: `${preflight ? 'el preflight' : 'la respuesta'} no trae Access-Control-Allow-Origin` };
  const refused = Object.keys(init.headers ?? {}).map((headerName) => headerName.toLowerCase()).find((headerName) => !SERVER_ALLOWS(headerName));
  if (preflight && refused) return { outcome: 'bloqueada', why: `el preflight no permite la cabecera ${refused}` };
  if (init.credentials === 'include' && policy !== 'origin') return { outcome: 'bloqueada', why: 'con credenciales no vale «*»' };
  const grant = policy === 'origin' ? 'el servidor nombra tu origen y permite credenciales' : 'permiso con «*»';
  return { outcome: 'cors', why: `${preflight ? 'preflight aceptado; ' : ''}${grant}; X-Demo-Server ${exposed ? 'visible (expuesta)' : 'oculta (no expuesta)'}`, exposed };
}

async function check(label, url, init = {}) {
  const expected = predict(url, init);
  let actual;
  try {
    const response = await fetch(url, init);
    actual = { outcome: response.type, status: response.status, header: response.headers.get('x-demo-server') };
  } catch (error) {
    actual = { outcome: 'bloqueada', error: `${error.name}: ${error.message}` };
  }
  const headerOk = expected.outcome !== 'cors' || (actual.header !== null) === Boolean(expected.exposed);
  const match = actual.outcome === expected.outcome && headerOk;
  const result = actual.outcome === 'bloqueada' ? 'bloqueada' : `${actual.outcome} ${actual.status}`;
  const row = rowsBody.insertRow();
  row.insertCell().textContent = label;
  const cell = row.insertCell();
  cell.append(Object.assign(document.createElement('span'), { className: match ? 'match' : 'mismatch', textContent: match ? '✓ ' : '✗ ' }),
    `${result} · ${expected.why}${match ? '' : ` (se predijo ${expected.outcome})`}`);
  logLine(`${match ? '✓' : '✗'} ${label} → ${result} · ${expected.why}`);
  return match;
}

const PRESETS = [
  ['GET a este servidor, sin CORS', '/api/demo/echo?cors=no'],
  ['GET a 127.0.0.1, Allow-Origin *', OTHER],
  ['GET a 127.0.0.1, sin CORS', `${OTHER}?cors=no`],
  ['PUT con JSON y X-Cart-Version', OTHER, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Cart-Version': '7' }, body: '{"sku":"CAF-OAX-500"}' }],
  ['POST con Idempotency-Key', OTHER, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': 'P-2041' }, body: '{}' }],
  ['GET con credenciales y «*»', OTHER, { credentials: 'include' }],
  ['GET con credenciales, origen reflejado', `${OTHER}?cors=origin`, { credentials: 'include' }],
  ['GET no-cors a un servidor sin CORS', `${OTHER}?cors=no`, { mode: 'no-cors' }],
  ['GET a 127.0.0.1 con expose=1', `${OTHER}?expose=1`],
];

document.querySelector('#custom').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const url = new URL(data.get('target') === 'same' ? '/api/demo/echo' : OTHER, document.baseURI);
  if (data.get('cors') !== '*') url.searchParams.set('cors', data.get('cors'));
  if (data.has('expose')) url.searchParams.set('expose', '1');
  const init = { method: data.get('method'), headers: {} };
  if (data.get('header')) init.headers[data.get('header')] = 'P-2041';
  if (data.has('credentials')) init.credentials = 'include';
  if (data.has('nocors')) init.mode = 'no-cors';
  if (init.mode === 'no-cors' && init.method === 'PUT') {
    logLine('⚠️ no-cors solo admite GET, HEAD y POST: fetch lanzaría un TypeError antes de enviar nada');
    return;
  }
  const label = `${init.method} ${url.origin === location.origin ? 'mismo origen' : url.host}${url.search} ${Object.keys(init.headers).join(' ')}${init.credentials ? ' +credenciales' : ''}${init.mode ? ' no-cors' : ''}`;
  check(label.trim(), url.href, init);
});

async function start() {
  document.querySelector('#page-origin').textContent = location.origin;
  let matches = 0;
  for (const [label, url, init] of PRESETS) {
    if (await check(label, url, init)) matches += 1;
  }
  logLine(`${matches} de ${PRESETS.length} resultados coinciden con la predicción`);
  logLine('Listo: combina opciones en el formulario y pulsa «Comprobar»; con ↗ y DevTools verás el motivo de cada bloqueo');
}
start();
```
