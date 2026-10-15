---
example_description: "Cada fila de píxeles de un BMP se rellena hasta un múltiplo de 4 bytes: un decodificador que lee 7 píxeles × 3 = 21 bytes por fila, en lugar de 24, se desplaza un píxel por fila y la imagen sale inclinada con una diagonal negra"
example_tags: "javascript|dataview|bmp|relleno|alineacion|pixeles|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Las filas de un BMP</h1>
  <div class="compare">
    <figure>
      <img src="landscape.bmp" width="112" height="80" alt="Paisaje de 7 × 5 píxeles: cielo, sol, una casa roja y césped">
      <figcaption>El archivo, pintado por el navegador</figcaption>
    </figure>
    <figure>
      <div class="pixels" id="wrong" role="img" aria-label="Decodificado sin relleno: imagen inclinada con una diagonal negra"></div>
      <figcaption>🐛 21 bytes por fila</figcaption>
    </figure>
    <figure>
      <div class="pixels" id="right" role="img" aria-label="Decodificado con relleno: igual que el archivo"></div>
      <figcaption>✅ 24 bytes por fila</figcaption>
    </figure>
  </div>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 30rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
.compare { display: flex; flex-wrap: wrap; gap: 1rem; }
figure { margin: 0; }
figcaption { font-size: 0.85rem; max-inline-size: 8rem; }
img { image-rendering: pixelated; display: block; }
.pixels { display: grid; grid-template-columns: repeat(7, 16px); grid-auto-rows: 16px; }
```

# JavaScript

```javascript
const buffer = await (await fetch('landscape.bmp')).arrayBuffer();
const view = new DataView(buffer);
const width = view.getInt32(18, true);
const height = view.getInt32(22, true); // positiva: filas de abajo arriba (ejemplo siguiente)
const pixelOffset = view.getUint32(10, true);
const toHex = (channels) => `#${channels.map((value) => value.toString(16).padStart(2, '0')).join('')}`;

// Devuelve las filas de arriba abajo; cada píxel, como '#rrggbb'.
function decode(rowSize) {
  const rows = [];
  for (let fileRow = 0; fileRow < height; fileRow += 1) {
    const row = [];
    for (let x = 0; x < width; x += 1) {
      const at = pixelOffset + fileRow * rowSize + x * 3;
      // BMP guarda cada píxel como azul, verde, rojo.
      row.push(toHex([view.getUint8(at + 2), view.getUint8(at + 1), view.getUint8(at)]));
    }
    rows.unshift(row); // la primera fila del archivo es la de ABAJO
  }
  return rows;
}

function paint(target, rows) {
  target.replaceChildren(...rows.flat().map((color) => {
    const cell = document.createElement('span');
    cell.style.background = color;
    return cell;
  }));
}

// 🐛 7 píxeles × 3 bytes = 21 bytes… pero cada fila ocupa 24: hay 3 de relleno.
const naiveRowSize = width * 3;
// ✅ Redondear al múltiplo de 4 (con bits: (width * 3 + 3) & ~3, lección «Bits y bytes»).
const rowSize = Math.ceil((width * 3) / 4) * 4;
console.log('bytes por fila → 🐛', naiveRowSize, '| ✅', rowSize);

const wrong = decode(naiveRowSize);
const right = decode(rowSize);
paint(document.querySelector('#wrong'), wrong);
paint(document.querySelector('#right'), right);
// Cada fila del 🐛 empieza 3 bytes antes de lo debido: un píxel de relleno (negro) y
// todo lo demás desplazado. La fila de abajo es la única correcta.
console.log('🐛 fila de arriba →', wrong[0].join(' '));
console.log('✅ fila de arriba →', right[0].join(' '));
```
