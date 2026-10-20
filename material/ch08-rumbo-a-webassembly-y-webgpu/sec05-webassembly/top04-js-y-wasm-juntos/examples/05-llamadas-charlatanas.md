---
example_description: "🐛 Llamadas charlatanas: sumar el precio con IVA de 500 000 productos cruzando la frontera en cada uno (JavaScript llama a WebAssembly, o WebAssembly a JavaScript) frente a una sola llamada con los precios ya en la memoria, y frente a JavaScript solo; mismo resultado, distinto coste, medido desde un botón"
example_tags: "javascript|webassembly|wasm|rendimiento|llamadas|frontera|benchmark|bug"
example_stage: common-error
example_importance: critical
console: true
loop_protect: false
---

# HTML

```html
<main>
  <h1>Total con IVA de 500 000 productos</h1>
  <p>¿Cuánto cuesta cruzar entre JavaScript y WebAssembly en cada producto?</p>
  <button id="run" type="button">Medir</button>
  <output id="state" for="run">Sin medir todavía</output>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 34rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; cursor: pointer; }
button:disabled { cursor: progress; }
button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
output { margin-inline-start: 0.5rem; color: #475569; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
// loop_protect: false (en la cabecera): la guarda de bucles falsearía la medida.
// Usa assets/wasm/emit.js (léelo con «Assets»).
import { encodeModule, op, memArg, i32Const, I32, VOID } from './wasm/emit.js';

//   (module
//     (import "env" "priceAt" (func $priceAt (param i32) (result i32)))     ;; función 0
//     (memory (export "memory") 32 32)                                       ;; 2 MiB
//     (func $withTax (export "withTax") (param $cents i32) (result i32)      ;; función 1
//       local.get $cents  i32.const 116  i32.mul  i32.const 100  i32.div_u)
//     (func (export "totalFromJs") (param $n i32) (result i32) …             ;; función 2
//       ;; para cada i < n (como mucho 1 000 000): sum += withTax(priceAt(i))  ← llama a JS
//     (func (export "totalInMemory") (param $ptr i32) (param $n i32) (result i32) …  ;; función 3
//       ;; para cada i < n: sum += withTax(i32.load(ptr + i × 4))           ← todo dentro
const loop = (step) => [ // block + loop con el contador en la local 2 y la suma en la 3
  op.block, VOID, op.loop, VOID,
    op.local_get, 2, op.local_get, 1, op.i32_ge_u, op.br_if, 1,
    op.local_get, 3, ...step, op.call, 1, op.i32_add, op.local_set, 3,
    op.local_get, 2, ...i32Const(1), op.i32_add, op.local_set, 2,
    op.br, 0,
  op.end, op.end, op.local_get, 3,
];
const bytes = encodeModule({
  types: [[[I32], [I32]], [[I32, I32], [I32]]],
  imports: [{ module: 'env', name: 'priceAt', func: 0 }],
  memory: { min: 32, max: 32 },
  funcs: [
    { type: 0, body: [op.local_get, 0, ...i32Const(116), op.i32_mul, ...i32Const(100), op.i32_div_u] },
    // totalFromJs: la local 1 es una copia de n, limitada a 1 000 000
    { type: 0, locals: [I32, I32, I32], body: [
      op.local_get, 0, op.local_set, 1,
      op.local_get, 1, ...i32Const(1000000), op.i32_gt_u, op.if, VOID, ...i32Const(1000000), op.local_set, 1, op.end,
      ...loop([op.local_get, 2, op.call, 0]),
    ] },
    { type: 1, locals: [I32, I32], body: loop([op.local_get, 0, op.local_get, 2, ...i32Const(2), op.i32_shl, op.i32_add, op.i32_load, ...memArg(2)]) },
  ],
  exports: { memory: { memory: 0 }, withTax: { func: 1 }, totalFromJs: { func: 2 }, totalInMemory: { func: 3 } },
});

const N = 500000;
let prices = null;
const { instance } = await WebAssembly.instantiate(bytes, { env: { priceAt: (i) => prices[i] } });
const { memory, withTax, totalFromJs, totalInMemory } = instance.exports;
prices = new Int32Array(memory.buffer, 0, N); // los precios, en centavos, YA en la memoria del módulo
for (let i = 0; i < N; i++) prices[i] = 100 + ((i * 7919) % 1000);

const variants = [
  ['🐛 JavaScript llama a WebAssembly por cada precio', () => { let sum = 0; for (let i = 0; i < N; i++) sum = (sum + withTax(prices[i])) | 0; return sum; }],
  ['🐛 WebAssembly llama a JavaScript por cada precio', () => totalFromJs(N)],
  ['✅ una llamada, con los precios en la memoria', () => totalInMemory(0, N)],
  ['JavaScript solo', () => { let sum = 0; for (let i = 0; i < N; i++) sum = (sum + Math.trunc((prices[i] * 116) / 100)) | 0; return sum; }],
];

// Medidas intercaladas, tras despertar la CPU, con calentamiento y mediana.
function benchRounds(list, { rounds = 7, warmup = 2 } = {}) {
  const times = list.map(() => []);
  const results = list.map(() => null);
  for (let round = -warmup; round < rounds; round++) {
    list.forEach(([, fn], index) => {
      const start = performance.now();
      results[index] = fn();
      if (round >= 0) times[index].push(performance.now() - start);
    });
  }
  return list.map(([label], index) => ({ label, result: results[index], median: times[index].sort((a, b) => a - b)[Math.floor(rounds / 2)] }));
}
function wakeCpu(ms) {
  const end = performance.now() + ms;
  let x = 0;
  while (performance.now() < end) x += Math.sqrt(x + 1);
  return x;
}

const runButton = document.querySelector('#run');
const state = document.querySelector('#state');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
runButton.addEventListener('click', () => {
  runButton.disabled = true;
  state.textContent = 'midiendo…';
  requestAnimationFrame(() => setTimeout(() => { // deja pintar «midiendo…» antes de bloquear
    wakeCpu(100);
    const measured = benchRounds(variants);
    const same = measured.every((entry) => entry.result === measured[0].result);
    logLine(`total → ${(measured[0].result / 100).toFixed(2)} MXN · ¿mismo resultado en las cuatro? ${same}`);
    logLine(`llamadas que cruzan la frontera, por medida → ${N} · ${N + 1} · 1 · 0`);
    for (const entry of measured) logLine(`${entry.label}: mediana ≈ ${entry.median.toFixed(1)} ms`);
    state.textContent = 'Listo: pulsa otra vez para repetir';
    runButton.disabled = false;
  }, 0));
});
console.log(`Listo: ${N} precios en la memoria; pulsa «Medir» (unos 200 ms de trabajo)`);

// Cada cruce cuesta poco (nanosegundos), pero un millón de cruces cuestan milisegundos. La
// regla: pon los datos en la memoria y cruza UNA vez por lote, no una vez por elemento.
```
