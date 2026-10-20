---
example_description: "En una pantalla Retina (devicePixelRatio 2), un canvas con tantos píxeles como su tamaño CSS se ve borroso; multiplicando su mapa de bits por devicePixelRatio se ve nítido"
example_tags: "html|canvas|devicepixelratio|retina|borroso|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<!-- Compara las dos etiquetas de cerca. En una pantalla Retina, la de la izquierda tiene el
     texto y las rayas borrosos. En una pantalla normal (devicePixelRatio 1) se ven iguales:
     pon el zoom del navegador al 200 % (⌘ +) y vuelve a ejecutar el ejemplo. -->
<div class="pair">
  <figure>
    <!-- 🐛 Mapa de bits de 260 × 120 en una caja de 260 × 120 píxeles CSS. Con
         devicePixelRatio 2, esa caja ocupa 520 × 240 píxeles físicos: cada píxel del canvas
         se estira sobre 2 × 2 píxeles de la pantalla. -->
    <canvas id="blurry" width="260" height="120" role="img" aria-label="Etiqueta: semillas de tomate cherry, lote 2026-10"></canvas>
    <figcaption>❌ mapa de bits = tamaño CSS</figcaption>
  </figure>
  <figure>
    <!-- ✅ El script le da un mapa de bits de 260 × devicePixelRatio por 120 × devicePixelRatio -->
    <canvas id="sharp" role="img" aria-label="Etiqueta: semillas de tomate cherry, lote 2026-10"></canvas>
    <figcaption>✅ mapa de bits × devicePixelRatio</figcaption>
  </figure>
</div>
<p id="report"></p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* Las dos figuras una al lado de la otra (flexbox: capítulo de CSS) */
.pair {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

figure {
  margin: 0;
}

/* Las dos cajas miden lo mismo en la página */
canvas {
  width: 260px;
  height: 120px;
  border: 1px solid #64748b;
}
```

# JavaScript

```javascript
// Adelanto: la API 2D se estudia en el capítulo 6.
const cssWidth = 260;
const cssHeight = 120;
const ratio = window.devicePixelRatio; // píxeles físicos por píxel CSS (2 en una Retina)

// ✅ Tantos píxeles en el mapa de bits como píxeles físicos ocupa la caja…
const sharp = document.getElementById('sharp');
sharp.width = Math.round(cssWidth * ratio);
sharp.height = Math.round(cssHeight * ratio);
// …y scale() para seguir dibujando en unidades CSS (260 × 120), sin cambiar el código de dibujo
sharp.getContext('2d').scale(ratio, ratio);

function drawLabel(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fefce8';
  ctx.fillRect(0, 0, cssWidth, cssHeight);
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText('Semillas de tomate cherry', 12, 28);
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('Lote 2026-10 · 50 semillas', 12, 52);
  // Rayas de 1 px: donde más se nota el emborronado
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 12; x < 248; x += 6) {
    ctx.moveTo(x, 70);
    ctx.lineTo(x + 4, 108);
  }
  ctx.stroke();
}

drawLabel(document.getElementById('blurry'));
drawLabel(sharp);

const message = `devicePixelRatio: ${ratio} · mapas de bits: ${cssWidth} × ${cssHeight} y ${sharp.width} × ${sharp.height}`;
document.getElementById('report').textContent = message;
console.log(message);
```
