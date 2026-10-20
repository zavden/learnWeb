---
example_description: "Los errores de WebGPU no lanzan excepciones: la llamada devuelve un objeto inválido y sigue, y sin nadie que escuche el aviso solo llega a la consola de DevTools. Dos formas de recogerlos: un ámbito (pushErrorScope/popErrorScope) alrededor de las llamadas y el evento «uncapturederror» del dispositivo. El mensaje nombra los objetos por su label"
example_tags: "javascript|webgpu|errores|pusherrorscope|poperrorscope|uncapturederror|label|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Dos dispositivos, cada uno con su adaptador (un adaptador da un solo dispositivo)
const adapter = await navigator.gpu.requestAdapter();

// 🐛 1. El error no lanza: createBuffer devuelve un búfer «inválido» y el código sigue.
// Sin ámbito ni oyente, el aviso solo aparece en la consola de DevTools, no en la de LearnWeb.
const quiet = await adapter.requestDevice({ label: 'silencioso' });
const ghost = quiet.createBuffer({ label: 'pedidos', size: 16, usage: 0 }); // usage 0 no vale
console.log('🐛 createBuffer con usage 0 → un', ghost.constructor.name, 'de', ghost.size, 'bytes, sin excepción');
quiet.destroy();

// ✅ 2. Un ámbito de errores: pushErrorScope antes, popErrorScope después.
// La validación ocurre en otro proceso (el de la GPU): popErrorScope() es una promesa.
const device = await (await navigator.gpu.requestAdapter()).requestDevice({ label: 'tienda' });
addEventListener('pagehide', () => device.destroy());
device.pushErrorScope('validation');
device.createBuffer({ label: 'facturas', size: 16, usage: 0 });
const error = await device.popErrorScope(); // null si no hubo error
console.log('✅ popErrorScope →', error.constructor.name);
for (const line of error.message.trim().split('\n')) console.log(`   ${line.trim()}`);

// ✅ 3. Un oyente para todo lo que escape a los ámbitos: la red de seguridad
const reported = new Promise((resolve) => {
  device.addEventListener('uncapturederror', (event) => resolve(event.error), { once: true });
});
device.createBuffer({ label: 'albaranes', size: 16, usage: 0 });
// Chrome entrega estos errores cuando la página vuelve a hablar con la GPU: con el dispositivo
// ocioso, el evento puede no llegar nunca. Esperar al trabajo enviado fuerza ese intercambio.
await device.queue.onSubmittedWorkDone();
const uncaught = await reported;
console.warn('✅ uncapturederror →', uncaught.message.split('\n')[0]);
```
