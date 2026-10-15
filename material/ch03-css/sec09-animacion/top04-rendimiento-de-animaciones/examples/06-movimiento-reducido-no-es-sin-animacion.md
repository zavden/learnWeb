---
example_description: "La tarjeta que se voltea del módulo de efectos visuales, por fin animada: gira 180° en 0,6 s (transform 3D, solo composite). Con prefers-reduced-motion: reduce no se queda quieta ni salta: el giro se cambia por un fundido entre las dos caras. Al lado, una copia con la versión reducida siempre activa"
example_tags: "css|rendimiento|prefers-reduced-motion|accesibilidad|transformaciones-3d|tarjeta|fundido|transiciones"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<p class="caption">Pasa el ratón por cada tarjeta o llega con <kbd>Tab</kbd> a su enlace. La primera sigue la preferencia de tu sistema (gira); la segunda muestra siempre lo que verá quien pide reducir el movimiento: la misma información, con un fundido.</p>
<div class="row">
  <figure class="flip">
    <div class="card">
      <img class="face is-front" src="aldrin-apolo-11.jpg" alt="Buzz Aldrin en la Luna" width="140" height="140">
      <div class="face is-back">
        <p><strong>Apolo 11</strong><br>Buzz Aldrin en la Luna, 20 de julio de 1969.</p>
        <a href="/coleccion/apolo-11">Ver ficha</a>
      </div>
    </div>
    <figcaption>Según tu sistema</figcaption>
  </figure>
  <figure class="flip is-reduced">
    <div class="card">
      <img class="face is-front" src="aldrin-apolo-11.jpg" alt="Buzz Aldrin en la Luna" width="140" height="140">
      <div class="face is-back">
        <p><strong>Apolo 11</strong><br>Buzz Aldrin en la Luna, 20 de julio de 1969.</p>
        <a href="/coleccion/apolo-11">Ver ficha</a>
      </div>
    </div>
    <figcaption>Siempre <code>reduce</code></figcaption>
  </figure>
</div>
<p class="credit">NASA, Apolo 11, 1969. Dominio público.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption,
.credit {
  margin: 8px 0;
  font-size: 0.72rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

/* ── La tarjeta de la lección de transformaciones 3D, sin cambios ── */
.flip {
  margin: 0;
  perspective: 600px;
}

.flip figcaption {
  margin-top: 6px;
  font-size: 0.7rem;
}

.card {
  position: relative;
  width: 140px;
  height: 140px;
  transform-style: preserve-3d;
}

.face {
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  border-radius: 10px;
  backface-visibility: hidden;
}

.is-front {
  display: block;
  width: 100%;
  height: 100%;
}

.is-back {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px;
  background: #1e293b;
  color: #ffffff;
  font-size: 0.75rem;
  transform: rotateY(180deg);
}

.is-back p {
  margin: 0;
}

.is-back a {
  color: #93c5fd;
  font-weight: 700;
}

.is-back a:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 2px;
}

.flip:hover .card,
.flip:focus-within .card {
  transform: rotateY(180deg);
}

/* ── Lo nuevo: la animación ──
   Un giro 3D es una transformación: el navegador pinta las dos caras una vez
   y la GPU las gira (solo composite). */
@media (prefers-reduced-motion: no-preference) {
  .card {
    transition: transform 600ms cubic-bezier(0.2, 0, 0, 1);
  }
}

/* ── Movimiento reducido: un fundido en lugar del giro ──
   «reduce» no significa «sin animación» ni «sin cambio»: significa sin
   desplazamientos, giros, zooms ni parallax, que son los que marean. La
   tarjeta no gira: la cara trasera, ya de frente, aparece con opacidad.
   Las mismas reglas dos veces: dentro de la media query (para quien lo pide)
   y con la clase .is-reduced (la copia de la derecha, para que lo veas). */
.flip.is-reduced:hover .card,
.flip.is-reduced:focus-within .card {
  transform: none;
}

.flip.is-reduced .is-back {
  transform: none;
  opacity: 0;
  transition: opacity 300ms;
}

.flip.is-reduced:hover .is-back,
.flip.is-reduced:focus-within .is-back {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .flip:hover .card,
  .flip:focus-within .card {
    transform: none;
  }

  .flip .is-back {
    transform: none;
    opacity: 0;
    transition: opacity 300ms;
  }

  .flip:hover .is-back,
  .flip:focus-within .is-back {
    opacity: 1;
  }
}
```
