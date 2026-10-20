---
example_description: "Comprobador de contraste WCAG: colores hex validados, luminancia relativa, ratio sin redondear hacia arriba y vista previa con custom properties"
example_tags: "javascript|profesional|accesibilidad|color|wcag|css"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>Comprobador de contraste</h1>
  <p class="intro">¿Se lee bien este texto sobre este fondo? Calcula el ratio de contraste según las pautas WCAG 2.</p>

  <form id="contrast-form" class="card colors" novalidate>
    <fieldset>
      <legend>Color del texto</legend>
      <div class="color-row">
        <label class="visually-hidden" for="fg-text">Color del texto en hexadecimal</label>
        <input id="fg-text" type="text" value="#777777" autocomplete="off" spellcheck="false"
               aria-describedby="fg-error">
        <label class="visually-hidden" for="fg-picker">Selector del color del texto</label>
        <input id="fg-picker" type="color" value="#777777">
      </div>
      <p id="fg-error" class="error" hidden></p>
    </fieldset>

    <fieldset>
      <legend>Color del fondo</legend>
      <div class="color-row">
        <label class="visually-hidden" for="bg-text">Color del fondo en hexadecimal</label>
        <input id="bg-text" type="text" value="#ffffff" autocomplete="off" spellcheck="false"
               aria-describedby="bg-error">
        <label class="visually-hidden" for="bg-picker">Selector del color del fondo</label>
        <input id="bg-picker" type="color" value="#ffffff">
      </div>
      <p id="bg-error" class="error" hidden></p>
    </fieldset>
  </form>

  <section class="card" aria-labelledby="result-title">
    <h2 id="result-title">Resultado</h2>
    <p class="ratio" aria-live="polite"><output id="ratio">—</output></p>

    <div id="preview" class="preview">
      <p class="preview__normal">Texto normal: el café de hoy viene de Huila, Colombia.</p>
      <p class="preview__large">Texto grande: 24 px</p>
    </div>

    <table class="checks">
      <caption>Niveles de conformidad</caption>
      <thead>
        <tr><th scope="col">Uso</th><th scope="col">Mínimo</th><th scope="col">Resultado</th></tr>
      </thead>
      <tbody>
        <tr><th scope="row">AA · texto normal</th><td>4,5 : 1</td><td id="check-aa-normal">—</td></tr>
        <tr><th scope="row">AA · texto grande</th><td>3 : 1</td><td id="check-aa-large">—</td></tr>
        <tr><th scope="row">AAA · texto normal</th><td>7 : 1</td><td id="check-aaa-normal">—</td></tr>
        <tr><th scope="row">AAA · texto grande</th><td>4,5 : 1</td><td id="check-aaa-large">—</td></tr>
        <tr><th scope="row">Iconos y bordes de controles</th><td>3 : 1</td><td id="check-ui">—</td></tr>
      </tbody>
    </table>
  </section>
</main>
```

# CSS

```css
:root {
  --text: #1b1f24;
  --muted: #545b66;
  --page: #f4f6f8;
  --surface: #ffffff;
  --border: #c4c9d0;
  --accent: #0b5cad;
  --error: #b3261e;
  --ok-text: #1a6b3c;
  --bad-text: #9b1c1c;
  /* Los cambia JavaScript con style.setProperty */
  --sample-fg: #777777;
  --sample-bg: #ffffff;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  line-height: 1.5;
  color: var(--text);
  background: var(--page);
}

.app {
  max-width: 44rem;
  margin: 0 auto;
  padding: 1.5rem 1rem 2.5rem;
  display: grid;
  gap: 1.25rem;
}

h1 {
  margin: 0;
  font-size: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);
}

h2 {
  margin-top: 0;
  font-size: 1.1rem;
}

.intro {
  margin: 0;
  color: var(--muted);
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.25rem;
}

.colors {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
}

fieldset {
  margin: 0;
  border: 0;
  padding: 0;
}

legend {
  font-weight: 600;
  margin-bottom: 0.35rem;
}

.color-row {
  display: flex;
  gap: 0.5rem;
}

input[type='text'] {
  flex: 1;
  min-width: 0;
  font: 1rem ui-monospace, 'SF Mono', Menlo, monospace;
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
}

input[type='color'] {
  inline-size: 3rem;
  block-size: 2.6rem;
  padding: 0.15rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--surface);
}

input:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

input[aria-invalid='true'] {
  border: 2px solid var(--error);
}

.error {
  margin: 0.3rem 0 0;
  color: var(--error);
  font-weight: 600;
  font-size: 0.9rem;
}

