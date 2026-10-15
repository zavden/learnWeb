---
example_description: "Tokens de diseño en mapas de Sass publicados como custom properties: paleta, tokens semánticos para tema claro y oscuro, prefers-color-scheme y un selector de tema con :has(); un panel de ajustes como demostración"
example_tags: "sass|profesional|design-tokens|temas|custom-properties|mapas|each|prefers-color-scheme"
example_stage: professional
example_importance: critical
---

# HTML

```html
<div class="app">
  <header class="app-header">
    <p class="app-header__brand">La Huerta · Mi cuenta</p>
    <fieldset class="theme-switch">
      <legend class="visually-hidden">Tema de color</legend>
      <label><input type="radio" name="theme" id="theme-auto" checked> Automático</label>
      <label><input type="radio" name="theme" id="theme-light"> Claro</label>
      <label><input type="radio" name="theme" id="theme-dark"> Oscuro</label>
    </fieldset>
  </header>

  <main class="settings">
    <h1>Ajustes de la cuenta</h1>

    <section class="panel" aria-labelledby="notifications-title">
      <h2 id="notifications-title">Notificaciones</h2>
      <label class="option"><input type="checkbox" checked> Avisarme cuando un pedido salga del almacén</label>
      <label class="option"><input type="checkbox"> Recordatorios de riego por correo</label>
      <label class="option"><input type="checkbox" checked> Novedades del calendario de siembra</label>
    </section>

    <section class="panel" aria-labelledby="plan-title">
      <h2 id="plan-title">Tu plan</h2>
      <p>Plan <strong>Huerto</strong> · 149 MXN al mes · se renueva el 1 de noviembre.</p>
      <p class="panel__note">Puedes cambiar de plan o cancelar en cualquier momento, sin permanencia.</p>
      <div class="panel__actions">
        <a class="button button--primary" href="/cuenta/plan">Cambiar de plan</a>
        <a class="button button--quiet" href="/cuenta/facturas">Ver facturas</a>
      </div>
    </section>

    <p class="status" role="status">Los cambios se guardan automáticamente.</p>
  </main>
</div>
```

# SCSS

