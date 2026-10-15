---
example_description: "Argumentos variables con $props...: el mixin recibe cuantos valores le pases como una lista (como *args en Python)"
example_tags: "sass|mixins|argumentos|transiciones|accesibilidad"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<a class="tile" href="/tienda/riego">
  <span class="tile__title">Riego</span>
  <span class="tile__text">Goteros, programadores y mangueras</span>
</a>
<a class="tile" href="/tienda/semillas">
  <span class="tile__title">Semillas</span>
  <span class="tile__text">Hortalizas, aromáticas y flores</span>
</a>
<p>Pasa el ratón o usa el tabulador sobre las tarjetas.</p>
```

# SCSS

```scss
// $props... recoge TODOS los argumentos en una lista (como *args en Python).
@mixin transition($props...) {
  transition-property: $props;     // → color, background-color, transform
  transition-duration: 200ms;
  transition-timing-function: ease-out;

  // El mixin respeta siempre la preferencia de movimiento reducido:
  // nadie que lo use puede olvidarse de ella.
  @media (prefers-reduced-motion: reduce) {
    transition-duration: 0s;
  }
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.tile {
  @include transition(color, background-color, transform);
  display: inline-grid;
  gap: 4px;
  width: 12rem;
  margin: 0 8px 8px 0;
  padding: 12px 16px;
  border: 2px solid #15803d;
  border-radius: 8px;
  color: #14532d;
  text-decoration: none;

  &:hover,
  &:focus-visible {
    background: #15803d;
    color: #ffffff;
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 3px solid #1e293b;
    outline-offset: 2px;
  }

  &__title {
    font-weight: bold;
  }

  &__text {
    font-size: 0.875rem;
  }
}
```
