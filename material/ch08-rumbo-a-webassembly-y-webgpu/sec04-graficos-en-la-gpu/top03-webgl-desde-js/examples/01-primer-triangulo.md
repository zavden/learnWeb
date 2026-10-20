---
example_description: "Un triángulo con WebGL2, todo a mano y en orden: pedir el contexto (y comprobar null), ajustar el tamaño con devicePixelRatio y viewport, compilar y enlazar los shaders, subir los vértices de un Float32Array con bufferData, describirlos con vertexAttribPointer, borrar, dibujar con drawArrays y comprobar el resultado con readPixels"
example_tags: "javascript|webgl2|gpu|shader|bufferdata|drawarrays|readpixels|triangulo"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Un triángulo con WebGL2</h1>
  <canvas id="stage" role="img" aria-label="Un triángulo rojo frambuesa sobre fondo azul noche"></canvas>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>

<!-- Los shaders, como texto: un type que no es JavaScript hace que el navegador no los ejecute -->
<script type="x-shader/x-vertex" id="vertex-shader">
#version 300 es
// Se ejecuta una vez por vértice: aquí solo deja cada vértice donde está
in vec2 a_position; // llega del búfer: el (x, y) de este vértice
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
</script>

<script type="x-shader/x-fragment" id="fragment-shader">
#version 300 es
precision highp float;
out vec4 outColor; // en WebGL2 la salida se declara: no hay gl_FragColor
void main() {
  outColor = vec4(225.0, 29.0, 72.0, 255.0) / 255.0; // #e11d48
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
  width: 240px;
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
const logList = document.querySelector('#log');
function log(label, value) {
  console.log(label, value);
  logList.append(Object.assign(document.createElement('li'), { textContent: `${label} ${value}` }));
}

// 1. El contexto. Un canvas da UN solo tipo de contexto, y null si no puede.
const canvas = document.querySelector('#stage');
const gl = canvas.getContext('webgl2');
if (!gl) throw new Error('Este navegador no tiene WebGL2');
addEventListener('pagehide', () => gl.getExtension('WEBGL_lose_context')?.loseContext());
log('contexto →', gl.getParameter(gl.VERSION));
log('el mismo lienzo como 2d →', canvas.getContext('2d')); // null: ya es un lienzo webgl2

// 2. Tamaño: mapa de bits = CSS × devicePixelRatio, y el viewport (dónde se dibuja) igual
canvas.width = Math.round(canvas.clientWidth * devicePixelRatio);
canvas.height = Math.round(canvas.clientHeight * devicePixelRatio);
gl.viewport(0, 0, canvas.width, canvas.height);

// 3. Compilar los dos shaders y enlazarlos en un programa
function compile(type, id) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, document.getElementById(id).textContent.trim()); // #version: línea 1
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
}
const program = gl.createProgram();
gl.attachShader(program, compile(gl.VERTEX_SHADER, 'vertex-shader'));
gl.attachShader(program, compile(gl.FRAGMENT_SHADER, 'fragment-shader'));
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));

// 4. Los vértices en un Float32Array, copiados a la memoria de la GPU
const vertices = new Float32Array([
  0.0, 0.75,    // arriba
  -0.75, -0.5,  // abajo a la izquierda
  0.75, -0.5,   // abajo a la derecha
]);
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW); // STATIC: se sube una vez, se dibuja mucho
log('búfer →', `${vertices.byteLength} bytes en la GPU`);

// 5. Cómo leer el búfer: a_position toma 2 floats por vértice. El VAO recuerda esta configuración.
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
const positionLocation = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// 6. Dibujar: borrar con el color de fondo y lanzar 3 vértices como un triángulo
gl.clearColor(15 / 255, 23 / 255, 42 / 255, 1); // #0f172a
gl.clear(gl.COLOR_BUFFER_BIT);
gl.useProgram(program);
gl.drawArrays(gl.TRIANGLES, 0, 3);

// 7. Comprobar con readPixels, en la misma tarea que el dibujo. OJO: y = 0 es la fila de ABAJO.
const pixel = new Uint8Array(4);
gl.readPixels(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
log('centro →', pixel.join(', '));
gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
log('esquina de abajo a la izquierda →', pixel.join(', '));
```
