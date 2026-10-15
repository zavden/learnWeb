---
example_description: "Convertir un CSV de calidad del aire en un formato binario por columnas: estaciones codificadas con un diccionario, horas en Uint16Array, mediciones en Float32Array alineadas a 4 bytes para leerlas sin copiar, tamaños frente a CSV y JSON (también comprimidos con gzip), consultas sobre las columnas y comprobación de ida y vuelta"
example_tags: "javascript|formato-binario|columnas|float32array|diccionario|compressionstream|csv|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="columns-app">
  <h1>Calidad del aire: de CSV a columnas binarias</h1>
  <p class="intro">Cinco estaciones de la Ciudad de México, una lectura cada 15 minutos del 13 de octubre. <strong>Datos sintéticos</strong> generados para el ejemplo (assets/air-quality.csv), no mediciones reales.</p>
  <section aria-labelledby="sizes-title">
    <h2 id="sizes-title">Tamaños</h2>
    <table>
      <thead><tr><th scope="col">Formato</th><th scope="col">Bytes</th><th scope="col">Con gzip</th></tr></thead>
      <tbody id="sizes"></tbody>
    </table>
  </section>
  <section aria-labelledby="query-title">
    <h2 id="query-title">PM2.5 medio por estación (leído de las columnas)</h2>
    <table>
      <thead><tr><th scope="col">Estación</th><th scope="col">PM2.5 medio</th><th scope="col">Hora del máximo</th></tr></thead>
      <tbody id="averages"></tbody>
    </table>
  </section>
  <p>
    <button id="download" type="button">Descargar air-quality.lwco</button>
  </p>
  <p class="note">Las tarjetas de la galería y de la teoría no permiten descargas: ábrelo con ▶ o en el editor.</p>
  <p id="status" role="status"></p>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.columns-app { max-width: 40rem; margin: 0 auto; padding: 1rem; display: grid; gap: 0.75rem; }
h1 { margin: 0; font-size: 1.2rem; }
h2 { margin: 0 0 0.4rem; font-size: 1rem; }
p { margin: 0; }
.intro, .note { color: var(--muted); font-size: 0.9rem; }
section { padding: 0.75rem 1rem; border: 1px solid var(--line); border-radius: 0.6rem; background: var(--surface); overflow-x: auto; }
table { border-collapse: collapse; inline-size: 100%; font-size: 0.85rem; font-variant-numeric: tabular-nums; }
th, td { padding: 0.2rem 0.5rem; border-bottom: 1px solid var(--line); text-align: end; }
th:first-child, td:first-child { text-align: start; }
button { font: inherit; padding: 0.3rem 0.7rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); color: var(--ink); cursor: pointer; }
button:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.log { margin: 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
```

# JavaScript

```javascript
// Formato por columnas «LWCO» v1 (little-endian):
//   'LWCO' · u8 versión · u8 nº de estaciones · u16 relleno · u32 filas · u32 minuto base (desde 1970)
//   diccionario: por cada estación, u8 longitud + nombre en UTF-8
//   relleno hasta múltiplo de 4
//   columnas: station u8[filas] · minute u16[filas] · pm25 f32[filas] · temperature f32[filas] · humidity u8[filas]
//   (cada columna empieza en un múltiplo de 4)
//
// Decisiones de diseño:
// - Por columnas y no por filas: una consulta sobre PM2.5 recorre un Float32Array
//   seguido en memoria, sin tocar el resto. Así guardan los datos Parquet o Arrow.
// - Las estaciones se repiten: se guardan una vez en un diccionario y cada fila
//   lleva solo su índice (un byte).
// - Cada columna empieza en un múltiplo de 4: al leer se crean vistas
//   (new Float32Array(buffer, offset, filas)) sin copiar nada. Eso exige que la
//   máquina sea little-endian, como el formato; si no lo es, se lee con DataView.
// - El CSV se valida antes de convertir (cabecera, número de campos, números).
// - La ida y vuelta se comprueba: los decimales, con la precisión de float32.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos, la red
// (fetch, streams) y este módulo.

const COLUMNS = ['station', 'time', 'pm25', 'temperature', 'humidity'];
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });
const LITTLE_ENDIAN_MACHINE = new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
const logList = document.querySelector('#log');
let encoded = null;

