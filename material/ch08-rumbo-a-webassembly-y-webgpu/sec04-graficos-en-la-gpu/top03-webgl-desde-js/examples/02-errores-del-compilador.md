---
example_description: "createProgram lanza un Error con el registro del compilador (getShaderInfoLog) o del enlazador (getProgramInfoLog). Cinco fallos típicos y lo que dice Chrome: un ; que falta (se señala en la línea SIGUIENTE), un vec2 donde va un vec3, un uniform sin declarar, una línea en blanco antes de #version (el clásico de los shaders en <script>) y un in que el vertex shader no escribe"
example_tags: "javascript|webgl2|glsl|errores|compileshader|getshaderinfolog|linkprogram|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Usa assets/webgl/utils.js: createProgram compila, enlaza y, si algo falla, lanza un Error
// con el registro del compilador (getShaderInfoLog) o del enlazador (getProgramInfoLog).
import { createProgram } from './webgl/utils.js';

const gl = document.createElement('canvas').getContext('webgl2'); // solo para compilar
const VERTEX = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

// Cada caso: un fragment shader con UN fallo. Las líneas se cuentan desde la 1 del texto.
const cases = [
  ['🐛 falta el ; al final de la línea 5', `#version 300 es
precision highp float;
out vec4 outColor;
void main() {
  vec3 color = vec3(1.0, 0.5, 0.0)
  outColor = vec4(color, 1.0);
}`],
  ['🐛 un vec2 donde va un vec3 (línea 5)', `#version 300 es
precision highp float;
out vec4 outColor;
void main() {
  vec3 color = vec2(1.0, 0.5);
  outColor = vec4(color, 1.0);
}`],
  ['🐛 un uniform sin declarar (línea 5)', `#version 300 es
precision highp float;
out vec4 outColor;
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  outColor = vec4(uv, 0.0, 1.0);
}`],
  // (el registro cita el salto de línea entre comillas: el mensaje sale partido en dos líneas)
  ['🐛 una línea en blanco antes de #version', `
#version 300 es
precision highp float;
out vec4 outColor;
void main() {
  outColor = vec4(1.0);
}`],
  // Este compila, pero no ENLAZA: lee un in v_color que el vertex shader no escribe
  ['🐛 un in sin su out en el vertex shader', `#version 300 es
precision highp float;
in vec3 v_color;
out vec4 outColor;
void main() {
  outColor = vec4(v_color, 1.0);
}`],
];

for (const [label, fragmentSource] of cases) {
  try {
    createProgram(gl, VERTEX, fragmentSource);
    console.log(`${label} → compila y enlaza`);
  } catch (error) {
    console.log(`${label}:\n${error.message}`);
  }
}
gl.getExtension('WEBGL_lose_context')?.loseContext();
// Un shader escrito en un <script type="x-shader/…"> empieza con el salto de línea que hay
// tras la etiqueta: por eso shaderFromScript() hace trim() antes de compilar.
```
