---
renderer: shader
resolution: 600x400
example_description: "En gl_FragCoord la y crece HACIA ARRIBA, al revés que en el canvas 2D, el SVG y el CSS. Un paisaje pensado «a lo canvas» (cielo en las 240 filas de arriba, sol a 80 px del borde superior) sale cabeza abajo en la mitad izquierda; en la derecha, dar la vuelta a la y lo arregla"
example_tags: "shader|glsl|webgl|gl-fragcoord|coordenadas|eje-y|bug"
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
uniform vec2 u_resolution; // (600, 400)

// Un paisaje pensado como en el canvas 2D: y = 0 ARRIBA y la y crece hacia abajo.
// El cielo ocupa las 240 filas de arriba y el sol está a 80 px del borde de arriba.
vec3 landscape(vec2 p) {
  vec3 color = p.y < 240.0 ? vec3(0.49, 0.83, 0.99) : vec3(0.09, 0.64, 0.29); // cielo o hierba
  if (distance(p, vec2(150.0, 80.0)) < 40.0) {
    color = vec3(0.98, 0.80, 0.08); // el sol
  }
  return color;
}

void main() {
  vec2 p = gl_FragCoord.xy;
  vec3 color;
  if (p.x < 300.0) {
    // 🐛 Izquierda: gl_FragCoord tal cual. Su y crece hacia ARRIBA (y = 0 es la fila de
    //    abajo), así que el cielo y el sol salen abajo y la hierba arriba.
    color = landscape(p);
  } else {
    // ✅ Derecha: se da la vuelta a la y (y se lleva la x al principio de su mitad)
    color = landscape(vec2(p.x - 300.0, u_resolution.y - p.y));
  }
  if (abs(p.x - 300.0) < 1.0) {
    color = vec3(1.0); // la línea que separa las dos mitades
  }
  gl_FragColor = vec4(color, 1.0);
}
```
