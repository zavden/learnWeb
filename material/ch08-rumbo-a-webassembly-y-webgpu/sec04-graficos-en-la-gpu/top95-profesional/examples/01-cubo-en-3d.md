---
example_description: "Una escena 3D completa con WebGL2 y matrices de 4 × 4 escritas desde cero (perspectiva, cámara con lookAt, giros): un cubo con seis caras de colores, iluminado por una luz direccional. Prueba de profundidad y descarte de caras traseras con casillas para ver qué pasa sin ellas; se gira arrastrando o con las flechas, y gira solo 10 s con un botón (nunca con «reducir movimiento»). readPixels comprueba el color del centro contra el mismo cálculo hecho en JavaScript"
example_tags: "javascript|webgl2|3d|mat4|perspectiva|lookat|depth-test|cull-face|iluminacion|profesional"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<main class="scene">
  <h1>Un cubo en 3D</h1>
  <canvas id="cube" tabindex="0" role="img" aria-label="Un cubo de seis colores en perspectiva" aria-describedby="faces"></canvas>
  <p id="faces" class="faces" aria-live="polite"></p>
  <div class="controls">
    <button id="spin" type="button" aria-pressed="false">↻ Girar solo (10 s)</button>
    <label><input id="depth" type="checkbox" checked> Prueba de profundidad (<code>DEPTH_TEST</code>)</label>
    <label><input id="cull" type="checkbox" checked> Descartar caras traseras (<code>CULL_FACE</code>)</label>
  </div>
  <p class="help">Arrastra el cubo, o entra con Tab y usa las flechas (15° por pulsación).</p>
  <p id="status" class="status" role="status"></p>
</main>

<script type="x-shader/x-vertex" id="vertex-shader">
#version 300 es
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;  // hacia dónde mira la cara
layout(location = 2) in vec3 a_color;
uniform mat4 u_projection; // cámara → pantalla (perspectiva)
uniform mat4 u_view;       // mundo → cámara (lookAt)
uniform mat4 u_model;      // cubo → mundo (giros)
out vec3 v_normal;
out vec3 v_color;
void main() {
  v_normal = mat3(u_model) * a_normal; // el modelo solo gira: su parte 3 × 3 gira las normales
  v_color = a_color;
  gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);
}
</script>

<script type="x-shader/x-fragment" id="fragment-shader">
#version 300 es
precision highp float;
uniform vec3 u_light; // hacia dónde está la luz (en el mundo)
in vec3 v_normal;
in vec3 v_color;
out vec4 outColor;
void main() {
  // Lambert: una cara recibe más luz cuanto más de frente la mira; 0.3 de luz ambiente
  float diffuse = max(dot(normalize(v_normal), normalize(u_light)), 0.0);
  outColor = vec4(v_color * (0.3 + 0.7 * diffuse), 1.0);
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
.scene {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
#cube {
  display: block;
  width: 100%;
  max-width: 360px;
  aspect-ratio: 3 / 2;
  background: #020617;
  touch-action: none; /* arrastrar con el dedo gira el cubo, no desplaza la página */
  cursor: grab;
}
#cube:focus-visible,
button:focus-visible,
input:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}
.faces {
  min-height: 1.4em;
  margin: 0.5rem 0;
  font-size: 0.9rem;
}
.controls {
  display: grid;
  gap: 0.4rem;
  justify-items: start;
}
button {
  font: inherit;
  padding: 0.3rem 0.8rem;
}
.help {
  font-size: 0.85rem;
  color: #94a3b8;
}
.status {
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Una escena 3D mínima, completa y robusta.
//
// Decisiones de diseño:
// - Las matrices de 4 × 4 están escritas desde cero en assets/gl/mat4.js (por columnas, como
//   uniformMatrix4fv y matrix3d() de CSS): perspective, lookAt, rotationX/Y y compose.
// - Cada cara tiene sus 4 vértices (posición, normal y color intercalados: 9 floats) porque
//   una arista separa dos normales distintas; 24 vértices, 36 índices Uint16 y un drawElements.
// - DEPTH_TEST (lo cercano tapa lo lejano) y CULL_FACE (no dibujar las caras que dan la espalda)
//   se pueden desactivar con las casillas: con un cubo, que es convexo, basta con UNA de las
//   dos; sin ninguna, la cara de detrás (dibujada después) tapa a la de delante.
// - La comprobación: el color del centro, leído con readPixels, contra el mismo cálculo de luz
//   hecho en JavaScript con las mismas matrices.
// - Se dibuja al cargar, al cambiar de tamaño y al girar (como mucho una vez por fotograma);
//   el giro automático empieza con el botón, dura 10 s y se para al ocultar la página.
// - GLKit (assets/gl/kit.js) lleva el tamaño con devicePixelRatio, la pérdida del contexto y
//   su liberación al salir.
//
// Alcance: HTML, CSS, JavaScript, DOM, eventos de puntero y teclado, y este módulo.
import { createView, createProgram, createAnimation, readPixel } from './gl/kit.js';
import * as mat4 from './gl/mat4.js';

const FACES = [
  // nombre, color, normal, y las 4 esquinas en sentido antihorario visto desde fuera
  { name: 'delante', color: [225, 29, 72], normal: [0, 0, 1], corners: [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]] },
  { name: 'detrás', color: [124, 58, 237], normal: [0, 0, -1], corners: [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]] },
  { name: 'derecha', color: [245, 158, 11], normal: [1, 0, 0], corners: [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]] },
  { name: 'izquierda', color: [13, 148, 136], normal: [-1, 0, 0], corners: [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]] },
  { name: 'arriba', color: [254, 243, 199], normal: [0, 1, 0], corners: [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]] },
  { name: 'abajo', color: [71, 85, 105], normal: [0, -1, 0], corners: [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]] },
];
const COLOR_NAMES = { delante: 'rosa', detrás: 'violeta', derecha: 'ámbar', izquierda: 'turquesa', arriba: 'crema', abajo: 'pizarra' };
const LIGHT = [0.2, 0.6, 1.0];
const EYE = [0, 0, 4.2];

