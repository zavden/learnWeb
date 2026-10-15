---
renderer: shader
resolution: 600x400
example_description: "Los uniforms de LearnWeb (u_time, u_resolution, u_mouse…) los rellena la aplicación, pero el shader tiene que declararlos: usar u_time sin la línea «uniform float u_time;» es un error de compilación (undeclared identifier) y la vista previa no dibuja nada"
example_tags: "shader|glsl|webgl|uniform|u-time|error-de-compilacion|bug"
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
// 🐛 Falta la declaración: uniform float u_time;

void main() {
  float seconds = u_time;
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float wave = 0.5 + 0.5 * sin(uv.x * 12.0 + seconds);
  gl_FragColor = vec4(vec3(wave), 1.0);
}

// Las tarjetas y el diálogo de la teoría muestran «Shader preview unavailable» y el registro:
//   ERROR: 0:6: 'u_time' : undeclared identifier
// «0:6» = archivo 0, línea 6 de este bloque. El editor muestra el mensaje sin prefijo
// ('u_time' : undeclared identifier) y lo marca en la línea 6 (shader.frag:6). LearnWeb ENVÍA el valor de u_time, pero GLSL
// no conoce ningún nombre que no se haya declarado, como pasa con una variable en JavaScript.
// ✅ Solución: añade «uniform float u_time;» debajo de la línea 2. En el editor, pulsa ▶ en
//    el panel Shader para que el tiempo avance y verás las ondas desplazarse.
```
