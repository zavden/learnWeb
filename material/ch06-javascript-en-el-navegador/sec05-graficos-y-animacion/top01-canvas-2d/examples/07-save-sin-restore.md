---
example_description: "save() apila el estado del contexto (transformación, colores, grosor, fuente…) y restore() lo desapila. Una función que sale antes de su restore() deja la pila desequilibrada: todo lo que se dibuja después hereda su giro y su color"
example_tags: "javascript|canvas|save|restore|estado|transformaciones|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Pegatinas de oferta</h1>
  <figure>
    <canvas id="buggy" width="300" height="170" role="img" aria-label="Tres frutas; desde el aguacate, el texto sale rojo, girado y desplazado"></canvas>
    <figcaption>🐛 return antes de restore()</figcaption>
  </figure>
  <figure>
    <canvas id="fixed" width="300" height="170" role="img" aria-label="Tres frutas en fila, con pegatinas de descuento en la primera y la tercera"></canvas>
    <figcaption>✅ restore() en cada salida</figcaption>
  </figure>
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
figure {
  margin: 0 0 1rem;
}
canvas {
  display: block;
  background: #ffffff;
}
```

# JavaScript

```javascript
function hiDPI(canvas) {
  const dpr = window.devicePixelRatio;
  const { width, height } = canvas;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

const products = [
  { label: 'Mango ataulfo', discount: 20 },
  { label: 'Aguacate hass', discount: 0 },   // sin oferta: no lleva pegatina
  { label: 'Papaya maradol', discount: 15 },
];

function drawSticker(ctx, x, y, discount, balanced) {
  ctx.save();                    // apila: transformación, fillStyle, font…
  ctx.translate(x, y);
  ctx.rotate(-0.25);             // ≈ -14°
  ctx.fillStyle = '#b91c1c';
  if (discount === 0) {          // sin oferta: no hay pegatina que dibujar
    if (balanced) ctx.restore(); // ✅ cada salida de la función desapila
    return;                      // 🐛 sin restore: el contexto se queda movido, girado y rojo
  }
  ctx.fillRect(-28, -11, 56, 22);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText(`-${discount} %`, -20, 5);
  ctx.restore();
}

function drawShelf(ctx, balanced) {
  const initial = ctx.getTransform().toString();
  ctx.font = '15px system-ui, sans-serif';
  products.forEach((product, i) => {
    const y = 30 + i * 40;
    drawSticker(ctx, 32, y - 5, product.discount, balanced);
    ctx.fillText(product.label, 70, y);           // el texto usa el estado ACTUAL del contexto
  });
  const same = ctx.getTransform().toString() === initial;
  console.log(`${balanced ? '✅' : '🐛'} al terminar: ¿transformación como al empezar? ${same} · fillStyle ${ctx.fillStyle}`);
}

drawShelf(hiDPI(document.querySelector('#buggy')), false);
drawShelf(hiDPI(document.querySelector('#fixed')), true);
```
