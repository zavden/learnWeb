---
example_description: "Los comentarios HTML no se anidan: el primer cierre los termina"
example_tags: "html|comentarios|parser|bug"
example_stage: common-error
example_importance: useful
console: true
---

# HTML

```html
<!-- Esto es un comentario: el navegador no lo dibuja, pero cualquiera puede leerlo
     con «Ver código fuente». No guardes secretos en comentarios. -->

<!-- 🐛 Los comentarios NO se anidan. Abajo intentamos comentar un bloque que ya
     contenía un comentario: el PRIMER cierre que aparece (el del comentario interior)
     termina el comentario exterior, y el resto vuelve a ser HTML visible. -->
<div id="demo">
  <p>Antes del bloque comentado.</p>
  <!-- inicio del bloque comentado
  <!-- comentario interior -->
  <p>❌ Este párrafo debería estar comentado… y se ve.</p>
  -->
  <p>Después del bloque.</p>
</div>
```

# JavaScript

```javascript
// Los comentarios SÍ están en el DOM, como nodos de comentario. Recorremos los nodos
// de #demo y mostramos el texto de cada comentario (childNodes y nodeType: capítulo del DOM).
for (const node of document.querySelector('#demo').childNodes) {
  if (node.nodeType === Node.COMMENT_NODE) {
    console.log('comentario →', JSON.stringify(node.data));
  }
}
// ✅ Solución: quita el comentario interior antes de comentar el bloque.
```
