---
example_description: "Layout thrashing: un bucle que en cada vuelta lee una medida y escribe un estilo obliga a recalcular el layout 200 veces; leer todas las medidas primero y escribir después cuesta un solo layout y es muchas veces más rápido"
example_tags: "javascript|dom|layout-thrashing|reflow|rendimiento|medidas|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<h2>🐛 Leer y escribir alternando</h2>
<div class="grid" id="bug-grid"></div>
<h2>✅ Primero leer, después escribir</h2>
<div class="grid" id="fixed-grid"></div>
<p id="result" role="status"></p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}
h2 {
  font-size: 1rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
  gap: 4px;
}
.thumb {
  height: 10px;
  border-radius: 4px;
  background: #93c5fd;
}
```

# JavaScript

```javascript
// Miniaturas que deben medir de alto la mitad de su ancho (el ancho lo
// decide el grid según el espacio). Hoy lo haría aspect-ratio en CSS; el
// patrón vale para cualquier medida que tengas que leer con JavaScript.
const COUNT = 200;
function fill(grid) {
  const thumbs = [];
  for (let i = 0; i < COUNT; i++) {
    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    thumbs.push(thumb);
  }
  grid.append(...thumbs);
  return thumbs;
}
const bugThumbs = fill(document.querySelector('#bug-grid'));
const fixedThumbs = fill(document.querySelector('#fixed-grid'));
fixedThumbs[0].offsetWidth; // un primer layout, para que las dos medidas empiecen igual

// 🐛 Cada vuelta LEE (fuerza el layout, porque la vuelta anterior escribió)
//    y ESCRIBE (deja el layout pendiente otra vez): 200 layouts.
let start = performance.now();
for (const thumb of bugThumbs) {
  const width = thumb.offsetWidth;
  thumb.style.height = `${width / 2}px`;
}
bugThumbs[0].offsetHeight; // el layout final, para comparar lo mismo
const thrashingMs = performance.now() - start;

// ✅ Por lotes: todas las lecturas (un layout) y después todas las escrituras.
start = performance.now();
const widths = fixedThumbs.map((thumb) => thumb.offsetWidth);
fixedThumbs.forEach((thumb, i) => {
  thumb.style.height = `${widths[i] / 2}px`;
});
fixedThumbs[0].offsetHeight; // el layout final
const batchedMs = performance.now() - start;

console.log(`🐛 alternando → ${thrashingMs.toFixed(1)} ms (varía)`);
console.log(`✅ por lotes → ${batchedMs.toFixed(1)} ms (varía)`);
console.log('¿por lotes es más rápido? →', batchedMs < thrashingMs);
console.log('alto de una miniatura →', fixedThumbs[0].style.height, '(varía con el ancho de la vista previa)');
document.querySelector('#result').textContent =
  `Alternando: ${thrashingMs.toFixed(1)} ms · por lotes: ${batchedMs.toFixed(1)} ms`;

// En DevTools › Performance, el primer bucle aparece como una fila de
// barras moradas de «Layout» con el aviso «Forced reflow».
```
