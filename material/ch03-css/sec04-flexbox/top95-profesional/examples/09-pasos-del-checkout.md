---
example_description: "El paso de envío de un checkout: indicador de pasos con conectores que se estiran, formulario con campos que se reparten la fila, opciones de envío como tarjetas y un resumen del pedido sticky que se coloca debajo cuando no cabe"
example_tags: "css|profesional|flexbox|checkout|formularios|sticky|align-self|sidebar"
example_stage: professional
example_importance: critical
---

# HTML

```html
<main class="checkout">
  <h1>Finalizar compra</h1>

  <nav aria-label="Pasos de la compra">
    <ol class="steps">
      <li class="step is-done"><span class="step-number" aria-hidden="true">✓</span> <span class="step-name">Carrito</span></li>
      <li class="step is-current" aria-current="step"><span class="step-number" aria-hidden="true">2</span> <span class="step-name">Envío</span></li>
      <li class="step"><span class="step-number" aria-hidden="true">3</span> <span class="step-name">Pago</span></li>
      <li class="step"><span class="step-number" aria-hidden="true">4</span> <span class="step-name">Confirmación</span></li>
    </ol>
  </nav>

  <div class="checkout-body">
    <form class="shipping" action="/checkout/envio" method="post">
      <fieldset>
        <legend>Dirección de entrega</legend>
        <div class="field-row">
          <p class="field is-wide"><label for="name">Nombre completo</label><input id="name" name="nombre" autocomplete="name" value="Ana Torres"></p>
          <p class="field"><label for="phone">Teléfono</label><input id="phone" name="telefono" type="tel" autocomplete="tel" value="33 1234 5678"></p>
        </div>
        <div class="field-row">
          <p class="field"><label for="street">Calle y número</label><input id="street" name="calle" autocomplete="address-line1" value="Av. Chapultepec 480, int. 12"></p>
        </div>
        <div class="field-row">
          <p class="field is-short"><label for="zip">Código postal</label><input id="zip" name="cp" inputmode="numeric" autocomplete="postal-code" value="44160"></p>
          <p class="field"><label for="city">Ciudad</label><input id="city" name="ciudad" autocomplete="address-level2" value="Guadalajara"></p>
          <p class="field"><label for="state">Estado</label><input id="state" name="estado" autocomplete="address-level1" value="Jalisco"></p>
        </div>
      </fieldset>

      <fieldset>
        <legend>Forma de envío</legend>
        <label class="option"><input type="radio" name="envio" value="estandar" checked><span class="option-text"><strong>Estándar</strong> 3 a 5 días hábiles</span><span class="option-price">90 MXN</span></label>
        <label class="option"><input type="radio" name="envio" value="express"><span class="option-text"><strong>Exprés</strong> Mañana antes de las 14:00</span><span class="option-price">180 MXN</span></label>
        <label class="option"><input type="radio" name="envio" value="recoger"><span class="option-text"><strong>Recoger en el vivero</strong> Av. Vallarta 2150, de 9:00 a 19:00</span><span class="option-price">Gratis</span></label>
      </fieldset>

      <div class="form-actions">
        <a href="/carrito">← Volver al carrito</a>
        <button>Continuar al pago</button>
      </div>
    </form>

    <aside class="summary" aria-labelledby="summary-title">
      <h2 id="summary-title">Tu pedido</h2>
      <ul class="summary-items">
        <li><img src="plant-monstera.svg" alt="" width="44" height="44"><span class="item-name">Monstera deliciosa en maceta de barro</span><span class="item-price">420</span></li>
        <li><img src="plant-pothos.svg" alt="" width="44" height="44"><span class="item-name">Pothos dorado ×2</span><span class="item-price">320</span></li>
      </ul>
      <form class="coupon" action="/checkout/cupon" method="post">
        <label class="coupon-label" for="coupon">Cupón de descuento</label>
        <div class="coupon-row">
          <input id="coupon" name="cupon" autocomplete="off" placeholder="OTONO10">
          <button>Aplicar</button>
        </div>
      </form>
      <dl class="totals">
        <div><dt>Subtotal</dt><dd>740 MXN</dd></div>
        <div><dt>Envío</dt><dd>90 MXN</dd></div>
        <div class="is-total"><dt>Total</dt><dd>830 MXN</dd></div>
      </dl>
    </aside>
  </div>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Checkout: paso de envío
   - Pasos: una fila en la que cada paso (salvo el último) lleva un conector
     ::after con flex: 1 que ocupa el espacio entre su nombre y el paso
     siguiente. Con flex-wrap, en una pantalla estrecha se reparten en líneas.
   - Formulario: filas de campos con flex-wrap; cada campo quiere 9rem (el
     nombre, el doble de crecimiento; el código postal, menos base).
   - Opciones de envío: radio rígido, texto que ocupa el resto y precio a la
     derecha. La opción marcada se resalta con :has(:checked).
   - Resumen: barra lateral que se coloca debajo si no cabe (base 16rem frente
     a 22rem con flex-grow 999), sticky arriba y con align-self: flex-start
     para que tenga recorrido.
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
    flex: none;
  }

  input,
  button {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --color-text: #1e293b;
    --color-muted: #475569;
    --color-border: #cbd5e1;
    --color-surface: #ffffff;
    --color-soft: #f8fafc;
    --color-brand: #166534;
    --color-brand-soft: #f0fdf4;
    --color-focus: #1d4ed8;

    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --radius: 0.5rem;
  }
}

@layer base {
  body {
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.45;
  }

  a {
    color: var(--color-brand);
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  .checkout {
    max-width: 64rem;
    margin-inline: auto;
    padding: var(--space-6) var(--space-4);
  }

  .checkout h1 {
    margin-bottom: var(--space-4);
    font-size: 1.6rem;
  }

  /* ─── Pasos ─── */
  .steps {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-bottom: var(--space-6);
    padding: 0;
    list-style: none;
  }

  .step {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex: 1 1 auto;
    color: var(--color-muted);
    font-size: 0.9rem;
  }

  /* El conector: una raya que ocupa lo que sobra en el paso (mínimo 1rem). */
  .step:not(:last-child)::after {
    content: "";
    flex: 1 1 1rem;
    min-width: 1rem;
    border-top: 2px solid var(--color-border);
  }

  .step:last-child {
    flex-grow: 0;
  }

  .step.is-done::after {
    border-color: var(--color-brand);
  }

  .step-number {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border: 2px solid var(--color-border);
    border-radius: 50%;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .is-done .step-number,
  .is-current .step-number {
    border-color: var(--color-brand);
    background: var(--color-brand);
    color: #ffffff;
  }

  .is-done,
  .is-current {
    color: var(--color-text);
    font-weight: 600;
  }

  /* ─── Cuerpo: formulario y resumen ─── */
  .checkout-body {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-6);
  }

  .shipping {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    flex: 999 1 22rem;
    min-width: 0;
  }

  fieldset {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
  }

  legend {
    padding-inline: var(--space-1);
    font-weight: 700;
  }

  /* Varios campos por fila; si no caben, bajan. */
  .field-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  /* Cada campo vive dentro de una .field-row (fila): ahí flex-basis es un ancho. Directamente
     dentro del fieldset (columna), los 9rem serían su ALTO. */
  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    flex: 1 1 9rem;
    min-width: 0;
    font-size: 0.85rem;
  }

  .field.is-wide {
    flex-grow: 2;
  }

  .field.is-short {
    flex-basis: 6rem;
  }

  .field input {
    min-width: 0;
    padding: var(--space-2) var(--space-3);
    border: 1px solid #64748b;
    border-radius: var(--radius);
  }

  /* Opciones de envío: radio, texto y precio al final. */
  .option {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    border: 2px solid var(--color-border);
    border-radius: var(--radius);
    cursor: pointer;
  }

  .option:has(:checked) {
    border-color: var(--color-brand);
    background: var(--color-brand-soft);
  }

  .option input {
    flex: none;
    margin: 0;
  }

  .option-text {
    flex: 1;
    min-width: 0;
    font-size: 0.9rem;
  }

  .option-text strong {
    display: block;
  }

  .option-price {
    flex: none;
    font-weight: 700;
  }

  .form-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .form-actions button {
    margin-left: auto;
    padding: var(--space-2) var(--space-6);
    border: 0;
    border-radius: 999px;
    background: var(--color-brand);
    color: #ffffff;
    font-weight: 700;
    cursor: pointer;
  }

  /* ─── Resumen ─── */
  .summary {
    position: sticky;
    top: var(--space-4);
    align-self: flex-start;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    flex: 1 1 16rem;
    padding: var(--space-4);
    border-radius: var(--radius);
    background: var(--color-soft);
  }

  .summary h2 {
    font-size: 1.1rem;
  }

  .summary-items {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: 0;
    list-style: none;
    font-size: 0.85rem;
  }

  .summary-items li {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .summary-items img {
    border-radius: var(--radius);
  }

  .item-name {
    flex: 1;
    min-width: 0;
  }

  .item-price {
    flex: none;
    font-weight: 600;
  }

  .coupon-label {
    display: block;
    margin-bottom: var(--space-1);
    font-size: 0.85rem;
  }

  .coupon-row {
    display: flex;
    gap: var(--space-2);
  }

  .coupon-row input {
    flex: 1;
    min-width: 0;
    padding: var(--space-1) var(--space-2);
    border: 1px solid #64748b;
    border-radius: var(--radius);
  }

  .coupon-row button {
    flex: none;
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--color-brand);
    border-radius: var(--radius);
    background: var(--color-surface);
    color: var(--color-brand);
    font-weight: 600;
    cursor: pointer;
  }

  /* Concepto e importe en los extremos de cada fila. */
  .totals div {
    display: flex;
    justify-content: space-between;
    padding-block: var(--space-1);
  }

  .totals dd {
    font-weight: 600;
  }

  .totals .is-total {
    margin-top: var(--space-1);
    border-top: 1px solid var(--color-border);
    font-size: 1.1rem;
    font-weight: 800;
  }
}
```
