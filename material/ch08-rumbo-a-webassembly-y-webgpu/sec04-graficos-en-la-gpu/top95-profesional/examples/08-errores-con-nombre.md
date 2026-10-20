---
example_description: "Un taller de shaders que nunca se queda en negro: editas un fragment shader (o eliges uno de los nueve errores típicos) y GLKit lo compila; si falla, la página muestra cada error con su línea, el código de esa línea y un botón para ir a ella, y la vista previa conserva el último shader que compiló. Cubre errores de compilación (int por float, identificador sin declarar, punto y coma, dimensiones), de enlazado (un in sin su out), de JavaScript (uniform mal escrito, eliminado por no usarse o con el tamaño equivocado) y de contexto (un lienzo que ya es 2D). Todos se capturan: ninguno queda sin manejar"
example_tags: "javascript|webgl2|glsl|errores|getshaderinfolog|enlazado|uniforms|glkit|accesibilidad|profesional"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<main class="workshop">
  <h1>Taller de shaders</h1>
  <p class="pick">
    <label for="preset">Ejemplo</label>
    <select id="preset"></select>
    <label for="color">Color</label>
    <input id="color" type="color" value="#e11d48">
  </p>
  <div class="workspace">
    <label class="editor">
      <span>Fragment shader (GLSL ES 3.00)</span>
      <textarea id="source" rows="13" spellcheck="false" autocapitalize="off" aria-describedby="report"></textarea>
    </label>
    <figure class="preview">
      <canvas id="preview" role="img" aria-label="Vista previa del shader"></canvas>
      <figcaption id="badge" class="badge" hidden>Se ve el último shader que compiló</figcaption>
    </figure>
  </div>
  <p class="js-call">JavaScript: <code id="js-call"></code></p>
  <section id="report" class="report" aria-live="polite" aria-label="Resultado de la compilación"></section>
  <p id="status" class="status" role="status"></p>
</main>
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
.workshop {
  max-width: 44rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.pick {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
select,
button,
input {
  font: inherit;
}
.workspace {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 0.75rem;
  align-items: start;
}
.editor {
  display: grid;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: #94a3b8;
}
textarea {
  width: 100%;
  box-sizing: border-box;
  font: 0.75rem/1.45 Menlo, Consolas, monospace;
  color: #e2e8f0;
  background: #020617;
  border: 1px solid #475569;
  tab-size: 2;
}
.preview {
  position: relative;
  margin: 1.2rem 0 0;
}
#preview {
  display: block;
  width: 100%;
  aspect-ratio: 1;
}
.badge {
  position: absolute;
  inset: auto 0 0 0;
  padding: 0.2rem 0.4rem;
  font-size: 0.75rem;
  color: #0f172a;
  background: #fbbf24;
}
.badge[hidden] {
  display: none;
}
.js-call {
  font-size: 0.8rem;
}
.js-call code {
  font-size: 0.75rem;
  color: #a5f3fc;
}
.report {
  padding: 0.5rem 0.75rem;
  border-left: 4px solid #22c55e;
  background: #1e293b;
  font-size: 0.85rem;
}
.report.has-errors {
  border-left-color: #f87171;
}
.report ol {
  margin: 0.3rem 0 0;
  padding-left: 1.2rem;
}
.report li + li {
  margin-top: 0.5rem;
}
.report pre {
  margin: 0.2rem 0;
  padding: 0.2rem 0.4rem;
  overflow-x: auto;
  font-size: 0.75rem;
  background: #020617;
}
textarea:focus-visible,
select:focus-visible,
button:focus-visible,
input:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}
.status {
  min-height: 1.4em;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.75rem;
}
```

# JavaScript

```javascript
// Errores con nombre: un taller de shaders robusto.
//
// Decisiones de diseño:
// - Toda la ceremonia que puede fallar pasa por GLKit, que convierte los fallos de WebGL en
//   GLKitError con un «kind» ('compile', 'link', 'uniform', 'context') y, en los de compilación,
//   una entrada por mensaje con su línea y el código de esa línea (error.entries). La página
//   los captura TODOS: nada llega a la consola como «Uncaught». Los avisos van con console.warn.
// - La vista previa nunca se queda en negro: un programa nuevo solo sustituye al anterior si
//   compila, enlaza y acepta sus uniforms. Si no, se borra (deleteProgram) y se sigue viendo el
//   último bueno, con un aviso encima. También es el que se recompila si se pierde el contexto.
// - Los uniforms «de serie» se dan solo si el shader los usa (puedes borrar u_color y no pasa
//   nada); los tres ejemplos de JavaScript dan a propósito valores con errores, para ver cómo
//   GLKit los atrapa antes de que WebGL los ignore en silencio (lección «WebGL desde JavaScript»).
// - Mientras escribes, se compila 500 ms después de la última tecla, y se dibuja una vez.
//
// Usa assets/gl/kit.js (léelo con «Assets»).
// Alcance: HTML, CSS, JavaScript, DOM, eventos, formularios y este módulo.
import { createView, createProgram, createQuad, readPixel, GLKitError } from './gl/kit.js';

