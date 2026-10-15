---
renderer: shader
resolution: 480x330
shader_textures: u_image=valley-of-mexico.jpg
shader_uniforms: "frameColor:vec3=0.996,0.953,0.78|corner:float=0.06[0,0.15,0.01]|shine:float=0.35[0,1,0.05]"
example_description: "Un cartel del museo hecho solo con un shader de LearnWeb: el cuadro de Velasco (textura) dentro de una tarjeta de esquinas redondeadas con marco y sombra (funciones de distancia), una viñeta, un acercamiento lento y un brillo que cruza en diagonal (u_time), y un foco que sigue al ratón (u_mouse). En el panel Shader del editor se cambian el color del marco, las esquinas y la intensidad del brillo"
example_tags: "shader|glsl|webgl|textura|sdf|u-time|u-mouse|cartel"
example_stage: intermediate
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
uniform float u_time;
uniform vec2 u_mouse;
uniform sampler2D u_image; // el cuadro, subido ya al derecho (lección «Texturas y framebuffers»)
uniform vec3 frameColor;
uniform float corner;
uniform float shine;

float sdRoundedBox(vec2 p, vec2 halfSize, float radius) {
  vec2 d = abs(p) - (halfSize - radius);
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - radius;
}

void main() {
  // Unidades cuadradas con el origen en el centro (lección «Tu primer fragment shader»)
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
  float pixel = 1.0 / u_resolution.y;

  // La tarjeta: el marco por fuera, la foto por dentro
  float card = sdRoundedBox(p, vec2(0.64, 0.42), corner);
  float photoArea = card + 0.025; // 0.025 de marco
  vec3 color = vec3(0.06, 0.09, 0.16) * (0.7 + 0.3 * smoothstep(0.0, 0.08, card)); // sombra suave

  // La foto: acercamiento lento desde el centro, que en el fotograma quieto vale 1
  float zoom = 1.0 + 0.04 * (1.0 - cos(u_time * 0.4));
  vec2 uv = (gl_FragCoord.xy / u_resolution - 0.5) / zoom + 0.5;
  vec3 photo = texture2D(u_image, uv).rgb;
  photo *= 1.0 - 0.35 * dot(p, p); // viñeta: más oscuro hacia las esquinas

  // Un brillo en diagonal que cruza el cartel cada 7 s; en t = 0 pasa por el centro
  float band = fract(u_time / 7.0 + 0.5) * 3.0 - 1.5;
  photo += shine * 0.5 * (1.0 - smoothstep(0.0, 0.08, abs(p.x + p.y - band)));

  // Un foco donde está el ratón (si se ha movido)
  if (u_mouse != vec2(0.0)) {
    vec2 m = (u_mouse - 0.5 * u_resolution) / u_resolution.y;
    photo *= 0.85 + 0.35 * (1.0 - smoothstep(0.0, 0.3, distance(p, m)));
  }

  color = mix(color, frameColor, 1.0 - smoothstep(-pixel, pixel, card));
  color = mix(color, photo, 1.0 - smoothstep(-pixel, pixel, photoArea));
  gl_FragColor = vec4(color, 1.0);
}

// José María Velasco, «Valle de México», 1877. Dominio público.
```
