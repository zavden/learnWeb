---
renderer: shader
resolution: 600x400
example_description: "El instinto de la CPU falla en un shader: una variable global que «suma un poco en cada píxel» no se comparte, cada ejecución de main() empieza con su propia copia, así que todos los píxeles ven el mismo valor (la mitad de arriba sale plana). El degradado correcto sale de la coordenada del píxel (la mitad de abajo)"
example_tags: "shader|glsl|webgl|paralelismo|estado|bug"
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

// 🐛 La idea de la CPU: «cada píxel, un poco más de brillo que el anterior».
// Esta variable global NO es compartida: cada ejecución de main() tiene su propia
// copia, que empieza en 0.0. No hay «píxel anterior».
float brightness = 0.0;

void main() {
  brightness += 1.0 / 600.0; // cada píxel suma UNA vez sobre su copia → 0.0017 en todos

  float value;
  if (gl_FragCoord.y > u_resolution.y * 0.5) {
    value = brightness; // 🐛 arriba: el «acumulado», casi 0 y el mismo en todos los píxeles
  } else {
    value = gl_FragCoord.x / u_resolution.x; // ✅ abajo: el valor sale de la posición del píxel
  }

  vec3 night = vec3(0.06, 0.09, 0.16);
  vec3 amber = vec3(0.98, 0.75, 0.14);
  gl_FragColor = vec4(mix(night, amber, value), 1.0);
}

// Arriba, una franja azul noche plana; abajo, un degradado de azul noche a ámbar.
// Para algo que de verdad necesita a los demás píxeles (un total, un histograma, la media de
// la imagen) hacen falta otras técnicas: varias pasadas que reducen la imagen a la mitad cada
// vez, o los compute shaders del módulo «WebGPU».
```
