// Matrices de 4 × 4 para 3D: las de assets/gl/mat4.js del módulo «Gráficos en la GPU» (las mismas
// de la integración de este módulo), con un cambio para WebGPU (perspective). Se guardan POR
// COLUMNAS en un Float32Array de 16 números: el orden de un mat4x4f de WGSL en un búfer, y el de
// matrix3d() en CSS.
//
//   | m0 m4 m8  m12 |      m12, m13, m14: el desplazamiento
//   | m1 m5 m9  m13 |      la fila de abajo (m3, m7, m11, m15): la perspectiva
//   | m2 m6 m10 m14 |
//   | m3 m7 m11 m15 |

export function identity() {
  return Float32Array.of(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
}

// a × b: aplica primero b y después a
export function multiply(a, b) {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += a[k * 4 + row] * b[col * 4 + k];
      out[col * 4 + row] = sum;
    }
  }
  return out;
}

// Multiplica varias de una vez: compose(p, v, m) = p × v × m (m se aplica primero)
export function compose(...matrices) {
  return matrices.reduce((product, matrix) => multiply(product, matrix));
}

export function translation(x, y, z) {
  return Float32Array.of(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1);
}

export function rotationX(radians) {
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  return Float32Array.of(1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1);
}

export function rotationY(radians) {
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  return Float32Array.of(c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1);
}

// Perspectiva: lo lejano se ve más pequeño. La GPU divide x, y y z entre w, y esta matriz
// hace que w valga la distancia a la cámara (-z): la misma división de perspective() en CSS.
// fovY: ángulo de visión vertical (radianes); near/far: lo más cerca y lo más lejos que se dibuja.
// ⚠️ Lo que cambia respecto a WebGL: en WebGPU la profundidad va de 0 (near) a 1 (far), no de -1
// a 1. Con la matriz de WebGL, la mitad cercana de la escena quedaría recortada.
export function perspective(fovY, aspect, near, far) {
  const f = 1 / Math.tan(fovY / 2);
  const range = 1 / (near - far);
  return Float32Array.of(
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, far * range, -1,
    0, 0, near * far * range, 0,
  );
}

const subtract = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const normalize = (v) => {
  const length = Math.hypot(...v);
  return v.map((component) => component / length);
};

// La cámara: desde «eye» mirando a «target». Devuelve la matriz que lleva el mundo a los ojos
// de la cámara (la inversa de colocar la cámara en el mundo).
export function lookAt(eye, target, up = [0, 1, 0]) {
  const z = normalize(subtract(eye, target)); // la cámara mira hacia -z
  const x = normalize(cross(up, z));
  const y = cross(z, x);
  return Float32Array.of(
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -(x[0] * eye[0] + x[1] * eye[1] + x[2] * eye[2]),
    -(y[0] * eye[0] + y[1] * eye[1] + y[2] * eye[2]),
    -(z[0] * eye[0] + z[1] * eye[1] + z[2] * eye[2]),
    1,
  );
}

// La parte de 3 × 3 de arriba a la izquierda (el giro): sirve para girar las normales cuando
// el modelo solo gira y se mueve (sin escalas distintas en cada eje)
export function upperLeft3x3(m) {
  return Float32Array.of(m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10]);
}

// Aplica la matriz a un punto (x, y, z, 1) y devuelve [x, y, z, w]
export function transformPoint(m, [x, y, z]) {
  return [0, 1, 2, 3].map((row) => m[row] * x + m[4 + row] * y + m[8 + row] * z + m[12 + row]);
}
