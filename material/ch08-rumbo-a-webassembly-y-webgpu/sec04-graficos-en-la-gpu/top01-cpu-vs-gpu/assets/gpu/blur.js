// Un desenfoque de caja hecho en la GPU con WebGL2. Lo usan los ejemplos 01 y 09 de la
// lección «CPU y GPU». Cada paso se explica en las lecciones «WebGL desde JavaScript» y
// «Texturas y framebuffers»; de momento basta con la idea:
//   1. subir los píxeles a la memoria de la GPU como una TEXTURA,
//   2. dibujar un rectángulo que cubre el lienzo: el fragment shader se ejecuta UNA VEZ POR
//      PÍXEL, todos a la vez, y cada ejecución calcula la media de sus vecinos,
//   3. leer el resultado con readPixels.

const VERTEX_SOURCE = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

// El cuerpo del bucle de la CPU, para UN píxel: la media de los vecinos de un cuadrado.
const FRAGMENT_SOURCE = `#version 300 es
precision highp float;
uniform sampler2D u_image;  // los píxeles originales
uniform vec2 u_size;        // ancho y alto de la imagen, en píxeles
uniform int u_radius;       // 4 → un cuadrado de 9 × 9 vecinos
out vec4 outColor;

void main() {
  vec3 sum = vec3(0.0);
  for (int dy = -u_radius; dy <= u_radius; dy++) {
    for (int dx = -u_radius; dx <= u_radius; dx++) {
      sum += texture(u_image, (gl_FragCoord.xy + vec2(dx, dy)) / u_size).rgb;
    }
  }
  float side = float(2 * u_radius + 1);
  outColor = vec4(sum / (side * side), 1.0);
}`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader).trim());
  }
  return shader;
}

export function createGpuBlur(width, height) {
  const canvas = document.createElement('canvas'); // no se añade a la página: solo calcula
  canvas.width = width;
  canvas.height = height;
  const gl = canvas.getContext('webgl2', { antialias: false });
  if (!gl) throw new Error('Este navegador no tiene WebGL2');

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SOURCE));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SOURCE));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program).trim());
  }
  gl.useProgram(program);

  // Dos triángulos que cubren todo el lienzo (de -1 a 1 en x y en y)
  gl.bindVertexArray(gl.createVertexArray());
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  // La imagen, como textura: cada píxel se lee tal cual (NEAREST) y fuera de los bordes
  // se repite el píxel del borde (CLAMP_TO_EDGE), como hacía el bucle de la CPU
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform2f(gl.getUniformLocation(program, 'u_size'), width, height);
  const radiusLocation = gl.getUniformLocation(program, 'u_radius');
  gl.viewport(0, 0, width, height);

  const blur = {
    // Copia los bytes RGBA (los de un ImageData, fila a fila) a la memoria de la GPU
    upload(pixels) {
      const bytes = new Uint8Array(pixels.buffer, pixels.byteOffset, pixels.byteLength);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
    },
    // ENCARGA el dibujo: la llamada vuelve enseguida y la GPU trabaja después, a su ritmo
    draw(radius) {
      gl.uniform1i(radiusLocation, radius);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    },
    // Lee todos los píxeles (en el orden de un ImageData): tiene que ESPERAR a la GPU
    read() {
      const out = new Uint8Array(width * height * 4);
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, out);
      return out;
    },
    // Lee un solo píxel: casi no copia nada, pero también obliga a esperar a que acabe todo
    waitForGpu() {
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    },
    // El primer dibujo de un programa incluye trabajo extra del driver: mejor fuera del cronómetro
    warmUp() {
      gl.viewport(0, 0, 1, 1);
      blur.draw(1);
      blur.waitForGpu();
      gl.viewport(0, 0, width, height);
    },
    // Los navegadores limitan cuántos contextos WebGL hay a la vez: libéralo al salir
    release() {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
  return blur;
}
