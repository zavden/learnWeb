---
example_description: "filter de CSS sobre un canvas solo cambia cómo se VE: sus píxeles (getImageData, toBlob, una descarga) siguen en color. ctx.filter, en cambio, se aplica al dibujar y cambia los píxeles, y lo calcula el motor gráfico del navegador (normalmente en la GPU), sin un bucle de JavaScript"
example_tags: "javascript|canvas|filter|ctx-filter|pixeles|gpu|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Versión en blanco y negro</h1>
  <div class="pair">
    <figure>
      <canvas id="css-filter" class="grayscale" width="400" height="275" role="img" aria-label="Valle de México en gris (solo a la vista)"></canvas>
      <figcaption>🐛 filter de CSS</figcaption>
    </figure>
    <figure>
      <canvas id="ctx-filter" width="400" height="275" role="img" aria-label="Valle de México en gris"></canvas>
      <figcaption>✅ ctx.filter</figcaption>
    </figure>
  </div>
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
  gap: 1rem;
}
figure {
  margin: 0;
}
canvas {
  display: block;
  width: 200px;
  height: auto;
}
/* El filtro de CSS: el compositor pinta el canvas en gris, sin tocar su mapa de bits */
.grayscale {
  filter: grayscale(1);
}
.credit {
  font-size: 0.8rem;
  color: #52606d;
}
```

# JavaScript

```javascript
const img = new Image();
img.crossOrigin = 'anonymous';
img.src = 'valley-of-mexico.jpg';
await img.decode();

function paint(canvas, contextFilter) {
  const ctx = canvas.getContext('2d');
  ctx.filter = contextFilter;                 // 'none' por defecto; afecta a lo que se dibuje DESPUÉS
  ctx.drawImage(img, 0, 0, 400, 275);
  ctx.fillStyle = '#e11d48';                  // una muestra roja en la esquina, para leerla
  ctx.fillRect(0, 0, 40, 40);
  const [r, g, b] = ctx.getImageData(20, 20, 1, 1).data;
  return { r, g, b };
}

const seen = paint(document.querySelector('#css-filter'), 'none');
console.log(`🐛 filter de CSS: se ve gris, pero el píxel (20, 20) es ${seen.r}, ${seen.g}, ${seen.b}`);
const real = paint(document.querySelector('#ctx-filter'), 'grayscale(1)');
console.log('✅ ctx.filter: en el píxel (20, 20), R = G = B →', real.r === real.g && real.g === real.b);

// ctx.filter acepta las mismas funciones que filter de CSS: blur(4px), contrast(1.5),
// sepia(1)… y las calcula el motor gráfico del navegador (normalmente en la GPU, muchos píxeles
// a la vez). Un bucle de JavaScript recorre los píxeles uno a uno.
```
