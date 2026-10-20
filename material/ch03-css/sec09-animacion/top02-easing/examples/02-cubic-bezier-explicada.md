---
example_description: "cubic-bezier(x1, y1, x2, y2) dibujada: el tiempo en horizontal, el progreso en vertical, los extremos fijos en (0, 0) y (1, 1) y los cuatro números como coordenadas de los dos puntos de control. Nueve bolas congeladas caen exactamente sobre la curva dibujada"
example_tags: "css|easing|cubic-bezier|curva|svg|congelar"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption"><code>cubic-bezier(0.2, 0, 0, 1)</code>, la curva <code>standard</code> de los tokens de movimiento del módulo de Sass. Las bolas azules son la animación congelada cada 1/8 del tiempo: caen sobre la curva que dibuja el SVG.</p>
<div class="figure">
  <div class="plot">
    <svg viewBox="-20 -20 200 200" width="200" height="200" aria-hidden="true">
      <rect x="0" y="0" width="160" height="160" class="frame" />
      <line x1="0" y1="80" x2="160" y2="80" class="grid" />
      <line x1="80" y1="0" x2="80" y2="160" class="grid" />
      <line x1="0" y1="160" x2="32" y2="160" class="handle" />
      <line x1="160" y1="0" x2="0" y2="0" class="handle" />
      <path d="M0 160 C32 160 0 0 160 0" class="curve" />
      <circle cx="32" cy="160" r="4" class="point" />
      <circle cx="0" cy="0" r="4" class="point" />
      <text x="-14" y="175">P0</text>
      <text x="26" y="175">P1</text>
      <text x="-16" y="-8">P2</text>
      <text x="152" y="-8">P3</text>
    </svg>
    <div class="dots">
      <span class="dot" style="--t: 0"><span></span></span>
      <span class="dot" style="--t: 0.125"><span></span></span>
      <span class="dot" style="--t: 0.25"><span></span></span>
      <span class="dot" style="--t: 0.375"><span></span></span>
      <span class="dot" style="--t: 0.5"><span></span></span>
      <span class="dot" style="--t: 0.625"><span></span></span>
      <span class="dot" style="--t: 0.75"><span></span></span>
      <span class="dot" style="--t: 0.875"><span></span></span>
      <span class="dot" style="--t: 1"><span></span></span>
      <span class="runner"><span></span></span>
    </div>
  </div>
  <ul class="legend">
    <li>Horizontal: el <strong>tiempo</strong> (de 0 a 1). Vertical: el <strong>progreso</strong> del valor.</li>
    <li><strong>P0 = (0, 0)</strong> y <strong>P3 = (1, 1)</strong> son fijos: se sale del principio y se llega al final.</li>
    <li><strong>P1 = (x1, y1) = (0.2, 0)</strong> tira de la salida.</li>
    <li><strong>P2 = (x2, y2) = (0, 1)</strong> tira de la llegada.</li>
    <li>La pendiente es la <strong>velocidad</strong>: muy inclinada al principio, plana al final (frena).</li>
  </ul>
</div>
<label class="control"><input type="checkbox" id="play"> Recorrer la curva en 1,5 s</label>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption {
  margin: 8px 0;
  font-size: 0.72rem;
}

.figure {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: start;
}

.plot {
  position: relative;
  width: 200px;
  height: 200px;
}

svg {
  display: block;
  overflow: visible;
  font-size: 10px;
}

.frame   { fill: #f8fafc; stroke: #64748b; }
.grid    { stroke: #cbd5e1; stroke-dasharray: 3 3; }
.handle  { stroke: #b45309; stroke-width: 1.5; }
.point   { fill: #b45309; }
.curve   { fill: none; stroke: #1e293b; stroke-width: 2; }
text     { fill: #1e293b; }

/* El origen de las bolas es la esquina de abajo a la izquierda del gráfico
   (20px de margen + 160px de alto). */
.dots {
  position: absolute;
  top: 180px;
  left: 20px;
}

.dot,
.runner {
  position: absolute;
  top: -5px;
  left: -5px;
}

.dot span,
.runner span {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgb(29 78 216 / 0.6);
}

/* Cada bola son dos cajas: la de fuera avanza en horizontal a velocidad
   constante (el tiempo); la de dentro sube con la curva (el progreso).
   Congeladas en el instante --t (pausa + retardo negativo, lección siguiente). */
.dot {
  animation: along-time 1s linear both paused;
  animation-delay: calc(var(--t) * -1s);
}

.dot span {
  animation: along-progress 1s cubic-bezier(0.2, 0, 0, 1) both paused;
  animation-delay: calc(var(--t) * -1s);
}

@keyframes along-time {
  to { translate: 160px 0; }
}

@keyframes along-progress {
  to { translate: 0 -160px; }
}

/* La bola en vivo: las mismas dos cajas, con transiciones. */
.runner span {
  background: #be123c;
}

body:has(#play:checked) .runner {
  translate: 160px 0;
}

body:has(#play:checked) .runner span {
  translate: 0 -160px;
}

@media (prefers-reduced-motion: no-preference) {
  .runner {
    transition: translate 1.5s linear;
  }

  .runner span {
    transition: translate 1.5s cubic-bezier(0.2, 0, 0, 1);
  }
}

.legend {
  flex: 1 1 200px;
  margin: 0;
  padding-left: 1.1rem;
  font-size: 0.75rem;
}

.legend li {
  margin-bottom: 4px;
}

.control {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  margin-top: 8px;
  padding: 6px 10px;
  border: 1px solid #64748b;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Las x (x1 y x2) son tiempos y tienen que estar entre 0 y 1: el tiempo no
   va hacia atrás. cubic-bezier(1.2, 0, 0.5, 1) es inválida y la declaración
   entera se ignora. Las y pueden salirse: el ejemplo siguiente lo aprovecha. */
```
