---
example_description: "Un formulario que reacciona a su estado: font inherit, :focus-visible, :user-invalid, :has() para mensajes y asteriscos generados con ::after"
example_tags: "css|formularios|pseudoclases|has|herencia"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<form class="signup" action="/registro" method="post">
  <fieldset>
    <legend>Crea tu cuenta</legend>

    <p class="field">
      <label for="name">Nombre</label>
      <input id="name" name="name" type="text" autocomplete="name" required>
    </p>

    <p class="field">
      <label for="email">Correo electrónico</label>
      <input id="email" name="email" type="email" autocomplete="email" placeholder="nombre@example.com"
        aria-describedby="email-error" required>
      <span class="error" id="email-error">Escribe un correo con el formato nombre@dominio.</span>
    </p>

    <p class="field">
      <label for="company">Empresa</label>
      <input id="company" name="company" type="text" autocomplete="organization">
    </p>
  </fieldset>

  <button type="submit">Registrarme</button>
</form>
<p class="note">Escribe un correo incorrecto y sal del campo. Al enviar, la vista previa muestra los datos en la consola.</p>
```

# CSS

```css
:root {
  --color-text: oklch(25% 0.03 260);
  --color-muted: oklch(45% 0.03 260);
  --color-accent: oklch(50% 0.18 260);
  --color-danger: oklch(50% 0.19 27);
  --radius: 4px;
}

body {
  font-family: system-ui, sans-serif;
  color: var(--color-text);
}

/* Los controles no heredan la fuente: se la pedimos (lección 7) */
input,
button {
  font: inherit;
}

fieldset {
  border: 1px solid oklch(85% 0.02 260);
  max-width: 28rem;
}

label {
  display: block;                       /* cada etiqueta en su línea (modelo de cajas) */
  font-weight: bold;
}

/* Asterisco decorativo para los campos obligatorios: el label seguido de un input required.
   El texto alternativo vacío evita que se lea: el atributo required ya se anuncia. */
label:has(+ input:required)::after {
  content: " *" / "";
  color: var(--color-danger);
}

input {
  border: 2px solid oklch(70% 0.02 260);
  border-radius: var(--radius);
  padding: 0.3rem 0.5rem;
}

input::placeholder {
  color: var(--color-muted);
}

/* Foco visible y coherente en todos los controles */
:is(input, button):focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

/* :user-invalid solo se activa cuando el usuario ya ha tocado el campo */
input:user-invalid {
  border-color: var(--color-danger);
}

/* El mensaje de error existe siempre en el HTML; solo se muestra cuando su campo es inválido */
.error {
  display: none;
  color: var(--color-danger);
  font-size: 0.875rem;
}

.field:has(input:user-invalid) .error {
  display: block;
}

/* El fieldset entero avisa si contiene algún campo inválido */
fieldset:has(:user-invalid) legend::after {
  content: " · revisa los campos marcados";
  color: var(--color-danger);
  font-weight: normal;
}

button {
  background: var(--color-accent);
  color: #ffffff;
  border: 0;
  border-radius: var(--radius);
  padding: 0.5rem 1rem;
  margin-top: 1rem;
}

.note {
  color: var(--color-muted);
}
```
