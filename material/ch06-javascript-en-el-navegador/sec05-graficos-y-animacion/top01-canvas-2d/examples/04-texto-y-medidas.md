---
example_description: "fillText pinta texto anclado en un punto: textAlign decide el lado (start, center, end…) y textBaseline la línea (alphabetic, middle, top…); measureText da el ancho con la fuente actual, para dibujar una etiqueta a la medida del precio"
example_tags: "javascript|canvas|filltext|textalign|textbaseline|measuretext"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Etiquetas de precio</h1>
  <canvas id="guides" width="300" height="90" role="img" aria-label="La palabra Pan alineada a la izquierda, al centro y a la derecha de una guía"></canvas>
  <canvas id="tags" width="300" height="90" role="img" aria-label="Etiquetas: Bolillo $4, Pan de muerto $45"></canvas>
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
  margin-bottom: 0.75rem;
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

// 1. El punto de anclaje: la guía roja es x = 150; la gris, y = 45
const guides = hiDPI(document.querySelector('#guides'));
console.log('por defecto →', guides.textAlign, '·', guides.textBaseline);
guides.fillStyle = '#dc2626';
guides.fillRect(149.5, 0, 1, 90);
guides.fillStyle = '#9aa5b1';
guides.fillRect(0, 44.5, 300, 1);
guides.font = '20px system-ui, sans-serif';
guides.fillStyle = '#1f2933';
guides.textBaseline = 'middle';       // y = el centro de las letras (no la línea donde se apoyan)
guides.textAlign = 'right';           // el texto ACABA en x
guides.fillText('Pan', 150, 25);
guides.textAlign = 'center';          // el texto se centra en x
guides.fillText('Pan', 150, 45);
guides.textAlign = 'left';            // el texto EMPIEZA en x
guides.fillText('Pan', 150, 65);

// 2. measureText: el ancho del texto con la fuente ACTUAL (ponla antes de medir)
const tags = hiDPI(document.querySelector('#tags'));
tags.font = 'bold 18px system-ui, sans-serif';
tags.textBaseline = 'middle';
function drawTag(text, x, y) {
  const width = tags.measureText(text).width; // depende de la fuente: no es igual en todos los equipos
  tags.fillStyle = '#0e7490';
  tags.beginPath();
  tags.roundRect(x, y - 16, width + 24, 32, 16); // 12 px de margen a cada lado del texto
  tags.fill();
  tags.fillStyle = '#ffffff';
  tags.fillText(text, x + 12, y);
  return width;
}
const shortWidth = drawTag('Bolillo $4', 10, 25);
const longWidth = drawTag('Pan de muerto $45', 10, 65);
console.log('la etiqueta larga es más ancha →', longWidth > shortWidth);
```
