---
example_description: "Argumentos con valor por defecto y argumentos por nombre: @include card($radius: 0) cambia solo uno; un default null omite la declaración"
example_tags: "sass|mixins|argumentos|default|nombrados"
example_stage: minimal
example_importance: important
---

# HTML

```html
<article class="note">Nota: todo por defecto.</article>
<article class="banner">Banner: sin esquinas (<code>$radius: 0</code>).</article>
<article class="popup">Ventana: más padding y con sombra.</article>
```

# SCSS

```scss
// Cada parámetro puede tener un valor por defecto, como en Python:
// def card(padding="12px 16px", radius="8px", shadow=None): …
@mixin card($padding: 12px 16px, $radius: 8px, $shadow: null) {
  padding: $padding;
  border: 1px solid #cbd5e1;
  border-radius: $radius;
  box-shadow: $shadow;      // null → Sass no escribe la declaración
  margin-bottom: 12px;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.note {
  @include card;                         // sin argumentos: todos por defecto
  background: #fefce8;
}

.banner {
  @include card($radius: 0);             // por NOMBRE: solo cambia ese
  background: #e0f2fe;
}

.popup {
  // Posicional primero y luego por nombre (saltándose $radius).
  @include card(24px, $shadow: 0 8px 24px rgb(15 23 42 / 0.25));
  background: #ffffff;
}

// Los argumentos por nombre hacen el @include legible y permiten saltarse
// los que ya tienen un buen valor por defecto.
```
