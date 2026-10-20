---
example_description: "Un anfitrión de plugins de descuento para una tienda: cada plugin es un .wasm (o uno tuyo) que se compila, se revisa (qué importa y qué exporta) y solo se instancia si pide las capacidades que el anfitrión concede; se ejecuta en un worker con un plazo por llamada, su texto llega por env.log desde su propia memoria y sus fallos (una trampa, un descuento imposible) se aíslan sin romper la compra"
example_tags: "javascript|webassembly|wasm|plugins|sandbox|capacidades|imports|worker|seguridad|profesional"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<main class="host">
  <header>
    <h1>Descuentos con plugins</h1>
    <p>Cada descuento es un módulo de WebAssembly que la tienda no ha escrito y no tiene por qué creerse.</p>
  </header>
  <section aria-labelledby="plugins-title">
    <h2 id="plugins-title">Plugins</h2>
    <ul id="plugins" class="plugins"></ul>
    <label class="own">Prueba un plugin tuyo (un .wasm que exporte <code>discount(centavos) → centavos</code>)
      <input id="own" type="file" accept=".wasm,application/wasm">
    </label>
  </section>
  <section class="cart" aria-labelledby="cart-title">
    <h2 id="cart-title">Compra</h2>
    <label>Total del carrito (MXN) <input id="total" type="number" min="0" max="100000" step="0.01" value="1250"></label>
    <button id="apply" type="button">Aplicar descuentos</button>
    <table>
      <caption class="visually-hidden">Descuentos aplicados</caption>
      <tbody id="breakdown"></tbody>
    </table>
  </section>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; --good: #166534; --bad: #9f1239; --warn: #854d0e; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.host { max-width: 40rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0; font-size: 1.3rem; }
