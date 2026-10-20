---
example_description: "Un button sin type dentro de un form es type=\"submit\": los botones − y + envían el formulario, y Enter en otro campo «pulsa» el primero"
example_tags: "html|formularios|button|type|submit|enter|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<!-- En cada formulario: pulsa + y luego pulsa Enter dentro del campo «Producto».
     (onclick: los eventos se estudian en el capítulo de JavaScript.) -->
<h2>❌ Botones sin type</h2>
<form action="https://huerta.example/carrito" method="post">
  <p><label for="product-bug">Producto</label> <input id="product-bug" name="product" value="Semillas de tomate cherry" size="26"></p>
  <!-- 🐛 Sin type, un button dentro de un form es type="submit": además de restar o sumar,
       ENVÍA el formulario. Y Enter en «Producto» «pulsa» el primer botón de envío: el −. -->
  <p>
    <button aria-label="Quitar uno" onclick="change(this, -1)">−</button>
    <input name="quantity" value="1" size="2" aria-label="Cantidad">
    <button aria-label="Añadir uno" onclick="change(this, 1)">+</button>
  </p>
  <button>Añadir al carrito</button>
</form>

<h2>✅ Cada botón con su type</h2>
<form action="https://huerta.example/carrito" method="post">
  <p><label for="product-ok">Producto</label> <input id="product-ok" name="product" value="Semillas de tomate cherry" size="26"></p>
  <p>
    <!-- type="button": un botón que no hace nada por sí mismo (solo lo que le programes) -->
    <button type="button" aria-label="Quitar uno" onclick="change(this, -1)">−</button>
    <input name="quantity" value="1" size="2" aria-label="Cantidad">
    <button type="button" aria-label="Añadir uno" onclick="change(this, 1)">+</button>
  </p>
  <!-- type="submit": envía. type="reset": vuelve a los valores iniciales del HTML. -->
  <button type="submit">Añadir al carrito</button>
  <button type="reset">Deshacer cambios</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

h2 {
  font-size: 1.1rem;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. button.form es el formulario del botón.
function change(button, amount) {
  const quantity = button.form.elements.quantity;
  quantity.value = Math.max(1, Number(quantity.value) + amount);
  console.log(`${button.getAttribute('aria-label')} → cantidad: ${quantity.value}`);
}
```
