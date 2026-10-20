---
example_description: "@content: el mixin recibe un bloque de declaraciones y decide dónde colocarlo, aquí dentro de &:hover y &:focus-visible a la vez"
example_tags: "sass|mixins|content|estados|accesibilidad"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<nav class="menu" aria-label="Categorías">
  <a href="/tienda/riego">Riego</a>
  <a href="/tienda/semillas">Semillas</a>
  <a href="/tienda/compost">Compost</a>
</nav>
<button type="button" class="cta">Suscribirme al boletín</button>
<p>Prueba con el ratón y con el tabulador: los dos estados se ven igual.</p>
```

# SCSS

```scss
// @content es un «hueco»: el bloque que escribas entre llaves al hacer el
// @include se coloca ahí. Este mixin garantiza que el estilo del ratón
// también llegue a quien navega con teclado.
@mixin hover-and-focus {
  &:hover,
  &:focus-visible {
    @content;
  }
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.menu {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;

  a {
    padding: 6px 12px;
    border-radius: 6px;
    color: #1e40af;

    @include hover-and-focus {     // ← este bloque va al hueco de @content
      background: #dbeafe;
      color: #1e3a8a;
      text-decoration: none;   // el anillo de foco del navegador se mantiene
    }
  }
}

.cta {
  padding: 10px 18px;
  border: 2px solid #1e40af;
  border-radius: 999px;
  background: #ffffff;
  color: #1e40af;
  font: inherit;

  @include hover-and-focus {
    background: #1e40af;
    color: #ffffff;
    outline: 3px solid #93c5fd;
  }
}
```
