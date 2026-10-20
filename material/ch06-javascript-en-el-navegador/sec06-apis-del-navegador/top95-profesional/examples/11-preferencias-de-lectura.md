---
example_description: "Preferencias de tema y movimiento que siguen al sistema operativo (matchMedia y su change, en vivo) salvo que la persona elija otra cosa: una clase Preferences extends EventTarget resuelve el valor efectivo, lo guarda con versión en localStorage, lo aplica con data-* y color-scheme, y avisa con un evento change a lo que el CSS no alcanza, como una gráfica en canvas y un carrusel de consejos animado"
example_tags: "javascript|matchmedia|prefers-color-scheme|prefers-reduced-motion|eventtarget|localstorage|canvas|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Preferencias de lectura</h1>
  <form id="settings" class="settings">
    <fieldset>
      <legend>Tema</legend>
      <label><input type="radio" name="theme" value="system" checked> Como el sistema</label>
      <label><input type="radio" name="theme" value="light"> Claro</label>
      <label><input type="radio" name="theme" value="dark"> Oscuro</label>
    </fieldset>
    <fieldset>
      <legend>Movimiento</legend>
      <label><input type="radio" name="motion" value="system" checked> Como el sistema</label>
      <label><input type="radio" name="motion" value="reduce"> Reducido</label>
      <label><input type="radio" name="motion" value="full"> Completo</label>
    </fieldset>
    <p class="summary">Ahora: <output id="effective">—</output></p>
  </form>
  <section class="preview" aria-labelledby="preview-title">
    <h2 id="preview-title">Tazas servidas hoy</h2>
    <canvas id="sparkline" width="300" height="80" role="img" aria-label="Tazas por hora, de 8 a 19 h: sube hasta las 13 h y baja por la tarde"></canvas>
    <div class="tips">
      <p id="tip" class="tip" aria-live="polite">Muele el café justo antes de prepararlo.</p>
      <button id="next-tip" type="button">Otro consejo</button>
    </div>
  </section>
</main>
```

# CSS

```css
:root {
  color-scheme: light;
  --text: #1f2933;
  --muted: #52606d;
  --page: #f5f7fa;
  --panel: #ffffff;
  --line: #7b8794;
  --focus: #1d4ed8;
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --text: #e5e7eb;
  --muted: #9aa5b1;
  --page: #111827;
  --panel: #1f2933;
  --line: #9aa5b1;
  --focus: #93c5fd;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: var(--text);
  background: var(--page);
}
main {
  max-width: 36rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  margin: 0 0 0.75rem;
  font-size: 1.25rem;
}
.settings {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
fieldset {
  display: grid;
  gap: 0.2rem;
  margin: 0;
  padding: 0.4rem 0.75rem 0.6rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
}
.summary {
  flex-basis: 100%;
  margin: 0;
  color: var(--muted);
}
.preview {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--line);
  border-radius: 0.75rem;
  background: var(--panel);
}
.preview h2 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}
#sparkline {
  display: block;
  width: 300px;
  max-width: 100%;
  height: 80px;
}
.tips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
}
.tip {
  flex: 1 1 14rem;
  margin: 0.5rem 0 0;
}
button {
  font: inherit;
  padding: 0.3rem 0.7rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: var(--panel);
  color: var(--text);
  cursor: pointer;
}
button:focus-visible,
input:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// PREFERENCIAS QUE SIGUEN AL SISTEMA (SALVO QUE ELIJAS).
//
// Decisiones de diseño:
// - Preferences extends EventTarget: un objeto de la app que guarda lo que la
//   persona ELIGE (system/light/dark, system/reduce/full) y calcula lo que
//   VALE (light/dark, reduce/full) con resolve(), una función pura.
// - Las preferencias del sistema se leen con matchMedia y se escuchan con su
//   evento change: con «Como el sistema», cambiar macOS a modo oscuro con la
//   página abierta se nota al momento. Si elegiste otra cosa, el sistema no
//   manda.
// - Se guarda un objeto con versión en localStorage (lw-apis-preferencias) y
//   se valida al leerlo: un valor desconocido vuelve a «system».
// - Aplicar: data-theme en <html> (el CSS pone los colores y color-scheme) y
//   un evento change para lo que el CSS no alcanza: la gráfica de canvas lee
//   su paleta y el carrusel de consejos decide si anima.
// - Para probarla sin tocar el sistema, recibe las listas de matchMedia como
//   parámetro: las comprobaciones le pasan unas falsas.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos, red y
// almacenamiento, gráficos y animación, y este módulo.

