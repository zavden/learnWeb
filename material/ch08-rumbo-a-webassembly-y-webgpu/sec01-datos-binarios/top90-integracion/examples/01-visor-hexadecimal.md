---
example_description: "Un visor hexadecimal de los archivos de assets/: fetch + arrayBuffer, un volcado con posiciones, bytes y columna ASCII hecho con subarray y padStart, y un resumen que reconoce la firma y lee las medidas con DataView en el orden de cada formato"
example_tags: "javascript|hexdump|fetch|arraybuffer|dataview|png|bmp|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Visor hexadecimal</h1>
  <div class="controls">
    <label>Archivo
      <select id="file">
        <option value="tile.png">tile.png</option>
        <option value="landscape.bmp">landscape.bmp</option>
      </select>
    </label>
    <label>Desde el byte
      <input id="start" type="number" min="0" step="16" value="0" inputmode="numeric">
    </label>
  </div>
  <p id="summary" role="status">Cargando…</p>
  <pre id="dump" tabindex="0" aria-label="Volcado hexadecimal: posición, bytes y texto"></pre>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 30rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.5rem; }
.controls { display: flex; flex-wrap: wrap; gap: 0.75rem; }
label { display: grid; gap: 0.2rem; font-size: 0.9rem; }
select, input { font: inherit; padding: 0.25rem 0.4rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; }
input { inline-size: 6rem; }
:is(select, input, pre):focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
pre { margin: 0; padding: 0.6rem; overflow-x: auto; border-radius: 0.5rem; background: #0f172a; color: #e2e8f0; font-size: 0.68rem; line-height: 1.5; }
.log { padding-inline-start: 1.25rem; font-size: 0.8rem; }
```

# JavaScript

```javascript
const ROWS = 8; // 8 filas × 16 bytes = 128 bytes por pantalla
const fileSelect = document.querySelector('#file');
const startInput = document.querySelector('#start');
const logList = document.querySelector('#log');
let bytes = new Uint8Array(0);
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const hex2 = (byte) => byte.toString(16).padStart(2, '0');
const printable = (byte) => (byte >= 0x20 && byte < 0x7f ? String.fromCharCode(byte) : '.');

function dumpLines(data, start) {
  const lines = [];
  for (let offset = start; offset < Math.min(start + ROWS * 16, data.length); offset += 16) {
    const row = data.subarray(offset, offset + 16); // una vista: no copia nada
    const cells = Array.from(row, hex2);
    const hexPart = `${cells.slice(0, 8).join(' ')}  ${cells.slice(8).join(' ')}`;
    lines.push(`${offset.toString(16).padStart(4, '0')}  ${hexPart.padEnd(49)} |${Array.from(row, printable).join('')}|`);
  }
  return lines.join('\n');
}

// Reconoce el formato por su firma y lee las medidas en el orden de bytes de cada uno.
function describe(data) {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  if (data.length >= 24 && data[0] === 0x89 && String.fromCharCode(...data.subarray(1, 4)) === 'PNG') {
    return `PNG ${view.getUint32(16, false)} × ${view.getUint32(20, false)} (big-endian)`;
  }
  if (data.length >= 26 && String.fromCharCode(data[0], data[1]) === 'BM') {
    return `BMP ${view.getInt32(18, true)} × ${Math.abs(view.getInt32(22, true))} (little-endian)`;
  }
  return 'formato desconocido';
}

function render() {
  const last = Math.max(0, Math.floor((bytes.length - 1) / 16) * 16);
  const start = Math.min(Math.max(0, Math.floor(Number(startInput.value) / 16) * 16 || 0), last);
  startInput.value = start;
  document.querySelector('#dump').textContent = dumpLines(bytes, start);
  const end = Math.min(start + ROWS * 16, bytes.length) - 1;
  const summary = `📄 ${fileSelect.value} · ${bytes.length} bytes · ${describe(bytes)} · bytes ${start}-${end}`;
  document.querySelector('#summary').textContent = summary;
  return summary;
}

async function load() {
  const response = await fetch(fileSelect.value);
  if (!response.ok) throw new Error(`${fileSelect.value}: HTTP ${response.status}`);
  bytes = new Uint8Array(await response.arrayBuffer());
  startInput.value = 0;
  logLine(render());
}

fileSelect.addEventListener('change', () => load().catch((error) => logLine(`⚠️ ${error.message}`)));
startInput.addEventListener('change', () => logLine(render()));
await load();
logLine('Listo: elige otro archivo o escribe otra posición en «Desde el byte» (se redondea a múltiplos de 16)');
```
