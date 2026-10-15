---
example_description: "Ejercicio: readOrders lee pedidos NDJSON de un flujo decodificando y partiendo cada trozo por separado; funciona mientras cada trozo trae líneas enteras y falla en cuanto la red corta una línea o un carácter. Arréglalo con un único TextDecoder ({ stream: true }) y un búfer de líneas. Las comprobaciones usan flujos que cortan donde más duele"
example_tags: "javascript|streams|ndjson|textdecoder|bufer|ejercicio"
exercise: true
exercise_title: "Un lector de pedidos que aguanta cualquier corte"
exercise_instructions: "readOrders(stream, onOrder) recorre un ReadableStream de bytes con pedidos en NDJSON (un JSON por línea) y llama a onOrder con cada pedido || Ahora crea un TextDecoder por trozo y parte cada trozo por \\n: si un trozo termina a mitad de una línea, JSON.parse falla; si termina a mitad de un carácter, aparecen � || Usa UN TextDecoder para todo el flujo, con decode(trozo, { stream: true }) || Guarda en un búfer lo que hay tras el último \\n y únelo al trozo siguiente; procesa solo las líneas completas || Al terminar el flujo, decodifica lo pendiente (decode() sin argumentos) y procesa la última línea si no está vacía || Ejecuta hasta que las cuatro comprobaciones salgan ✓"
exercise_hints: "El patrón: buffer += decoder.decode(chunk, { stream: true }); const lines = buffer.split('\\n'); buffer = lines.pop(); || lines.pop() saca el último elemento: lo que hay después del último salto (o '' si el trozo acababa en \\n) || Después del for await, buffer += decoder.decode(); y si buffer.trim() no está vacío, es la última línea"
exercise_solution_example: 09-ej-lector-de-pedidos-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
async function readOrders(stream, onOrder) {
  // TODO: un solo TextDecoder con { stream: true } y un búfer de líneas
  for await (const chunk of stream) {
    const text = new TextDecoder().decode(chunk);
    for (const line of text.split('\n')) {
      if (line.trim() !== '') onOrder(JSON.parse(line));
    }
  }
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
