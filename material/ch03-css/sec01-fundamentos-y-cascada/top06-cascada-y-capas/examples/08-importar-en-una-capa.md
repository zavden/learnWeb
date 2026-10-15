---
example_description: "@import con layer() mete una hoja ajena en una capa: tu CSS sin capa le gana aunque sus selectores sean mucho más específicos"
example_tags: "css|cascada|layer|import"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<div id="app">
  <div class="toolbar">
    <button type="button" class="btn">Guardar</button>
  </div>
</div>
<p>La librería (<code>library.css</code>, en <code>assets/</code>) pinta el botón de rojo con
  <code>#app .toolbar .btn</code> → (1, 2, 0). Tu <code>.btn</code> → (0, 1, 0) lo pinta de verde… y gana.</p>
```

# CSS

```css
/* @import tiene que ir lo PRIMERO de la hoja.
   layer(library) mete TODA la hoja importada en una capa llamada «library». */
@import url("library.css") layer(library);

/* Tu CSS, sin capa: tiene más prioridad que cualquier capa (ejemplo 04),
   así que gana aunque su selector sea muchísimo más débil. */
.btn {
  background: #bbf7d0;
}

/* Lo que no declaras (padding, border…) lo sigue poniendo la librería.
   Así puedes usar CSS ajeno sin pelearte con su especificidad. */

body {
  font-family: system-ui, sans-serif;
}
```
