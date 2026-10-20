---
example_description: "Dos márgenes verticales que se tocan no se suman: 30px + 20px dejan 30px de separación (el mayor). Con uno negativo, sí se suman"
example_tags: "css|modelo-de-cajas|margin|colapso|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<div class="frame">
  <p class="first">margin-bottom: 30px</p>
  <p class="second">margin-top: 20px</p>
</div>
<p class="result" id="gap-result">Separación medida: …</p>

<div class="frame">
  <p class="first">margin-bottom: 30px</p>
  <p class="third">margin-top: -10px</p>
</div>
<p class="result" id="negative-result">Separación medida: …</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* 🐛 Esperarías 30 + 20 = 50px de hueco naranja. Hay 30px: los dos márgenes verticales
   ADYACENTES se fusionan («colapsan») en uno solo, del tamaño del mayor.
   Solo pasa con márgenes VERTICALES de cajas de bloque en el flujo normal; los horizontales nunca colapsan. */
.frame {
  display: flow-root;
  background: #fed7aa;
  margin-bottom: 8px;
}

p {
  margin: 0;
  padding: 8px 12px;
  background: #bfdbfe;
}

.first  { margin-bottom: 30px; }
.second { margin-top: 20px; }

/* Positivo + negativo: se SUMAN (30 + (−10) = 20px). Dos negativos: gana el más negativo. */
.third  { margin-top: -10px; }

.result {
  background: none;
  padding: 0 0 20px;
  font-weight: 600;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Aquí solo mide la distancia real entre las cajas.
function measureGap(frame, output) {
  const [top, bottom] = frame.querySelectorAll('p');
  const gap = bottom.getBoundingClientRect().top - top.getBoundingClientRect().bottom;
  output.textContent = `Separación medida: ${Math.round(gap)}px`;
}

const frames = document.querySelectorAll('.frame');
measureGap(frames[0], document.getElementById('gap-result'));      // 30px, no 50px
measureGap(frames[1], document.getElementById('negative-result')); // 20px
```
