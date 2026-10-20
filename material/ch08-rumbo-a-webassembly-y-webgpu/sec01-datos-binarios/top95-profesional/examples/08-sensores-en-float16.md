---
example_description: "Comprimir un día de lecturas de un sensor (1440 temperaturas) eligiendo el tipo: Float64Array, Float32Array, Float16Array, enteros de centésimas en Int16Array y bytes cuantizados con escala; tamaño, error máximo, medio y cuadrático de cada uno, y el formato más pequeño que cumple la tolerancia elegida"
example_tags: "javascript|float16array|float32array|cuantizacion|precision|compresion|sensores|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="sensor-app">
  <h1>Invernadero 2 · temperatura del 13 de octubre</h1>
  <p class="intro">1440 lecturas (una por minuto) de un sensor con resolución de 0,01 °C. Datos sintéticos, generados con una semilla: siempre los mismos.</p>
  <p>
    <label for="tolerance">Error máximo aceptable</label>
    <select id="tolerance">
      <option value="0">ninguno (exacto)</option>
      <option value="0.001">0,001 °C</option>
      <option value="0.01" selected>0,01 °C</option>
      <option value="0.05">0,05 °C</option>
      <option value="0.1">0,1 °C</option>
    </select>
  </p>
  <div class="scroll" tabindex="0" role="region" aria-labelledby="table-caption">
    <table>
      <caption id="table-caption">Cada formato, de mayor a menor tamaño</caption>
      <thead><tr><th scope="col">Formato</th><th scope="col">Bytes</th><th scope="col">Error máx.</th><th scope="col">Error medio</th><th scope="col">RMS</th></tr></thead>
      <tbody id="formats"></tbody>
    </table>
  </div>
  <p id="choice" class="choice" role="status"></p>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; --pick-bg: #dcfce7; --pick-ink: #14532d; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.sensor-app { max-width: 42rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0 0 0.25rem; font-size: 1.2rem; }
.intro { margin-top: 0; color: var(--muted); }
select { font: inherit; padding: 0.25rem 0.4rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); color: var(--ink); }
:is(select, .scroll):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.scroll { overflow-x: auto; }
table { border-collapse: collapse; inline-size: 100%; font-size: 0.85rem; font-variant-numeric: tabular-nums; background: var(--surface); }
caption { text-align: start; font-weight: 600; padding-block: 0.25rem; }
th, td { padding: 0.25rem 0.5rem; border-bottom: 1px solid var(--line); text-align: end; white-space: nowrap; }
th:first-child, td:first-child { text-align: start; }
tr[data-pick] td { background: var(--pick-bg); color: var(--pick-ink); font-weight: 700; }
.choice { font-weight: 600; }
.log { margin: 1rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
```

# JavaScript

```javascript
// Elegir el tipo de un conjunto de datos numéricos.
//
// Decisiones de diseño:
// - Cada formato es un par codificar/decodificar sobre typed arrays; el error se
//   mide decodificando, que es lo que verá quien use los datos.
// - Se compara con el valor real del sensor, que tiene resolución de 0,01 °C: por
//   eso «centésimas en Int16Array» es exacto con la mitad de bytes que float32.
//   Cuando la resolución de la fuente es conocida, un entero escalado gana.
// - La cuantización a 8 bits guarda el mínimo y el máximo (2 × float32) y reparte
//   el rango en 255 pasos: su error depende del rango de los datos, no del valor.
// - Float16Array solo se usa si existe (en Chrome desde 2025).
// - La recomendación es el formato más pequeño cuyo error MÁXIMO cabe en la
//   tolerancia (el medio engaña: un solo valor muy malo puede romper una alarma).
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// Un día de lecturas, minuto a minuto: ciclo diario + ruido pseudoaleatorio con semilla.
let seed = 13102026;
const noise = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648 - 0.5) * 0.6;
const readings = Float64Array.from({ length: 1440 }, (_, minute) => {
  const hours = minute / 60;
  const value = 21 + 7 * Math.sin(((hours - 9) / 24) * 2 * Math.PI) + noise();
  return Math.round(value * 100) / 100; // el sensor da centésimas
});

