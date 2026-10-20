---
example_description: "Una barra de navegación con estados anidados: enlace de salto, página actual con aria-current, submenú con details/summary, fila desplazable en móvil y una sola fila en escritorio, con mixins de estado y de breakpoint"
example_tags: "sass|profesional|navegacion|anidamiento|selector-padre|details|breakpoints|accesibilidad"
example_stage: professional
example_importance: critical
---

# HTML

```html
<a class="skip-link" href="#content">Saltar al contenido</a>

<header class="navbar">
  <a class="navbar__brand" href="/">La Huerta</a>

  <nav class="navbar__nav" aria-label="Principal">
    <ul class="navbar__list">
      <li><a class="navbar__link" href="/" aria-current="page">Inicio</a></li>
      <li>
        <details class="navbar__menu">
          <summary class="navbar__link">Tienda</summary>
          <ul class="navbar__submenu">
            <li><a href="/tienda/semillas">Semillas</a></li>
            <li><a href="/tienda/riego">Riego</a></li>
            <li><a href="/tienda/composta">Composta y sustratos</a></li>
            <li><a href="/tienda/herramientas">Herramientas</a></li>
          </ul>
        </details>
      </li>
      <li><a class="navbar__link" href="/talleres">Talleres</a></li>
      <li><a class="navbar__link" href="/blog">Blog</a></li>
      <li><a class="navbar__link" href="/contacto">Contacto</a></li>
    </ul>
  </nav>

  <a class="navbar__cart" href="/cesta">Cesta <span class="navbar__count">2<span class="visually-hidden"> artículos</span></span></a>
</header>

<main id="content" class="content" tabindex="-1">
  <h1>Bienvenida a La Huerta</h1>
  <p>Usa el tabulador: el primer elemento es el enlace «Saltar al contenido». Abre «Tienda» con Intro o con el ratón. En una ventana estrecha, los enlaces se desplazan en horizontal.</p>
</main>
```

# SCSS

