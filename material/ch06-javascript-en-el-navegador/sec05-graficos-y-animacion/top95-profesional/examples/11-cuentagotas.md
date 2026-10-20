---
example_description: "Un cuentagotas de colores sobre un grabado de Hokusai: lee el píxel bajo el puntero (getImageData con willReadFrequently), muestra una lupa con los píxeles ampliados sin suavizar, el color en hexadecimal y RGB con su contraste frente al blanco y al negro, y guarda una paleta en localStorage. Con el teclado: flechas para mover la mira y Enter para guardar"
example_tags: "javascript|canvas|getimagedata|crossorigin|contraste|localstorage|teclado|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="dropper">
  <h1>Cuentagotas</h1>
  <p id="help" class="dropper__help">Mueve el puntero sobre la imagen y haz clic para guardar el color. Con el teclado: Tab hasta la imagen, flechas (Mayús + flechas: de 10 en 10) y Enter.</p>
  <div class="dropper__layout">
    <canvas id="picture" class="dropper__picture" tabindex="0" role="img"
            aria-label="Katsushika Hokusai, La gran ola de Kanagawa" aria-describedby="help"></canvas>
    <div class="dropper__info">
      <canvas id="loupe" class="dropper__loupe" width="110" height="110" aria-hidden="true"></canvas>
      <p id="sample" class="dropper__sample" aria-live="polite">—</p>
    </div>
  </div>
  <p class="dropper__credit">Katsushika Hokusai, <cite>La gran ola de Kanagawa</cite>, c. 1831. Dominio público.</p>
  <h2>Tu paleta</h2>
  <ul id="palette" class="dropper__palette"></ul>
  <button id="clear" type="button">Vaciar la paleta</button>
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
.dropper {
  max-width: 44rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
h2 {
  font-size: 1rem;
}
.dropper__help,
.dropper__credit {
  color: #52606d;
  font-size: 0.85rem;
}
.dropper__layout {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: start;
}
.dropper__picture {
  width: min(100%, 300px);
  height: auto;
  cursor: crosshair;
}
.dropper__picture:focus-visible,
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
/* La lupa: cada píxel de la imagen, un cuadrado de 10 × 10 */
.dropper__loupe {
  width: 110px;
  height: 110px;
  image-rendering: pixelated;
  border: 2px solid #1f2933;
  border-radius: 50%;
}
.dropper__sample {
  margin: 0.5rem 0 0;
  padding: 0.4rem 0.6rem;
  border-radius: 0.4rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.85rem;
}
.dropper__palette {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0;
  list-style: none;
}
.dropper__palette li {
  padding: 0.3rem 0.5rem;
  border-radius: 0.4rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
button {
  font: inherit;
  padding: 0.3rem 0.8rem;
}
```

# JavaScript

```javascript
// Cuentagotas con lupa y paleta.
//
// Decisiones de diseño:
// - La imagen se pide con crossOrigin = 'anonymous': sin eso, leer sus píxeles contaminaría el
//   canvas en las tarjetas (origen null). El contexto lleva willReadFrequently, porque se lee
//   en cada movimiento del puntero.
// - El punto se convierte de px CSS a píxeles de la imagen con la proporción caja / mapa de bits
//   (el canvas se encoge en pantallas estrechas).
// - La lupa copia 11 × 11 píxeles con drawImage a un canvas de 11 × 11 y el CSS lo amplía con
//   image-rendering: pixelated: se ven los píxeles de verdad, sin suavizar.
// - Cada muestra dice su contraste (WCAG) con el blanco y con el negro, y se pinta con el texto
//   que mejor se lee encima. La paleta (hasta 8) se guarda en «lw-gfx-paleta», validada al leer.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos, red y almacenamiento y este módulo.

const PALETTE_KEY = 'lw-gfx-paleta';
const toHex = ([r, g, b]) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
function luminance([r, g, b]) {                   // luminancia relativa de WCAG (sRGB linealizado)
  const linear = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}
function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return Math.round(((light + 0.05) / (dark + 0.05)) * 100) / 100;
}
const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];
const textFor = (rgb) => (contrast(rgb, WHITE) >= contrast(rgb, BLACK) ? '#ffffff' : '#000000');
console.log('14, 116, 144 →', toHex([14, 116, 144]), '· contraste con blanco', contrast([14, 116, 144], WHITE), '· con negro', contrast([14, 116, 144], BLACK));
console.log('texto sobre #fde68a →', textFor([253, 230, 138]) === '#000000' ? 'negro' : 'blanco');

