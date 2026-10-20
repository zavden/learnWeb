---
example_description: "Insignias, alertas, un banner y avisos emergentes que comparten «tonos» generados desde un mapa: data-tone fija los colores, una función calcula el contraste WCAG al compilar y @warn avisa si un par no llega a 4,5:1"
example_tags: "sass|profesional|alertas|insignias|mapas|each|sass-color|contraste|warn|accesibilidad"
example_stage: professional
example_importance: critical
---

# HTML

```html
<div class="banner" data-tone="warning" role="region" aria-label="Aviso del sitio">
  <p>Del 1 al 3 de noviembre no hay envíos: el almacén cierra por inventario.</p>
</div>

<main class="page">
  <h1>Pedidos recientes</h1>

  <ul class="orders">
    <li><span>#20417 · Kit de goteo</span> <span class="badge" data-tone="success">Entregado</span></li>
    <li><span>#20418 · Programador solar</span> <span class="badge" data-tone="info">En camino</span></li>
    <li><span>#20419 · Mesa de cultivo</span> <span class="badge" data-tone="warning">Pago pendiente</span></li>
    <li><span>#20420 · Sustrato universal</span> <span class="badge badge--solid" data-tone="danger">Cancelado</span></li>
  </ul>

  <div class="alert" data-tone="danger" role="alert">
    <svg class="alert__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l10 18H2zM12 10v5M12 18v.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <div class="alert__body">
      <p class="alert__title">No pudimos cobrar el pedido #20419</p>
      <p>Tu banco rechazó el pago. Actualiza la tarjeta antes del viernes para no perder la reserva.</p>
      <a class="alert__action" href="/cuenta/pagos">Actualizar el método de pago</a>
    </div>
    <button type="button" class="alert__close" aria-label="Cerrar aviso">×</button>
  </div>

  <div class="alert" data-tone="info">
    <svg class="alert__icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 11v6M12 7.5v.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    <div class="alert__body">
      <p class="alert__title">Consejo de temporada</p>
      <p>En octubre baja el riego a la mitad: las noches son más frescas y la tierra tarda más en secarse.</p>
    </div>
  </div>

  <section class="toasts" aria-label="Notificaciones" role="status">
    <p class="toast" data-tone="success"><strong>Guardado.</strong> Tu dirección de envío se actualizó.</p>
    <p class="toast" data-tone="neutral"><strong>Copiado.</strong> El número de seguimiento está en el portapapeles.</p>
  </section>
</main>
```

# SCSS

