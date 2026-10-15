---
example_description: "aria-describedby añade una descripción (una pista o un error) que se lee después del nombre, y aria-invalid marca el campo como erróneo"
example_tags: "html|accesibilidad|aria-describedby|aria-invalid|formularios"
example_stage: minimal
example_importance: important
---

# HTML

```html
<form>
  <p>
    <label for="password">Contraseña</label><br>
    <!-- El lector anuncia: «Contraseña, campo de texto protegido, Mínimo 12 caracteres…» -->
    <input id="password" type="password" aria-describedby="password-hint">
    <br><small id="password-hint">Mínimo 12 caracteres. Puedes usar una frase.</small>
  </p>

  <p>
    <label for="email">Correo</label><br>
    <!-- Con error: aria-invalid + la descripción apunta al mensaje (puede apuntar a varios ids). -->
    <input id="email" type="email" value="ana@" aria-invalid="true" aria-describedby="email-error email-hint">
    <br><small id="email-hint">Te enviaremos la confirmación aquí.</small>
    <br><small id="email-error" class="error">Falta el dominio: por ejemplo, ana@ejemplo.es</small>
  </p>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

input {
  padding: 6px;
  width: 260px;
}

/* El estado de error también se ve: nunca lo comuniques solo con color. */
input[aria-invalid="true"] {
  border: 2px solid #b91c1c;
}

.error {
  color: #b91c1c;
}

.error::before {
  content: "⚠ ";
}
```
