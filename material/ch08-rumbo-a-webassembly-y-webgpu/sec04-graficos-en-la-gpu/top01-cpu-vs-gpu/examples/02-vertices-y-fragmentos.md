---
renderer: shader
resolution: 640x400
example_description: "El rectángulo de un shader son dos triángulos con 4 vértices: el vertex shader se ejecuta 4 veces y da un color a cada esquina; el fragment shader recibe ese color interpolado en cada píxel, mezclando solo las 3 esquinas de SU triángulo, y en la diagonal compartida se ve la costura"
example_tags: "shader|glsl|webgl|pipeline|vertex-shader|fragment-shader|varying|interpolacion"
example_stage: minimal
example_importance: important
---

# Vertex

```vertex
// El VERTEX SHADER se ejecuta una vez por vértice. LearnWeb dibuja un rectángulo
// que cubre el lienzo con 4 vértices: (-1,-1) (1,-1) (-1,1) (1,1), en dos triángulos.
attribute vec2 a_position;
varying vec3 v_color; // lo que este vértice deja para los píxeles

void main() {
  vec2 corner = a_position * 0.5 + 0.5; // de -1..1 a 0..1
  // Un color por esquina: abajo rojo → verde, arriba azul → amarillo
  vec3 bottom = mix(vec3(0.86, 0.15, 0.15), vec3(0.09, 0.64, 0.29), corner.x);
  vec3 top = mix(vec3(0.15, 0.39, 0.92), vec3(0.98, 0.80, 0.08), corner.x);
  v_color = mix(bottom, top, corner.y);
  gl_Position = vec4(a_position, 0.0, 1.0); // dónde cae el vértice
}
```

# Fragment

```fragment
// El FRAGMENT SHADER se ejecuta una vez por píxel cubierto: 640 × 400 = 256 000 veces.
precision mediump float;

// v_color llega INTERPOLADO: la rasterización mezcla los colores de las 3 esquinas
// del triángulo que cubre este píxel, según lo cerca que esté de cada una.
varying vec3 v_color;

void main() {
  gl_FragColor = vec4(v_color, 1.0);
}

// Fíjate en la diagonal que va de abajo a la derecha a arriba a la izquierda: es el lado
// que comparten los dos triángulos. El de abajo no conoce el amarillo y el de arriba no
// conoce el rojo, así que el degradado cambia de dirección justo ahí (la «costura»).
```
