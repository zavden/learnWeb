---
example_description: "Un componente web <shader-banner> con un fondo de shader detrás de su contenido: Shadow DOM con un slot, un atributo colors observado, un fotograma quieto al cargar y una animación de 20 s como máximo con su propio botón (que se para al salir de la vista, al ocultar la página o con «reducir movimiento» no arranca). Gestiona su contexto WebGL como un recurso: lo libera al desconectarse, muestra un degradado de CSS mientras está perdido y, al recuperarlo (WEBGL_lose_context), crea todo de nuevo y comprueba con readPixels que el dibujo es el mismo"
example_tags: "javascript|webgl2|web-components|shadow-dom|contexto-perdido|webgl-lose-context|intersection-observer|reduced-motion|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="events">
  <h1>Agenda cultural</h1>
  <shader-banner id="jazz" label="Festival de jazz" colors="#1e1b4b #be185d #f59e0b">
    <h2>Festival de jazz de Coyoacán</h2>
    <p>Del 14 al 16 de noviembre · Jardín Centenario · entrada libre</p>
  </shader-banner>
  <div id="books-slot">
    <shader-banner id="books" label="Feria del libro" colors="#042f2e #0f766e #a3e635">
      <h2>Feria del libro del Zócalo</h2>
      <p>Del 7 al 16 de octubre · 300 editoriales · charlas cada hora</p>
    </shader-banner>
  </div>
  <fieldset class="panel">
    <legend>Probar el componente</legend>
    <div class="colors">
      <label>Color 1 <input id="color-0" type="color" value="#1e1b4b"></label>
      <label>Color 2 <input id="color-1" type="color" value="#be185d"></label>
      <label>Color 3 <input id="color-2" type="color" value="#f59e0b"></label>
    </div>
    <button id="lose" type="button">Simular pérdida del contexto (jazz)</button>
    <button id="toggle-books" type="button">Quitar la feria del libro</button>
  </fieldset>
  <ol id="log" class="log" aria-live="polite"></ol>
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
.events {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
shader-banner {
  margin-bottom: 0.75rem;
}
shader-banner h2 {
  margin: 0 0 0.3rem;
  font-size: 1.15rem;
}
shader-banner p {
  margin: 0;
  font-size: 0.9rem;
}
.panel {
  display: grid;
  gap: 0.5rem;
  justify-items: start;
  border: 1px solid #475569;
}
.colors {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
button,
input {
  font: inherit;
}
button {
  padding: 0.25rem 0.7rem;
}
button:focus-visible,
input:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.75rem;
}
```

# JavaScript

```javascript
// <shader-banner>: un componente con un fondo de shader.
//
// Decisiones de diseño:
// - El contenido es HTML normal (el slot): se lee, se selecciona y se traduce. El lienzo es
//   decoración (aria-hidden) y una capa oscura detrás del texto mantiene el contraste.
// - Un contexto WebGL por cartel, y es un recurso limitado (Chrome mantiene unos 16): se crea
//   en connectedCallback y se libera en disconnectedCallback (view.destroy() de GLKit:
//   loseContext, fuera observadores y oyentes). Quitar el cartel no deja nada vivo.
// - El contexto se puede perder en cualquier momento. Mientras tanto, el cartel muestra un
//   degradado de CSS con sus mismos colores (data-gl="off"); al recuperarlo, setup() vuelve a
//   crear el programa y el búfer, y se comprueba con readPixels que el dibujo es el mismo.
// - Sin bucles por defecto: un fotograma quieto. ▶ anima como mucho 20 s; se para al salir de
//   la vista (IntersectionObserver con root: document, el viewport de este iframe), al ocultar
//   la página, y con «reducir movimiento» no arranca.
// - Habla con la página con eventos «banner-status» que suben por el DOM; la página los anota.
//
// Usa assets/gl/kit.js (léelo con «Assets»).
// Alcance: HTML, CSS, JavaScript, DOM, eventos, observadores, componentes web y este módulo.
import { createView, createProgram, createQuad, createAnimation, readPixel, GLKitError } from './gl/kit.js';

const MAX_SECONDS = 20;
const VERTEX = `#version 300 es
layout(location = 0) in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_colors[3];
out vec4 outColor;
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) { // ruido de valor: azar en una rejilla, interpolado
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = vec2(uv.x * u_resolution.x / u_resolution.y, uv.y); // unidades cuadradas
  float t = u_time * 0.15;
  float n = 0.6 * noise(p * 1.5 + vec2(t, -0.5 * t)) + 0.3 * noise(p * 3.0 - vec2(0.7 * t, 0.0)) + 0.1 * noise(p * 6.0 + t);
  float band = uv.x * 0.7 + n * 0.6; // de izquierda a derecha, con ondas
  vec3 color = mix(u_colors[0], u_colors[1], smoothstep(0.1, 0.6, band));
  outColor = vec4(mix(color, u_colors[2], smoothstep(0.55, 1.0, band)), 1.0);
}`;

const TEMPLATE = `
<style>
  :host {
    display: block;
    position: relative;
    overflow: hidden;
    border-radius: 0.6rem;
    color: #f8fafc;
    background: var(--fallback, #1e1b4b); /* lo que se ve sin WebGL o con el contexto perdido */
  }
  canvas {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
  }
  :host([data-gl="off"]) canvas {
    visibility: hidden;
  }
  .content {
    position: relative;
    padding: 1.1rem 6.5rem 1.1rem 1rem;
    /* una capa oscura detrás del texto: con 0.55 o más, el blanco pasa de 4.5:1 sobre cualquier color del cartel */
    background: linear-gradient(90deg, rgb(2 6 23 / 0.8), rgb(2 6 23 / 0.55) 75%, rgb(2 6 23 / 0.25));
  }
  .toggle {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    font: inherit;
    font-size: 0.8rem;
    padding: 0.2rem 0.55rem;
    color: #f8fafc;
    background: #0f172a;
    border: 1px solid #94a3b8;
    border-radius: 0.3rem;
  }
  .toggle:focus-visible {
    outline: 3px solid #60a5fa;
    outline-offset: 2px;
  }
</style>
<div class="content"><slot></slot></div>
<button class="toggle" type="button" aria-pressed="false">▶ Animar</button>`;

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

class ShaderBanner extends HTMLElement {
  static observedAttributes = ['colors'];
  #canvas = null;
  #view = null;
  #animation = null;
  #observer = null;
  #releasedGl = null; // el contexto del último canvas liberado, para comprobarlo
  #time = 0;          // el tiempo del shader: solo avanza mientras se anima
  #startTime = 0;
  #before = null;     // el píxel central antes de una pérdida simulada
  #button;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = TEMPLATE;
    this.#button = this.shadowRoot.querySelector('.toggle');
    this.#button.addEventListener('click', () => this.toggle());
  }

  get label() {
    return this.getAttribute('label') ?? 'cartel';
  }
  get colors() {
    const hexes = (this.getAttribute('colors') ?? '').trim().split(/\s+/).filter((hex) => /^#[0-9a-f]{6}$/i.test(hex));
    return hexes.length === 3 ? hexes : ['#1e1b4b', '#be185d', '#f59e0b'];
  }
  // ¿Se liberó el contexto al desconectarse?
  get released() {
    return this.#releasedGl?.isContextLost() ?? false;
  }

  connectedCallback() {
    this.#updateFallback();
    this.#canvas = document.createElement('canvas');
    this.#canvas.setAttribute('aria-hidden', 'true');
    this.shadowRoot.prepend(this.#canvas);
    try {
      this.#view = createView(this.#canvas, {
        setup: (gl) => ({ quad: createQuad(gl), program: createProgram(gl, { name: 'shader-banner', vertex: VERTEX, fragment: FRAGMENT }) }),
        render: (gl, res) => this.#render(gl, res),
        onStatus: (status) => this.#onStatus(status),
      });
    } catch (error) {
      if (!(error instanceof GLKitError)) throw error;
      this.dataset.gl = 'off'; // sin WebGL2: el degradado de CSS, y el cartel sigue funcionando
      this.#button.hidden = true;
      this.#emit(`«${this.label}»: sin WebGL2 → fondo de CSS`);
      return;
    }
    this.dataset.gl = 'on';
    this.#animation = createAnimation({
      frame: (seconds) => {
        this.#time = this.#startTime + seconds;
        this.#view.renderNow();
        return seconds < MAX_SECONDS;
      },
      onStop: (reason) => this.#stopped(reason),
    });
    this.#observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) this.#animation?.stop('offscreen');
    }, { root: document });
    this.#observer.observe(this);
    this.#view.renderNow();
    this.#emit(`🎨 «${this.label}» → WebGL2 · 1 dibujo (fotograma quieto)`);
  }

  disconnectedCallback() {
    this.#animation?.destroy();
    this.#observer?.disconnect();
    this.#releasedGl = this.#view?.gl ?? null;
    this.#view?.destroy(); // loseContext: el contexto deja de contar para el límite
    this.#canvas?.remove();
    this.#view = this.#animation = this.#observer = this.#canvas = null;
  }

  attributeChangedCallback() {
    this.#updateFallback();
    this.#view?.invalidate();
  }

  toggle() {
    if (!this.#animation) return;
    if (this.#animation.running) return this.#animation.stop('stopped');
    this.#startTime = this.#time;
    if (this.#animation.start() === 'reduced') return this.#emit(`«${this.label}»: movimiento reducido, el fondo no se anima`);
    this.#button.textContent = '⏸ Parar';
    this.#button.setAttribute('aria-pressed', 'true');
    this.#emit(`▶ «${this.label}»: animando (${MAX_SECONDS} s como máximo)`);
  }

  // Para probar la recuperación: guarda el píxel central y pierde el contexto 800 ms
  simulateContextLoss() {
    if (!this.#view?.renderNow()) return false;
    this.#animation.stop('stopped');
    this.#before = this.#centre();
    return this.#view.simulateContextLoss(800);
  }

  #centre() {
    const { gl } = this.#view;
    return readPixel(gl, gl.drawingBufferWidth / 2, gl.drawingBufferHeight / 2);
  }
  #render(gl, { quad, program }) {
    program.set({
      u_resolution: [gl.drawingBufferWidth, gl.drawingBufferHeight],
      u_time: this.#time,
      u_colors: this.colors.flatMap(hexToRgb),
    });
    gl.bindVertexArray(quad);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  #onStatus(status) {
    if (status === 'lost') {
      this.dataset.gl = 'off';
      this.#animation?.stop('lost');
      this.#emit(`⚠️ «${this.label}»: contexto perdido → fondo de CSS`);
      return;
    }
    this.dataset.gl = 'on';
    this.#view.renderNow();
    const same = this.#before ? this.#centre().every((v, i) => v === this.#before[i]) : 'sin datos';
    this.#emit(`✅ «${this.label}»: contexto recuperado → programa y búfer creados de nuevo · ¿el mismo dibujo que antes? ${same}`);
  }
  #stopped(reason) {
    this.#button.textContent = '▶ Animar';
    this.#button.setAttribute('aria-pressed', 'false');
    this.#startTime = this.#time;
    const why = { done: `${MAX_SECONDS} s, se para solo`, hidden: 'página oculta', offscreen: 'fuera de la vista', stopped: 'parado', lost: 'contexto perdido' }[reason];
    if (why) this.#emit(`⏸ «${this.label}»: ${why}`);
  }
  #updateFallback() {
    this.style.setProperty('--fallback', `linear-gradient(110deg, ${this.colors.join(', ')})`);
  }
  #emit(text) {
    this.dispatchEvent(new CustomEvent('banner-status', { bubbles: true, detail: { text } }));
  }
}

