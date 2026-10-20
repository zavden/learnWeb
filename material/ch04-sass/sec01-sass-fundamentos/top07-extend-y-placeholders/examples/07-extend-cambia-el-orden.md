---
example_description: "@extend coloca tu selector donde está la regla extendida, no donde escribes el @extend: si .btn va después, su fondo gris pisa el rojo de .btn-danger"
example_tags: "sass|extend|cascada|orden|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<button type="button" class="btn-danger">❌ Cancelar pedido (¿no era rojo?)</button>
<button type="button" class="btn-danger-fixed">✅ Cancelar pedido</button>
```

# SCSS

```scss
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

// 🐛 Escribes la variante pensando «todo lo de .btn y, encima, rojo».
.btn-danger {
  @extend .btn;
  background: #b91c1c;
}

// …y la regla base está DESPUÉS (más abajo en el archivo, o en un módulo
// cargado más tarde). @extend no copia nada aquí arriba: añade .btn-danger a
// la regla de .btn, AHÍ ABAJO. En compiled.css:
//   .btn-danger { background: #b91c1c; }
//   .btn, .btn-danger { …; background: #475569; }   ← misma especificidad,
//                                                      aparece después: GANA
.btn {
  padding: 8px 16px;
  border: 0;
  border-radius: 6px;
  background: #475569;
  color: #ffffff;
  font: inherit;
}

// ✅ Con un mixin, las declaraciones se copian donde está el @include, y lo que
// escribes después en la misma regla gana, como esperas.
@mixin btn-base {
  padding: 8px 16px;
  border: 0;
  border-radius: 6px;
  background: #475569;
  color: #ffffff;
  font: inherit;
}

.btn-danger-fixed {
  @include btn-base;
  background: #b91c1c;
}
```
