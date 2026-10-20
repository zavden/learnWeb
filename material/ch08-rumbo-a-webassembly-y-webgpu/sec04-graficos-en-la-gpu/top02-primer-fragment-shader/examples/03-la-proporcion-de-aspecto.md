---
renderer: shader
resolution: 800x400
example_description: "En uv, una unidad de x mide el ancho del lienzo y una de y su alto: en un lienzo de 800 × 400, un «círculo» de radio 0.2 sale como una elipse el doble de ancha que de alta (izquierda). Dividir los dos ejes entre u_resolution.y da unidades cuadradas y un círculo de verdad (derecha)"
example_tags: "shader|glsl|webgl|uv|u-resolution|proporcion|circulo|bug"
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
uniform vec2 u_resolution; // (800, 400): el doble de ancho que de alto

void main() {
  vec3 color = vec3(0.06, 0.09, 0.16);

  // 🐛 Izquierda: el círculo en uv. Una unidad de x son 800 px y una de y, 400 px,
  //    así que el radio 0.2 mide 160 px en horizontal y 80 px en vertical: una elipse.
  vec2 uv = gl_FragCoord.xy / u_resolution;
  if (distance(uv, vec2(0.25, 0.5)) < 0.2) {
    color = vec3(0.88, 0.11, 0.28);
  }

  // ✅ Derecha: restar el centro y dividir LOS DOS ejes entre la altura.
  //    Ahora una unidad mide 400 px en x y en y, y el radio 0.2 son 80 px en todas direcciones.
  vec2 center = vec2(0.75, 0.5) * u_resolution;
  vec2 p = (gl_FragCoord.xy - center) / u_resolution.y;
  if (length(p) < 0.2) {
    color = vec3(0.05, 0.58, 0.53);
  }

  gl_FragColor = vec4(color, 1.0);
}

// La forma habitual de empezar un shader con formas: el origen en el centro del lienzo
// y la altura como unidad:  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
// En x, p va de -1.0 a 1.0 en este lienzo (de -0.5 a 0.5 en uno cuadrado); en y, de -0.5 a 0.5.
```
