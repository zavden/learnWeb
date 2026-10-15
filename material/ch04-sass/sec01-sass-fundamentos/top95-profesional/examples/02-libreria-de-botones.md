---
example_description: "Una librería de botones configurable: intenciones y tamaños en mapas !default, tres apariencias (sólido, contorno, fantasma), botón de icono, grupo, estado de carga con aria-busy y desactivado; colores derivados con contraste comprobado"
example_tags: "sass|profesional|botones|componentes|mapas|default|sass-color|accesibilidad"
example_stage: professional
example_importance: critical
---

# HTML

```html
<main class="page">
  <header class="page__header">
    <h1>Pedido #20417</h1>
    <p class="page__meta">Recibido el 12 de octubre · 3 artículos · 1 245 MXN</p>
  </header>

  <section class="block" aria-labelledby="actions-title">
    <h2 id="actions-title">Acciones</h2>
    <div class="row">
      <button type="button" class="button button--primary">Marcar como enviado</button>
      <button type="button" class="button button--outline">Imprimir etiqueta</button>
      <button type="button" class="button button--danger button--ghost">Cancelar pedido</button>
    </div>
  </section>

  <section class="block" aria-labelledby="sizes-title">
    <h2 id="sizes-title">Tamaños y estados</h2>
    <div class="row">
      <button type="button" class="button button--success button--sm">Aprobar devolución</button>
      <button type="button" class="button button--success">Aprobar devolución</button>
      <button type="button" class="button button--success button--lg">Aprobar devolución</button>
    </div>
    <div class="row">
      <button type="button" class="button button--primary" aria-busy="true">Guardando cambios</button>
      <button type="button" class="button button--primary" disabled>Sin cambios que guardar</button>
    </div>
  </section>

  <section class="block" aria-labelledby="tools-title">
    <h2 id="tools-title">Barra de herramientas</h2>
    <div class="row">
      <div class="button-group" role="group" aria-label="Vista de la lista">
        <button type="button" class="button button--outline" aria-pressed="true">Lista</button>
        <button type="button" class="button button--outline" aria-pressed="false">Tarjetas</button>
        <button type="button" class="button button--outline" aria-pressed="false">Mapa</button>
      </div>
      <button type="button" class="button button--ghost button--icon" aria-label="Editar pedido">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
      </button>
      <button type="button" class="button button--danger button--ghost button--icon" aria-label="Eliminar pedido">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
      </button>
    </div>
  </section>

  <a class="button button--primary button--block" href="/pedidos">Volver a todos los pedidos</a>
</main>
```

# SCSS

