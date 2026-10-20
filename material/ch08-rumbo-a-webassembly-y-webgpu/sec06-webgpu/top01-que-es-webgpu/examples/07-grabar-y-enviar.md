---
example_description: "En WebGPU los encargos no se dan uno a uno: se graban en un codificador (createCommandEncoder), se cierran con finish() y se envían a la cola con queue.submit(). submit() vuelve al instante y la GPU trabaja en paralelo; queue.onSubmittedWorkDone() es la promesa de «ya he terminado». El orden de las líneas lo demuestra"
example_tags: "javascript|webgpu|command-encoder|queue|submit|onsubmittedworkdone|asincronia"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();
addEventListener('pagehide', () => device.destroy());

// 1. Grabar: un codificador apunta los encargos, sin ejecutar nada todavía
const encoder = device.createCommandEncoder({ label: 'pedido del día' });
// … aquí irían las pasadas: beginComputePass() (lección 2) o beginRenderPass() (lección 3)
const commands = encoder.finish({ label: 'pedido del día' }); // cerrar la grabación
console.log('1. grabado →', commands.constructor.name, `«${commands.label}»`);

// 2. Enviar: submit() mete los encargos en la cola y vuelve al momento
const returned = device.queue.submit([commands]);
const done = device.queue.onSubmittedWorkDone(); // «avísame cuando acabe lo enviado hasta ahora»
console.log('2. submit() ha vuelto →', returned, '(no es una promesa)');

// 3. Mientras, la GPU trabaja por su cuenta y JavaScript sigue
console.log('3. JavaScript sigue con lo suyo');

// 4. Esperar solo cuando hace falta el resultado
await done;
console.log('4. onSubmittedWorkDone → la GPU ha terminado');
// Un codificador sirve para UNA grabación: cada encargo nuevo, un createCommandEncoder() nuevo.
```
