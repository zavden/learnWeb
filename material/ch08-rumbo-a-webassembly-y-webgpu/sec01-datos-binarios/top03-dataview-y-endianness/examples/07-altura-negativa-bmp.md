---
example_description: "En un BMP, una altura negativa significa filas de arriba abajo: leída con getUint32 da 4294967291 filas, y un decodificador que siempre empieza por abajo pinta esa imagen boca abajo; el signo decide el orden"
example_tags: "javascript|dataview|bmp|altura-negativa|int32|pixeles|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Dos BMP, la misma imagen</h1>
  <div class="compare">
    <figure>
      <img src="landscape-top-down.bmp" width="112" height="80" alt="Paisaje de 7 × 5 píxeles con el cielo arriba y el césped abajo">
      <figcaption>El archivo de altura -5, pintado por el navegador</figcaption>
    </figure>
    <figure>
      <div class="pixels" id="wrong" role="img" aria-label="Decodificado siempre de abajo arriba: el paisaje sale boca abajo"></div>
      <figcaption>🐛 Siempre de abajo arriba</figcaption>
    </figure>
    <figure>
      <div class="pixels" id="right" role="img" aria-label="Decodificado según el signo de la altura: el paisaje sale bien"></div>
      <figcaption>✅ Según el signo</figcaption>
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
const toHex = (channels) => `#${channels.map((value) => value.toString(16).padStart(2, '0')).join('')}`;

// Decodifica un BMP de 24 bits y devuelve las filas de arriba abajo.
// respectSign = false imita al decodificador que solo conoce los BMP «normales».
function decode(view, respectSign) {
  const width = view.getInt32(18, true);
  const height = view.getInt32(22, true);  // ✅ con signo: Int32, no Uint32
  const rowCount = Math.abs(height);
  const topDown = respectSign && height < 0; // negativa → la primera fila es la de ARRIBA
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const pixelOffset = view.getUint32(10, true);
  const rows = [];
  for (let fileRow = 0; fileRow < rowCount; fileRow += 1) {
    const row = [];
    for (let x = 0; x < width; x += 1) {
      const at = pixelOffset + fileRow * rowSize + x * 3;
      row.push(toHex([view.getUint8(at + 2), view.getUint8(at + 1), view.getUint8(at)]));
    }
    if (topDown) rows.push(row);
    else rows.unshift(row);
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

const view = new DataView(await (await fetch('landscape-top-down.bmp')).arrayBuffer());
// 🐛 La altura es un entero CON signo. Leída sin signo, -5 se convierte en 4294967291:
console.log('altura con getUint32 →', view.getUint32(22, true)); // un bucle de 4 mil millones de filas
console.log('altura con getInt32 →', view.getInt32(22, true));   // -5

const wrong = decode(view, false);
const right = decode(view, true);
paint(document.querySelector('#wrong'), wrong);
paint(document.querySelector('#right'), right);
console.log('🐛 fila de arriba →', wrong[0].join(' ')); // el césped arriba
console.log('✅ fila de arriba →', right[0].join(' ')); // el cielo con el sol
```
