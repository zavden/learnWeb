---
example_description: "Una tarjeta con dos caras: preserve-3d en la tarjeta, backface-visibility: hidden en las caras y la trasera girada 180°; al girar la tarjeta 180°, se ve la otra cara. Se voltea con :hover y con el foco del teclado (:focus-within)"
example_tags: "css|transformaciones-3d|backface-visibility|preserve-3d|tarjeta|focus-within"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">La misma tarjeta en tres posiciones fijas. La primera, además, se voltea al pasar el ratón o al llegar con <kbd>Tab</kbd> a su enlace (el cambio es instantáneo: las transiciones llegan en el módulo de animación).</p>
<div class="row">
  <figure class="flip">
    <div class="card">
      <img class="face is-front" src="aldrin-apolo-11.jpg" alt="Buzz Aldrin en la Luna" width="140" height="140">
      <div class="face is-back">
        <p><strong>Apolo 11</strong><br>Buzz Aldrin en la Luna, 20 de julio de 1969.</p>
        <a href="/coleccion/apolo-11">Ver ficha</a>
      </div>
    </div>
    <figcaption><code>rotateY(0)</code> · interactiva</figcaption>
  </figure>
  <figure class="flip is-mid">
    <div class="card">
      <img class="face is-front" src="aldrin-apolo-11.jpg" alt="" width="140" height="140">
      <div class="face is-back"><p><strong>Apolo 11</strong><br>Buzz Aldrin en la Luna, 20 de julio de 1969.</p></div>
    </div>
    <figcaption><code>rotateY(-50deg)</code></figcaption>
  </figure>
  <figure class="flip is-flipped">
    <div class="card">
      <img class="face is-front" src="aldrin-apolo-11.jpg" alt="" width="140" height="140">
      <div class="face is-back"><p><strong>Apolo 11</strong><br>Buzz Aldrin en la Luna, 20 de julio de 1969.</p></div>
    </div>
    <figcaption><code>rotateY(180deg)</code></figcaption>
  </figure>
</div>
<p class="credit">NASA, Apolo 11, 1969. Dominio público.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption,
.credit {
  margin: 8px 0 8px;
  font-size: 0.72rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

/* El contenedor pone la perspectiva (un ojo para la tarjeta). */
.flip {
  margin: 0;
  perspective: 600px;
}

.flip figcaption {
  margin-top: 6px;
  font-size: 0.7rem;
}

/* La tarjeta es la que gira. preserve-3d mantiene sus dos caras en su
   espacio 3D: cuando la tarjeta gira, cada cara gira con ella y el
   navegador sabe cuál mira hacia ti. */
.card {
  position: relative;
  width: 140px;
  height: 140px;
  transform-style: preserve-3d;
}

/* Las dos caras, una encima de la otra. backface-visibility: hidden oculta
   una cara cuando te da la espalda (cuando su parte de atrás mira hacia ti). */
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

/* La cara trasera empieza dada la vuelta: de espaldas, y por tanto oculta.
   Cuando la tarjeta gire 180°, quedará de frente (180 + 180 = 360). */
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

.is-mid .card     { transform: rotateY(-50deg); }
.is-flipped .card { transform: rotateY(180deg); }

/* Interactiva: con el ratón encima, o cuando el foco del teclado entra en la
   tarjeta (el enlace de la cara trasera recibe el foco aunque esté oculta, y
   la tarjeta se voltea para enseñarlo). */
.flip:hover .card,
.flip:focus-within .card {
  transform: rotateY(180deg);
}
```
