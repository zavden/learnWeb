---
example_description: "Un inspector de archivos .wasm: elige un módulo de los assets, abre uno tuyo o arrástralo; un lector con cursor descifra cada sección (tipos, importaciones, funciones con su tamaño de código, memoria, globales, exportaciones, segmentos de datos y la sección «name» con los nombres de las funciones), dibuja un volcado comentado y, si no es un módulo, dice qué es y por qué no compila"
example_tags: "javascript|webassembly|wasm|parser|leb128|secciones|file|drag-and-drop|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="inspector">
  <header>
    <h1>Inspector de WebAssembly</h1>
    <p>Elige un archivo de la lección, abre uno tuyo o suéltalo aquí.</p>
  </header>
  <div class="pickers">
    <label>Archivo de la lección
      <select id="asset">
        <option value="plugins/buen-fin.wasm">plugins/buen-fin.wasm</option>
        <option value="plugins/pide-red.wasm">plugins/pide-red.wasm</option>
        <option value="wasm/checksum.wasm">wasm/checksum.wasm</option>
        <option value="valley-of-mexico.jpg">valley-of-mexico.jpg (no es un módulo)</option>
      </select>
    </label>
    <label>O uno tuyo <input id="file" type="file" accept=".wasm,application/wasm"></label>
  </div>
  <div id="drop" class="drop">Suelta un archivo aquí</div>
  <p id="status" class="status" role="status"></p>
  <section aria-labelledby="sections-title">
    <h2 id="sections-title">Secciones</h2>
    <table>
      <thead><tr><th scope="col">Id</th><th scope="col">Sección</th><th scope="col">Posición</th><th scope="col">Bytes</th><th scope="col">Contenido</th></tr></thead>
      <tbody id="sections"></tbody>
    </table>
  </section>
  <section aria-labelledby="dump-title">
    <h2 id="dump-title">Volcado comentado</h2>
    <pre id="dump" tabindex="0" aria-label="Volcado hexadecimal comentado"></pre>
  </section>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; --code-bg: #0f172a; --code-ink: #e2e8f0; --bad: #9f1239; --good: #166534; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.inspector { max-width: 50rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0; font-size: 1.3rem; }
