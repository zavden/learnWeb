---
renderer: shader
resolution: 480x330
shader_textures: u_image=valley-of-mexico.jpg
shader_uniforms: "filterMode:int=1[0,3,1]|split:float=0.5[0,1,0.01]"
example_description: "Los filtros píxel a píxel de la lección «Píxeles» (escala de grises, negativo, umbral), reescritos como fragment shader: el cuerpo del bucle se queda igual y el bucle desaparece. A la izquierda de la línea, el cuadro original; a la derecha, filtrado. En el editor, los controles filterMode y split del panel Shader cambian el filtro y la línea"
example_tags: "shader|glsl|webgl|textura|filtros|escala-de-grises|pixeles"
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
uniform sampler2D u_image; // assets/valley-of-mexico.jpg, de 480 × 330 como el lienzo
uniform int filterMode;    // 0 original · 1 escala de grises · 2 negativo · 3 umbral
uniform float split;       // posición de la línea, de 0 a 1

// El cuerpo del bucle de la lección «Píxeles»: recibe UN color y devuelve otro.
// Los canales van de 0.0 a 1.0 en lugar de 0 a 255.
vec3 applyFilter(vec3 color) {
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722)); // 0.2126 r + 0.7152 g + 0.0722 b
  if (filterMode == 1) return vec3(luma);                 // escala de grises
  if (filterMode == 2) return 1.0 - color;                // negativo: 255 − valor
  if (filterMode == 3) return vec3(step(128.0 / 255.0, luma)); // umbral: blanco si luma ≥ 128
  return color;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 color = texture2D(u_image, uv).rgb; // «data[i], data[i + 1], data[i + 2]» de este píxel
  if (uv.x > split) {
    color = applyFilter(color);
  }
  // Una línea blanca de 2 píxeles en la separación
  if (abs(gl_FragCoord.x - split * u_resolution.x) < 1.0) {
    color = vec3(1.0);
  }
  gl_FragColor = vec4(color, 1.0);
}

// El cuadro: José María Velasco, «Valle de México», 1877. Dominio público.
```
