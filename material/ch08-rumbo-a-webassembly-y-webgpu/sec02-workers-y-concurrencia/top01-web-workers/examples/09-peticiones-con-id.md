---
example_description: "Un protocolo de petición y respuesta: cada mensaje lleva un id y callWorker devuelve una promesa que se cumple con la respuesta de ese id, aunque las respuestas lleguen desordenadas; los errores del worker viajan como respuestas con ok: false y rechazan su promesa"
example_tags: "javascript|workers|promesas|protocolo|postmessage|withresolvers|errores"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// El worker es 09-requests/shop-worker.js («Assets»).
const worker = new Worker('09-requests/shop-worker.js', { type: 'module' });
const pending = new Map(); // id → { resolve, reject } de cada petición en curso
let nextId = 1;

worker.onmessage = (event) => {
  const { id, ok, result, error } = event.data;
  const request = pending.get(id);
  pending.delete(id);
  if (ok) request.resolve(result);
  else request.reject(new Error(error));
};

// Una petición = un mensaje con id + una promesa que espera la respuesta con ese id.
function callWorker(type, payload) {
  const id = nextId++;
  const { promise, resolve, reject } = Promise.withResolvers();
  pending.set(id, { resolve, reject });
  worker.postMessage({ id, type, payload });
  return promise;
}

const formatMXN = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

// Tres peticiones a la vez. La de Yucatán responde la última, pero Promise.all
// devuelve los resultados en el orden de las PETICIONES, no en el de llegada.
const [toYucatan, toPuebla, tax] = await Promise.all([
  callWorker('shipping', { state: 'Yucatán', kg: 3 }),
  callWorker('shipping', { state: 'Puebla', kg: 3 }),
  callWorker('tax', { subtotal: 1385 }),
]);
console.log('envío a Yucatán (3 kg) →', formatMXN(toYucatan));
console.log('envío a Puebla (3 kg) →', formatMXN(toPuebla));
console.log('IVA de $1,385.00 →', formatMXN(tax));

for (const [type, payload] of [['shipping', { state: 'Sonora', kg: 1 }], ['discount', { code: 'MUERTOS26' }]]) {
  try {
    await callWorker(type, payload);
  } catch (error) {
    console.log(`⚠️ ${type} →`, error.message); // el error del worker, como un rechazo normal
  }
}
console.log('peticiones pendientes →', pending.size);
worker.terminate();

// Python: es lo que hace concurrent.futures por ti: submit() devuelve un Future
// por tarea, y el ejecutor empareja cada resultado con su Future.
```
