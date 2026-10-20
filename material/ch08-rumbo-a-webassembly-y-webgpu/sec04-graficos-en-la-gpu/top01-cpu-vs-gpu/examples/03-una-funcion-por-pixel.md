---
renderer: shader
resolution: 600x400
example_description: "Un fragment shader es una función de la posición de un píxel a su color: main() lee gl_FragCoord, calcula y escribe gl_FragColor, y la GPU la ejecuta para los 240 000 píxeles a la vez. Un atardecer con un degradado y un sol"
example_tags: "shader|glsl|webgl|fragment-shader|gl-fragcoord|degradado"
example_stage: minimal
example_importance: critical
---

# Vertex

```vertex
// El vertex shader estándar de LearnWeb: deja el rectángulo cubriendo todo el lienzo.
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

uniform vec2 u_resolution; // el tamaño del lienzo en píxeles: (600, 400); lo pone LearnWeb

// La GPU ejecuta main() UNA VEZ POR PÍXEL, todas a la vez.
// Entrada: gl_FragCoord.xy, la posición de ESTE píxel (en píxeles, desde abajo a la izquierda).
// Salida: gl_FragColor, su color (rojo, verde, azul y opacidad, de 0.0 a 1.0).
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution; // de píxeles a 0..1

  vec3 horizon = vec3(0.98, 0.57, 0.24); // naranja
  vec3 sky = vec3(0.19, 0.11, 0.42);     // violeta
  vec3 color = mix(horizon, sky, uv.y);  // abajo naranja, arriba violeta

  // El sol: los píxeles a menos de 70 px del punto (300, 150)
  if (distance(gl_FragCoord.xy, vec2(300.0, 150.0)) < 70.0) {
    color = vec3(1.0, 0.85, 0.40);
  }

  gl_FragColor = vec4(color, 1.0);
}

// El mismo cálculo como el bucle de la lección «Píxeles», en la CPU, uno detrás de otro:
//   for (let y = 0; y < 400; y++)
//     for (let x = 0; x < 600; x++) { …el cuerpo de main() para el píxel (x, y)… }
// En la GPU no hay bucle: el cuerpo es main(), y el «para cada píxel» lo pone el hardware.
```
