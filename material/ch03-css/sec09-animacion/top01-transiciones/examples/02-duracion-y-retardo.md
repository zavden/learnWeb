---
example_description: "transition-property, transition-duration y transition-delay con cuatro interruptores que cambian a la vez: 150 ms, 400 ms, 1 s y 400 ms con 600 ms de retardo. En el atajo, el primer tiempo es la duración y el segundo el retardo"
example_tags: "css|transiciones|transition-duration|transition-delay|transition-property|atajo"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">Marca la casilla: los cuatro interruptores cambian a la vez, pero cada uno tarda lo suyo. El último espera 0,6 s antes de empezar. Desmárcala para verlos volver.</p>
<label class="control"><input type="checkbox" id="notify"> Activar las notificaciones</label>
<ul class="rows">
  <li><span class="switch"><span class="knob is-fast"></span></span><code>150ms</code></li>
  <li><span class="switch"><span class="knob is-base"></span></span><code>400ms</code></li>
  <li><span class="switch"><span class="knob is-slow"></span></span><code>1s</code></li>
  <li><span class="switch"><span class="knob is-late"></span></span><code>400ms 600ms</code>: dura 0,4 s y espera 0,6 s</li>
</ul>
<p class="caption">Con «reducir movimiento», las bolas saltan y solo se funde su color, con las mismas duraciones.</p>
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

.rows {
  display: grid;
  gap: 10px;
  margin: 12px 0;
  padding: 0;
  list-style: none;
  font-size: 0.75rem;
}

.rows li {
  display: flex;
  gap: 12px;
  align-items: center;
}

.switch {
  display: block;
  width: 48px;
  height: 24px;
  border-radius: 999px;
  background: #e2e8f0;
  box-shadow: inset 0 0 0 1px #64748b;
}

.knob {
  display: block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #64748b;
}

/* El estado final: la bola a la derecha y en verde. */
body:has(#notify:checked) .knob {
  translate: 24px 0;
  background: #15803d;
}

/* Las cuatro propiedades de una transición, escritas por separado:
     transition-property:        qué propiedad (o una lista, separada por comas)
     transition-duration:        cuánto tarda (sin ella, 0s: no hay transición)
     transition-timing-function: con qué curva (lección siguiente; por defecto, ease)
     transition-delay:           cuánto espera antes de empezar
   El atajo transition las reúne. Si lleva DOS tiempos, el primero es la
   duración y el segundo el retardo: «400ms 600ms» = dura 0,4 s, espera 0,6 s. */
.is-fast { transition: background-color 150ms; }
.is-base { transition: background-color 400ms; }
.is-slow { transition: background-color 1s; }
.is-late {
  transition-property: background-color;
  transition-duration: 400ms;
  transition-delay: 600ms;
}

/* Con movimiento: la misma lista, añadiendo translate. Una lista por elemento:
   cada propiedad con su duración (y su retardo), separadas por comas. */
@media (prefers-reduced-motion: no-preference) {
  .is-fast { transition: background-color 150ms, translate 150ms; }
  .is-base { transition: background-color 400ms, translate 400ms; }
  .is-slow { transition: background-color 1s, translate 1s; }
  .is-late { transition: background-color 400ms 600ms, translate 400ms 600ms; }
}
```
