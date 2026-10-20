---
example_description: "fieldset agrupa controles y legend da nombre al grupo; un fieldset disabled desactiva todo lo que contiene, que deja de enviarse"
example_tags: "html|formularios|fieldset|legend|disabled|accesibilidad"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<!-- Desmarca la casilla: la dirección de facturación se activa.
     (onchange ejecuta JavaScript al cambiar la casilla; los eventos llegan en el capítulo de JavaScript.) -->
<form action="https://tienda.example/pedido/direcciones" method="post">
  <!-- legend: el nombre del grupo. Al entrar en el primer campo, un lector de pantalla dice
       «Dirección de envío, grupo» y luego «Calle y número, campo de texto». -->
  <fieldset>
    <legend>Dirección de envío</legend>
    <p><label for="ship-street">Calle y número</label><br><input id="ship-street" name="ship_street" value="Calle del Olmo, 14, 2.º B"></p>
    <p><label for="ship-city">Localidad</label><br><input id="ship-city" name="ship_city" value="Zaragoza"></p>
  </fieldset>

  <p>
    <label>
      <input type="checkbox" name="same_address" checked onchange="document.getElementById('billing').disabled = this.checked">
      La dirección de facturación es la misma
    </label>
  </p>

  <!-- disabled en el fieldset desactiva TODOS sus controles: ni foco, ni envío -->
  <fieldset id="billing" disabled>
    <legend>Dirección de facturación</legend>
    <p><label for="bill-street">Calle y número</label><br><input id="bill-street" name="bill_street"></p>
    <p><label for="bill-city">Localidad</label><br><input id="bill-city" name="bill_city"></p>
  </fieldset>

  <button type="submit">Continuar</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* El formulario expone su estado al CSS: :disabled coincide con el fieldset desactivado
   (y con cada control de dentro). Los selectores se estudian en el capítulo de CSS. */
fieldset:disabled {
  border-style: dashed;
}
```