// --- La página -------------------------------------------------------------------------------------
const logList = document.querySelector('#log');
function log(text) {
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
  console.log(text);
}
document.addEventListener('banner-status', (event) => log(event.detail.text)); // antes de define()
customElements.define('shader-banner', ShaderBanner); // los carteles del HTML se activan aquí

const jazz = document.querySelector('#jazz');
const books = document.querySelector('#books');
const colorInputs = [0, 1, 2].map((i) => document.querySelector(`#color-${i}`));
for (const input of colorInputs) {
  input.addEventListener('input', () => jazz.setAttribute('colors', colorInputs.map(({ value }) => value).join(' ')));
  input.addEventListener('change', () => log(`🎨 «${jazz.label}» → colores ${jazz.colors.join(' ')}`));
}
document.querySelector('#lose').addEventListener('click', () => {
  if (!jazz.simulateContextLoss()) log('WEBGL_lose_context no está disponible (o el contexto ya está perdido)');
});
const toggleBooks = document.querySelector('#toggle-books');
toggleBooks.addEventListener('click', () => {
  if (books.isConnected) {
    books.remove(); // disconnectedCallback
    toggleBooks.textContent = 'Volver a poner la feria';
    log(`🧹 «${books.label}»: quitada → ¿contexto liberado? ${books.released}`);
  } else {
    document.querySelector('#books-slot').append(books); // connectedCallback: un contexto nuevo
    toggleBooks.textContent = 'Quitar la feria del libro';
  }
});
log('Listo: pulsa ▶ en un cartel, cambia los colores, simula una pérdida del contexto o quita la feria');
```
