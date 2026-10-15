---
example_description: "La piel de un formulario: campos, select con flecha SVG generada por una función de Sass, casillas y radios con accent-color, un interruptor accesible, estados :user-invalid con su mensaje y un anillo de foco común"
example_tags: "sass|profesional|formularios|controles|mixins|sass-string|user-invalid|accesibilidad"
example_stage: professional
example_importance: critical
---

# HTML

```html
<main class="page">
  <form class="form" action="/checkout/envio" method="post">
    <h1>Datos de envío</h1>
    <p class="form__intro">Los campos con <span aria-hidden="true">*</span><span class="visually-hidden">asterisco</span> son obligatorios.</p>

    <div class="form__row">
      <div class="field">
        <label class="field__label" for="name">Nombre completo *</label>
        <input class="field__control" id="name" name="name" autocomplete="name" required>
        <p class="field__error" id="name-error">Escribe tu nombre para la etiqueta del paquete.</p>
      </div>
      <div class="field">
        <label class="field__label" for="email">Correo electrónico *</label>
        <input class="field__control" id="email" name="email" type="email" autocomplete="email" required aria-describedby="email-hint">
        <p class="field__hint" id="email-hint">Te enviaremos el número de seguimiento.</p>
        <p class="field__error">Revisa el correo: falta la @ o el dominio.</p>
      </div>
    </div>

    <div class="field">
      <label class="field__label" for="street">Calle y número *</label>
      <textarea class="field__control" id="street" name="street" rows="2" autocomplete="street-address" required></textarea>
      <p class="field__error">Necesitamos la dirección para entregar el pedido.</p>
    </div>

    <div class="form__row">
      <div class="field">
        <label class="field__label" for="zip">Código postal *</label>
        <input class="field__control" id="zip" name="zip" inputmode="numeric" pattern="[0-9]{5}" autocomplete="postal-code" required aria-describedby="zip-hint">
        <p class="field__hint" id="zip-hint">5 dígitos, por ejemplo 04100.</p>
        <p class="field__error">El código postal tiene 5 dígitos.</p>
      </div>
      <div class="field">
        <label class="field__label" for="state">Estado</label>
        <select class="field__control" id="state" name="state" autocomplete="address-level1">
          <option>Ciudad de México</option>
          <option>Estado de México</option>
          <option>Jalisco</option>
          <option>Nuevo León</option>
          <option>Puebla</option>
        </select>
      </div>
    </div>

    <fieldset class="choice-group">
      <legend class="field__label">Método de envío</legend>
      <label class="choice"><input type="radio" name="shipping" value="standard" checked> Estándar · 3 a 5 días · gratis</label>
      <label class="choice"><input type="radio" name="shipping" value="express"> Exprés · mañana · 99 MXN</label>
    </fieldset>

    <label class="choice"><input type="checkbox" name="save" checked> Guardar esta dirección para la próxima vez</label>

    <label class="switch">
      <input class="switch__input" type="checkbox" role="switch" name="sms">
      <span>Avisarme por SMS cuando salga el pedido</span>
    </label>

    <button class="form__submit" type="submit">Continuar al pago</button>
  </form>
</main>
```

# SCSS

