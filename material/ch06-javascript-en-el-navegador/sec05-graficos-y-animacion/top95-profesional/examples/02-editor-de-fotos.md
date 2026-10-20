---
example_description: "Un editor de fotos: elige un cuadro, recórtalo (original, cuadrado o 16:9), ajusta brillo, contraste y saturación con un bucle de píxeles sobre una copia (un recálculo por frame), mira su histograma y expórtalo como PNG con toBlob y una descarga"
example_tags: "javascript|canvas|pixeles|imagedata|histograma|toblob|descargas|crossorigin|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="editor">
  <h1>Editor de láminas</h1>
  <div class="editor__layout">
    <figure class="editor__preview">
      <canvas id="output" role="img" aria-label="La lámina con los ajustes aplicados"></canvas>
      <figcaption id="credit"></figcaption>
    </figure>
    <form id="controls" class="editor__controls">
      <label>Lámina
        <select name="picture">
          <option value="great-wave">La gran ola de Kanagawa</option>
          <option value="valley-of-mexico">Valle de México</option>
        </select>
      </label>
      <fieldset>
        <legend>Recorte</legend>
        <label><input type="radio" name="crop" value="original" checked> Original</label>
        <label><input type="radio" name="crop" value="square"> Cuadrado</label>
        <label><input type="radio" name="crop" value="wide"> 16:9</label>
      </fieldset>
      <label>Brillo <output name="brightnessOut">1</output>
        <input type="range" name="brightness" min="0.5" max="1.5" step="0.05" value="1"></label>
      <label>Contraste <output name="contrastOut">1</output>
        <input type="range" name="contrast" min="0.5" max="2" step="0.05" value="1"></label>
      <label>Saturación <output name="saturationOut">1</output>
        <input type="range" name="saturation" min="0" max="2" step="0.05" value="1"></label>
      <canvas id="histogram" width="256" height="60" role="img" aria-label="Histograma de luminancia de la lámina editada"></canvas>
      <div class="editor__actions">
        <button type="reset">Restablecer</button>
        <button type="button" id="export">Exportar PNG</button>
      </div>
    </form>
  </div>
  <p id="status" class="status" role="status"></p>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
.editor {
  max-width: 52rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.editor__layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1rem;
  align-items: start;
}
.editor__preview {
  margin: 0;
}
#output {
  display: block;
  width: 100%;
  height: auto;
  background: repeating-conic-gradient(#e4e7eb 0 25%, #ffffff 0 50%) 0 0 / 16px 16px;
}
figcaption {
  margin-top: 0.3rem;
  font-size: 0.8rem;
  color: #52606d;
}
.editor__controls {
  display: grid;
  gap: 0.6rem;
}
.editor__controls label {
  display: grid;
  gap: 0.2rem;
}
fieldset {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.4rem;
}
fieldset label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
output {
  font-variant-numeric: tabular-nums;
  color: #52606d;
}
#histogram {
  width: 100%;
  height: 60px;
  background: #ffffff;
  border-bottom: 1px solid #52606d;
}
.editor__actions {
  display: flex;
  gap: 0.5rem;
}
button,
select {
  font: inherit;
  padding: 0.3rem 0.7rem;
}
button:focus-visible,
select:focus-visible,
input:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.status {
  color: #52606d;
}
```

# JavaScript

```javascript
// Editor de láminas.
//
// Decisiones de diseño:
// - El ImageData ORIGINAL de cada lámina se guarda al cargarla y nunca se modifica: cada render
//   copia sus números y aplica brillo → contraste → saturación (las cuentas de filter de CSS).
// - Los deslizadores mandan muchos input: un render por frame como mucho (pending ??= rAF).
// - El recorte es un rectángulo de origen; el canvas de salida mide lo que el recorte, en píxeles
//   de la imagen (480 de ancho como mucho), y el CSS lo ajusta al ancho disponible.
// - La imagen se pide con crossOrigin = 'anonymous' (también funciona en las tarjetas, de origen
//   null) y el contexto se crea con willReadFrequently, porque se lee en cada render.
// - Exportar: toBlob → URL de objeto → <a download>. La URL se libera después.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos, red y almacenamiento y este módulo.

const PICTURES = {
  'great-wave': { file: 'great-wave.jpg', credit: 'Katsushika Hokusai, La gran ola de Kanagawa, c. 1831. Dominio público.' },
  'valley-of-mexico': { file: 'valley-of-mexico.jpg', credit: 'José María Velasco, Valle de México, 1877. Dominio público.' },
};
const clamp = (v) => Math.min(255, Math.max(0, v));
const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function adjust(r, g, b, { brightness, contrast, saturation }) {
  let rgb = [r, g, b].map((v) => clamp(v * brightness));
  rgb = rgb.map((v) => clamp((v - 127.5) * contrast + 127.5));
  const y = luma(...rgb);
  return rgb.map((v) => clamp(y + (v - y) * saturation));       // 0 = gris, 1 = igual, 2 = el doble de color
}

