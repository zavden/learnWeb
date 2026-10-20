---
example_description: "Las tres familias de medidas en una caja con scroll: offset* (caja de borde y posición respecto a su offsetParent), client* (el interior visible, sin bordes) y scroll* (todo el contenido y cuánto se ha desplazado). scrollTop se puede escribir y se limita a su máximo"
example_tags: "javascript|dom|offsetwidth|clientheight|scrollheight|scrolltop|medidas"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<section class="box" id="box" aria-label="Pasos de la receta" tabindex="0">
  <p class="step">1. Lavar los chiles</p>
  <p class="step">2. Tostar los chiles</p>
  <p class="step">3. Remojar 20 minutos</p>
  <p class="step" id="step-4">4. Moler con caldo</p>
  <p class="step">5. Freír la salsa</p>
  <p class="step">6. Añadir el chocolate</p>
</section>
```

# CSS

```css
.box {
  position: relative; /* será el offsetParent de los pasos */
  width: 200px;
  height: 120px;
  padding: 10px;
  border: 2px solid #64748b;
  overflow-y: auto;
  font-family: system-ui, sans-serif;
}
.step {
  height: 40px;
  margin: 0;
}
```

# JavaScript

```javascript
const box = document.querySelector('#box');

// offset*: la caja de BORDE (contenido + padding + borde), en enteros.
console.log('offsetWidth →', box.offsetWidth, '| offsetHeight →', box.offsetHeight);

// client*: el interior VISIBLE (contenido + padding, sin borde ni barra de scroll).
console.log('clientHeight →', box.clientHeight, '| clientTop (el borde) →', box.clientTop);

// scroll*: TODO el contenido, también lo que no se ve, y lo desplazado.
console.log('scrollHeight = 10 + 6 × 40 + 10 →', box.scrollHeight);
console.log('scrollTop →', box.scrollTop);
box.scrollTop = 50; // se puede escribir: desplaza la caja
console.log('scrollTop = 50 →', box.scrollTop);
box.scrollTop = 999; // …pero se limita a su máximo
console.log('scrollTop = 999 →', box.scrollTop, '= scrollHeight − clientHeight:', box.scrollHeight - box.clientHeight);
box.scrollTop = 0;

// offsetTop: la posición respecto al offsetParent (el antepasado posicionado
// más cercano), sin contar el scroll.
const step4 = document.querySelector('#step-4');
console.log('¿offsetParent es la caja? →', step4.offsetParent === box);
console.log('offsetTop del paso 4 = 10 + 3 × 40 →', step4.offsetTop);
```
