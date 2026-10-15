---
renderer: shader
resolution: 600x400
example_description: "gl_FragCoord da la posición del píxel en píxeles, con el origen ABAJO a la izquierda; dividida entre u_resolution se convierte en uv, de 0 a 1 en los dos ejes. El color sale de uv (rojo según x, verde según y), con una cuadrícula cada 0.1 hecha con fract() y un punto blanco en el origen"
example_tags: "shader|glsl|webgl|gl-fragcoord|uv|u-resolution|fract|coordenadas"
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
uniform vec2 u_resolution; // (600, 400)

void main() {
  // gl_FragCoord.xy: el CENTRO de este píxel, en píxeles. El de abajo a la izquierda
  // es (0.5, 0.5) y el de arriba a la derecha, (599.5, 399.5).
  vec2 p = gl_FragCoord.xy;
  // uv: la misma posición dividida entre el tamaño, de 0.0 a 1.0 en los dos ejes
  vec2 uv = p / u_resolution;

  vec3 color = vec3(uv.x, uv.y, 0.25); // rojo crece hacia la derecha, verde hacia ARRIBA

  // Una cuadrícula cada 0.1: fract() se queda con la parte decimal, así que fract(uv * 10.0)
  // vuelve a empezar en 0.0 diez veces en cada eje. Pasado a píxeles, es la distancia a la
  // última línea; las líneas miden 2 píxeles.
  vec2 fromLine = fract(uv * 10.0) * (u_resolution / 10.0);
  if (fromLine.x < 2.0 || fromLine.y < 2.0) {
    color = mix(color, vec3(1.0), 0.5);
  }

  // El origen (0, 0): un cuarto de círculo blanco en la esquina de abajo a la izquierda
  if (length(p) < 16.0) {
    color = vec3(1.0);
  }
  gl_FragColor = vec4(color, 1.0);
}

// Abajo a la izquierda, casi negro (uv = 0, 0); abajo a la derecha, rojo (1, 0);
// arriba a la izquierda, verde (0, 1); arriba a la derecha, amarillo (1, 1).
```
