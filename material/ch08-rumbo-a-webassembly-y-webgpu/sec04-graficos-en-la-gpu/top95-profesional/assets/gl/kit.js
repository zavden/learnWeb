// GLKit: una biblioteca mínima de WebGL2 para los ejemplos profesionales del módulo
// «Gráficos en la GPU». No esconde WebGL: le quita la ceremonia repetida y convierte sus
// fallos silenciosos en errores con nombre. Cada función se apoya en una lección:
//
//   createView     lienzo nítido (devicePixelRatio + ResizeObserver), viewport, pérdida y
//                  recuperación del contexto, liberarlo al salir     → «WebGL desde JavaScript»
//   createProgram  compila y enlaza; errores con la línea del shader y su texto;
//                  uniforms con nombre y tipo comprobados           → «WebGL desde JavaScript»
//   createQuad     el rectángulo que cubre el viewport (location 0)
//   createTexture  imágenes, bytes o datos float, con sus ajustes   → «Texturas y framebuffers»
//   createTarget   una textura enganchada a un framebuffer          → «Texturas y framebuffers»
//   loadImage      imágenes con crossOrigin, siempre                → «Texturas y framebuffers»
//   readPixel      el color de un píxel, como [r, g, b, a]
//   createAnimation un bucle con botón: finito o con pausa, que se para al ocultar la página
//                  y respeta «reducir movimiento»                   → «El bucle de animación»
//
// Convención: en los vertex shaders, la posición es `layout(location = 0) in vec2 a_position`.

export class GLKitError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GLKitError';
  }
}

// ── La vista: lienzo, tamaño y ciclo de vida del contexto ──────────────────────────────────
// setup(gl) crea TODOS los recursos (programas, búferes, texturas) y los devuelve; se vuelve a
// llamar si el navegador recupera un contexto perdido, porque entonces no queda ninguno.
// render(gl, resources, view) dibuja. Nunca hay un bucle: se dibuja al cargar, al cambiar de
// tamaño y cuando el ejemplo lo pide con view.invalidate() (un dibujo por fotograma, como mucho).
export function createView(canvas, { attributes = {}, setup, render, onStatus = () => {} }) {
  const gl = canvas.getContext('webgl2', attributes);
  if (!gl) throw new GLKitError('Este navegador no puede crear un contexto WebGL2 en este lienzo.');
  let resources = null;
  let pendingFrame = 0;
  const loseExtension = gl.getExtension('WEBGL_lose_context');

  const view = {
    gl,
    canvas,
    get resources() {
      return resources;
    },
    get lost() {
      return gl.isContextLost();
    },
    // Dibuja YA, en esta tarea: justo después se puede leer con readPixels
    renderNow() {
      if (gl.isContextLost() || !resources) return false;
      render(gl, resources, view);
      return true;
    },
    // Pide un dibujo para el próximo fotograma; varios pedidos seguidos, un solo dibujo
    invalidate() {
      if (pendingFrame || gl.isContextLost()) return;
      pendingFrame = requestAnimationFrame(() => {
        pendingFrame = 0;
        view.renderNow();
      });
    },
    // Para probar el código de recuperación: pierde el contexto y lo recupera al cabo de un rato
    simulateContextLoss(restoreAfterMs = 800) {
      if (!loseExtension) return false;
      loseExtension.loseContext();
      setTimeout(() => loseExtension.restoreContext(), restoreAfterMs);
      return true;
    },
  };

  function applySize(width, height) {
    canvas.width = Math.max(1, width);
    canvas.height = Math.max(1, height);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  // Tamaño inicial ya, para poder dibujar al cargar; después, el ResizeObserver lo mantiene
  applySize(Math.round(canvas.clientWidth * devicePixelRatio), Math.round(canvas.clientHeight * devicePixelRatio));
  const observer = new ResizeObserver(([entry]) => {
    // devicePixelContentBoxSize: los píxeles físicos exactos (Chrome); si no, CSS × devicePixelRatio
    const exact = entry.devicePixelContentBoxSize?.[0];
    const width = exact ? exact.inlineSize : Math.round(entry.contentBoxSize[0].inlineSize * devicePixelRatio);
    const height = exact ? exact.blockSize : Math.round(entry.contentBoxSize[0].blockSize * devicePixelRatio);
    if (width === canvas.width && height === canvas.height) return;
    applySize(width, height);
    view.renderNow();
  });
  try {
    observer.observe(canvas, { box: 'device-pixel-content-box' });
  } catch {
    observer.observe(canvas);
  }

  // El navegador puede quitarnos el contexto (demasiados contextos, la GPU se reinicia, el
  // portátil se duerme). preventDefault() dice «quiero que me lo devuelvas».
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    cancelAnimationFrame(pendingFrame);
    pendingFrame = 0;
    resources = null; // los objetos de WebGL del contexto perdido ya no sirven
    onStatus('lost');
  });
  canvas.addEventListener('webglcontextrestored', () => {
    resources = setup(gl); // todo de nuevo: programas, búferes, texturas
    applySize(canvas.width, canvas.height);
    onStatus('restored');
    view.renderNow();
  });
  // Liberar el contexto al salir (Chrome mantiene unos 16 a la vez) y recuperarlo si la página
  // vuelve de la caché de «atrás/adelante»
  addEventListener('pagehide', () => loseExtension?.loseContext());
  addEventListener('pageshow', (event) => {
    if (event.persisted && gl.isContextLost()) loseExtension?.restoreContext();
  });

  resources = setup(gl);
  return view;
}

