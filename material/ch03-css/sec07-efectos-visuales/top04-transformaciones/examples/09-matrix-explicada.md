---
example_description: "Toda transformación 2D es una matriz de seis números: rotate(30deg) es matrix(cos 30°, sin 30°, −sin 30°, cos 30°, 0, 0) = matrix(0.866025, 0.5, -0.5, 0.866025, 0, 0), y las dos cajas coinciden píxel a píxel; getComputedStyle devuelve siempre la matriz"
example_tags: "css|transformaciones|matrix|getcomputedstyle|matematicas"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">En cada fila, la caja azul usa la función y la línea naranja discontinua, su <code>matrix(a, b, c, d, e, f)</code>. Si coinciden, la naranja se dibuja justo encima.</p>
<ul class="rows">
  <li><div class="cell"><div class="box f-rotate"></div><div class="box m-rotate"></div></div>
    <code>rotate(30deg)</code> = <code>matrix(0.866025, 0.5, -0.5, 0.866025, 0, 0)</code><br>a = cos 30°, b = sin 30°, c = −sin 30°, d = cos 30°</li>
  <li><div class="cell"><div class="box f-scale"></div><div class="box m-scale"></div></div>
    <code>scale(1.5, 0.6)</code> = <code>matrix(1.5, 0, 0, 0.6, 0, 0)</code><br>a escala x, d escala y</li>
  <li><div class="cell"><div class="box f-skew"></div><div class="box m-skew"></div></div>
    <code>skewX(20deg)</code> = <code>matrix(1, 0, 0.36397, 1, 0, 0)</code><br>c = tan 20°: x avanza 0,364px por cada px de y</li>
  <li><div class="cell"><div class="box f-translate"></div><div class="box m-translate"></div></div>
    <code>translate(40px, 10px)</code> = <code>matrix(1, 0, 0, 1, 40, 10)</code><br>e y f son el desplazamiento</li>
</ul>

<p class="caption">Lo que guarda el navegador (<code>getComputedStyle</code>):</p>
<ul class="readouts">
  <li><code>rotate(30deg)</code> → <output id="out-rotate"></output></li>
  <li><code>rotate(30deg) translateX(40px)</code> → <output id="out-combined"></output></li>
</ul>
<div class="probe"></div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 8px 0 6px;
  font-size: 0.72rem;
}

.rows,
.readouts {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.7rem;
}

.rows li {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
}

.cell {
  position: relative;
  flex: none;
  width: 130px;
  height: 80px;
  background: #f1f5f9;
}

.box {
  position: absolute;
  top: 20px;
  left: 25px;
  width: 60px;
  height: 40px;
  box-sizing: border-box;
}

/* La función: relleno azul. La matriz: solo un borde naranja discontinuo. */
[class*="f-"] { background: rgb(29 78 216 / 0.7); }
[class*="m-"] { border: 2px dashed #ea580c; }

/* matrix(a, b, c, d, e, f) es la matriz
       | a  c  e |
       | b  d  f |
       | 0  0  1 |
   y lleva cada punto (x, y) de la caja (medido desde transform-origin) a
       x' = a·x + c·y + e
       y' = b·x + d·y + f
   Girar un ángulo θ es a = cos θ, b = sin θ, c = −sin θ, d = cos θ. */
.f-rotate    { transform: rotate(30deg); }
.m-rotate    { transform: matrix(0.866025, 0.5, -0.5, 0.866025, 0, 0); }

.f-scale     { transform: scale(1.5, 0.6); }
.m-scale     { transform: matrix(1.5, 0, 0, 0.6, 0, 0); }

.f-skew      { transform: skewX(20deg); }
.m-skew      { transform: matrix(1, 0, 0.36397, 1, 0, 0); }

/* e y f no dependen de x ni de y: mueven todos los puntos por igual. */
.f-translate { transform: translate(40px, 10px); }
.m-translate { transform: matrix(1, 0, 0, 1, 40, 10); }

.readouts li {
  margin-bottom: 4px;
}

.readouts output {
  font-family: ui-monospace, Menlo, monospace;
  font-weight: 700;
}

/* Una caja invisible (pero con caja en el layout) solo para medirla. */
.probe {
  position: absolute;
  width: 1px;
  height: 1px;
  visibility: hidden;
  transform: rotate(30deg) translateX(40px);
}
```

# JavaScript

```javascript
// Adelanto: JavaScript (módulo del DOM). getComputedStyle devuelve el valor
// calculado de una propiedad: para un transform 2D, siempre una matrix().
const rotated = document.querySelector('.f-rotate');
const combined = document.querySelector('.probe');
document.querySelector('#out-rotate').textContent = getComputedStyle(rotated).transform;
document.querySelector('#out-combined').textContent = getComputedStyle(combined).transform;
```
