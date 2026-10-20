---
example_description: "hidden, tabindex y contenteditable: ocultar, enfocar y editar sin JavaScript"
example_tags: "atributos|globales|hidden|tabindex|contenteditable"
example_stage: minimal
example_importance: useful
console: true
---

# HTML

```html
<!-- hidden: el elemento está en el DOM, pero no se dibuja ni lo lee un lector de pantalla -->
<p hidden>No me ves, pero existo.</p>

<!-- tabindex="0": un div no recibe el foco del teclado; con tabindex="0", sí.
     Haz clic en la vista previa y pulsa Tab: verás el contorno de foco sobre la caja. -->
<div class="box" tabindex="0">Puedo recibir el foco con Tab</div>

<!-- contenteditable: el usuario puede editar el contenido directamente -->
<p class="box" contenteditable="true">Haz clic y escribe aquí: soy editable.</p>

<!-- Un botón ya es enfocable por naturaleza: no necesita tabindex -->
<button type="button">Botón (enfocable de serie)</button>
```

# CSS

```css
/* Solo para ver las cajas (CSS: capítulo 3) */
.box {
  margin-block: 8px;
  padding: 8px;
  border: 1px dashed #666;
}
```

# JavaScript

```javascript
// El párrafo con hidden sigue en el DOM: JavaScript lo encuentra y lee su texto
console.log('párrafo hidden →', document.querySelector('[hidden]').textContent);
```
