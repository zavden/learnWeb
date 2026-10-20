---
example_description: "La micro-interacción de «añadir a la cesta»: el texto del botón cambia con un fundido cruzado (opacity + visibility), el número de la cesta sube como un cuentakilómetros (translate) y el globo da un salto con unos @keyframes de solo un fotograma al 40 %. Con reducir movimiento, el salto se cambia por un destello de color"
example_tags: "css|integracion|keyframes|transiciones|visibility|micro-interaccion|has|prefers-reduced-motion"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">Marca y desmarca el botón (también con <kbd>Tab</kbd> y Espacio). Mira el texto del botón, el número de la cesta y el globo rojo.</p>
<header class="bar">
  <span class="bar__brand">Vivero Los Nopales</span>
  <a class="cart" href="/cesta">Cesta
    <span class="cart__badge">
      <span class="cart__count is-before">2</span>
      <span class="cart__count is-after">3</span>
    </span>
  </a>
</header>
<article class="product">
  <p class="product__media" aria-hidden="true">🌵</p>
  <h3>Nopal en maceta de barro</h3>
  <p class="product__price">$185</p>
  <label class="add">
    <input type="checkbox" class="add__input">
    <span class="add__text is-idle">Añadir a la cesta</span>
    <span class="add__text is-done">✓ En tu cesta</span>
  </label>
</article>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────
   Añadir a la cesta
   - El botón es una casilla con su etiqueta (sin JavaScript): marcada =
     «en tu cesta». Los dos textos ocupan la misma celda de grid y se
     cruzan con opacity + visibility: el oculto no se lee ni forma parte
     del nombre accesible.
   - El número: «2» y «3» en la misma celda; uno sale hacia arriba y el
     otro entra desde abajo, como un cuentakilómetros (solo translate).
   - El globo salta con @keyframes bump, que solo tiene el 40 %: el
     principio y el final son su escala normal. Al desmarcar y volver a
     marcar, la animación se aplica otra vez y vuelve a saltar.
   - Movimiento reducido: sin desplazamientos ni salto; los textos se
     funden y el globo da un destello de color.
   ────────────────────────────────────────────────────────────────────── */
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption {
  margin: 8px 0;
  font-size: 0.72rem;
}

.bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-radius: 10px;
  background: #14532d;
  color: #ffffff;
}

.bar__brand {
  font-weight: 800;
}

.cart {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  color: #ffffff;
  font-weight: 600;
  text-decoration: none;
}

.cart:focus-visible {
  outline: 3px solid #fde047;
  outline-offset: 3px;
}

/* Las dos cifras en la misma celda; overflow: clip recorta la que viaja. */
.cart__badge {
  display: inline-grid;
  min-width: 22px;
  overflow: clip;
  border-radius: 999px;
  background: #be123c;
  font-size: 0.8rem;
  line-height: 22px;
  text-align: center;
}

.cart__count {
  grid-area: 1 / 1;
  transition: opacity 200ms, visibility 200ms;
}

.cart__count.is-after,
body:has(.add__input:checked) .cart__count.is-before {
  opacity: 0;
  visibility: hidden;
}

body:has(.add__input:checked) .cart__count.is-after {
  opacity: 1;
  visibility: visible;
}

.product {
  width: 200px;
  margin-top: 14px;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgb(15 23 42 / 0.2);
}

.product__media {
  margin: 0;
  font-size: 3rem;
  text-align: center;
}

.product h3 {
  margin: 4px 0;
  font-size: 0.95rem;
}

.product__price {
  margin: 0 0 10px;
  color: #166534;
  font-weight: 800;
}

/* El botón: la casilla queda encima, invisible pero enfocable y pulsable. */
.add {
  position: relative;
  display: grid;
  padding: 8px 12px;
  border-radius: 999px;
  background: #15803d;
  color: #ffffff;
  font-weight: 700;
  text-align: center;
  cursor: pointer;
  transition: background-color 200ms;
}

.add:has(.add__input:checked) {
  background: #14532d;
}

.add:has(:focus-visible) {
  outline: 3px solid #1d4ed8;
  outline-offset: 3px;
}

.add__input {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}

.add__text {
  grid-area: 1 / 1;
  transition: opacity 200ms, visibility 200ms;
}

.add__text.is-done,
.add:has(.add__input:checked) .add__text.is-idle {
  opacity: 0;
  visibility: hidden;
}

.add:has(.add__input:checked) .add__text.is-done {
  opacity: 1;
  visibility: visible;
}

@keyframes bump {
  40% { scale: 1.35; }
}

@keyframes flash {
  40% { background-color: #fde047; color: #1e293b; }
}

/* Para todos: el destello de color al añadir. */
body:has(.add__input:checked) .cart__badge {
  animation: flash 500ms ease-out;
}

@media (prefers-reduced-motion: no-preference) {
  body:has(.add__input:checked) .cart__badge {
    animation: bump 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* El cuentakilómetros: la cifra vieja sube y la nueva llega desde abajo. */
  .cart__count {
    transition: opacity 200ms, visibility 200ms, translate 250ms cubic-bezier(0.2, 0, 0, 1);
  }

  .cart__count.is-after {
    translate: 0 100%;
  }

  body:has(.add__input:checked) .cart__count.is-before {
    translate: 0 -100%;
  }

  body:has(.add__input:checked) .cart__count.is-after {
    translate: 0 0;
  }
}
```
