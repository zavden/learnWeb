---
example_description: "Dibujar en una textura en lugar de en el lienzo: un framebuffer con una textura de 32 × 32 enganchada como destino (checkFramebufferStatus comprueba que está completo). Primera pasada: un sol en esa textura pequeña; segunda: la textura, ampliada con NEAREST, en el lienzo, para un efecto retro. Una textura no puede ser destino y fuente en el mismo dibujo"
example_tags: "javascript|webgl2|framebuffer|render-to-texture|checkframebufferstatus|pixel-art|pasadas"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Dibujar en una textura</h1>
  <canvas id="stage" role="img" aria-label="Un sol ámbar pixelado sobre un cielo de 32 por 32 píxeles, ampliado"></canvas>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>

<script type="x-shader/x-vertex" id="vertex-shader">
#version 300 es
layout(location = 0) in vec2 a_position; // la misma location en los dos programas
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
</script>

<!-- 1.ª pasada: la escena, en píxeles del destino (un círculo con SDF, lección 2) -->
<script type="x-shader/x-fragment" id="scene-shader">
#version 300 es
precision highp float;
uniform vec2 u_size;
out vec4 outColor;
void main() {
  vec2 p = gl_FragCoord.xy;
  float d = distance(p, u_size * 0.5) - u_size.y * 0.3;
  float inside = 1.0 - smoothstep(-0.5, 0.5, d);
  vec3 sky = mix(vec3(0.06, 0.09, 0.16), vec3(0.19, 0.11, 0.42), p.y / u_size.y);
  outColor = vec4(mix(sky, vec3(245.0, 158.0, 11.0) / 255.0, inside), 1.0);
}
</script>

<!-- 2.ª pasada: copiar una textura al lienzo -->
<script type="x-shader/x-fragment" id="show-shader">
#version 300 es
precision highp float;
uniform sampler2D u_texture;
in vec2 v_uv;
out vec4 outColor;
void main() {
  outColor = texture(u_texture, v_uv);
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
canvas {
  display: block;
  width: 160px;
  height: 160px;
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
import { createProgram, shaderFromScript, readPixel, glName, errorName, fullScreenQuad, textureFromBytes, releaseOnPageHide } from './webgl/utils.js';

const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const canvas = document.querySelector('#stage');
const gl = canvas.getContext('webgl2');
releaseOnPageHide(gl);
canvas.width = Math.round(canvas.clientWidth * devicePixelRatio);
canvas.height = Math.round(canvas.clientHeight * devicePixelRatio);
const sceneProgram = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('scene-shader'));
const showProgram = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('show-shader'));
fullScreenQuad(gl, sceneProgram); // vale para los dos: a_position está en la location 0

// El destino: una textura vacía (data = null) de 32 × 32, enganchada a un framebuffer
const SIZE = 32;
const target = textureFromBytes(gl, SIZE, SIZE, null); // NEAREST: al ampliarla, píxeles nítidos
const framebuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer); // a partir de aquí, se dibuja en la textura
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target, 0);
const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
log(`framebuffer → ${glName(gl, status, ['FRAMEBUFFER_COMPLETE', 'FRAMEBUFFER_INCOMPLETE_ATTACHMENT',
  'FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT', 'FRAMEBUFFER_INCOMPLETE_DIMENSIONS', 'FRAMEBUFFER_UNSUPPORTED'])}`);

// 1.ª pasada: la escena, en la textura (el viewport, del tamaño del DESTINO)
gl.viewport(0, 0, SIZE, SIZE);
gl.useProgram(sceneProgram);
gl.uniform2f(gl.getUniformLocation(sceneProgram, 'u_size'), SIZE, SIZE);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
log(`1.ª pasada, en la textura de ${SIZE} × ${SIZE} → centro: ${readPixel(gl, SIZE / 2, SIZE / 2)}`);

// 🐛 Leer de la textura en la que se está dibujando: un «bucle de realimentación», prohibido
gl.useProgram(showProgram);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // target sigue enlazada en la unidad 0
log(`dibujar con la misma textura como fuente → ${errorName(gl, gl.getError())}`);

// 2.ª pasada: de vuelta al lienzo (null) y la textura como fuente, ampliada
gl.bindFramebuffer(gl.FRAMEBUFFER, null);
gl.viewport(0, 0, canvas.width, canvas.height);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
log(`2.ª pasada, en el lienzo → centro: ${readPixel(gl, canvas.width / 2, canvas.height / 2)}`);
// Para encadenar muchas pasadas (desenfocar 10 veces), se alternan DOS texturas: se lee de
// una y se escribe en la otra, y se cambian los papeles en cada pasada («ping-pong»).
```
