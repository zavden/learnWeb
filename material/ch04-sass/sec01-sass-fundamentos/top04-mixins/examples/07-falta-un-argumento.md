---
example_description: "Llamar a un mixin sin un argumento obligatorio detiene la compilación con «Missing argument»: la página se queda sin CSS"
example_tags: "sass|mixins|argumentos|errores"
example_stage: common-error
example_importance: important
---

# HTML

```html
<div class="toolbar">
  <button type="button" class="btn btn-primary">Guardar</button>
  <button type="button" class="btn btn-danger">Borrar</button>
</div>
<p>❌ Sin estilos: lee el error en <code>sass-output.txt</code> (o en el botón «CSS» del editor).</p>
```

# SCSS

```scss
@mixin button-variant($bg, $bg-hover) {
  background: $bg;
  color: #ffffff;

  &:hover {
    background: $bg-hover;
  }
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.btn {
  padding: 8px 16px;
  border: 0;
  border-radius: 6px;
  font: inherit;
}

.btn-primary {
  @include button-variant(#2563eb, #1e40af);
}

.btn-danger {
  // 🐛 $bg-hover no tiene valor por defecto, así que es OBLIGATORIO.
  // Sass se detiene: «Missing argument $bg-hover.» (en la línea del @include).
  @include button-variant(#b91c1c);

  // ✅ Pásalo: @include button-variant(#b91c1c, #991b1b);
  //    o dale un valor por defecto en el mixin: $bg-hover: $bg
  //    (un parámetro puede usar los anteriores en su valor por defecto).
}

// Otros dos errores de la misma familia, igual de fáciles de leer:
//   @include button-variant(#b91c1c, $hover: #991b1b);
//     → «No parameter named $hover.»  (el nombre no coincide)
//   un @include ESCRITO ANTES que su @mixin
//     → «Undefined mixin.»  (Sass lee de arriba abajo: define antes de usar)
```
