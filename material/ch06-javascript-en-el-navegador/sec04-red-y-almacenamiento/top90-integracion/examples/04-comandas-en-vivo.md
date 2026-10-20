---
example_description: "Un panel de cocina que recibe las comandas en vivo: un flujo NDJSON del servidor de prueba pasa por TextDecoderStream y un TransformStream que corta líneas; cada comanda se pinta al llegar, una barra cuenta las recibidas, «Detener» aborta el flujo y la página muestra los estados conectando, en vivo, completo y detenido"
example_tags: "javascript|streams|ndjson|pipethrough|abortcontroller|estados|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Comandas de cocina</h1>
  <p class="actions">
    <button id="connect" type="button">Conectar</button>
    <button id="stop" type="button">Detener</button>
  </p>
  <label for="received">Comandas recibidas</label>
  <progress id="received" max="8" value="0">0 de 8</progress>
  <p id="state" role="status">Conectando…</p>
  <ol id="tickets" class="tickets" aria-busy="true"></ol>
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
label {
  display: block;
  font-weight: 600;
}
progress {
  width: 100%;
  accent-color: #1d4ed8;
}
.actions {
  display: flex;
  gap: 0.5rem;
}
button {
  font: inherit;
  padding: 0.4rem 0.8rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:disabled {
  color: #616e7c;
  cursor: not-allowed;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.tickets {
  display: grid;
  gap: 0.3rem;
  padding-left: 1.5rem;
}
.tickets li {
  padding: 0.3rem 0.5rem;
  border-radius: 0.4rem;
  background: #ffffff;
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
// Combina «Streams y progreso» (NDJSON, pipeThrough, búfer de líneas) y
// «Peticiones con fetch» (cancelar con una señal, estados de la interfaz).
// El servidor de prueba envía líneas {"n":3,"of":8,"text":"…"}; cada número
// elige una comanda de esta lista (el servidor no sabe de cocina).
const ORDERS = ['Mesa 4 · 2 × pozole rojo', 'Para llevar · 3 × tamales de mole', 'Mesa 1 · sopa de lima',
  'Mesa 7 · chiles en nogada', 'Barra · 2 × café de olla', 'Mesa 4 · flan napolitano',
  'Para llevar · pan de muerto', 'Mesa 2 · 2 × mole poblano'];
const connectButton = document.querySelector('#connect');
const stopButton = document.querySelector('#stop');
const progressBar = document.querySelector('#received');
const stateText = document.querySelector('#state');
const ticketList = document.querySelector('#tickets');
const logList = document.querySelector('#log');
let connection = null; // AbortController de la conexión abierta
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

function splitLines() {
  let buffer = '';
  return new TransformStream({
    transform(text, controller) {
      buffer += text;
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) if (line !== '') controller.enqueue(line);
    },
    flush(controller) {
      if (buffer !== '') controller.enqueue(buffer);
    },
  });
}

function setState(text, live) {
  stateText.textContent = text;
  ticketList.setAttribute('aria-busy', String(live));
  connectButton.disabled = live;
  stopButton.disabled = !live;
}

async function connect() {
  connection = new AbortController();
  ticketList.replaceChildren();
  progressBar.value = 0;
  setState('Conectando…', true);
  let count = 0;
  try {
    const response = await fetch('/api/demo/stream?format=ndjson&chunks=8&interval=300', { signal: connection.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    setState('En vivo: las comandas aparecen al llegar.', true);
    const lines = response.body.pipeThrough(new TextDecoderStream()).pipeThrough(splitLines());
    for await (const line of lines) {
      const { n, of: total } = JSON.parse(line);
      const order = ORDERS[(n - 1) % ORDERS.length];
      count = n;
      progressBar.max = total;
      progressBar.value = n;
      progressBar.textContent = `${n} de ${total}`;
      ticketList.append(Object.assign(document.createElement('li'), { textContent: order }));
      logLine(`🧾 ${n}/${total} · ${order}`);
    }
    setState(`Servicio completo: ${count} comandas.`, false);
    logLine(`✅ servicio completo: ${count} comandas`);
  } catch (error) {
    if (error.name === 'AbortError') {
      setState(`Detenido con ${count} comanda(s). Pulsa «Conectar» para empezar de nuevo.`, false);
      logLine(`⏹️ detenido por el usuario tras ${count} comanda(s)`);
    } else {
      setState(`Se perdió la conexión (${error.message}).`, false);
      logLine(`⛔ ${error.name}: ${error.message}`);
    }
  }
}

connectButton.addEventListener('click', () => {
  logList.replaceChildren();
  connect();
});
stopButton.addEventListener('click', () => connection?.abort()); // corta el fetch Y el flujo
connect();
logLine('Listo: mira llegar las 8 comandas; luego «Conectar» y «Detener» a mitad');
```
