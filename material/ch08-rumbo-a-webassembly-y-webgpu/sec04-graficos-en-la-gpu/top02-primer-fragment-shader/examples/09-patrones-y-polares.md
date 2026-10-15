---
renderer: shader
resolution: 800x200
example_description: "Patrones que salen de las coordenadas: franjas con fract(), un tablero de ajedrez con floor() y mod(), anillos con fract(length(p)) y una rueda de color con coordenadas polares (atan da el ángulo y se convierte en tono). Con el tiempo en marcha, las franjas avanzan y la rueda gira"
example_tags: "shader|glsl|webgl|patrones|fract|mod|atan|polares|color"
example_stage: minimal
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
uniform vec2 u_resolution; // (800, 200): cuatro casillas de 200 × 200
uniform float u_time;

const float PI = 3.14159265;

// Tono (0 a 1) → color: rojo, amarillo, verde, cian, azul, magenta y vuelta al rojo
vec3 hueToRgb(float hue) {
  return clamp(abs(mod(hue * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
}

void main() {
  float cell = floor(gl_FragCoord.x / 200.0);
  // p: dentro de la casilla, origen en su centro, de -0.5 a 0.5
  vec2 p = (gl_FragCoord.xy - vec2(cell * 200.0 + 100.0, 100.0)) / 200.0;
  vec3 color = vec3(0.0);

  if (cell == 0.0) {
    // Franjas: fract() repite de 0 a 1; step() lo parte en dos mitades
    float stripe = step(0.5, fract(p.x * 6.0 - u_time * 0.5));
    color = mix(vec3(0.12, 0.25, 0.69), vec3(0.97, 0.98, 0.99), stripe);
  } else if (cell == 1.0) {
    // Tablero: la casilla (fila, columna) es blanca si fila + columna es par
    vec2 square = floor((p + 0.5) * 8.0); // 8 × 8 casillas
    float white = 1.0 - mod(square.x + square.y, 2.0);
    color = mix(vec3(0.20, 0.15, 0.10), vec3(0.93, 0.87, 0.75), white);
  } else if (cell == 2.0) {
    // Anillos: la distancia al centro, repetida
    float ring = step(0.5, fract(length(p) * 8.0));
    color = mix(vec3(0.06, 0.09, 0.16), vec3(0.98, 0.75, 0.14), ring);
  } else {
    // Rueda de color en coordenadas polares: ángulo → tono, distancia → saturación
    float angle = atan(p.y, p.x);                     // de -PI a PI, 0 hacia la derecha
    float hue = fract(angle / (2.0 * PI) + u_time * 0.1);
    float radius = length(p) * 2.0;                   // 0 en el centro, 1 en el borde
    color = mix(vec3(1.0), hueToRgb(hue), radius);    // del blanco al color puro
    if (radius > 1.0) color = vec3(0.06, 0.09, 0.16);
  }
  gl_FragColor = vec4(color, 1.0);
}

// El centro de cada casilla cae en la esquina entre cuatro píxeles, así que ningún píxel
// llega a tener p = (0, 0) y atan(0.0, 0.0), que no está definido, no ocurre aquí.
```
