---
example_description: "Un canvas es un lienzo de píxeles vacío: width y height fijan su mapa de bits, y solo muestra algo cuando un script pinta en él (adelanto de la API 2D)"
example_tags: "html|canvas|api-2d|fillrect|filltext"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<!-- canvas: un rectángulo de píxeles. width y height, sin unidades, son el tamaño de su mapa de
     bits (si faltan, 300 × 150). Lo de dentro es el contenido alternativo: no se ve si hay
     JavaScript, pero sí lo leen los lectores de pantalla. -->
<canvas id="sign" width="320" height="160">
  <p>Cartel del huerto: abierto de 8:00 a 21:00.</p>
</canvas>
```

# CSS

```css
canvas {
  border: 1px solid #64748b;
}
```

# JavaScript

```javascript
// Adelanto: la API 2D (getContext, fillRect, fillText…) se estudia a fondo en el capítulo 6.
// Aquí basta con saber que el canvas está vacío hasta que un script pinta en él.
const canvas = document.getElementById('sign');
const ctx = canvas.getContext('2d'); // el «pincel» del lienzo, para dibujar en 2D

ctx.fillStyle = '#ecfdf5';           // color de relleno
ctx.fillRect(0, 0, 320, 160);        // rectángulo relleno: x, y, ancho, alto

ctx.strokeStyle = '#047857';         // color de las líneas
ctx.lineWidth = 4;
ctx.beginPath();                     // una línea de (20, 95) a (300, 95)
ctx.moveTo(20, 95);
ctx.lineTo(300, 95);
ctx.stroke();

ctx.fillStyle = '#064e3b';
ctx.font = 'bold 30px system-ui, sans-serif';
ctx.fillText('Huerto abierto', 20, 70);   // texto con su línea base en (20, 70)
ctx.font = '22px system-ui, sans-serif';
ctx.fillText('de 8:00 a 21:00', 20, 135);

console.log(`mapa de bits: ${canvas.width} × ${canvas.height} píxeles`);
```
