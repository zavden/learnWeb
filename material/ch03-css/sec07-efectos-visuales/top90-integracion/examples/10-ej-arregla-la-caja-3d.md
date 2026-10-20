---
exercise: true
exercise_title: "Arregla la caja en 3D"
exercise_instructions: "La caja de té debería verse en 3D, con tres caras: frente, lado derecho y tapa. Ahora parece plana: pon la perspectiva en la escena para que todas las piezas compartan un punto de vista (TODO 1) || Alguien añadió overflow: hidden a la caja y aplana el 3D: quítalo (TODO 2) || La cara de la derecha aparece delante, de canto, en lugar de en su lado: corrige el orden de su transform (TODO 3) || Comprueba que las tres líneas de la lista marcan ✅"
exercise_hints: "Hay una propiedad perspective y una función perspective(); la función, al final de la lista, no hace nada || Las propiedades de agrupación (overflow, opacity, filter, clip-path…) obligan a preserve-3d a comportarse como flat || Lee la lista de izquierda a derecha: cada función mueve los ejes para la siguiente. ¿Hay que avanzar y luego girar, o girar y luego avanzar?"
exercise_solution_example: 10-ej-arregla-la-caja-3d-solucion.md
exercise_locked_files: index.html,script.js
example_stage: exercise
console: true
example_description: "Ejercicio: una caja de producto en 3D con tres errores (la perspectiva al final del transform, un overflow: hidden que aplana el preserve-3d y una cara con las funciones en el orden equivocado) que un pequeño script comprueba midiendo las caras"
example_tags: "css|ejercicio|preserve-3d|perspective|overflow|transformaciones-3d"
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

/* TODO 1: la escena no tiene perspectiva. */
.scene {
  display: grid;
  place-items: center;
  max-width: 300px;
  height: 220px;
  background: #ecfccb;
}

/* TODO 2: algo aplana la caja. */
.box {
  position: relative;
  width: 100px;
  height: 100px;
  overflow: hidden;
  transform-style: preserve-3d;
  transform: rotateX(-20deg) rotateY(-30deg) perspective(500px);
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

/* TODO 3: esta cara aparece delante, de canto. */
.is-right {
  background: #166534;
  transform: translateZ(50px) rotateY(90deg);
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
