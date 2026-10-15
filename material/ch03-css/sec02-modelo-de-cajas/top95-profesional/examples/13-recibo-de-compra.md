---
example_description: "Un recibo de compra: papel centrado con sombras en capas, borde inferior dentado con un pseudoelemento y un fondo repetido, separadores discontinuos y dobles, un sello con borde y outline-offset, y cifras alineadas en una tabla"
example_tags: "css|profesional|recibo|border|background|pseudoelementos"
example_stage: professional
example_importance: useful
---

# HTML

```html
<main class="receipt" aria-labelledby="receipt-title">
  <header class="receipt-header">
    <img class="receipt-logo" src="logo.svg" width="96" height="96" alt="">
    <h1 class="receipt-store" id="receipt-title">Ultramarinos Lucía</h1>
    <p class="receipt-address">Calle de la Platería, 14 · 47003 Valladolid<br>NIF B-47123456 · Tel. 983 00 00 00</p>
  </header>

  <dl class="receipt-meta">
    <div class="meta-item"><dt>Ticket</dt><dd>T-2026-018427</dd></div>
    <div class="meta-item"><dt>Fecha</dt><dd><time datetime="2026-11-14T12:47">14/11/2026 · 12:47</time></dd></div>
    <div class="meta-item"><dt>Caja</dt><dd>2 · Atiende Rosa</dd></div>
    <div class="meta-item"><dt>Cliente</dt><dd>Socia n.º 0381</dd></div>
  </dl>

  <table class="items">
    <caption>Detalle de la compra</caption>
    <thead>
      <tr><th scope="col" class="qty">Ud.</th><th scope="col">Producto</th><th scope="col" class="amount">Importe</th></tr>
    </thead>
    <tbody>
      <tr><td class="qty">2</td><td>Pan de hogaza de masa madre</td><td class="amount">5,80 €</td></tr>
      <tr><td class="qty">1</td><td>Queso de oveja curado, D. O. Zamorano (cuña de 350 g)</td><td class="amount">9,45 €</td></tr>
      <tr><td class="qty">3</td><td>Tomate de Mojados</td><td class="amount">4,20 €</td></tr>
      <tr><td class="qty">1</td><td>Aceite de oliva virgen extra, 1 l</td><td class="amount">11,90 €</td></tr>
      <tr><td class="qty">6</td><td>Huevos camperos</td><td class="amount">2,70 €</td></tr>
    </tbody>
    <tfoot>
      <tr><th scope="row" colspan="2">Subtotal</th><td class="amount">34,05 €</td></tr>
      <tr><th scope="row" colspan="2">Descuento de socia (5 %)</th><td class="amount">−1,70 €</td></tr>
      <tr><th scope="row" colspan="2">IVA incluido</th><td class="amount">2,36 €</td></tr>
      <tr class="total"><th scope="row" colspan="2">Total</th><td class="amount">32,35 €</td></tr>
    </tfoot>
  </table>

  <p class="payment">Pagado con tarjeta de débito terminada en 4821 <span class="stamp">Pagado</span></p>

  <img class="barcode" src="barcode.svg" width="240" height="48" alt="Código de barras del ticket T-2026-018427">

  <footer class="receipt-footer">
    <p><strong>¡Gracias por comprar en el barrio!</strong></p>
    <p>Cambios y devoluciones con este ticket hasta el 14 de diciembre de 2026.</p>
  </footer>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Recibo de compra
   - El papel: un bloque centrado de min(100% − 2rem, 25rem) con dos sombras (una
     cercana y otra lejana) que no ocupan espacio.
   - El borde dentado: un ::after de bloque que sale hasta los lados con márgenes
     negativos (los del relleno) y cuelga por debajo del papel con un margen inferior
     negativo. Su fondo es un pequeño SVG de un diente repetido en horizontal.
     display: flow-root en el papel evita que ese margen colapse (lección de márgenes).
   - Separadores con estilos de borde: dashed para las secciones, double para el total.
   - El sello: borde + outline separado con outline-offset = un marco doble.
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
    --color-desk: #d6d3d1;
    --color-paper: #ffffff;
    --color-ink: #1c1917;
    --color-ink-muted: #57534e;
    --color-rule: #a8a29e;
    --color-stamp: #15803d;

    --pad: 1.5rem;
    --tooth-height: 10px;
    --font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  }
}

@layer base {
  body {
    background: var(--color-desk);
    color: var(--color-ink);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    font-size: 0.9375rem;
    line-height: 1.5;
  }
}

@layer components {
  /* flow-root es imprescindible: sin él, el margen inferior negativo del ::after
     COLAPSARÍA con el margen del recibo (no hay relleno ni borde abajo que los separe),
     el papel crecería hasta incluir los dientes y su fondo blanco los taparía. */
  .receipt {
    display: flow-root;
    width: min(100% - 2rem, 25rem);
    margin: 2rem auto calc(2rem + var(--tooth-height));   /* + el diente que cuelga */
    padding: var(--pad) var(--pad) 0;
    background: var(--color-paper);
    box-shadow: 0 1px 2px rgb(28 25 23 / 0.12), 0 16px 40px rgb(28 25 23 / 0.2);
  }

  /* El borde dentado. Ancho: los márgenes negativos laterales lo llevan de borde a
     borde del papel. Alto: 10px. El margen inferior negativo lo saca por debajo:
     el contenido del recibo «termina» 10px antes de que termine el ::after. */
  .receipt::after {
    content: "";
    display: block;
    height: var(--tooth-height);
    margin: var(--pad) calc(var(--pad) * -1) calc(var(--tooth-height) * -1);
    background: url("zigzag.svg") 0 0 / 16px var(--tooth-height) repeat-x;
  }

  /* ─── Cabecera ─── */
  .receipt-header {
    padding-bottom: 1rem;
    border-bottom: 2px dashed var(--color-rule);
    text-align: center;
  }

  .receipt-logo {
    width: 3rem;
    margin: 0 auto 0.5rem;              /* bloque con ancho: se centra con márgenes auto */
    border-radius: 10px;
  }

  .receipt-store {
    font-size: 1.25rem;
    letter-spacing: 0.02em;
  }

  .receipt-address {
    color: var(--color-ink-muted);
    font-size: 0.8125rem;
  }

  /* ─── Datos del ticket en dos columnas de cajas inline-block ─── */
  /* 48 % + 48 % + el espacio en blanco entre las dos cajas cabe en el 100 %. */
  .receipt-meta {
    padding-block: 0.75rem;
    border-bottom: 2px dashed var(--color-rule);
  }

  .meta-item {
    display: inline-block;
    width: 48%;
    margin-bottom: 0.375rem;
    vertical-align: top;                /* vertical-align llega en el módulo de flujo */
  }

  .meta-item dt {
    color: var(--color-ink-muted);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .meta-item dd {
    font-family: var(--font-mono);
    font-size: 0.875rem;
  }

  /* ─── Productos ─── */
  .items {
    width: 100%;
    margin-top: 0.75rem;
    border-collapse: collapse;
  }

  .items caption {
    padding-bottom: 0.25rem;
    color: var(--color-ink-muted);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-align: start;
    text-transform: uppercase;
  }

  .items th,
  .items td {
    padding: 0.3rem 0;
    text-align: start;
    vertical-align: top;
  }

  .items thead th {
    border-bottom: 1px solid var(--color-rule);
    color: var(--color-ink-muted);
    font-size: 0.75rem;
  }

  .items .qty {
    width: 2.5rem;
    font-family: var(--font-mono);
  }

  /* Los importes no se parten y se alinean a la derecha; el padding izquierdo los
     separa de un nombre de producto largo. */
  .items .amount {
    padding-left: 1rem;
    font-family: var(--font-mono);
    text-align: end;
    white-space: nowrap;
  }

  .items tbody tr:last-child td {
    padding-bottom: 0.75rem;
  }

  .items tfoot th {
    font-weight: 400;
    text-align: end;
  }

  .items tfoot tr:first-child > * {
    padding-top: 0.75rem;
    border-top: 2px dashed var(--color-rule);
  }

  /* El total: separado por un borde doble (3px = línea + hueco + línea) */
  .items .total > * {
    padding-top: 0.5rem;
    border-top: 3px double var(--color-ink);
    font-size: 1.25rem;
    font-weight: 800;
  }

  /* ─── Pago y sello ─── */
  .payment {
    margin-top: 1.25rem;
    color: var(--color-ink-muted);
    font-size: 0.8125rem;
  }

  /* Marco doble sin elementos extra: el borde es la línea de dentro y el outline,
     separado 3px con outline-offset, la de fuera. Ninguno de los dos se mueve. */
  .stamp {
    display: inline-block;
    margin: 0.5rem 0 0 0.5rem;
    padding: 0.125rem 0.625rem;
    border: 2px solid var(--color-stamp);
    border-radius: 6px;
    outline: 1px solid var(--color-stamp);
    outline-offset: 3px;
    color: var(--color-stamp);
    font-size: 0.875rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .barcode {
    width: min(100%, 15rem);
    margin: 1.5rem auto 0;
  }

  .receipt-footer {
    margin-top: 1rem;
    color: var(--color-ink-muted);
    font-size: 0.8125rem;
    text-align: center;
  }

  .receipt-footer strong {
    color: var(--color-ink);
    font-size: 0.9375rem;
  }
}
```