function cropRect(width, height, crop) {
  if (crop === 'square') {
    const side = Math.min(width, height);
    return { x: Math.floor((width - side) / 2), y: Math.floor((height - side) / 2), width: side, height: side };
  }
  if (crop === 'wide' && width / height < 16 / 9) {
    const wideHeight = Math.round((width * 9) / 16);
    return { x: 0, y: Math.floor((height - wideHeight) / 2), width, height: wideHeight };
  }
  return { x: 0, y: 0, width, height };
}

const show = (rgb) => Array.from(Uint8ClampedArray.from(rgb)).join(', ');
console.log('225, 29, 72 con saturación 0 →', show(adjust(225, 29, 72, { brightness: 1, contrast: 1, saturation: 0 })));
console.log('225, 29, 72 con brillo 1.1, contraste 1.2, saturación 1.5 →', show(adjust(225, 29, 72, { brightness: 1.1, contrast: 1.2, saturation: 1.5 })));
for (const [crop, label] of [['square', 'cuadrado'], ['wide', '16:9']]) {
  const { x, y, width, height } = cropRect(480, 323, crop);
  console.log(`recorte ${label} de 480 × 323 → ${width} × ${height} desde (${x}, ${y})`);
}

// ── Estado ───────────────────────────────────────────────────────────────
const form = document.querySelector('#controls');
const output = document.querySelector('#output');
const outputCtx = output.getContext('2d');
const work = document.createElement('canvas');   // donde se lee el original
const workCtx = work.getContext('2d', { willReadFrequently: true });
const statusLine = document.querySelector('#status');
let original = null;
let pictureKey = 'great-wave';

async function loadPicture(key) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = PICTURES[key].file;
  await img.decode();
  work.width = img.naturalWidth;
  work.height = img.naturalHeight;
  workCtx.drawImage(img, 0, 0);
  original = workCtx.getImageData(0, 0, work.width, work.height);
  pictureKey = key;
  document.querySelector('#credit').textContent = PICTURES[key].credit;
}

function readSettings() {
  return {
    brightness: Number(form.elements.brightness.value),
    contrast: Number(form.elements.contrast.value),
    saturation: Number(form.elements.saturation.value),
    crop: form.elements.crop.value,
  };
}

function drawHistogram(data) {
  const canvas = document.querySelector('#histogram');
  const dpr = window.devicePixelRatio;
  canvas.width = 256 * dpr;
  canvas.height = 60 * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const bins = new Array(256).fill(0);
  for (let i = 0; i < data.length; i += 4) bins[Math.round(luma(data[i], data[i + 1], data[i + 2]))] += 1;
  const max = Math.max(...bins);
  ctx.fillStyle = '#334e68';
  ctx.beginPath();
  bins.forEach((n, v) => ctx.rect(v, 60 - (n / max) * 58, 1, (n / max) * 58));
  ctx.fill();
}

let pending = null;
function render() {
  pending = null;
  if (!original) return;
  const settings = readSettings();
  const rect = cropRect(original.width, original.height, settings.crop);
  const result = new ImageData(rect.width, rect.height);
  for (let y = 0; y < rect.height; y++) {
    for (let x = 0; x < rect.width; x++) {
      const from = ((rect.y + y) * original.width + (rect.x + x)) * 4;
      const to = (y * rect.width + x) * 4;
      const [r, g, b] = adjust(original.data[from], original.data[from + 1], original.data[from + 2], settings);
      result.data[to] = r;
      result.data[to + 1] = g;
      result.data[to + 2] = b;
      result.data[to + 3] = original.data[from + 3];
    }
  }
  output.width = rect.width;                    // nuevo mapa de bits a la medida del recorte
  output.height = rect.height;
  outputCtx.putImageData(result, 0, 0);
  drawHistogram(result.data);
  for (const name of ['brightness', 'contrast', 'saturation']) form.elements[`${name}Out`].value = settings[name];
  statusLine.textContent = `${rect.width} × ${rect.height} px · brillo ${settings.brightness} · contraste ${settings.contrast} · saturación ${settings.saturation}`;
}
const scheduleRender = () => { pending ??= requestAnimationFrame(render); };

form.addEventListener('input', async (event) => {
  if (event.target.name === 'picture') {
    await loadPicture(event.target.value);
    render();
    console.log(`🖼️ ${statusLine.textContent}`);
    return;
  }
  scheduleRender();
});
form.addEventListener('reset', () => {
  setTimeout(async () => {                       // reset cambia los valores DESPUÉS del evento
    if (form.elements.picture.value !== pictureKey) await loadPicture(form.elements.picture.value);
    render();
    console.log(`↩️ restablecido: ${statusLine.textContent}`);
  });
});
document.querySelector('#export').addEventListener('click', () => {
  output.toBlob((blob) => {
    if (!blob) {
      statusLine.textContent = 'No se pudo exportar la imagen.';
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement('a'), { href: url, download: `${pictureKey}-editada.png` });
    link.click();                                 // descarga (en el editor; en una tarjeta puede bloquearse)
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    console.log(`💾 ${link.download}: ${output.width} × ${output.height} px, ${blob.type}`);
  }, 'image/png');
});

await loadPicture(pictureKey);
render();
console.log(`🖼️ ${statusLine.textContent}`);
console.log('Listo: elige «Cuadrado», sube la saturación y pulsa «Exportar PNG»');
```
