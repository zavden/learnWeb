---
example_description: "Un mapa de calor de las visitas a un museo (7 días × 12 horas) hecho en la GPU: los datos van de un Float32Array a una textura de un canal en float16 (R16F), y un fragment shader convierte cada valor en un color con una escala de cinco paradas. Celdas nítidas (NEAREST) o suavizadas (LINEAR), una celda seleccionable con el ratón o el teclado y la misma información en una tabla"
example_tags: "javascript|webgl2|texturas|float16|r16f|visualizacion-de-datos|mapa-de-calor|accesibilidad"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main class="heat">
  <h1>Visitas al museo por hora</h1>
  <p class="hint">Lunes cerrado. Pasa el ratón por el mapa o entra con Tab y usa las flechas.</p>
  <canvas id="map" tabindex="0" role="img" aria-label="Mapa de calor de visitas: más visitas los fines de semana a las 13:00 y a las 18:00" aria-describedby="readout"></canvas>
  <p id="readout" class="readout" aria-live="polite"></p>
  <label class="smooth"><input id="smooth" type="checkbox"> Suavizar (filtro LINEAR)</label>
  <details>
    <summary>Ver los datos en una tabla</summary>
    <div class="table-wrap"><table id="table"></table></div>
  </details>
</main>

<script type="x-shader/x-vertex" id="vertex-shader">
#version 300 es
layout(location = 0) in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
</script>

<script type="x-shader/x-fragment" id="fragment-shader">
#version 300 es
precision highp float;
uniform sampler2D u_data; // un canal (.r): las visitas, tal cual (no de 0 a 1)
uniform float u_max;
uniform vec2 u_selected;  // columna y fila de la celda elegida
in vec2 v_uv;
out vec4 outColor;

// Escala de color con cinco paradas: noche, violeta, rosa, ámbar y crema
vec3 colormap(float t) {
  vec3 stops[5] = vec3[](vec3(30.0, 27.0, 75.0), vec3(109.0, 40.0, 217.0), vec3(219.0, 39.0, 119.0),
                         vec3(245.0, 158.0, 11.0), vec3(254.0, 243.0, 199.0));
  float x = clamp(t, 0.0, 1.0) * 4.0;
  int i = min(int(x), 3);
  return mix(stops[i], stops[i + 1], x - float(i)) / 255.0;
}

void main() {
  float visits = texture(u_data, v_uv).r;
  vec3 color = colormap(visits / u_max);
  vec2 grid = v_uv * vec2(12.0, 7.0);
  vec2 inCell = fract(grid);
  bool border = min(inCell.x, inCell.y) < 0.06 || max(inCell.x, inCell.y) > 0.94;
  if (floor(grid) == u_selected && border) color = vec3(1.0); // marco blanco de la celda elegida
  outColor = vec4(color, 1.0);
}
</script>
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
.heat {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin: 0 0 0.25rem;
}
.hint {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  color: #94a3b8;
}
#map {
  display: block;
  width: 360px;
  max-width: 100%;
  height: 210px;
  cursor: crosshair;
}
#map:focus-visible,
input:focus-visible,
summary:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}
.readout {
  min-height: 1.4em;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.85rem;
}
.table-wrap {
  overflow-x: auto;
}
table {
  border-collapse: collapse;
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
}
th,
td {
  padding: 0.15rem 0.35rem;
  border: 1px solid #334155;
  text-align: end;
}
```

# JavaScript

```javascript
// Usa assets/webgl/utils.js (léelo con «Assets»).
import { createProgram, shaderFromScript, fullScreenQuad, fitCanvas, readPixel, releaseOnPageHide } from './webgl/utils.js';

// --- Los datos: visitas por día (filas) y hora (columnas, de 10:00 a 21:00) -----------
const DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const HOURS = Array.from({ length: 12 }, (_, i) => 10 + i);
const DAY_FACTOR = [0, 0.55, 0.6, 0.65, 0.8, 1, 0.95]; // los lunes, el museo cierra
const hourCurve = (h) => 60 + 300 * Math.exp(-(((h - 13) / 1.6) ** 2)) + 160 * Math.exp(-(((h - 18) / 1.4) ** 2));
const visits = DAYS.map((_, d) => HOURS.map((h) => Math.round(DAY_FACTOR[d] * hourCurve(h))));
const max = Math.max(...visits.flat());