// ── Programas ───────────────────────────────────────────────────────────────────────────
const SETTERS = {
  FLOAT: (gl, l, v) => gl.uniform1fv(l, Array.isArray(v) || ArrayBuffer.isView(v) ? v : [v]),
  FLOAT_VEC2: (gl, l, v) => gl.uniform2fv(l, v),
  FLOAT_VEC3: (gl, l, v) => gl.uniform3fv(l, v),
  FLOAT_VEC4: (gl, l, v) => gl.uniform4fv(l, v),
  INT: (gl, l, v) => gl.uniform1i(l, v),
  BOOL: (gl, l, v) => gl.uniform1i(l, v ? 1 : 0),
  SAMPLER_2D: (gl, l, v) => gl.uniform1i(l, v),
  FLOAT_MAT3: (gl, l, v) => gl.uniformMatrix3fv(l, false, v),
  FLOAT_MAT4: (gl, l, v) => gl.uniformMatrix4fv(l, false, v),
};
const LENGTHS = { FLOAT_VEC2: 2, FLOAT_VEC3: 3, FLOAT_VEC4: 4, FLOAT_MAT3: 9, FLOAT_MAT4: 16 };

// Convierte el registro del compilador en mensajes con la línea y su texto:
//   «fragment shader, línea 6: 'u_tiem' : undeclared identifier
//      6 │   float t = u_tiem;»
function explainLog(log, source, stage) {
  const lines = source.split('\n');
  const entries = log.trim().split(/\n(?=ERROR|WARNING)/); // un mensaje puede ocupar varias líneas
  return entries.map((entry) => {
    const match = /^(?:ERROR|WARNING): \d+:(\d+): ([\s\S]*)$/.exec(entry);
    if (!match) return `${stage}: ${entry}`;
    const lineNumber = Number(match[1]);
    const code = lines[lineNumber - 1]?.trim() ?? '';
    return `${stage}, línea ${lineNumber}: ${match[2].replace(/\n/g, '\\n')}\n   ${lineNumber} │ ${code}`;
  }).join('\n');
}

function compile(gl, type, source, stage) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) && !gl.isContextLost()) {
    const message = explainLog(gl.getShaderInfoLog(shader) ?? '', source, stage);
    gl.deleteShader(shader);
    throw new GLKitError(message);
  }
  return shader;
}

// Un programa con sus uniforms descubiertos: set({ u_time: 1.5, u_color: [1, 0, 0] })
// comprueba el nombre y el tamaño de cada valor y llama al uniform* correcto, siempre después
// de useProgram (el error de la lección «WebGL desde JavaScript» no puede ocurrir).
export function createProgram(gl, { vertex, fragment, name = 'programa' }) {
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertex.trim(), `${name} · vertex shader`));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragment.trim(), `${name} · fragment shader`));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS) && !gl.isContextLost()) {
    throw new GLKitError(`${name} · al enlazar: ${gl.getProgramInfoLog(program).trim()}`);
  }
  const typeNames = Object.keys(SETTERS);
  const uniforms = new Map();
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(program, i);
    const baseName = info.name.replace(/\[0\]$/, ''); // u_kernel[0] → u_kernel
    const typeName = typeNames.find((typeName) => gl[typeName] === info.type) ?? String(info.type);
    uniforms.set(baseName, { location: gl.getUniformLocation(program, info.name), typeName, size: info.size });
  }
  return {
    name,
    program,
    uniforms,
    use() {
      gl.useProgram(program);
    },
    set(values) {
      gl.useProgram(program);
      for (const [key, value] of Object.entries(values)) {
        const uniform = uniforms.get(key);
        if (!uniform) {
          const known = [...uniforms.keys()].join(', ') || 'ninguno';
          throw new GLKitError(`${name}: el shader no usa el uniform «${key}» (¿está mal escrito, o el compilador lo eliminó por no usarse?). Uniforms activos: ${known}.`);
        }
        const expected = (LENGTHS[uniform.typeName] ?? 1) * uniform.size;
        const actual = typeof value === 'number' || typeof value === 'boolean' ? 1 : value.length;
        if (actual !== expected) {
          throw new GLKitError(`${name}: «${key}» es ${uniform.typeName}${uniform.size > 1 ? `[${uniform.size}]` : ''} y espera ${expected} número${expected === 1 ? '' : 's'}; ha recibido ${actual}.`);
        }
        const setter = SETTERS[uniform.typeName];
        if (!setter) throw new GLKitError(`${name}: GLKit no sabe dar valor a «${key}» (tipo ${uniform.typeName}).`);
        setter(gl, uniform.location, value);
      }
    },
  };
}