function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const align4 = (offset) => (offset + 3) & ~3; // el truco de bits de «Bits y bytes»

function parseCsv(text) {
  const [headerLine, ...lines] = text.trimEnd().split('\n');
  if (headerLine !== COLUMNS.join(',')) throw new Error(`cabecera inesperada: ${headerLine}`);
  return lines.map((line, index) => {
    const fields = line.split(',');
    if (fields.length !== COLUMNS.length) throw new Error(`fila ${index + 2}: ${fields.length} campos`);
    const [station, time, pm25, temperature, humidity] = fields;
    const row = { station, time, pm25: Number(pm25), temperature: Number(temperature), humidity: Number(humidity) };
    if (![row.pm25, row.temperature, row.humidity].every(Number.isFinite)) throw new Error(`fila ${index + 2}: un número no es válido`);
    return row;
  });
}
const toMinutes = (time) => Date.parse(`${time}Z`) / 60000;

function encodeColumns(rows) {
  const stations = [...new Set(rows.map((row) => row.station))];
  const names = stations.map((name) => encoder.encode(name));
  const baseMinute = Math.min(...rows.map((row) => toMinutes(row.time)));
  // 1. Calcular el tamaño y la posición de cada parte.
  let offset = 16 + names.reduce((sum, name) => sum + 1 + name.length, 0);
  const layout = {};
  for (const [column, size] of [['station', 1], ['minute', 2], ['pm25', 4], ['temperature', 4], ['humidity', 1]]) {
    offset = align4(offset);
    layout[column] = offset;
    offset += size * rows.length;
  }
  // 2. Escribir.
  const bytes = new Uint8Array(offset);
  const view = new DataView(bytes.buffer);
  bytes.set(encoder.encode('LWCO'));
  view.setUint8(4, 1);
  view.setUint8(5, stations.length);
  view.setUint32(8, rows.length, true);
  view.setUint32(12, baseMinute, true);
  let at = 16;
  for (const name of names) {
    view.setUint8(at, name.length);
    bytes.set(name, at + 1);
    at += 1 + name.length;
  }
  rows.forEach((row, index) => {
    view.setUint8(layout.station + index, stations.indexOf(row.station));
    view.setUint16(layout.minute + index * 2, toMinutes(row.time) - baseMinute, true);
    view.setFloat32(layout.pm25 + index * 4, row.pm25, true);
    view.setFloat32(layout.temperature + index * 4, row.temperature, true);
    view.setUint8(layout.humidity + index, row.humidity);
  });
  return bytes;
}

function decodeColumns(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (decoder.decode(bytes.subarray(0, 4)) !== 'LWCO' || view.getUint8(4) !== 1) throw new Error('no es un archivo LWCO v1');
  const stationCount = view.getUint8(5);
  const rowCount = view.getUint32(8, true);
  const baseMinute = view.getUint32(12, true);
  const stations = [];
  let at = 16;
  for (let i = 0; i < stationCount; i += 1) {
    const length = view.getUint8(at);
    stations.push(decoder.decode(bytes.subarray(at + 1, at + 1 + length)));
    at += 1 + length;
  }
  const column = (Type) => {
    at = align4(at);
    const start = at;
    at += Type.BYTES_PER_ELEMENT * rowCount;
    if (at > bytes.length) throw new RangeError('archivo cortado');
    if (LITTLE_ENDIAN_MACHINE) return new Type(bytes.buffer, bytes.byteOffset + start, rowCount); // vista: sin copiar
    const get = { 1: 'getUint8', 2: 'getUint16', 4: 'getFloat32' }[Type.BYTES_PER_ELEMENT];
    return Type.from({ length: rowCount }, (_, i) => view[get](start + i * Type.BYTES_PER_ELEMENT, true));
  };
  return { stations, baseMinute, station: column(Uint8Array), minute: column(Uint16Array), pm25: column(Float32Array), temperature: column(Float32Array), humidity: column(Uint8Array) };
}

async function gzipSize(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));
  return (await new Response(stream).arrayBuffer()).byteLength;
}
const kb = (size) => `${(size / 1024).toFixed(1)} KB`;

