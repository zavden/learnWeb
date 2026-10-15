---
example_description: "createImageData da un lienzo de números a cero; se calcula cada píxel y putImageData lo copia al canvas tal cual: reemplaza (no mezcla), ignora la transformación y globalAlpha, y un píxel semitransparente puede volver con una unidad de diferencia"
example_tags: "javascript|canvas|createimagedata|putimagedata|pixeles|alfa"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Mapa de calor de la sala 2</h1>
  <canvas id="heat" width="240" height="120" role="img" aria-label="Mapa de calor: dos zonas rojas, en la entrada y frente al cuadro principal, y un rectángulo transparente abajo a la derecha"></canvas>
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
canvas {
  display: block;
  border: 1px dashed #9aa5b1;
}
```

# JavaScript

```javascript
const ctx = document.querySelector('#heat').getContext('2d');
const { width, height } = ctx.canvas;
const image = ctx.createImageData(width, height);   // todos los números a 0: negro transparente
console.log(`createImageData → ${image.data.length} números, ¿todos 0? ${image.data.every((v) => v === 0)}`);

// Visitantes por zona: la entrada (60, 60) y el cuadro principal (180, 60)
const hotspots = [[60, 60], [180, 60]];
const cold = [219, 234, 254];   // #dbeafe
const hot = [220, 38, 38];      // #dc2626
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    let heat = 0;
    for (const [hx, hy] of hotspots) heat += Math.max(0, 1 - Math.hypot(x - hx, y - hy) / 80);
    const t = Math.min(heat, 1);                      // 0 = nadie, 1 = lleno
    const i = (y * width + x) * 4;
    for (let c = 0; c < 3; c++) image.data[i + c] = cold[c] + (hot[c] - cold[c]) * t;
    image.data[i + 3] = 255;                          // opaco
  }
}
ctx.putImageData(image, 0, 0);                        // copia los números al canvas, tal cual
const read = (x, y) => Array.from(ctx.getImageData(x, y, 1, 1).data).join(', ');
console.log('píxel (60, 60), en la entrada →', read(60, 60));

// putImageData REEMPLAZA: un bloque transparente deja un hueco (fillRect lo habría «mezclado»)
ctx.globalAlpha = 0.5;                                // y no le afecta globalAlpha…
ctx.translate(100, 0);                                // …ni la transformación
ctx.putImageData(ctx.createImageData(40, 30), 190, 80);
console.log('píxel (200, 90), tras poner un bloque transparente →', read(200, 90));

// Por dentro, el canvas guarda el color multiplicado por el alfa: un píxel semitransparente
// puede volver con una unidad de diferencia
const one = ctx.createImageData(1, 1);
one.data.set([200, 100, 50, 128]);
ctx.putImageData(one, 0, 0);
console.log('[200, 100, 50, 128] puesto y leído →', read(0, 0));
```
