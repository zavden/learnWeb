// Una «sonda» de la GPU: un lienzo de 1 × 1 píxel con WebGL 1, que habla el mismo GLSL que
// los ejemplos de shader de LearnWeb. run() ejecuta un fragment shader en ese único píxel y
// devuelve su color [r, g, b, a] (de 0 a 255) leído con readPixels. Lo usa el ejemplo 08 de
// la lección «CPU y GPU»; cómo funciona cada paso se explica en «WebGL desde JavaScript».

const VERTEX_SOURCE = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
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

export function createProbe() {
  const canvas = document.createElement('canvas'); // fuera de la página: 1 × 1 píxel
  canvas.width = 1;
  canvas.height = 1;
  const gl = canvas.getContext('webgl', { antialias: false });
  if (!gl) throw new Error('Este navegador no tiene WebGL');

  // Un triángulo grande que cubre el único píxel del lienzo
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const vertexShader = compile(gl, gl.VERTEX_SHADER, VERTEX_SOURCE);
  const kinds = { highp: gl.HIGH_FLOAT, mediump: gl.MEDIUM_FLOAT, lowp: gl.LOW_FLOAT };

  return {
    // { rangeMin, rangeMax, precision } de los float de esa precisión en los fragment shaders
    precision(name) {
      return gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, kinds[name]);
    },
    // Ejecuta el fragment shader con esos uniforms float y devuelve el color del píxel
    run(fragmentSource, uniforms = {}) {
      const fragmentShader = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      gl.useProgram(program);
      const position = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      for (const [name, value] of Object.entries(uniforms)) {
        gl.uniform1f(gl.getUniformLocation(program, name), value); // el número viaja como float32
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      const pixel = new Uint8Array(4);
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
      gl.deleteProgram(program);
      gl.deleteShader(fragmentShader);
      return Array.from(pixel);
    },
    release() {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
