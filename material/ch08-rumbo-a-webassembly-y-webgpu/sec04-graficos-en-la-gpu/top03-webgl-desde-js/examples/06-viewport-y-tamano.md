---
example_description: "El viewport (la zona del lienzo donde se dibuja) se fija al crear el contexto con el tamaño de entonces, 300 × 150, y no cambia solo: si después el lienzo crece a su tamaño CSS × devicePixelRatio y se olvida gl.viewport, el dibujo ocupa una esquina (izquierda). Un lienzo que se adapta: un ResizeObserver ajusta el mapa de bits, el viewport y redibuja (derecha)"
example_tags: "javascript|webgl2|viewport|devicepixelratio|resizeobserver|canvas|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>¿Dónde se dibuja?</h1>
  <div class="pair">
    <figure>
      <canvas id="forgot" role="img" aria-label="Un cartel de cuatro colores encogido en la esquina de abajo a la izquierda"></canvas>
      <figcaption>🐛 sin gl.viewport</figcaption>
    </figure>
    <figure>
      <canvas id="fitted" role="img" aria-label="Un cartel de cuatro colores que llena el lienzo"></canvas>
      <figcaption>✅ con gl.viewport</figcaption>
    </figure>
  </div>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>

<script type="x-shader/x-vertex" id="vertex-shader">
#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5; // de -1..1 a 0..1
  gl_Position = vec4(a_position, 0.0, 1.0);
}
</script>

<script type="x-shader/x-fragment" id="fragment-shader">
#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
void main() {
  // Un cartel de cuatro cuadrantes; el de arriba a la derecha, ámbar (#f59e0b)
  vec3 top = v_uv.x > 0.5 ? vec3(245.0, 158.0, 11.0) : vec3(225.0, 29.0, 72.0);
  vec3 bottom = v_uv.x > 0.5 ? vec3(79.0, 70.0, 229.0) : vec3(13.0, 148.0, 136.0);
  outColor = vec4((v_uv.y > 0.5 ? top : bottom) / 255.0, 1.0);
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
main {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
figure {
  margin: 0;
  font-size: 0.8rem;
}
canvas {
  display: block;
  width: 100%;
  height: 160px;
  outline: 1px solid #334155;
}
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Usa assets/webgl/utils.js (léelo con «Assets»).
import { createProgram, shaderFromScript, fitCanvas, readPixel, releaseOnPageHide } from './webgl/utils.js';

const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// Prepara un contexto con el cartel y devuelve la función que lo dibuja
function setUp(canvas) {
  const gl = canvas.getContext('webgl2');
  releaseOnPageHide(gl);
  const program = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('fragment-shader'));
  gl.bindVertexArray(gl.createVertexArray());
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.useProgram(program);
  return function draw() {
    gl.clearColor(15 / 255, 23 / 255, 42 / 255, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // un rectángulo de -1 a 1: TODO el viewport
    const viewport = gl.getParameter(gl.VIEWPORT); // [x, y, ancho, alto]
    const same = viewport[2] === canvas.width && viewport[3] === canvas.height;
    return { viewport: viewport.join(', '), same, corner: readPixel(gl, canvas.width - 1, canvas.height - 1) };
  };
}

// 🐛 El contexto se crea con el lienzo de 300 × 150 (el tamaño por defecto de un <canvas>);
//    el viewport toma ese tamaño. Luego el lienzo crece… y el viewport no.
const forgotCanvas = document.querySelector('#forgot');
const drawForgot = setUp(forgotCanvas);
fitCanvas(forgotCanvas); // mapa de bits = CSS × devicePixelRatio
const forgot = drawForgot();
log(`🐛 viewport → ${forgot.viewport} · ¿igual que el lienzo? ${forgot.same}`);
log(`🐛 esquina de arriba a la derecha → ${forgot.corner} (el fondo: ahí no se dibuja)`);

// ✅ Un lienzo que se adapta: en cada cambio de tamaño, mapa de bits, viewport y redibujar
const fittedCanvas = document.querySelector('#fitted');
const drawFitted = setUp(fittedCanvas);
let firstResize = true;
new ResizeObserver(([entry]) => {
  const { inlineSize, blockSize } = entry.contentBoxSize[0];
  fittedCanvas.width = Math.round(inlineSize * devicePixelRatio);
  fittedCanvas.height = Math.round(blockSize * devicePixelRatio);
  const gl = fittedCanvas.getContext('webgl2'); // el mismo contexto de antes
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  const fitted = drawFitted();
  if (firstResize) {
    log(`✅ viewport ajustado en el ResizeObserver · ¿igual que el lienzo? ${fitted.same}`);
    log(`✅ esquina de arriba a la derecha → ${fitted.corner}`);
    firstResize = false;
  }
}).observe(fittedCanvas);
// Cambia el ancho de la vista previa: el lienzo de la derecha se redibuja a su nuevo tamaño.
```
