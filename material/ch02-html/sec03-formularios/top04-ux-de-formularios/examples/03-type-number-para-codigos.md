---
example_description: "type=\"number\" en un código postal: las flechas convierten 08001 en 8002, maxlength no funciona y acepta la letra e"
example_tags: "html|formularios|ux|number|inputmode|codigo-postal|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<!-- En cada campo: haz clic y pulsa ↑ una vez. Luego intenta escribir más de 5 cifras y una «e».
     (oninput: los eventos llegan en el capítulo de JavaScript.) -->
<form action="https://tienda.example/envio" method="post" oninput="console.log(`${event.target.id}: '${event.target.value}'`)">
  <p>
    <label for="postal-bug">❌ Código postal (type="number")</label><br>
    <!-- 🐛 Un código postal no es una CANTIDAD: las flechas y la rueda del ratón lo «suben»
         (08001 → 8002, sin el cero), maxlength no se aplica a los números y la «e» se acepta
         porque 1e5 es un número válido (100000). -->
    <input id="postal-bug" name="postal_code" type="number" maxlength="5" value="08001">
  </p>
  <p>
    <label for="postal-ok">✅ Código postal (texto con teclado numérico)</label><br>
    <!-- type="text" + inputmode="numeric": teclado de cifras en el móvil, sin flechas;
         maxlength y pattern sí funcionan, y el cero inicial se conserva -->
    <input id="postal-ok" name="postal_code" inputmode="numeric" maxlength="5" pattern="[0-9]{5}" autocomplete="postal-code" value="08001">
  </p>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}
```
