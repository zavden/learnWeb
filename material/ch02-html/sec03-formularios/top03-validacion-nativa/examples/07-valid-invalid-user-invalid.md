---
example_description: ":invalid marca en rojo un formulario que nadie ha tocado todavía; :user-invalid y :user-valid esperan a que el usuario interactúe o intente enviar"
example_tags: "html|formularios|validacion|css|invalid|user-invalid|pseudoclases"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<!-- Los dos formularios son iguales; solo cambia el CSS. Escribe en un campo, sal de él
     con Tab y después intenta enviar. -->
<h2>❌ Con :invalid</h2>
<form class="eager" action="https://huerta.example/boletin" method="post">
  <p><label for="email-eager">Correo</label><br><input id="email-eager" name="email" type="email" required></p>
  <p><label for="postal-eager">Código postal (5 cifras)</label><br><input id="postal-eager" name="postal_code" pattern="[0-9]{5}" required></p>
  <button type="submit">Suscribirme</button>
</form>

<h2>✅ Con :user-invalid</h2>
<form class="polite" action="https://huerta.example/boletin" method="post">
  <p><label for="email-polite">Correo</label><br><input id="email-polite" name="email" type="email" required></p>
  <p><label for="postal-polite">Código postal (5 cifras)</label><br><input id="postal-polite" name="postal_code" pattern="[0-9]{5}" required></p>
  <button type="submit">Suscribirme</button>
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

input {
  padding: 4px;
  border: 2px solid #64748b;
}

/* El formulario expone su estado al CSS (los selectores se estudian en el capítulo de CSS).
   ❌ :invalid se cumple desde el primer momento: un campo obligatorio vacío ya es inválido,
   así que el formulario aparece lleno de errores antes de que el usuario haga nada. */
.eager input:invalid {
  border-color: #b91c1c;
}

/* ✅ :user-invalid solo se cumple cuando el usuario ya cambió el campo y salió de él, o
   cuando intentó enviar el formulario. :user-valid, igual pero para los válidos. */
.polite input:user-invalid {
  border-color: #b91c1c;
}

.polite input:user-valid {
  border-color: #15803d;
}

/* Un color nunca basta para comunicar un error: en la lección de experiencia de usuario
   añadirás un mensaje de texto a cada campo. */
```
