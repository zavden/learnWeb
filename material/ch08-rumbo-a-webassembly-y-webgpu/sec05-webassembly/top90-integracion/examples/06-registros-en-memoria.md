---
example_description: "Un array de registros binarios en la memoria: 2000 ventas de una librería de 12 bytes cada una (sku u32, unidades u16, categoría u8, precio f32) escritas con DataView en punteros alineados de un asignador de avance; el módulo suma unidades e ingresos por categoría y JavaScript los lee con Uint32Array y Float64Array; el mismo cálculo en JavaScript da los mismos bits"
example_tags: "javascript|webassembly|wasm|dataview|structs|alineacion|asignador|f32|f64"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main class="report">
  <h1>Ventas de la librería por categoría</h1>
  <table>
    <caption>2000 ventas, sumadas en WebAssembly</caption>
    <thead><tr><th scope="col">Categoría</th><th scope="col">Libros</th><th scope="col">Ingresos</th></tr></thead>
    <tbody id="rows"></tbody>
  </table>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
.report { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.75rem; }
table { inline-size: 100%; border-collapse: collapse; background: #ffffff; }
caption { text-align: start; font-size: 0.85rem; color: #475569; padding-block-end: 0.3rem; }
th, td { padding: 0.35rem 0.6rem; border-bottom: 1px solid #cbd5e1; text-align: start; }
td:nth-child(n + 2), th:nth-child(n + 2) { text-align: end; font-variant-numeric: tabular-nums; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
// Usa assets/wasm/emit.js (léelo con «Assets»).
import { encodeModule, op, memArg, i32Const, f64Const, I32, VOID } from './wasm/emit.js';

// Un registro de venta: 12 bytes, little-endian, como un struct de C.
//   byte 0  sku        u32
//   byte 4  unidades   u16
//   byte 6  categoría  u8   (0-5)
//   byte 7  relleno    u8   (para que el precio quede alineado a 4)
//   byte 8  precio     f32
// Los totales: 8 f64 de ingresos (64 bytes) y 8 u32 de unidades, uno por categoría.
//   (func (export "totals") (param $ptr i32) (param $count i32) (param $out i32)
//     (local $i i32) (local $rec i32) (local $cat i32) (local $units i32)
//     … pone los totales a 0; para cada registro:
//       $out[$cat] += f64($units) × f64.promote_f32(precio); unidades[$cat] += $units …)
const RECORD = 12;
const CATEGORIES = ['Novela', 'Poesía', 'Ensayo', 'Historia', 'Infantil', 'Cómic'];
const I32_LOAD16_U = 0x2f;
const F64_LOAD = 0x2b;
const F64_STORE = 0x39;
const loop = (count, inner) => [ // for ($i = 0; $i < count; $i++) { inner }  ($i es la local 3)
  ...i32Const(0), op.local_set, 3,
  op.block, VOID, op.loop, VOID,
    op.local_get, 3, ...count, op.i32_ge_u, op.br_if, 1,
    ...inner,
    op.local_get, 3, ...i32Const(1), op.i32_add, op.local_set, 3,
    op.br, 0,
  op.end, op.end,
];
const bytes = encodeModule({
  types: [[[I32, I32, I32], []]],
  memory: { min: 1, max: 1 },
  funcs: [{ type: 0, locals: [I32, I32, I32, I32], body: [ // 3 = $i, 4 = $rec, 5 = $cat, 6 = $units
    ...loop(i32Const(8), [ // los 8 totales a 0
      op.local_get, 2, op.local_get, 3, ...i32Const(3), op.i32_shl, op.i32_add, ...f64Const(0), F64_STORE, ...memArg(3),
      op.local_get, 2, op.local_get, 3, ...i32Const(2), op.i32_shl, op.i32_add, ...i32Const(0), op.i32_store, ...memArg(2, 64),
    ]),
    ...loop([op.local_get, 1], [
      op.local_get, 0, op.local_get, 3, ...i32Const(RECORD), op.i32_mul, op.i32_add, op.local_set, 4,
      op.local_get, 4, op.i32_load8_u, ...memArg(0, 6), ...i32Const(7), op.i32_and, op.local_set, 5, // & 7: nunca fuera de los totales
      op.local_get, 4, I32_LOAD16_U, ...memArg(1, 4), op.local_set, 6,
      // ingresos[$cat] += f64($units) × f64(precio)
      op.local_get, 2, op.local_get, 5, ...i32Const(3), op.i32_shl, op.i32_add,
      op.local_get, 2, op.local_get, 5, ...i32Const(3), op.i32_shl, op.i32_add, F64_LOAD, ...memArg(3),
      op.local_get, 6, op.f64_convert_i32_u, op.local_get, 4, op.f32_load, ...memArg(2, 8), op.f64_promote_f32, op.f64_mul,
      op.f64_add, F64_STORE, ...memArg(3),
      // unidades[$cat] += $units
      op.local_get, 2, op.local_get, 5, ...i32Const(2), op.i32_shl, op.i32_add,
      op.local_get, 2, op.local_get, 5, ...i32Const(2), op.i32_shl, op.i32_add, op.i32_load, ...memArg(2, 64),
      op.local_get, 6, op.i32_add, op.i32_store, ...memArg(2, 64),
    ]),
  ] }],
  exports: { memory: { memory: 0 }, totals: { func: 0 } },
});
const { instance } = await WebAssembly.instantiate(bytes);
const { memory, totals } = instance.exports;

// Un asignador de avance (lección «La memoria lineal»), con alineación.
let next = 1024;
function alloc(size, align) {
  const ptr = Math.ceil(next / align) * align;
  if (ptr + size > memory.buffer.byteLength) throw new RangeError('no queda memoria');
  next = ptr + size;
  return ptr;
}
const COUNT = 2000;
const recordsPtr = alloc(COUNT * RECORD, 4); // el f32 de cada registro cae en un múltiplo de 4
const totalsPtr = alloc(8 * 8 + 8 * 4, 8);   // los f64, en un múltiplo de 8

// Las ventas (inventadas, pero siempre las mismas), escritas campo a campo con DataView.
const view = new DataView(memory.buffer);
for (let i = 0; i < COUNT; i++) {
  const at = recordsPtr + i * RECORD;
  view.setUint32(at, 970000 + i, true);
  view.setUint16(at + 4, 1 + ((i * 7) % 5), true);
  view.setUint8(at + 6, (i * 5 + Math.floor(i / 7)) % CATEGORIES.length);
  view.setFloat32(at + 8, 129.5 + ((i * 13) % 300) + 0.9, true); // en float32: 260.4 se guarda como 260.3999938964844
}
totals(recordsPtr, COUNT, totalsPtr);
const revenue = new Float64Array(memory.buffer, totalsPtr, CATEGORIES.length);
const units = new Uint32Array(memory.buffer, totalsPtr + 64, CATEGORIES.length);

// La referencia en JavaScript: el mismo orden de sumas y los mismos float32 (getFloat32).
const jsRevenue = new Float64Array(CATEGORIES.length);
const jsUnits = new Uint32Array(CATEGORIES.length);
for (let i = 0; i < COUNT; i++) {
  const at = recordsPtr + i * RECORD;
  const category = view.getUint8(at + 6);
  jsRevenue[category] += view.getUint16(at + 4, true) * view.getFloat32(at + 8, true);
  jsUnits[category] += view.getUint16(at + 4, true);
}

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
document.querySelector('#rows').replaceChildren(...CATEGORIES.map((name, index) => {
  const row = document.createElement('tr');
  row.append(...[name, String(units[index]), money.format(revenue[index])].map((text) => Object.assign(document.createElement('td'), { textContent: text })));
  return row;
}));
logLine(`registros → ${COUNT} × ${RECORD} bytes desde ${recordsPtr} · totales en ${totalsPtr} (múltiplo de 8)`);
CATEGORIES.forEach((name, index) => logLine(`${name} → ${units[index]} libros · ${money.format(revenue[index])}`));
const sameBits = revenue.every((value, index) => Object.is(value, jsRevenue[index])) && units.every((value, index) => value === jsUnits[index]);
logLine(`¿los mismos totales que en JavaScript, al último bit? ${sameBits}`);
```
