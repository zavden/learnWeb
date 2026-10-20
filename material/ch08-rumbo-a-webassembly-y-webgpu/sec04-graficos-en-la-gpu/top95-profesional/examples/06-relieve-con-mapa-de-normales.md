---
example_description: "Una placa de latón con remaches, un medallón y marcas de martillo que no existen: la geometría es un rectángulo de 4 vértices y el relieve sale de un mapa de normales calculado en JavaScript desde un mapa de alturas (diferencias centrales, normales codificadas en bytes). Una luz puntual con difusa de Lambert y brillo de Blinn-Phong sigue al puntero o a las flechas; una casilla quita el mapa y el relieve desaparece. La autocomprobación compara el centro, leído con readPixels, con el mismo cálculo de luz en JavaScript"
example_tags: "javascript|webgl2|mapa-de-normales|iluminacion|lambert|blinn-phong|texturas|readpixels|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="plaque">
  <h1>Relieve con un mapa de normales</h1>
  <canvas id="plate" tabindex="0" role="img" aria-label="Una placa de latón con cuatro remaches y un medallón en relieve, iluminada por una luz que se mueve" aria-describedby="help"></canvas>
  <p id="help" class="help">Mueve el puntero sobre la placa, o entra con Tab y usa las flechas, para mover la luz.</p>
  <div class="controls">
    <label><input id="use-map" type="checkbox" checked> Mapa de normales</label>
    <label for="height">Altura de la luz</label>
    <input id="height" type="range" min="0.2" max="1" step="0.1" value="0.5">
    <output id="height-value" for="height">0.5</output>
    <button id="tour" type="button" aria-pressed="false">Recorrido de la luz (6 s)</button>
  </div>
  <p id="status" class="status" role="status"></p>
</main>
```

# CSS

```css
:root {
  color-scheme: dark;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #e2e8f0;
  background: #0f172a;
}
.plaque {
  max-width: 30rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
#plate {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 2;
  cursor: crosshair;
}
#plate:focus-visible,
input:focus-visible,
button:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}
.help {
  font-size: 0.8rem;
  color: #94a3b8;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.75rem;
}
button {
  font: inherit;
  padding: 0.25rem 0.7rem;
}
.status {
  min-height: 2.6em;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.75rem;
}
```

# JavaScript

```javascript
// Relieve con un mapa de normales.
//
// Decisiones de diseño:
// - La luz solo necesita saber hacia dónde mira cada punto de la superficie: su NORMAL. Un
//   mapa de normales guarda una por píxel, codificada en color: (x, y, z) de -1..1 pasan a
//   0..255 con (n × 0.5 + 0.5) × 255. Una superficie plana mirando a la cámara es (0, 0, 1):
//   los bytes 128, 128, 255, el azul lila típico de estos mapas.
// - El mapa se calcula aquí, en JavaScript, desde un mapa de ALTURAS hecho con funciones:
//   un bisel, 4 remaches (semiesferas), un medallón (dos anillos) y marcas de martillo (ruido).
//   La normal de cada píxel sale de cuánto cambia la altura con sus vecinos (diferencias
//   centrales), como la convolución de bordes de la lección «Píxeles». El canal alfa dice qué
//   es latón (255) y qué es la madera de alrededor (0).
// - La geometría es un rectángulo: 4 vértices. Todo el relieve es mentira, y desmarcar
//   «Mapa de normales» lo demuestra. Así se ven detallados los muros y los personajes de los
//   juegos sin millones de triángulos.
// - La luz: Lambert (lo que mira a la luz se ilumina) + Blinn-Phong (el brillo), con
//   atenuación por distancia. shadePixel() es el mismo cálculo en JavaScript, para la prueba.
// - Se dibuja al mover la luz (como mucho una vez por fotograma); el recorrido dura 6 s, se
//   para al ocultar la página y no arranca con «reducir movimiento».
//
// Usa assets/gl/kit.js (léelo con «Assets»).
// Alcance: HTML, CSS, JavaScript, DOM, eventos de puntero y teclado y este módulo.
import { createView, createProgram, createQuad, createTexture, readPixel, createAnimation } from './gl/kit.js';

