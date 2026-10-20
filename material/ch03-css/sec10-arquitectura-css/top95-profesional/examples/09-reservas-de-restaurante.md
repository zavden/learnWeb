---
example_description: "El formulario de reservas de una fonda: el reset de formularios (font: inherit), accent-color y color-scheme en la base, opciones de radio con aspecto de tarjeta (:has(:checked)), errores que solo aparecen tras escribir (:user-invalid) con su mensaje enlazado, campos en dos columnas cuando el formulario mide 30rem, tokens con light-dark() y el tema anunciado en la página"
example_tags: "css|profesional|arquitectura|formularios|user-invalid|has|accent-color|light-dark|container-queries|layer"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="booking">
  <header class="booking__header">
    <h1>Reserva en Fonda La Ceiba</h1>
    <p class="booking__theme">Tema activo: <span class="is-light-label">claro</span><span class="is-dark-label">oscuro</span></p>
  </header>

  <form class="form" action="/reservas" method="post">
    <fieldset class="options">
      <legend>¿Cuántas personas?</legend>
      <label class="option"><input type="radio" name="people" value="2" checked> <span class="option__title">1 o 2</span></label>
      <label class="option"><input type="radio" name="people" value="4"> <span class="option__title">3 o 4</span></label>
      <label class="option"><input type="radio" name="people" value="6"> <span class="option__title">5 o 6</span></label>
    </fieldset>

    <div class="form__row">
      <div class="field">
        <label for="date">Fecha</label>
        <input id="date" name="date" type="date" min="2026-10-15" value="2026-10-24" required>
      </div>
      <div class="field">
        <label for="time">Hora</label>
        <select id="time" name="time">
          <option>13:30</option>
          <option selected>14:00</option>
          <option>14:30</option>
          <option>15:00</option>
        </select>
      </div>
    </div>

    <fieldset class="options">
      <legend>Zona</legend>
      <label class="option"><input type="radio" name="zone" value="terraza" checked> <span class="option__title">Terraza</span> <span class="option__text">Bajo la ceiba, con sombra a mediodía</span></label>
      <label class="option"><input type="radio" name="zone" value="salon"> <span class="option__title">Salón</span> <span class="option__text">Junto al comal, sin escalones</span></label>
    </fieldset>

    <div class="field">
      <label for="name">Nombre</label>
      <input id="name" name="name" autocomplete="name" required>
    </div>
    <div class="field">
      <label for="phone">Teléfono</label>
      <input id="phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" minlength="10" required aria-describedby="phone-error">
      <p class="field__error" id="phone-error">Escribe tu número a 10 dígitos, por ejemplo 951 123 4567.</p>
    </div>

    <label class="check"><input type="checkbox" name="celebration"> Es una celebración (preparamos un postre con vela)</label>

    <button class="button" type="submit">Confirmar reserva</button>
  </form>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Reservas
   - Reset de formularios: font: inherit en los controles (sin él usan la
     letra del sistema a 13px). Base: color-scheme y accent-color, que
     tiñen casillas, radios y el calendario de la fecha.
   - Opciones: la casilla real queda dentro de una etiqueta con aspecto de
     tarjeta; :has(:checked) marca la elegida y :has(:focus-visible) dibuja
     el foco. Se usan igual con teclado (flechas) y lector de pantalla.
   - Errores: :user-invalid solo se cumple DESPUÉS de que la persona
     interactúe (al salir del campo o al enviar), no al cargar. El mensaje
     está enlazado con aria-describedby y aparece con :has().
   - El formulario es un contenedor: con 30rem, fecha y hora en una fila.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  :where(dialog, [popover]) { margin: auto; }
  body { min-height: 100dvh; line-height: 1.5; }
  input, button, select, textarea { font: inherit; }
  h1 { text-wrap: balance; }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}

@layer tokens {
  :root {
    color-scheme: light dark;
    --color-page: light-dark(#fafaf9, #0c0a09);
    --color-surface: light-dark(#ffffff, #1c1917);
    --color-text: light-dark(#1c1917, #f5f5f4);
    --color-muted: light-dark(#57534e, #a8a29e);
    --color-control: light-dark(#78716c, #a8a29e);
    --color-accent: light-dark(#0f766e, #5eead4);
    --color-accent-soft: light-dark(#f0fdfa, #042f2e);
    --color-on-accent: light-dark(#ffffff, #042f2e);
    --color-danger: light-dark(#b91c1c, #fca5a5);
    --radius-8: 8px;
    --radius-12: 12px;
  }
}

@layer base {
  body {
    font-family: system-ui, sans-serif;
    color: var(--color-text);
    background: var(--color-page);
    accent-color: var(--color-accent);
  }

  :focus-visible {
    outline: 3px solid var(--color-accent);
    outline-offset: 2px;
  }
}

@layer components {
  .booking {
    display: grid;
    gap: 16px;
    max-width: 34rem;
    padding: 16px;
  }

  .booking__header h1 { font-size: 1.4rem; line-height: 1.2; }
  .booking__theme { color: var(--color-muted); font-size: 0.8rem; }

  .is-dark-label { display: none; }

  @media (prefers-color-scheme: dark) {
    .is-light-label { display: none; }
    .is-dark-label { display: inline; }
  }

  .form {
    container-type: inline-size;
    display: grid;
    gap: 16px;
  }

  .form__row {
    display: grid;
    gap: 16px;

    @container (width >= 30rem) { grid-template-columns: 1fr 1fr; }
  }

  .field {
    display: grid;
    gap: 4px;

    label { font-weight: 600; }

    input,
    select {
      padding: 8px 10px;
      border: 1px solid var(--color-control);
      border-radius: var(--radius-8);
      background: var(--color-surface);
      color: var(--color-text);
    }

    /* Solo después de interactuar: al cargar, ningún campo está «mal». */
    input:user-invalid {
      border: 2px solid var(--color-danger);
    }
  }

  .field__error {
    display: none;
    color: var(--color-danger);
    font-size: 0.85rem;
  }

  .field:has(input:user-invalid) .field__error { display: block; }

  .options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
    gap: 8px;
    padding: 0;
    border: 0;

    legend { margin-bottom: 6px; font-weight: 600; }
  }

  .option {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 2px 8px;
    align-items: baseline;
    padding: 10px 12px;
    border: 1px solid var(--color-control);
    border-radius: var(--radius-12);
    background: var(--color-surface);
    cursor: pointer;

    input { margin: 0; }

    &:has(:checked) {
      border: 2px solid var(--color-accent);
      background: var(--color-accent-soft);
    }

    /* El foco lo dibuja la tarjeta entera. */
    &:has(:focus-visible) {
      outline: 3px solid var(--color-accent);
      outline-offset: 2px;

      input { outline: none; }
    }
  }

  .option__title { font-weight: 700; }
  .option__text { grid-column: 2; color: var(--color-muted); font-size: 0.85rem; }

  .check { display: flex; gap: 8px; align-items: baseline; }

  .button {
    justify-self: start;
    padding: 10px 20px;
    border: 0;
    border-radius: 999px;
    background: var(--color-accent);
    color: var(--color-on-accent);
    font-weight: 700;
    cursor: pointer;
  }
}
```
