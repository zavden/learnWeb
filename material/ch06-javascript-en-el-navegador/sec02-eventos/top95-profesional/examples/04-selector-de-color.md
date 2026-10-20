---
example_description: "Un selector de color HSL sin canvas: un área de saturación y luminosidad y una tira de tono hechas con Pointer Events (captura, medidas al empezar) y con teclado (flechas, Shift para pasos de 10, RePág/AvPág, Inicio/Fin); avisa con color:change y calcula el contraste WCAG con blanco y negro"
example_tags: "javascript|eventos|profesional|color|pointer-events|slider|customevent|contraste"
example_stage: professional
example_importance: useful
console: true
---

# HTML

```html
<main class="picker-page">
  <h1>Color de la etiqueta del café</h1>
  <div class="picker" id="picker">
    <div class="area" id="sl-area" role="slider" tabindex="0"
      aria-label="Saturación (flechas izquierda y derecha) y luminosidad (flechas arriba y abajo)"
      aria-valuemin="0" aria-valuemax="100">
      <span class="marker" aria-hidden="true"></span>
    </div>
    <div class="hue" id="hue-strip" role="slider" tabindex="0" aria-label="Tono"
      aria-valuemin="0" aria-valuemax="360" aria-orientation="horizontal">
      <span class="marker" aria-hidden="true"></span>
    </div>
  </div>
  <section class="preview" aria-labelledby="preview-title">
    <h2 id="preview-title">Vista previa</h2>
    <p id="label-preview" class="label-preview">Café de Chiapas · tueste medio</p>
    <dl class="readout">
      <dt>Hex</dt><dd><output id="hex">—</output></dd>
      <dt>HSL</dt><dd><output id="hsl">—</output></dd>
      <dt>Contraste con blanco</dt><dd><output id="contrast-white">—</output></dd>
      <dt>Contraste con negro</dt><dd><output id="contrast-black">—</output></dd>
    </dl>
  </section>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root {
  --ink: #1f2933;
  --muted: #52606d;
  --line: #cbd2d9;
  --surface: #ffffff;
  --page: #f5f7fa;
  --accent: #1d4ed8;
  --hue: 24;
  --swatch: #cf6017;
  --swatch-text: #000000;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: var(--ink);
  background: var(--page);
}
.picker-page {
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.25rem;
  margin-top: 0;
}
h2 {
  font-size: 1rem;
  margin: 0 0 0.5rem;
}
.picker {
  display: grid;
  gap: 0.75rem;
}
/* El plano HSL: a la derecha más saturado; arriba blanco, abajo negro. */
.area {
  position: relative;
  height: 10rem;
  border-radius: 0.5rem;
  background:
    linear-gradient(to bottom, #ffffff, transparent 50%, transparent 50%, #000000),
    linear-gradient(to right, hsl(var(--hue) 0% 50%), hsl(var(--hue) 100% 50%));
  cursor: crosshair;
  touch-action: none;
}
.hue {
  position: relative;
  height: 1.25rem;
  border-radius: 0.6rem;
  background: linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000);
  cursor: ew-resize;
  touch-action: none;
}
.marker {
  position: absolute;
  width: 1.1rem;
  height: 1.1rem;
  translate: -50% -50%;
  border: 3px solid #ffffff;
  border-radius: 50%;
  box-shadow: 0 0 0 1px #000000;
  pointer-events: none;
}
.hue .marker {
  top: 50%;
}
.area:focus-visible,
.hue:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}
.preview {
  margin-top: 1rem;
  padding: 0.75rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: var(--surface);
}
.label-preview {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: var(--swatch);
  color: var(--swatch-text);
  font-weight: 700;
}
.readout {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.2rem 1rem;
  margin: 0;
}
.readout dd {
  margin: 0;
  font-family: Menlo, Consolas, monospace;
}
.log {
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: var(--surface);
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Selector de color HSL con Pointer Events y teclado.
//
// Decisiones de diseño:
// - Dos controles con role="slider". El área es bidimensional: las flechas ←
//   → cambian la saturación y ↑ ↓ la luminosidad, y aria-valuetext lo dice
//   con palabras (aria-valuenow es la saturación).
// - Un mismo «arrastrable» para los dos: setPointerCapture en pointerdown y el
//   rectángulo medido UNA vez al empezar; cada pointermove solo hace cuentas.
// - El selector no sabe quién usa el color: avisa con color:change, y la vista
//   previa y el registro se suscriben. El registro solo anota los valores
//   «confirmados» (al soltar o con el teclado), no cada pointermove.
// - Contraste según WCAG 2: luminancia relativa de cada color y
//   (L1 + 0,05) / (L2 + 0,05); 4,5:1 para texto normal.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM y este módulo.

const logList = document.querySelector('#log');
let quiet = false;
function logLine(text) {
  if (quiet) return;
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// ── Color: funciones puras.
function hslToRgb(h, s, l) {
  const sat = s / 100;
  const light = l / 100;
  const amount = sat * Math.min(light, 1 - light);
  const channel = (n) => {
    const k = (n + h / 30) % 12;
    return Math.round((light - amount * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255);
  };
  return [channel(0), channel(8), channel(4)];
}
const toHex = (rgb) => `#${rgb.map((value) => value.toString(16).padStart(2, '0')).join('')}`;
function luminance(rgb) {
  const [r, g, b] = rgb.map((value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(rgbA, rgbB) {
  const [light, dark] = [luminance(rgbA), luminance(rgbB)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

// ── El selector.
function createColorPicker(root, initial) {
  const color = { ...initial };
  const area = root.querySelector('#sl-area');
  const hue = root.querySelector('#hue-strip');
  const clamp = (value, max) => Math.round(Math.min(max, Math.max(0, value)));

  function render() {
    root.style.setProperty('--hue', color.h);
    area.querySelector('.marker').style.left = `${color.s}%`;
    area.querySelector('.marker').style.top = `${100 - color.l}%`;
    hue.querySelector('.marker').style.left = `${(color.h / 360) * 100}%`;
    area.setAttribute('aria-valuenow', color.s);
    area.setAttribute('aria-valuetext', `saturación ${color.s} %, luminosidad ${color.l} %`);
    hue.setAttribute('aria-valuenow', color.h);
    hue.setAttribute('aria-valuetext', `${color.h} grados`);
  }
  function emit(committed) {
    render();
    const rgb = hslToRgb(color.h, color.s, color.l);
    root.dispatchEvent(new CustomEvent('color:change', {
      bubbles: true,
      detail: { ...color, rgb, hex: toHex(rgb), committed },
    }));
  }

  // Arrastrar en el área o en la tira: la misma técnica para los dos.
  function makeDraggable(element, update) {
    let box = null;
    element.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      element.setPointerCapture(event.pointerId);
      box = element.getBoundingClientRect(); // medido una vez
      update(event, box);
      emit(false);
    });
    element.addEventListener('pointermove', (event) => {
      if (!box) return;
      update(event, box);
      emit(false);
    });
    element.addEventListener('pointerup', () => {
      if (box) emit(true);
      box = null;
    });
    element.addEventListener('lostpointercapture', () => { box = null; });
  }
  makeDraggable(area, (event, box) => {
    color.s = clamp(((event.clientX - box.left) / box.width) * 100, 100);
    color.l = clamp(100 - ((event.clientY - box.top) / box.height) * 100, 100);
  });
  makeDraggable(hue, (event, box) => {
    color.h = clamp(((event.clientX - box.left) / box.width) * 360, 360);
  });

  // Teclado.
  area.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? 10 : 1;
    const changes = { ArrowRight: ['s', step], ArrowLeft: ['s', -step], ArrowUp: ['l', step], ArrowDown: ['l', -step] };
    if (!(event.key in changes)) return;
    event.preventDefault();
    const [key, delta] = changes[event.key];
    color[key] = clamp(color[key] + delta, 100);
    emit(true);
  });
  hue.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? 10 : 1;
    const targets = {
      ArrowRight: color.h + step, ArrowUp: color.h + step, ArrowLeft: color.h - step, ArrowDown: color.h - step,
      PageUp: color.h + 30, PageDown: color.h - 30, Home: 0, End: 360,
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    color.h = clamp(targets[event.key], 360);
    emit(true);
  });

  emit(true);
  return { get color() { return { ...color }; }, set(next) { Object.assign(color, next); emit(true); } };
}