const VERTEX = `#version 300 es
layout(location = 0) in vec2 a_position; // solo la posición: este vertex shader no tiene «out»
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
// El shader correcto; los errores son variaciones de una o dos líneas
const GOOD = `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform vec3 u_color;
out vec4 outColor;
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float glow = 1.0;
  glow -= distance(uv, vec2(0.5)); // más oscuro hacia los bordes
  outColor = vec4(u_color * glow, 1.0);
}`;
const variant = (line, text) => GOOD.split('\n').map((code, i) => (i + 1 === line ? text : code)).join('\n');
const PRESETS = [
  { label: 'Sin errores', source: GOOD },
  { label: '🐛 1 en lugar de 1.0', source: variant(8, '  float glow = 1; // GLSL no convierte int en float') },
  { label: '🐛 un uniform mal escrito en GLSL', source: variant(7, '  vec2 uv = gl_FragCoord.xy / u_resolucion;') },
  { label: '🐛 falta un punto y coma', source: variant(8, '  float glow = 1.0') },
  { label: '🐛 un vec2 donde va un vec3', source: variant(8, '  vec3 glow = vec2(1.0, 0.8);') },
  { label: '🐛 un in sin su out (enlazado)', source: `#version 300 es
precision highp float;
uniform vec3 u_color;
in vec2 v_uv; // el vertex shader no escribe ningún v_uv
out vec4 outColor;
void main() {
  outColor = vec4(u_color * (1.0 - distance(v_uv, vec2(0.5))), 1.0);
}` },
  { label: '🐛 un uniform mal escrito en JavaScript', source: GOOD, call: 'u_colour', values: (base) => ({ u_resolution: base.u_resolution, u_colour: base.u_color }) },
  { label: '🐛 un vec3 con 4 números', source: GOOD, call: 'u_color: [r, g, b, 1]', values: (base) => ({ ...base, u_color: [...base.u_color, 1] }) },
  { label: '🐛 un uniform que el compilador elimina', source: variant(4, 'uniform vec3 u_color;\nuniform float u_time; // declarado, pero main() no lo usa'), call: 'u_time: 0', values: (base) => ({ ...base, u_time: 0 }) },
  { label: '🐛 pedir WebGL2 a un lienzo que ya es 2D', source: GOOD, context2d: true },
];

// --- Elementos de la página -------------------------------------------------------------------------
const presetSelect = document.querySelector('#preset');
const sourceArea = document.querySelector('#source');
const colorInput = document.querySelector('#color');
const report = document.querySelector('#report');
const badge = document.querySelector('#badge');
const jsCall = document.querySelector('#js-call');
const statusLine = document.querySelector('#status');
const canvas = document.querySelector('#preview');
presetSelect.append(...PRESETS.map(({ label }, i) => new Option(label, i)));

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const baseValues = () => ({ u_resolution: [canvas.width, canvas.height], u_color: hexToRgb(colorInput.value) });
const onlyActive = (program, values) => Object.fromEntries(Object.entries(values).filter(([key]) => program.uniforms.has(key)));
let lastGood = GOOD; // el último fragment shader que compiló, enlazó y aceptó sus uniforms

const view = createView(canvas, {
  setup(gl) {
    return { quad: createQuad(gl), program: createProgram(gl, { name: 'taller', vertex: VERTEX, fragment: lastGood }) };
  },
  render(gl, res) {
    res.program.set(onlyActive(res.program, baseValues())); // valores comprobados: no puede lanzar
    gl.bindVertexArray(res.quad);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  },
  onStatus(status) {
    statusLine.textContent = status === 'lost' ? '⚠️ contexto WebGL perdido' : '✅ contexto recuperado: se recompila el último shader bueno';
  },
});

// --- Compilar, comprobar y, solo si todo va bien, sustituir --------------------------------------------
function attempt(preset, source) {
  if (preset.context2d) { // otro lienzo, con un contexto 2D: WebGL2 ya no es posible en él
    const other = document.createElement('canvas');
    other.getContext('2d');
    createView(other, { setup: () => null, render() {} }); // lanza un GLKitError de tipo 'context'
  }
  const { gl, resources: res } = view;
  const program = createProgram(gl, { name: 'taller', vertex: VERTEX, fragment: source });
  try {
    program.use();
    program.set(preset.values ? preset.values(baseValues()) : onlyActive(program, baseValues()));
  } catch (error) {
    gl.deleteProgram(program.program); // compiló, pero JavaScript le da valores imposibles
    throw error;
  }
  gl.deleteProgram(res.program.program);
  res.program = program;
  lastGood = source;
}
function run(preset, source) {
  if (!view.resources) return;
  const leading = (source.match(/^\s*/)[0].match(/\n/g) ?? []).length; // GLKit hace trim(): líneas que se come
  try {
    attempt(preset, source);
  } catch (error) {
    if (!(error instanceof GLKitError)) throw error; // un fallo de verdad del programa: que se vea
    showErrors(error, leading);
    view.renderNow(); // se dibuja el último bueno
    console.warn(`${preset.label} → ⚠️ ${error.message}`);
    return;
  }
  view.renderNow();
  const centre = readPixel(view.gl, canvas.width / 2, canvas.height / 2).join(', ');
  const active = [...view.resources.program.uniforms.keys()].sort().join(', ');
  showSuccess(active);
  console.log(`${preset.label} → ✅ compilado y enlazado · uniforms activos: ${active} · centro → ${centre}`);
}

function showSuccess(active) {
  report.classList.remove('has-errors');
  report.replaceChildren(Object.assign(document.createElement('p'), { textContent: `✅ Compilado y enlazado. Uniforms activos: ${active}.` }));
  report.firstChild.style.margin = '0';
  badge.hidden = true;
}
const KINDS = { compile: 'Error de compilación', link: 'Error de enlazado', uniform: 'Error en los uniforms (JavaScript)', context: 'Error de contexto' };
function showErrors(error, leading) {
  report.classList.add('has-errors');
  const title = document.createElement('p');
  title.style.margin = '0';
  title.textContent = `❌ ${KINDS[error.kind] ?? 'Error'}. La vista previa sigue con el último shader que compiló.`;
  const list = document.createElement('ol');
  const entries = error.entries.length > 0 ? error.entries : [{ stage: null, line: null, text: error.message, code: '' }];
  for (const { stage, line, text, code } of entries) {
    const item = document.createElement('li');
    if (stage) { // «fragment shader, línea 8: …»; los errores de JavaScript ya traen su texto completo
      const where = document.createElement('strong');
      where.textContent = line === null ? stage.replace('taller · ', '') : `${stage.replace('taller · ', '')}, línea ${line + leading}`;
      item.append(where, ': ');
    }
    item.append(text);
    if (line !== null) {
      const excerpt = document.createElement('pre');
      excerpt.textContent = `${line + leading} │ ${code}`;
      const jump = document.createElement('button');
      jump.type = 'button';
      jump.textContent = `Ir a la línea ${line + leading}`;
      jump.addEventListener('click', () => selectLine(line + leading));
      item.append(excerpt, jump);
    }
    list.append(item);
  }
  report.replaceChildren(title, list);
  badge.hidden = false;
}
function selectLine(lineNumber) { // selecciona la línea en el editor y lo enfoca
  const lines = sourceArea.value.split('\n');
  const start = lines.slice(0, lineNumber - 1).reduce((sum, line) => sum + line.length + 1, 0);
  sourceArea.focus();
  sourceArea.setSelectionRange(start, start + (lines[lineNumber - 1]?.length ?? 0));
}

// --- Eventos -----------------------------------------------------------------------------------------------
const currentPreset = () => PRESETS[Number(presetSelect.value)];
function load() {
  const preset = currentPreset();
  sourceArea.value = preset.source;
  jsCall.textContent = preset.context2d
    ? "otro.getContext('2d'); createView(otro, …)"
    : `program.set({ u_resolution: [ancho, alto], ${preset.call ?? 'u_color: [r, g, b]'} })`;
  run(preset, preset.source);
}
presetSelect.addEventListener('change', load);
let typingTimer = 0;
sourceArea.addEventListener('input', () => {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => run({ ...currentPreset(), label: '✏️ tu versión' }, sourceArea.value), 500);
});
colorInput.addEventListener('input', () => view.invalidate());

load();
console.log('Listo: elige un error en «Ejemplo», o edita el shader; la vista previa nunca se queda en negro');
```