// ── La imagen ────────────────────────────────────────────────────────────
const picture = document.querySelector('#picture');
const ctx = picture.getContext('2d', { willReadFrequently: true });
const loupe = document.querySelector('#loupe');
const loupeCtx = loupe.getContext('2d');
loupe.width = 11;                                 // 11 × 11 píxeles de verdad; el CSS los amplía
loupe.height = 11;
const sampleLine = document.querySelector('#sample');
const img = new Image();
img.crossOrigin = 'anonymous';
img.src = 'great-wave.jpg';
await img.decode();
picture.width = img.naturalWidth;
picture.height = img.naturalHeight;
ctx.drawImage(img, 0, 0);

let cursor = { x: Math.floor(picture.width / 2), y: Math.floor(picture.height / 2) };
function sampleAt(x, y) {
  cursor = { x: Math.max(0, Math.min(picture.width - 1, x)), y: Math.max(0, Math.min(picture.height - 1, y)) };
  const rgb = Array.from(ctx.getImageData(cursor.x, cursor.y, 1, 1).data.slice(0, 3));
  loupeCtx.imageSmoothingEnabled = false;
  loupeCtx.clearRect(0, 0, 11, 11);
  loupeCtx.drawImage(picture, cursor.x - 5, cursor.y - 5, 11, 11, 0, 0, 11, 11);
  loupeCtx.strokeStyle = textFor(rgb);
  loupeCtx.lineWidth = 0.2;
  loupeCtx.strokeRect(5, 5, 1, 1);                // el píxel elegido, recuadrado
  sampleLine.textContent = `${toHex(rgb)} · rgb(${rgb.join(', ')}) · contraste: blanco ${contrast(rgb, WHITE)}, negro ${contrast(rgb, BLACK)}`;
  sampleLine.style.background = toHex(rgb);
  sampleLine.style.color = textFor(rgb);
  return rgb;
}
function bitmapPoint(event) {
  const box = picture.getBoundingClientRect();
  return {
    x: Math.floor((event.clientX - box.left) * (picture.width / box.width)),
    y: Math.floor((event.clientY - box.top) * (picture.height / box.height)),
  };
}

// ── Paleta ───────────────────────────────────────────────────────────────
function loadPalette() {
  try {
    const saved = JSON.parse(localStorage.getItem(PALETTE_KEY) ?? '[]');
    return Array.isArray(saved) ? saved.filter((hex) => /^#[0-9a-f]{6}$/.test(hex)).slice(0, 8) : [];
  } catch {
    return [];
  }
}
let palette = loadPalette();
function renderPalette() {
  const list = document.querySelector('#palette');
  list.replaceChildren(...palette.map((hex) => {
    const item = document.createElement('li');
    const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    item.textContent = hex;
    item.style.background = hex;
    item.style.color = textFor(rgb);
    return item;
  }));
  if (palette.length === 0) list.append(Object.assign(document.createElement('li'), { textContent: 'Aún no hay colores guardados.' }));
}
function save(rgb) {
  const hex = toHex(rgb);
  palette = [hex, ...palette.filter((h) => h !== hex)].slice(0, 8);
  try { localStorage.setItem(PALETTE_KEY, JSON.stringify(palette)); } catch { /* sin almacenamiento: dura lo que la página */ }
  renderPalette();
  console.log(`💧 guardado ${hex} · paleta: ${palette.length} color(es)`);
}

// ── Puntero y teclado ────────────────────────────────────────────────────
picture.addEventListener('pointermove', (event) => {
  const { x, y } = bitmapPoint(event);
  sampleAt(x, y);
});
picture.addEventListener('click', (event) => {
  const { x, y } = bitmapPoint(event);
  save(sampleAt(x, y));
});
picture.addEventListener('keydown', (event) => {
  const step = event.shiftKey ? 10 : 1;
  const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
  if (event.key in moves) {
    event.preventDefault();
    sampleAt(cursor.x + moves[event.key][0], cursor.y + moves[event.key][1]);
  } else if (event.key === 'Enter') {
    event.preventDefault();
    save(sampleAt(cursor.x, cursor.y));
  }
});
document.querySelector('#clear').addEventListener('click', () => {
  palette = [];
  try { localStorage.removeItem(PALETTE_KEY); } catch { /* nada que borrar */ }
  renderPalette();
  console.log('🧹 paleta vacía');
});

sampleAt(cursor.x, cursor.y);
renderPalette();
console.log(`🖼️ ${picture.width} × ${picture.height} px · mira en (${cursor.x}, ${cursor.y}) · paleta guardada: ${palette.length}`);
console.log('Listo: haz clic en la ola para guardar un color, o Tab, flechas y Enter');
```