```scss
// ─────────────────────────────────────────────────────────────────────────────
// Barra de navegación
// - Rejilla con áreas: marca y cesta arriba, navegación debajo en móvil; las
//   tres en una fila desde el breakpoint md. El orden del HTML es el orden de
//   tabulación en los dos casos.
// - En móvil, la lista se desplaza en horizontal (overflow-x + scroll-snap):
//   todos los enlaces siguen visibles y accesibles, sin JavaScript.
// - Submenú con <details>/<summary>: se abre con teclado y ratón y el
//   navegador comunica su estado. Sass solo le da forma: en el flujo en móvil
//   y flotante en escritorio.
// - Estados con & en un único sitio por elemento: :hover y :focus-visible
//   comparten un mixin; la página actual se marca con [aria-current="page"],
//   el mismo atributo que leen los lectores de pantalla.
// ─────────────────────────────────────────────────────────────────────────────
@use "sass:map";

$nav-colors: (
  bar: #14532d,
  text: #f0fdf4,
  hover: #166534,
  accent: #fde68a,
  panel: #ffffff,
  panel-text: #14532d,
  panel-hover: #f0fdf4,
) !default;

$breakpoints: (md: 48rem) !default;

@function nav($name) {
  @if not map.has-key($nav-colors, $name) {
    @error "nav(): no existe «#{$name}». Opciones: #{map.keys($nav-colors)}.";
  }
  @return map.get($nav-colors, $name);
}

@mixin up($name) {
  @if not map.has-key($breakpoints, $name) {
    @error "up(): no existe «#{$name}». Opciones: #{map.keys($breakpoints)}.";
  }
  @media (width >= map.get($breakpoints, $name)) {
    @content;
  }
}

@mixin interactive {
  &:hover,
  &:focus-visible {
    @content;
  }
}

@mixin focus-ring($color: nav(accent)) {
  &:focus-visible {
    outline: 3px solid $color;
    outline-offset: 2px;
  }
}

@mixin motion-safe {
  @media (prefers-reduced-motion: no-preference) {
    @content;
  }
}

// ── Base ─────────────────────────────────────────────────────────────────────
body {
  margin: 0;
  color: #1e293b;
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

.skip-link {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 10;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background: nav(accent);
  color: nav(bar);
  font-weight: 700;
  translate: 0 -200%;

  &:focus-visible {
    translate: 0 0;
    outline: 3px solid nav(bar);
  }
}

.content {
  max-width: 40rem;
  padding: 2rem 1rem;

  &:focus {
    outline: none;   // recibe el foco desde el enlace de salto, sin anillo
  }
}

// ── Barra ────────────────────────────────────────────────────────────────────
.navbar {
  display: grid;
  grid-template-areas:
    "brand cart"
    "nav nav";
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.5rem 1rem;
  padding: 0.75rem 1rem 0.25rem;
  background: nav(bar);
  color: nav(text);

  @include up(md) {
    grid-template-areas: "brand nav cart";
    grid-template-columns: auto 1fr auto;
    padding-bottom: 0.75rem;
  }

  a {
    color: inherit;
  }

  &__brand {
    grid-area: brand;
    font-size: 1.25rem;
    font-weight: 800;
    text-decoration: none;
    @include focus-ring;
  }

  &__nav {
    grid-area: nav;
    min-width: 0;          // deja que la fila desplazable encoja
  }

  &__list {
    display: flex;
    gap: 0.25rem;
    margin: 0;
    padding: 0 0 0.5rem;
    overflow-x: auto;
    scroll-snap-type: x proximity;
    list-style: none;

    @include up(md) {
      padding-bottom: 0;
      overflow: visible;   // el submenú puede salir de la barra
    }

    > li {
      flex: none;
      scroll-snap-align: start;
    }
  }

  &__link {
    position: relative;
    display: block;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;

    @include interactive {
      background: nav(hover);
    }

    @include focus-ring;

    // Página actual: una barra bajo el texto, además del atributo.
    &[aria-current="page"]::after {
      content: "";
      position: absolute;
      inset: auto 0.75rem 0.2rem;
      height: 3px;
      border-radius: 2px;
      background: nav(accent);
    }
  }

  // ── Submenú ────────────────────────────────────────────────────────────────
  &__menu {
    position: relative;

    > summary {
      list-style: none;

      &::-webkit-details-marker {
        display: none;
      }

      &::after {
        content: "";
        display: inline-block;
        width: 0.45em;
        height: 0.45em;
        margin-left: 0.5em;
        border-right: 2px solid currentColor;
        border-bottom: 2px solid currentColor;
        rotate: 45deg;
        translate: 0 -0.15em;

        @include motion-safe {
          transition: rotate 150ms ease-out;
        }
      }
    }

    &[open] > summary {
      background: nav(hover);

      &::after {
        rotate: -135deg;
        translate: 0 0.1em;
      }
    }
  }

  // En móvil, el submenú va en el flujo: dentro de una fila con overflow, un
  // elemento absoluto quedaría recortado. Desde md, flota bajo su enlace.
  &__submenu {
    min-width: 13rem;
    margin: 0.25rem 0 0;
    padding: 0.375rem;
    border-radius: 8px;
    background: nav(panel);
    list-style: none;

    @include up(md) {
      position: absolute;
      top: calc(100% + 0.25rem);
      left: 0;
      z-index: 5;
      margin: 0;
      box-shadow: 0 12px 32px rgb(15 23 42 / 0.25);
    }

    a {
      display: block;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      color: nav(panel-text);
      text-decoration: none;

      @include interactive {
        background: nav(panel-hover);
      }

      @include focus-ring(nav(bar));
    }
  }

  // ── Cesta ──────────────────────────────────────────────────────────────────
  &__cart {
    grid-area: cart;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    border: 2px solid currentColor;
    border-radius: 999px;
    font-weight: 600;
    text-decoration: none;

    @include interactive {
      background: nav(hover);
    }

    @include focus-ring;
  }

  &__count {
    display: inline-grid;
    place-items: center;
    min-width: 1.5rem;
    height: 1.5rem;
    padding-inline: 0.25rem;
    border-radius: 999px;
    background: nav(accent);
    color: nav(bar);
    font-size: 0.8125rem;
    font-weight: 800;
  }
}
```
