---
example_description: "Un catálogo de artesanías con un índice ordenado en la memoria lineal: entradas de 16 bytes (SKU, puntero y longitud del nombre, precio), búsqueda binaria e inserción que abre hueco con memory.copy en WebAssembly, y los nombres en UTF-8 en una zona aparte con un asignador de avance; buscar, añadir y recorrer, comprobado contra un Map"
example_tags: "javascript|webassembly|wasm|indice|busqueda-binaria|memory-copy|asignador|strings|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="catalog">
  <header>
    <h1>Catálogo de artesanías</h1>
    <p>Un índice ordenado por SKU, entero en la memoria de WebAssembly.</p>
  </header>
  <section aria-labelledby="search-title">
    <h2 id="search-title">Buscar</h2>
    <label>SKU <input id="search" inputmode="numeric" autocomplete="off" value="163352"></label>
    <p id="found" class="found" role="status"></p>
  </section>
  <section aria-labelledby="add-title">
    <h2 id="add-title">Añadir</h2>
    <div class="add">
      <label>SKU <input id="new-sku" inputmode="numeric" autocomplete="off" value="100001"></label>
      <label>Nombre <input id="new-name" autocomplete="off" value="Catrina de barro, Capula"></label>
      <label>Precio (MXN) <input id="new-price" type="number" min="0" step="0.01" value="1450"></label>
      <button id="add" type="button">Añadir</button>
    </div>
  </section>
  <table>
    <caption id="page-caption">Las primeras entradas, por SKU</caption>
    <thead><tr><th scope="col">Posición</th><th scope="col">SKU</th><th scope="col">Artesanía</th><th scope="col">Precio</th></tr></thead>
    <tbody id="rows"></tbody>
  </table>
  <div class="pager">
    <button id="previous" type="button">◀ Anteriores</button>
    <button id="next" type="button">Siguientes ▶</button>
  </div>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; --mark: #fef3c7; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.catalog { max-width: 40rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0; font-size: 1.3rem; }
