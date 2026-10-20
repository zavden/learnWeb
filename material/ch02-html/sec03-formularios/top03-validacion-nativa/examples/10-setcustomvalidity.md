---
example_description: "setCustomValidity añade una regla propia (las dos contraseñas coinciden) con su mensaje; checkValidity comprueba en silencio y reportValidity muestra el aviso"
example_tags: "html|formularios|validacion|setcustomvalidity|reportvalidity|checkvalidity|javascript"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<!-- Las contraseñas ya escritas no coinciden (a la segunda le falta la última e).
     Pulsa «Comprobar sin enviar», corrige la segunda y vuelve a pulsar; luego envía.
     (oninput y onclick: los eventos llegan en el capítulo de JavaScript.) -->
<form action="https://huerta.example/cuenta/contrasena" method="post" oninput="checkMatch(this)">
  <p>
    <label for="new-password">Contraseña nueva</label><br>
    <input id="new-password" name="new_password" type="password" minlength="12" required value="tomates-en-octubre">
  </p>
  <p>
    <label for="confirmation">Repite la contraseña</label><br>
    <input id="confirmation" name="confirmation" type="password" required value="tomates-en-octubr">
  </p>
  <button type="submit">Cambiar contraseña</button>
  <button type="button" onclick="console.log('checkValidity →', this.form.checkValidity()); this.form.reportValidity()">Comprobar sin enviar</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo.
// HTML no tiene un atributo para «igual que el otro campo»: la regla se añade con
// setCustomValidity. Un texto no vacío deja el campo inválido con ESE mensaje (customError);
// el texto vacío '' lo vuelve a dar por bueno. Si olvidas ponerlo, se queda inválido para siempre.
function checkMatch(form) {
  const password = form.elements.new_password;
  const confirmation = form.elements.confirmation;
  confirmation.setCustomValidity(confirmation.value === password.value ? '' : 'Las contraseñas no coinciden.');
}

// Comprobamos también al cargar: los valores iniciales no disparan oninput
checkMatch(document.forms[0]);
```