const OPTIONS = { theme: ['system', 'light', 'dark'], motion: ['system', 'reduce', 'full'] };

function resolve(settings, os) {
  return {
    theme: settings.theme === 'system' ? (os.dark ? 'dark' : 'light') : settings.theme,
    motion: settings.motion === 'system' ? (os.reduce ? 'reduce' : 'full') : settings.motion,
  };
}

class Preferences extends EventTarget {
  #key;
  #lists;
  settings = { theme: 'system', motion: 'system' };

  constructor({ key, dark, reduce }) {
    super();
    this.#key = key;
    this.#lists = { dark, reduce };
    this.settings = this.#read();
    this.effective = this.#compute();
    for (const list of [dark, reduce]) {
      list.addEventListener('change', () => this.#refresh('sistema'));
    }
  }
  choose(name, value) {
    if (!OPTIONS[name]?.includes(value)) return;
    this.settings = { ...this.settings, [name]: value };
    try {
      localStorage.setItem(this.#key, JSON.stringify({ version: 1, ...this.settings }));
    } catch {
      // sin almacenamiento, la preferencia dura lo que dure la página
    }
    this.#refresh('persona');
  }
  #read() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.#key));
      if (saved?.version !== 1) return { theme: 'system', motion: 'system' };
      return {
        theme: OPTIONS.theme.includes(saved.theme) ? saved.theme : 'system',
        motion: OPTIONS.motion.includes(saved.motion) ? saved.motion : 'system',
      };
    } catch {
      return { theme: 'system', motion: 'system' };
    }
  }
  #compute() {
    return resolve(this.settings, { dark: this.#lists.dark.matches, reduce: this.#lists.reduce.matches });
  }
  #refresh(source) {
    const next = this.#compute();
    if (next.theme === this.effective.theme && next.motion === this.effective.motion) return;
    this.effective = next;
    this.dispatchEvent(new CustomEvent('change', { detail: { ...next, source } }));
  }
}

// ── Comprobaciones al cargar (con listas falsas y una clave de prueba) ───
function audit(label, actual, expected) {
  if (actual === expected) console.log('✅', label, '→', actual);
  else console.error('❌', label, '→', actual, '(esperaba', expected, ')');
}
const fakeList = (matches) => Object.assign(new EventTarget(), { matches });
const TEST_KEY = 'lw-apis-preferencias-prueba';
localStorage.removeItem(TEST_KEY);
const describe = (effective) => `${effective.theme}/${effective.motion}`;
audit('resolve: sistema con SO oscuro · claro elegido con SO oscuro · sistema con SO que pide menos movimiento',
  [resolve({ theme: 'system', motion: 'system' }, { dark: true, reduce: false }), resolve({ theme: 'light', motion: 'system' }, { dark: true, reduce: false }), resolve({ theme: 'system', motion: 'system' }, { dark: false, reduce: true })].map(describe).join(' · '),
  'dark/full · light/full · light/reduce');
