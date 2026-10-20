---
example_description: "pattern, minlength y type=\"email\" no comprueban un campo vacío: sin required, un formulario lleno de restricciones se envía en blanco"
example_tags: "html|formularios|validacion|required|pattern|minlength|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<!-- Envía los dos formularios sin escribir nada. -->
<h2>❌ Restricciones sin required</h2>
<!-- 🐛 type="email", pattern y minlength solo comprueban un valor que EXISTE.
     Un campo vacío y opcional es válido, así que este formulario se envía en blanco. -->
<form action="https://huerta.example/socios/alta" method="post">
  <p><label for="email-bug">Correo</label> <input id="email-bug" name="email" type="email"></p>
  <p><label for="postal-bug">Código postal</label> <input id="postal-bug" name="postal_code" pattern="[0-9]{5}"></p>
  <p><label for="pass-bug">Contraseña</label> <input id="pass-bug" name="password" type="password" minlength="12"></p>
  <button type="submit">Darme de alta</button>
</form>

<h2>✅ Con required</h2>
<!-- required comprueba que haya valor; las demás restricciones, que ese valor sea correcto -->
<form action="https://huerta.example/socios/alta" method="post">
  <p><label for="email-ok">Correo</label> <input id="email-ok" name="email" type="email" required></p>
  <p><label for="postal-ok">Código postal</label> <input id="postal-ok" name="postal_code" pattern="[0-9]{5}" required></p>
  <p><label for="pass-ok">Contraseña</label> <input id="pass-ok" name="password" type="password" minlength="12" required></p>
  <button type="submit">Darme de alta</button>
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
