---
example_description: "🐛 El mito «WebAssembly siempre es más rápido»: pintar 1000 filas de una lista de precios desde un bucle de WebAssembly no gana nada a hacerlo en JavaScript, porque cada fila es una llamada a JavaScript y el coste está en el DOM, no en la aritmética"
example_tags: "javascript|webassembly|wasm|rendimiento|dom|benchmark|mito|bug"
example_stage: common-error
example_importance: important
console: true
loop_protect: false
---

# HTML

```html
<main>
  <h1>Lista de precios</h1>
  <p>¿Pintar las filas desde WebAssembly es más rápido que desde JavaScript?</p>
  <button id="run" type="button">Medir</button>
  <output id="state" for="run">Sin medir todavía</output>
  <ol id="log" class="log" aria-live="polite"></ol>
  <ol id="rows" class="rows" aria-label="Lista de precios"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; cursor: pointer; }
button:disabled { cursor: progress; }
button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
output { margin-inline-start: 0.5rem; color: #475569; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
.rows { max-block-size: 7rem; overflow: auto; margin: 0.75rem 0 0; padding-inline-start: 2.5rem; font-size: 0.85rem; color: #475569; }
```

# JavaScript

```javascript
// loop_protect: false (en la cabecera): la guarda de bucles falsearía la medida.
// 🐛 El mito: «si lo paso a WebAssembly, irá más rápido». El módulo recorre las filas y,
// para cada una, llama a JavaScript, porque WebAssembly no puede crear elementos:
//   (module
//     (import "env" "addRow" (func $addRow (param i32 i32)))       ;; función 0
//     (func (export "renderRows") (param $n i32) (local $i i32)    ;; función 1
//       local.get $n  i32.const 1000  i32.gt_u                      ;; límite fijo: 1000 filas
//       if  i32.const 1000  local.set $n  end
//       block  loop
//         local.get $i  local.get $n  i32.ge_u  br_if 1
//         local.get $i                                              ;; número de fila
//         local.get $i  i32.const 25  i32.mul  i32.const 1500  i32.add   ;; precio en centavos
//         call $addRow                                              ;; ← JavaScript pinta la fila
//         local.get $i  i32.const 1  i32.add  local.set $i
//         br 0
//       end  end))
const bytes = fromHex(`
  00 61 73 6d 01 00 00 00 01 0a 02 60 02 7f 7f 00 60 01 7f 00 02 0e 01 03
  65 6e 76 06 61 64 64 52 6f 77 00 00 03 02 01 01 07 0e 01 0a 72 65 6e 64
  65 72 52 6f 77 73 00 01 0a 37 01 35 01 01 7f 20 00 41 e8 07 4b 04 40 41
  e8 07 21 00 0b 02 40 03 40 20 01 20 00 4f 0d 01 20 01 20 01 41 19 6c 41
  dc 0b 6a 10 00 20 01 41 01 6a 21 01 0c 00 0b 0b 0b
`);
const ROWS = 1000;
const list = document.querySelector('#rows');
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
let fragment = null;
let calls = 0;
function addRow(index, cents) { // la usan las dos versiones; WebAssembly la importa
  calls += 1;
  const item = document.createElement('li');
  item.textContent = `Artículo ${index + 1} · ${money.format(cents / 100)}`;
  fragment.append(item);
}
const { instance } = await WebAssembly.instantiate(bytes, { env: { addRow } });

function renderWithJs() {
  fragment = document.createDocumentFragment();
  for (let i = 0; i < ROWS; i++) addRow(i, 1500 + i * 25);
  list.replaceChildren(fragment);
  return list.textContent;
}
function renderWithWasm() {
  fragment = document.createDocumentFragment();
  calls = 0;
  instance.exports.renderRows(ROWS);
  list.replaceChildren(fragment);
  return list.textContent;
}

// Medidas intercaladas (una de cada versión por ronda) tras despertar la CPU, con
// calentamiento y mediana: las reglas de la lección «Medir antes de optimizar».
let benchSink;
function benchRounds(variants, { rounds = 9, warmup = 2 } = {}) {
  const times = variants.map(() => []);
  for (let round = -warmup; round < rounds; round++) {
    variants.forEach(([, fn], index) => {
      const start = performance.now();
      benchSink = fn();
      if (round >= 0) times[index].push(performance.now() - start);
    });
  }
  return variants.map(([label], index) => {
    const sorted = times[index].sort((a, b) => a - b);
    return { label, median: sorted[Math.floor(sorted.length / 2)] };
  });
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
    const sameRows = renderWithJs() === renderWithWasm();
    logLine(`¿mismas filas? ${sameRows} · filas → ${list.childElementCount} · llamadas de WebAssembly a JavaScript → ${calls}`);
    const results = benchRounds([['JavaScript', renderWithJs], ['WebAssembly + JavaScript', renderWithWasm]]);
    for (const result of results) logLine(`${result.label}: mediana ≈ ${result.median.toFixed(1)} ms`);
    state.textContent = 'Listo: pulsa otra vez para repetir';
    runButton.disabled = false;
  }, 0));
});
console.log('Listo: pulsa «Medir» (unos 150 ms de trabajo)');

function fromHex(text) {
  return Uint8Array.from(text.trim().split(/\s+/), (pair) => parseInt(pair, 16));
}

// Los tiempos salen parecidos: casi todo el coste es crear 1000 elementos y formatear
// 1000 precios, y eso lo hace JavaScript en las dos versiones. La aritmética que hizo
// WebAssembly (una multiplicación y una suma por fila) no se nota. WebAssembly brilla
// en bucles largos de cálculo sobre su propia memoria (lecciones 3 y 4), no en el DOM.
```
