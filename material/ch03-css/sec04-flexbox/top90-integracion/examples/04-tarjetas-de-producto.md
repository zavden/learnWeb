---
example_description: "Un escaparate de productos: tarjetas que se reparten en columnas sin media queries, todas de la misma altura, con el precio alineado por la línea base y el botón siempre abajo"
example_tags: "css|flexbox|tarjetas|flex-wrap|baseline|margin-auto|productos"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<h2 class="shelf-title">Más vendidas <span>4 plantas</span></h2>
<ul class="products">
  <li class="product">
    <img src="plant-monstera.svg" alt="" width="240" height="240">
    <p class="tags"><span class="tag">Interior</span><span class="tag is-sale">−20 %</span></p>
    <h3>Monstera deliciosa</h3>
    <p class="price"><strong>336 MXN</strong> <span class="old">antes <s>420 MXN</s></span></p>
    <a class="button" href="/plantas/monstera-deliciosa" aria-label="Añadir al carrito: Monstera deliciosa">Añadir al carrito</a>
  </li>
  <li class="product">
    <img src="plant-cactus.svg" alt="" width="240" height="240">
    <p class="tags"><span class="tag">Sol directo</span></p>
    <h3>Cactus candelabro con maceta de barro de Tonalá pintada a mano</h3>
    <p class="price"><strong>290 MXN</strong></p>
    <a class="button" href="/plantas/cactus-candelabro" aria-label="Añadir al carrito: Cactus candelabro">Añadir al carrito</a>
  </li>
  <li class="product">
    <img src="plant-pothos.svg" alt="" width="240" height="240">
    <p class="tags"><span class="tag">Colgante</span><span class="tag">Fácil</span></p>
    <h3>Pothos dorado</h3>
    <p class="price"><strong>160 MXN</strong></p>
    <a class="button" href="/plantas/pothos-dorado" aria-label="Añadir al carrito: Pothos dorado">Añadir al carrito</a>
  </li>
  <li class="product">
    <img src="plant-sansevieria.svg" alt="" width="240" height="240">
    <p class="tags"><span class="tag">Poca luz</span></p>
    <h3>Sansevieria</h3>
    <p class="price"><strong>240 MXN</strong> <span class="old">antes <s>280 MXN</s></span></p>
    <a class="button" href="/plantas/sansevieria" aria-label="Añadir al carrito: Sansevieria">Añadir al carrito</a>
  </li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

/* El título y el contador, alineados por la línea base de sus letras (lección 2). */
.shelf-title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 0 0 8px;
  font-size: 1.1rem;
}

.shelf-title span {
  color: #475569;
  font-size: 0.8rem;
  font-weight: normal;
}

/* La rejilla sin media queries (lección 5): tantas columnas de 9rem como quepan;
   las tarjetas crecen para llenar la línea, pero nunca más de 13rem. */
.products {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Cada tarjeta: elemento flex de la fila (todas igual de altas por el stretch) y
   columna flex de su contenido. */
.product {
  display: flex;
  flex-direction: column;
  flex: 1 1 9rem;
  max-width: 13rem;
  box-sizing: border-box;
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.8rem;
}

/* En una columna, el eje cruzado es el horizontal: la imagen se estira a lo ancho y,
   con height: auto, conserva su proporción. */
.product img {
  width: 100%;
  height: auto;
  border-radius: 6px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 6px 0 0;
}

.tag {
  padding: 0 6px;
  border-radius: 999px;
  background: #dcfce7;
  color: #14532d;
  font-size: 0.7rem;
}

.tag.is-sale {
  background: #fee2e2;
  color: #991b1b;
  font-weight: bold;
}

.product h3 {
  margin: 4px 0;
  font-size: 0.9rem;
}

/* Precio actual grande y precio anterior pequeño: baseline apoya las dos cifras en la
   misma línea; con center «bailarían». */
.price {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
  margin: 0 0 8px;
}

.price strong {
  font-size: 1.05rem;
}

.price .old {
  color: #475569;
}

/* El botón, siempre al fondo de la tarjeta, por largo que sea el título (lección 5). */
.button {
  margin-top: auto;
  padding: 6px;
  border-radius: 6px;
  background: #166534;
  color: #ffffff;
  text-align: center;
  text-decoration: none;
}

.button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```
