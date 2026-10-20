---
example_description: "Leer un BMP, pasarlo a escala de grises y escribir un BMP nuevo: DataView en little-endian en los dos sentidos, filas con relleno, altura con signo, luminancia guardada en un Uint8ClampedArray y el resultado en un <img> con una URL de objeto"
example_tags: "javascript|bmp|dataview|uint8clampedarray|blob|createobjecturl|pixeles|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>De color a gris, byte a byte</h1>
  <div class="pair">
    <figure>
      <img id="before" width="112" height="80" alt="El paisaje original: cielo azul, sol amarillo, casa roja y césped verde">
      <figcaption>landscape.bmp</figcaption>
    </figure>
    <figure>
      <img id="after" width="112" height="80" alt="El mismo paisaje en escala de grises">
      <figcaption>landscape-gris.bmp (generado)</figcaption>
    </figure>
  </div>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 30rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.75rem; }
.pair { display: flex; flex-wrap: wrap; gap: 1.5rem; }
figure { margin: 0; }
figcaption { font-size: 0.85rem; }
img { display: block; image-rendering: pixelated; border: 1px solid #64748b; }
.log { padding-inline-start: 1.25rem; font-size: 0.8rem; }
```

# JavaScript

```javascript
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const rowSizeFor = (width) => Math.ceil((width * 3) / 4) * 4; // filas rellenadas a múltiplos de 4

// Lee un BMP de 24 bits y devuelve los píxeles de arriba abajo como [r, g, b].
function readBmp(buffer) {
  const view = new DataView(buffer);
  if (view.getUint16(0, true) !== 0x4d42) throw new Error('no es un BMP («BM» en little-endian es 0x4d42)');
  if (view.getUint16(28, true) !== 24) throw new Error('solo se admiten BMP de 24 bits');
  const width = view.getInt32(18, true);
  const height = view.getInt32(22, true); // con signo: negativa = de arriba abajo
  const rows = Math.abs(height);
  const pixelOffset = view.getUint32(10, true);
  const pixels = [];
  for (let y = 0; y < rows; y += 1) {
    const fileRow = height < 0 ? y : rows - 1 - y;
    for (let x = 0; x < width; x += 1) {
      const at = pixelOffset + fileRow * rowSizeFor(width) + x * 3;
      pixels.push([view.getUint8(at + 2), view.getUint8(at + 1), view.getUint8(at)]);
    }
  }
  return { width, height: rows, pixels };
}

// Escribe un BMP de 24 bits (filas de abajo arriba) a partir de una función de color.
function writeBmp(width, height, colorAt) {
  const rowSize = rowSizeFor(width);
  const view = new DataView(new ArrayBuffer(54 + rowSize * height));
  view.setUint16(0, 0x4d42, true);
  view.setUint32(2, view.byteLength, true);
  view.setUint32(10, 54, true);
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(34, rowSize * height, true);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const [r, g, b] = colorAt(x, y);
      const at = 54 + (height - 1 - y) * rowSize + x * 3;
      view.setUint8(at, b);
      view.setUint8(at + 1, g);
      view.setUint8(at + 2, r);
    }
  }
  return view.buffer;
}

const source = await (await fetch('landscape.bmp')).arrayBuffer();
const image = readBmp(source);
logLine(`leído → ${image.width} × ${image.height} px · filas de ${rowSizeFor(image.width)} bytes`);

// Luminancia (Rec. 709): el verde pesa más porque el ojo es más sensible a él.
// Uint8ClampedArray redondea y nunca se sale de 0-255.
const gray = Uint8ClampedArray.from(image.pixels, ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b);
const output = writeBmp(image.width, image.height, (x, y) => {
  const level = gray[y * image.width + x];
  return [level, level, level];
});
logLine(`escrito → ${output.byteLength} bytes (mismo tamaño que el original: ${output.byteLength === source.byteLength})`);
logLine(`grises de cielo, sol, tejado y césped → ${[gray[0], gray[5], gray[9], gray[28]].join(', ')}`);

document.querySelector('#before').src = URL.createObjectURL(new Blob([source], { type: 'image/bmp' }));
document.querySelector('#after').src = URL.createObjectURL(new Blob([output], { type: 'image/bmp' }));
// (Dos imágenes que se quedan en la página: sus URLs viven lo mismo que ella.)
```
