---
example_description: "Solución: WORKGROUP_SIZE = 64 se escribe una vez y llega al WGSL con ${WORKGROUP_SIZE}, y los grupos se calculan con Math.ceil(1000 / 64) = 16: 1024 hilos, y la guarda frena a los 24 que sobran. Las cuatro comprobaciones salen ✅"
example_tags: "javascript|webgpu|compute-shader|dispatchworkgroups|workgroup-size|solucion"
example_stage: final-solution
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Mil lecturas de temperatura: de °C a °F</h1>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root {
  color-scheme: dark;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #e2e8f0;
  background: #0f172a;
}
main {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Usa assets/webgpu/utils.js (léelo con «Assets»). Lección «Búferes y compute»: grupos de trabajo.
import { getDevice, createStorageBuffer, createComputeJob, dispatch, readBuffer } from './webgpu/utils.js';

const { device } = await getDevice({ label: 'temperaturas' });
// 1000 lecturas de un sensor, en grados Celsius: de -10 a 39
const celsius = Float32Array.from({ length: 1000 }, (_, i) => (i % 50) - 10);
const WORKGROUP_SIZE = 64; // ✅ escrito una vez, para JavaScript y para el shader
const buffer = createStorageBuffer(device, 'temperaturas', celsius);
const job = createComputeJob(device, {
  label: 'a Fahrenheit',
  buffers: [buffer],
  code: /* wgsl */ `
    @group(0) @binding(0) var<storage, read_write> data: array<f32>;
    @compute @workgroup_size(${WORKGROUP_SIZE})
    fn main(@builtin(global_invocation_id) id: vec3u) {
      if (id.x < arrayLength(&data)) { data[id.x] = data[id.x] * 1.8 + 32.0; }
    }`,
});
const groups = Math.ceil(celsius.length / WORKGROUP_SIZE); // ✅ 16 grupos: 1024 hilos para 1000 datos
dispatch(device, job, groups);
const fahrenheit = await readBuffer(device, buffer);

// ── Comprobaciones (no hace falta tocarlas) ───────────────────────────────────────────
const logList = document.querySelector('#log');
function check(description, actual, expected) {
  const ok = actual === expected;
  if (ok) console.log('✅', description);
  else console.error('❌', description, '→ esperaba', expected, 'y obtuve', actual);
  logList.append(Object.assign(document.createElement('li'), { textContent: `${ok ? '✅' : '❌'} ${description}` }));
}
const THREADS_PER_GROUP = 64; // lo que dice el shader (después de tu cambio, también WORKGROUP_SIZE)
const converted = fahrenheit.filter((value, i) => Math.abs(value - (celsius[i] * 1.8 + 32)) < 1e-3).length;
check('los grupos lanzados cubren las 1000 lecturas', groups * THREADS_PER_GROUP >= celsius.length, true);
check('lecturas convertidas', converted, 1000);
check('la primera (-10 °C)', fahrenheit[0].toFixed(1), '14.0');
check('la última (39 °C)', fahrenheit[999].toFixed(1), '102.2');
```
