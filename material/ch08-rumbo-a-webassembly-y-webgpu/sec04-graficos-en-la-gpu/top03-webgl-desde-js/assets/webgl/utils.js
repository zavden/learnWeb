// Ayudantes de WebGL2 para los ejemplos de la lección «WebGL desde JavaScript».
// El ejemplo 01 hace todo esto a mano, paso a paso; los demás importan estas funciones
// para quedarse con su idea:  import { createProgram } from './webgl/utils.js';

// Compila un shader. Si falla, lanza un Error con el registro del compilador.
export function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader).trim();
    gl.deleteShader(shader);
    throw new Error(log);
  }
  return shader;
}

// Compila los dos shaders y los enlaza en un programa. Si algo falla, lanza un Error.
export function createProgram(gl, vertexSource, fragmentSource) {
  const program = gl.createProgram();
  gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program).trim();
    gl.deleteProgram(program);
    throw new Error(log);
  }
  return program;
}

// El código fuente de un <script type="x-shader/…">. trim(): #version debe ir en la línea 1.
export function shaderFromScript(id) {
  return document.getElementById(id).textContent.trim();
}

// Mapa de bits = tamaño CSS × devicePixelRatio (lección «Canvas 2D»). Devuelve [ancho, alto].
export function fitCanvas(canvas) {
  canvas.width = Math.round(canvas.clientWidth * devicePixelRatio);
  canvas.height = Math.round(canvas.clientHeight * devicePixelRatio);
  return [canvas.width, canvas.height];
}

// El color del píxel (x, y) del dibujo, como texto «r, g, b, a». OJO: y = 0 es la fila de ABAJO.
export function readPixel(gl, x, y) {
  const pixel = new Uint8Array(4);
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  return pixel.join(', ');
}

// El nombre de un código de gl.getError()
export function errorName(gl, code) {
  const names = ['NO_ERROR', 'INVALID_ENUM', 'INVALID_VALUE', 'INVALID_OPERATION',
    'INVALID_FRAMEBUFFER_OPERATION', 'OUT_OF_MEMORY', 'CONTEXT_LOST_WEBGL'];
  return names.find((name) => gl[name] === code) ?? `error ${code}`;
}

// Los navegadores limitan cuántos contextos WebGL hay a la vez: libera el tuyo al salir
export function releaseOnPageHide(gl) {
  addEventListener('pagehide', () => gl.getExtension('WEBGL_lose_context')?.loseContext());
}