.ratio {
  margin: 0 0 1rem;
  font-size: 2rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.preview {
  color: var(--sample-fg);
  background: var(--sample-bg);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1rem;
}

.preview p {
  margin: 0;
}

.preview__large {
  margin-top: 0.5rem;
  font-size: 1.5rem;
}

.checks {
  width: 100%;
  margin-top: 1rem;
  border-collapse: collapse;
}

.checks caption {
  text-align: start;
  font-weight: 600;
  padding-bottom: 0.35rem;
}

.checks th,
.checks td {
  text-align: start;
  padding: 0.45rem 0.5rem;
  border-bottom: 1px solid var(--border);
}

.checks th[scope='row'] {
  font-weight: 500;
}

.checks td[data-pass='true'] {
  color: var(--ok-text);
  font-weight: 700;
}

.checks td[data-pass='false'] {
  color: var(--bad-text);
  font-weight: 700;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```

# JavaScript

```javascript
// COMPROBADOR DE CONTRASTE (WCAG 2).
//
// 1. Cada canal sRGB (0-255) se pasa a luz «lineal» (la pantalla no es lineal).
// 2. Luminancia relativa: L = 0.2126 R + 0.7152 G + 0.0722 B (el ojo ve más el verde).
// 3. Ratio = (L más clara + 0.05) / (L más oscura + 0.05), de 1:1 a 21:1.
// Detalle profesional: WCAG prohíbe redondear hacia arriba. 4,478:1 NO aprueba AA
// aunque «se parezca» a 4,5; por eso truncamos al mostrar (Math.floor).
//
// Alcance: function se estudia en «Funciones y ámbito»; métodos de string
// (trim, toLowerCase, slice, padStart) y parseInt en «Números, texto y colecciones»;
// el DOM y los eventos, en el capítulo 6.

// ── Lógica ──────────────────────────────────────────────────────────────

function isHexDigit(ch) {
  return (ch >= '0' && ch <= '9') || (ch >= 'a' && ch <= 'f');
}

// '#19f', '19F', '#1199ff' → { r: 17, g: 153, b: 255 }
function parseHexColor(text) {
  let hex = text.trim().toLowerCase();
  if (hex[0] === '#') {
    hex = hex.slice(1);
  }
  if (hex.length !== 3 && hex.length !== 6) {
    throw new RangeError('Usa 3 o 6 cifras hexadecimales, por ejemplo #1e90ff o #19f.');
  }
  for (const ch of hex) {
    if (!isHexDigit(ch)) {
      throw new RangeError(`«${ch}» no es una cifra hexadecimal (0-9, a-f).`);
    }
  }
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]; // #19f → #1199ff
  }
  // parseInt(texto, 16) lee un número escrito en base 16.
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function toHex(color) {
  return '#' +
    color.r.toString(16).padStart(2, '0') +
    color.g.toString(16).padStart(2, '0') +
    color.b.toString(16).padStart(2, '0');
}

function channelToLinear(value) {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(color) {
  return 0.2126 * channelToLinear(color.r) + 0.7152 * channelToLinear(color.g) + 0.0722 * channelToLinear(color.b);
}

function contrastRatio(colorA, colorB) {
  const a = relativeLuminance(colorA);
  const b = relativeLuminance(colorB);
  const lighter = a > b ? a : b;
  const darker = a > b ? b : a;
  return (lighter + 0.05) / (darker + 0.05);
}

// ── Interfaz ────────────────────────────────────────────────────────────
// querySelector busca un elemento; .value lee o cambia un campo; textContent y
// dataset cambian su texto y sus atributos data-*; style.setProperty cambia una
// custom property de CSS; addEventListener reacciona a eventos. Capítulo 6.

const fgText = document.querySelector('#fg-text');
const fgPicker = document.querySelector('#fg-picker');
const fgError = document.querySelector('#fg-error');
const bgText = document.querySelector('#bg-text');
const bgPicker = document.querySelector('#bg-picker');
const bgError = document.querySelector('#bg-error');
const ratioOutput = document.querySelector('#ratio');
const preview = document.querySelector('#preview');

const THRESHOLDS = [
  { id: '#check-aa-normal', min: 4.5 },
  { id: '#check-aa-large', min: 3 },
  { id: '#check-aaa-normal', min: 7 },
  { id: '#check-aaa-large', min: 4.5 },
  { id: '#check-ui', min: 3 },
];

// Lee un campo de texto; si es válido devuelve el color, si no muestra el error y
// devuelve null.
function readColor(textInput, errorElement) {
  try {
    const color = parseHexColor(textInput.value);
    errorElement.hidden = true;
    textInput.removeAttribute('aria-invalid');
    return color;
  } catch (error) {
    errorElement.textContent = error.message;
    errorElement.hidden = false;
    textInput.setAttribute('aria-invalid', 'true');
    return null;
  }
}

function render() {
  const fg = readColor(fgText, fgError);
  const bg = readColor(bgText, bgError);

  if (fg === null || bg === null) {
    ratioOutput.textContent = '—';
    for (const check of THRESHOLDS) {
      const cell = document.querySelector(check.id);
      cell.textContent = '—';
      cell.removeAttribute('data-pass');
    }
    return;
  }

  // Mantiene sincronizados los selectores de color con lo escrito.
  fgPicker.value = toHex(fg);
  bgPicker.value = toHex(bg);
  preview.style.setProperty('--sample-fg', toHex(fg));
  preview.style.setProperty('--sample-bg', toHex(bg));

  const ratio = contrastRatio(fg, bg);
  const shown = Math.floor(ratio * 100) / 100; // truncar: nunca redondear hacia arriba
  ratioOutput.textContent = `${shown.toFixed(2).replace('.', ',')} : 1`;

  for (const check of THRESHOLDS) {
    const passes = ratio >= check.min;
    const cell = document.querySelector(check.id);
    cell.textContent = passes ? '✓ Aprueba' : '✗ No aprueba';
    cell.dataset.pass = String(passes);
  }
}

function handleForegroundPicker() {
  fgText.value = fgPicker.value;
  render();
}

function handleBackgroundPicker() {
  bgText.value = bgPicker.value;
  render();
}

function handleSubmit(event) {
  event.preventDefault(); // Enter no debe recargar la página
}

fgText.addEventListener('input', render);
bgText.addEventListener('input', render);
fgPicker.addEventListener('input', handleForegroundPicker);
bgPicker.addEventListener('input', handleBackgroundPicker);
document.querySelector('#contrast-form').addEventListener('submit', handleSubmit);
render();

const gray = parseHexColor('#777777');
const white = parseHexColor('#ffffff');
console.log('#777777 sobre blanco →', contrastRatio(gray, white));
console.log('Redondeado a un decimal parecería 4,5, pero 4,478 < 4,5: NO aprueba AA.');
```