```scss
// ─────────────────────────────────────────────────────────────────────────────
// Tokens de diseño y temas
// - Dos niveles de tokens, como en el módulo de arquitectura CSS:
//   · $palette: los colores DISPONIBLES, con nombres de color (green-700).
//   · $themes: los tokens SEMÁNTICOS de cada tema (surface, text, accent…),
//     que eligen colores de la paleta por su nombre. Los componentes solo usan
//     tokens semánticos, así que un tema nuevo no toca ningún componente.
// - Sass valida y genera; el navegador cambia: todo se publica como custom
//   properties (--color-surface, --space-3…) con #{}.
// - CSS ajustado: cada token se escribe UNA vez con light-dark(claro, oscuro)
//   (módulo responsive de CSS). Cambiar de tema es cambiar color-scheme:
//   «light dark» sigue al sistema; «light» o «dark» lo fuerzan. Sin duplicar
//   el tema oscuro en una @media y en un :has().
// - Selector de tema con :has() sobre radios reales (accesibles con teclado).
// - En un proyecto real: _palette.scss, _themes.scss, _tokens.scss y un
//   _index.scss con @forward; aquí todo va en un bloque.
// ─────────────────────────────────────────────────────────────────────────────
@use "sass:map";

// ── 1. Paleta ────────────────────────────────────────────────────────────────
$palette: (
  "white": #ffffff,      // entre comillas: sin ellas, white es un COLOR para Sass
  slate-50: #f8fafc,
  slate-100: #f1f5f9,
  slate-300: #cbd5e1,
  slate-400: #94a3b8,
  slate-600: #475569,
  slate-700: #334155,
  slate-800: #1e293b,
  slate-900: #0f172a,
  slate-950: #020617,
  green-300: #86efac,
  green-700: #15803d,
  green-800: #166534,
);

// ── 2. Temas: token semántico → nombre de color de la paleta ───────────────
$themes: (
  light: (
    page: slate-100,
    surface: "white",
    surface-raised: slate-50,
    text: slate-800,
    text-muted: slate-600,
    border: slate-300,
    accent: green-700,
    accent-hover: green-800,
    on-accent: "white",
  ),
  dark: (
    page: slate-950,
    surface: slate-900,
    surface-raised: slate-800,
    text: slate-100,
    text-muted: slate-400,
    border: slate-700,
    accent: green-300,
    accent-hover: "white",
    on-accent: slate-950,
  ),
);

// ── 3. Escalas que no dependen del tema ──────────────────────────────────────
$space: (1: 0.25rem, 2: 0.5rem, 3: 0.75rem, 4: 1rem, 6: 1.5rem, 8: 2rem);
$radius: (sm: 6px, md: 10px, pill: 999px);

// ── Funciones ────────────────────────────────────────────────────────────────
@function palette($name) {
  @if not map.has-key($palette, $name) {
    @error "palette(): no existe el color «#{$name}».";
  }
  @return map.get($palette, $name);
}

// Escribe cada token una vez: --color-x: light-dark(<claro>, <oscuro>).
// Antes comprueba que los dos temas definen exactamente los mismos tokens.
@mixin color-tokens($light, $dark) {
  @each $token, $_ in $light {
    @if not map.has-key($dark, $token) {
      @error "color-tokens(): el tema oscuro no define «#{$token}».";
    }
  }
  @each $token, $_ in $dark {
    @if not map.has-key($light, $token) {
      @error "color-tokens(): el tema claro no define «#{$token}».";
    }
  }
  @each $token, $light-name in $light {
    --color-#{$token}: light-dark(#{palette($light-name)}, #{palette(map.get($dark, $token))});
  }
}

@mixin scale-properties($prefix, $scale) {
  @each $key, $value in $scale {
    --#{$prefix}-#{$key}: #{$value};
  }
}

// ── Capas ────────────────────────────────────────────────────────────────────
@layer reset, tokens, base, components;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  body,
  h1,
  h2,
  p,
  fieldset {
    margin: 0;
  }
}

@layer tokens {
  :root {
    color-scheme: light dark;    // automático: el navegador elige según el sistema
    @include color-tokens(map.get($themes, light), map.get($themes, dark));
    @include scale-properties(space, $space);
    @include scale-properties(radius, $radius);
  }

  // Tema forzado: solo cambia QUÉ mitad de cada light-dark() se usa.
  :root:has(#theme-light:checked) {
    color-scheme: light;
  }

  :root:has(#theme-dark:checked) {
    color-scheme: dark;
  }
}

@layer base {
  body {
    background: var(--color-page);
    color: var(--color-text);
    font-family: system-ui, sans-serif;
    line-height: 1.5;
  }

  :focus-visible {
    outline: 3px solid var(--color-accent);
    outline-offset: 2px;
  }

  input[type="checkbox"],
  input[type="radio"] {
    accent-color: var(--color-accent);
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}

@layer components {
  .app-header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-6);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);

    &__brand {
      font-weight: 700;
    }
  }

  .theme-switch {
    display: flex;
    gap: var(--space-4);
    padding: 0;
    border: 0;
  }

  .settings {
    display: grid;
    gap: var(--space-6);
    max-width: 40rem;
    margin-inline: auto;
    padding: var(--space-8) var(--space-6);
  }

  .panel {
    display: grid;
    gap: var(--space-3);
    padding: var(--space-6);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);

    h2 {
      font-size: 1.125rem;
    }

    &__note {
      color: var(--color-text-muted);
      font-size: 0.875rem;
    }

    &__actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }
  }

  .option {
    display: flex;
    gap: var(--space-2);
    align-items: center;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    background: var(--color-surface-raised);
  }

  .button {
    padding: var(--space-2) var(--space-4);
    border: 2px solid var(--color-accent);
    border-radius: var(--radius-pill);
    font-weight: 600;
    text-decoration: none;

    &--primary {
      background: var(--color-accent);
      color: var(--color-on-accent);

      &:hover {
        border-color: var(--color-accent-hover);
        background: var(--color-accent-hover);
      }
    }

    &--quiet {
      color: var(--color-text);

      &:hover {
        background: var(--color-surface-raised);
      }
    }
  }

  .status {
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }
}
```
