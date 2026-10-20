---
example_description: "requestDevice() da el dispositivo: la conexión con la GPU que crea búferes, shaders y pipelines, y que tiene la cola de encargos. Sus límites NO son los del adaptador sino los mínimos que garantiza cualquier GPU con WebGPU. destroy() lo libera y cumple la promesa device.lost con el motivo «destroyed». Y un adaptador da un solo dispositivo: pedirle otro se rechaza («adapter is consumed»)"
example_tags: "javascript|webgpu|requestdevice|dispositivo|limits|queue|device-lost|destroy"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
const adapter = await navigator.gpu.requestAdapter();

// El DISPOSITIVO: crea los objetos de la GPU (búferes, texturas, shaders, pipelines) y tiene
// la COLA, por donde se envían los encargos. La etiqueta (label) aparece en los mensajes de error.
const device = await adapter.requestDevice({ label: 'tienda' });
console.log('dispositivo →', device.label);
console.log('características →', [...device.features].sort().join(', '));
console.log('cola →', device.queue.constructor.name);

// Los límites del dispositivo son los MÍNIMOS que garantiza cualquier GPU con WebGPU,
// aunque tu adaptador dé más: así, lo que funciona en tu equipo funciona en todos.
console.log('maxComputeInvocationsPerWorkgroup →', device.limits.maxComputeInvocationsPerWorkgroup);
console.log('maxStorageBufferBindingSize →', device.limits.maxStorageBufferBindingSize, 'bytes (128 MiB)');
console.log('maxBufferSize →', device.limits.maxBufferSize, 'bytes (256 MiB)');
console.log('maxBindGroups →', device.limits.maxBindGroups);

// Al terminar, destroy() libera su memoria de la GPU. device.lost es una promesa que se
// cumple cuando el dispositivo deja de servir: por destroy() o porque la GPU se perdió.
device.lost.then((info) => console.log('device.lost →', info.reason));
device.destroy();
console.log('destroy() → llamado');
await device.lost;

// Un adaptador da UN solo dispositivo: después queda «consumido», y otro dispositivo pide otro adaptador
const again = await adapter.requestDevice().then(() => 'otro dispositivo', (error) => `${error.name}: ${error.message}`);
console.log('el mismo adaptador, otra vez →', again);

// Para comparar, los mismos límites del adaptador (dependen de la GPU):
const { maxComputeInvocationsPerWorkgroup, maxStorageBufferBindingSize } = adapter.limits;
console.log('adaptador →', maxComputeInvocationsPerWorkgroup, 'hilos por grupo ·', maxStorageBufferBindingSize, 'bytes por búfer');
```