// ── Geometría, texturas, destinos ────────────────────────────────────────────────────────
// Un rectángulo que cubre el viewport, en la location 0. Dibújalo con drawArrays(TRIANGLE_STRIP, 0, 4).
export function createQuad(gl) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  return vao;
}

// Una textura desde una imagen (source) o desde datos (width, height, data). Por defecto:
// RGBA de 8 bits, LINEAR, CLAMP_TO_EDGE y las imágenes volteadas (uv 0, 0 = abajo a la izquierda).
export function createTexture(gl, {
  source = null, width = 0, height = 0, data = null,
  internalFormat = gl.RGBA8, format = gl.RGBA, type = gl.UNSIGNED_BYTE,
  filter = gl.LINEAR, wrap = gl.CLAMP_TO_EDGE, flipY = Boolean(source), mipmaps = false,
} = {}) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);
  if (source) gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, format, type, source);
  else gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, data);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); // el ajuste es global: se deja como estaba
  if (mipmaps) gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mipmaps ? gl.LINEAR_MIPMAP_LINEAR : filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
  return texture;
}

// Un destino de dibujo: textura + framebuffer. Lanza si la combinación no es válida.
export function createTarget(gl, width, height, options = {}) {
  const texture = createTexture(gl, { width, height, filter: gl.NEAREST, ...options });
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  if (status !== gl.FRAMEBUFFER_COMPLETE && !gl.isContextLost()) {
    throw new GLKitError(`El framebuffer de ${width} × ${height} no está completo (estado ${status}).`);
  }
  return {
    texture,
    framebuffer,
    width,
    height,
    // Enlaza este destino y ajusta el viewport a su tamaño
    bind() {
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.viewport(0, 0, width, height);
    },
  };
}

// Vuelve a dibujar en el lienzo, con el viewport del lienzo
export function bindCanvas(gl) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
}

// crossOrigin ANTES de src: en las tarjetas (origen null) toda imagen es de otro origen
export async function loadImage(url) {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.src = url;
  await image.decode();
  return image;
}

// El color del píxel (x, y) del framebuffer enlazado (y = 0 es la fila de abajo)
export function readPixel(gl, x, y) {
  const pixel = new Uint8Array(4);
  gl.readPixels(Math.floor(x), Math.floor(y), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  return Array.from(pixel);
}

// ── Animación con botón ──────────────────────────────────────────────────────────────────
// frame(seconds) devuelve false para terminar. start() no hace nada si ya está en marcha o si
// el sistema pide reducir el movimiento (devuelve 'reduced'); stop() cancela el fotograma pedido.
// Al ocultar la página se para sola.
export function createAnimation({ frame, onStop = () => {} }) {
  let frameId = null;
  let startTime = 0;
  const animation = {
    get running() {
      return frameId !== null;
    },
    start() {
      if (frameId !== null) return 'running';
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 'reduced';
      startTime = performance.now();
      const step = (now) => {
        if (frame((now - startTime) / 1000) === false) {
          frameId = null;
          onStop('done');
          return;
        }
        frameId = requestAnimationFrame(step);
      };
      frameId = requestAnimationFrame(step);
      return 'started';
    },
    stop(reason = 'stopped') {
      if (frameId === null) return;
      cancelAnimationFrame(frameId);
      frameId = null;
      onStop(reason);
    },
  };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) animation.stop('hidden');
  });
  return animation;
}
