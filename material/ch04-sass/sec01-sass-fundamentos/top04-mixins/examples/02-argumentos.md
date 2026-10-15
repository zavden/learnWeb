---
example_description: "Un mixin con argumentos genera variantes: @include button-variant(#15803d, #166534) crea un botón verde con su hover"
example_tags: "sass|mixins|argumentos|botones"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<div class="toolbar">
  <button type="button" class="btn btn-primary">Guardar</button>
  <button type="button" class="btn btn-success">Publicar</button>
  <button type="button" class="btn btn-danger">Borrar</button>
</div>
```

# SCSS

```scss
// Los argumentos funcionan como los parámetros de una función de Python:
// def button_variant(bg, bg_hover): …
@mixin button-variant($bg, $bg-hover) {
  background: $bg;
  color: #ffffff;

  // Un mixin puede llevar reglas anidadas: & será el selector donde se incluya.
  &:hover {
    background: $bg-hover;
  }

  &:focus-visible {
    outline: 3px solid $bg;
    outline-offset: 2px;
  }
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.toolbar {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: 0;
  border-radius: 6px;
  font: inherit;
}

// Cada @include pasa sus valores, en el mismo orden que los parámetros.
.btn-primary {
  @include button-variant(#2563eb, #1e40af);   // → .btn-primary, .btn-primary:hover…
}

.btn-success {
  @include button-variant(#15803d, #166534);
}

.btn-danger {
  @include button-variant(#b91c1c, #991b1b);
}
```