h2 { margin: 1rem 0 0.4rem; font-size: 1rem; }
header p { margin: 0.2rem 0 0; color: var(--muted); }
.plugins { display: grid; gap: 0.4rem; margin: 0; padding: 0; list-style: none; }
.plugins li { display: grid; grid-template-columns: auto 1fr; gap: 0.1rem 0.6rem; align-items: center; padding: 0.5rem 0.6rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); }
.plugins .detail { grid-column: 2; font-size: 0.8rem; color: var(--muted); }
.plugins [data-state="refused"] .detail, .plugins [data-state="failed"] .detail { color: var(--bad); }
.own { display: grid; gap: 0.25rem; margin-block-start: 0.6rem; font-size: 0.85rem; }
.cart label { display: grid; gap: 0.2rem; max-inline-size: 16rem; font-size: 0.9rem; }
input, button { font: inherit; padding: 0.3rem 0.6rem; border: 1px solid #64748b; border-radius: 0.4rem; background: var(--surface); color: var(--ink); }
input[type="checkbox"] { inline-size: 1.1rem; block-size: 1.1rem; }
button { margin-block-start: 0.5rem; cursor: pointer; }
:is(input, button):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
table { inline-size: 100%; margin-block-start: 0.6rem; border-collapse: collapse; background: var(--surface); }
td { padding: 0.3rem 0.5rem; border-bottom: 1px solid var(--line); }
td:last-child { text-align: end; font-variant-numeric: tabular-nums; white-space: nowrap; }
tr.total td { font-weight: 700; }
tr.warning td { color: var(--warn); }
code { font-family: Menlo, Consolas, monospace; font-size: 0.85em; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; overflow-wrap: anywhere; }
.visually-hidden { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
```

# JavaScript

```javascript
// Un anfitrión de plugins de WebAssembly.
//
// Decisiones de diseño (el «sandbox», en cuatro capas):
// 1. Capacidades. Un módulo no puede hacer nada que no importe (lección «Qué es WebAssembly»).
//    Antes de instanciarlo, WebAssembly.Module.imports() dice qué pide; si pide algo que el
//    anfitrión no concede (aquí solo env.log), no se instancia.
// 2. Memoria propia. Cada plugin tiene su memoria lineal: no ve la de los demás ni la página.
//    env.log(ptr, len) lee el texto de la memoria DEL plugin, con un tope de 200 bytes.
// 3. Tiempo. WebAssembly no tiene guarda de bucles: un plugin que no termina congelaría la
//    página. Por eso se ejecutan en un worker, con un plazo de 500 ms por llamada; si vence, se
//    termina el worker, se crea otro y se vuelven a cargar los demás plugins.
// 4. Resultados. Lo que devuelve un plugin se comprueba: un entero entre 0 y el total. Una
//    trampa o un valor imposible se ignoran con un aviso; la compra sigue.
// Los plugins de la lección están en assets/plugins/, con su WAT al lado (.wat.txt).
//
// Alcance: HTML, CSS, JavaScript, DOM, eventos, File API, workers, fetch, Intl y este módulo.
const PLUGINS = ['buen-fin.wasm', 'envio-gratis.wasm', 'pide-red.wasm', 'se-rompe.wasm'];
const GRANTED = new Set(['env.log']); // las capacidades que concede la tienda
const DEADLINE_MS = 500;
const MAX_SHARE = 0.3; // los descuentos juntos, como mucho el 30 % del total

const WORKER_CODE = `
  const plugins = new Map();
  self.onmessage = async ({ data }) => {
    if (data.type === 'load') {
      const entry = { instance: null, messages: [] };
      const imports = { env: { log(ptr, len) {
        const memory = entry.instance?.exports.memory;
        if (!(memory instanceof WebAssembly.Memory)) throw new TypeError('env.log necesita que el plugin exporte su memoria');
        entry.messages.push(new TextDecoder().decode(new Uint8Array(memory.buffer, ptr, Math.min(len, 200))));
      } } };
      try {
        entry.instance = await WebAssembly.instantiate(data.module, imports);
        plugins.set(data.name, entry);
        self.postMessage({ id: data.id, ok: true });
      } catch (error) {
        self.postMessage({ id: data.id, ok: false, error: error.name + ': ' + error.message });
      }
    } else {
      const entry = plugins.get(data.name);
      entry.messages = [];
      try {
        const value = entry.instance.exports.discount(data.total);
        self.postMessage({ id: data.id, ok: true, value, messages: entry.messages });
      } catch (error) {
        self.postMessage({ id: data.id, ok: false, error: error.name + ': ' + error.message, messages: entry.messages });
      }
    }
  };
`;
const workerUrl = URL.createObjectURL(new Blob([WORKER_CODE], { type: 'text/javascript' }));
let worker = null;
let nextId = 1;
const pending = new Map();
function startWorker() {
  worker = new Worker(workerUrl);
  worker.onmessage = ({ data }) => {
    const request = pending.get(data.id);
    if (!request) return;
    pending.delete(data.id);
    clearTimeout(request.timer);
    request.resolve(data);
  };
}
function ask(message) {
  return new Promise((resolve) => {
    const id = nextId++;
    const timer = setTimeout(() => {
      pending.delete(id);
      resolve({ ok: false, timeout: true, error: `no respondió en ${DEADLINE_MS} ms` });
    }, DEADLINE_MS);
    pending.set(id, { resolve, timer });
    worker.postMessage({ ...message, id });
  });
}
startWorker();
addEventListener('pagehide', () => worker.terminate());

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const plugins = []; // { name, module, state: 'ready' | 'refused' | 'failed', item, checkbox }
const list = document.querySelector('#plugins');
const breakdown = document.querySelector('#breakdown');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

function addRow(name) {
  const item = document.createElement('li');
  const checkbox = Object.assign(document.createElement('input'), { type: 'checkbox', id: `plugin-${plugins.length}`, disabled: true });
  const label = Object.assign(document.createElement('label'), { htmlFor: checkbox.id, textContent: name });
  const detail = Object.assign(document.createElement('span'), { className: 'detail', textContent: 'revisando…' });
  item.append(checkbox, label, detail);
  list.append(item);
  return { item, checkbox, detail };
}
async function register(name, module) {
  const row = addRow(name);
  const plugin = { name, module, state: 'refused', ...row };
  plugins.push(plugin);
  const wanted = WebAssembly.Module.imports(module).map((entry) => `${entry.module}.${entry.name}`);
  const refused = WebAssembly.Module.imports(module).filter((entry) => !GRANTED.has(`${entry.module}.${entry.name}`) || entry.kind !== 'function');
  const hasDiscount = WebAssembly.Module.exports(module).some((entry) => entry.name === 'discount' && entry.kind === 'function');
  const asks = wanted.length ? `pide ${wanted.join(', ')}` : 'no pide nada';
  let verdict;
  if (refused.length) verdict = `🚫 ${refused.map((entry) => `${entry.module}.${entry.name}`).join(', ')} no se concede: no se instancia`;
  else if (!hasDiscount) verdict = '🚫 no exporta discount: no se instancia';
  else {
    const reply = await ask({ type: 'load', name, module }); // el Module viaja al worker (lección 4)
    if (reply.ok) {
      plugin.state = 'ready';
      verdict = '✅ cargado';
    } else verdict = `🚫 ${reply.error}`;
  }
  row.item.dataset.state = plugin.state;
  row.detail.textContent = `${asks} · ${verdict}`;
  row.checkbox.disabled = plugin.state !== 'ready';
  row.checkbox.checked = plugin.state === 'ready';
  logLine(`${name} → ${asks} · ${verdict}`);
}

async function restartWithout(hung) { // un plugin colgado: otro worker, y los demás otra vez
  worker.terminate();
  for (const request of pending.values()) clearTimeout(request.timer);
  pending.clear();
  startWorker();
  hung.state = 'failed';
  hung.item.dataset.state = 'failed';
  hung.checkbox.checked = false;
  hung.checkbox.disabled = true;
  hung.detail.textContent = `⏱ no terminó en ${DEADLINE_MS} ms: desactivado`;
  for (const plugin of plugins.filter((entry) => entry.state === 'ready')) await ask({ type: 'load', name: plugin.name, module: plugin.module });
}

async function apply() {
  const totalCents = Math.round(document.querySelector('#total').valueAsNumber * 100);
  if (!Number.isInteger(totalCents) || totalCents < 0 || totalCents > 10000000) {
    logLine('❗ el total va de $0.00 a $100,000.00');
    return;
  }
  const rows = [];
  let discount = 0;
  for (const plugin of plugins.filter((entry) => entry.state === 'ready' && entry.checkbox.checked)) {
    const reply = await ask({ type: 'discount', name: plugin.name, total: totalCents });
    const said = reply.messages?.length ? ` · dice «${reply.messages.join(' / ')}»` : '';
    if (reply.timeout) {
      await restartWithout(plugin);
      rows.push([`⏱ ${plugin.name}: ${reply.error}; se desactiva`, '—', true]);
    } else if (!reply.ok) {
      rows.push([`⚠️ ${plugin.name}: ${reply.error}; se ignora`, '—', true]);
    } else if (!Number.isInteger(reply.value) || reply.value < 0 || reply.value > totalCents) {
      rows.push([`⚠️ ${plugin.name}: devolvió ${reply.value}, un descuento imposible; se ignora`, '—', true]);
    } else {
      discount += reply.value;
      rows.push([`${plugin.name}${said}`, reply.value ? `−${money.format(reply.value / 100)}` : money.format(0), false]);
    }
  }
  const cap = Math.floor(totalCents * MAX_SHARE);
  if (discount > cap) {
    rows.push([`tope del ${MAX_SHARE * 100} %`, `+${money.format((discount - cap) / 100)}`, true]);
    discount = cap;
  }
  const toPay = totalCents - discount;
  breakdown.replaceChildren(...rows.map(([text, amount, warning]) => {
    const row = document.createElement('tr');
    if (warning) row.className = 'warning';
    row.append(Object.assign(document.createElement('td'), { textContent: text }), Object.assign(document.createElement('td'), { textContent: amount }));
    return row;
  }));
  const totalRow = document.createElement('tr');
  totalRow.className = 'total';
  totalRow.append(Object.assign(document.createElement('td'), { textContent: 'A pagar' }), Object.assign(document.createElement('td'), { textContent: money.format(toPay / 100) }));
  breakdown.append(totalRow);
  for (const [text, amount] of rows) logLine(`${text} → ${amount}`);
  logLine(`total → ${money.format(totalCents / 100)} − ${money.format(discount / 100)} = ${money.format(toPay / 100)}`);
}

logLine(`anfitrión → concede ${[...GRANTED].join(', ')} · plazo de ${DEADLINE_MS} ms por llamada, en un worker`);
for (const name of PLUGINS) await register(name, await WebAssembly.compileStreaming(fetch(`plugins/${name}`)));
document.querySelector('#apply').addEventListener('click', apply);
document.querySelector('#own').addEventListener('change', async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  try {
    await register(file.name, await WebAssembly.compile(await file.arrayBuffer()));
  } catch (error) {
    logLine(`${file.name} → 🚫 ${error.name}: ${error.message}`);
  }
});
logLine(`Listo: total ${money.format(1250)}; pulsa «Aplicar descuentos»`);
```
