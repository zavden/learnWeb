---
renderer: shader
resolution: 600x300
shader_uniforms: "brand:vec3=0.88235,0.11373,0.28235"
example_description: "Un color de GLSL es un vec3 o vec4 con canales de 0.0 a 1.0: #e11d48 es vec3(225, 29, 72) / 255.0. Cinco franjas: el color escrito a mano y el mismo llegado como uniform (idénticas, parecen una; con selector de color en el panel Shader del editor), sus canales reordenados con swizzle (.bgr), aclarado y oscurecido con mix()"
example_tags: "shader|glsl|webgl|color|vec3|swizzle|mix|uniforms"
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
uniform vec2 u_resolution;
uniform vec3 brand; // un control del panel Shader; por defecto, el mismo #e11d48

void main() {
  // En qué franja está el píxel: 0, 1, 2, 3 o 4 (cinco columnas iguales)
  float band = floor(gl_FragCoord.x / u_resolution.x * 5.0);

  // 1. Un color de CSS, byte a byte: #e1 1d 48 → 225, 29, 72 → entre 255.0
  vec3 color = vec3(225.0, 29.0, 72.0) / 255.0;
  if (band == 1.0) color = brand;                          // 2. el mismo, como uniform: idéntica a la 1
  if (band == 2.0) color = brand.bgr;                      // 3. swizzle: azul, verde, rojo
  if (band == 3.0) color = mix(brand, vec3(1.0), 0.5);     // 4. a medio camino del blanco
  if (band == 4.0) color = mix(brand, vec3(0.0), 0.5);     // 5. a medio camino del negro

  // vec4 = rojo, verde, azul y opacidad. El lienzo de LearnWeb es opaco: el cuarto valor
  // no se ve aquí (la transparencia llega en «WebGL desde JavaScript»).
  gl_FragColor = vec4(color, 1.0);
}

// Swizzling: .x .y .z .w, .r .g .b .a y .s .t .p .q son los mismos cuatro componentes con
// tres juegos de nombres. Se pueden repetir y reordenar: brand.rrr (gris del canal rojo),
// brand.bgr, p.yx, color.rgb… pero no mezclar juegos (brand.rgz es un error).
```
