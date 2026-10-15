---
example_description: "mix-blend-mode mezcla los píxeles de un elemento con lo que tiene debajo, como las capas de un programa de retoque: el mismo círculo ámbar sobre La gran ola con normal, multiply, screen, overlay, difference y color"
example_tags: "css|mezclas|mix-blend-mode|multiply|screen|difference"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">Un círculo ámbar (<code>#f59e0b</code>) encima de la estampa, con un modo de mezcla distinto en cada caja</p>
<ul class="grid">
  <li><div class="tile"><span class="dot"></span></div><code>normal</code>: tapa lo de abajo</li>
  <li><div class="tile"><span class="dot multiply"></span></div><code>multiply</code>: solo oscurece, como dos filtros de color juntos</li>
  <li><div class="tile"><span class="dot screen"></span></div><code>screen</code>: solo aclara, como dos proyectores sobre la misma pared</li>
  <li><div class="tile"><span class="dot overlay"></span></div><code>overlay</code>: tiñe y conserva luces y sombras</li>
  <li><div class="tile"><span class="dot difference"></span></div><code>difference</code>: resta los colores</li>
  <li><div class="tile"><span class="dot color"></span></div><code>color</code>: el tono del círculo, la luz de la estampa</li>
</ul>
<p class="credit">Katsushika Hokusai, <cite>La gran ola de Kanagawa</cite>, c. 1831. Dominio público.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption,
.credit {
  margin: 8px 0 6px;
  font-size: 0.72rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 140px);
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.7rem;
}

.tile {
  display: grid;
  place-items: center;
  height: 94px;
  margin-bottom: 3px;
  background: url("hokusai-gran-ola.jpg") 30% 40% / 260px auto;
}

.dot {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #f59e0b;
}

/* mix-blend-mode decide cómo se combina cada píxel del elemento (la «fuente»)
   con el píxel que ya está pintado debajo (el «fondo»). Las fórmulas son las de
   los modos de capa de Photoshop o GIMP, canal a canal, con valores de 0 a 1:
   multiply = fuente × fondo         → nunca aclara; × 1 (blanco) no cambia nada
   screen   = 1 − (1 − f) × (1 − b)  → nunca oscurece; el negro no cambia nada
   difference = |fuente − fondo|     → negro donde son iguales
   Los modos color, hue, saturation y luminosity mezclan por tono y luz. */
.multiply   { mix-blend-mode: multiply; }
.screen     { mix-blend-mode: screen; }
.overlay    { mix-blend-mode: overlay; }
.difference { mix-blend-mode: difference; }
.color      { mix-blend-mode: color; }
```
