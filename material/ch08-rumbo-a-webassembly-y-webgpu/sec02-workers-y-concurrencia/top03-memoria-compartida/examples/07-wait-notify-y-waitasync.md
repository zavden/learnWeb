---
example_description: "Esperar a que cambie un valor de memoria compartida: Atomics.waitAsync devuelve una promesa que Atomics.notify cumple con 'ok' (o 'timed-out' si vence el plazo, o 'not-equal' al momento si el valor ya cambió); en un worker, Atomics.wait sí puede dormir el hilo"
example_tags: "javascript|atomics|waitasync|notify|wait|workers|memoria-compartida"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// Una señal en memoria compartida: 0 = «pedido en preparación», 1 = «listo».
const memory = new WebAssembly.Memory({ initial: 1, maximum: 1, shared: true });
const order = new Int32Array(memory.buffer, 0, 1);

// 1. waitAsync(vista, i, valor): «avísame cuando order[0] deje de valer 0», SIN bloquear.
const waiting = Atomics.waitAsync(order, 0, 0);
console.log('waitAsync → async:', waiting.async, '· value es una promesa:', waiting.value instanceof Promise);
setTimeout(() => {
  Atomics.store(order, 0, 1);                       // la cocina marca el pedido como listo…
  console.log('notify despertó a →', Atomics.notify(order, 0)); // …y despierta a quien espera
}, 50);
console.log('resultado →', await waiting.value);   // 'ok'

// 2. Si el valor ya no es el esperado, no espera: responde al momento, sin promesa.
const already = Atomics.waitAsync(order, 0, 0);
console.log('el valor ya es 1 → async:', already.async, '· value:', already.value);

// 3. Con un plazo (en ms) y sin nadie que avise.
console.log('con plazo de 30 ms →', await Atomics.waitAsync(order, 0, 1, 30).value);

// 4. En un worker, Atomics.wait SÍ está permitido: duerme ESE hilo, no la página.
// Aquí el worker crea su propia memoria compartida y nadie le avisa: lo despierta el plazo.
const code = `
  const flag = new Int32Array(new WebAssembly.Memory({ initial: 1, maximum: 1, shared: true }).buffer);
  const start = performance.now();
  const result = Atomics.wait(flag, 0, 0, 50); // bloquea hasta 50 ms
  self.postMessage(result + ' tras dormir ' + (performance.now() - start >= 49 ? '≥ 49' : '< 49') + ' ms');
`;
const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
const worker = new Worker(url);
URL.revokeObjectURL(url);
worker.onmessage = (event) => {
  console.log('worker: Atomics.wait →', event.data);
  worker.terminate();
};
```