const MAP_WIDTH = 384;
const MAP_HEIGHT = 256;

// --- El mapa de alturas: funciones de la posición en píxeles (y hacia arriba) ---------------------
function hash2(x, y) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function valueNoise(x, y) { // ruido suave: azar en una rejilla, interpolado
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const top = hash2(ix, iy + 1) + (hash2(ix + 1, iy + 1) - hash2(ix, iy + 1)) * sx;
  const bottom = hash2(ix, iy) + (hash2(ix + 1, iy) - hash2(ix, iy)) * sx;
  return bottom + (top - bottom) * sy;
}
const RIVETS = [[30, 30], [354, 30], [30, 226], [354, 226]];
const CENTER = [192, 128];
// Distancia con signo a un rectángulo de esquinas redondeadas (lección «Tu primer fragment shader»)
function roundedBox(x, y, halfW, halfH, radius) {
  const qx = Math.abs(x) - (halfW - radius);
  const qy = Math.abs(y) - (halfH - radius);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius;
}
function heightAt(x, y) {
  const edge = -roundedBox(x - CENTER[0], y - CENTER[1], 182, 118, 14); // > 0 dentro de la placa
  if (edge <= 0) return { height: 0, plate: false };
  let height = 6 * Math.sin((Math.min(edge, 12) / 12) * (Math.PI / 2)); // el bisel del borde
  for (const [rx, ry] of RIVETS) {
    const d = Math.hypot(x - rx, y - ry);
    if (d < 11) height += 0.8 * Math.sqrt(121 - d * d); // un remache: media esfera
  }
  const d = Math.hypot(x - CENTER[0], y - CENTER[1]);
  if (Math.abs(d - 70) < 9) height += Math.sqrt(81 - (d - 70) ** 2); // el anillo grueso
  if (Math.abs(d - 50) < 3) height += 0.7 * Math.sqrt(9 - (d - 50) ** 2); // y uno fino
  if (d > 85) height += 0.5 * valueNoise(x / 6, y / 6); // martillo, fuera del medallón
  return { height, plate: true };
}
function buildNormalMap(strength = 1) {
  const heights = new Float32Array(MAP_WIDTH * MAP_HEIGHT);
  const plate = new Uint8Array(MAP_WIDTH * MAP_HEIGHT);
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const sample = heightAt(x + 0.5, y + 0.5);
      heights[y * MAP_WIDTH + x] = sample.height;
      plate[y * MAP_WIDTH + x] = sample.plate ? 255 : 0;
    }
  }
  const at = (x, y) => heights[Math.min(MAP_HEIGHT - 1, Math.max(0, y)) * MAP_WIDTH + Math.min(MAP_WIDTH - 1, Math.max(0, x))];
  const bytes = new Uint8Array(MAP_WIDTH * MAP_HEIGHT * 4); // fila 0 = la de abajo: y hacia arriba
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength; // cuánto sube hacia la derecha
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength; // y hacia arriba
      const length = Math.hypot(dx, dy, 2);
      const i = (y * MAP_WIDTH + x) * 4;
      bytes[i] = Math.round((-dx / length * 0.5 + 0.5) * 255);
      bytes[i + 1] = Math.round((-dy / length * 0.5 + 0.5) * 255);
      bytes[i + 2] = Math.round((2 / length * 0.5 + 0.5) * 255);
      bytes[i + 3] = plate[y * MAP_WIDTH + x];
    }
  }
  return bytes;
}