const vertices = new Float32Array(FACES.flatMap((face) => face.corners.flatMap((corner) => [
  ...corner, ...face.normal, ...face.color.map((c) => c / 255),
])));
const indices = new Uint16Array(FACES.flatMap((_, f) => [0, 1, 2, 0, 2, 3].map((i) => f * 4 + i)));

const state = { rotX: 25, rotY: -35 }; // grados
const statusLine = document.querySelector('#status');
function say(text) {
  statusLine.textContent = text;
  console.log(text);
}

const modelMatrix = () => mat4.compose(mat4.rotationX((state.rotX * Math.PI) / 180), mat4.rotationY((state.rotY * Math.PI) / 180));

// El mismo cálculo de luz que el fragment shader, en JavaScript, para comprobar el resultado
function shade(face) {
  const [nx, ny, nz] = mat4.transformPoint(modelMatrix(), face.normal); // sin traslación: solo gira
  const length = Math.hypot(...LIGHT);
  const diffuse = Math.max(0, (nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]) / length);
  return { color: face.color.map((c) => Math.round(c * (0.3 + 0.7 * diffuse))), facing: nz };
}

const canvas = document.querySelector('#cube');
const depthBox = document.querySelector('#depth');
const cullBox = document.querySelector('#cull');
const view = createView(canvas, {
  setup(gl) {
    const program = createProgram(gl, {
      name: 'cubo',
      vertex: document.querySelector('#vertex-shader').textContent,
      fragment: document.querySelector('#fragment-shader').textContent,
    });
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const STRIDE = 9 * 4;
    [[0, 3, 0], [1, 3, 12], [2, 3, 24]].forEach(([location, size, offset]) => {
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, STRIDE, offset);
    });
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    program.set({ u_light: LIGHT, u_view: mat4.lookAt(EYE, [0, 0, 0]) });
    return { program, vao };
  },
  render(gl, { program, vao }) {
    gl.enable(gl.DEPTH_TEST);
    if (!depthBox.checked) gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE); // por defecto descarta las caras en sentido horario (CW): las de atrás
    if (!cullBox.checked) gl.disable(gl.CULL_FACE);
    gl.clearColor(2 / 255, 6 / 255, 23 / 255, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    program.set({
      u_projection: mat4.perspective(Math.PI / 4, canvas.width / canvas.height, 0.1, 100),
      u_model: modelMatrix(),
    });
    gl.bindVertexArray(vao);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  },
  onStatus(status) {
    say(status === 'lost' ? '⚠️ contexto WebGL perdido: se dibujará en cuanto vuelva' : '✅ contexto recuperado: recursos creados de nuevo');
  },
});

