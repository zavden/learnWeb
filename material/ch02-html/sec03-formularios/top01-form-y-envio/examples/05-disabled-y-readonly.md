---
example_description: "readonly impide editar un campo pero lo envía; disabled lo desactiva del todo: ni foco ni envío"
example_tags: "html|formularios|disabled|readonly|envio"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<!-- Pulsa Tab para recorrer los campos y luego envía el formulario. -->
<form action="https://tienda.example/pedidos/editar" method="post">
  <p>
    <label for="order">Número de pedido</label>
    <!-- readonly: no se puede editar, pero recibe el foco, se puede copiar y SÍ se envía -->
    <input id="order" name="order" value="A-1042" readonly>
  </p>
  <p>
    <label for="coupon">Cupón</label>
    <!-- disabled: no se puede editar, Tab se lo salta y NO se envía -->
    <input id="coupon" name="coupon" value="PRIMAVERA20" disabled>
  </p>
  <p>
    <label for="notes">Instrucciones de entrega</label>
    <input id="notes" name="notes" value="Dejar en conserjería">
  </p>
  <button type="submit">Guardar cambios</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* El navegador pinta en gris un campo disabled, pero uno readonly parece editable:
   lo marcamos con un fondo (los selectores de atributo se estudian en el capítulo de CSS) */
input[readonly] {
  background: #f1f5f9;
}
```