async function main() {
  const csvBytes = new Uint8Array(await (await fetch('air-quality.csv')).arrayBuffer());
  const rows = parseCsv(decoder.decode(csvBytes));
  logLine(`📄 air-quality.csv: ${rows.length} filas × ${COLUMNS.length} columnas`);
  encoded = encodeColumns(rows);
  const jsonBytes = encoder.encode(JSON.stringify(rows));

  const sizes = [['CSV', csvBytes], ['JSON', jsonBytes], ['LWCO (columnas)', encoded]];
  const compressed = await Promise.all(sizes.map(([, bytes]) => gzipSize(bytes)));
  document.querySelector('#sizes').replaceChildren(...sizes.map(([name, bytes], index) => {
    const row = document.createElement('tr');
    for (const text of [name, bytes.length, `≈ ${kb(compressed[index])}`]) row.append(Object.assign(document.createElement('td'), { textContent: text }));
    return row;
  }));
  logLine(`📦 CSV ${csvBytes.length} B · JSON ${jsonBytes.length} B · columnas ${encoded.length} B (${Math.round((encoded.length / csvBytes.length) * 100)} % del CSV)`);
  // Los bytes exactos de gzip dependen de la versión de zlib del navegador: en la consola
  // solo la conclusión; la tabla muestra los tamaños aproximados.
  logLine(`🗜️ con gzip, ¿las columnas siguen siendo lo más pequeño? ${compressed[2] < Math.min(compressed[0], compressed[1])}`);

  // Consultas: se recorren solo las columnas que hacen falta.
  const table = decodeColumns(encoded);
  const stats = table.stations.map(() => ({ sum: 0, count: 0, max: -Infinity, maxMinute: 0 }));
  table.pm25.forEach((value, index) => {
    const stat = stats[table.station[index]];
    stat.sum += value;
    stat.count += 1;
    if (value > stat.max) { stat.max = value; stat.maxMinute = table.minute[index]; }
  });
  const hourOf = (minute) => new Date((table.baseMinute + minute) * 60000).toISOString().slice(11, 16);
  const ranking = table.stations.map((name, index) => ({ name, mean: stats[index].sum / stats[index].count, peak: hourOf(stats[index].maxMinute) })).sort((a, b) => b.mean - a.mean);
  document.querySelector('#averages').replaceChildren(...ranking.map(({ name, mean, peak }) => {
    const row = document.createElement('tr');
    for (const text of [name, `${mean.toFixed(1)} µg/m³`, peak]) row.append(Object.assign(document.createElement('td'), { textContent: text }));
    return row;
  }));
  logLine(`📊 ${ranking.map(({ name, mean }) => `${name} ${mean.toFixed(1)}`).join(' · ')}`);

  // Ida y vuelta: cada fila, igual (los decimales, con la precisión de float32).
  const same = rows.every((row, index) => table.stations[table.station[index]] === row.station
    && hourOf(table.minute[index]) === row.time.slice(11)
    && table.pm25[index] === Math.fround(row.pm25)
    && table.temperature[index] === Math.fround(row.temperature)
    && table.humidity[index] === row.humidity);
  logLine(`🔁 ida y vuelta: ${same ? `las ${rows.length} filas coinciden` : 'hay diferencias'} · vistas sin copiar: ${LITTLE_ENDIAN_MACHINE}`);
}

document.querySelector('#download').addEventListener('click', () => {
  if (!encoded) return;
  const url = URL.createObjectURL(new Blob([encoded], { type: 'application/octet-stream' }));
  Object.assign(document.createElement('a'), { href: url, download: 'air-quality.lwco' }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  document.querySelector('#status').textContent = `Descargado: air-quality.lwco (${encoded.length} bytes).`;
  logLine(`💾 air-quality.lwco (${encoded.length} bytes)`);
});

try {
  await main();
  logLine('Listo: pulsa «Descargar air-quality.lwco» y ábrelo en el visor hexadecimal (ejemplo 1)');
} catch (error) {
  document.querySelector('#status').textContent = `No se pudo convertir el CSV: ${error.message}`;
  logLine(`⚠️ ${error.message}`);
}
```
