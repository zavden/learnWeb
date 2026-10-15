---
example_description: "Una @media anidada dentro de una regla «burbujea» hacia fuera: Sass genera la media query con el selector completo dentro"
example_tags: "sass|anidamiento|media-queries|responsive"
example_stage: minimal
example_importance: important
---

# HTML

```html
<article class="product">
  <div class="product__image" role="img" aria-label="Foto del programador de riego"></div>
  <div>
    <h2 class="product__name">Programador de riego solar</h2>
    <p class="product__price">39,90 €</p>
  </div>
</article>
<p>Abre la vista previa en una pestaña (↗) y cambia el ancho: a partir de 30rem la imagen se pone al lado.</p>
```

# SCSS

```scss
$bp-wide: 30rem;

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.product {
  display: grid;
  gap: 12px;
  max-width: 32rem;
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;

  // La media query va DENTRO de la regla, junto a los estilos que modifica.
  // Sass la saca fuera y le mete el selector completo:
  // → @media (width >= 30rem) { .product { … } }
  @media (width >= $bp-wide) {
    grid-template-columns: 8rem 1fr;
    align-items: center;
  }

  &__image {
    aspect-ratio: 4 / 3;
    border-radius: 6px;
    background: linear-gradient(135deg, #bbf7d0, #15803d);
  }

  &__name {
    margin: 0;
    font-size: 1.1rem;
  }

  &__price {
    margin: 4px 0 0;
    font-weight: bold;

    // Otra @media, en otra regla: Sass genera OTRO bloque @media (no las junta).
    // → @media (width >= 30rem) { .product__price { … } }
    @media (width >= $bp-wide) {
      font-size: 1.5rem;
    }
  }
}
```
