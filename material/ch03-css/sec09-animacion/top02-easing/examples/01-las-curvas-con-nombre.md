---
example_description: "Las cinco curvas con nombre (linear, ease, ease-in, ease-out, ease-in-out) en una carrera de 1,5 s que todas terminan a la vez, y su «estroboscopio»: el mismo recorrido congelado en el 0, 25, 50, 75 y 100 % del tiempo; puntos juntos = lento, separados = rápido"
example_tags: "css|easing|transition-timing-function|ease|ease-in|ease-out|linear|congelar"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption">Los cinco puntos claros de cada pista son la misma bola congelada en el 0, 25, 50, 75 y 100 % del tiempo: donde están juntos, va despacio; donde se separan, rápido. El tercero es el instante 50 %. Marca la casilla para la carrera en vivo (1,5 s): todas salen y llegan a la vez.</p>
<label class="control"><input type="checkbox" id="race"> Correr</label>
<div class="race">
  <p class="lane is-linear"><code>linear</code><span class="track"><span class="ghost" style="--t: 0"></span><span class="ghost" style="--t: 0.25"></span><span class="ghost" style="--t: 0.5"></span><span class="ghost" style="--t: 0.75"></span><span class="ghost" style="--t: 1"></span><span class="runner"></span></span></p>
  <p class="lane is-ease"><code>ease</code><span class="track"><span class="ghost" style="--t: 0"></span><span class="ghost" style="--t: 0.25"></span><span class="ghost" style="--t: 0.5"></span><span class="ghost" style="--t: 0.75"></span><span class="ghost" style="--t: 1"></span><span class="runner"></span></span></p>
  <p class="lane is-ease-in"><code>ease-in</code><span class="track"><span class="ghost" style="--t: 0"></span><span class="ghost" style="--t: 0.25"></span><span class="ghost" style="--t: 0.5"></span><span class="ghost" style="--t: 0.75"></span><span class="ghost" style="--t: 1"></span><span class="runner"></span></span></p>
  <p class="lane is-ease-out"><code>ease-out</code><span class="track"><span class="ghost" style="--t: 0"></span><span class="ghost" style="--t: 0.25"></span><span class="ghost" style="--t: 0.5"></span><span class="ghost" style="--t: 0.75"></span><span class="ghost" style="--t: 1"></span><span class="runner"></span></span></p>
  <p class="lane is-ease-in-out"><code>ease-in-out</code><span class="track"><span class="ghost" style="--t: 0"></span><span class="ghost" style="--t: 0.25"></span><span class="ghost" style="--t: 0.5"></span><span class="ghost" style="--t: 0.75"></span><span class="ghost" style="--t: 1"></span><span class="runner"></span></span></p>
</div>
<p class="caption">En el 50 % del tiempo, la bola de <code>linear</code> va por la mitad (114 de 228px); la de <code>ease</code>, por el 80 % (183px); <code>ease-in</code>, por el 32 % (72px); <code>ease-out</code>, por el 68 % (156px); <code>ease-in-out</code>, por la mitad. Con «reducir movimiento», la carrera salta a la meta; los puntos congelados cuentan lo mismo.</p>
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

.race {
  margin: 12px 0;
}

.lane {
  display: flex;
  align-items: center;
  margin: 0 0 8px;
  font-size: 0.75rem;
}

.lane code {
  width: 90px;
}

/* La pista mide 240px y la bola 12px: la bola recorre 228px. */
.track {
  position: relative;
  width: 240px;
  height: 12px;
  border-radius: 6px;
  background: #e2e8f0;
}

.ghost,
.runner {
  position: absolute;
  top: 0;
  left: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

/* Una variable por pista con su curva. */
.is-linear      { --curve: linear; }
.is-ease        { --curve: ease; }
.is-ease-in     { --curve: ease-in; }
.is-ease-out    { --curve: ease-out; }
.is-ease-in-out { --curve: ease-in-out; }

/* Las bolas congeladas. Es una animación en pausa con un retardo negativo:
   «empieza ya avanzada --t segundos y quédate quieta ahí». La técnica se
   explica en la lección siguiente; aquí solo sirve para fotografiar la curva. */
.ghost {
  background: rgb(29 78 216 / 0.35);
  animation: travel 1s both paused;
  animation-timing-function: var(--curve);
  animation-delay: calc(var(--t) * -1s);
}

@keyframes travel {
  from { translate: 0 0; }
  to   { translate: 228px 0; }
}

/* La bola en vivo: una transición con la curva de su pista. */
.runner {
  background: #1d4ed8;
}

body:has(#race:checked) .runner {
  translate: 228px 0;
}

@media (prefers-reduced-motion: no-preference) {
  .runner {
    transition: translate 1.5s var(--curve);
  }
}

/* Las cinco son atajos de una cubic-bezier() (ejemplo siguiente):
     linear      = cubic-bezier(0, 0, 1, 1)
     ease        = cubic-bezier(0.25, 0.1, 0.25, 1)   (el valor por defecto)
     ease-in     = cubic-bezier(0.42, 0, 1, 1)
     ease-out    = cubic-bezier(0, 0, 0.58, 1)
     ease-in-out = cubic-bezier(0.42, 0, 0.58, 1) */
```
