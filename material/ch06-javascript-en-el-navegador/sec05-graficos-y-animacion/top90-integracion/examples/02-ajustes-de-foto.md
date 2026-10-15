---
example_description: "Brillo, contraste y escala de grises con deslizadores: a la izquierda, un bucle sobre una copia de los píxeles originales (los mismos cálculos que las funciones de filter, en el mismo orden); a la derecha, filter de CSS sobre la imagen. Un recálculo por frame como mucho, aunque el deslizador mande muchos input"
example_tags: "javascript|canvas|pixeles|filter|input|requestanimationframe|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Ajustes de foto</h1>
  <div class="pair">
    <figure>
      <canvas id="pixels" width="480" height="330" role="img" aria-label="Valle de México con los ajustes aplicados a sus píxeles"></canvas>
      <figcaption>Bucle de píxeles (se puede exportar)</figcaption>
    </figure>
    <figure>
      <img id="css-version" src="valley-of-mexico.jpg" alt="Valle de México con los mismos ajustes como filter de CSS" width="480" height="330">
      <figcaption>filter de CSS (solo a la vista)</figcaption>
    </figure>
  </div>
  <form id="controls" class="controls">
    <label>Brillo <input type="range" name="brightness" min="0.5" max="1.5" step="0.05" value="1"></label>
    <label>Contraste <input type="range" name="contrast" min="0.5" max="2" step="0.05" value="1"></label>
    <label><input type="checkbox" name="gray"> Escala de grises</label>
  </form>
  <p id="status" aria-live="polite"></p>
  <p class="credit">José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</p>
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
main {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.pair {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
figure {
  margin: 0;
  font-size: 0.8rem;
}
canvas,
img {
  display: block;
  width: 200px;
  height: auto;
}
.controls {
  display: grid;
  gap: 0.4rem;
  margin-top: 0.75rem;
}
input:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.credit {
  font-size: 0.8rem;
  color: #52606d;
}
```

# JavaScript

```javascript
// Los cálculos de brightness(), contrast() y grayscale() de CSS, en ese orden, con tope en cada paso
const clamp = (v) => Math.min(255, Math.max(0, v));
function adjust(r, g, b, { brightness, contrast, gray }) {
  let rgb = [r, g, b].map((v) => clamp(v * brightness));             // brillo: multiplica
  rgb = rgb.map((v) => clamp((v - 127.5) * contrast + 127.5));       // contraste: se aleja del gris medio
  if (gray) {
    const y = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    rgb = [y, y, y];
  }
  return rgb;
}
const show = (rgb) => Array.from(Uint8ClampedArray.from(rgb)).join(', ');
console.log('225, 29, 72 con brillo 1.2 →', show(adjust(225, 29, 72, { brightness: 1.2, contrast: 1, gray: false })));
console.log('… y contraste 1.5 →', show(adjust(225, 29, 72, { brightness: 1.2, contrast: 1.5, gray: false })));
console.log('… y en grises →', show(adjust(225, 29, 72, { brightness: 1.2, contrast: 1.5, gray: true })));

const canvas = document.querySelector('#pixels');
const ctx = canvas.getContext('2d');
const img = new Image();
img.crossOrigin = 'anonymous';               // en las tarjetas, la imagen es de otro origen
img.src = 'valley-of-mexico.jpg';
await img.decode();
ctx.drawImage(img, 0, 0);
const original = ctx.getImageData(0, 0, canvas.width, canvas.height); // el original no se toca nunca

const form = document.querySelector('#controls');
const statusLine = document.querySelector('#status');
function readSettings() {
  return {
    brightness: Number(form.elements.brightness.value),
    contrast: Number(form.elements.contrast.value),
    gray: form.elements.gray.checked,
  };
}
function render() {
  pending = null;
  const settings = readSettings();
  const result = new ImageData(new Uint8ClampedArray(original.data), original.width, original.height);
  const { data } = result;
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = adjust(data[i], data[i + 1], data[i + 2], settings);
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  ctx.putImageData(result, 0, 0);
  const cssFilter = `brightness(${settings.brightness}) contrast(${settings.contrast}) grayscale(${settings.gray ? 1 : 0})`;
  document.querySelector('#css-version').style.filter = cssFilter;
  statusLine.textContent = cssFilter;
  return cssFilter;
}
// Un deslizador manda decenas de input por segundo: se recalcula una vez por frame, como mucho
let pending = null;
form.addEventListener('input', () => {
  pending ??= requestAnimationFrame(render);
});
form.addEventListener('submit', (event) => event.preventDefault());
console.log('filtro inicial →', render());
console.log('Listo: mueve los deslizadores y marca «Escala de grises»');
```
