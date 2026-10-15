---
example_description: "Tarjetas de producto en fila con una insignia y un botón de favoritos en las esquinas, una cinta que sobresale, un sello de agotado centrado sobre la foto e iconos alineados con el texto"
example_tags: "css|position|absolute|inset|vertical-align|isolation|inline-block"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<ul class="products">
  <li class="product">
    <article class="card">
      <figure class="card-media">
        <img src="product-backpack.svg" width="240" height="180" alt="Mochila azul de 30 litros">
        <span class="badge">−20 %</span>
      </figure>
      <h3 class="card-title"><a href="#">Mochila de 30 litros</a></h3>
      <p class="card-meta"><img class="icon" src="icon-clock.svg" alt="">Entrega en 24 h</p>
      <p class="card-price"><del>74,90 €</del> <strong>59,90 €</strong></p>
      <button class="fav" type="button" aria-label="Guardar «Mochila de 30 litros» en favoritos"><img src="icon-heart.svg" alt=""></button>
    </article>
  </li>
  <li class="product">
    <article class="card">
      <figure class="card-media">
        <img src="product-lamp.svg" width="240" height="180" alt="Lámpara de escritorio de color mostaza">
      </figure>
      <span class="ribbon">Más vendido</span>
      <h3 class="card-title"><a href="#">Lámpara de escritorio con brazo articulado</a></h3>
      <p class="card-meta"><img class="icon" src="icon-clock.svg" alt="">Entrega en 48 h</p>
      <p class="card-price"><strong>34,50 €</strong></p>
      <button class="fav" type="button" aria-label="Guardar «Lámpara de escritorio» en favoritos"><img src="icon-heart.svg" alt=""></button>
    </article>
  </li>
  <li class="product">
    <article class="card">
      <figure class="card-media">
        <img src="product-tent.svg" width="240" height="180" alt="Tienda de campaña verde para dos personas">
        <span class="sold-out">Agotado</span>
      </figure>
      <h3 class="card-title"><a href="#">Tienda de campaña para dos</a></h3>
      <p class="card-meta"><img class="icon" src="icon-clock.svg" alt="">Vuelve en noviembre</p>
      <p class="card-price"><strong>129,00 €</strong></p>
      <button class="fav" type="button" aria-label="Guardar «Tienda de campaña para dos» en favoritos"><img src="icon-heart.svg" alt=""></button>
    </article>
  </li>
</ul>
```

# CSS

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.products {
  margin: 0;
  padding: 1rem 0 0 0.5rem;
  list-style: none;
}

/* Lección 2: tarjetas inline-block en fila, alineadas por arriba (no por su última línea). */
.product {
  display: inline-block;
  vertical-align: top;
  width: min(100% - 1rem, 13rem);
  margin: 0 0.75rem 1.25rem 0;
}

/* Lección 4: la tarjeta es la referencia de sus piezas absolute.
   Lección 5: isolation crea un contexto de apilamiento: el z-index de la cinta solo
   cuenta dentro de la tarjeta y nunca tapará un menú de la cabecera. */
.card {
  position: relative;
  isolation: isolate;
  padding-bottom: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #ffffff;
}

/* La foto también es referencia: el sello de agotado se centra sobre ella, no sobre la tarjeta. */
.card-media {
  position: relative;
  margin: 0;
}

/* Lección 2: como bloque, la imagen no deja el hueco de la línea base. */
.card-media img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 9px 9px 0 0;
}

.card-title {
  margin: 0.6rem 0.75rem 0.25rem;
  font-size: 0.95rem;
  line-height: 1.3;
}

.card-title a {
  color: #1e293b;
}

.card-meta,
.card-price {
  margin: 0 0.75rem 0.25rem;
  font-size: 0.85rem;
}

.card-meta {
  color: #475569;
}

/* Lección 2: un icono de 1em, bajado 1/8 para centrarlo con mayúsculas y cifras. */
.icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  margin-right: 0.35em;
  vertical-align: -0.125em;
}

/* Lección 4: una esquina con dos desplazamientos. */
.badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  background: #b91c1c;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: bold;
}

.fav {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0.5rem;
  border: 1px solid #94a3b8;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
}

.fav img {
  display: block;
  width: 100%;
}

.fav:focus-visible,
.card-title a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

/* Una cinta que sobresale 0.5rem por la izquierda, con un pliegue debajo: un triángulo
   hecho con dos bordes (uno transparente) en un ::after colocado justo debajo (top: 100%). */
.ribbon {
  position: absolute;
  z-index: 1;
  top: 0.75rem;
  left: -0.5rem;
  padding: 0.2rem 0.75rem;
  background: #9a3412;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: bold;
}

.ribbon::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 0;
  border-top: 0.5rem solid #431407;
  border-left: 0.5rem solid transparent;
}

/* Lección 4: centrado en los dos ejes con inset: 0, margin: auto y un tamaño
   (fit-content: lo que mida el texto). */
.sold-out {
  position: absolute;
  inset: 0;
  width: fit-content;
  height: fit-content;
  margin: auto;
  padding: 0.3rem 0.9rem;
  border: 2px solid #1e293b;
  background: #ffffff;
  font-weight: bold;
}
```
