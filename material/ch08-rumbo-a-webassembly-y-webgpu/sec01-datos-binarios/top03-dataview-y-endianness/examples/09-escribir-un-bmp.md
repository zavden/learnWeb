---
example_description: "Escribir un archivo binario en memoria: un BMP de 30 × 20 píxeles (un atardecer calculado en JavaScript) con su cabecera escrita con DataView en little-endian, filas rellenadas a múltiplos de 4, y un Blob con URL de objeto para verlo en un <img> y descargarlo"
example_tags: "javascript|dataview|bmp|escribir|blob|descargas|little-endian"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Un BMP hecho byte a byte</h1>
  <img id="preview" width="240" height="160" alt="Atardecer generado: degradado de azul oscuro a naranja con un sol amarillo">
  <p><a id="download" download="atardecer.bmp">Descargar atardecer.bmp</a></p>
  <p class="note">En las tarjetas de la galería y de la teoría la descarga no funciona (es un iframe aislado sin permiso de descargas): ábrelo con ▶ o en el editor.</p>
  <p id="status" aria-live="polite"></p>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 30rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
img { image-rendering: pixelated; display: block; border: 1px solid #64748b; }
a { color: #1d4ed8; }
a:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.note { font-size: 0.85rem; color: #475569; }
```

# JavaScript

```javascript
const WIDTH = 30;
const HEIGHT = 20;
const ROW_SIZE = Math.ceil((WIDTH * 3) / 4) * 4; // 90 bytes útiles → 92 con relleno
const PIXEL_OFFSET = 54;
const fileSize = PIXEL_OFFSET + ROW_SIZE * HEIGHT;

// El color de cada píxel (x, y), con y = 0 arriba: un degradado y un sol.
function colorAt(x, y) {
  const t = y / (HEIGHT - 1); // 0 arriba, 1 abajo
  const sky = [30 + t * 219, 58 + t * 57, 138 - t * 116]; // de #1e3a8a a #f97316
  const inSun = (x - 20) ** 2 + (y - 12) ** 2 <= 16;
  return inSun ? [253, 224, 71] : sky.map(Math.round);
}

const view = new DataView(new ArrayBuffer(fileSize)); // todo a 0: el relleno ya está hecho
// Cabecera de archivo (14 bytes)
view.setUint8(0, 0x42); // 'B'
view.setUint8(1, 0x4d); // 'M'
view.setUint32(2, fileSize, true);
view.setUint32(10, PIXEL_OFFSET, true);
// Cabecera de imagen (40 bytes)
view.setUint32(14, 40, true);
view.setInt32(18, WIDTH, true);
view.setInt32(22, HEIGHT, true); // positiva: filas de abajo arriba
view.setUint16(26, 1, true);
view.setUint16(28, 24, true);
view.setUint32(34, ROW_SIZE * HEIGHT, true);
// Píxeles: la fila 0 del archivo es la de ABAJO; cada píxel, azul-verde-rojo.
for (let fileRow = 0; fileRow < HEIGHT; fileRow += 1) {
  for (let x = 0; x < WIDTH; x += 1) {
    const [r, g, b] = colorAt(x, HEIGHT - 1 - fileRow);
    const at = PIXEL_OFFSET + fileRow * ROW_SIZE + x * 3;
    view.setUint8(at, b);
    view.setUint8(at + 1, g);
    view.setUint8(at + 2, r);
  }
}

// Un Blob envuelve los bytes con un tipo; una URL de objeto le da una dirección
// que un <img> o un <a download> pueden usar (lección «Texto y binario»).
const file = new Blob([view.buffer], { type: 'image/bmp' });
const url = URL.createObjectURL(file);
document.querySelector('#preview').src = url;
document.querySelector('#download').href = url;

const firstBytes = Array.from(new Uint8Array(view.buffer, 0, 6), (byte) => byte.toString(16).padStart(2, '0')).join(' ');
const summary = `atardecer.bmp → ${file.size} bytes (${WIDTH} × ${HEIGHT}, filas de ${ROW_SIZE} bytes) · empieza por ${firstBytes}`;
document.querySelector('#status').textContent = summary;
console.log(summary);
document.querySelector('#download').addEventListener('click', () => console.log('Descarga: atardecer.bmp'));
console.log('Listo: el <img> muestra el archivo; «Descargar» lo guarda');
```