// --- La luz, en JavaScript (para la autocomprobación) ---------------------------------------------
const BRASS = [0.78, 0.6, 0.32];
const WOOD = [0.2, 0.12, 0.07];
const normalize = (v) => {
  const length = Math.hypot(...v);
  return v.map((c) => c / length);
};
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const mix = (a, b, t) => a + (b - a) * t;
function shadePixel(bytes, toLight, useMap = true) {
  const plate = bytes[3] / 255;
  const normal = useMap ? normalize(bytes.slice(0, 3).map((b) => (b / 255) * 2 - 1)) : [0, 0, 1];
  const distance2 = dot3(toLight, toLight);
  const l = normalize(toLight);
  const h = normalize([l[0], l[1], l[2] + 1]); // a medio camino entre la luz y la cámara (arriba)
  const diffuse = Math.max(dot3(normal, l), 0);
  const specular = Math.max(dot3(normal, h), 0) ** mix(8, 48, plate) * mix(0.08, 0.5, plate);
  const attenuation = 1 / (1 + 1.5 * distance2);
  return [0, 1, 2].map((c) => Math.round(Math.min(1, Math.max(0,
    mix(WOOD[c], BRASS[c], plate) * (0.12 + 0.88 * diffuse * attenuation) + specular * attenuation)) * 255));
}

// --- La GPU ----------------------------------------------------------------------------------------
const VERTEX = `#version 300 es
layout(location = 0) in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
const FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D u_normals; // rgb: la normal codificada; a: 1 latón, 0 madera
uniform vec3 u_light;        // la luz: x, y en uv; z, su altura sobre la placa
uniform float u_aspect;      // ancho / alto, para medir distancias sin deformar
uniform bool u_useMap;
in vec2 v_uv;
out vec4 outColor;
const vec3 BRASS = vec3(0.78, 0.6, 0.32);
const vec3 WOOD = vec3(0.2, 0.12, 0.07);
void main() {
  vec4 texel = texture(u_normals, v_uv);
  vec3 normal = u_useMap ? normalize(texel.rgb * 2.0 - 1.0) : vec3(0.0, 0.0, 1.0);
  vec3 toLight = vec3(u_light.xy * vec2(u_aspect, 1.0), u_light.z) - vec3(v_uv * vec2(u_aspect, 1.0), 0.0);
  vec3 l = normalize(toLight);
  vec3 h = normalize(l + vec3(0.0, 0.0, 1.0));
  float diffuse = max(dot(normal, l), 0.0);
  float specular = pow(max(dot(normal, h), 0.0), mix(8.0, 48.0, texel.a)) * mix(0.08, 0.5, texel.a);
  float attenuation = 1.0 / (1.0 + 1.5 * dot(toLight, toLight));
  vec3 color = mix(WOOD, BRASS, texel.a) * (0.12 + 0.88 * diffuse * attenuation) + specular * attenuation;
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`;

const statusLine = document.querySelector('#status');
function say(text) {
  statusLine.textContent = text;
  console.log(text);
}
const normalBytes = buildNormalMap();
const texelAt = (x, y) => normalBytes.slice((y * MAP_WIDTH + x) * 4, (y * MAP_WIDTH + x) * 4 + 4); // 4 bytes
const canvas = document.querySelector('#plate');
const useMapBox = document.querySelector('#use-map');
const heightInput = document.querySelector('#height');
const light = { x: 0.3, y: 0.7, z: heightInput.valueAsNumber };

const view = createView(canvas, {
  setup(gl) {
    return {
      quad: createQuad(gl),
      program: createProgram(gl, { name: 'placa', vertex: VERTEX, fragment: FRAGMENT }),
      normals: createTexture(gl, { width: MAP_WIDTH, height: MAP_HEIGHT, data: normalBytes }),
    };
  },
  render(gl, res) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, res.normals);
    res.program.set({ u_normals: 0, u_light: [light.x, light.y, light.z], u_aspect: canvas.width / canvas.height, u_useMap: useMapBox.checked });
    gl.bindVertexArray(res.quad);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  },
  onStatus(status) {
    say(status === 'lost' ? '⚠️ contexto WebGL perdido: la placa vuelve en cuanto se recupere' : '✅ contexto recuperado: mapa de normales subido de nuevo');
  },
});

