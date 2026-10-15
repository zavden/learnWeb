---
example_description: "La primera animación: @keyframes describe el recorrido y animation lo aplica. A diferencia de una transición, no necesita un cambio de estado: el primer cartel se anima solo al cargar la página; el segundo, cada vez que marcas la casilla. Con reducir movimiento se cambia a unos keyframes que solo funden"
example_tags: "css|animaciones|keyframes|animation|animation-name|prefers-reduced-motion"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption">El primer cartel se animó al cargar la página: para verlo otra vez, recarga la vista previa (⟳ en el editor). El segundo se anima cuando marcas la casilla; desmárcala y vuelve a marcarla para repetir.</p>
<p class="banner is-on-load">🚚 Envío gratis este fin de semana</p>
<label class="control"><input type="checkbox" id="play"> Reproducir</label>
<p class="banner is-on-demand">🌵 2 × 1 en suculentas hasta el domingo</p>
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
  margin-top: 8px;
  padding: 6px 10px;
  border: 1px solid #64748b;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.banner {
  margin: 10px 0;
  padding: 10px 14px;
  border-radius: 8px;
  background: #14532d;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
}

/* @keyframes da nombre a un recorrido: cómo es el elemento en cada momento.
   from = 0 % del tiempo, to = 100 %. */
@keyframes drop-in {
  from {
    opacity: 0;
    translate: 0 -16px;
  }

  to {
    opacity: 1;
    translate: 0 0;
  }
}

/* La versión sin movimiento: solo el fundido. Sin «to», el final es el valor
   que el elemento ya tiene (opacity: 1): lo verás en el ejemplo siguiente. */
@keyframes fade-in {
  from { opacity: 0; }
}

/* animation aplica unos keyframes: nombre, duración, curva… (como transition).
   Empieza en cuanto la regla se aplica al elemento: al cargar la página, o al
   cumplirse el selector. Para todos, la versión que solo funde. */
.is-on-load {
  animation: fade-in 600ms ease-out;
}

body:has(#play:checked) .is-on-demand {
  animation: fade-in 600ms ease-out;
}

/* Con movimiento: basta con cambiar el NOMBRE de los keyframes. */
@media (prefers-reduced-motion: no-preference) {
  .is-on-load,
  body:has(#play:checked) .is-on-demand {
    animation-name: drop-in;
  }
}
```
