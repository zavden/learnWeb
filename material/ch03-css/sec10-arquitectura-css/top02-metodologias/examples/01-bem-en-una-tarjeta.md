---
example_description: "BEM en dos tarjetas de un vivero: el bloque (.product-card), sus elementos (__title, __price, __action) y sus modificadores (--featured, --sold-out). Todos los selectores pesan (0,1,0) y los modificadores siempre acompañan a la clase del bloque"
example_tags: "css|arquitectura|bem|metodologias|componentes|especificidad"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<div class="grid">
  <!-- El modificador va SIEMPRE junto a la clase del bloque: la base viene
       de .product-card y el cambio, de .product-card--featured. -->
  <article class="product-card product-card--featured">
    <p class="product-card__badge">Novedad</p>
    <h3 class="product-card__title">Monstera deliciosa</h3>
    <p class="product-card__price">$420</p>
    <a class="product-card__action" href="/vivero/monstera">Ver planta</a>
  </article>
  <article class="product-card product-card--sold-out">
    <h3 class="product-card__title">Ficus lyrata</h3>
    <p class="product-card__price">$560</p>
    <a class="product-card__action" href="/vivero/ficus-lyrata">Avísame cuando llegue</a>
  </article>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: 12px;
}

/* ── BEM: bloque__elemento--modificador ───────────────────────────────
   Bloque:      .product-card          un componente con sentido propio
   Elemento:    .product-card__title   una pieza que solo existe dentro
                                       del bloque (dos guiones bajos)
   Modificador: .product-card--sold-out una variante o un estado (dos
                                       guiones)
   Todas las reglas son de UNA clase: especificidad (0,1,0). Nada pesa
   más que nada, y el orden del archivo es fácil de seguir. */

/* Bloque */
.product-card {
  display: grid;
  gap: 4px;
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
}

/* Elementos */
.product-card__badge {
  justify-self: start;
  margin: 0;
  padding: 2px 8px;
  border-radius: 999px;
  background: #fef3c7;
  color: #92400e;
  font-size: 0.75rem;
  font-weight: 700;
}

.product-card__title {
  margin: 0;
  font-size: 1rem;
}

.product-card__price {
  margin: 0;
  font-weight: 700;
}

.product-card__action {
  color: #15803d;
  font-weight: 700;
}

.product-card__action:focus-visible {
  outline: 3px solid #15803d;
  outline-offset: 2px;
}

/* Modificadores del bloque */
.product-card--featured {
  border: 2px solid #15803d;
}

.product-card--sold-out {
  border-style: dashed;
  color: #475569;
}

/* Un modificador que cambia un elemento: la única regla de dos clases,
   (0,2,0). Es el patrón que BEM acepta: «el precio, cuando la tarjeta
   está agotada». */
.product-card--sold-out .product-card__price {
  text-decoration: line-through;
}
```
