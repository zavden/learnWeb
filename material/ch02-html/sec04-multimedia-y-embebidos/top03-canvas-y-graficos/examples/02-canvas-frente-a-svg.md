---
example_description: "El mismo dibujo en SVG y en canvas: el SVG guarda formas (elementos que el CSS alcanza); el canvas solo guarda píxeles"
example_tags: "html|canvas|svg|pixeles|getimagedata"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<!-- Pasa el ratón por los círculos de los dos dibujos: solo reaccionan los del SVG. -->
<div class="pair">
  <figure>
    <!-- SVG: tres elementos circle en el documento -->
    <svg id="vector" width="240" height="100" viewBox="0 0 240 100" role="img" aria-label="Tres círculos azules">
      <circle cx="40" cy="50" r="30" fill="#0e7490"/>
      <circle cx="120" cy="50" r="30" fill="#0e7490"/>
      <circle cx="200" cy="50" r="30" fill="#0e7490"/>
    </svg>
    <figcaption>SVG: formas</figcaption>
  </figure>

  <figure>
    <!-- canvas: un único elemento; los círculos son solo píxeles de color -->
    <canvas id="raster" width="240" height="100" role="img" aria-label="Tres círculos azules"></canvas>
    <figcaption>canvas: píxeles</figcaption>
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

/* El CSS alcanza a cada forma del SVG; al canvas, solo como un todo */
circle:hover {
  fill: #b45309;
}
```

# JavaScript

```javascript
// Adelanto: la API 2D se estudia en el capítulo 6. arc dibuja un círculo: centro, radio y ángulos.
const raster = document.getElementById('raster');
const ctx = raster.getContext('2d');
ctx.fillStyle = '#0e7490';
for (const x of [40, 120, 200]) {
  ctx.beginPath();
  ctx.arc(x, 50, 30, 0, 2 * Math.PI);
  ctx.fill();
}

console.log('circle en el SVG →', document.querySelectorAll('#vector circle').length);
console.log('elementos dentro del canvas →', raster.children.length);
// Lo único que recuerda el canvas: el color de cada píxel (rojo, verde, azul, opacidad)
console.log('píxel (40, 50) del canvas →', [...ctx.getImageData(40, 50, 1, 1).data]);
```
