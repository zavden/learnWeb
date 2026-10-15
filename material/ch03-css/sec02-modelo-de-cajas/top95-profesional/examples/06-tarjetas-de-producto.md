---
example_description: "Un escaparate de productos con tarjetas inline-block de alturas iguales: foto cuadrada con aspect-ratio, insignias montadas con margen negativo, título de dos líneas con line-clamp y min-height en lh, y estados sin saltos"
example_tags: "css|profesional|tarjetas|aspect-ratio|line-clamp|inline-block"
example_stage: professional
example_importance: critical
---

# HTML

```html
<main class="shop">
  <header class="shop-header">
    <h1>Novedades de otoño</h1>
    <p>Envío gratis a partir de 40 €. Devoluciones durante 30 días.</p>
  </header>

  <ul class="products" aria-label="Productos">
    <li class="product">
      <a class="product-link" href="#">
        <span class="product-media"><img src="product-mug.svg" width="400" height="400" alt=""></span>
        <span class="product-flags"><span class="flag flag--sale">−20 %</span></span>
        <span class="product-title">Taza de gres esmaltada a mano</span>
      </a>
      <p class="product-price"><span class="price">14,40 €</span> <s class="price-old">18,00 €</s></p>
      <button class="product-add" type="button">Añadir a la cesta</button>
    </li>
    <li class="product">
      <a class="product-link" href="#">
        <span class="product-media"><img src="product-backpack.svg" width="400" height="400" alt=""></span>
        <span class="product-flags"><span class="flag">Nuevo</span> <span class="flag flag--eco">Algodón reciclado</span></span>
        <span class="product-title">Mochila de lona encerada con compartimento acolchado para portátil de hasta 16 pulgadas</span>
      </a>
      <p class="product-price"><span class="price">64,00 €</span></p>
      <button class="product-add" type="button">Añadir a la cesta</button>
    </li>
    <li class="product">
      <a class="product-link" href="#">
        <span class="product-media"><img src="product-lamp.svg" width="400" height="400" alt=""></span>
        <span class="product-flags"></span>
        <span class="product-title">Flexo de escritorio</span>
      </a>
      <p class="product-price"><span class="price">39,90 €</span></p>
      <button class="product-add" type="button">Añadir a la cesta</button>
    </li>
    <li class="product product--soldout">
      <a class="product-link" href="#">
        <span class="product-media"><img src="product-plant.svg" width="400" height="400" alt=""></span>
        <span class="product-flags"><span class="flag flag--muted">Agotado</span></span>
        <span class="product-title">Maceta de barro con planta aromática de temporada</span>
      </a>
      <p class="product-price"><span class="price">12,50 €</span></p>
      <button class="product-add" type="button" disabled>Avísame cuando vuelva</button>
    </li>
  </ul>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Escaparate de productos
   - Tarjetas inline-block de min(100%, 15rem): en fila mientras quepan, y saltan
     de línea como palabras. text-align: center en la lista centra cada fila.
   - Alturas iguales sin flexbox: foto cuadrada (aspect-ratio), franja de insignias
     de alto fijo y título SIEMPRE de dos líneas (line-clamp + min-height: 2lh).
   - Las insignias se montan sobre la foto con un margen superior negativo: una
     caja en línea se pinta después que la imagen anterior, así que queda encima.
   - Toda la parte superior es un único enlace (imagen + título): un solo tabulador
     por producto. El botón va fuera, porque un enlace no puede contener un botón.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  * {
    margin: 0;
  }

  img {
    display: block;
    max-width: 100%;
    height: auto;
  }

  button {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --color-bg: #fafaf9;
    --color-surface: #ffffff;
    --color-text: #1c1917;
    --color-text-muted: #57534e;
    --color-border: #e7e5e4;
    --color-brand: #c2410c;
    --color-brand-strong: #9a3412;
    --color-sale: #b91c1c;
    --color-eco: #166534;
    --color-focus: #9a3412;

    --card-pad: 0.875rem;
    --card-radius: 14px;
    --flags-height: 2.25rem;
    --shadow-rest: 0 1px 2px rgb(28 25 23 / 0.06);
    --shadow-hover: 0 4px 8px rgb(28 25 23 / 0.08), 0 16px 32px rgb(28 25 23 / 0.1);
  }
}

@layer base {
  body {
    background: var(--color-bg);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  .shop {
    width: min(100% - 2rem, 70rem);
    margin: 2rem auto;
  }

  .shop-header {
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .shop-header p {
    color: var(--color-text-muted);
  }

  /* Los márgenes laterales de las tarjetas se compensan con un margen negativo en
     la lista: las filas quedan centradas sin hueco extra en los extremos. */
  .products {
    margin-inline: -0.5rem;
    padding: 0;
    list-style: none;
    text-align: center;
  }

  .product {
    display: inline-block;
    vertical-align: top;                /* vertical-align llega en el módulo de flujo: tarjetas alineadas por arriba */
    width: min(100%, 15rem);
    margin: 0 0.5rem 1.25rem;
    padding: var(--card-pad);
    border: 1px solid var(--color-border);
    border-radius: var(--card-radius);
    background: var(--color-surface);
    box-shadow: var(--shadow-rest);
    text-align: start;
  }

  /* La sombra crece sin mover nada: el diseño no salta al pasar el ratón */
  .product:hover {
    box-shadow: var(--shadow-hover);
  }

  .product-link {
    display: block;
    color: inherit;
    text-decoration: none;
  }

  /* Foto cuadrada aunque la imagen tarde en cargar: aspect-ratio reserva el hueco
     y el color de fondo lo ocupa mientras tanto. */
  .product-media {
    display: block;
    aspect-ratio: 1;
    border-radius: calc(var(--card-radius) - var(--card-pad) / 2);
    background: #f5f5f4;
  }

  .product-media img {
    width: 100%;
    border-radius: inherit;
  }

  /* Franja de insignias de alto fijo, subida sobre la parte de abajo de la foto.
     El margen negativo es igual a su alto: no ocupa sitio en el flujo y todas las
     tarjetas miden lo mismo, tengan insignias o no. */
  .product-flags {
    display: block;
    height: var(--flags-height);
    margin-top: calc(var(--flags-height) * -1);
    padding: 0.375rem 0.5rem;
    overflow: hidden;                   /* si no caben, mejor recortadas que desbordando */
    white-space: nowrap;
  }

  .flag {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    border-radius: 6px;
    background: var(--color-text);
    color: #ffffff;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .flag--sale  { background: var(--color-sale); }
  .flag--eco   { background: var(--color-eco); }
  .flag--muted { background: #44403c; }

  /* Título de dos líneas exactas: line-clamp recorta a partir de la tercera y
     min-height: 2lh reserva dos líneas aunque el título quepa en una. */
  .product-title {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    min-height: 2lh;
    margin-top: 0.75rem;
    font-weight: 600;
    line-height: 1.35;
  }

  .product-link:hover .product-title {
    text-decoration: underline;
  }

  /* El foco del enlace rodea foto y título: el anillo va por fuera y no mueve nada */
  .product-link:focus-visible {
    outline-offset: 4px;
    border-radius: calc(var(--card-radius) - var(--card-pad) / 2);
  }

  .product-price {
    margin: 0.375rem 0 0.75rem;
  }

  .price {
    font-size: 1.125rem;
    font-weight: 800;
  }

  .price-old {
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  /* Un <button> de bloque no se estira solo: width: 100%, y border-box lo mantiene
     dentro de la tarjeta. Borde siempre de 2px: los estados solo cambian colores. */
  .product-add {
    display: block;
    width: 100%;
    padding: 0.55rem 0.75rem;
    border: 2px solid var(--color-brand);
    border-radius: 999px;
    background: var(--color-brand);
    color: #ffffff;
    font-weight: 600;
    cursor: pointer;
  }

  .product-add:hover {
    border-color: var(--color-brand-strong);
    background: var(--color-brand-strong);
  }

  .product-add:active {
    box-shadow: inset 0 2px 4px rgb(28 25 23 / 0.35);
  }

  .product-add:disabled {
    border-color: var(--color-border);
    background: var(--color-surface);
    color: var(--color-text-muted);
    cursor: not-allowed;
  }

  .product--soldout .product-media {
    background: #e7e5e4;
  }
}
```