// La prueba: la luz justo encima del píxel central (así el resultado no depende del tamaño del
// lienzo), se dibuja, se lee y se compara con shadePixel(); después, la luz vuelve a su sitio.
function selfTest() {
  if (!view.resources) return 'prueba pendiente: no hay contexto';
  const px = Math.floor(canvas.width / 2);
  const py = Math.floor(canvas.height / 2);
  const saved = { ...light };
  Object.assign(light, { x: (px + 0.5) / canvas.width, y: (py + 0.5) / canvas.height });
  view.renderNow();
  const gpu = readPixel(view.gl, px, py).slice(0, 3);
  Object.assign(light, saved);
  view.renderNow();
  const expected = shadePixel(texelAt(MAP_WIDTH / 2, MAP_HEIGHT / 2), [0, 0, light.z], useMapBox.checked);
  const ok = gpu.every((v, i) => Math.abs(v - expected[i]) <= 1);
  return `autocomprobación: luz encima del centro (altura ${light.z.toFixed(1)}) → ${expected.join(', ')} (JavaScript) · GPU ${ok ? '✅' : `❌ ${gpu.join(', ')}`}`;
}

// --- Mover la luz: puntero, flechas, altura, recorrido ---------------------------------------------
const lightLine = () => `💡 luz en (${light.x.toFixed(2)}, ${light.y.toFixed(2)}) · altura ${light.z.toFixed(1)}`;
canvas.addEventListener('pointermove', (event) => {
  const box = canvas.getBoundingClientRect();
  light.x = (event.clientX - box.left) / box.width;
  light.y = 1 - (event.clientY - box.top) / box.height; // la y de la pantalla baja; la de uv sube
  statusLine.textContent = lightLine(); // solo en la página: la consola se llenaría
  view.invalidate();
});
canvas.addEventListener('keydown', (event) => {
  const moves = { ArrowLeft: [-0.05, 0], ArrowRight: [0.05, 0], ArrowUp: [0, 0.05], ArrowDown: [0, -0.05] };
  if (!moves[event.key]) return;
  event.preventDefault();
  light.x = Math.min(1, Math.max(0, Math.round((light.x + moves[event.key][0]) * 100) / 100));
  light.y = Math.min(1, Math.max(0, Math.round((light.y + moves[event.key][1]) * 100) / 100));
  view.invalidate();
  say(lightLine());
});
heightInput.addEventListener('input', () => {
  light.z = heightInput.valueAsNumber;
  document.querySelector('#height-value').textContent = light.z.toFixed(1);
  view.invalidate();
});
heightInput.addEventListener('change', () => say(selfTest()));
useMapBox.addEventListener('change', () => {
  view.invalidate();
  say(useMapBox.checked
    ? `mapa de normales: activado → ${selfTest()}`
    : 'mapa de normales: desactivado → la misma placa, plana: 4 vértices y ningún relieve');
});

const tourButton = document.querySelector('#tour');
let tourStart = { ...light };
const tour = createAnimation({
  frame(seconds) {
    const angle = (seconds / 6) * 2 * Math.PI; // una vuelta en 6 s alrededor del centro
    light.x = 0.5 + 0.38 * Math.cos(angle + Math.PI);
    light.y = 0.5 + 0.38 * Math.sin(angle + Math.PI);
    view.renderNow();
    return seconds < 6;
  },
  onStop(reason) {
    Object.assign(light, tourStart);
    view.renderNow();
    tourButton.setAttribute('aria-pressed', 'false');
    say(reason === 'done' ? '⏹ recorrido terminado: la luz vuelve a su sitio' : '⏹ recorrido parado');
  },
});
tourButton.addEventListener('click', () => {
  if (tour.running) return tour.stop();
  tourStart = { ...light };
  if (tour.start() === 'reduced') return say('movimiento reducido: la luz no se mueve sola; usa el puntero o las flechas');
  tourButton.setAttribute('aria-pressed', 'true');
  say('▶ la luz da una vuelta alrededor de la placa (6 s)');
});

say(`placa → 4 vértices · mapa de normales de ${MAP_WIDTH} × ${MAP_HEIGHT} = ${normalBytes.length} bytes, calculado en JavaScript`);
say(`normal del centro (plano) → bytes ${texelAt(MAP_WIDTH / 2, MAP_HEIGHT / 2).join(', ')} = (0, 0, 1)`);
say(selfTest());
say('Listo: mueve el puntero o las flechas para mover la luz; desmarca «Mapa de normales»');
```
