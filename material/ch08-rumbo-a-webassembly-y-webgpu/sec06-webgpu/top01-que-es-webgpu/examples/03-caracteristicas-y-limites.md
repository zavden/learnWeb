---
example_description: "Lo que sabe hacer un adaptador: el formato de píxel que prefiere la pantalla, sus características opcionales (adapter.features, como un Set: shader-f16, timestamp-query, compresión de texturas…) y sus límites (adapter.limits: hilos por grupo, tamaño de los búferes…). Los valores dependen de la GPU"
example_tags: "javascript|webgpu|adaptador|features|limits|getpreferredcanvasformat"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
const adapter = await navigator.gpu.requestAdapter();

// El orden de los canales que prefiere la pantalla: el formato que conviene dar al lienzo (lección 3)
console.log('formato preferido del lienzo →', navigator.gpu.getPreferredCanvasFormat());

// CARACTERÍSTICAS: capacidades opcionales de esta GPU. adapter.features se usa como un Set.
const optional = ['shader-f16', 'timestamp-query', 'float32-filterable', 'subgroups',
  'texture-compression-bc', 'texture-compression-astc'];
for (const feature of optional) {
  console.log(`${feature} →`, adapter.features.has(feature));
}

// LÍMITES: hasta dónde llega esta GPU (hilos por grupo, bytes por búfer, bindings…)
const { limits } = adapter;
console.log('maxComputeInvocationsPerWorkgroup →', limits.maxComputeInvocationsPerWorkgroup);
console.log('maxComputeWorkgroupSizeX →', limits.maxComputeWorkgroupSizeX);
const gib = (limits.maxStorageBufferBindingSize / 2 ** 30).toFixed(1);
console.log('maxStorageBufferBindingSize →', limits.maxStorageBufferBindingSize, `bytes (${gib} GiB)`);

// La GPU ejecuta los hilos en grupos que van al unísono (lección «CPU y GPU»): los subgrupos
console.log('tamaño de subgrupo →', adapter.info.subgroupMinSize, 'hilos');
```
