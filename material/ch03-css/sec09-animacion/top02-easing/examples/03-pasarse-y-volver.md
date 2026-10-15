---
example_description: "Una y mayor que 1 en cubic-bezier hace que el valor se pase del final y vuelva: con cubic-bezier(0.34, 1.56, 0.64, 1), el globo del carrito crece hasta ×1.10 a los 57 % del tiempo y se asienta en ×1. Curva dibujada, globos congelados con su escala y versión en vivo"
example_tags: "css|easing|cubic-bezier|overshoot|rebote|scale|congelar"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption"><code>cubic-bezier(0.34, 1.56, 0.64, 1)</code>: el primer punto de control está en y = 1.56, por encima del final, y la curva se pasa de la línea discontinua (el 100 %) antes de volver.</p>
<div class="row">
  <svg viewBox="-12 -80 144 212" width="144" height="212" aria-hidden="true">
    <rect x="0" y="0" width="120" height="120" class="frame" />
    <line x1="0" y1="0" x2="120" y2="0" class="target" />
    <line x1="0" y1="120" x2="40.8" y2="-67.2" class="handle" />
    <line x1="120" y1="0" x2="76.8" y2="0" class="handle" />
    <circle cx="40.8" cy="-67.2" r="3.5" class="point" />
    <circle cx="76.8" cy="0" r="3.5" class="point" />
    <path d="M0 120 C40.8 -67.2 76.8 0 120 0" class="curve" />
    <text x="46" y="-64">P1 (0.34, 1.56)</text>
    <text x="70" y="-20">máximo: 1.098</text>
  </svg>
  <div>
    <p class="label">El globo, congelado en estos instantes:</p>
    <ol class="frames">
      <li style="--t: 0"><span class="cart">🛒<span class="badge">3</span></span>0 %<br>×0</li>
      <li style="--t: 0.25"><span class="cart">🛒<span class="badge">3</span></span>25 %<br>×0.82</li>
      <li style="--t: 0.5"><span class="cart">🛒<span class="badge">3</span></span>50 %<br>×1.09</li>
      <li style="--t: 0.57"><span class="cart">🛒<span class="badge">3</span></span>57 %<br>×1.10</li>
      <li style="--t: 0.75"><span class="cart">🛒<span class="badge">3</span></span>75 %<br>×1.06</li>
      <li style="--t: 1"><span class="cart">🛒<span class="badge">3</span></span>100 %<br>×1</li>
    </ol>
    <label class="control"><input type="checkbox" id="add"> Añadir al carrito</label>
    <span class="cart is-live">🛒<span class="badge">3</span></span>
  </div>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption,
.label {
  margin: 8px 0;
  font-size: 0.72rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: start;
}

svg {
  display: block;
  overflow: visible;
  font-size: 9px;
}

.frame  { fill: #f8fafc; stroke: #64748b; }
.target { stroke: #15803d; stroke-dasharray: 4 3; }
.handle { stroke: #b45309; stroke-width: 1.5; }
.point  { fill: #b45309; }
.curve  { fill: none; stroke: #1e293b; stroke-width: 2; }
text    { fill: #1e293b; }

.frames {
  display: flex;
  gap: 10px;
  margin: 0 0 12px;
  padding: 0;
  list-style: none;
  font-size: 0.68rem;
  text-align: center;
}

.cart {
  position: relative;
  display: inline-block;
  margin: 6px 6px 4px;
  font-size: 1.5rem;
}

.frames .cart {
  display: block;
}

/* El globo crece desde su centro. scale 0 → 1. */
.badge {
  position: absolute;
  top: -6px;
  right: -8px;
  min-width: 18px;
  padding: 1px 4px;
  border-radius: 999px;
  background: #be123c;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
}

/* Congelados: pausa + retardo negativo (lección siguiente). */
.frames .badge {
  animation: pop 1s cubic-bezier(0.34, 1.56, 0.64, 1) both paused;
  animation-delay: calc(var(--t) * -1s);
}

@keyframes pop {
  from { scale: 0; }
  to   { scale: 1; }
}

/* En vivo: el globo aparece al marcar la casilla. Con «reducir movimiento»,
   solo se funde (opacity); el crecimiento con rebote va en no-preference. */
.is-live .badge {
  opacity: 0;
  scale: 0;
  transition: opacity 200ms;
}

body:has(#add:checked) .is-live .badge {
  opacity: 1;
  scale: 1;
}

@media (prefers-reduced-motion: no-preference) {
  .is-live .badge {
    transition: opacity 200ms, scale 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

/* Las y (y1 e y2) pueden ser cualquier número: por encima de 1, el valor se
   pasa del final; por debajo de 0, retrocede antes de salir. Las x, no:
   son tiempos y deben estar entre 0 y 1. Úsalo con mesura: un rebote del
   10 % en algo pequeño da vida; en un panel grande, marea. */

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
```