h2 { margin: 0.9rem 0 0.3rem; font-size: 1rem; }
header p { margin: 0.2rem 0 0; color: var(--muted); }
label { display: grid; gap: 0.15rem; font-size: 0.85rem; }
.add { display: flex; flex-wrap: wrap; gap: 0.5rem 0.75rem; align-items: end; }
input, button { font: inherit; padding: 0.3rem 0.55rem; border: 1px solid #64748b; border-radius: 0.4rem; background: var(--surface); color: var(--ink); }
#search, #new-sku { inline-size: 8rem; font-family: Menlo, Consolas, monospace; }
#new-price { inline-size: 7rem; }
button { cursor: pointer; }
button:disabled { cursor: not-allowed; color: var(--muted); }
:is(input, button):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.found { min-block-size: 1.4em; font-weight: 600; }
table { inline-size: 100%; margin-block-start: 0.9rem; border-collapse: collapse; background: var(--surface); font-size: 0.85rem; }
caption { text-align: start; color: var(--muted); padding-block-end: 0.3rem; }
th, td { padding: 0.3rem 0.5rem; border-bottom: 1px solid var(--line); text-align: start; }
td:nth-child(1), td:nth-child(2) { font-family: Menlo, Consolas, monospace; }
td:last-child, th:last-child { text-align: end; font-variant-numeric: tabular-nums; }
tr[data-match] td { background: var(--mark); }
.pager { display: flex; gap: 0.5rem; margin-block-start: 0.5rem; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; overflow-wrap: anywhere; }
```

# JavaScript

```javascript
// Un catálogo con un índice ordenado en la memoria lineal.
//
// Decisiones de diseño:
// - Dos zonas de memoria: el índice (página 0: hasta 4096 entradas de 16 bytes) y los nombres
//   (desde el byte 65536), repartidos por un asignador de avance (lección «La memoria lineal»).
// - Una entrada: SKU (u32), puntero y longitud del nombre (u32, u32) y precio en centavos (u32),
//   alineada a 16. El índice se mantiene ORDENADO: buscar es una búsqueda binaria (como mucho
//   32 vueltas) e insertar abre hueco moviendo las entradas siguientes con memory.copy, la
//   instrucción de «memoria en bloque» que equivale a copyWithin.
// - WebAssembly no sabe nada de textos: guarda punteros. Los nombres entran con encodeInto y
//   salen con TextDecoder, siempre con su longitud.
// - Los 500 productos de muestra se insertan en un orden revuelto y se comprueba que el índice
//   queda ordenado y que las 500 búsquedas coinciden con un Map de JavaScript.
//
// Usa assets/wasm/wat.js y assets/wasm/emit.js.
// Alcance: HTML, CSS, JavaScript, DOM, eventos, TextEncoder/TextDecoder, Intl y este módulo.
import { assemble } from './wasm/wat.js';

const WAT = `(module
  (memory (export "memory") 2 16)
  (global $count (export "count") (mut i32) (i32.const 0))
  ;; La posición del SKU en el índice, o −(donde iría) − 1 si no está.
  (func $find (export "find") (param $sku i32) (result i32) (local $lo i32) (local $hi i32) (local $mid i32) (local $key i32)
    (local.set $hi (global.get $count))
    block $done
      loop $more
        (br_if $done (i32.ge_u (local.get $lo) (local.get $hi)))   ;; cada vuelta parte el intervalo en dos
        (local.set $mid (i32.shr_u (i32.add (local.get $lo) (local.get $hi)) (i32.const 1)))
        (local.set $key (i32.load (i32.shl (local.get $mid) (i32.const 4))))
        (if (i32.eq (local.get $key) (local.get $sku)) (then (return (local.get $mid))))
        (if (i32.lt_u (local.get $key) (local.get $sku))
          (then (local.set $lo (i32.add (local.get $mid) (i32.const 1))))
          (else (local.set $hi (local.get $mid))))
        br $more
      end
    end
    (i32.sub (i32.const -1) (local.get $lo)))
  ;; Insertar: -1 si el SKU ya existe, -2 si el índice está lleno; si no, la posición.
  (func (export "insert") (param $sku i32) (param $name i32) (param $length i32) (param $price i32) (result i32)
    (local $at i32) (local $address i32)
    (local.set $at (call $find (local.get $sku)))
    (if (i32.ge_s (local.get $at) (i32.const 0)) (then (return (i32.const -1))))
    (if (i32.ge_u (global.get $count) (i32.const 4096)) (then (return (i32.const -2))))
    (local.set $at (i32.sub (i32.const -1) (local.get $at)))
    (local.set $address (i32.shl (local.get $at) (i32.const 4)))
    ;; abrir hueco: las entradas desde $at, 16 bytes más allá (memory.copy admite que se solapen)
    (memory.copy (i32.add (local.get $address) (i32.const 16)) (local.get $address)
      (i32.shl (i32.sub (global.get $count) (local.get $at)) (i32.const 4)))
    (i32.store (local.get $address) (local.get $sku))
    (i32.store offset=4 (local.get $address) (local.get $name))
    (i32.store offset=8 (local.get $address) (local.get $length))
    (i32.store offset=12 (local.get $address) (local.get $price))
    (global.set $count (i32.add (global.get $count) (i32.const 1)))
    local.get $at))`;
const { instance } = await WebAssembly.instantiate(assemble(WAT));
const { memory, count, find, insert } = instance.exports;

// --- Los nombres: un asignador de avance desde el byte 65536 ---
const NAMES_START = 65536;
let nextName = NAMES_START;
const encoder = new TextEncoder();
const decoder = new TextDecoder();
function storeName(text) {
  const maxBytes = text.length * 3; // el peor caso de UTF-8 para un texto de JavaScript
  const needed = nextName + maxBytes;
  if (needed > memory.buffer.byteLength) memory.grow(Math.ceil((needed - memory.buffer.byteLength) / 65536)); // lanza si pasa del máximo
  const { written } = encoder.encodeInto(text, new Uint8Array(memory.buffer, nextName, maxBytes)); // vista DESPUÉS de crecer
  const ptr = nextName;
  nextName += written;
  return { ptr, length: written };
}
function entryAt(position) {
  const view = new DataView(memory.buffer, position * 16, 16);
  const name = new Uint8Array(memory.buffer, view.getUint32(4, true), view.getUint32(8, true));
  return { sku: view.getUint32(0, true), name: decoder.decode(name), cents: view.getUint32(12, true) };
}
function addProduct(sku, name, cents) {
  if (find(sku) >= 0) return -1; // no gastar memoria en un nombre que no se va a guardar
  const { ptr, length } = storeName(name);
  return insert(sku, ptr, length, cents);
}

// --- 500 productos de muestra, en un orden revuelto ---
const CRAFTS = ['Alebrije de Arrazola', 'Barro negro de San Bartolo', 'Talavera de Puebla', 'Rebozo de Santa María del Río',
  'Huipil de San Andrés Larráinzar', 'Máscara de Tócuaro', 'Jarrito de Tlaquepaque', 'Cobre de Santa Clara',
  'Árbol de la vida de Metepec', 'Sarape de Saltillo', 'Laca de Olinalá', 'Bordado de Tenango'];
const reference = new Map();
for (let i = 0; i < 500; i++) {
  const sku = 100000 + ((i * 7919) % 900000);
  const name = `${CRAFTS[i % CRAFTS.length]} n.º ${1 + Math.floor(i / CRAFTS.length)}`;
  const cents = 15000 + ((i * 3571) % 400000);
  addProduct(sku, name, cents);
  reference.set(sku, { name, cents });
}

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
let sorted = true;
for (let position = 1; position < count.value; position++) if (entryAt(position - 1).sku >= entryAt(position).sku) sorted = false;
const agrees = [...reference].every(([sku, { name, cents }]) => {
  const position = find(sku);
  return position >= 0 && entryAt(position).name === name && entryAt(position).cents === cents;
});
logLine(`${count.value} productos · índice de ${count.value * 16} bytes · nombres: ${nextName - NAMES_START} bytes desde ${NAMES_START}`);
logLine(`¿el índice está ordenado por SKU? ${sorted} · ¿las 500 búsquedas coinciden con un Map? ${agrees}`);

// --- La página ---
const PAGE = 8;
let first = 0;
let highlighted = -1;
const rows = document.querySelector('#rows');
const caption = document.querySelector('#page-caption');
function renderPage() {
  first = Math.max(0, Math.min(first, count.value - PAGE));
  rows.replaceChildren(...Array.from({ length: Math.min(PAGE, count.value) }, (_, offset) => {
    const position = first + offset;
    const { sku, name, cents } = entryAt(position);
    const row = document.createElement('tr');
    if (position === highlighted) row.dataset.match = '';
    row.append(...[position, sku, name, money.format(cents / 100)].map((text) => Object.assign(document.createElement('td'), { textContent: String(text) })));
    return row;
  }));
  caption.textContent = `Entradas ${first + 1} a ${first + rows.children.length} de ${count.value}, ordenadas por SKU`;
  document.querySelector('#previous').disabled = first === 0;
  document.querySelector('#next').disabled = first + PAGE >= count.value;
}
const readSku = (input) => {
  const value = Number(input.value.trim());
  return Number.isInteger(value) && value >= 0 && value <= 4294967295 ? value : null;
};
function search({ log }) {
  const output = document.querySelector('#found');
  const sku = readSku(document.querySelector('#search'));
  if (sku === null) { output.textContent = 'Un SKU es un entero de 0 a 4294967295.'; return; }
  const position = find(sku);
  if (position >= 0) {
    const { name, cents } = entryAt(position);
    output.textContent = `${sku}: ${name}, ${money.format(cents / 100)} (posición ${position})`;
    highlighted = position;
    first = position - 2;
  } else {
    output.textContent = `${sku} no está; iría en la posición ${-position - 1}`;
    highlighted = -1;
    first = -position - 3;
  }
  renderPage();
  if (log) logLine(`buscar ${sku} → ${output.textContent}`);
}
document.querySelector('#search').addEventListener('input', () => search({ log: false }));
document.querySelector('#search').addEventListener('change', () => search({ log: true }));
document.querySelector('#add').addEventListener('click', () => {
  const sku = readSku(document.querySelector('#new-sku'));
  const name = document.querySelector('#new-name').value.trim();
  const cents = Math.round(document.querySelector('#new-price').valueAsNumber * 100);
  if (sku === null || !name || !Number.isInteger(cents) || cents < 0 || cents > 4294967295) {
    logLine('❗ revisa el SKU, el nombre y el precio');
    return;
  }
  const position = addProduct(sku, name, cents);
  if (position === -1) logLine(`❗ el SKU ${sku} ya existe`);
  else if (position === -2) logLine('❗ el índice está lleno (4096 entradas)');
  else {
    highlighted = position;
    first = position - 2;
    renderPage();
    logLine(`añadido ${sku} «${name}» en la posición ${position} · ahora hay ${count.value}`);
  }
});
document.querySelector('#previous').addEventListener('click', () => { first -= PAGE; renderPage(); });
document.querySelector('#next').addEventListener('click', () => { first += PAGE; renderPage(); });
search({ log: true });
logLine('Listo: busca un SKU (Intro para anotarlo), añade una artesanía o recorre el índice');
```
