---
example_description: "La GPU copia de 4 en 4 bytes: writeBuffer con un offset de 2 es un error de validación («BufferOffset (2) is not a multiple of 4»), y mappedAtCreation con un tamaño de 6 lanza un RangeError al instante. mappedAtCreation bien usado: escribir los datos directamente en la memoria del búfer antes de entregárselo a la GPU con unmap()"
example_tags: "javascript|webgpu|alineacion|writebuffer|mappedatcreation|getmappedrange|rangeerror|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Usa assets/webgpu/utils.js (léelo con «Assets»).
import { getDevice, validationError, readBuffer } from './webgpu/utils.js';

const { device } = await getDevice({ label: 'alineación' });
const usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC;

// 🐛 writeBuffer en el byte 2: los offsets (y los tamaños) de las copias van de 4 en 4
const prices = device.createBuffer({ label: 'precios', size: 16, usage });
const atByte2 = await validationError(device, () => device.queue.writeBuffer(prices, 2, new Uint8Array([1, 2, 3, 4])));
console.log('🐛 writeBuffer(precios, 2, …) →', atByte2);
const atByte4 = await validationError(device, () => device.queue.writeBuffer(prices, 4, new Uint8Array([1, 2, 3, 4])));
console.log('✅ writeBuffer(precios, 4, …) →', atByte4 ?? 'válido');

// 🐛 mappedAtCreation con 6 bytes: este error lo ve el navegador sin preguntar a la GPU, y LANZA
try {
  device.createBuffer({ label: 'notas', size: 6, usage, mappedAtCreation: true });
} catch (error) {
  console.log('🐛 mappedAtCreation, 6 bytes →', `${error.name}: ${error.message}`);
}

// ✅ mappedAtCreation: el búfer nace «mapeado» y JavaScript escribe directamente en su memoria,
// sin la copia intermedia de writeBuffer. unmap() se lo entrega a la GPU.
const menu = device.createBuffer({ label: 'menú', size: 8, usage, mappedAtCreation: true });
new Float32Array(menu.getMappedRange()).set([19.99, 4.5]);
console.log('✅ mappedAtCreation, 8 bytes → estado', menu.mapState);
menu.unmap();
console.log('   después de unmap() → estado', menu.mapState);
console.log('   en la GPU →', (await readBuffer(device, menu)).join(', ')); // float32: 19.99 no cabe exacto
```
