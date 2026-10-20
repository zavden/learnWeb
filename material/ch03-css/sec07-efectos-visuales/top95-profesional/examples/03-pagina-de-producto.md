---
example_description: "La ficha de una olla de barro: la imagen (SVG transparente) con drop-shadow sobre un foco radial, una cinta recortada con clip-path, estrellas de valoración pintadas con un degradado al 86 % y recortadas con una máscara, y el color del esmalte elegido con radios y :has() (hue-rotate en la lista de filter)"
example_tags: "css|profesional|drop-shadow|mask-image|has|hue-rotate|clip-path|producto"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="product">
  <div class="product__media">
    <p class="ribbon">Hecho a mano</p>
    <img class="product__image" src="olla.svg" alt="Olla de barro con dos asas y franjas decorativas" width="240" height="220">
  </div>

  <div class="product__info">
    <p class="product__maker">Taller Barro Vivo · Oaxaca</p>
    <h1 class="product__title">Olla de barro de 3 litros</h1>
    <p class="rating">
      <span class="rating__stars" style="--rating: 4.3" aria-hidden="true"></span>
      4.3 de 5 <a href="/tienda/olla-de-barro/opiniones">(128 opiniones)</a>
    </p>
    <p class="price">$640 <small>IVA incluido</small></p>

    <fieldset class="glaze">
      <legend>Esmalte</legend>
      <label class="glaze__option"><input type="radio" name="glaze" value="natural" checked><span class="glaze__swatch is-natural"></span>Natural</label>
      <label class="glaze__option"><input type="radio" name="glaze" value="verde"><span class="glaze__swatch is-green"></span>Verde</label>
      <label class="glaze__option"><input type="radio" name="glaze" value="azul"><span class="glaze__swatch is-blue"></span>Azul</label>
    </fieldset>

    <button class="button" type="button">Añadir al carrito</button>

    <ul class="features">
      <li>Barro cocido a leña, sin plomo.</li>
      <li>Apta para estufa de gas y horno.</li>
      <li>Cada pieza es distinta: el color puede variar.</li>
    </ul>
  </div>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Ficha de producto
   - Imagen: un SVG con el fondo transparente, así que su sombra es un
     drop-shadow() (box-shadow sería un rectángulo). Debajo, un foco radial.
   - Cinta «Hecho a mano»: un elemento propio recortado con polygon(); el
     recorte no toca la caja de la imagen ni ningún anillo de foco.
   - Estrellas: una sola caja de 5em × 1em pintada con un degradado con
     parada dura en el porcentaje de la nota (4.3 / 5 = 86 %) y recortada con
     una máscara de estrella repetida cada 1em. El número va en el texto.
   - Esmalte: tres radios nativos; :has() lee cuál está marcado y cambia el
     filtro de la imagen. hue-rotate va ANTES de drop-shadow en la lista, así
     que la sombra no cambia de color. Sin JavaScript.
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

  button,
  input {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --color-text: #1c1917;
    --color-muted: #57534e;
    --color-accent: #9a3412;
    --color-star: #d97706;
    --color-star-empty: #d6d3d1;
    --shadow-pot: drop-shadow(0 14px 10px rgb(67 20 7 / 0.35));
    --radius: 12px;
  }
}

@layer base {
  body {
    padding: 16px;
    color: var(--color-text);
    font-family: system-ui, sans-serif;
    line-height: 1.5;
  }

  a {
    color: var(--color-accent);
  }

  :focus-visible {
    outline: 3px solid #1d4ed8;
    outline-offset: 2px;
  }
}

@layer components {
  .product {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
    gap: 20px;
    max-width: 52rem;
  }

  .product__media {
    position: relative;
    display: grid;
    place-items: center;
    min-height: 260px;
    border-radius: var(--radius);
    background: radial-gradient(circle at 50% 65%, #fff7ed, #fed7aa 55%, #fdba74);
  }

  .product__image {
    width: 220px;
    filter: var(--shadow-pot);
  }

  /* El esmalte elegido: :has() mira el radio marcado. */
  .product:has([value="verde"]:checked) .product__image {
    filter: hue-rotate(115deg) saturate(0.85) var(--shadow-pot);
  }

  .product:has([value="azul"]:checked) .product__image {
    filter: hue-rotate(185deg) saturate(0.9) var(--shadow-pot);
  }

  .ribbon {
    position: absolute;
    top: 14px;
    left: -6px;
    padding: 4px 22px 4px 12px;
    background: var(--color-accent);
    color: #ffffff;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    clip-path: polygon(0 0, 100% 0, calc(100% - 10px) 50%, 100% 100%, 0 100%);
  }

  .product__info {
    display: grid;
    align-content: start;
    gap: 10px;
  }

  .product__maker {
    color: var(--color-muted);
    font-size: 0.85rem;
  }

  .product__title {
    font-family: Georgia, serif;
    font-size: 1.6rem;
    line-height: 1.15;
    text-wrap: balance;
  }

  .rating {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    font-size: 0.9rem;
  }

  /* 5 estrellas de 1em: el degradado llena el 86 % (4.3 de 5) con el color
     de la estrella y el resto con gris; la máscara recorta las estrellas. */
  .rating__stars {
    width: 5em;
    height: 1em;
    background: linear-gradient(to right, var(--color-star) calc(var(--rating) / 5 * 100%), var(--color-star-empty) 0);
    mask-image: url("icon-star.svg");
    mask-size: 1em 1em;
    mask-repeat: repeat-x;
  }

  .price {
    font-size: 1.5rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }

  .price small {
    color: var(--color-muted);
    font-size: 0.8rem;
    font-weight: 400;
  }

  .glaze {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 14px;
    padding: 8px 12px 10px;
    border: 1px solid #d6d3d1;
    border-radius: 8px;
  }

  .glaze legend {
    padding: 0 4px;
    font-weight: 700;
  }

  .glaze__option {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    cursor: pointer;
  }

  .glaze__swatch {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    box-shadow: inset 0 0 0 1px rgb(28 25 23 / 0.35);
  }

  .is-natural { background: #c2410c; }
  .is-green   { background: #4d7c0f; }
  .is-blue    { background: #1d4ed8; }

  .button {
    justify-self: start;
    padding: 10px 20px;
    border: 0;
    border-radius: 999px;
    background: var(--color-text);
    color: #ffffff;
    font-weight: 700;
    cursor: pointer;
  }

  .features {
    padding-inline-start: 1.2em;
    color: var(--color-muted);
    font-size: 0.9rem;
  }
}
```