h2 { margin: 1rem 0 0.4rem; font-size: 1rem; }
header p { margin: 0.2rem 0 0.75rem; color: var(--muted); }
.pickers { display: flex; flex-wrap: wrap; gap: 0.5rem 1.5rem; align-items: end; }
.pickers label { display: grid; gap: 0.2rem; font-size: 0.9rem; }
select, input { font: inherit; padding: 0.3rem 0.5rem; border: 1px solid #64748b; border-radius: 0.4rem; background: var(--surface); color: var(--ink); }
:is(select, input, pre):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.drop { margin-block-start: 0.6rem; padding: 0.8rem; border: 2px dashed #64748b; border-radius: 0.5rem; text-align: center; color: var(--muted); }
.drop[data-over] { border-color: var(--accent); background: #dbeafe; color: var(--ink); }
.status { font-weight: 600; }
.status[data-valid="true"] { color: var(--good); }
.status[data-valid="false"] { color: var(--bad); }
table { inline-size: 100%; border-collapse: collapse; font-size: 0.85rem; background: var(--surface); }
th, td { padding: 0.3rem 0.5rem; border-bottom: 1px solid var(--line); text-align: start; vertical-align: top; }
td:nth-child(1), td:nth-child(3), td:nth-child(4) { font-family: Menlo, Consolas, monospace; white-space: nowrap; }
td:last-child { overflow-wrap: anywhere; }
pre { margin: 0; padding: 0.6rem; max-block-size: 18rem; overflow: auto; border-radius: 0.4rem; background: var(--code-bg); color: var(--code-ink); font-size: 0.75rem; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; overflow-wrap: anywhere; }
```

# JavaScript

```javascript
// Un inspector de archivos .wasm.
//
// Decisiones de diseño:
// - Un lector con cursor (lecciones «DataView y endianness» y «WebAssembly a mano») que lanza un
//   error con la posición si el archivo se corta: un .wasm de un desconocido es entrada no fiable.
// - Cada sección se lee dentro de sus límites (inicio + tamaño). Si el contenido no cuadra con el
//   tamaño, se dice; si la sección no se conoce, se salta: así funciona el formato.
// - El veredicto final no es del inspector, sino del navegador: WebAssembly.compile() da el error
//   exacto (con @+posición) de lo que el lector no comprueba, como los tipos.
// - Los nombres de las funciones salen de la sección personalizada «name», si la hay; si no, se
//   usan los nombres de las exportaciones e importaciones.
// - Los archivos propios se leen con file.arrayBuffer(), como mucho 8 MiB; nada sale del navegador.
//
// Alcance: HTML, CSS, JavaScript, DOM, eventos, File API y arrastrar y soltar, fetch y este módulo.
const MAX_BYTES = 8 * 1024 * 1024;
const SECTION_NAMES = { 0: 'personalizada', 1: 'tipos', 2: 'importaciones', 3: 'funciones', 4: 'tablas', 5: 'memoria', 6: 'globales', 7: 'exportaciones', 8: 'inicio', 9: 'elementos', 10: 'código', 11: 'datos', 12: 'cuenta de datos', 13: 'etiquetas' };
const VALTYPES = { 0x7f: 'i32', 0x7e: 'i64', 0x7d: 'f32', 0x7c: 'f64', 0x7b: 'v128', 0x70: 'funcref', 0x6f: 'externref' };
const KINDS = ['función', 'tabla', 'memoria', 'global', 'etiqueta'];
const SIGNATURES = [ // para decir qué es un archivo que no es un módulo (módulo «Datos binarios»)
  ['un JPEG', [0xff, 0xd8, 0xff]], ['un PNG', [0x89, 0x50, 0x4e, 0x47]], ['un GIF', [0x47, 0x49, 0x46, 0x38]],
  ['un PDF', [0x25, 0x50, 0x44, 0x46]], ['un ZIP', [0x50, 0x4b, 0x03, 0x04]],
];

class Reader {
  constructor(bytes, start = 0, end = bytes.length) {
    this.bytes = bytes;
    this.offset = start;
    this.end = end;
  }
  u8() {
    if (this.offset >= this.end) throw new RangeError(`el archivo se corta en el byte ${this.offset}`);
    return this.bytes[this.offset++];
  }
  uleb() { // LEB128 sin signo, como mucho 5 bytes (32 bits)
    let result = 0;
    for (let shift = 0; shift < 35; shift += 7) {
      const byte = this.u8();
      result |= (byte & 0x7f) << shift;
      if ((byte & 0x80) === 0) return result >>> 0;
    }
    throw new RangeError(`un LEB128 demasiado largo en el byte ${this.offset}`);
  }
  sleb() { // con signo, para las constantes i32 (32 bits, como mucho 5 bytes)
    let result = 0;
    let shift = 0;
    let byte;
    do {
      byte = this.u8();
      result |= (byte & 0x7f) << shift;
      shift += 7;
    } while (byte & 0x80 && shift < 35);
    return shift < 32 && byte & 0x40 ? result | (-1 << shift) : result;
  }
  bytesOf(length) {
    if (this.offset + length > this.end) throw new RangeError(`el archivo se corta en el byte ${this.end}`);
    const view = this.bytes.subarray(this.offset, this.offset + length);
    this.offset += length;
    return view;
  }
  name() { return new TextDecoder().decode(this.bytesOf(this.uleb())); }
  vec(readItem) { return Array.from({ length: this.uleb() }, () => readItem()); }
  valtype() { const code = this.u8(); return VALTYPES[code] ?? `0x${code.toString(16)}`; }
  limits() {
    const flags = this.u8();
    const min = this.uleb();
    const max = flags & 1 ? this.uleb() : undefined;
    return `${min}${max === undefined ? '' : `-${max}`} páginas${flags & 2 ? ' (compartida)' : ''}`;
  }
  constExpr() { // i32.const 16 … end, i64.const, f32.const, f64.const o global.get
    const opcode = this.u8();
    let text;
    if (opcode === 0x41) text = `i32.const ${this.sleb()}`;
    else if (opcode === 0x42) { while (this.u8() & 0x80); text = 'i64.const …'; }
    else if (opcode === 0x43) text = `f32.const ${new DataView(this.bytesOf(4).slice().buffer).getFloat32(0, true)}`;
    else if (opcode === 0x44) text = `f64.const ${new DataView(this.bytesOf(8).slice().buffer).getFloat64(0, true)}`;
    else if (opcode === 0x23) text = `global.get ${this.uleb()}`;
    else throw new RangeError(`expresión constante desconocida (0x${opcode.toString(16)}) en el byte ${this.offset - 1}`);
    if (this.u8() !== 0x0b) throw new RangeError(`falta el end de una expresión en el byte ${this.offset - 1}`);
    return text;
  }
}

const hexOf = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(' ');
const printable = (bytes) => bytes.every((byte) => byte >= 0x20 || byte === 0x0a);

function inspect(bytes) {
  const report = { sections: [], types: [], imports: [], functionTypes: [], exports: [], bodies: [], data: [], names: new Map(), memories: [], globals: [] };
  const header = new Reader(bytes, 0, Math.min(8, bytes.length));
  const magic = header.bytesOf(Math.min(4, bytes.length));
  if (hexOf(magic) !== '00 61 73 6d') {
    const kind = SIGNATURES.find(([, signature]) => signature.every((byte, i) => bytes[i] === byte));
    throw new TypeError(`firma ${hexOf(magic)}: no empieza por 00 61 73 6d${kind ? ` (es ${kind[0]})` : ''}`);
  }
  const version = new DataView(bytes.buffer, bytes.byteOffset + 4, 4).getUint32(0, true);
  report.version = version;
  const reader = new Reader(bytes, 8);
  while (reader.offset < bytes.length) {
    const start = reader.offset;
    const id = reader.u8();
    const size = reader.uleb();
    const contentStart = reader.offset;
    if (contentStart + size > bytes.length) throw new RangeError(`la sección ${id} dice medir ${size} bytes, pero solo quedan ${bytes.length - contentStart}`);
    const section = new Reader(bytes, contentStart, contentStart + size);
    let summary = '';
    switch (id) {
      case 0: {
        const name = section.name();
        summary = `«${name}», ${section.end - section.offset} bytes`;
        if (name === 'name') {
          while (section.offset < section.end) {
            const sub = section.u8();
            const subSize = section.uleb();
            const subEnd = section.offset + subSize;
            if (sub === 1) section.vec(() => report.names.set(section.uleb(), section.name()));
            section.offset = subEnd;
          }
          summary += ` · ${report.names.size} nombres de funciones`;
        }
        break;
      }
      case 1:
        report.types = section.vec(() => {
          if (section.u8() !== 0x60) throw new RangeError(`un tipo que no es de función en el byte ${section.offset - 1}`);
          const params = section.vec(() => section.valtype());
          const results = section.vec(() => section.valtype());
          return `(${params.join(', ')}) → ${results.length ? results.join(', ') : '()'}`;
        });
        summary = report.types.map((text, index) => `${index}: ${text}`).join(' · ');
        break;
      case 2:
        report.imports = section.vec(() => {
          const module = section.name();
          const field = section.name();
          const kind = section.u8();
          let detail;
          if (kind === 0) { const type = section.uleb(); detail = `función ${report.types[type] ?? `del tipo ${type}`}`; }
          else if (kind === 1) { section.valtype(); detail = `tabla, ${section.limits()}`; }
          else if (kind === 2) detail = `memoria, ${section.limits()}`;
          else if (kind === 3) { const type = section.valtype(); detail = `global ${section.u8() ? 'mutable ' : ''}${type}`; }
          else detail = KINDS[kind] ?? `tipo ${kind}`;
          return { module, field, kind, detail };
        });
        summary = report.imports.map((entry) => `${entry.module}.${entry.field} (${entry.detail})`).join(' · ');
        break;
      case 3:
        report.functionTypes = section.vec(() => section.uleb());
        summary = `${report.functionTypes.length} funciones propias`;
        break;
      case 5:
        report.memories = section.vec(() => section.limits());
        summary = report.memories.join(' · ');
        break;
      case 6:
        report.globals = section.vec(() => {
          const type = section.valtype();
          const mutable = section.u8() === 1;
          return `${mutable ? 'mut ' : ''}${type} = ${section.constExpr()}`;
        });
        summary = report.globals.join(' · ');
        break;
      case 7:
        report.exports = section.vec(() => ({ name: section.name(), kind: section.u8(), index: section.uleb() }));
        summary = report.exports.map((entry) => `«${entry.name}» → ${KINDS[entry.kind]} ${entry.index}`).join(' · ');
        break;
      case 8:
        summary = `función ${section.uleb()}`;
        break;
      case 10:
        report.bodies = section.vec(() => {
          const bodySize = section.uleb();
          section.bytesOf(bodySize);
          return bodySize;
        });
        summary = `${report.bodies.length} cuerpos: ${report.bodies.join(', ')} bytes`;
        break;
      case 11:
        report.data = section.vec(() => {
          const flags = section.uleb();
          if (flags === 2) section.uleb();
          const offset = flags === 1 ? 'pasivo' : section.constExpr();
          const content = section.bytesOf(section.uleb());
          return { offset, length: content.length, preview: printable(content) ? `«${new TextDecoder().decode(content.subarray(0, 60))}»` : hexOf(content.subarray(0, 12)) };
        });
        summary = report.data.map((segment) => `${segment.length} bytes en ${segment.offset}: ${segment.preview}`).join(' · ');
        break;
      default:
        summary = '(sin descifrar)';
    }
    if (id !== 0 && id <= 13 && section.offset !== section.end) summary += ` ⚠️ sobran ${section.end - section.offset} bytes`;
    report.sections.push({ id, name: SECTION_NAMES[id] ?? '?', start, size, headerEnd: contentStart, summary });
    reader.offset = contentStart + size;
  }
  return report;
}

// Los nombres de las funciones: los de la sección «name» o, si no, los de importaciones y exportaciones.
function functionList(report) {
  const imported = report.imports.filter((entry) => entry.kind === 0);
  const total = imported.length + report.functionTypes.length;
  return Array.from({ length: total }, (_, index) => {
    const exported = report.exports.find((entry) => entry.kind === 0 && entry.index === index);
    const name = report.names.get(index) ? `$${report.names.get(index)}` : exported ? `«${exported.name}»` : '';
    const where = index < imported.length ? `importada de ${imported[index].module}.${imported[index].field}` : `${report.bodies[index - imported.length] ?? '?'} bytes de código`;
    return `${index} ${name} (${where})`.replace('  ', ' ');
  });
}

function annotatedDump(bytes, report) {
  const lines = [`0000  ${hexOf(bytes.subarray(0, 8)).padEnd(38)}  cabecera: «\\0asm», versión ${report.version}`];
  for (const section of report.sections) {
    const shown = bytes.subarray(section.start, Math.min(section.start + 12, section.start + (section.headerEnd - section.start) + section.size));
    const more = section.headerEnd - section.start + section.size > 12 ? ' …' : '';
    lines.push(`${section.start.toString(16).padStart(4, '0')}  ${(hexOf(shown) + more).padEnd(38)}  sección ${section.id} (${section.name}), ${section.size} bytes`);
  }
  return lines.join('\n');
}

const statusLine = document.querySelector('#status');
const sectionsBody = document.querySelector('#sections');
const dump = document.querySelector('#dump');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

async function show(label, bytes) {
  sectionsBody.replaceChildren();
  dump.textContent = '';
  let report;
  try {
    report = inspect(bytes);
  } catch (error) {
    statusLine.dataset.valid = 'false';
    statusLine.textContent = `✗ ${label}: ${error.message}`;
    logLine(`${label} → ${bytes.length} bytes · ¿un módulo válido? ${WebAssembly.validate(bytes)}`);
    logLine(`✗ ${error.message}`);
    try {
      await WebAssembly.compile(bytes);
    } catch (compileError) {
      logLine(`${compileError.name}: ${compileError.message}`);
    }
    return;
  }
  const valid = WebAssembly.validate(bytes);
  statusLine.dataset.valid = String(valid);
  statusLine.textContent = `${valid ? '✓' : '✗'} ${label}: ${bytes.length} bytes, ${valid ? 'un módulo válido' : 'no valida'}`;
  sectionsBody.replaceChildren(...report.sections.map((section) => {
    const row = document.createElement('tr');
    row.append(...[section.id, section.name, `0x${section.start.toString(16)}`, section.size, section.summary].map((text) => Object.assign(document.createElement('td'), { textContent: String(text) })));
    return row;
  }));
  dump.textContent = annotatedDump(bytes, report);
  logLine(`${label} → ${bytes.length} bytes · ¿un módulo válido? ${valid}`);
  logLine(`secciones → ${report.sections.map((section) => (section.id === 0 ? `personalizada ${section.summary.split(',')[0]}` : section.name)).join(' · ')}`);
  if (report.imports.length) logLine(`importa → ${report.imports.map((entry) => `${entry.module}.${entry.field} (${entry.detail})`).join(' · ')}`);
  logLine(`exporta → ${report.exports.map((entry) => `${entry.name} (${KINDS[entry.kind]} ${entry.index})`).join(' · ')}`);
  logLine(`funciones → ${functionList(report).join(' · ')}`);
  if (report.data.length) logLine(`datos → ${report.data.map((segment) => `${segment.length} bytes en ${segment.offset}: ${segment.preview}`).join(' · ')}`);
  if (!valid) {
    try {
      await WebAssembly.compile(bytes);
    } catch (compileError) {
      logLine(`${compileError.name}: ${compileError.message}`);
    }
  }
}

async function showAsset(path) {
  const response = await fetch(path);
  if (!response.ok) {
    statusLine.textContent = `✗ ${path}: HTTP ${response.status}`;
    return;
  }
  await show(path, new Uint8Array(await response.arrayBuffer()));
}
async function showFile(file) {
  if (file.size > MAX_BYTES) {
    statusLine.dataset.valid = 'false';
    statusLine.textContent = `✗ ${file.name}: ${file.size} bytes, más de los 8 MiB que acepta el inspector`;
    return;
  }
  await show(file.name, new Uint8Array(await file.arrayBuffer()));
}

document.querySelector('#asset').addEventListener('change', (event) => showAsset(event.target.value));
document.querySelector('#file').addEventListener('change', (event) => {
  if (event.target.files[0]) showFile(event.target.files[0]);
});
const drop = document.querySelector('#drop');
drop.addEventListener('dragover', (event) => {
  event.preventDefault(); // sin esto, el navegador abriría el archivo
  drop.dataset.over = '';
});
drop.addEventListener('dragleave', () => delete drop.dataset.over);
drop.addEventListener('drop', (event) => {
  event.preventDefault();
  delete drop.dataset.over;
  const [file] = event.dataTransfer.files;
  if (file) showFile(file);
});
await showAsset('plugins/buen-fin.wasm');
logLine('Listo: elige otro archivo, abre uno tuyo o suéltalo en el recuadro');
```
