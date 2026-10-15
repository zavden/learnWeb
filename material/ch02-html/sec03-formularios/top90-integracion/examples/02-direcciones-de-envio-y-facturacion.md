---
example_description: "Dos direcciones en un mismo formulario: tokens de autocompletado con sección shipping/billing, códigos con inputmode y un fieldset que se desactiva y deja de enviarse"
example_tags: "integracion|formularios|autocomplete|fieldset|disabled|inputmode|pago"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<!-- Envía con la casilla marcada y luego desmarcada: compara lo que llega.
     (onchange: los eventos llegan en el capítulo de JavaScript.) -->
<h1>Paso 2 de 3: direcciones</h1>
<form action="https://semillasribera.example/pedido/direcciones" method="post">
  <!-- Los prefijos shipping y billing separan las dos direcciones para el autocompletado -->
  <fieldset>
    <legend>Dirección de envío</legend>
    <p><label for="ship-name">Nombre de quien recibe</label><input id="ship-name" name="ship_name" autocomplete="shipping name" required></p>
    <p><label for="ship-line1">Calle y número</label><input id="ship-line1" name="ship_line1" autocomplete="shipping address-line1" required></p>
    <p><label for="ship-line2">Piso, puerta… (opcional)</label><input id="ship-line2" name="ship_line2" autocomplete="shipping address-line2"></p>
    <p>
      <label for="ship-postal">Código postal</label>
      <input id="ship-postal" name="ship_postal_code" autocomplete="shipping postal-code" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" size="6" required>
    </p>
    <p><label for="ship-city">Localidad</label><input id="ship-city" name="ship_city" autocomplete="shipping address-level2" required></p>
    <p>
      <label for="ship-phone">Teléfono para el repartidor</label>
      <input id="ship-phone" name="ship_phone" type="tel" autocomplete="shipping tel" required aria-describedby="ship-phone-hint">
      <small id="ship-phone-hint">Solo lo usaremos si no te encuentra en casa.</small>
    </p>
  </fieldset>

  <p>
    <label>
      <input type="checkbox" name="same_address" checked onchange="document.getElementById('billing').disabled = this.checked">
      Quiero la factura con la misma dirección
    </label>
  </p>

  <!-- disabled: ni foco, ni validación, ni envío (lección de controles) -->
  <fieldset id="billing" disabled>
    <legend>Datos de facturación</legend>
    <p><label for="bill-name">Nombre o razón social</label><input id="bill-name" name="bill_name" autocomplete="billing name" required></p>
    <p>
      <label for="bill-tax-id">NIF</label>
      <input id="bill-tax-id" name="bill_tax_id" pattern="[0-9]{8}[A-Z]" maxlength="9" size="10" required aria-describedby="bill-tax-id-hint">
      <small id="bill-tax-id-hint">Ocho cifras y una letra mayúscula, sin espacios: 12345678Z.</small>
    </p>
    <p><label for="bill-line1">Calle y número</label><input id="bill-line1" name="bill_line1" autocomplete="billing address-line1" required></p>
    <p><label for="bill-postal">Código postal</label><input id="bill-postal" name="bill_postal_code" autocomplete="billing postal-code" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" size="6" required></p>
  </fieldset>

  <button type="submit">Continuar con el pago</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  max-width: 36rem;
}

/* Etiquetas y pistas en su propia línea (display: capítulo de CSS) */
label,
small {
  display: block;
}

small {
  color: #475569;
}

fieldset {
  margin-bottom: 1rem;
}

legend {
  font-weight: 700;
}

/* El estado del formulario, expuesto al CSS */
fieldset:disabled {
  border-style: dashed;
}

input:user-invalid {
  outline: 2px solid #b91c1c;
}

:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Lo que entiende el autocompletado: cada
// campo con su token. El mismo dato (postal-code) aparece en dos secciones distintas.
console.table([...document.querySelectorAll('input[autocomplete]')].map((input) => ({
  campo: input.labels[0].textContent.trim(),
  name: input.name,
  autocomplete: input.autocomplete,
})));
```
