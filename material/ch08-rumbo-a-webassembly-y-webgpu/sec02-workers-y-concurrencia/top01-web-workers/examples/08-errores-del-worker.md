---
example_description: "Errores de un worker: una excepción sin atrapar dentro del worker llega a la página como evento error (con message, filename y lineno; preventDefault() la da por manejada) y el worker sigue vivo; un script que no existe dispara un evento error simple, sin mensaje"
example_tags: "javascript|workers|errores|onerror|preventdefault|404"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// El worker es 08-errors/price-worker.js («Assets»): lanza RangeError si no hay unidades.
const worker = new Worker('08-errors/price-worker.js', { type: 'module' });

worker.addEventListener('error', (event) => {
  event.preventDefault(); // manejado: sin esto, la consola mostraría además «Uncaught RangeError…»
  console.log('⚠️ error en el worker →', event.message);
  console.log(`   en ${event.filename.split('/').pop()}, línea ${event.lineno}`);
});

// El desenlace de UN trabajo: el siguiente 'message' o el siguiente 'error'.
function outcome(target) {
  return new Promise((resolve) => {
    const controller = new AbortController(); // para quitar los dos listeners a la vez
    const settle = (event) => { controller.abort(); resolve(event); };
    target.addEventListener('message', settle, { signal: controller.signal });
    target.addEventListener('error', settle, { signal: controller.signal });
  });
}

const batches = [
  { product: 'Café de Chiapas', total: 450, units: 3 },
  { product: 'Miel de Yucatán', total: 320, units: 0 },  // 🐛 → RangeError en el worker
  { product: 'Chocolate de Oaxaca', total: 180, units: 4 }, // el worker sigue vivo tras el error
];
for (const batch of batches) {
  const pending = outcome(worker);
  worker.postMessage(batch);
  const event = await pending;
  if (event.type === 'message') console.log('✅', event.data);
}
worker.terminate();

// Un archivo que no existe (404): no lanza nada al crear el Worker; llega un
// evento 'error' sencillo, sin message ni lineno, porque no hay código que falle.
const missing = new Worker('08-errors/no-existe.js');
const failure = await outcome(missing);
console.log('404 → evento', failure.constructor.name, '· ¿trae message?', 'message' in failure);
missing.terminate();
```
