---
example_description: "La entrada y la salida animadas de un popover, sin JavaScript: @starting-style para entrar, display con allow-discrete para salir y overlay con allow-discrete para que siga en la capa superior mientras se va. Sin overlay, al cerrarse, el popover cae por debajo del cartel antes de terminar de fundirse"
example_tags: "css|popover|starting-style|overlay|display|allow-discrete|capa-superior|transiciones"
example_stage: minimal
example_importance: important
---

# HTML

```html
<!-- popover y popovertarget: lección de elementos interactivos del capítulo de HTML.
     Abre cada uno y ciérralo (con su botón, con Escape o pulsando fuera). La salida dura
     0,6 s para que se vea: fíjate en el cartel verde cuando se cierra el segundo. -->
<p class="actions">
  <button type="button" popovertarget="with-overlay">Ver el envío (con overlay)</button>
  <button type="button" popovertarget="without-overlay">Ver el envío (sin overlay)</button>
</p>
<p class="banner">🚚 Envío gratis desde $599</p>

<div id="with-overlay" class="info" popover>
  <h3>Envío a domicilio ✅</h3>
  <p>De 2 a 4 días hábiles. Te avisamos por correo cuando salga del vivero.</p>
  <button type="button" popovertarget="with-overlay" popovertargetaction="hide">Entendido</button>
</div>

<div id="without-overlay" class="info is-no-overlay" popover>
  <h3>Envío a domicilio ❌</h3>
  <p>Al cerrarse, sale de la capa superior enseguida y el cartel lo tapa.</p>
  <button type="button" popovertarget="without-overlay" popovertargetaction="hide">Entendido</button>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

button {
  padding: 6px 12px;
  border: 1px solid #1d4ed8;
  border-radius: 8px;
  background: #ffffff;
  color: #1d4ed8;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

button:focus-visible {
  outline: 3px solid #1e293b;
  outline-offset: 2px;
}

/* Un cartel posicionado con z-index: en la página normal, queda por encima
   de lo que no está en la capa superior. */
.banner {
  position: relative;
  z-index: 1;
  margin: 12px 0;
  padding: 50px 16px;
  border-radius: 10px;
  background: #14532d;
  color: #ffffff;
  font-weight: 700;
  text-align: center;
}

/* El popover, colocado encima del cartel (por defecto se centra en la ventana). */
.info {
  inset: auto;
  top: 70px;
  left: 16px;
  width: 240px;
  margin: 0;
  padding: 12px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #ffffff;
  color: #1e293b;
  box-shadow: 0 12px 28px rgb(15 23 42 / 0.25);
  font-size: 0.85rem;
}

.info h3 {
  margin: 0 0 6px;
  font-size: 0.95rem;
}

.info p {
  margin: 0 0 10px;
}

/* Cerrado, el popover tiene display: none (hoja del navegador). Para animar:
   - opacity: el fundido, en los dos sentidos.
   - display … allow-discrete: al cerrar, sigue visible hasta el final.
   - overlay … allow-discrete: al cerrar, sigue en la CAPA SUPERIOR hasta el
     final (por encima de todo, como mientras estaba abierto).
   - @starting-style: el valor de partida al abrir (lección de transiciones). */
.info {
  opacity: 0;
  transition:
    opacity 600ms,
    overlay 600ms allow-discrete,
    display 600ms allow-discrete;
}

.info:popover-open {
  opacity: 1;
}

@starting-style {
  .info:popover-open {
    opacity: 0;
  }
}

/* ❌ Sin overlay: al cerrarse, el popover sale de la capa superior al primer
   fotograma. Sigue visible (gracias a display) pero ya es un elemento más de
   la página, y el cartel, con su z-index, se pinta encima mientras se funde. */
.is-no-overlay {
  transition:
    opacity 600ms,
    display 600ms allow-discrete;
}

/* Con movimiento: además, baja 8px al entrar y sube al salir. */
@media (prefers-reduced-motion: no-preference) {
  .info {
    translate: 0 -8px;
    transition:
      opacity 600ms,
      translate 600ms,
      overlay 600ms allow-discrete,
      display 600ms allow-discrete;
  }

  .is-no-overlay {
    transition:
      opacity 600ms,
      translate 600ms,
      display 600ms allow-discrete;
  }

  .info:popover-open {
    translate: 0 0;
  }

  @starting-style {
    .info:popover-open {
      translate: 0 -8px;
    }
  }
}
```
