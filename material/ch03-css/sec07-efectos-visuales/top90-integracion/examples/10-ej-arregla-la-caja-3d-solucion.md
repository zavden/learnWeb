---
example_stage: final-solution
example_description: "Solución: perspective en la escena (y fuera la función del final), sin overflow en el elemento con preserve-3d, y la cara derecha girada antes de avanzar: rotateY(90deg) translateZ(50px)"
example_tags: "css|solucion|preserve-3d|perspective|overflow|transformaciones-3d"
console: true
---

# HTML

```html
<div class="scene">
  <div class="box">
    <div class="face is-front">Té de<br>Chiapas</div>
    <div class="face is-right">Hojas<br>enteras</div>
    <div class="face is-top"></div>
  </div>
</div>

<ul class="checklist">
  <li>La escena tiene perspectiva: <output id="check-perspective">…</output></li>
  <li>La caja no se aplana: <output id="check-flat">…</output></li>
  <li>La cara derecha, a la derecha: <output id="check-order">…</output></li>
</ul>
```

# CSS

```css
body {
  color: #1e293b;
  font-family: system-ui, sans-serif;
}

/* ✅ 1: la propiedad perspective en el contenedor: un solo punto de vista.
   (La función perspective() al final del transform no hacía nada: solo
   afecta a lo que va detrás de ella en la lista.) */
.scene {
  display: grid;
  place-items: center;
  max-width: 300px;
  height: 220px;
  background: #ecfccb;
  perspective: 500px;
}

/* ✅ 2: sin overflow: hidden, preserve-3d vuelve a funcionar. Si hiciera
   falta recortar algo, iría en las caras. */
.box {
  position: relative;
  width: 100px;
  height: 100px;
  transform-style: preserve-3d;
  transform: rotateX(-20deg) rotateY(-30deg);
}

.face {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border: 2px solid #14532d;
  color: #ffffff;
  font-family: Georgia, serif;
  font-size: 0.85rem;
  font-weight: 700;
  text-align: center;
}

.is-front {
  background: #15803d;
  transform: translateZ(50px);
}

/* ✅ 3: primero gira (su eje z pasa a apuntar a la derecha) y después avanza
   50px por ese eje. Al revés, avanzaba hacia ti y giraba en su sitio. */
.is-right {
  background: #166534;
  transform: rotateY(90deg) translateZ(50px);
}

.is-top {
  background: repeating-linear-gradient(45deg, #4d7c0f 0 6px, #65a30d 6px 12px);
  transform: rotateX(90deg) translateZ(50px);
}

.checklist {
  padding-inline-start: 1.2em;
  color: #475569;
  font-size: 0.8rem;
}

.checklist output {
  color: #1e293b;
  font-weight: bold;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Este script lee los estilos
// calculados y mide dónde se pintan las caras; escribe ✅ o ❌ en la lista
// (y en la consola). No hace falta tocarlo: se vuelve a ejecutar con cada cambio.
function check(id, ok, detail) {
  const text = `${ok ? '✅' : '❌'} ${detail}`;
  document.getElementById(id).textContent = text;
  console.log(`${id}: ${text}`);
}

const scenePerspective = getComputedStyle(document.querySelector('.scene')).perspective;
check('check-perspective', scenePerspective !== 'none', `perspective: ${scenePerspective}`);

const boxOverflow = getComputedStyle(document.querySelector('.box')).overflow;
check('check-flat', boxOverflow === 'visible', `overflow: ${boxOverflow}`);

// getBoundingClientRect mide el rectángulo que ocupa cada cara YA proyectada.
// Bien colocada, el centro de la cara derecha queda unos 70px a la derecha del
// centro del frente; mal colocada, casi en el mismo sitio.
function centerX(selector) {
  const rect = document.querySelector(selector).getBoundingClientRect();
  return rect.left + rect.width / 2;
}
const gap = Math.round(centerX('.is-right') - centerX('.is-front'));
check('check-order', gap > 40, `el centro de la cara derecha está ${gap}px a la derecha del frente`);
```
