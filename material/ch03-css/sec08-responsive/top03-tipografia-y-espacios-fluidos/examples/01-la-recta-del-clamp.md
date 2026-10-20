---
example_description: "Texto fluido calculado paso a paso: 16px con una ventana de 320px y 20px con una de 1200px, en línea recta entre medias: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem). Debajo, el valor preferido y el usado para el ancho actual"
example_tags: "css|responsive|tipografia-fluida|clamp|vw|rem|calc"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="fluid">El pan de muerto se hornea en México a finales de octubre: una masa de huevo y mantequilla perfumada con azahar, con «huesitos» encima y una lluvia de azúcar.</p>

<dl class="readout">
  <dt>Ventana</dt><dd><output class="width"></output></dd>
  <dt>Preferido: <code>0.9091rem + 0.4545vw</code></dt><dd><output class="preferred"></output></dd>
  <dt>Usado (entre 16 y 20px)</dt><dd><output class="used"></output></dd>
</dl>
<p class="caption">A 480px (esta tarjeta): 16.73px. Ensancha la vista previa o ábrela con ↗: a 760px, 18px; a 1200px, 20px. A 1920px el preferido sería 23.27px, pero <code>clamp()</code> lo deja en 20.</p>
```

# CSS

```css
body {
  font-family: Georgia, serif;
  color: #1e293b;
  background: #ffffff;
}

/* La recta que pasa por (320px, 16px) y (1200px, 20px):
     pendiente = (20 − 16) / (1200 − 320) = 0.004545 px por cada px de ventana
               → × 100 = 0.4545vw (1vw es el 1 % de la ventana)
     corte     = 16 − 0.004545 × 320 = 14.5455px = 0.9091rem
   clamp() la limita: nunca menos de 1rem (16px) ni más de 1.25rem (20px). */
.fluid {
  max-width: 34rem;
  font-size: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
  line-height: 1.5;
}

.readout {
  display: grid;
  grid-template-columns: auto auto;
  justify-content: start;
  gap: 2px 12px;
  margin: 12px 0 0;
  font-family: system-ui, sans-serif;
  font-size: 0.75rem;
}

.readout dd { margin: 0; font-weight: 700; }
.caption { font-family: system-ui, sans-serif; font-size: 0.72rem; }
```

# JavaScript

```javascript
// Adelanto: JavaScript (capítulos 5 y 6). Lee el ancho de la ventana y el
// font-size que calculó el navegador, y los escribe en la tabla. Se repite
// cada vez que cambia el tamaño de la vista previa.
const text = document.querySelector('.fluid');

function showSizes() {
  const width = window.innerWidth;
  const preferred = 14.5455 + 0.004545 * width;          // la recta, en px
  const used = parseFloat(getComputedStyle(text).fontSize);
  document.querySelector('.width').textContent = `${width}px`;
  document.querySelector('.preferred').textContent = `${preferred.toFixed(2)}px`;
  document.querySelector('.used').textContent = `${used.toFixed(2)}px`;
}

showSizes();
window.addEventListener('resize', showSizes);
```
