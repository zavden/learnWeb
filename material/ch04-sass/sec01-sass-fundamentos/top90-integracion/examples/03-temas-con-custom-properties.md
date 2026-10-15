---
example_description: "Temas definidos en un mapa de Sass y publicados como custom properties con #{}: un mixin con @each los escribe, y :has(:checked) los cambia en el navegador sin JavaScript"
example_tags: "sass|integracion|temas|custom-properties|mapas|each|interpolacion|has"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<div class="page">
  <fieldset class="theme-picker">
    <legend>Tema</legend>
    <label><input type="radio" name="theme" id="theme-light" checked> Claro</label>
    <label><input type="radio" name="theme" id="theme-dark"> Oscuro</label>
    <label><input type="radio" name="theme" id="theme-sepia"> Sepia</label>
  </fieldset>
  <article class="recipe">
    <p class="recipe__tag">Receta de temporada</p>
    <h2 class="recipe__title">Crema de calabaza con epazote</h2>
    <p class="recipe__meta">35 minutos · 4 personas</p>
    <p>Asa la calabaza con un poco de cebolla, licúa con caldo y termina con epazote fresco picado.</p>
    <a class="recipe__link" href="/recetas/crema-de-calabaza">Ver la receta completa</a>
  </article>
</div>
```

# SCSS

```scss
@use "sass:list";
@use "sass:map";

// ── Los temas: un mapa de mapas (lección 5). Los nombres de los tokens dicen
//    su FUNCIÓN, no su color, para que tengan sentido en todos los temas. ─────
$themes: (
  light: (
    surface: #ffffff,
    surface-alt: #f1f5f9,
    text: #1e293b,
    muted: #475569,
    accent: #1d4ed8,
    border: #cbd5e1,
  ),
  dark: (
    surface: #0f172a,
    surface-alt: #1e293b,
    text: #f1f5f9,
    muted: #cbd5e1,
    accent: #93c5fd,
    border: #334155,
  ),
  sepia: (
    surface: #fbf3e4,
    surface-alt: #f3e5c8,
    text: #3b2f22,
    muted: #6b5a45,
    accent: #9a3412,
    border: #d6c3a0,
  ),
);

$default-theme: light;
$dark-themes: (dark,);  // los que necesitan color-scheme: dark (la coma: una tupla de un elemento, como en Python)

// Escribe un tema como custom properties: --color-surface: #ffffff; …
// Sin #{}, el CSS recibiría literalmente «$value» (lección 2).
@mixin theme($name) {
  @each $token, $value in map.get($themes, $name) {
    --color-#{$token}: #{$value};
  }
  // list.index devuelve null si no lo encuentra, y null es falso (lección 6).
  @if list.index($dark-themes, $name) {
    color-scheme: dark;
  } @else {
    color-scheme: light;
  }
}

// El tema por defecto, en la raíz…
:root {
  @include theme($default-theme);
}

// …y una regla por cada OTRO tema, activa cuando su radio está marcado. Estos
// selectores existen en el CSS: el navegador los aplica en cuanto cambia el
// estado (las variables Sass no podrían). El tema claro no necesita regla: al
// marcar «Claro», ninguna se cumple y vuelven los valores de :root.
@each $name, $_ in $themes {
  @if $name != $default-theme {
    .page:has(#theme-#{$name}:checked) {
      @include theme($name);
    }
  }
}

// ── Los componentes solo conocen las custom properties ─────────────────────
body {
  margin: 0;
  font-family: system-ui, sans-serif;
}

.page {
  min-height: 100vh;
  padding: 16px;
  background: var(--color-surface-alt);
  color: var(--color-text);
}

.theme-picker {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.recipe {
  max-width: 28rem;
  padding: 4px 20px 16px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);

  &__tag {
    margin-bottom: 0;
    color: var(--color-accent);
    font-size: 0.8rem;
    font-weight: bold;
    text-transform: uppercase;
  }

  &__title {
    margin-top: 4px;
  }

  &__meta {
    color: var(--color-muted);
  }

  &__link {
    color: var(--color-accent);
    font-weight: bold;
  }
}
```
