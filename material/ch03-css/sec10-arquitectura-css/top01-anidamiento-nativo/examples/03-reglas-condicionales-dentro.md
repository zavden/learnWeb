---
example_description: "@container, @media, @supports y @layer escritos dentro de la regla del componente: sus declaraciones son del selector de fuera. La misma tarjeta en un hueco ancho y en uno estrecho, y un fondo de @layer que pierde contra el que no tiene capa"
example_tags: "css|anidamiento|nesting|container-queries|media-queries|supports|layer"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">La misma tarjeta en un hueco ancho y en uno de 14rem. Todas sus condiciones (<code>@container</code>, <code>@media</code>, <code>@supports</code> y una <code>@layer</code>) están anidadas dentro de <code>.product</code>.</p>
<div class="slot">
  <article class="product">
    <div class="product-photo" aria-hidden="true"></div>
    <div>
      <h3 class="product-title">Nopal en maceta de barro hecha a mano</h3>
      <p class="product-price">$185</p>
    </div>
  </article>
</div>
<div class="slot is-narrow">
  <article class="product">
    <div class="product-photo" aria-hidden="true"></div>
    <div>
      <h3 class="product-title">Nopal en maceta de barro hecha a mano</h3>
      <p class="product-price">$185</p>
    </div>
  </article>
</div>
<p class="caption"><code>@layer defaults</code> pone un fondo amarillo y un borde ámbar. El borde se ve, porque nadie más lo declara; el fondo es verde menta, porque la declaración sin capa gana a cualquier capa, aunque esté escrita antes.</p>
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

.slot {
  container-type: inline-size;
  margin-bottom: 12px;
}

.slot.is-narrow {
  max-width: 14rem;
}

.product {
  display: grid;
  gap: 8px;
  padding: 12px;
  border-width: 2px;
  border-style: solid;                /* el color del borde lo pone la capa */
  border-radius: 10px;
  background: #ecfdf5;

  /* Una @container dentro de la regla: sus declaraciones son de .product.
     Equivale a: @container (width >= 20rem) { .product { … } } */
  @container (width >= 20rem) {
    grid-template-columns: 5rem 1fr;
    align-items: center;
  }

  /* Igual con @media: la sombra se funde solo si el sistema no pide
     reducir el movimiento (aquí no hay movimiento, pero vale de muestra). */
  @media (prefers-reduced-motion: no-preference) {
    transition: box-shadow 200ms;
  }

  &:hover {
    box-shadow: 0 4px 14px rgb(15 23 42 / 0.15);
  }

  /* Dentro de una condición también puede haber reglas anidadas:
     esta es .product .product-title, solo si existe text-wrap: balance. */
  @supports (text-wrap: balance) {
    .product-title {
      text-wrap: balance;
    }
  }

  /* @layer dentro de la regla: estas declaraciones van a la capa «defaults».
     Recuerda la lección de capas: lo que no tiene capa gana a cualquier
     capa. El background de arriba (sin capa) gana, aunque este vaya
     después; border-color solo lo declara la capa, así que se aplica. */
  @layer defaults {
    background: #fde68a;
    border-color: #b45309;
  }
}

.product-photo {
  aspect-ratio: 1;
  max-width: 5rem;
  border-radius: 8px;
  background: radial-gradient(circle at 50% 35%, #4d7c0f 0 32%, transparent 33%), linear-gradient(#fed7aa 0 60%, #c2410c 60%);
}

.product-title {
  margin: 0;
  font-size: 0.95rem;
}

.product-price {
  margin: 4px 0 0;
  font-weight: 700;
}
```
