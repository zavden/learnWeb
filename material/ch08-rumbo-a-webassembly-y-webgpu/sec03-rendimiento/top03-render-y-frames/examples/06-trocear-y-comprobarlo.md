---
example_description: "Trocear un trabajo de 140 ms y comprobarlo con la API Long Tasks: de una vez es una tarea larga; en rebanadas de 8 ms que ceden el turno con scheduler.yield() (o setTimeout) no queda ninguna, con el mismo resultado. Lo que antes se veía a ojo ahora se mide"
example_tags: "javascript|rendimiento|long-tasks|trocear|scheduler-yield|performanceobserver"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Facturar 400 pedidos</h1>
  <p>
    <button id="run" type="button">Facturar</button>
    <output id="state" for="run">Sin facturar todavía</output>
  </p>
  <progress id="progress" max="400" value="0" aria-label="Pedidos facturados"></progress>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; cursor: pointer; }
button:disabled { cursor: progress; }
button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
output { margin-inline-start: 0.5rem; color: #475569; }
progress { inline-size: 100%; block-size: 1rem; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
const ORDERS = Array.from({ length: 400 }, (_, i) => ({ id: `F-${7000 + i}`, subtotal: 150 + (i * 37) % 900 }));
const runButton = document.querySelector('#run');
const state = document.querySelector('#state');
const progress = document.querySelector('#progress');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
function busyFor(ms) {
  const end = performance.now() + ms;
  while (performance.now() < end) {}
}
// Facturar un pedido: 0,35 ms de trabajo simulado y un importe exacto. 400 pedidos ≈ 140 ms.
function invoice(order) {
  busyFor(0.35);
  return Math.round(order.subtotal * 1.16 * 100);
}

// Ceder el turno: scheduler.yield() en Chrome; setTimeout donde no exista.
const yieldToMain = () => (typeof globalThis.scheduler?.yield === 'function'
  ? scheduler.yield()
  : new Promise((resolve) => setTimeout(resolve, 0)));

// Las tareas largas se cuentan con la API Long Tasks (Chrome).
const longTasks = [];
if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
  new PerformanceObserver((list) => longTasks.push(...list.getEntries())).observe({ type: 'longtask' });
}
const countLongTasks = (from, to) => longTasks.filter((task) => task.startTime < to && task.startTime + task.duration > from).length;
const settle = () => new Promise((resolve) => setTimeout(resolve, 300)); // da tiempo a que lleguen las entradas

// 🐛 De una vez: una sola tarea de ~140 ms.
function invoiceAll() {
  let cents = 0;
  for (const order of ORDERS) cents += invoice(order);
  progress.value = ORDERS.length;
  return cents;
}
// ✅ En rebanadas medidas por TIEMPO (8 ms), cediendo el turno entre una y otra.
async function invoiceInSlices() {
  let cents = 0;
  let slices = 1;
  let sliceStart = performance.now();
  for (let i = 0; i < ORDERS.length; i++) {
    cents += invoice(ORDERS[i]);
    if (performance.now() - sliceStart > 8) {
      progress.value = i + 1;
      await yieldToMain();
      slices += 1;
      sliceStart = performance.now();
    }
  }
  progress.value = ORDERS.length;
  return { cents, slices };
}

runButton.addEventListener('click', async () => {
  runButton.disabled = true;
  state.textContent = 'facturando…';
  progress.value = 0;
  let start = performance.now();
  const centsAtOnce = invoiceAll();
  let end = performance.now();
  await settle();
  logLine(`🐛 de una vez → tareas largas: ${countLongTasks(start, end)}`);

  progress.value = 0;
  start = performance.now();
  const { cents, slices } = await invoiceInSlices();
  end = performance.now();
  await settle();
  logLine(`✅ en rebanadas de 8 ms → tareas largas: ${countLongTasks(start, end)}`);
  logLine(`¿el mismo total? ${cents === centsAtOnce} · total facturado: $${(cents / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`);
  logLine(`✅ rebanadas: ≈ ${slices} · tiempo total ≈ ${(end - start).toFixed(0)} ms`);
  state.textContent = 'Listo: pulsa otra vez para repetir';
  runButton.disabled = false;
});
console.log('Listo: pulsa «Facturar» (unos 300 ms de trabajo en total)');

// Recuerda el dato medido en «Frames de animación y tiempo»: las continuaciones de
// scheduler.yield() tienen prioridad y Chrome pinta poco entre ellas. Sin tareas largas, los
// clics se atienden enseguida; si además una animación hecha con JavaScript tiene que verse
// fluida, cede de vez en cuando hasta el próximo frame (rAF + setTimeout).
```