const FORMATS = [
  { name: 'Float64Array', encode: (data) => Float64Array.from(data), decode: (stored) => stored },
  { name: 'Float32Array', encode: (data) => Float32Array.from(data), decode: (stored) => stored },
  typeof Float16Array === 'function' && { name: 'Float16Array', encode: (data) => Float16Array.from(data), decode: (stored) => stored },
  {
    name: 'Int16Array (centésimas)',
    encode: (data) => Int16Array.from(data, (value) => Math.round(value * 100)),
    decode: (stored) => Array.from(stored, (hundredths) => hundredths / 100),
  },
  {
    name: 'Uint8Array cuantizado',
    encode(data) {
      const min = Math.fround(Math.min(...data));
      const max = Math.fround(Math.max(...data));
      const bytes = new Uint8Array(8 + data.length); // cabecera: min y max en float32
      const view = new DataView(bytes.buffer);
      view.setFloat32(0, min, true);
      view.setFloat32(4, max, true);
      bytes.set(Array.from(data, (value) => Math.round(((value - min) / (max - min)) * 255)), 8);
      return bytes;
    },
    decode(bytes) {
      const view = new DataView(bytes.buffer);
      const min = view.getFloat32(0, true);
      const max = view.getFloat32(4, true);
      return Array.from(bytes.subarray(8), (step) => min + (step / 255) * (max - min));
    },
  },
].filter(Boolean);

function measure(format) {
  const stored = format.encode(readings);
  const decoded = format.decode(stored);
  let maxError = 0;
  let sumError = 0;
  let sumSquares = 0;
  readings.forEach((value, index) => {
    const error = Math.abs(decoded[index] - value);
    maxError = Math.max(maxError, error);
    sumError += error;
    sumSquares += error * error;
  });
  return { name: format.name, bytes: stored.byteLength, maxError, meanError: sumError / readings.length, rms: Math.sqrt(sumSquares / readings.length) };
}

const results = FORMATS.map(measure);
// Los errores por debajo de 1e-12 son redondeos de float64 al dividir: se muestran como 0.
const showError = (error) => (error < 1e-12 ? '0' : error.toPrecision(2));
const percent = new Intl.NumberFormat('es', { maximumFractionDigits: 1 });

function render() {
  const tolerance = Number(document.querySelector('#tolerance').value);
  const fitting = results.filter((result) => result.maxError <= tolerance + 1e-9);
  // El más pequeño; a igual tamaño, el de menos error.
  const pick = fitting.reduce((best, result) => (result.bytes < best.bytes || (result.bytes === best.bytes && result.maxError < best.maxError) ? result : best));
  document.querySelector('#formats').replaceChildren(...results.map((result) => {
    const row = document.createElement('tr');
    for (const text of [result.name, result.bytes, showError(result.maxError), showError(result.meanError), showError(result.rms)]) {
      row.append(Object.assign(document.createElement('td'), { textContent: text }));
    }
    row.toggleAttribute('data-pick', result === pick);
    return row;
  }));
  const label = document.querySelector('#tolerance').selectedOptions[0].textContent;
  const message = `Error máximo «${label}» → ${pick.name}, ${pick.bytes} bytes (${percent.format((pick.bytes / results[0].bytes) * 100)} % de float64)`;
  document.querySelector('#choice').textContent = message;
  return message;
}

for (const result of results) {
  logLine(`${result.name.padEnd(24)} ${String(result.bytes).padStart(5)} B · máx ${showError(result.maxError)} · medio ${showError(result.meanError)}`);
}
logLine(`✅ ${render()}`);
document.querySelector('#tolerance').addEventListener('change', () => logLine(`✅ ${render()}`));
logLine('Listo: cambia el error máximo aceptable a 0,05 °C y luego a «ninguno»');
```
