// Ayudantes de WebGL2 para los ejemplos de la lección «Texturas y framebuffers».
// Los de compilar, leer píxeles y liberar el contexto son los de «WebGL desde JavaScript»;
// fullScreenQuad, textureFromBytes y loadImage son nuevos.

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

// El color del píxel (x, y) del framebuffer enlazado, como texto «r, g, b, a». y = 0: ABAJO.
export function readPixel(gl, x, y) {
  const pixel = new Uint8Array(4);
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  return pixel.join(', ');
}

// El nombre de una constante de WebGL a partir de su valor (códigos de error, estados…)
export function glName(gl, value, candidates) {
  return candidates.find((name) => gl[name] === value) ?? String(value);
}

// El nombre de un código de gl.getError()
export function errorName(gl, code) {
  return glName(gl, code, ['NO_ERROR', 'INVALID_ENUM', 'INVALID_VALUE', 'INVALID_OPERATION',
    'INVALID_FRAMEBUFFER_OPERATION', 'OUT_OF_MEMORY', 'CONTEXT_LOST_WEBGL']);
}

// Un rectángulo que cubre el viewport (4 vértices en tira) para el atributo a_position
export function fullScreenQuad(gl, program) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const location = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
  return vao; // dibújalo con gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}

// Una textura RGBA a partir de bytes (un Uint8Array de ancho × alto × 4), sin mipmaps
export function textureFromBytes(gl, width, height, bytes, filter = gl.NEAREST) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}

// Carga una imagen de assets/ lista para subirla a la GPU. crossOrigin ANTES de src: en las
// tarjetas (origen null) toda imagen es de otro origen, y sin CORS texImage2D la rechaza.
export async function loadImage(url) {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.src = url;
  await image.decode();
  return image;
}

// Los navegadores limitan cuántos contextos WebGL hay a la vez: libera el tuyo al salir
export function releaseOnPageHide(gl) {
  addEventListener('pagehide', () => gl.getExtension('WEBGL_lose_context')?.loseContext());
}
