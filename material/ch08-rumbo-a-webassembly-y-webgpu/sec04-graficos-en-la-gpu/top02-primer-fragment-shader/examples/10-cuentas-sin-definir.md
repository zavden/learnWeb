---
renderer: shader
resolution: 600x400
example_description: "Algunas cuentas de GLSL no están definidas para ciertos valores: pow(x, y) con x negativo, sqrt de un negativo, log(0), atan(0.0, 0.0), normalize(vec2(0.0)), 0.0 / 0.0. No hay error ni excepción: el píxel recibe lo que dé esa GPU (a menudo NaN, que suele pintarse negro). Arriba, una corrección de gamma con pow sobre valores negativos; abajo, la versión que trata el signo aparte"
example_tags: "shader|glsl|webgl|nan|pow|indefinido|gamma|bug"
example_stage: common-error
example_importance: important
---

# Vertex

```vertex
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
```

# Fragment

```fragment
precision mediump float;
uniform vec2 u_resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  // Un valor de -1 a 1 de izquierda a derecha, como un canal de color que un filtro de
  // enfoque ha dejado negativo, y una «corrección de gamma» (elevar a 1 / 2.2)
  float v = mix(-1.0, 1.0, uv.x);

  float curve;
  if (uv.y > 0.5) {
    curve = pow(v, 1.0 / 2.2); // 🐛 pow(x, y) no está definido para x < 0
  } else {
    curve = sign(v) * pow(abs(v), 1.0 / 2.2); // ✅ el signo aparte: definido para todo v
  }

  // De -1 (azul) a 1 (ámbar), pasando por un violeta en el 0
  vec3 color = mix(vec3(0.15, 0.39, 0.92), vec3(0.98, 0.75, 0.14), 0.5 + 0.5 * curve);
  gl_FragColor = vec4(color, 1.0);
}

// Abajo, un degradado continuo de azul a ámbar. Arriba, la mitad derecha es igual, pero la
// izquierda (v < 0) recibe lo que dé la GPU: depende del hardware y del driver, y lo más
// común es NaN (Not a Number), que contagia a todas las cuentas que lo tocan (mix, +, *) y
// acaba pintado como negro. No hay mensaje en ninguna consola.
// Protege las entradas: max(x, 0.0), abs(), clamp(), o comprueba antes de dividir.
```
