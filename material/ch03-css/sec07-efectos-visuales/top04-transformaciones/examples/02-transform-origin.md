---
example_description: "transform-origin es el punto fijo de la transformación: el mismo rotate(30deg) alrededor del centro, de la esquina superior izquierda o de la inferior derecha; y un scaleX que crece desde la izquierda como una barra de progreso"
example_tags: "css|transformaciones|transform-origin|rotate|scale"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">El mismo <code>rotate(30deg)</code>; el punto rojo es el <code>transform-origin</code>, lo único que no se mueve.</p>
<ul class="grid">
  <li><div class="cell"><div class="box is-center"><span class="pin"></span></div></div><code>center</code> (por defecto)</li>
  <li><div class="cell"><div class="box is-top-left"><span class="pin"></span></div></div><code>top left</code> (o <code>0 0</code>)</li>
  <li><div class="cell"><div class="box is-bottom-right"><span class="pin"></span></div></div><code>bottom right</code> (o <code>100% 100%</code>)</li>
</ul>

<p class="caption">Una barra al 60 %: <code>scaleX(0.6)</code> encoge hacia el centro; con <code>transform-origin: left</code>, desde la izquierda</p>
<p class="bar-label">Desde el centro</p>
<div class="track"><div class="fill"></div></div>
<p class="bar-label">Desde la izquierda</p>
<div class="track"><div class="fill is-from-left"></div></div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption,
.bar-label {
  margin: 8px 0 6px;
  font-size: 0.72rem;
}

.bar-label {
  margin: 6px 0 2px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 140px);
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.7rem;
}

.cell {
  position: relative;
  height: 130px;
  margin-bottom: 4px;
  background: #f1f5f9;
}

/* El sitio original, como en el ejemplo anterior. */
.cell::before,
.box {
  position: absolute;
  top: 40px;
  left: 30px;
  width: 80px;
  height: 50px;
  box-sizing: border-box;
}

.cell::before {
  content: "";
  border: 2px dashed #94a3b8;
}

.box {
  background: rgb(29 78 216 / 0.8);
  transform: rotate(30deg);
}

/* transform-origin fija el punto alrededor del cual se gira y desde el que
   se escala. Acepta palabras clave, porcentajes y longitudes, medidos sobre
   la propia caja. */
.is-center       { transform-origin: center; }
.is-top-left     { transform-origin: top left; }
.is-bottom-right { transform-origin: bottom right; }

/* El punto rojo se coloca en el mismo sitio que el origen de cada caja. */
.pin {
  position: absolute;
  width: 10px;
  height: 10px;
  margin: -5px 0 0 -5px;
  border-radius: 50%;
  background: #dc2626;
  box-shadow: 0 0 0 2px #ffffff;
}

.is-center .pin       { top: 50%; left: 50%; }
.is-top-left .pin     { top: 0; left: 0; }
.is-bottom-right .pin { top: 100%; left: 100%; }

.track {
  max-width: 400px;
  height: 16px;
  border-radius: 8px;
  background: #e2e8f0;
}

.fill {
  height: 100%;
  border-radius: 8px;
  background: #15803d;
  transform: scaleX(0.6);
}

/* Con el origen a la izquierda, el lado izquierdo no se mueve. Es la forma
   habitual de animar una barra (en el módulo de animación): mover transform
   es mucho más barato que cambiar width. */
.is-from-left {
  transform-origin: left;
}
```
