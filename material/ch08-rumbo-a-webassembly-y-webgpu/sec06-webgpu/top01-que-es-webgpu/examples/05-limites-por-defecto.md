---
example_description: "Un dispositivo pedido sin opciones tiene los límites mínimos de WebGPU, no los del adaptador: un compute shader con @workgroup_size(512) falla al crear el pipeline («exceeds the maximum allowed (256, 256, 64)»), aunque la GPU admita 1024. El propio mensaje propone la solución: requiredLimits en requestDevice()"
example_tags: "javascript|webgpu|limits|requiredlimits|workgroup-size|requestdevice|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Un adaptador da un solo dispositivo (ejemplo 04): cada dispositivo de este ejemplo pide el suyo
const adapter = await navigator.gpu.requestAdapter();

// Un compute shader que pide grupos de 512 hilos (qué es un grupo, en la lección 2).
// No hace nada: aquí solo importa su @workgroup_size.
const code = /* wgsl */ `@compute @workgroup_size(512) fn main() {}`;

// Crea el pipeline dentro de un ámbito de errores (ejemplo 08: en WebGPU los errores no lanzan)
async function tryPipeline(device) {
  const module = device.createShaderModule({ label: 'grupos de 512', code });
  device.pushErrorScope('validation');
  device.createComputePipeline({ label: 'grupos de 512', layout: 'auto', compute: { module } });
  const error = await device.popErrorScope();
  return error ? error.message : null;
}

// 🐛 El dispositivo por defecto tiene los límites MÍNIMOS, no los del adaptador
const basic = await adapter.requestDevice();
console.log('hilos por grupo, como mucho →', basic.limits.maxComputeInvocationsPerWorkgroup);
const message = await tryPipeline(basic);
console.log('🐛 sin requiredLimits →', message.split('. ')[0] + '.'); // la primera frase
console.log('   ¿el mensaje dice cómo arreglarlo? →', message.includes('requiredLimits'));
basic.destroy();

// ✅ Pedir más al crear el dispositivo, sin pasar de lo que admite el adaptador
// (pedir más de lo que tiene hace que requestDevice() falle)
const wanted = 512;
const bigAdapter = await navigator.gpu.requestAdapter(); // otro adaptador: el primero ya está consumido
if (bigAdapter.limits.maxComputeInvocationsPerWorkgroup >= wanted) {
  const big = await bigAdapter.requestDevice({
    requiredLimits: { maxComputeInvocationsPerWorkgroup: wanted, maxComputeWorkgroupSizeX: wanted },
  });
  console.log('hilos por grupo, como mucho →', big.limits.maxComputeInvocationsPerWorkgroup);
  console.log('✅ con requiredLimits →', (await tryPipeline(big)) ?? 'pipeline creado');
  big.destroy();
}
```
