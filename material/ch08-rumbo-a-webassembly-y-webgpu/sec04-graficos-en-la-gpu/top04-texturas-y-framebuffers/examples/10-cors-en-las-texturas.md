---
example_description: "WebGL no deja subir a la GPU una imagen de otro origen pedida sin CORS: texImage2D lanza un SecurityError (el canvas 2D solo se «contaminaba»; WebGL ni siquiera la acepta). Con img.crossOrigin = 'anonymous' antes de src y un servidor que responda con CORS, se puede. En las tarjetas (origen null) toda imagen es de otro origen, también las de assets/"
example_tags: "javascript|webgl2|texturas|cors|crossorigin|securityerror|teximage2d|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>¿Puedo subir esta imagen?</h1>
  <canvas id="stage" role="img" aria-label="Un paisaje pixelado con casa y sol, si la imagen se pudo subir"></canvas>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>

<script type="x-shader/x-vertex" id="vertex-shader">
#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
</script>

<script type="x-shader/x-fragment" id="fragment-shader">
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
  height: 120px;
  outline: 1px solid #334155;
}
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
  overflow-wrap: anywhere;
}
```

# JavaScript

```javascript
// Usa assets/webgl/utils.js y assets/scene.png (léelos con «Assets»).
import { createProgram, shaderFromScript, fullScreenQuad, releaseOnPageHide } from './webgl/utils.js';

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
gl.viewport(0, 0, canvas.width, canvas.height);
const program = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('fragment-shader'));
fullScreenQuad(gl, program);
gl.useProgram(program);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

async function tryUpload(label, url, useCors) {
  const image = new Image();
  if (useCors) image.crossOrigin = 'anonymous'; // ANTES de src: se pide con CORS
  image.src = url;
  await image.decode(); // en los dos casos la imagen carga, y se podría MOSTRAR en un <img>
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  try {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    log(`${label} → textura de ${image.naturalWidth} × ${image.naturalHeight} subida`);
  } catch (error) {
    log(`${label} → ${error.name}: ${error.message}`);
  }
}

const assetUrl = new URL('scene.png', document.baseURI);
const withCorsQuery = (url) => Object.assign(new URL(url), { search: '?cors' }); // otra URL: sin caché
if (location.origin === 'null') {
  // Tarjeta aislada (origen null): para ella, TODO es otro origen, también la carpeta assets/
  log('página: origen null (tarjeta aislada) · scene.png es de otro origen');
  await tryUpload('🐛 sin crossOrigin', assetUrl, false);
  await tryUpload('✅ crossOrigin = anonymous', withCorsQuery(assetUrl), true);
} else {
  const otherUrl = new URL(assetUrl);
  otherUrl.hostname = location.hostname === 'localhost' ? '127.0.0.1' : 'localhost'; // otro origen
  log(`página: ${location.origin} · otro origen: ${otherUrl.origin}`);
  await tryUpload('mismo origen, sin crossOrigin', assetUrl, false);
  await tryUpload('🐛 otro origen, sin crossOrigin', otherUrl, false);
  await tryUpload('✅ otro origen, crossOrigin = anonymous', withCorsQuery(otherUrl), true);
}
// El canvas 2D deja DIBUJAR la imagen y prohíbe después leer sus píxeles (lección «Píxeles»);
// WebGL la rechaza ya al subirla, porque un shader podría leerla de mil maneras.
```
