---
example_description: "Asignar canvas.width o canvas.height (aunque sea el mismo valor) crea un mapa de bits nuevo: borra el dibujo y reinicia el pincel; hay que volver a dibujar"
example_tags: "html|canvas|width|redimensionar|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<!-- Pulsa ❌ y luego ✅. (onclick: los eventos se estudian en el capítulo de JavaScript.) -->
<p>
  <button type="button" onclick="resizeOnly()">❌ Cambiar el ancho</button>
  <button type="button" onclick="resizeAndRedraw()">✅ Cambiar el ancho y volver a dibujar</button>
</p>
<!-- Sin tamaño en el CSS, la caja mide lo que su mapa de bits: al cambiar width, cambia el ancho -->
<canvas id="banner" width="240" height="90" role="img" aria-label="Cartel: mercado del sábado"></canvas>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

canvas {
  border: 1px solid #64748b;
}

button:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Adelanto: la API 2D se estudia en el capítulo 6.
const banner = document.getElementById('banner');
const ctx = banner.getContext('2d');

function draw() {
  ctx.fillStyle = '#0e7490';
  ctx.fillRect(0, 0, banner.width, banner.height);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText('Mercado del sábado', 12, 52);
}

function nextWidth() {
  return banner.width === 240 ? 300 : 240;
}

// 🐛 Asignar width (o height) crea un mapa de bits NUEVO, transparente, y reinicia el pincel:
// el dibujo desaparece y fillStyle vuelve a ser negro. Pasa incluso con banner.width = banner.width.
function resizeOnly() {
  banner.width = nextWidth();
  console.log(`❌ width = ${banner.width} → dibujo borrado; fillStyle: ${ctx.fillStyle}`);
}

// ✅ Después de cambiar el tamaño, se vuelve a dibujar todo
function resizeAndRedraw() {
  banner.width = nextWidth();
  draw();
  console.log(`✅ width = ${banner.width} → redibujado; fillStyle: ${ctx.fillStyle}`);
}

draw();
console.log('Al empezar → fillStyle:', ctx.fillStyle);
```
