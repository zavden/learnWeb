---
example_description: "animation-play-state: una cinta de avisos que se desplaza sin fin (iteration-count infinite, solo translate) se pausa al pasar el ratón, al recibir el foco o con una casilla «Pausar los avisos». Todo lo que se mueve más de 5 s necesita una forma de pararlo; con reducir movimiento, la cinta es una lista quieta"
example_tags: "css|animaciones|animation-play-state|infinite|pausa|accesibilidad|wcag|prefers-reduced-motion"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">La única animación infinita de esta lección: la cinta da una vuelta cada 16 s. Pasa el ratón por encima, llega con <kbd>Tab</kbd> a un enlace o marca la casilla: se para donde está y sigue desde ahí.</p>
<label class="control"><input type="checkbox" id="pause"> Pausar los avisos</label>
<section class="ticker" aria-label="Avisos de la tienda">
  <div class="ticker__track">
    <ul class="ticker__list">
      <li><a href="/envios">Envío gratis desde $599</a></li>
      <li><a href="/talleres/terrarios">Taller de terrarios el sábado a las 11:00</a></li>
      <li><a href="/suculentas">2 × 1 en suculentas hasta el domingo</a></li>
    </ul>
    <!-- Copia para que la vuelta empalme sin hueco: oculta a lectores y al teclado. -->
    <ul class="ticker__list" aria-hidden="true" inert>
      <li><a href="/envios">Envío gratis desde $599</a></li>
      <li><a href="/talleres/terrarios">Taller de terrarios el sábado a las 11:00</a></li>
      <li><a href="/suculentas">2 × 1 en suculentas hasta el domingo</a></li>
    </ul>
  </div>
</section>
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

.ticker {
  margin-top: 12px;
  overflow: clip;
  border-radius: 8px;
  background: #14532d;
}

/* Por defecto (también con «reducir movimiento»): una lista quieta que se
   parte en varias líneas, sin la copia. */
.ticker__track {
  display: flex;
}

.ticker__list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 32px;
  margin: 0;
  padding: 10px 16px;
  list-style: none;
}

.ticker__list[aria-hidden="true"] {
  display: none;
}

.ticker a {
  color: #ffffff;
  font-size: 0.85rem;
  white-space: nowrap;
}

.ticker a:focus-visible {
  outline: 3px solid #fde047;
  outline-offset: 2px;
}

@keyframes scroll-left {
  to { translate: -50% 0; }
}

/* Con movimiento: una sola fila (las dos copias seguidas) que se desplaza
   la mitad de su ancho, es decir, una copia entera: al volver a empezar, la
   segunda copia está justo donde estaba la primera y no se nota el salto. */
@media (prefers-reduced-motion: no-preference) {
  .ticker__track {
    width: max-content;
    animation: scroll-left 16s linear infinite;
  }

  .ticker__list {
    flex-wrap: nowrap;
  }

  .ticker__list[aria-hidden="true"] {
    display: flex;
  }

  /* animation-play-state: paused congela la animación donde está; running
     la reanuda desde ahí (no vuelve al principio). Tres formas de pararla:
     el ratón encima, el foco dentro (quien navega con teclado tiene que
     poder leer el enlace) y un control explícito, que es el que exige la
     norma de accesibilidad WCAG 2.2.2 para lo que se mueve más de 5 s. */
  .ticker:hover .ticker__track,
  .ticker:focus-within .ticker__track,
  body:has(#pause:checked) .ticker__track {
    animation-play-state: paused;
  }
}
```
