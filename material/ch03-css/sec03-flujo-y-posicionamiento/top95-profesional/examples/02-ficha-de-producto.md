---
example_description: "La ficha de un producto: caja de compra flotante junto a la galería (que se coloca debajo si no cabe), miniaturas inline-block, etiquetas posicionadas y una barra de compra sticky que acompaña al lector hasta el final de la ficha"
example_tags: "css|profesional|float|flow-root|sticky|position|inline-block"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="store-header">
  <a class="logo" href="#">Cacharrería Nube</a>
  <a class="cart" href="#" aria-label="Cesta: 1 producto">Cesta <span class="cart-count" aria-hidden="true">1</span></a>
</header>

<main class="page">
  <article class="product" aria-labelledby="product-title">
    <div class="product-top">
      <section class="buy-box" aria-labelledby="product-title">
        <p class="tag">Envío gratis</p>
        <h1 class="product-title" id="product-title">Hervidor esmaltado de 1,7 litros</h1>
        <p class="rating"><img class="icon" src="icon-star.svg" alt=""><strong>4,7</strong> de 5 · <a href="#reviews">128 opiniones</a></p>
        <p class="price"><strong>49,90 €</strong> <del>59,90 €</del></p>
        <p class="delivery"><img class="icon" src="icon-truck.svg" alt="">Recíbelo el jueves 15 de octubre</p>
        <a class="button" href="#">Añadir a la cesta</a>
      </section>

      <section class="gallery" aria-label="Fotos del producto">
        <figure class="gallery-main">
          <img src="kettle-1.svg" width="320" height="320" alt="Hervidor rojo esmaltado con asa curva">
          <span class="gallery-tag">Nuevo color</span>
        </figure>
        <ul class="thumbs">
          <li><a class="thumb" href="#" aria-current="true"><img src="kettle-1.svg" width="320" height="320" alt="Rojo"></a></li>
          <li><a class="thumb" href="#"><img src="kettle-2.svg" width="320" height="320" alt="Verde azulado"></a></li>
          <li><a class="thumb" href="#"><img src="kettle-3.svg" width="320" height="320" alt="Negro"></a></li>
        </ul>
      </section>
    </div>

    <section class="details">
      <h2>Descripción</h2>
      <p>Acero esmaltado por dentro y por fuera, sin plásticos en contacto con el agua. Sirve para vitrocerámica, gas e inducción, y el asa se mantiene fría gracias a su recubrimiento de baquelita.</p>
      <h2>Características</h2>
      <dl class="specs">
        <div class="spec"><dt>Capacidad</dt><dd>1,7 litros</dd></div>
        <div class="spec"><dt>Peso</dt><dd>1,1 kg</dd></div>
        <div class="spec"><dt>Material</dt><dd>Acero esmaltado y baquelita</dd></div>
        <div class="spec"><dt>Garantía</dt><dd>3 años</dd></div>
      </dl>
      <h2 id="reviews">Opiniones</h2>
      <blockquote class="review"><p>«Hierve rápido y el silbido se oye desde el salón. El esmalte no se ha manchado en seis meses.»</p><footer>— Elena P., Burgos</footer></blockquote>
    </section>

    <div class="quick-buy" role="region" aria-label="Compra rápida">
      <p class="quick-buy-name">Hervidor esmaltado 1,7 L · <strong>49,90 €</strong></p>
      <a class="button button--small" href="#">Añadir a la cesta</a>
    </div>
  </article>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Ficha de producto
   - Arriba, dos «columnas» sin flexbox ni grid: la caja de compra flota a la
     derecha y la galería es un BFC (flow-root), que no se mete debajo del
     flotante: se coloca a su lado. Si no cabe (min-width), baja debajo.
   - La barra de compra rápida es sticky abajo: acompaña al lector mientras
     recorre la ficha y se queda en su sitio al llegar al final del artículo
     (sticky nunca sale de su padre).
   - Insignias con position sobre su referencia; escala de z-index.
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
}

@layer tokens {
  :root {
    --color-bg: #ffffff;
    --color-surface: #f8fafc;
    --color-text: #1e293b;
    --color-text-muted: #475569;
    --color-border: #e2e8f0;
    --color-brand: #b91c1c;
    --color-brand-dark: #7f1d1d;
    --color-focus: #1d4ed8;

    --radius: 12px;
    --z-raised: 1;
    --z-sticky: 200;
  }
}

