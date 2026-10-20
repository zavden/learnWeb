---
example_description: "¿Qué puede tu navegador? Una página que comprueba, sin suponer nada, las capacidades de los dos últimos módulos: WebAssembly y sus extensiones (validando módulos diminutos escritos byte a byte), la memoria compartida y el aislamiento cross-origin, WebGPU con sus características opcionales, OffscreenCanvas y Float16Array. Los resultados dependen del navegador y de la máquina"
example_tags: "javascript|webassembly|webgpu|deteccion-de-capacidades|webassembly-validate|offscreencanvas|crossoriginisolated"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>¿Qué puede tu navegador?</h1>
  <table>
    <caption>Capacidades para WebAssembly y WebGPU, comprobadas en este navegador</caption>
    <thead>
      <tr><th scope="col">Capacidad</th><th scope="col">¿Sí?</th><th scope="col">Detalle</th></tr>
    </thead>
    <tbody id="results"></tbody>
  </table>
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
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
table {
  border-collapse: collapse;
  font-size: 0.85rem;
  width: 100%;
}
caption {
  text-align: start;
  color: #94a3b8;
  margin-bottom: 0.4rem;
}
th,
td {
  text-align: start;
  padding: 0.25rem 0.5rem;
  border-bottom: 1px solid #334155;
}
.yes {
  color: #4ade80;
}
.no {
  color: #fca5a5;
}
```

# JavaScript

```javascript
// Cada capacidad se COMPRUEBA: nada de adivinar por el nombre del navegador.
const hex = (text) => Uint8Array.from(text.split(' '), (byte) => parseInt(byte, 16));
const HEADER = '00 61 73 6d 01 00 00 00'; // «\0asm» y la versión 1 (módulo «WebAssembly»)

// Módulos diminutos, uno por extensión de WebAssembly: si el motor acepta sus bytes, la tiene.
// Es lo que hace la biblioteca wasm-feature-detect.
const wasmFeatures = [
  ['WebAssembly SIMD (v128)', `${HEADER} 01 05 01 60 00 01 7b 03 02 01 00 0a 16 01 14 00 fd 0c ${'00 '.repeat(16)}0b`],
  ['WebAssembly: llamadas de cola', `${HEADER} 01 05 01 60 00 01 7f 03 03 02 00 00 0a 0b 02 04 00 41 07 0b 04 00 12 00 0b`],
  ['WebAssembly GC (estructuras)', `${HEADER} 01 05 01 5f 01 7f 00`],
  ['WebAssembly: memoria de 64 bits', `${HEADER} 05 03 01 04 01`],
];

const rows = [];
function report(name, supported, detail = '') {
  rows.push([name, supported, detail]);
  console.log(`${name} → ${supported}${detail ? ` · ${detail}` : ''}`);
}

// El módulo add de 41 bytes: si se instancia y suma, hay WebAssembly
const addModule = hex(`${HEADER} 01 07 01 60 02 7f 7f 01 7f 03 02 01 00 07 07 01 03 61 64 64 00 00 0a 09 01 07 00 20 00 20 01 6a 0b`);
if (typeof WebAssembly === 'object') {
  const { instance } = await WebAssembly.instantiate(addModule);
  report('WebAssembly', true, `add(2, 3) = ${instance.exports.add(2, 3)}`);
  for (const [name, bytes] of wasmFeatures) report(name, WebAssembly.validate(hex(bytes)));
  // Hilos de wasm: una memoria compartida da un SharedArrayBuffer (aunque no haya aislamiento)
  const shared = new WebAssembly.Memory({ initial: 1, maximum: 1, shared: true });
  report('WebAssembly: memoria compartida (hilos)', Object.prototype.toString.call(shared.buffer) === '[object SharedArrayBuffer]');
} else {
  report('WebAssembly', false);
}
// SharedArrayBuffer «a pelo» necesita aislamiento cross-origin: COOP y COEP (módulo «Workers»)
report('crossOriginIsolated (SharedArrayBuffer en la página)', globalThis.crossOriginIsolated === true);

const adapter = await navigator.gpu?.requestAdapter();
report('WebGPU', Boolean(adapter), adapter ? `${adapter.info.vendor} · ${adapter.info.architecture}` : 'sin adaptador');
for (const feature of ['shader-f16', 'timestamp-query', 'subgroups']) {
  report(`WebGPU: ${feature}`, adapter?.features.has(feature) ?? false);
}
report('OffscreenCanvas', typeof OffscreenCanvas === 'function');
report('Float16Array', typeof Float16Array === 'function');

document.querySelector('#results').append(...rows.map(([name, supported, detail]) => {
  const row = document.createElement('tr');
  const mark = Object.assign(document.createElement('td'), { textContent: supported ? '✓ sí' : '✗ no', className: supported ? 'yes' : 'no' });
  row.append(Object.assign(document.createElement('th'), { textContent: name, scope: 'row' }), mark, Object.assign(document.createElement('td'), { textContent: detail }));
  return row;
}));
```
