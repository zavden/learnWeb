---
example_description: "El paso de envío de una compra: etiquetas en una columna max-content y campos en otra, filas a todo el ancho con 1 / -1, un campo de teléfono con su propia rejilla y opciones de envío en columnas auto-fit"
example_tags: "css|grid|formulario|max-content|lineas-negativas|auto-fit|alineacion"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<form class="checkout" action="/compra/envio" method="post">
  <h2 class="full">Dirección de envío</h2>

  <label for="ship-name">Nombre completo</label>
  <input id="ship-name" name="name" autocomplete="name" required>

  <label for="ship-street">Calle y número</label>
  <input id="ship-street" name="street" autocomplete="street-address" required>

  <label for="ship-zip">Código postal</label>
  <input id="ship-zip" class="is-short" name="zip" inputmode="numeric" autocomplete="postal-code" required>

  <label for="ship-city">Ciudad</label>
  <input id="ship-city" name="city" autocomplete="address-level2" required>

  <label for="ship-phone">Teléfono</label>
  <div class="phone">
    <select name="country-code" aria-label="Código de país">
      <option>+52</option>
      <option>+1</option>
      <option>+34</option>
    </select>
    <input id="ship-phone" name="phone" type="tel" autocomplete="tel-national">
  </div>

  <fieldset class="full shipping">
    <legend>Forma de envío</legend>
    <label class="option"><input type="radio" name="shipping" value="standard" checked> <b>Estándar</b> 3 a 5 días · 99 MXN</label>
    <label class="option"><input type="radio" name="shipping" value="express"> <b>Exprés</b> 1 a 2 días · 189 MXN</label>
    <label class="option"><input type="radio" name="shipping" value="pickup"> <b>En tienda</b> Recoges mañana · gratis</label>
  </fieldset>

  <label class="full check"><input type="checkbox" name="same-billing" checked> Usar esta dirección también para la factura</label>

  <div class="full actions">
    <a href="/carrito">Volver al carrito</a>
    <button>Continuar al pago</button>
  </div>
</form>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Formulario de envío
   - Dos columnas: etiquetas a la medida de la más larga (max-content) y campos
     con el resto (minmax(0, 1fr), para que ningún campo ensanche la página).
   - Cada etiqueta y su campo caen en la misma fila por la colocación automática;
     lo que debe ir a todo el ancho lleva .full (grid-column: 1 / -1).
   - El teléfono: una rejilla dentro de la celda (prefijo a su medida y número).
   - Las formas de envío: columnas auto-fit de al menos 8rem, que se apilan solas.
   ────────────────────────────────────────────────────────────────────────── */
* {
  box-sizing: border-box;
}

body {
  margin: 8px;
  color: #1e293b;
  font-family: system-ui, sans-serif;
}

input,
select,
button {
  font: inherit;
}

:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.checkout {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  align-items: baseline;         /* el texto de la etiqueta, en la línea del campo */
  gap: 10px 12px;
  max-width: 30rem;
  padding: 14px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 0.85rem;
}

.full {
  grid-column: 1 / -1;
}

.checkout h2 {
  margin: 0;
  font-size: 1.1rem;
}

.checkout > label:not(.full) {
  justify-self: end;
  font-weight: bold;
}

.checkout input:not([type]),
.checkout input[type="tel"],
.checkout select {
  padding: 5px 8px;
  border: 1px solid #64748b;
  border-radius: 6px;
}

/* El código postal no necesita todo el ancho: a su medida, al principio. */
.is-short {
  justify-self: start;
  width: 7rem;
}

.phone {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 6px;
}

/* El fieldset también es una rejilla: tres tarjetas que se reparten en columnas. */
.shipping {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 8rem), 1fr));
  gap: 8px;
  margin: 0;
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

.shipping legend {
  padding: 0 4px;
  font-weight: bold;
}

.option {
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
}

.option b {
  display: block;
}

.option:has(:checked) {
  border: 2px solid #0f766e;
  background: #f0fdfa;
}

.check {
  justify-self: start;
}

/* Volver a la izquierda y continuar a la derecha. */
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.actions a {
  color: #0f5c55;
}

.actions button {
  padding: 8px 16px;
  border: 0;
  border-radius: 999px;
  background: #0f766e;
  color: #ffffff;
  font-weight: bold;
  cursor: pointer;
}
```
