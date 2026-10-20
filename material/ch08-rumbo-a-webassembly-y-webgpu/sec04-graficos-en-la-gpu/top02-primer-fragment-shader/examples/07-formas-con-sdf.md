---
renderer: shader
resolution: 800x240
shader_uniforms: "corner:float=0.08[0,0.2,0.01]|combineMode:int=0[0,2,1]"
example_description: "Formas con funciones de distancia con signo (SDF): un círculo, una caja, una caja redondeada y la combinación de un círculo con una caja (unión con min, intersección con max, resta con max(a, -b)). El borde se suaviza con smoothstep en un píxel. Los controles corner y combineMode del panel Shader cambian el redondeo y la operación"
example_tags: "shader|glsl|webgl|sdf|formas|smoothstep|min|max|antialiasing"
example_stage: minimal
example_importance: critical
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
uniform vec2 u_resolution; // (800, 240): cuatro casillas de 200 × 240
uniform float corner;      // radio de las esquinas de la tercera forma
uniform int combineMode;   // 0 unión · 1 intersección · 2 resta

// Una SDF devuelve la distancia del punto p al borde de la forma:
// negativa dentro, 0 en el borde, positiva fuera.
float sdCircle(vec2 p, float radius) {
  return length(p) - radius;
}
float sdBox(vec2 p, vec2 halfSize) {
  vec2 d = abs(p) - halfSize; // por simetría, basta con mirar una esquina
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}
float sdRoundedBox(vec2 p, vec2 halfSize, float radius) {
  return sdBox(p, halfSize - radius) - radius; // una caja más pequeña, «inflada»
}

void main() {
  // Casilla 0, 1, 2 o 3, y p = posición dentro de su casilla: origen en el centro, unidad = alto
  float cell = floor(gl_FragCoord.x / 200.0);
  vec2 p = (gl_FragCoord.xy - vec2(cell * 200.0 + 100.0, 120.0)) / u_resolution.y;

  float d = 1.0; // fuera de todo, si el lienzo crece y aparecen más casillas
  if (cell == 0.0) d = sdCircle(p, 0.3);
  if (cell == 1.0) d = sdBox(p, vec2(0.3, 0.22));
  if (cell == 2.0) d = sdRoundedBox(p, vec2(0.3, 0.22), corner);
  if (cell == 3.0) {
    float circle = sdCircle(p - vec2(0.12, 0.08), 0.22);
    float box = sdBox(p + vec2(0.1, 0.06), vec2(0.2, 0.16));
    d = min(circle, box);                          // 0 unión: dentro de una U otra
    if (combineMode == 1) d = max(circle, box);    // 1 intersección: dentro de las dos
    if (combineMode == 2) d = max(box, -circle);   // 2 resta: la caja sin el círculo
  }

  // De distancia a color: dentro (d < 0) el color de la forma, fuera el fondo. smoothstep
  // hace la transición en el ancho de un píxel (1 / 240 unidades): un borde suavizado.
  float pixel = 1.0 / u_resolution.y;
  float inside = 1.0 - smoothstep(-0.5 * pixel, 0.5 * pixel, d);
  vec3 shapeColor = vec3(0.98, 0.75, 0.14);
  if (cell == 3.0) shapeColor = vec3(0.18, 0.83, 0.75);
  gl_FragColor = vec4(mix(vec3(0.06, 0.09, 0.16), shapeColor, inside), 1.0);
}
```
