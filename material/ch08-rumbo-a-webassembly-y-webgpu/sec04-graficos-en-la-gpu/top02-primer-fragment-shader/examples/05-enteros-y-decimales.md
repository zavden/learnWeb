---
renderer: shader
resolution: 600x400
example_description: "En GLSL ES 1.00, 1 es un int y 1.0 un float, y no se convierten solos: «float radius = 1;» es un error de compilación (cannot convert from 'const int' to 'mediump float') y la vista previa no dibuja nada. Con 1.0, el shader dibuja un disco ámbar"
example_tags: "shader|glsl|webgl|tipos|int|float|error-de-compilacion|bug"
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
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
  float radius = 1; // 🐛 línea 6: «1» es un int
  float inside = step(length(p) * 2.5, radius);
  vec3 color = mix(vec3(0.06, 0.09, 0.16), vec3(0.98, 0.75, 0.14), inside);
  gl_FragColor = vec4(color, 1.0);
}

// Las tarjetas y el diálogo de la teoría muestran «Shader preview unavailable» y:
//   ERROR: 0:6: '=' : cannot convert from 'const int' to 'mediump float'
// El editor muestra el mismo mensaje sin «ERROR: 0:6:» y lo marca en la línea 6 (shader.frag:6).
// JavaScript solo tiene number y Python convierte int → float al operar; GLSL ES 1.00
// no convierte nunca por su cuenta. Tampoco valen «p * 2» ni «uv.x + 1».
// ✅ Escribe los decimales con punto: 1.0, 2.0, 0.5. Los constructores sí convierten:
//    float(3), vec2(1, 2) e int(2.7) son válidos.
```
