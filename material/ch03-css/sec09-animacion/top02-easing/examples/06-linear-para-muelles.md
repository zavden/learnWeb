---
example_description: "linear() con muchos puntos imita un muelle o un rebote, cosas que una sola cubic-bezier no puede dibujar: 17 valores de un muelle amortiguado unidos con rectas (se pasa hasta 1.162 y oscila antes de asentarse) y un balón que bota tres veces"
example_tags: "css|easing|linear|muelle|rebote|spring|bounce|congelar"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">La función <code>linear()</code> une sus puntos con rectas. Con 17 puntos de un muelle (generados con el programa de Python de la lección), la curva se pasa del 100 % (línea verde), vuelve por debajo y se asienta. Las bolas azules son la animación congelada en 9 instantes: caen en los vértices.</p>
<div class="row">
  <div class="plot">
    <svg viewBox="-20 -50 200 230" width="200" height="230" aria-hidden="true">
      <rect x="0" y="0" width="160" height="160" class="frame" />
      <line x1="0" y1="0" x2="160" y2="0" class="target" />
      <polyline points="0,160 10,137.6 20,90.1 30,40.8 40,3 50,-18.7 60,-25.9 70,-23.4 80,-16 90,-7.8 100,-1.3 110,2.7 120,4.2 130,4 140,2.9 150,1.4 160,0" class="curve" />
    </svg>
    <div class="dots">
      <span style="--t: 0"><span></span></span>
      <span style="--t: 0.125"><span></span></span>
      <span style="--t: 0.25"><span></span></span>
      <span style="--t: 0.375"><span></span></span>
      <span style="--t: 0.5"><span></span></span>
      <span style="--t: 0.625"><span></span></span>
      <span style="--t: 0.75"><span></span></span>
      <span style="--t: 0.875"><span></span></span>
      <span style="--t: 1"><span></span></span>
    </div>
  </div>
  <div class="live">
    <label class="control"><input type="checkbox" id="play"> Reproducir</label>
    <div class="stage">
      <p class="chip">✓ Añadido a la cesta</p>
    </div>
    <div class="stage is-tall">
      <span class="ball"></span>
    </div>
    <p class="caption">Arriba, el aviso entra con el muelle (600 ms). Abajo, el balón cae y bota tres veces (1 s). Con «reducir movimiento», el aviso solo se funde y el balón aparece en el suelo.</p>
  </div>
</div>
```

# CSS

```css
/* Las dos curvas, en custom properties para escribirlas una sola vez. */
:root {
  --spring: linear(0, 0.14, 0.437, 0.745, 0.981, 1.117, 1.162, 1.146, 1.1, 1.049, 1.008, 0.983, 0.974, 0.975, 0.982, 0.991, 1);
  /* Con porcentajes, cada punto dice en qué momento llega: el balón toca el
     suelo (1) al 36.4 %, 72.7 %, 90.9 % y 100 % del tiempo. */
  --bounce: linear(0, 0.04 7.3%, 0.16 14.5%, 0.36 21.8%, 0.64 29.1%, 1 36.4%, 0.812 45.5%, 0.75 54.5%, 0.812 63.6%, 1 72.7%, 0.938 81.8%, 1 90.9%, 0.984 95.5%, 1);
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption {
  margin: 8px 0;
  font-size: 0.72rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: start;
}

.plot {
  position: relative;
  width: 200px;
  height: 230px;
}

svg {
  display: block;
}

.frame  { fill: #f8fafc; stroke: #64748b; }
.target { stroke: #15803d; stroke-dasharray: 4 3; }
.curve  { fill: none; stroke: #1e293b; stroke-width: 2; }

/* Origen de las bolas: abajo a la izquierda del gráfico (20px, 50 + 160px). */
.dots {
  position: absolute;
  top: 210px;
  left: 20px;
}

.dots > span {
  position: absolute;
  top: -5px;
  left: -5px;
  animation: along-time 1s linear both paused;
  animation-delay: calc(var(--t) * -1s);
}

.dots span span {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgb(29 78 216 / 0.6);
  animation: along-progress 1s var(--spring) both paused;
  animation-delay: calc(var(--t) * -1s);
}

@keyframes along-time     { to { translate: 160px 0; } }
@keyframes along-progress { to { translate: 0 -160px; } }

.live {
  flex: 1 1 200px;
}

.control {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 6px 10px;
  border: 1px solid #64748b;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.stage {
  position: relative;
  height: 56px;
  margin-top: 8px;
  overflow: clip;
  border-radius: 8px;
  background: #f1f5f9;
}

.stage.is-tall {
  height: 110px;
}

.chip {
  position: absolute;
  bottom: 10px;
  left: 10px;
  margin: 0;
  padding: 6px 12px;
  border-radius: 999px;
  background: #14532d;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0;
  transition: opacity 200ms;
}

/* El balón cae 80px: de arriba al suelo. */
.ball {
  position: absolute;
  top: 6px;
  left: calc(50% - 12px);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fdba74, #c2410c);
}

body:has(#play:checked) .chip {
  opacity: 1;
}

body:has(#play:checked) .ball {
  translate: 0 80px;
}

/* El aviso sube 40px con el muelle: se pasa unos 6px y vuelve. */
@media (prefers-reduced-motion: no-preference) {
  .chip {
    translate: 0 40px;
    transition: opacity 200ms, translate 600ms var(--spring);
  }

  body:has(#play:checked) .chip {
    translate: 0 0;
  }

  /* Solo en el estado de llegada «caído»: cae botando y, al desmarcar,
     vuelve arriba al instante (un bote contra el techo no tendría sentido). */
  body:has(#play:checked) .ball {
    transition: translate 1s var(--bounce);
  }
}

/* linear() no es «velocidad constante» (eso es la palabra linear sola): es
   una lista de valores de progreso unidos por rectas. Sin porcentajes, los
   puntos se reparten a partes iguales en el tiempo. Con suficientes puntos
   dibuja cualquier curva, también las que vuelven atrás varias veces. */
```