// ── Quien usa el color: la vista previa de la etiqueta.
const page = document.querySelector('.picker-page');
page.addEventListener('color:change', (event) => {
  const { h, s, l, rgb, hex, committed } = event.detail;
  const onWhite = contrast(rgb, [255, 255, 255]);
  const onBlack = contrast(rgb, [0, 0, 0]);
  document.documentElement.style.setProperty('--swatch', hex);
  document.documentElement.style.setProperty('--swatch-text', onBlack >= onWhite ? '#000000' : '#ffffff');
  document.querySelector('#hex').textContent = hex;
  document.querySelector('#hsl').textContent = `hsl(${h} ${s}% ${l}%)`;
  document.querySelector('#contrast-white').textContent = `${onWhite.toFixed(2)}:1${onWhite >= 4.5 ? ' ✔ AA' : ''}`;
  document.querySelector('#contrast-black').textContent = `${onBlack.toFixed(2)}:1${onBlack >= 4.5 ? ' ✔ AA' : ''}`;
  if (committed) logLine(`🎨 ${hex} · hsl(${h} ${s}% ${l}%) · texto ${onBlack >= onWhite ? 'negro' : 'blanco'} (${Math.max(onWhite, onBlack).toFixed(2)}:1)`);
});

quiet = true; // el color inicial no va al registro
const picker = createColorPicker(document.querySelector('#picker'), { h: 24, s: 80, l: 45 });
quiet = false;

// ── Autocomprobación (cálculos y teclas simuladas; deja el color inicial).
function audit() {
  quiet = true;
  const results = [];
  const expect = (label, ok) => results.push(`${ok ? '✓' : '✗'} ${label}`);
  expect('hsl(0 100% 50%) → #ff0000', toHex(hslToRgb(0, 100, 50)) === '#ff0000');
  expect('el color inicial hsl(24 80% 45%) es #cf6017', document.querySelector('#hex').textContent === '#cf6017');
  expect('contraste de #1d4ed8 con blanco: 6.70:1', contrast([29, 78, 216], [255, 255, 255]).toFixed(2) === '6.70');
  const press = (element, key, shiftKey = false) => element.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true }));
  press(document.querySelector('#sl-area'), 'ArrowRight', true);
  expect('Shift + → en el área sube la saturación de 10 en 10 (80 → 90)', picker.color.s === 90);
  press(document.querySelector('#hue-strip'), 'PageUp');
  expect('RePág en la tira suma 30° al tono (24 → 54)', picker.color.h === 54);
  press(document.querySelector('#hue-strip'), 'End');
  expect('Fin lleva el tono a 360 y aria-valuenow lo refleja', document.querySelector('#hue-strip').getAttribute('aria-valuenow') === '360');
  picker.set({ h: 24, s: 80, l: 45 });
  quiet = false;
  console.log('Autocomprobación (simulada):');
  results.forEach((line) => console.log(`  ${line}`));
}
audit();
logLine('Listo: arrastra en el área y en la tira de tonos; o Tab hasta ellas y usa las flechas (con Shift, de 10 en 10)');
```
