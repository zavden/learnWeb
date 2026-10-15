---
example_description: "Un tamaño de letra solo en vw no crece con el zoom del navegador: al ampliar, el viewport se encoge en píxeles CSS y el texto con él, así que en la pantalla mide lo mismo (incumple WCAG 1.4.4). Con clamp() y una parte en rem, crece. Pruébalo en una pestaña propia (↗) con ⌘ +"
example_tags: "css|responsive|tipografia-fluida|vw|zoom|accesibilidad|wcag|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption">Ábrelo con ↗ y pulsa <kbd>⌘</kbd> <kbd>+</kbd> varias veces (hasta 200 % o 300 %). Mira la columna «en pantalla»: los píxeles reales que ocupa cada letra. (Dentro de LearnWeb no se ve: el zoom agranda también el marco de la vista previa.)</p>

<h2 class="vw-only">❌ Solo vw: <code>4vw</code></h2>
<h2 class="clamped">✅ <code>clamp(1.25rem, 1rem + 1.5vw, 2.25rem)</code></h2>

<table class="readout">
  <thead><tr><th scope="col"></th><th scope="col">font-size (px CSS)</th><th scope="col">en pantalla</th></tr></thead>
  <tbody>
    <tr><th scope="row">❌ 4vw</th><td class="css-vw"></td><td class="screen-vw"></td></tr>
    <tr><th scope="row">✅ clamp()</th><td class="css-clamp"></td><td class="screen-clamp"></td></tr>
  </tbody>
</table>
<p class="caption">Ventana: <output class="width"></output> px CSS · <code>devicePixelRatio</code>: <output class="ratio"></output></p>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.caption { font-size: 0.72rem; }
h2 { margin: 8px 0; line-height: 1.2; }
h2 code { font-size: 0.6em; }

/* 🐛 El zoom (⌘ +) hace más grande cada píxel CSS, así que en la ventana
   caben MENOS: a 200 %, una ventana de 1000px mide 500px CSS. 4vw pasa de 40
   a 20px CSS, y como cada px CSS ocupa el doble, en la pantalla mide lo mismo.
   El texto no crece nunca: WCAG 1.4.4 pide poder ampliarlo al 200 %. */
.vw-only { font-size: 4vw; }

/* ✅ La parte en rem sí crece con el zoom, y el mínimo en rem garantiza que
   al final crezca del todo. Regla práctica: que el máximo no pase de 2,5
   veces el mínimo (aquí, 2.25 / 1.25 = 1,8). Además respeta la letra que el
   usuario elija en su navegador, porque rem depende de ella. */
.clamped { font-size: clamp(1.25rem, 1rem + 1.5vw, 2.25rem); }

.readout { border-collapse: collapse; font-size: 0.75rem; }
.readout th, .readout td { padding: 3px 8px; border: 1px solid #cbd5e1; text-align: end; }
```

# JavaScript

```javascript
// Adelanto: JavaScript (capítulos 5 y 6). Lee los tamaños calculados y el
// devicePixelRatio (px de pantalla por px CSS: 2 en una pantalla Retina al
// 100 %, 4 al 200 %). Se repite con cada cambio de tamaño, y el zoom lo es.
function showSizes() {
  const ratio = window.devicePixelRatio;
  for (const kind of ['vw', 'clamp']) {
    const heading = document.querySelector(kind === 'vw' ? '.vw-only' : '.clamped');
    const size = parseFloat(getComputedStyle(heading).fontSize);
    document.querySelector(`.css-${kind}`).textContent = size.toFixed(1);
    document.querySelector(`.screen-${kind}`).textContent = `${Math.round(size * ratio)} px`;
  }
  document.querySelector('.width').textContent = window.innerWidth;
  document.querySelector('.ratio').textContent = ratio;
}

showSizes();
window.addEventListener('resize', showSizes);
```