```scss
// ─────────────────────────────────────────────────────────────────────────────
// Controles de formulario
// - Un mixin focus-ring para TODOS los controles: el mismo anillo en campos,
//   casillas, interruptor y botón.
// - Campos, select y textarea comparten una sola regla (lista de selectores),
//   no un @extend: no hay selectores inesperados y no crece con cada control.
// - La flecha del select es un SVG en una data URI que construye una función
//   de Sass con el color que se le pase: string.slice quita el «#» y lo
//   sustituye por %23, como exige una URL.
// - Errores: :user-invalid (solo tras interactuar, no al cargar) y el mensaje
//   aparece con :has(). El borde no es la única señal: hay texto.
// - Casillas y radios nativos con accent-color (accesibles por defecto); el
//   interruptor es una casilla con role="switch" y appearance: none.
// ─────────────────────────────────────────────────────────────────────────────
@use "sass:map";
@use "sass:string";

// ── Configuración ────────────────────────────────────────────────────────────
$form-colors: (
  text: #1e293b,
  muted: #475569,
  border: #64748b,     // 4,8:1 sobre blanco: el borde de un control necesita 3:1
  accent: #1d4ed8,
  accent-hover: #1e3a8a,
  error: #b91c1c,
  surface: #ffffff,
  page: #f8fafc,
) !default;

$control-height: 2.75rem !default;
$control-radius: 8px !default;

@function c($name) {
  @if not map.has-key($form-colors, $name) {
    @error "c(): no existe el color «#{$name}». Opciones: #{map.keys($form-colors)}.";
  }
  @return map.get($form-colors, $name);
}

// Flecha hacia abajo como data URI. «#475569» → «%23475569».
@function chevron($color) {
  $hex: string.slice("#{$color}", 2);
  @return url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 6l4 4 4-4' fill='none' stroke='%23#{$hex}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

// Un anillo opaco: un indicador de foco necesita 3:1 con el fondo, y un color
// semitransparente sobre blanco no llega.
@mixin focus-ring($color: c(accent)) {
  outline: 3px solid $color;
  outline-offset: 2px;
}

@mixin motion-safe {
  @media (prefers-reduced-motion: no-preference) {
    @content;
  }
}

// ── Base ─────────────────────────────────────────────────────────────────────
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: c(page);
  color: c(text);
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.page {
  padding: 2rem 1rem;
}

// ── Formulario ───────────────────────────────────────────────────────────────
.form {
  display: grid;
  gap: 1.25rem;
  max-width: 40rem;
  margin-inline: auto;
  padding: 2rem;
  border-radius: 12px;
  background: c(surface);
  box-shadow: 0 1px 3px rgb(15 23 42 / 0.12);

  h1 {
    margin: 0;
    font-size: 1.5rem;
  }

  &__intro {
    margin: 0;
    color: c(muted);
  }

  &__row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
    gap: 1.25rem;
  }

  &__submit {
    justify-self: start;
    min-height: $control-height;
    padding-inline: 1.5rem;
    border: 0;
    border-radius: $control-radius;
    background: c(accent);
    color: #ffffff;
    font: inherit;
    font-weight: 600;
    cursor: pointer;

    &:hover {
      background: c(accent-hover);
    }

    &:focus-visible {
      @include focus-ring;
    }
  }
}

// ── Campos ───────────────────────────────────────────────────────────────────
.field {
  display: grid;
  gap: 0.375rem;
  align-content: start;

  &__label {
    font-weight: 600;
  }

  &__control {
    width: 100%;
    min-height: $control-height;
    padding: 0.5rem 0.75rem;
    border: 1px solid c(border);
    border-radius: $control-radius;
    background: c(surface);
    color: inherit;
    font: inherit;

    &:hover {
      border-color: c(muted);
    }

    &:focus-visible {
      @include focus-ring;
      border-color: c(accent);
    }

    &:user-invalid {
      border-color: c(error);
      border-width: 2px;
    }
  }

  // @at-root (lección 3) evita que Sass anteponga .field: con #{&} el selector
  // sería «.field textarea.field__control», más específico de lo necesario.
  @at-root textarea#{&}__control {
    resize: vertical;
  }

  @at-root select#{&}__control {
    appearance: none;
    padding-inline-end: 2.5rem;
    background: c(surface) chevron(c(muted)) no-repeat right 0.75rem center / 1rem;
  }

  &__hint,
  &__error {
    margin: 0;
    font-size: 0.875rem;
  }

  &__hint {
    color: c(muted);
  }

  &__error {
    display: none;
    color: c(error);
    font-weight: 600;
  }

  &:has(:user-invalid) &__error {
    display: block;
  }
}

// ── Casillas, radios e interruptor ───────────────────────────────────────────
.choice-group {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  border: 0;
}

.choice {
  display: flex;
  gap: 0.625rem;
  align-items: center;

  input {
    width: 1.25rem;
    height: 1.25rem;
    margin: 0;
    accent-color: c(accent);

    &:focus-visible {
      @include focus-ring;
    }
  }
}

.switch {
  display: flex;
  gap: 0.75rem;
  align-items: center;

  &__input {
    appearance: none;
    position: relative;
    flex: none;
    width: 2.75rem;
    height: 1.5rem;
    margin: 0;
    border: 2px solid c(muted);
    border-radius: 999px;
    background: c(surface);
    cursor: pointer;

    &::before {
      content: "";
      position: absolute;
      inset: 2px auto 2px 2px;
      aspect-ratio: 1;
      border-radius: 50%;
      background: c(muted);

      @include motion-safe {
        transition: translate 150ms ease-out;
      }
    }

    &:checked {
      border-color: c(accent);
      background: c(accent);

      &::before {
        background: #ffffff;
        translate: 1.25rem 0;
      }
    }

    &:focus-visible {
      @include focus-ring;
    }
  }
}
```
