---
example_description: "El pago de un pedido: resumen en una tabla, direcciones con tokens de sección, forma de envío con su precio, facturación que se desactiva, datos de tarjeta con sus tokens y el total en un output"
example_tags: "profesional|formularios|pago|autocomplete|shipping|billing|output|fieldset"
example_stage: professional
example_importance: critical
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Finalizar el pedido · Semillas Ribera</title>
  <meta name="description" content="Revisa tu pedido, elige la forma de envío y paga en Semillas Ribera.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <style>
    /* Solo legibilidad; el CSS se estudia en el capítulo 3 */
    .order-total { font-size: 1.25rem; font-weight: 700; }
  </style>
  <script defer src="js/form-audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://semillasribera.example/">Semillas Ribera</a></p>
    <!-- Durante el pago, el menú se reduce a lo imprescindible -->
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://semillasribera.example/cesta">Volver a la cesta</a></li>
        <li><a href="https://semillasribera.example/ayuda/pagos">Ayuda con el pago</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <h1>Finalizar el pedido</h1>

    <!-- 1. El resumen: una tabla de datos (módulo de contenido), no parte del formulario -->
    <table>
      <caption>Tu pedido</caption>
      <thead>
        <tr><th scope="col">Producto</th><th scope="col" class="num">Unidades</th><th scope="col" class="num">Importe</th></tr>
      </thead>
      <tbody>
        <tr><th scope="row">Semillas de tomate cherry</th><td class="num">2</td><td class="num">5,00 €</td></tr>
        <tr><th scope="row">Sustrato universal, 20 l</th><td class="num">1</td><td class="num">7,90 €</td></tr>
        <tr><th scope="row">Bandeja de semillero de 24 alveolos</th><td class="num">2</td><td class="num">7,00 €</td></tr>
      </tbody>
      <tfoot>
        <tr><th scope="row" colspan="2">Subtotal</th><td class="num">19,90 €</td></tr>
      </tfoot>
    </table>

    <p>Todos los campos son obligatorios salvo los marcados como opcionales.</p>

    <form id="checkout" class="form" action="https://semillasribera.example/pedido/pagar" method="post" oninput="updateTotal(this)">
      <fieldset>
        <legend>Contacto</legend>
        <div class="field">
          <label for="email">Correo electrónico</label>
          <span id="email-hint" class="hint">Te enviaremos la factura y el seguimiento del envío.</span>
          <input id="email" name="email" type="email" class="width-full" autocomplete="email" required aria-describedby="email-hint">
        </div>
      </fieldset>

      <!-- 2. Tokens con sección: «shipping» y «billing» separan las dos direcciones -->
      <fieldset>
        <legend>Dirección de envío</legend>
        <div class="field"><label for="ship-name">Nombre de quien recibe</label><input id="ship-name" name="ship_name" class="width-full" autocomplete="shipping name" required></div>
        <div class="field"><label for="ship-line1">Calle y número</label><input id="ship-line1" name="ship_line1" class="width-full" autocomplete="shipping address-line1" required></div>
        <div class="field"><label for="ship-line2">Piso, puerta, escalera (opcional)</label><input id="ship-line2" name="ship_line2" class="width-full" autocomplete="shipping address-line2"></div>
        <div class="inline-fields">
          <div class="field">
            <label for="ship-postal">Código postal</label>
            <input id="ship-postal" name="ship_postal_code" class="width-5" autocomplete="shipping postal-code" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" required>
          </div>
          <div class="field"><label for="ship-city">Localidad</label><input id="ship-city" name="ship_city" autocomplete="shipping address-level2" required></div>
        </div>
        <div class="field">
          <label for="ship-phone">Teléfono para el repartidor</label>
          <span id="ship-phone-hint" class="hint">Solo lo usará si no te encuentra.</span>
          <input id="ship-phone" name="ship_phone" type="tel" autocomplete="shipping tel" required aria-describedby="ship-phone-hint">
        </div>
      </fieldset>

      <!-- 3. Una pregunta, un grupo; el precio forma parte de cada respuesta -->
      <fieldset>
        <legend>¿Cómo quieres recibirlo?</legend>
        <div class="choice"><input id="delivery-standard" type="radio" name="delivery" value="standard" checked required><label for="delivery-standard">Envío estándar, de 2 a 3 días laborables: 3,95 €</label></div>
        <div class="choice"><input id="delivery-express" type="radio" name="delivery" value="express"><label for="delivery-express">Envío urgente, al día siguiente: 7,50 €</label></div>
        <div class="choice"><input id="delivery-pickup" type="radio" name="delivery" value="pickup"><label for="delivery-pickup">Recogida en el vivero de Ribera: gratis</label></div>
      </fieldset>

      <div class="choice">
        <!-- 4. data-ui: un control de la interfaz que solo activa o desactiva otro grupo
             (onchange: los eventos se estudian en el capítulo de JavaScript) -->
        <input id="same-billing" type="checkbox" data-ui checked onchange="document.getElementById('billing').disabled = this.checked">
        <label for="same-billing">Quiero la factura con los datos de envío</label>
      </div>

      <!-- 5. disabled: ni foco, ni validación, ni envío mientras la casilla esté marcada -->
      <fieldset id="billing" disabled>
        <legend>Datos de facturación</legend>
        <div class="field"><label for="bill-name">Nombre o razón social</label><input id="bill-name" name="bill_name" class="width-full" autocomplete="billing name" required></div>
        <div class="field">
          <label for="bill-tax-id">NIF</label>
          <span id="bill-tax-id-hint" class="hint">Ocho cifras y una letra mayúscula, sin espacios: 12345678Z.</span>
          <input id="bill-tax-id" name="bill_tax_id" class="width-10" pattern="[0-9]{8}[A-Z]" maxlength="9" required aria-describedby="bill-tax-id-hint">
        </div>
        <div class="field"><label for="bill-line1">Dirección fiscal</label><input id="bill-line1" name="bill_line1" class="width-full" autocomplete="billing address-line1" required></div>
      </fieldset>

      <fieldset>
        <legend>Tarjeta</legend>
        <p class="warning">Página de ejemplo: el pago es simulado. No escribas los datos de una tarjeta real.</p>
        <div class="field"><label for="cc-name">Titular, como aparece en la tarjeta</label><input id="cc-name" name="cc_name" class="width-full" autocomplete="cc-name" required></div>
        <div class="field">
          <label for="cc-number">Número de la tarjeta</label>
          <span id="cc-number-hint" class="hint">De 13 a 19 cifras; puedes dejar los espacios.</span>
          <!-- 6. Un número de tarjeta no es una cantidad: texto con teclado numérico -->
          <input id="cc-number" name="cc_number" class="width-20" autocomplete="cc-number" inputmode="numeric" pattern="[0-9 ]{13,23}" maxlength="23" required aria-describedby="cc-number-hint">
        </div>
        <div class="inline-fields">
          <div class="field">
            <label for="cc-exp">Caducidad</label>
            <span id="cc-exp-hint" class="hint">MM/AA</span>
            <input id="cc-exp" name="cc_exp" class="width-5" autocomplete="cc-exp" inputmode="numeric" pattern="(0[1-9]|1[0-2])/[0-9]{2}" maxlength="5" required aria-describedby="cc-exp-hint">
          </div>
          <div class="field">
            <label for="cc-csc">Código de seguridad</label>
            <span id="cc-csc-hint" class="hint">3 o 4 cifras, en el dorso</span>
            <input id="cc-csc" name="cc_csc" class="width-4" autocomplete="cc-csc" inputmode="numeric" pattern="[0-9]{3,4}" maxlength="4" required aria-describedby="cc-csc-hint">
          </div>
        </div>
      </fieldset>

      <!-- 7. output: el total calculado con el envío elegido. Se anuncia al cambiar y NO se
           envía: el servidor calcula el suyo -->
      <p class="order-total">Total con envío: <output id="order-total" for="delivery-standard delivery-express delivery-pickup">23,85 €</output></p>

      <div class="actions">
        <button type="submit" class="button-primary">Pagar el pedido</button>
      </div>
    </form>
  </main>

  <footer class="site-footer">
    <p>Pago seguro: la conexión está cifrada (HTTPS) y no guardamos los datos de tu tarjeta.</p>
    <p><a href="https://semillasribera.example/devoluciones">Devoluciones</a> · <a href="https://semillasribera.example/privacidad">Privacidad</a></p>
  </footer>

  <script>
    // Adelanto: JavaScript se explica en su capítulo. El total solo informa: el servidor no se
    // fía de él (por eso es un output, que no se envía).
    const SUBTOTAL = 19.9;
    const SHIPPING = { standard: 3.95, express: 7.5, pickup: 0 };

    function updateTotal(form) {
      const total = SUBTOTAL + SHIPPING[form.elements.delivery.value];
      form.querySelector('#order-total').value = total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
    }
  </script>
</body>
</html>
```
