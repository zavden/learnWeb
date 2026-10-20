---
example_description: "autocomplete dice al navegador qué dato pide cada campo (name, email, postal-code…) para que lo rellene con un clic"
example_tags: "html|formularios|ux|autocomplete|autorrelleno"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<!-- Si tienes una dirección guardada en Chrome, haz clic en «Nombre completo» y elígela:
     todos los campos se rellenan a la vez y la consola lo muestra.
     (onchange: los eventos llegan en el capítulo de JavaScript.) -->
<form action="https://tienda.example/pedido/envio" method="post" onchange="logChange(event.target)">
  <!-- autocomplete: un token estándar por campo. El name puede ser cualquiera; el token es
       lo que entiende el navegador (y los gestores de contraseñas). -->
  <p><label for="full-name">Nombre completo</label><br><input id="full-name" name="full_name" autocomplete="name"></p>
  <p><label for="email">Correo electrónico</label><br><input id="email" name="email" type="email" autocomplete="email"></p>
  <p><label for="phone">Teléfono</label><br><input id="phone" name="phone" type="tel" autocomplete="tel"></p>
  <p><label for="line1">Dirección</label><br><input id="line1" name="address_line1" autocomplete="address-line1" size="40"></p>
  <p><label for="line2">Piso, puerta… (opcional)</label><br><input id="line2" name="address_line2" autocomplete="address-line2" size="40"></p>
  <p><label for="city">Localidad</label><br><input id="city" name="city" autocomplete="address-level2"></p>
  <p><label for="postal-code">Código postal</label><br><input id="postal-code" name="postal_code" autocomplete="postal-code" inputmode="numeric"></p>
  <button type="submit">Continuar con el pago</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* :autofill: los campos que acaba de rellenar el navegador (Chrome les pone fondo propio) */
input:autofill {
  outline: 2px solid #15803d;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Cada campo que cambia escribe una línea:
// al autorrellenar, aparecen todas de golpe.
function logChange(field) {
  console.log(`${field.name} (autocomplete="${field.autocomplete}") → ${field.value}`);
}
```
