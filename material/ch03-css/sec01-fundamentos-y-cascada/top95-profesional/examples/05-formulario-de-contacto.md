---
example_description: "Formulario de contacto accesible y de calidad de producción: estados con :user-invalid, :has() y :focus-visible, asteriscos generados y mensajes de error sin JavaScript"
example_tags: "css|profesional|formularios|accesibilidad|has"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<main class="page">
  <h1>Contacta con nosotros</h1>
  <p class="lead">Respondemos en un plazo de dos días laborables. Los campos marcados con <span aria-hidden="true">*</span> son obligatorios.</p>

  <form class="form" action="/contacto" method="post">
    <fieldset>
      <legend>Tus datos</legend>

      <div class="field">
        <label for="name">Nombre y apellidos</label>
        <input id="name" name="name" type="text" autocomplete="name" required>
      </div>

      <div class="field">
        <label for="email">Correo electrónico</label>
        <input id="email" name="email" type="email" autocomplete="email" required
          aria-describedby="email-hint email-error">
        <p class="hint" id="email-hint">Solo lo usaremos para responderte.</p>
        <p class="error" id="email-error">Escribe un correo válido, por ejemplo ana@example.com.</p>
      </div>

      <div class="field">
        <label for="phone">Teléfono <span class="optional">(opcional)</span></label>
        <input id="phone" name="phone" type="tel" autocomplete="tel">
      </div>
    </fieldset>

    <fieldset>
      <legend>Tu consulta</legend>

      <div class="field">
        <label for="topic">Tema</label>
        <select id="topic" name="topic" required>
          <option value="">Elige un tema</option>
          <optgroup label="Clientes">
            <option>Facturación</option>
            <option>Incidencia técnica</option>
          </optgroup>
          <optgroup label="Otros">
            <option>Prensa</option>
            <option>Trabaja con nosotros</option>
          </optgroup>
        </select>
      </div>

      <fieldset class="choices">
        <legend>¿Cómo prefieres que te respondamos?</legend>
        <label><input type="radio" name="reply" value="email" checked> Por correo</label>
        <label><input type="radio" name="reply" value="phone"> Por teléfono</label>
      </fieldset>

      <div class="field">
        <label for="message">Mensaje</label>
        <textarea id="message" name="message" rows="5" minlength="20" required
          aria-describedby="message-hint"></textarea>
        <p class="hint" id="message-hint">Cuéntanos tu caso en al menos 20 caracteres.</p>
      </div>
    </fieldset>

    <div class="field consent">
      <label><input type="checkbox" name="privacy" required> He leído y acepto la <a href="#">política de privacidad</a></label>
    </div>

    <button type="submit">Enviar consulta</button>
  </form>

  <p class="note">Prueba a dejar campos vacíos o a escribir un correo incorrecto y sal del campo. Al enviar, la vista previa muestra en la consola los datos del formulario.</p>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Formulario de contacto
   - Estados solo con pseudoclases: :user-invalid (tras tocar el campo),
     :focus-visible y :has() para que el contenedor reaccione a su control.
   - Los asteriscos de obligatorio los genera el CSS a partir de required:
     el HTML no puede quedar desincronizado.
   Nota: las propiedades de caja (width, padding, border…) se usan de forma
   básica; se estudian en el módulo del modelo de cajas.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;            /* width: 100% incluye padding y borde */
  }

  input,
  select,
  textarea,
  button {
    font: inherit;                     /* los controles no heredan la fuente por sí solos */
  }
}

@layer tokens {
  :root {
    --color-bg: oklch(98.5% 0.005 260);
    --color-surface: oklch(96% 0.01 260);
    --color-border: oklch(60% 0.03 260);   /* 3,9:1 sobre blanco: los bordes de un control deben llegar a 3:1 */
    --color-text: oklch(25% 0.03 260);
    --color-text-muted: oklch(45% 0.03 260);
    --color-brand: oklch(50% 0.18 260);
    --color-brand-strong: oklch(42% 0.18 260);
    --color-danger: oklch(50% 0.19 27);
    --radius: 0.375rem;
    --space: 1rem;
  }
}

@layer base {
  body {
    margin: 0;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
  }

  :where(a) {
    color: var(--color-brand);
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-brand);
    outline-offset: 2px;
  }
}

@layer components {
  .page {
    max-width: 36rem;
    margin-inline: auto;
    padding: var(--space);
  }

  .lead,
  .note {
    color: var(--color-text-muted);
  }

  .form fieldset {
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: var(--space);
    margin: 0 0 var(--space);
  }

  .form legend {
    font-weight: 700;
    padding-inline: 0.25rem;
  }

  .field {
    margin-bottom: var(--space);
  }

  .field > label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  /* Asterisco decorativo en el label de cualquier campo que contenga un control required.
     Texto alternativo vacío: el atributo required ya se anuncia por sí mismo. */
  .field:has(:required) > label::after {
    content: " *" / "";
    color: var(--color-danger);
  }

  .optional {
    font-weight: 400;
    color: var(--color-text-muted);
  }

  .field :where(input:not([type="checkbox"], [type="radio"]), select, textarea) {
    width: 100%;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 0.5rem 0.65rem;
    background: #ffffff;
    color: var(--color-text);
  }

  .field textarea {
    resize: vertical;                  /* que solo pueda crecer hacia abajo */
  }

  .hint {
    margin: 0.25rem 0 0;
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  /* El mensaje de error está en el HTML desde el principio; solo se muestra cuando toca */
  .error {
    display: none;
    margin: 0.25rem 0 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-danger);
  }

  /* :user-invalid: solo después de que el usuario haya interactuado con el campo */
  .field :user-invalid {
    border-color: var(--color-danger);
    border-width: 2px;
  }

  .field:has(:user-invalid) > label {
    color: var(--color-danger);
  }

  .field:has(:user-invalid) .error {
    display: block;
  }

  /* Radios en línea: cada label, con un poco de aire */
  .choices {
    border: 0;
    padding: 0;
    margin: 0 0 var(--space);
  }

  .choices label {
    margin-inline-end: 1.5rem;
  }

  .consent label {
    font-weight: 400;
  }

  .form button {
    background: var(--color-brand);
    color: #ffffff;
    border: 0;
    border-radius: var(--radius);
    padding: 0.65rem 1.4rem;
    font-weight: 600;
  }

  .form button:hover {
    background: var(--color-brand-strong);
  }

  /* :active después de :hover: misma especificidad, gana el último (lección 3) */
  .form button:active {
    background: color-mix(in oklch, var(--color-brand-strong) 80%, black);
  }
}
```
