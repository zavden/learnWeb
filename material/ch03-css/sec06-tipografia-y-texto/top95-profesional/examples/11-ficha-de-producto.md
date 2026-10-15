---
example_description: "La ficha de un electrodoméstico con nombres y códigos larguísimos: título equilibrado con guiones, migas de pan recortadas, códigos de modelo que se parten con wbr y overflow-wrap, especificaciones con cifras tabulares y unidades que no se separan, y el precio anterior tachado"
example_tags: "css|profesional|tipografia|hyphens|wbr|overflow-wrap|tabular-nums|nbsp|ficha-de-producto"
example_stage: professional
example_importance: important
---

# HTML

```html
<nav class="crumbs" aria-label="Migas de pan">
  <ol>
    <li><a href="/">Inicio</a></li>
    <li><a href="/cocina">Cocina</a></li>
    <li><a href="/cocina/pequenos-electrodomesticos">Pequeños electrodomésticos</a></li>
    <li><a href="/cocina/pequenos-electrodomesticos/deshidratadores" aria-current="page">Deshidratadores de alimentos</a></li>
  </ol>
</nav>

<main class="product">
  <header class="product-header">
    <p class="badge">Envío gratis</p>
    <h1>Deshidratador de alimentos de acero inoxidable con termostato digital y diez bandejas</h1>
    <p class="model">Modelo <code>DSH-<wbr>INX-<wbr>10B-<wbr>220V-<wbr>MX</code></p>
  </header>

  <div class="buy">
    <p class="price"><span class="now">$4,899.00</span> <span class="was">antes <s>$5,690.00</s></span></p>
    <a class="button" href="/carrito/agregar?sku=DSH-INX-10B-220V-MX">Agregar al carrito</a>
  </div>

  <section class="description" aria-labelledby="desc-title">
    <h2 id="desc-title">Descripción</h2>
    <p>Seca frutas, verduras, hierbas y carne de forma uniforme gracias a su ventilador trasero y su termostato electrónico, ajustable de grado en grado. Las bandejas son de acero inoxidable 304 (<i lang="en">food grade</i>) y se pueden lavar en el lavavajillas.</p>
  </section>

  <section aria-labelledby="specs-title">
    <h2 id="specs-title">Especificaciones</h2>
    <dl class="specs">
      <div><dt>Potencia</dt><dd>1000&nbsp;W</dd></div>
      <div><dt>Tensión</dt><dd>127&nbsp;V</dd></div>
      <div><dt>Temperatura</dt><dd>35–75&nbsp;°C</dd></div>
      <div><dt>Temporizador</dt><dd>hasta 24&nbsp;h</dd></div>
      <div><dt>Bandejas</dt><dd>10 de 30&nbsp;×&nbsp;40&nbsp;cm</dd></div>
      <div><dt>Medidas</dt><dd>34&nbsp;×&nbsp;45&nbsp;×&nbsp;42&nbsp;cm</dd></div>
      <div><dt>Peso</dt><dd>9.8&nbsp;kg</dd></div>
      <div><dt>Código de barras</dt><dd><code>7501234567893</code></dd></div>
    </dl>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Ficha de producto
   - Migas de pan en una línea: el último elemento, el más largo, es un
     elemento flex con min-width: 0 y se recorta con «…».
   - Título largo: text-wrap: balance (líneas parecidas) y guiones automáticos.
   - Código de modelo: un guion ya deja partir la línea detrás de él, salvo
     cuando le sigue una cifra (-10B, -220V). Un <wbr> detrás de cada guion lo
     garantiza siempre; overflow-wrap: anywhere, por si llega un código sin
     guiones.
   - Especificaciones: cifras tabulares, rangos con raya corta (–, U+2013),
     el signo de multiplicar (×) y &nbsp; entre cada cifra y su unidad.
   - Precio anterior en <s>, con la raya más clara para que el número se lea.
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
}

@layer tokens {
  :root {
    --font-mono: ui-monospace, Menlo, Consolas, monospace;
    --color-text: #0f172a;
    --color-muted: #475569;
    --color-line: #e2e8f0;
    --color-brand: #3730a3;
    --color-badge: #166534;
    --color-strike: #94a3b8;
    --color-focus: #1d4ed8;
  }
}

@layer base {
  body {
    padding: 16px;
    color: var(--color-text);
    font-family: system-ui, sans-serif;
    line-height: 1.5;
  }

  a:focus-visible {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }

  code {
    font-family: var(--font-mono);
    font-size: 0.9em;
  }
}

@layer components {
  /* ─── Migas de pan ─── */
  .crumbs ol {
    display: flex;
    gap: 6px;
    max-inline-size: 48rem;
    margin-inline: auto;
    padding: 0;
    list-style: none;
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  .crumbs li {
    flex: none;
    white-space: nowrap;
  }

  .crumbs li + li::before {
    content: "›" / "";
    margin-inline-end: 6px;
  }

  /* El último cede: puede encoger (min-width: 0) y recorta lo que no cabe. */
  .crumbs li:last-child {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .crumbs a {
    color: inherit;
  }

  .crumbs [aria-current="page"] {
    color: var(--color-text);
    text-decoration: none;
  }

  /* ─── Producto ─── */
  .product {
    display: grid;
    gap: 16px;
    max-inline-size: 48rem;
    margin: 12px auto 0;
  }

  .product-header {
    display: grid;
    gap: 6px;
  }

  .badge {
    justify-self: start;
    padding: 2px 8px;
    border-radius: 4px;
    background: var(--color-badge);
    color: #ffffff;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .product h1 {
    font-size: 1.6rem;
    line-height: 1.2;
    hyphens: auto;
    text-wrap: balance;
  }

  .model {
    color: var(--color-muted);
    font-size: 0.85rem;
    overflow-wrap: anywhere;
  }

  /* ─── Compra ─── */
  .buy {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 20px;
    align-items: center;
    padding: 12px 16px;
    border: 1px solid var(--color-line);
    border-radius: 12px;
  }

  .price {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 10px;
    align-items: baseline;
    font-variant-numeric: tabular-nums;
  }

  .now {
    font-size: 1.8rem;
    font-weight: 800;
    letter-spacing: -0.01em;
  }

  .was {
    color: var(--color-muted);
    font-size: 0.85rem;
  }

  .was s {
    text-decoration-color: var(--color-strike);
    text-decoration-thickness: 2px;
  }

  .button {
    padding: 12px 20px;
    border-radius: 999px;
    background: var(--color-brand);
    color: #ffffff;
    font-weight: 700;
    text-decoration: none;
    text-box: trim-both cap alphabetic;
  }

  /* ─── Texto ─── */
  .product h2 {
    margin-block-end: 6px;
    font-size: 1.1rem;
  }

  .description p {
    max-inline-size: 65ch;
    hyphens: auto;
    text-wrap: pretty;
  }

  /* ─── Especificaciones: rótulo | valor en columnas compartidas ─── */
  .specs {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    column-gap: 16px;
    font-size: 0.9rem;
  }

  .specs div {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    padding-block: 6px;
    border-block-end: 1px solid var(--color-line);
  }

  .specs dt {
    color: var(--color-muted);
  }

  .specs dd {
    margin: 0;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }
}
```