@layer base {
  /* Lo sticky de abajo no debe tapar lo que recibe el foco: el navegador deja
     este hueco al desplazar hasta un enlace enfocado o un ancla. */
  html {
    scroll-padding-bottom: 5rem;
  }

  body {
    background: var(--color-bg);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
  }

  :where(a) {
    color: var(--color-focus);
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  /* ─── Cabecera de la tienda ─── */
  .store-header {
    display: flow-root;                  /* contiene el enlace flotante de la cesta */
    padding: 0.75rem clamp(1rem, 4vw, 2rem);
    border-bottom: 1px solid var(--color-border);
  }

  .logo {
    color: var(--color-text);
    font-weight: 800;
    text-decoration: none;
  }

  /* El contador se monta en la esquina del enlace: padre relative, hijo absolute. */
  .cart {
    position: relative;
    float: right;
    padding-right: 0.75rem;
    color: var(--color-text);
    text-decoration: none;
  }

  .cart-count {
    position: absolute;
    top: -0.4rem;
    right: -0.6rem;
    min-width: 1.25rem;
    padding: 0 0.3rem;
    border-radius: 999px;
    background: var(--color-brand);
    color: #ffffff;
    font-size: 0.75rem;
    font-weight: 700;
    line-height: 1.25rem;
    text-align: center;
  }

  .page {
    width: min(100% - 2rem, 60rem);
    margin: 1rem auto 3rem;
  }

  /* ─── Arriba: caja de compra flotante + galería BFC ─── */
  .product-top {
    display: flow-root;                  /* contiene la caja flotante */
    margin-top: 1rem;
  }

  /* Si a la izquierda de la caja no caben la galería (18rem) y el hueco (2rem),
     la caja ocupa todo el ancho en vez de dejar un hueco vacío. Sin media queries
     (módulo de responsive), con un truco conocido: (40rem - 100%) * 999 es enorme
     cuando el contenedor mide menos de 40rem y negativo cuando mide más, así que
     clamp() elige el 100 % o los 20rem. El margen izquierdo hace lo mismo al revés. */
  .buy-box {
    float: right;
    width: clamp(min(20rem, 100%), (40rem - 100%) * 999, 100%);
    margin: 0 0 1.5rem clamp(0rem, (100% - 40rem) * 999, 2rem);
    padding: 1.25rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
  }

  /* Un BFC junto a un flotante se estrecha y se pone a su lado. Con min-width,
     si a su lado quedan menos de 18rem, el navegador lo coloca debajo. */
  .gallery {
    display: flow-root;
    min-width: min(100%, 18rem);
    margin-bottom: 1.5rem;
  }

  .tag {
    display: inline-block;
    padding: 0.1rem 0.6rem;
    border-radius: 999px;
    background: #dcfce7;
    color: #166534;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .product-title {
    margin-block: 0.5rem;
    font-size: clamp(1.4rem, 4vw, 1.8rem);
    line-height: 1.2;
  }

  /* Iconos de 1em dentro de la línea: bajados 1/8 para centrarlos con el texto. */
  .icon {
    display: inline-block;
    width: 1.1em;
    height: 1.1em;
    margin-right: 0.35em;
    vertical-align: -0.2em;
  }

  .rating,
  .delivery {
    font-size: 0.9rem;
  }

  .price {
    margin-block: 0.75rem;
    font-size: 1.6rem;
  }

  .price del {
    color: var(--color-text-muted);
    font-size: 1rem;
  }

  .delivery {
    margin-bottom: 1rem;
    color: #166534;
  }

  .button {
    display: block;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    background: var(--color-brand);
    color: #ffffff;
    font-weight: 700;
    text-align: center;
    text-decoration: none;
  }

  .button:hover {
    background: var(--color-brand-dark);
  }
  /* La etiqueta se coloca en la esquina de la foto: la figura es la referencia. */
  .gallery-main {
    position: relative;
    border-radius: var(--radius);
    background: var(--color-surface);
  }

  .gallery-main img {
    width: 100%;
    border-radius: var(--radius);
  }

  .gallery-tag {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    padding: 0.15rem 0.6rem;
    border-radius: 999px;
    background: #1e293b;
    color: #ffffff;
    font-size: 0.8rem;
    font-weight: 600;
  }

  /* Miniaturas en fila: inline-block alineadas por arriba. */
  .thumbs {
    margin-top: 0.75rem;
    padding: 0;
    list-style: none;
  }

  .thumbs li {
    display: inline-block;
    vertical-align: top;
    width: 4.5rem;
    margin-right: 0.5rem;
  }

  .thumb {
    display: block;
    border: 2px solid var(--color-border);
    border-radius: 8px;
  }

  .thumb img {
    border-radius: 6px;
  }

  .thumb[aria-current="true"] {
    border-color: var(--color-text);
  }

  /* ─── Detalles ─── */
  .details h2 {
    margin: 1.5rem 0 0.5rem;
    font-size: 1.2rem;
  }

  .details > p {
    max-width: 65ch;
  }

  .specs {
    max-width: 30rem;
  }

  .spec {
    padding-block: 0.4rem;
    border-bottom: 1px solid var(--color-border);
  }

  /* Término y valor en la misma línea: dos cajas inline-block. */
  .spec dt,
  .spec dd {
    display: inline-block;
    vertical-align: top;
  }

  .spec dt {
    width: 40%;
    color: var(--color-text-muted);
  }

  .review {
    max-width: 65ch;
    margin-bottom: 0.75rem;
    padding: 0.75rem 1rem;
    border-left: 4px solid #fca5a5;
    background: var(--color-surface);
  }

  .review footer {
    margin-top: 0.25rem;
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  /* ─── Barra de compra rápida ───
     sticky + bottom: 0 → se pega al borde inferior de la ventana mientras su sitio
     natural (el final del artículo) aún no ha llegado. No puede salir del artículo:
     al terminar la ficha se queda en su sitio. z-index de la escala, por encima
     de la galería y sus etiquetas. */
  .quick-buy {
    position: sticky;
    bottom: 0;
    z-index: var(--z-sticky);
    margin-top: 1.5rem;
    padding: 0.6rem 1rem;
    border-top: 1px solid var(--color-border);
    background: #ffffff;
    box-shadow: 0 -6px 16px rgb(15 23 42 / 0.08);
  }

  .quick-buy-name {
    padding: 0.4rem 11rem 0.4rem 0;      /* deja sitio al botón, que va encima a la derecha */
    font-size: 0.95rem;
  }

  /* La barra sticky está posicionada: es la referencia del botón. top y bottom a 0
     + height: fit-content + margin-block: auto lo centran en vertical. */
  .button--small {
    position: absolute;
    top: 0;
    right: 1rem;
    bottom: 0;
    height: fit-content;
    margin-block: auto;
    padding: 0.4rem 0.9rem;
    font-size: 0.9rem;
  }

}
```
