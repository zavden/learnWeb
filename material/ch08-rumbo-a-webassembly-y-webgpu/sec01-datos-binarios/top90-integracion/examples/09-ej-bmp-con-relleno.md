---
example_description: "Ejercicio: un escritor de BMP que olvida rellenar las filas hasta un múltiplo de 4 bytes; funciona con anchos de 4 píxeles y falla con 5 o 7 (la bandera sale torcida o incompleta). Corrige el tamaño de fila, el tamaño del archivo y la posición de cada píxel; un lector correcto comprueba el resultado"
example_tags: "javascript|bmp|dataview|relleno|alineacion|ejercicio"
exercise: true
exercise_title: "El BMP que olvida el relleno"
exercise_instructions: "writeBmp(width, height, colorAt) escribe un BMP de 24 bits con DataView, en little-endian y con las filas de abajo arriba || Ahora cada fila ocupa width * 3 bytes, pero en un BMP cada fila ocupa un múltiplo de 4 bytes: con 5 o 7 píxeles de ancho, la imagen sale torcida || Calcula rowSize redondeando width * 3 hacia arriba al múltiplo de 4 || Usa rowSize para el tamaño del búfer, para los campos de tamaño de la cabecera y para la posición de cada píxel || El relleno no hace falta escribirlo: un ArrayBuffer nuevo ya está a ceros || Ejecuta hasta que las cinco comprobaciones salgan ✅ y la bandera se vea recta"
exercise_hints: "Math.ceil((width * 3) / 4) * 4, o con bits: (width * 3 + 3) & ~3 || Hay tres sitios que dependen del tamaño de fila: new ArrayBuffer(…), los campos de las posiciones 2 y 34, y la cuenta de at || Con 7 píxeles: 21 bytes útiles y 24 por fila; el archivo mide 54 + 24 × alto"
exercise_solution_example: 09-ej-bmp-con-relleno-solucion.md
exercise_locked_files: index.html,styles.css
example_stage: exercise
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Bandera de 7 × 5 píxeles</h1>
  <img id="flag" width="140" height="100" alt="Bandera generada: tres franjas verticales verde, blanca y roja">
  <p class="note">Si el relleno falta, la bandera sale torcida o incompleta (al archivo le faltan bytes).</p>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 30rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.5rem; }
img { display: block; image-rendering: pixelated; border: 1px solid #64748b; }
.note { font-size: 0.85rem; color: #475569; }
```

# JavaScript

```javascript
function writeBmp(width, height, colorAt) {
  const rowSize = width * 3; // TODO: cada fila ocupa un múltiplo de 4 bytes
  const view = new DataView(new ArrayBuffer(54 + rowSize * height));
  view.setUint16(0, 0x4d42, true);              // 'BM'
  view.setUint32(2, view.byteLength, true);     // tamaño del archivo
  view.setUint32(10, 54, true);                 // posición de los píxeles
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);              // positiva: filas de abajo arriba
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(34, rowSize * height, true);   // tamaño de los píxeles
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

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
const GREEN = [0, 104, 71];
const WHITE = [255, 255, 255];
const RED = [206, 17, 38];
const flagColor = (x, width) => (x < width / 3 ? GREEN : x < (2 * width) / 3 ? WHITE : RED);

// Un lector correcto: lee el píxel (x, y) contando el relleno como manda el formato.
function pixelAt(buffer, x, y) {
  const view = new DataView(buffer);
  const width = view.getInt32(18, true);
  const height = view.getInt32(22, true);
  const at = view.getUint32(10, true) + (height - 1 - y) * Math.ceil((width * 3) / 4) * 4 + x * 3;
  if (at + 3 > buffer.byteLength) return 'fuera del archivo';
  return [view.getUint8(at + 2), view.getUint8(at + 1), view.getUint8(at)];
}
function check(description, run, expected) {
  let actual;
  try {
    actual = JSON.stringify(run());
  } catch (error) {
    actual = JSON.stringify(error.name);
  }
  if (actual === JSON.stringify(expected)) console.log('✅', description);
  else console.error('❌', description, '→ esperaba', JSON.stringify(expected), 'y obtuve', actual);
}
const flagOf = (width, height) => writeBmp(width, height, (x) => flagColor(x, width));

check('4 × 2 píxeles (sin relleno) → 78 bytes', () => flagOf(4, 2).byteLength, 78);
check('5 × 3 píxeles → 102 bytes (filas de 16)', () => flagOf(5, 3).byteLength, 102);
check('5 × 3: el píxel (4, 0) es rojo', () => pixelAt(flagOf(5, 3), 4, 0), RED);
check('7 × 5: el campo «tamaño de los píxeles» vale 120', () => new DataView(flagOf(7, 5)).getUint32(34, true), 120);
check('7 × 5: los 35 píxeles tienen su color', () => {
  const file = flagOf(7, 5);
  for (let y = 0; y < 5; y += 1) {
    for (let x = 0; x < 7; x += 1) {
      if (JSON.stringify(pixelAt(file, x, y)) !== JSON.stringify(flagColor(x, 7))) return `mal en (${x}, ${y})`;
    }
  }
  return 'todos bien';
}, 'todos bien');

document.querySelector('#flag').src = URL.createObjectURL(new Blob([flagOf(7, 5)], { type: 'image/bmp' }));
```
