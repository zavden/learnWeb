---
example_description: "@if / @else en una función: text-on($bg) elige texto oscuro o blanco según la luminosidad del fondo, al compilar"
example_tags: "sass|control-de-flujo|if|funciones|color|contraste"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<div class="buttons">
  <button type="button" class="btn btn-blue">Azul</button>
  <button type="button" class="btn btn-violet">Violeta</button>
  <button type="button" class="btn btn-amber">Ámbar</button>
  <button type="button" class="btn btn-sky">Celeste</button>
  <button type="button" class="btn btn-night">Noche</button>
</div>
<p>El color del texto de cada botón lo ha elegido una función con <code>@if</code>.</p>
```

# SCSS

```scss
@use "sass:color";

// Elige el color del texto según lo claro que sea el fondo.
// color.channel lee la luminosidad en el espacio OKLCH (0% negro, 100% blanco).
@function text-on($bg) {
  @if color.channel($bg, "lightness", $space: oklch) > 60% {
    @return #1e293b;      // fondo claro → texto oscuro
  } @else {
    @return #ffffff;      // fondo oscuro → texto blanco
  }
}

// Python: def text_on(bg): return DARK if lightness(bg) > 60 else WHITE

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: 0;
  border-radius: 6px;
  font: inherit;
}

.btn-blue   { background: #2563eb; color: text-on(#2563eb); }   // → #ffffff
.btn-violet { background: #7c3aed; color: text-on(#7c3aed); }   // → #ffffff
.btn-amber  { background: #f59e0b; color: text-on(#f59e0b); }   // → #1e293b
.btn-sky    { background: #0ea5e9; color: text-on(#0ea5e9); }   // → #1e293b
.btn-night  { background: #0f172a; color: text-on(#0f172a); }   // → #ffffff

// Comparaciones: ==, !=, <, >, <=, >=. Lógica: and, or, not (en palabras,
// como en Python). También hay @else if para más de dos casos.
// (La luminosidad es una aproximación: comprueba siempre el contraste real.)
```
