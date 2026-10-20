---
example_description: "darken(), lighten(), map-get() y percentage() aún funcionan, pero Dart Sass avisa de que desaparecerán: usa los módulos (color.adjust, map.get, math.percentage)"
example_tags: "sass|modulos|deprecacion|sass-color|sass-map|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<div class="toolbar">
  <button type="button" class="btn">Guardar</button>
  <span class="chip">Riego activo</span>
</div>
<p>La página se ve bien… pero abre <code>sass-output.txt</code>: siete avisos de deprecación.</p>
```

# SCSS

```scss
// Código Sass «de toda la vida»: lo encontrarás en tutoriales y proyectos antiguos.
// Funciona, pero cada función global imprime un aviso «Deprecation warning»:
// se eliminarán en Dart Sass 3.0 y entonces este archivo dejará de compilar.

$brand: #2563eb;
$sizes: (sm: 4px, md: 8px, lg: 16px);

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn {
  padding: 8px 16px;
  border: 0;
  border-radius: 6px;
  background: $brand;
  color: #ffffff;
  font: inherit;

  &:hover {
    background: darken($brand, 10%);          // 🐛 global → color.adjust
  }
}

.chip {
  padding: map-get($sizes, sm) map-get($sizes, md);   // 🐛 global → map.get (2 avisos)
  border-radius: 999px;
  background: lighten($brand, 40%);           // 🐛 global → color.adjust
  width: percentage(0.25);                    // 🐛 global → math.percentage
}

// ✅ La versión moderna (copia esto arriba del todo y cambia las llamadas):
//
//   @use "sass:color";
//   @use "sass:map";
//   @use "sass:math";
//
//   background: color.adjust($brand, $lightness: -10%);   // = darken($brand, 10%)
//   padding: map.get($sizes, sm) map.get($sizes, md);
//   background: color.adjust($brand, $lightness: 40%);    // = lighten($brand, 40%)
//   width: math.percentage(0.25);
//
// Y lo mismo para @import, que también está deprecado: usa @use.
```