```scss
// ─────────────────────────────────────────────────────────────────────────────
// Librería de botones
// - Configuración con !default: quien la use puede cambiarla con
//   @use "buttons" with ($button-intents: (…)).
// - Ejes independientes, cada uno con sus propias clases:
//     intención  (--primary, --success, --danger; neutral por defecto) → colores
//     apariencia (sólido por defecto, --outline, --ghost)    → CÓMO se usan
//     tamaño     (--sm, md por defecto, --lg)                 → medidas
//   Así 4 intenciones × 3 apariencias × 3 tamaños = 36 combinaciones salen de
//   7 modificadores en el CSS, en vez de 36 reglas. Los valores por defecto
//   (neutral, sólido, md) están en la propia .button.
// - Cada eje solo fija custom properties; la regla .button las usa una vez.
// - Colores derivados al compilar con sass:color y redondeados (tidy); el texto
//   sobre el color lo elige text-on() según la luminosidad.
// - Estados accesibles: :focus-visible, aria-pressed, aria-busy (carga, con el
//   texto todavía disponible para lectores de pantalla) y disabled.
// ─────────────────────────────────────────────────────────────────────────────
@use "sass:color";
@use "sass:map";
@use "sass:math";

// ── Configuración ────────────────────────────────────────────────────────────
$button-intents: (
  primary: #1d4ed8,
  success: #15803d,
  danger: #b91c1c,
  neutral: #475569,
) !default;

$button-sizes: (
  sm: (height: 2rem, padding: 0.75rem, font-size: 0.875rem, gap: 0.375rem),
  md: (height: 2.5rem, padding: 1rem, font-size: 0.9375rem, gap: 0.5rem),
  lg: (height: 3rem, padding: 1.25rem, font-size: 1.0625rem, gap: 0.625rem),
) !default;

$button-default-size: md !default;
$button-default-intent: neutral !default;
$button-radius: 8px !default;

// ── Funciones ────────────────────────────────────────────────────────────────
@function tidy($color) {
  @return rgb(
    math.round(color.channel($color, "red", $space: rgb)),
    math.round(color.channel($color, "green", $space: rgb)),
    math.round(color.channel($color, "blue", $space: rgb))
  );
}

@function text-on($background) {
  @if color.channel($background, "lightness", $space: oklch) > 65% {
    @return #1e293b;
  }
  @return #ffffff;
}

// Los colores de una intención, derivados al compilar.
@mixin button-intent($color) {
  --button-color: #{$color};
  --button-hover: #{tidy(color.scale($color, $lightness: -15%))};
  --button-active: #{tidy(color.scale($color, $lightness: -25%))};
  --button-on: #{text-on($color)};
  --button-ring: #{tidy(color.scale($color, $lightness: -30%))};
  --button-ink: #{tidy(color.scale($color, $lightness: -20%))};
  --button-tint: #{tidy(color.scale($color, $lightness: 90%))};
}

@mixin button-size($name) {
  @if not map.has-key($button-sizes, $name) {
    @error "button-size(): no existe «#{$name}». Opciones: #{map.keys($button-sizes)}.";
  }
  @each $property, $value in map.get($button-sizes, $name) {
    --button-#{$property}: #{$value};
  }
}

// ── Base ─────────────────────────────────────────────────────────────────────
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1e293b;
  line-height: 1.5;
}

.page {
  display: grid;
  gap: 1.5rem;
  max-width: 44rem;
  margin-inline: auto;
  padding: 2rem 1.5rem;

  &__header h1 {
    margin: 0;
    font-size: 1.75rem;
  }

  &__meta {
    margin: 0;
    color: #475569;
  }
}

.block h2 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;

  & + & {
    margin-top: 0.75rem;
  }
}

// ── El componente ────────────────────────────────────────────────────────────
.button {
  // Los valores por defecto (tamaño md, intención neutral) van en la base:
  // un botón sin modificadores ya está completo.
  @include button-size($button-default-size);
  @include button-intent(map.get($button-intents, $button-default-intent));

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--button-gap);
  min-height: var(--button-height);
  padding-inline: var(--button-padding);
  border: 2px solid var(--button-color);
  border-radius: $button-radius;
  background: var(--button-color);
  color: var(--button-on);
  font: inherit;
  font-size: var(--button-font-size);
  font-weight: 600;
  line-height: 1.2;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    --button-color: var(--button-hover);
  }

  &:active {
    --button-color: var(--button-active);
  }

  &:focus-visible {
    outline: 3px solid var(--button-ring);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  // Carga: el texto se vuelve transparente (sigue ahí para el lector de
  // pantalla) y un ::after dibuja el indicador en su lugar.
  &[aria-busy="true"] {
    color: transparent;
    cursor: progress;

    &::after {
      content: "";
      position: absolute;
      width: 1.1em;
      height: 1.1em;
      border: 2px solid var(--button-on);
      border-right-color: transparent;
      border-radius: 50%;
      animation: button-spin 0.8s linear infinite;

      @media (prefers-reduced-motion: reduce) {
        animation-duration: 2.4s;   // más lento: indica actividad sin marear
      }
    }
  }

  // ── Apariencias ────────────────────────────────────────────────────────────
  &--outline,
  &--ghost {
    background: transparent;
    color: var(--button-ink);

    &:hover {
      background: var(--button-tint);
    }
  }

  &--ghost {
    border-color: transparent;
  }

  &[aria-pressed="true"] {
    background: var(--button-tint);
    box-shadow: inset 0 0 0 1px var(--button-color);
  }

  // ── Tamaños y formas ───────────────────────────────────────────────────────
  @each $name, $_ in $button-sizes {
    @if $name != $button-default-size {
      &--#{$name} {
        @include button-size($name);
      }
    }
  }

  &--icon {
    width: var(--button-height);
    padding-inline: 0;
  }

  &--block {
    width: 100%;
  }
}

// ── Intenciones: solo datos (7 custom properties por intención) ──────────────
@each $name, $color in $button-intents {
  @if $name != $button-default-intent {
    .button--#{$name} {
      @include button-intent($color);
    }
  }
}

// Botones unidos: se solapan los bordes y solo los extremos van redondeados.
.button-group {
  display: inline-flex;

  > .button {
    border-radius: 0;

    &:first-child {
      border-start-start-radius: $button-radius;
      border-end-start-radius: $button-radius;
    }

    &:last-child {
      border-start-end-radius: $button-radius;
      border-end-end-radius: $button-radius;
    }

    & + .button {
      margin-inline-start: -2px;
    }

    &:focus-visible {
      z-index: 1;     // el anillo de foco por encima del botón vecino
    }
  }
}

@keyframes button-spin {
  to {
    transform: rotate(1turn);
  }
}
```
