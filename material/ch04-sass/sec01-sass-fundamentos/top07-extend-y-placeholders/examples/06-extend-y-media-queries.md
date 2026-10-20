---
example_description: "No se puede extender desde dentro de una @media un selector que está fuera: «You may not @extend selectors across media queries». Usa un mixin"
example_tags: "sass|extend|media-queries|errores|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<div class="notice">Envío gratis en pedidos de más de 50 €.</div>
<p>❌ Sin estilos: el CSS no se pudo generar. Lee el error en <code>sass-output.txt</code>.</p>
```

# SCSS

```scss
%highlight {
  border-left: 6px solid #b45309;
  background: #fef3c7;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.notice {
  padding: 10px 14px;

  // «En pantallas anchas, destaca el aviso».
  @media (width >= 30rem) {
    // 🐛 %highlight está FUERA de la media query y este @extend, DENTRO.
    // Para cumplirlo, Sass tendría que meter «.notice» en la regla de
    // %highlight… pero solo cuando se cumple la media query. Eso no se puede
    // expresar con un selector, así que se detiene:
    // «You may not @extend selectors across media queries.»
    @extend %highlight;
  }
}

// ✅ Solución: un mixin. Copia las declaraciones DENTRO de la media query.
//
//   @mixin highlight {
//     border-left: 6px solid #b45309;
//     background: #fef3c7;
//   }
//
//   .notice {
//     @media (width >= 30rem) {
//       @include highlight;
//     }
//   }
```
