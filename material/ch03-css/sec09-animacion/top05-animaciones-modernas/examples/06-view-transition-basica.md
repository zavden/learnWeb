---
example_description: "View Transitions en el mismo documento: document.startViewTransition() (adelanto de JavaScript) hace una foto de la página, aplica el cambio, hace otra y anima entre las dos. Sin nombres, toda la página se funde; con un view-transition-name por tarjeta, cada tarjeta viaja de su sitio en la lista a su sitio en la cuadrícula"
example_tags: "css|view-transitions|view-transition-name|view-transition-class|startViewTransition|javascript|prefers-reduced-motion"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption">Pulsa el botón varias veces. El cambio de lista a cuadrícula es un cambio de layout normal (una clase), pero cada tarjeta se desliza y se estira hasta su nuevo sitio. Con «reducir movimiento», la página entera se funde de una vista a otra.</p>
<button type="button" class="switch" onclick="toggleLayout()">Cambiar la vista</button>
<ul class="products">
  <li class="product" style="--vt: product-nopal"><span class="product__icon" aria-hidden="true">🌵</span><span class="product__name">Nopal</span><span class="product__price">$185</span></li>
  <li class="product" style="--vt: product-echeveria"><span class="product__icon" aria-hidden="true">🪴</span><span class="product__name">Echeveria</span><span class="product__price">$95</span></li>
  <li class="product" style="--vt: product-helecho"><span class="product__icon" aria-hidden="true">🌿</span><span class="product__name">Helecho</span><span class="product__price">$210</span></li>
  <li class="product" style="--vt: product-limonero"><span class="product__icon" aria-hidden="true">🍋</span><span class="product__name">Limonero enano</span><span class="product__price">$540</span></li>
</ul>
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

.switch {
  padding: 6px 12px;
  border: 0;
  border-radius: 8px;
  background: #1d4ed8;
  color: #ffffff;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.switch:focus-visible {
  outline: 3px solid #1e293b;
  outline-offset: 2px;
}

/* Lista: una tarjeta por fila. */
.products {
  display: grid;
  gap: 8px;
  max-width: 360px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.product {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px 12px;
  border-radius: 10px;
  background: #f0fdf4;
  font-size: 0.85rem;
}

.product__price {
  margin-inline-start: auto;
  color: #166534;
  font-weight: 700;
}

/* Cuadrícula: dos columnas, tarjetas en vertical. */
.products.is-grid {
  grid-template-columns: repeat(2, 1fr);
}

.is-grid .product {
  flex-direction: column;
  padding: 14px;
}

.is-grid .product__icon {
  font-size: 2rem;
}

.is-grid .product__price {
  margin-inline-start: 0;
}

/* Sin nombres, el navegador anima solo la «raíz»: la foto vieja de la página
   entera se funde con la nueva (0,25 s). Es lo que ve quien pide reducir el
   movimiento: un fundido, sin desplazamientos.
   Con movimiento: cada tarjeta recibe un nombre ÚNICO (de su --vt en línea).
   Un elemento con nombre se fotografía aparte, y el navegador anima su foto
   desde la posición y el tamaño de antes hasta los de después.
   view-transition-class (Chrome 125+) les da además una clase común para
   darles estilo a todas a la vez en los pseudoelementos. */
@media (prefers-reduced-motion: no-preference) {
  .product {
    view-transition-name: var(--vt);
    view-transition-class: product;
  }

  ::view-transition-group(*.product) {
    animation-duration: 400ms;
    animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
  }
}
```

# JavaScript

```javascript
// Adelanto: JavaScript del navegador (capítulo 6). onclick llama a toggleLayout();
// querySelector busca la lista, y classList.toggle le pone o le quita una clase.
function toggleLayout() {
  const list = document.querySelector('.products');
  const update = () => list.classList.toggle('is-grid');

  // En un navegador sin View Transitions: el mismo cambio, sin animación.
  if (!document.startViewTransition) {
    update();
    return;
  }

  // 1. foto del estado actual · 2. update() cambia el DOM · 3. foto del estado
  // nuevo · 4. el navegador anima de una foto a otra con CSS.
  document.startViewTransition(update);
}
```