// La tabla, para leer los números (y para los lectores de pantalla)
const table = document.querySelector('#table');
table.innerHTML = `<caption>Visitas por hora</caption><tr><th scope="col">Día</th>${HOURS.map((h) => `<th scope="col">${h}:00</th>`).join('')}</tr>`
  + visits.map((row, d) => `<tr><th scope="row">${DAYS[d]}</th>${row.map((v) => `<td>${v}</td>`).join('')}</tr>`).join('');

// --- A la GPU: un Float32Array de 12 × 7, una textura R16F ------------------------------
// La fila 0 de la textura es la de ABAJO: se sube el domingo primero para que el lunes quede arriba.
const data = new Float32Array([...visits].reverse().flat());
const canvas = document.querySelector('#map');
const gl = canvas.getContext('webgl2');
releaseOnPageHide(gl);
const [width, height] = fitCanvas(canvas);
gl.viewport(0, 0, width, height);
const program = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('fragment-shader'));
fullScreenQuad(gl, program);
gl.useProgram(program);
gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, 12, 7, 0, gl.RED, gl.FLOAT, data); // float32 → float16
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.uniform1f(gl.getUniformLocation(program, 'u_max'), max);
const selectedLocation = gl.getUniformLocation(program, 'u_selected');

const smooth = document.querySelector('#smooth');
const readout = document.querySelector('#readout');
let selected = { day: 5, hour: 3 }; // sábado, 13:00

function draw() {
  const filter = smooth.checked ? gl.LINEAR : gl.NEAREST; // R16F se puede filtrar con LINEAR
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.uniform2f(selectedLocation, selected.hour, 6 - selected.day); // columna, fila desde abajo
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  readout.textContent = `${DAYS[selected.day]}, ${HOURS[selected.hour]}:00 → ${visits[selected.day][selected.hour]} visitas`;
}
// El centro de una celda en el lienzo (y desde abajo) y su color, leído de la GPU
const cellColor = (day, hour) => readPixel(gl, Math.floor(((hour + 0.5) / 12) * width), Math.floor(((6 - day + 0.5) / 7) * height));

draw();
console.log(`datos → 7 × 12 = ${data.length} valores · ${data.length * 2} bytes en float16 en la GPU (${data.byteLength} en float32)`);
console.log(`máximo → ${DAYS[5]} 13:00, ${max} visitas · color ${cellColor(5, 3)}`);
console.log(`mínimo → lunes (cerrado), 0 visitas · color ${cellColor(0, 3)}`);
console.log('Listo: pasa el ratón por el mapa (haz clic para anotar una celda) o usa las flechas');

// --- Elegir celda: ratón (con la y dada la vuelta) o teclado ------------------------------
function select(day, hour, announce) {
  const next = { day: Math.min(6, Math.max(0, day)), hour: Math.min(11, Math.max(0, hour)) };
  if (next.day !== selected.day || next.hour !== selected.hour) {
    selected = next;
    draw(); // un dibujo solo cuando cambia la celda, no en cada movimiento del ratón
  }
  if (announce) console.log(readout.textContent);
}
function cellUnder(event, announce) {
  const rect = canvas.getBoundingClientRect(); // en CSS la y crece hacia abajo: fila 0 = lunes, arriba
  select(Math.floor(((event.clientY - rect.top) / rect.height) * 7), Math.floor(((event.clientX - rect.left) / rect.width) * 12), announce);
}
canvas.addEventListener('pointermove', (event) => cellUnder(event, false));
canvas.addEventListener('pointerdown', (event) => cellUnder(event, true));
canvas.addEventListener('keydown', (event) => {
  const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
  if (!moves[event.key]) return;
  event.preventDefault(); // que las flechas no desplacen la página
  select(selected.day + moves[event.key][0], selected.hour + moves[event.key][1], true);
});
smooth.addEventListener('change', () => {
  draw();
  console.log(smooth.checked ? 'suavizado: LINEAR mezcla las celdas vecinas' : 'celdas: NEAREST');
});
```
