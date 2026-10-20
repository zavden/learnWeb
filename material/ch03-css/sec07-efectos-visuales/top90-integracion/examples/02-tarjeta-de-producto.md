---
example_description: "Una tarjeta de un vivero: la planta (un SVG con fondo transparente) con drop-shadow sobre un foco radial, una cinta «Nuevo» recortada con clip-path y un :hover que sube la tarjeta y agranda la planta con translate y scale sueltos (con una copia fija del estado)"
example_tags: "css|integracion|drop-shadow|clip-path|radial-gradient|translate|scale|hover"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">A la derecha, una copia fija del estado <code>:hover</code> (el cambio es instantáneo; las transiciones llegan en el módulo de animación).</p>
<div class="shelf">
  <article class="product">
    <p class="ribbon">Nuevo</p>
    <div class="stage"><img class="plant" src="nopal.svg" alt="" width="120" height="140"></div>
    <h3><a href="/vivero/nopal-en-maceta">Nopal en maceta de barro</a></h3>
    <p class="price">$185</p>
  </article>
  <article class="product is-hover">
    <p class="ribbon">Nuevo</p>
    <div class="stage"><img class="plant" src="nopal.svg" alt="" width="120" height="140"></div>
    <h3><a href="/vivero/nopal-en-maceta" tabindex="-1">Nopal en maceta de barro</a></h3>
    <p class="price">$185</p>
  </article>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #f1f5f9;
}

.caption {
  margin: 0 0 12px;
  font-size: 0.72rem;
}

.shelf {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding-top: 8px;
}

/* --lift y --shadow-y son las dos cosas que cambian en :hover. */
.product {
  --lift: 0px;
  --shadow-y: 6px;
  position: relative;
  width: 180px;
  padding: 0 0 12px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgb(15 23 42 / 0.15);
  translate: 0 var(--lift);
}

/* El foco del teclado y el ratón levantan la tarjeta 6px, sin empujar a nadie:
   translate no cambia el layout. */
.product:hover,
.product:focus-within,
.product.is-hover {
  --lift: -6px;
  --shadow-y: 14px;
}

/* El escenario: un foco de luz radial detrás de la planta. */
.stage {
  display: grid;
  place-items: center;
  height: 170px;
  border-radius: 12px 12px 0 0;
  background: radial-gradient(circle at 50% 70%, #fef9c3, #fde68a 45%, #fcd34d);
}

/* drop-shadow sigue la silueta de la planta y la maceta (el SVG tiene el
   fondo transparente). El desplazamiento vertical sale de una custom
   property: la lista del filtro se escribe una sola vez. scale crece desde
   la base de la maceta, como si la planta se acercara. */
.plant {
  display: block;
  filter: drop-shadow(0 var(--shadow-y) 6px rgb(69 26 3 / 0.35));
  transform-origin: 50% 100%;
}

.product:hover .plant,
.product:focus-within .plant,
.product.is-hover .plant {
  scale: 1.08;
}

/* La cinta: un rectángulo con un pico hacia dentro en su lado derecho. Es un
   elemento aparte (no un recorte de la tarjeta), así que la sombra de la
   tarjeta y su anillo de foco siguen intactos. */
.ribbon {
  position: absolute;
  top: 12px;
  left: -6px;
  z-index: 1;
  margin: 0;
  padding: 4px 20px 4px 10px;
  background: #be123c;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  clip-path: polygon(0 0, 100% 0, calc(100% - 10px) 50%, 100% 100%, 0 100%);
}

.product h3 {
  margin: 10px 12px 2px;
  font-size: 0.95rem;
}

.product a {
  color: inherit;
  text-decoration: none;
}

/* Toda la tarjeta es pulsable: el ::after del enlace la cubre entera. */
.product a::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 12px;
}

.product a:focus-visible::after {
  outline: 3px solid #1d4ed8;
  outline-offset: 3px;
}

.price {
  margin: 0 12px;
  color: #166534;
  font-weight: 800;
}
```
