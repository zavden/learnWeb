---
example_description: "animation-iteration-count y animation-direction: la misma animación lineal de 1 s repetida tres veces en normal, reverse, alternate y alternate-reverse. Tres copias congeladas al 25 % de cada vuelta (números 1, 2 y 3) muestran hacia dónde va cada vuelta: alternate invierte las pares"
example_tags: "css|animaciones|animation-direction|animation-iteration-count|alternate|reverse|congelar"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">Una pista de 200px y una animación de 1 s de izquierda a derecha, repetida 3 veces. Las bolas numeradas (una fila por vuelta) son la bola congelada al 25 % de la vuelta 1, 2 y 3: a 50px de la salida si esa vuelta va hacia la derecha, a 150px si va hacia la izquierda. Marca la casilla para las cuatro en vivo (3 s).</p>
<label class="control"><input type="checkbox" id="play"> Reproducir</label>
<ul class="lanes">
  <li class="is-normal"><code>normal</code><span class="track"><span class="ghost" style="--lap: 0">1</span><span class="ghost" style="--lap: 1">2</span><span class="ghost" style="--lap: 2">3</span><span class="ball"></span></span></li>
  <li class="is-reverse"><code>reverse</code><span class="track"><span class="ghost" style="--lap: 0">1</span><span class="ghost" style="--lap: 1">2</span><span class="ghost" style="--lap: 2">3</span><span class="ball"></span></span></li>
  <li class="is-alternate"><code>alternate</code><span class="track"><span class="ghost" style="--lap: 0">1</span><span class="ghost" style="--lap: 1">2</span><span class="ghost" style="--lap: 2">3</span><span class="ball"></span></span></li>
  <li class="is-alternate-reverse"><code>alternate-reverse</code><span class="track"><span class="ghost" style="--lap: 0">1</span><span class="ghost" style="--lap: 1">2</span><span class="ghost" style="--lap: 2">3</span><span class="ball"></span></span></li>
</ul>
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

.lanes {
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.72rem;
}

.lanes li {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.lanes code {
  width: 120px;
}

.track {
  position: relative;
  width: 216px;
  height: 50px;
  border-radius: 8px;
  background: #e2e8f0;
}

.ghost,
.ball {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.ghost {
  top: calc(var(--lap) * 17px);        /* una fila por vuelta */
  background: rgb(29 78 216 / 0.25);
  color: #1e293b;
  font-size: 0.6rem;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
}

.ball {
  top: 17px;
  background: #1d4ed8;
}

@keyframes run {
  from { translate: 0 0; }
  to   { translate: 200px 0; }
}

.is-normal            { --direction: normal; }
.is-reverse           { --direction: reverse; }
.is-alternate         { --direction: alternate; }
.is-alternate-reverse { --direction: alternate-reverse; }

/* animation-iteration-count: cuántas vueltas (3, 1.5, o infinite).
   animation-direction: hacia dónde va cada vuelta.
   - normal: todas de from a to;  reverse: todas de to a from;
   - alternate: impares de from a to, pares al revés (ida y vuelta);
   - alternate-reverse: impares al revés, pares de from a to.
   Las congeladas: vuelta --lap (0, 1, 2) al 25 % → retardo −(lap + 0.25) s. */
.ghost {
  animation: run 1s linear 3 both paused;
  animation-direction: var(--direction);
  animation-delay: calc((var(--lap) + 0.25) * -1s);
}

@media (prefers-reduced-motion: no-preference) {
  body:has(#play:checked) .ball {
    animation: run 1s linear 3 both;
    animation-direction: var(--direction);
  }
}

/* Con iteration-count infinite, una animación no termina nunca: úsala solo
   para lo que de verdad no acaba (un indicador de carga) y con una forma de
   pararla (ejemplo siguiente). */
```
