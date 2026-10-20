---
example_description: "Una receta con su hoja de impresión: un mixin print() con @content junto a cada componente, elementos que solo existen en pantalla, URLs visibles tras los enlaces, saltos de página controlados y @page"
example_tags: "sass|profesional|impresion|media-print|mixins|content|page"
example_stage: professional
example_importance: useful
---

# HTML

```html
<header class="site-header">
  <a class="site-header__brand" href="/">La Huerta</a>
  <nav aria-label="Principal">
    <a href="/recetas">Recetas</a>
    <a href="/tienda">Tienda</a>
    <a href="/talleres">Talleres</a>
  </nav>
</header>

<main class="recipe">
  <p class="recipe__kicker">Receta de temporada · 4 personas · 25 minutos</p>
  <h1>Salsa verde de tomatillo asado</h1>
  <p class="recipe__lead">La salsa de todos los días, con tomatillos del huerto asados en comal para que sepa a humo.</p>

  <div class="recipe__actions screen-only">
    <a class="button" href="/recetas/salsa-verde/guardar">Guardar en mis recetas</a>
    <p class="hint">Para ver la versión impresa, abre la vista previa en una pestaña (↗) y pulsa ⌘P, o en DevTools: Rendering → Emulate CSS media type → print.</p>
  </div>

  <section class="recipe__section">
    <h2>Ingredientes</h2>
    <ul class="ingredients">
      <li>500 g de tomatillo verde</li>
      <li>2 chiles serranos (o 1 jalapeño)</li>
      <li>¼ de cebolla blanca</li>
      <li>1 diente de ajo</li>
      <li>Un manojo de cilantro</li>
      <li>Sal de grano al gusto</li>
    </ul>
  </section>

  <section class="recipe__section">
    <h2>Preparación</h2>
    <ol class="steps">
      <li>Asa los tomatillos, los chiles, la cebolla y el ajo en un comal a fuego medio, dándoles la vuelta hasta que tengan manchas negras (unos 10 minutos).</li>
      <li>Pela el ajo y pasa todo a la licuadora con el cilantro y una pizca de sal.</li>
      <li>Licúa en pulsos cortos: debe quedar con textura, no como un puré.</li>
      <li>Prueba, ajusta la sal y deja reposar 10 minutos antes de servir.</li>
    </ol>
  </section>

  <aside class="tip">
    <h2>Consejo</h2>
    <p>Si la salsa queda ácida, añade un trozo de aguacate al licuar. Más trucos en <a href="/blog/tomatillos">nuestra guía del tomatillo</a>.</p>
  </aside>
</main>

<footer class="site-footer">
  <p>© 2026 La Huerta · Ciudad de México · <a href="https://lahuerta.mx/recetas">lahuerta.mx/recetas</a></p>
</footer>
```

# SCSS

```scss
// ─────────────────────────────────────────────────────────────────────────────
// Receta con hoja de impresión
// - Un mixin print() envuelve @media print: los estilos de papel de cada
//   componente van junto a sus estilos de pantalla, no en un archivo aparte
//   que nadie recuerda actualizar.
// - .screen-only: lo que no tiene sentido en papel (botones, navegación).
// - En papel, un enlace no se puede pulsar: se escribe su URL detrás. Las
//   rutas relativas se completan con el dominio ($site-url).
// - Saltos de página: los pasos y el consejo no se parten entre dos hojas, y
//   un título nunca se queda solo al final de una página.
// - @page fija los márgenes del papel; las medidas en pt son las habituales
//   en impresión.
// ─────────────────────────────────────────────────────────────────────────────
$site-url: "https://lahuerta.mx" !default;
$brand: #14532d;
$accent: #b45309;

@mixin print {
  @media print {
    @content;
  }
}

// ── Base ─────────────────────────────────────────────────────────────────────
body {
  margin: 0;
  background: #fffdf8;
  color: #292524;
  font-family: system-ui, sans-serif;
  line-height: 1.55;

  @include print {
    background: none;
    color: #000000;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 11pt;
  }
}

@include print {
  @page {
    margin: 2cm 1.8cm;
  }

  .screen-only {
    display: none;
  }

  // La URL detrás de cada enlace del contenido (no en los de la cabecera, que
  // ya no se imprimen).
  main a[href^="/"]::after {
    content: " (#{$site-url}" attr(href) ")";
    font-size: 0.85em;
  }

  main a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-size: 0.85em;
  }

  h1,
  h2 {
    break-after: avoid;     // un título no se queda solo al pie de una hoja
  }
}

// ── Cabecera y pie ───────────────────────────────────────────────────────────
.site-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: $brand;
  color: #f0fdf4;

  a {
    color: inherit;
  }

  nav {
    display: flex;
    gap: 1rem;
  }

  &__brand {
    font-weight: 800;
    text-decoration: none;
  }

  // En papel, solo el nombre del sitio, sin fondo de color.
  @include print {
    padding: 0 0 0.5cm;
    border-bottom: 1pt solid #000000;
    background: none;
    color: #000000;

    nav {
      display: none;
    }
  }
}

.site-footer {
  padding: 1rem 1.5rem;
  color: #57534e;
  font-size: 0.875rem;

  a {
    color: inherit;
  }

  @include print {
    padding: 0.5cm 0 0;
    border-top: 1pt solid #000000;
    color: #000000;
  }
}

// ── Receta ───────────────────────────────────────────────────────────────────
.recipe {
  max-width: 42rem;
  margin-inline: auto;
  padding: 2rem 1.5rem;

  @include print {
    max-width: none;
    padding: 0.5cm 0;
  }

  h1 {
    margin: 0.25rem 0 0.5rem;
    color: $brand;
    font-size: clamp(1.75rem, 1.3rem + 2vw, 2.5rem);
    line-height: 1.1;

    @include print {
      color: #000000;
      font-size: 22pt;
    }
  }

  h2 {
    margin: 0 0 0.5rem;
    font-size: 1.2rem;

    @include print {
      font-size: 14pt;
    }
  }

  &__kicker {
    margin: 0;
    color: $accent;
    font-size: 0.875rem;
    font-weight: 700;
    text-transform: uppercase;

    @include print {
      color: #000000;
    }
  }

  &__lead {
    font-size: 1.125rem;
  }

  &__actions {
    display: grid;
    gap: 0.5rem;
    margin-block: 1.5rem;
  }

  &__section {
    margin-top: 1.75rem;
  }
}

.button {
  justify-self: start;
  padding: 0.5rem 1.25rem;
  border-radius: 999px;
  background: $brand;
  color: #ffffff;
  font-weight: 600;
  text-decoration: none;

  &:focus-visible {
    outline: 3px solid $accent;
    outline-offset: 2px;
  }
}

.hint {
  margin: 0;
  color: #57534e;
  font-size: 0.875rem;
}

.ingredients {
  padding-left: 1.25rem;

  // En papel caben en dos columnas y ahorran media hoja.
  @include print {
    columns: 2;
    column-gap: 1cm;
  }
}

.steps {
  padding-left: 1.5rem;

  li + li {
    margin-top: 0.5rem;
  }

  li {
    break-inside: avoid;    // un paso no se parte entre dos hojas
  }

  ::marker {
    color: $accent;
    font-weight: 700;

    @include print {
      color: #000000;
    }
  }
}

.tip {
  margin-top: 2rem;
  padding: 1rem 1.25rem;
  border-left: 6px solid $accent;
  border-radius: 6px;
  background: #fef3c7;

  p {
    margin: 0;
  }

  a {
    color: #78350f;
  }

  @include print {
    border: 1pt solid #000000;
    background: none;
    break-inside: avoid;
  }
}
```
