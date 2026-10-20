---
example_description: "Una textura de 6 × 5 (lados que no son potencia de 2) en WebGL 1 y en WebGL 2, con tres ajustes. Con el filtro por defecto, que pide mipmaps que no existen, sale NEGRA en los dos. Con LINEAR y REPEAT (la repetición por defecto), negra en WebGL 1 y bien en WebGL 2. Con CLAMP_TO_EDGE, bien en los dos. generateMipmap: INVALID_OPERATION en WebGL 1. Una textura incompleta no da error al dibujar: se lee como negro"
example_tags: "javascript|webgl|webgl2|texturas|potencia-de-dos|npot|mipmaps|repeat|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Texturas que no son potencia de 2</h1>
  <figure>
    <canvas id="webgl1" role="img" aria-label="WebGL 1: dos rectángulos negros y uno ámbar"></canvas>
    <figcaption>WebGL 1: por defecto · LINEAR + REPEAT · LINEAR + CLAMP</figcaption>
  </figure>
  <figure>
    <canvas id="webgl2" role="img" aria-label="WebGL 2: un rectángulo negro y dos ámbar"></canvas>
    <figcaption>WebGL 2: por defecto · LINEAR + REPEAT · LINEAR + CLAMP</figcaption>
  </figure>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>

<!-- GLSL ES 1.00: WebGL 1 lo exige y WebGL 2 también lo acepta -->
<script type="x-shader/x-vertex" id="vertex-shader">
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
</script>

<script type="x-shader/x-fragment" id="fragment-shader">
precision mediump float;
uniform sampler2D u_texture;
varying vec2 v_uv;
void main() {
  gl_FragColor = texture2D(u_texture, v_uv);
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
figure {
  margin: 0 0 0.75rem;
  font-size: 0.8rem;
}
canvas {
  display: block;
  width: 240px;
  height: 80px;
  margin-bottom: 0.25rem;
  background: #334155;
}
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
  white-space: pre-wrap;
}
```

# JavaScript

```javascript
// Usa assets/webgl/utils.js (léelo con «Assets»). Funciona con los dos contextos.
import { createProgram, shaderFromScript, readPixel, errorName, fullScreenQuad, releaseOnPageHide } from './webgl/utils.js';

const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// 6 × 5 píxeles ámbar (#f59e0b): ni 6 ni 5 son potencias de 2
const WIDTH = 6;
const HEIGHT = 5;
const bytes = new Uint8Array(WIDTH * HEIGHT * 4);
for (let i = 0; i < bytes.length; i += 4) bytes.set([245, 158, 11, 255], i);

function tryContext(id, contextName) {
  const canvas = document.getElementById(id);
  canvas.width = 240 * devicePixelRatio;
  canvas.height = 80 * devicePixelRatio;
  const gl = canvas.getContext(contextName);
  releaseOnPageHide(gl);
  const program = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('fragment-shader'));
  if (gl.createVertexArray) fullScreenQuad(gl, program); // WebGL 2: con VAO
  else {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());   // WebGL 1: sin VAO
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(gl.getAttribLocation(program, 'a_position'));
    gl.vertexAttribPointer(gl.getAttribLocation(program, 'a_position'), 2, gl.FLOAT, false, 0, 0);
  }
  gl.useProgram(program);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, WIDTH, HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);

  const third = canvas.width / 3; // tres casillas: un ajuste en cada una
  const gap = 4 * devicePixelRatio;
  const results = [];
  const cases = [
    ['filtro por defecto (pide mipmaps)', () => {}], // MIN_FILTER = NEAREST_MIPMAP_LINEAR, WRAP = REPEAT
    ['LINEAR + REPEAT', () => gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)],
    ['LINEAR + CLAMP_TO_EDGE', () => {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }],
  ];
  cases.forEach(([label, adjust], index) => {
    adjust(); // cada caso añade su ajuste a los anteriores
    gl.viewport(index * third + gap, 0, third - 2 * gap, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    results.push(`  ${label} → ${readPixel(gl, Math.floor(index * third + third / 2), Math.floor(canvas.height / 2))}`);
  });
  gl.generateMipmap(gl.TEXTURE_2D);
  results.push(`  generateMipmap → ${errorName(gl, gl.getError())}`);
  log(`${gl.getParameter(gl.VERSION).split(' (')[0]}, textura de ${WIDTH} × ${HEIGHT}:\n${results.join('\n')}`);
}

tryContext('webgl1', 'webgl');
tryContext('webgl2', 'webgl2');
// Una textura «incompleta» no lanza nada: se lee como (0, 0, 0, 1), negro. Chrome avisa en la
// consola de DevTools («texture bound to texture unit 0 is not renderable…»), no en la de LearnWeb.
```