```scss
// ─────────────────────────────────────────────────────────────────────────────
// Tonos compartidos: insignias, alertas, banner y avisos
// - Un solo mapa de tonos. Cada tono genera UNA regla [data-tone="…"] con 5
//   custom properties, y todos los componentes las usan. 5 tonos × 4
//   componentes = 20 combinaciones con 5 reglas pequeñas.
// - data-tone (un atributo) en vez de una clase por componente y tono: el
//   componente dice QUÉ es (.alert) y el atributo, en QUÉ tono habla.
// - Contraste comprobado al compilar: contrast() implementa la fórmula de WCAG
//   con sass:math, y un @warn avisa en sass-output.txt si un tono no llega a
//   4,5:1. Cambia el tono «info» a #38bdf8 y mira la salida.
// - Accesibilidad: la alerta urgente usa role="alert"; los avisos, una región
//   role="status"; los iconos son decorativos (aria-hidden) porque el texto ya
//   lo dice todo; el botón de cerrar tiene nombre accesible.
// ─────────────────────────────────────────────────────────────────────────────
@use "sass:color";
@use "sass:math";

$tones: (
  info: #0369a1,
  success: #15803d,
  warning: #b45309,
  danger: #b91c1c,
  neutral: #475569,
) !default;

$min-contrast: 4.5 !default;

// ── Funciones de color ───────────────────────────────────────────────────────
@function tidy($color) {
  @return rgb(
    math.round(color.channel($color, "red", $space: rgb)),
    math.round(color.channel($color, "green", $space: rgb)),
    math.round(color.channel($color, "blue", $space: rgb))
  );
}

@function linear-channel($value) {
  $c: math.div($value, 255);
  @if $c <= 0.04045 {
    @return math.div($c, 12.92);
  }
  @return math.pow(math.div($c + 0.055, 1.055), 2.4);
}

// Luminancia relativa de WCAG (0 = negro, 1 = blanco).
@function luminance($color) {
  $r: linear-channel(color.channel($color, "red", $space: rgb));
  $g: linear-channel(color.channel($color, "green", $space: rgb));
  $b: linear-channel(color.channel($color, "blue", $space: rgb));
  @return 0.2126 * $r + 0.7152 * $g + 0.0722 * $b;
}

@function contrast($a, $b) {
  $la: luminance($a);
  $lb: luminance($b);
  @return math.div(math.max($la, $lb) + 0.05, math.min($la, $lb) + 0.05);
}

@mixin require-contrast($name, $foreground, $background) {
  $ratio: contrast($foreground, $background);
  @if $ratio < $min-contrast {
    @warn "Tono «#{$name}»: contraste #{math.div(math.round($ratio * 100), 100)}:1, por debajo de #{$min-contrast}:1.";
  }
}

// ── Tonos ────────────────────────────────────────────────────────────────────
@each $name, $color in $tones {
  $tint: tidy(color.scale($color, $lightness: 92%));
  $ink: tidy(color.scale($color, $lightness: -50%));

  @include require-contrast($name, $ink, $tint);           // texto sobre fondo suave
  @include require-contrast($name, #ffffff, $color);       // texto blanco sobre el tono

  [data-tone="#{$name}"] {
    --tone: #{$color};
    --tone-tint: #{$tint};
    --tone-ink: #{$ink};
    --tone-border: #{tidy(color.scale($color, $lightness: 60%))};
    --tone-on: #ffffff;
  }
}

// ── Base de la página ────────────────────────────────────────────────────────
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1e293b;
  line-height: 1.5;
}

.page {
  display: grid;
  gap: 1rem;
  max-width: 42rem;
  margin-inline: auto;
  padding: 1.5rem;

  h1 {
    margin: 0;
    font-size: 1.5rem;
  }
}

.orders {
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid #e2e8f0;
  }
}

// ── Componentes ──────────────────────────────────────────────────────────────
.banner {
  padding: 0.625rem 1.5rem;
  border-bottom: 1px solid var(--tone-border);
  background: var(--tone-tint);
  color: var(--tone-ink);
  text-align: center;

  p {
    margin: 0;
  }
}

.badge {
  display: inline-block;
  padding: 0.125rem 0.625rem;
  border: 1px solid var(--tone-border);
  border-radius: 999px;
  background: var(--tone-tint);
  color: var(--tone-ink);
  font-size: 0.8125rem;
  font-weight: 600;

  &--solid {
    border-color: var(--tone);
    background: var(--tone);
    color: var(--tone-on);
  }
}

.alert {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: start;
  padding: 1rem;
  border: 1px solid var(--tone-border);
  border-inline-start: 6px solid var(--tone);
  border-radius: 8px;
  background: var(--tone-tint);
  color: var(--tone-ink);

  &__icon {
    width: 1.5rem;
    height: 1.5rem;
    color: var(--tone);
  }

  &__body p {
    margin: 0;
  }

  &__title {
    font-weight: 700;
  }

  &__action {
    display: inline-block;
    margin-top: 0.5rem;
    color: inherit;
    font-weight: 600;
  }

  &__close {
    width: 2rem;
    height: 2rem;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: inherit;
    font-size: 1.25rem;
    line-height: 1;
    cursor: pointer;

    &:hover {
      background: var(--tone-border);
    }

    &:focus-visible {
      outline: 3px solid var(--tone);
    }
  }
}

.toasts {
  display: grid;
  gap: 0.5rem;
  justify-items: end;
}

.toast {
  max-width: 22rem;
  margin: 0;
  padding: 0.75rem 1rem;
  border-inline-start: 6px solid var(--tone);
  border-radius: 8px;
  background: #1e293b;
  color: #f1f5f9;
  box-shadow: 0 8px 24px rgb(15 23 42 / 0.25);
}
```
