---
example_description: "Dar tamaño a un canvas solo con CSS no cambia su mapa de bits (300 × 150 por defecto): el navegador lo estira, y el dibujo sale deformado y borroso"
example_tags: "html|canvas|width|height|css|borroso|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<!-- Los dos canvas miden 240 × 240 en la página (por el CSS) y pintan lo mismo: un círculo
     centrado en su mapa de bits y una palabra. -->
<div class="pair">
  <figure>
    <!-- 🐛 Sin width ni height: el mapa de bits mide 300 × 150, y el CSS lo estira a 240 × 240
         (×0,8 en horizontal, ×1,6 en vertical) como si fuera una foto -->
    <canvas id="stretched" class="box" role="img" aria-label="Etiqueta roja con la palabra Tomate"></canvas>
    <figcaption>❌ solo CSS</figcaption>
  </figure>
  <figure>
    <!-- ✅ El mapa de bits mide lo mismo que la caja: 1 píxel del canvas = 1 píxel CSS -->
    <canvas id="exact" class="box" width="240" height="240" role="img" aria-label="Etiqueta roja con la palabra Tomate"></canvas>
    <figcaption>✅ width y height = tamaño CSS</figcaption>
  </figure>
</div>
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

/* El tamaño en la página. Al canvas de la izquierda le cambia el aspecto, no los píxeles. */
.box {
  width: 240px;
  height: 240px;
  border: 1px solid #64748b;
}
```

# JavaScript

```javascript
// Adelanto: la API 2D se estudia en el capítulo 6. Los dos canvas se pintan igual, en
// coordenadas de SU mapa de bits (canvas.width × canvas.height).
function drawBadge(canvas) {
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  ctx.fillStyle = '#be123c';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 60, 0, 2 * Math.PI); // un círculo de radio 60
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Tomate', centerX, centerY + 8);
  // clientWidth × clientHeight: el tamaño de su caja en la página, en píxeles CSS
  console.log(`#${canvas.id} → mapa de bits ${canvas.width} × ${canvas.height}, caja ${canvas.clientWidth} × ${canvas.clientHeight}`);
}

drawBadge(document.getElementById('stretched'));
drawBadge(document.getElementById('exact'));
```
