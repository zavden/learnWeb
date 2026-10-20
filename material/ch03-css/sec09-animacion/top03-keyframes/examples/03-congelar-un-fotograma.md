---
example_description: "Congelar una animación en un instante exacto: animation-play-state: paused más un retardo negativo (-0.25s = empezar ya avanzada un cuarto de segundo). Cinco copias de la misma animación lineal de 200px, congeladas en 0, 0,25, 0,5, 0,75 y 1 s, quedan a 0, 50, 100, 150 y 200px; la de 1 s necesita fill-mode both"
example_tags: "css|animaciones|animation-play-state|animation-delay|retardo-negativo|congelar|fill-mode"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">La misma animación de 1 s (200px a velocidad constante), congelada en cinco instantes. Las marcas de la carretera están cada 50px.</p>
<ul class="frames">
  <li style="--t: 0"><code>delay: 0s</code><span class="road"><span class="truck">🚚</span></span></li>
  <li style="--t: 0.25"><code>delay: -0.25s</code><span class="road"><span class="truck">🚚</span></span></li>
  <li style="--t: 0.5"><code>delay: -0.5s</code><span class="road"><span class="truck">🚚</span></span></li>
  <li style="--t: 0.75"><code>delay: -0.75s</code><span class="road"><span class="truck">🚚</span></span></li>
  <li style="--t: 1"><code>delay: -1s</code><span class="road"><span class="truck">🚚</span></span></li>
  <li style="--t: 1" class="is-no-fill"><code>-1s, sin both</code><span class="road"><span class="truck">🚚</span></span></li>
</ul>
<p class="caption">La última fila es el instante 1 s sin <code>fill-mode: both</code>: la animación ya ha terminado y el camión vuelve a su sitio (lo explica el ejemplo siguiente). Marca la casilla para verla en marcha durante 2 s (con «reducir movimiento», el camión no se mueve: las copias congeladas cuentan lo mismo).</p>
<label class="control"><input type="checkbox" id="go"> Arrancar</label>
<p class="road is-live"><span class="truck">🚚</span></p>
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

.frames {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.72rem;
}

.frames li {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.frames code {
  width: 110px;
}

/* La carretera: 200px de recorrido + 24px del camión, con una marca cada 50px. */
.road {
  position: relative;
  display: block;
  width: 224px;
  height: 24px;
  margin: 0;
  border-radius: 4px;
  background:
    repeating-linear-gradient(90deg, #64748b 0 2px, transparent 2px 50px) 11px 100% / 202px 6px no-repeat,
    #e2e8f0;
}

.truck {
  position: absolute;
  left: 0;
  width: 24px;
  font-size: 1.1rem;
  line-height: 24px;
  text-align: center;
  scale: -1 1;                  /* el emoji mira a la izquierda: lo reflejamos */
}

@keyframes drive {
  from { translate: 0 0; }
  to   { translate: 200px 0; }
}

/* LA TÉCNICA:
   - paused: la animación existe pero su reloj no avanza;
   - un retardo NEGATIVO hace que empiece «ya avanzada»: con -0.25s, el primer
     fotograma que se pinta es el del instante 0,25 s.
   Las dos juntas dejan el elemento quieto exactamente en ese instante. */
.frames .truck {
  animation: drive 1s linear both paused;
  animation-delay: calc(var(--t) * -1s);
}

/* Con un retardo igual a toda la duración, la animación ya ha terminado: sin
   both (o forwards), el elemento vuelve a su estado sin animar. */
.is-no-fill .truck {
  animation-fill-mode: none;
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

.is-live {
  margin-top: 8px;
}

@media (prefers-reduced-motion: no-preference) {
  body:has(#go:checked) .is-live .truck {
    animation: drive 2s linear both;
  }
}
```
