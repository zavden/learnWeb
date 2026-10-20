---
example_description: "Decir antes de escribir qué hace falta: qué es opcional, qué formato se espera y qué requisitos tiene la contraseña, unido a cada campo con aria-describedby"
example_tags: "html|formularios|ux|required|aria-describedby|pistas"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<form action="https://huerta.example/parcelas/solicitud" method="post">
  <!-- Si casi todo es obligatorio, se dice una vez y se marca lo OPCIONAL -->
  <p>Todos los campos son obligatorios salvo los marcados como opcionales.</p>

  <p>
    <label for="full-name">Nombre y apellidos</label><br>
    <input id="full-name" name="full_name" autocomplete="name" required>
  </p>
  <p>
    <label for="phone">Teléfono (opcional)</label><br>
    <!-- aria-describedby: el lector de pantalla lee la pista después del nombre del campo -->
    <input id="phone" name="phone" type="tel" autocomplete="tel" aria-describedby="phone-hint">
    <small id="phone-hint">Solo te llamaremos si queda libre una parcela.</small>
  </p>
  <p>
    <label for="password">Contraseña para tu cuenta</label><br>
    <!-- Los requisitos, visibles ANTES de escribir; no los descubras con un error -->
    <input id="password" name="password" type="password" autocomplete="new-password" minlength="12" required aria-describedby="password-hint">
    <small id="password-hint">Al menos 12 caracteres. Una frase de varias palabras es fácil de recordar y difícil de adivinar.</small>
  </p>
  <button type="submit">Enviar solicitud</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* display: block pone cada pista en su propia línea (display: capítulo de CSS) */
small {
  display: block;
  max-width: 32rem;
  color: #475569;
}
```
