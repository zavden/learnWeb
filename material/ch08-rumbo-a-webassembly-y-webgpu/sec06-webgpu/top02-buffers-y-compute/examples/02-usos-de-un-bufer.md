---
example_description: "Cada búfer declara sus usos al crearlo con banderas de GPUBufferUsage, que son bits (STORAGE = 128, COPY_DST = 8…) y se combinan con |. No todas las combinaciones valen: MAP_READ solo admite COPY_DST, así que un búfer de cómputo no se puede leer directamente; y writeBuffer necesita COPY_DST. Los mensajes nombran el búfer por su label"
example_tags: "javascript|webgpu|gpubufferusage|createbuffer|bits|map-read|copy-dst|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Usa assets/webgpu/utils.js (léelo con «Assets»).
import { getDevice, validationError } from './webgpu/utils.js';

const { device } = await getDevice({ label: 'usos' });

// Las banderas son bits (lección «Bits y bytes»): cada una, una potencia de 2
for (const name of ['MAP_READ', 'MAP_WRITE', 'COPY_SRC', 'COPY_DST', 'INDEX', 'VERTEX', 'UNIFORM', 'STORAGE']) {
  const bit = GPUBufferUsage[name];
  console.log(`${name.padEnd(9)} → ${String(bit).padStart(3)} = 0b${bit.toString(2).padStart(8, '0')}`);
}
const usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST;
console.log('STORAGE | COPY_DST →', usage, '· ¿lleva STORAGE?', (usage & GPUBufferUsage.STORAGE) !== 0);

const describe = (error) => error ?? 'válido';

// 🐛 Un búfer de cómputo que JavaScript pueda leer directamente: no existe
console.log('🐛 MAP_READ | STORAGE →', describe(await validationError(device, () => device.createBuffer({
  label: 'resultados', size: 16, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.STORAGE,
}))));
// ✅ El búfer de lectura de verdad: solo MAP_READ y COPY_DST (recibe una copia del de cómputo)
console.log('✅ MAP_READ | COPY_DST →', describe(await validationError(device, () => device.createBuffer({
  label: 'lectura', size: 16, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
}))));

// 🐛 writeBuffer COPIA bytes en el búfer: sin COPY_DST, no se deja
const settings = device.createBuffer({ label: 'datos', size: 16, usage: GPUBufferUsage.UNIFORM });
console.log('🐛 writeBuffer sin COPY_DST →', describe(await validationError(device, () => {
  device.queue.writeBuffer(settings, 0, new Float32Array([0.5, 1, 0, 1]));
})));
```
