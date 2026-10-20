---
example_description: "requestAdapter() no lanza cuando no hay GPU disponible: devuelve null, y el código que sigue sin comprobarlo falla con «Cannot read properties of null (reading 'requestDevice')». La versión correcta comprueba navigator.gpu y el adaptador y ofrece otro camino (WebGL o el canvas 2D). Una máquina sin GPU usable, simulada, y un null real con forceFallbackAdapter"
example_tags: "javascript|webgpu|requestadapter|null|soporte|fallback|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// 🐛 El código de muchos tutoriales: da por hecho que siempre hay una GPU
async function startUnchecked(gpu) {
  const adapter = await gpu.requestAdapter();
  return adapter.requestDevice(); // si adapter es null → TypeError
}

// ✅ Dos comprobaciones: ¿existe la API? ¿hay un adaptador? Y un camino alternativo si no
async function startChecked(gpu) {
  if (!gpu) return 'sin WebGPU: dibuja con WebGL o con el canvas 2D';
  const adapter = await gpu.requestAdapter();
  if (!adapter) return 'WebGPU existe, pero no hay adaptador: dibuja con WebGL o con el canvas 2D';
  const device = await adapter.requestDevice();
  device.destroy(); // este ejemplo no lo usa: lo libera enseguida
  return `dispositivo listo (${adapter.info.vendor})`;
}

// requestAdapter() devuelve null cuando el navegador tiene WebGPU pero no puede darte una GPU:
// un driver en su lista de bloqueo, una GPU que se está reiniciando, una máquina virtual…
// Aquí se simula con un objeto que responde como lo haría esa máquina.
const machineWithoutGpu = { requestAdapter: async () => null };
try {
  await startUnchecked(machineWithoutGpu);
} catch (error) {
  console.log('🐛 sin comprobar →', `${error.name}: ${error.message}`);
}
console.log('✅ comprobando, sin adaptador →', await startChecked(machineWithoutGpu));
console.log('✅ comprobando, sin navigator.gpu →', await startChecked(undefined));
console.log('✅ comprobando, con la GPU real →', await startChecked(navigator.gpu));

// Un null de verdad: forceFallbackAdapter pide un adaptador «de reserva», que emula la GPU en
// la CPU. Si el navegador no tiene ninguno para esta máquina, la respuesta es null.
const fallback = await navigator.gpu.requestAdapter({ forceFallbackAdapter: true });
console.log('forceFallbackAdapter →', fallback ? fallback.info.architecture : null);
```
