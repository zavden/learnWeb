---
renderer: shader
resolution: 600x400
shader_uniforms: "speed:float=1[0,4,0.1]"
example_description: "Los uniforms son los valores que llegan de fuera, iguales para todos los píxeles: u_time (segundos) mueve unas franjas y hace latir un anillo, u_mouse (píxeles, y hacia arriba) lo coloca bajo el ratón, u_mouse_pressed lo cambia de color y el control speed del panel Shader regula la velocidad. En el fotograma quieto de las tarjetas, el anillo está en el centro"
example_tags: "shader|glsl|webgl|uniforms|u-time|u-mouse|animacion|interaccion"
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
uniform vec2 u_resolution;
uniform float u_time;          // segundos desde el inicio; 0 en las tarjetas y en pausa
uniform vec2 u_mouse;          // en píxeles del lienzo, y hacia arriba; (0, 0) sin ratón
uniform float u_mouse_pressed; // 1.0 mientras se pulsa el botón
uniform float speed;           // control del panel Shader (de 0 a 4)

void main() {
  vec2 p = gl_FragCoord.xy;
  float t = u_time * speed;

  // Fondo: franjas diagonales que se desplazan con el tiempo
  float stripes = 0.5 + 0.5 * sin((p.x + p.y) / 24.0 - t * 2.0);
  vec3 color = mix(vec3(0.06, 0.09, 0.16), vec3(0.12, 0.16, 0.27), stripes);

  // El anillo sigue al ratón; sin ratón (el fotograma quieto de las tarjetas), va al centro
  vec2 target = u_mouse == vec2(0.0) ? 0.5 * u_resolution : u_mouse;
  float radius = 60.0 + 20.0 * sin(t * 3.0); // late entre 40 y 80 px
  if (abs(distance(p, target) - radius) < 5.0) {
    // Ámbar normalmente; turquesa mientras se pulsa
    color = u_mouse_pressed > 0.5 ? vec3(0.18, 0.83, 0.75) : vec3(0.98, 0.75, 0.14);
  }
  gl_FragColor = vec4(color, 1.0);
}

// En el editor: pulsa ▶ en el panel Shader para que avance el tiempo, mueve el ratón sobre
// el lienzo, haz clic y mantén, y prueba el control «speed» (con 0 todo se para).
```