const osDark = fakeList(false);
const osReduce = fakeList(false);
const test = new Preferences({ key: TEST_KEY, dark: osDark, reduce: osReduce });
const heard = [];
test.addEventListener('change', (event) => heard.push(`${event.detail.theme} (${event.detail.source})`));
osDark.matches = true;
osDark.dispatchEvent(new Event('change'));
audit('con «Como el sistema», el cambio del SO llega como evento', heard.join(', '), 'dark (sistema)');
test.choose('theme', 'light');
osDark.matches = false;
osDark.dispatchEvent(new Event('change'));
osDark.matches = true;
osDark.dispatchEvent(new Event('change'));
audit('con «Claro» elegido, el SO ya no manda', heard.join(', '), 'dark (sistema), light (persona)');
audit('se guarda con versión', localStorage.getItem(TEST_KEY), '{"version":1,"theme":"light","motion":"system"}');
localStorage.setItem(TEST_KEY, JSON.stringify({ version: 1, theme: 'sepia', motion: 'reduce' }));
audit('un valor desconocido guardado vuelve a «system»', describe(new Preferences({ key: TEST_KEY, dark: osDark, reduce: osReduce }).settings), 'system/reduce');
localStorage.removeItem(TEST_KEY);

// ── La página ────────────────────────────────────────────────────────────
const preferences = new Preferences({
  key: 'lw-apis-preferencias',
  dark: matchMedia('(prefers-color-scheme: dark)'),
  reduce: matchMedia('(prefers-reduced-motion: reduce)'),
});
const form = document.querySelector('#settings');
const effectiveOutput = document.querySelector('#effective');
const NAMES = { light: 'tema claro', dark: 'tema oscuro', reduce: 'movimiento reducido', full: 'movimiento completo' };

function apply() {
  const { theme, motion } = preferences.effective;
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.motion = motion;
  effectiveOutput.textContent = `${NAMES[theme]} · ${NAMES[motion]}`;
  drawSparkline();
}
for (const [name, value] of Object.entries(preferences.settings)) {
  form.elements[name].value = value; // RadioNodeList: marca la opción guardada
}
form.addEventListener('change', (event) => preferences.choose(event.target.name, event.target.value));
preferences.addEventListener('change', (event) => {
  apply();
  console.log(`🎨 ${effectiveOutput.textContent} (lo decidió ${event.detail.source === 'sistema' ? 'el sistema' : 'la persona'})`);
});

// Consumidor 1: una gráfica de canvas, que no entiende de variables CSS.
const CUPS = [6, 14, 22, 18, 25, 31, 19, 15, 17, 21, 12, 7]; // de 8 a 19 h
function drawSparkline() {
  const canvas = document.querySelector('#sparkline');
  const dpr = devicePixelRatio;
  const width = 300;
  const height = 80;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const context = canvas.getContext('2d');
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  const dark = preferences.effective.theme === 'dark';
  context.fillStyle = dark ? '#1f2933' : '#ffffff';
  context.fillRect(0, 0, width, height);
  context.strokeStyle = dark ? '#fbbf24' : '#b45309';
  context.lineWidth = 2;
  const max = Math.max(...CUPS);
  context.beginPath();
  CUPS.forEach((cups, index) => {
    const x = 6 + (index / (CUPS.length - 1)) * (width - 12);
    const y = height - 6 - (cups / max) * (height - 12);
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.stroke();
}

// Consumidor 2: consejos que se deslizan… solo con movimiento completo.
const TIPS = [
  'Muele el café justo antes de prepararlo.',
  'Agua entre 90 y 96 °C: hirviendo, quema el café.',
  'Guarda el café en un bote opaco, lejos del refrigerador.',
  'Calienta la taza antes de servir.',
];
let tipIndex = 0;
document.querySelector('#next-tip').addEventListener('click', () => {
  tipIndex = (tipIndex + 1) % TIPS.length;
  const tip = document.querySelector('#tip');
  tip.textContent = TIPS[tipIndex];
  if (preferences.effective.motion === 'full') {
    tip.animate([{ opacity: 0, translate: '1.5rem 0' }, { opacity: 1, translate: '0 0' }], { duration: 300, easing: 'ease-out' });
  }
});

apply();
console.log('Listo: elige tema y movimiento (se recuerdan); con «Como el sistema», cambia el modo de macOS con la página abierta');
```
