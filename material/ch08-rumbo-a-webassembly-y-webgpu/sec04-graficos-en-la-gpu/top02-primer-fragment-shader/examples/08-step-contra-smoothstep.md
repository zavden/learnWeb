---
renderer: shader
resolution: 600x400
example_description: "Con step() cada píxel está dentro o fuera de la forma, sin término medio, y el borde de un círculo sale en escalera (dientes de sierra). Con smoothstep() en el ancho de un píxel, los píxeles del borde toman un color intermedio y el borde se ve liso. Para que se note, el dibujo va con una lupa: cada píxel del dibujo mide 8 × 8 píxeles reales"
example_tags: "shader|glsl|webgl|step|smoothstep|antialiasing|sdf|bug"
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

const float ZOOM = 8.0; // la lupa: un «píxel» del dibujo = 8 × 8 píxeles reales

void main() {
  // El píxel ampliado al que pertenece este píxel real, y su centro (el lienzo «ampliado»
  // mide 75 × 50 píxeles). Todos los píxeles reales de un cuadrado de 8 × 8 dan lo mismo.
  vec2 cell = floor(gl_FragCoord.xy / ZOOM);
  vec2 center = cell + 0.5;

  // Dos círculos de radio 15 «píxeles»: d = distancia al borde, en píxeles ampliados
  bool left = gl_FragCoord.x < 0.5 * u_resolution.x;
  float d = distance(center, left ? vec2(19.0, 25.0) : vec2(56.0, 25.0)) - 15.0;

  float inside;
  if (left) {
    inside = 1.0 - step(0.0, d); // 🐛 dentro o fuera: 1.0 o 0.0, nada en medio
  } else {
    inside = 1.0 - smoothstep(-0.5, 0.5, d); // ✅ en el borde, la parte del píxel que cae dentro
  }
  vec3 color = mix(vec3(0.06, 0.09, 0.16), vec3(0.98, 0.75, 0.14), inside);

  // Las líneas de la lupa, para ver los píxeles ampliados
  vec2 inCell = mod(gl_FragCoord.xy, ZOOM);
  if (inCell.x < 1.0 || inCell.y < 1.0) {
    color *= 0.8;
  }
  gl_FragColor = vec4(color, 1.0);
}

// Izquierda: un borde en escalera, cada cuadrado ámbar o azul noche. Derecha: los cuadrados
// del borde salen de colores intermedios y el círculo se ve redondo al alejarse (o al
// entrecerrar los ojos). Sin lupa ocurre lo mismo, a escala de un píxel: con step, los bordes
// tiemblan al moverse; con smoothstep (o fwidth en WebGL 2), no.
```
