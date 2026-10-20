---
example_description: "Solución: readOrders con un único TextDecoder ({ stream: true }) y un búfer que solo entrega líneas completas; al terminar el flujo, decode() suelta lo pendiente y se procesa la última línea aunque no acabe en salto"
example_tags: "javascript|streams|ndjson|textdecoder|bufer|solucion"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
async function readOrders(stream, onOrder) {
  const decoder = new TextDecoder(); // ✅ uno para todo el flujo
  let buffer = '';
  for await (const chunk of stream) {
    buffer += decoder.decode(chunk, { stream: true }); // guarda los bytes de un carácter partido
    const lines = buffer.split('\n');
    buffer = lines.pop(); // ✅ la última puede estar a medias: espera al trozo siguiente
    for (const line of lines) {
      if (line.trim() !== '') onOrder(JSON.parse(line));
    }
  }
  buffer += decoder.decode(); // ✅ fin del flujo: lo que quedara pendiente
  if (buffer.trim() !== '') onOrder(JSON.parse(buffer));
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
// Cada una fabrica un ReadableStream que corta los bytes donde ella quiere,
// como podría hacerlo la red.
const ORDERS = [
  { id: 'P-1001', customer: 'Lucía', total: 420 },
  { id: 'P-1002', customer: 'Andrés', total: 145 },
  { id: 'P-1003', customer: 'Begoña', total: 98 },
];
const ndjson = (orders, finalNewline = true) => orders.map((order) => JSON.stringify(order)).join('\n') + (finalNewline ? '\n' : '');
function streamOf(text, cuts) {
  const bytes = new TextEncoder().encode(text);
  const edges = [0, ...cuts, bytes.length];
  return new ReadableStream({
    start(controller) {
      for (let index = 0; index < edges.length - 1; index += 1) controller.enqueue(bytes.slice(edges[index], edges[index + 1]));
      controller.close();
    },
  });
}
// Posición en BYTES justo después del primer byte de `char` (lo parte en dos).
const insideChar = (text, char) => new TextEncoder().encode(text.slice(0, text.indexOf(char))).length + 1;

async function check(description, stream, pick, expected) {
  const seen = [];
  let actual;
  try {
    await readOrders(stream, (order) => seen.push(pick(order)));
    actual = JSON.stringify(seen);
  } catch (error) {
    actual = `${error.name}: ${error.message}`;
  }
  if (actual === JSON.stringify(expected)) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', JSON.stringify(expected), 'y obtuve', actual);
}
const text = ndjson(ORDERS);
const ids = ORDERS.map((order) => order.id);

await check('líneas cortadas entre trozos', streamOf(text, [20, 61, 100]), (order) => order.id, ids);
await check('caracteres de varios bytes partidos (í, é, ñ)', streamOf(text, [insideChar(text, 'í'), insideChar(text, 'é'), insideChar(text, 'ñ')]), (order) => order.customer, ['Lucía', 'Andrés', 'Begoña']);
await check('un byte por trozo', streamOf(text, Array.from({ length: new TextEncoder().encode(text).length - 1 }, (_, i) => i + 1)), (order) => order.total, [420, 145, 98]);
await check('la última línea sin \\n final, también partida', streamOf(ndjson(ORDERS, false), [130]), (order) => order.id, ids);
```
