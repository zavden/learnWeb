---
example_description: "output muestra un resultado calculado a partir de otros campos y se anuncia al cambiar, pero no se envía con el formulario"
example_tags: "html|formularios|output|calculo|role-status"
example_stage: minimal
example_importance: useful
console: true
---

# HTML

```html
<!-- Cambia la cantidad o marca el envío urgente: el total se actualiza. Luego envía.
     (oninput en el form se ejecuta al cambiar cualquier campo; los eventos llegan en el capítulo de JavaScript.) -->
<form action="https://huerta.example/semillas/pedido" method="post" oninput="updateTotal(this)">
  <p>
    <label for="packs">Sobres de semillas (2,50 € cada uno)</label>
    <input id="packs" name="packs" type="number" min="1" max="20" value="3">
  </p>
  <p><label><input id="express" name="shipping" type="checkbox" value="express"> Envío urgente (+4,90 €)</label></p>

  <!-- output: el RESULTADO de otros campos (for = sus ids). Tiene el rol «status», así que
       un lector de pantalla anuncia el nuevo total. NO se envía: el servidor calcula el suyo. -->
  <p>Total: <output id="total" name="total" for="packs express">7,50 €</output></p>
  <button type="submit">Pedir</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

output {
  font-weight: 700;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. form.elements da acceso a los campos por su name.
function updateTotal(form) {
  const packs = form.elements.packs.valueAsNumber || 0;
  const shipping = form.elements.shipping.checked ? 4.9 : 0;
  // toLocaleString con 'es-ES' escribe 12,40 € (coma decimal y el símbolo detrás)
  form.elements.total.value = (packs * 2.5 + shipping).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}
```
