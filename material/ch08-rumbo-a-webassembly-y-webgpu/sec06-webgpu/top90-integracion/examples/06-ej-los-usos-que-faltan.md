---
example_description: "Ejercicio: un compute shader suma el IVA a cuatro precios, pero el búfer se creó solo con STORAGE: writeBuffer no puede escribirlo y la copia que hace readBuffer para leerlo tampoco sale, así que los resultados son ceros. Añade los dos usos que faltan; las comprobaciones miran los dos ámbitos de errores y los cuatro precios"
example_tags: "javascript|webgpu|gpubufferusage|copy-dst|copy-src|writebuffer|ejercicio"
exercise: true
exercise_title: "Los usos que faltan"
exercise_instructions: "Ejecuta el ejemplo: writeBuffer y la copia de lectura fallan, y los precios salen a 0 || Añade al búfer el uso que necesita writeBuffer para escribir en él || Añade el uso que necesita copyBufferToBuffer para copiar DESDE él (readBuffer lo copia a un búfer de lectura) || Ejecuta hasta que las seis comprobaciones salgan ✅"
exercise_hints: "Las banderas se combinan con |: GPUBufferUsage.STORAGE | … || writeBuffer es una copia HACIA el búfer; leerlo empieza por una copia DESDE él || Lección «Búferes y compute», sección «Los usos de un búfer»"
exercise_solution_example: 06-ej-los-usos-que-faltan-solucion.md
exercise_locked_files: index.html,styles.css
example_stage: exercise
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Precios con IVA, calculados en la GPU</h1>
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
// Usa assets/webgpu/utils.js (léelo con «Assets»). Lección «Búferes y compute»: los usos de un búfer.
import { getDevice, validationError, createComputeJob, dispatch, readBuffer } from './webgpu/utils.js';

const { device } = await getDevice({ label: 'IVA' });
const prices = new Float32Array([100, 250, 19.99, 4.5]); // precios sin IVA, en pesos
// TODO: writeBuffer escribe EN el búfer y readBuffer copia DESDE él: ¿qué dos usos le faltan?
const priceBuffer = device.createBuffer({
  label: 'precios',
  size: prices.byteLength,
  usage: GPUBufferUsage.STORAGE,
});
const writeError = await validationError(device, () => device.queue.writeBuffer(priceBuffer, 0, prices));

const job = createComputeJob(device, {
  label: 'IVA',
  buffers: [priceBuffer],
  code: /* wgsl */ `
    @group(0) @binding(0) var<storage, read_write> data: array<f32>;
    @compute @workgroup_size(64)
    fn main(@builtin(global_invocation_id) id: vec3u) {
      if (id.x < arrayLength(&data)) { data[id.x] = data[id.x] * 1.16; } // IVA del 16 %
    }`,
});
dispatch(device, job, 1);
// readBuffer COPIA el búfer a uno de lectura (MAP_READ | COPY_DST) y lo mapea (assets/webgpu/utils.js)
let reading;
const readError = await validationError(device, () => {
  reading = readBuffer(device, priceBuffer);
});
const withVat = await reading;

// ── Comprobaciones (no hace falta tocarlas) ───────────────────────────────────────────
const logList = document.querySelector('#log');
function check(description, actual, expected) {
  const ok = actual === expected;
  if (ok) console.log('✅', description);
  else console.error('❌', description, '→ esperaba', expected, 'y obtuve', actual);
  logList.append(Object.assign(document.createElement('li'), { textContent: `${ok ? '✅' : '❌'} ${description}` }));
}
check('writeBuffer, sin error de validación', writeError === null, true);
check('la copia para leer, sin error de validación', readError === null, true);
check('100 con IVA', withVat[0].toFixed(2), '116.00');
check('250 con IVA', withVat[1].toFixed(2), '290.00');
check('19.99 con IVA', withVat[2].toFixed(2), '23.19');
check('4.5 con IVA', withVat[3].toFixed(2), '5.22');
```
