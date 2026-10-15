---
example_description: "Tres mixins de breakpoints (up, down y between) con @content, sobre una función que valida el nombre con @error y un mapa de tamaños: una rejilla de productos de 1, 2 y 3 columnas"
example_tags: "sass|integracion|breakpoints|mixins|content|error|mapas|responsive"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<p class="mobile-banner">Vista móvil: desliza para ver más productos.</p>
<p class="tablet-banner">Vista de tableta: entre 30rem y 48rem, dos columnas.</p>
<p class="desktop-banner">Vista de escritorio: desde 48rem, tres columnas.</p>
<ul class="products">
  <li class="product"><h2>Composta de lombriz</h2><p>Saco de 5 kg · 189 MXN</p></li>
  <li class="product"><h2>Semillas de chile poblano</h2><p>Sobre de 2 g · 45 MXN</p></li>
  <li class="product"><h2>Maceta de barro</h2><p>30 cm · 220 MXN</p></li>
  <li class="product"><h2>Regadera de 6 litros</h2><p>Metálica · 310 MXN</p></li>
</ul>
<p class="hint">Abre la vista previa en una pestaña (↗) y cambia el ancho: 1, 2 y 3 columnas, y un aviso distinto en cada tramo.</p>
```

# SCSS

```scss
@use "sass:map";

$breakpoints: (sm: 20rem, md: 30rem, lg: 48rem, xl: 64rem);

// Lección 8: un único punto de entrada que valida el nombre.
@function breakpoint($name) {
  @if not map.has-key($breakpoints, $name) {
    @error "breakpoint(): no existe «#{$name}». Opciones: #{map.keys($breakpoints)}.";
  }
  @return map.get($breakpoints, $name);
}

// Lección 4: mixins con @content. Con la sintaxis de rangos (módulo responsive
// de CSS), «width < 48rem» y «width >= 48rem» no se solapan nunca: con
// max-width/min-width había que restar 0.02px para evitarlo.
@mixin up($name) {
  @media (width >= breakpoint($name)) {
    @content;
  }
}

@mixin down($name) {
  @media (width < breakpoint($name)) {
    @content;
  }
}

@mixin between($from, $to) {
  @media (breakpoint($from) <= width < breakpoint($to)) {
    @content;
  }
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.products {
  display: grid;
  gap: 12px;
  padding: 0;
  list-style: none;

  @include up(md) {
    grid-template-columns: repeat(2, 1fr);
  }

  @include up(lg) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.product {
  padding: 12px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;

  h2 {
    margin: 0 0 4px;
    font-size: 1rem;
  }

  p {
    margin: 0;
    color: #475569;
  }
}

%banner {
  margin: 0 0 12px;
  padding: 8px 12px;
  border-radius: 6px;
}

// Cada aviso está oculto salvo en su tramo.
.mobile-banner {
  @extend %banner;          // placeholder sin contexto, fuera de @media: uso seguro (lección 7)
  display: none;
  background: #dbeafe;

  @include down(md) {
    display: block;
  }
}

.tablet-banner {
  @extend %banner;
  display: none;
  background: #fef3c7;

  @include between(md, lg) {
    display: block;
  }
}

.desktop-banner {
  @extend %banner;
  display: none;
  background: #dcfce7;

  @include up(lg) {
    display: block;
  }
}

// Prueba a escribir @include up(tablet): la compilación se detiene con
// «breakpoint(): no existe «tablet». Opciones: sm, md, lg, xl.»
```