// Dibuja ya y lee el centro: ¿qué cara se ve ahí, y coincide con el cálculo?
function report() {
  view.renderNow();
  const centre = readPixel(view.gl, canvas.width / 2, canvas.height / 2).slice(0, 3);
  const shaded = FACES.map((face) => ({ face, ...shade(face) }));
  const match = shaded.find(({ color }) => color.every((c, i) => Math.abs(c - centre[i]) <= 1));
  const front = shaded.filter(({ facing }) => facing > 0).sort((a, b) => b.facing - a.facing);
  document.querySelector('#faces').textContent = `Se ven las caras: ${front.map(({ face }) => `${face.name} (${COLOR_NAMES[face.name]})`).join(', ')}.`;
  const expected = front[0].color.join(', ');
  const check = depthBox.checked || cullBox.checked ? ` · calculado: ${expected} ${centre.join(', ') === expected ? '✅' : '❌'}` : '';
  return `X ${state.rotX}° · Y ${state.rotY}° · centro → ${centre.join(', ')} (cara: ${match ? match.face.name : '?'}${check})`;
}

const wrapDegrees = (degrees) => ((((degrees + 180) % 360) + 360) % 360) - 180; // entre -180 y 180
function rotate(dx, dy) {
  state.rotY = wrapDegrees(state.rotY + dx);
  state.rotX = Math.max(-85, Math.min(85, state.rotX + dy));
}

// --- Arrastrar, teclado, casillas, giro automático ---------------------------------------
let dragStart = null;
canvas.addEventListener('pointerdown', (event) => {
  canvas.setPointerCapture(event.pointerId);
  dragStart = { x: event.clientX, y: event.clientY, rotX: state.rotX, rotY: state.rotY };
});
canvas.addEventListener('pointermove', (event) => {
  if (!dragStart) return;
  state.rotX = dragStart.rotX;
  state.rotY = dragStart.rotY;
  rotate(Math.round((event.clientX - dragStart.x) * 0.5), Math.round((event.clientY - dragStart.y) * 0.5));
  view.invalidate();
});
canvas.addEventListener('pointerup', () => {
  if (!dragStart) return;
  dragStart = null;
  say(report());
});
canvas.addEventListener('keydown', (event) => {
  const moves = { ArrowLeft: [-15, 0], ArrowRight: [15, 0], ArrowUp: [0, -15], ArrowDown: [0, 15] };
  if (!moves[event.key]) return;
  event.preventDefault();
  rotate(...moves[event.key]);
  say(report());
});
for (const box of [depthBox, cullBox]) box.addEventListener('change', () => say(report()));

const spinButton = document.querySelector('#spin');
const spin = createAnimation({
  frame(seconds) {
    if (seconds > 10) return false;
    state.rotY = wrapDegrees(Math.round(spinStart + seconds * 36)); // 36° por segundo: una vuelta en 10 s
    view.renderNow();
    return true;
  },
  onStop(reason) {
    spinButton.setAttribute('aria-pressed', 'false');
    say(`⏹ giro ${reason === 'done' ? 'terminado' : reason === 'hidden' ? 'parado: página oculta' : 'parado'} · ${report()}`);
  },
});
let spinStart = 0;
spinButton.addEventListener('click', () => {
  if (spin.running) return spin.stop();
  spinStart = state.rotY;
  const result = spin.start();
  if (result === 'reduced') return say('movimiento reducido: el cubo no gira solo; usa las flechas');
  spinButton.setAttribute('aria-pressed', 'true');
  say('↻ girando durante 10 s (pulsa otra vez para parar)');
});

say(`cubo → ${vertices.length / 9} vértices × 36 bytes + ${indices.length} índices × 2 bytes · 1 drawElements`);
say(report());
say('Listo: arrastra el cubo o usa las flechas; «Girar solo» lo hace girar 10 s');
```
