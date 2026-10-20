---
example_description: "Una comparación honesta: el mismo hash FNV-1a sobre 4 MiB en JavaScript (Math.imul) y en WebAssembly (checksum.wasm), sobre los mismos bytes de la memoria, con CPU despierta, calentamiento, rondas intercaladas y mediana; la primera llamada de cada uno aparte, y el coste de copiar los datos a la memoria"
example_tags: "javascript|webassembly|wasm|rendimiento|benchmark|fnv|jit|liftoff"
example_stage: intermediate
example_importance: critical
console: true
loop_protect: false
---

# HTML

```html
<main>
  <h1>FNV-1a de 4 MiB: JavaScript o WebAssembly</h1>
  <p>El mismo algoritmo, los mismos bytes, las reglas de «Medir antes de optimizar».</p>
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
// Usa assets/wasm/checksum.wasm (su WAT está en checksum.wat.txt; léelos con «Assets»).
const SIZE = 4 * 1024 * 1024;
const { instance } = await WebAssembly.instantiateStreaming(fetch('wasm/checksum.wasm'));
const { memory, fnv1a } = instance.exports;
memory.grow(Math.ceil(SIZE / 65536)); // 1 + 64 páginas; las vistas se crean DESPUÉS de crecer

// La misma función en JavaScript: Math.imul multiplica como un i32 (lección «Bits y bytes»).
function fnv1aJs(bytes) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < bytes.length; i++) hash = Math.imul(hash ^ bytes[i], 0x01000193);
  return hash >>> 0;
}
// Bytes pseudoaleatorios con semilla fija (xorshift32): el hash es siempre el mismo.
function fillPseudoRandom(bytes, seed) {
  let x = seed;
  for (let i = 0; i < bytes.length; i++) {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    bytes[i] = x & 0xff;
  }
}

let data = null;   // los 4 MiB, en la memoria de WebAssembly (JavaScript los lee sin copiar)
let source = null; // una copia fuera, para medir lo que cuesta traerlos
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
function timeOnce(fn) {
  const start = performance.now();
  const result = fn();
  return { result, ms: performance.now() - start };
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
  requestAnimationFrame(() => setTimeout(() => {
    wakeCpu(100);
    let cold = null;
    if (!data) {
      data = new Uint8Array(memory.buffer, 0, SIZE);
      fillPseudoRandom(data, 2026);
      source = data.slice();
      // La primera llamada de cada función, en frío: JavaScript empieza interpretando y
      // WebAssembly con Liftoff; los dos se recompilan con TurboFan cuando se calientan.
      cold = [timeOnce(() => fnv1aJs(data)), timeOnce(() => fnv1a(0, SIZE) >>> 0)];
    }
    const measured = benchRounds([
      ['JavaScript', () => fnv1aJs(data)],
      ['WebAssembly', () => fnv1a(0, SIZE) >>> 0],
      ['copiar 4 MiB a la memoria con set()', () => { data.set(source); return data[SIZE - 1]; }],
    ]);
    const hash = measured[0].result;
    logLine(`datos → ${SIZE} bytes · fnv1a → ${hash.toString(16)} · ¿mismo resultado en JavaScript y en WebAssembly? ${hash === measured[1].result}`);
    if (cold) logLine(`1.ª llamada (en frío): JavaScript ≈ ${cold[0].ms.toFixed(1)} ms · WebAssembly ≈ ${cold[1].ms.toFixed(1)} ms`);
    for (const entry of measured) logLine(`${entry.label}: mediana ≈ ${entry.median.toFixed(1)} ms`);
    state.textContent = 'Listo: pulsa otra vez para repetir';
    runButton.disabled = false;
  }, 0));
});
console.log('Listo: pulsa «Medir» (unos 250 ms de trabajo la primera vez)');

// Lo que suele salir: en caliente, las dos versiones tardan casi lo mismo, porque TurboFan
// genera para el bucle de JavaScript un código máquina muy parecido al de WebAssembly.
// Para que WebAssembly gane de verdad hace falta otra cosa: SIMD (16 bytes por instrucción,
// en cálculos que se pueden repartir así: FNV-1a no, porque cada paso usa el anterior),
// enteros de 64 bits, o un algoritmo que ya existía en C o Rust y no hay que reescribir.
```
