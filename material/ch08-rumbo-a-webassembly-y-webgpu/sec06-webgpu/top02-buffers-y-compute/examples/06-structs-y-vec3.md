---
example_description: "En un búfer, un vec3f ocupa 12 bytes pero empieza en un múltiplo de 16: en struct Particle { mass: f32, pos: vec3f } la posición está en el byte 16 y la estructura mide 32. Un Float32Array empaquetado sin huecos llega desordenado al shader; siguiendo el mapa de bytes (calculado con las reglas de WGSL) llega bien. Poner el vec3f primero aprovecha el hueco: 16 bytes"
example_tags: "javascript|webgpu|wgsl|struct|alineacion|vec3f|layout|padding|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Usa assets/webgpu/utils.js (léelo con «Assets»).
import { getDevice, createStorageBuffer, createComputeJob, dispatch, readBuffer } from './webgpu/utils.js';

// Tamaño y alineación de cada tipo en un búfer (la tabla de la especificación de WGSL)
const TYPES = {
  f32: { size: 4, align: 4 }, u32: { size: 4, align: 4 }, vec2f: { size: 8, align: 8 },
  vec3f: { size: 12, align: 16 }, vec4f: { size: 16, align: 16 },
};
const roundUp = (value, multiple) => Math.ceil(value / multiple) * multiple;
// Cada campo empieza en un múltiplo de SU alineación; la estructura mide un múltiplo de la
// MAYOR alineación de sus campos (así, en un array, todos los elementos quedan alineados)
function layoutOf(fields) {
  let end = 0;
  let structAlign = 0;
  const offsets = {};
  for (const [name, type] of Object.entries(fields)) {
    offsets[name] = roundUp(end, TYPES[type].align);
    end = offsets[name] + TYPES[type].size;
    structAlign = Math.max(structAlign, TYPES[type].align);
  }
  return { offsets, size: roundUp(end, structAlign) };
}
const show = ({ offsets, size }) => `${Object.entries(offsets).map(([n, o]) => `${n} en el byte ${o}`).join(', ')} · ${size} bytes`;
const layout = layoutOf({ mass: 'f32', pos: 'vec3f' });
console.log('{ mass: f32, pos: vec3f } →', show(layout));
console.log('{ pos: vec3f, mass: f32 } →', show(layoutOf({ pos: 'vec3f', mass: 'f32' })));

// El shader lee dos partículas y escribe en «seen» lo que ve: masa, x, y, z de cada una
const { device } = await getDevice({ label: 'estructuras' });
const code = /* wgsl */ `
  struct Particle {
    mass: f32,
    pos: vec3f,
  }
  @group(0) @binding(0) var<storage, read> particles: array<Particle>;
  @group(0) @binding(1) var<storage, read_write> seen: array<f32>;
  @compute @workgroup_size(1)
  fn main() {
    for (var i = 0u; i < 2u; i++) {
      let p = particles[i];
      seen[i * 4u] = p.mass;
      seen[i * 4u + 1u] = p.pos.x;
      seen[i * 4u + 2u] = p.pos.y;
      seen[i * 4u + 3u] = p.pos.z;
    }
  }`;
async function whatTheShaderSees(floats) {
  const particles = createStorageBuffer(device, 'partículas', floats);
  const seen = createStorageBuffer(device, 'lo que ve el shader', new Float32Array(8));
  dispatch(device, createComputeJob(device, { label: 'leer partículas', code, buffers: [particles, seen] }), 1);
  const v = await readBuffer(device, seen);
  return `masa ${v[0]} en (${v.slice(1, 4).join(', ')}) · masa ${v[4]} en (${v.slice(5, 8).join(', ')})`;
}

// Dos partículas: masa 7 en (1, 2, 3) y masa 8 en (4, 5, 6). El búfer, de 2 × 32 = 64 bytes.
// 🐛 Sin huecos, como se empaquetaría en numpy: 4 floats por partícula
const packed = new Float32Array(16);
packed.set([7, 1, 2, 3, 8, 4, 5, 6]);
console.log('🐛 sin huecos →', await whatTheShaderSees(packed));

// ✅ Siguiendo el mapa: cada partícula empieza cada 32 bytes, y su pos en el byte 16
const padded = new Float32Array(16);
[[7, [1, 2, 3]], [8, [4, 5, 6]]].forEach(([mass, pos], i) => {
  const base = (i * layout.size) / 4; // de bytes a posiciones de un Float32Array
  padded[base + layout.offsets.mass / 4] = mass;
  padded.set(pos, base + layout.offsets.pos / 4);
});
console.log('✅ con huecos →', await whatTheShaderSees(padded));
console.log('   los 16 floats →', padded.join(','));
```
