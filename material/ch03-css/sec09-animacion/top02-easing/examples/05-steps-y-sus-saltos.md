---
example_description: "steps() y sus saltos: una batería de cuatro rayas que se carga con steps(4) nunca enseña la cuarta raya mientras dura la animación (jump-end, el valor por defecto); jump-start nunca enseña la batería vacía, y para ver las cinco posiciones, de 0 a 4 rayas, hacen falta steps(5, jump-none)"
example_tags: "css|easing|steps|jump-start|jump-end|jump-none|jump-both|congelar|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">Una batería de 4 rayas que se carga de vacía a llena con <code>clip-path</code> y <code>steps()</code>. Cada fila congela la animación en el centro de cada escalón, y la última batería gris muestra el final. Marca la casilla para cargarlas en vivo (2 s).</p>
<label class="control"><input type="checkbox" id="charge"> Cargar</label>

<p class="label">❌ <code>steps(4)</code> = <code>steps(4, jump-end)</code>: 0, 1, 2 y 3 rayas; la cuarta solo al terminar</p>
<p class="row is-end"><span class="battery" style="--t: 0.125"><span></span></span><span class="battery" style="--t: 0.375"><span></span></span><span class="battery" style="--t: 0.625"><span></span></span><span class="battery" style="--t: 0.875"><span></span></span><span class="battery is-final"><span></span></span><span class="battery is-live"><span></span></span></p>

<p class="label"><code>steps(4, jump-start)</code>: 1, 2, 3 y 4 rayas; nunca se ve vacía</p>
<p class="row is-start"><span class="battery" style="--t: 0.125"><span></span></span><span class="battery" style="--t: 0.375"><span></span></span><span class="battery" style="--t: 0.625"><span></span></span><span class="battery" style="--t: 0.875"><span></span></span><span class="battery is-final"><span></span></span><span class="battery is-live"><span></span></span></p>

<p class="label">✅ <code>steps(5, jump-none)</code>: las cinco posiciones, de 0 a 4 rayas, el mismo tiempo cada una</p>
<p class="row is-none"><span class="battery" style="--t: 0.1"><span></span></span><span class="battery" style="--t: 0.3"><span></span></span><span class="battery" style="--t: 0.5"><span></span></span><span class="battery" style="--t: 0.7"><span></span></span><span class="battery" style="--t: 0.9"><span></span></span><span class="battery is-final"><span></span></span><span class="battery is-live"><span></span></span></p>

<p class="label"><code>steps(3, jump-both)</code>: 1, 2 y 3 rayas; ni vacía ni llena hasta el final</p>
<p class="row is-both"><span class="battery" style="--t: 0.1667"><span></span></span><span class="battery" style="--t: 0.5"><span></span></span><span class="battery" style="--t: 0.8333"><span></span></span><span class="battery is-final"><span></span></span><span class="battery is-live"><span></span></span></p>
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
  margin: 8px 0 4px;
  font-size: 0.72rem;
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

.row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin: 0 0 8px;
}

/* La batería: 4 rayas de 9px con 1px de separación (40px en total). */
.battery {
  position: relative;
  padding: 2px;
  border: 2px solid #1e293b;
  border-radius: 4px;
}

.battery::after {
  content: "";
  position: absolute;
  top: 5px;
  right: -6px;
  width: 3px;
  height: 8px;
  border-radius: 0 2px 2px 0;
  background: #1e293b;
}

.battery span {
  display: block;
  width: 40px;
  height: 16px;
  background: repeating-linear-gradient(90deg, #15803d 0 9px, transparent 9px 10px);
}

/* La carga: un recorte desde la derecha que pasa del 100 % (vacía) a 0 (llena).
   steps() convierte ese recorrido en escalones. */
@keyframes charge {
  from { clip-path: inset(0 100% 0 0); }
  to   { clip-path: inset(0 0 0 0); }
}

.is-end  { --steps: steps(4); }
.is-start { --steps: steps(4, jump-start); }
.is-none { --steps: steps(5, jump-none); }
.is-both { --steps: steps(3, jump-both); }

/* Congeladas en el instante --t (pausa + retardo negativo, lección siguiente). */
.battery span {
  animation: charge 1s both paused;
  animation-timing-function: var(--steps);
  animation-delay: calc(var(--t) * -1s);
}

/* El final: el retardo es toda la duración; con «both», se queda en el último fotograma. */
.is-final {
  --t: 1;
  border-color: #64748b;
}

/* En vivo, al marcar la casilla: 2 s, una vez, y se queda llena. */
.is-live {
  border-color: #1d4ed8;
}

.is-live span {
  animation-name: none;
  clip-path: inset(0 100% 0 0);      /* vacía hasta que se carga */
}

body:has(#charge:checked) .is-live span {
  animation: charge 2s both;
  animation-timing-function: var(--steps);
}

/* 🐛 steps(n) parte el tiempo en n tramos iguales y en cada uno enseña un
   valor fijo. La palabra que lo acompaña dice DÓNDE están los saltos:
   - jump-end (por defecto): saltos al final de cada tramo → 0, 1/4, 2/4, 3/4.
     El 4/4 solo aparece cuando la animación ha terminado (y si fill-mode lo
     conserva). Es lo correcto para una tira de fotogramas (sprite) de 4
     dibujos, pero no para una barra que debe llegar a llena.
   - jump-start: saltos al principio → 1/4, 2/4, 3/4, 4/4. Nunca enseña el 0.
   - jump-none: sin salto en los extremos: n tramos para n valores, del
     primero al último → con steps(5, jump-none): 0, 1/4, 2/4, 3/4, 4/4.
   - jump-both: saltos en los dos extremos → n tramos, n + 1 saltos.
   (step-start y step-end son steps(1, jump-start) y steps(1, jump-end).) */
```
