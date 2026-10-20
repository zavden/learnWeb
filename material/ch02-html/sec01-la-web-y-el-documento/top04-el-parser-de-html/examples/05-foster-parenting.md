---
example_description: "Foster parenting: lo que no es parte de una tabla sale fuera, delante de ella"
example_tags: "parser|tablas|foster-parenting|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<!-- 🐛 Dentro de una tabla, entre las filas, solo pueden ir partes de tabla (caption,
     thead, tbody, tr, td…). Si el parser encuentra texto u otro elemento suelto ahí,
     lo SACA de la tabla y lo coloca justo DELANTE de ella. Se llama «foster parenting»
     (adopción): la tabla no puede ser su madre, así que le busca otra. -->
<div id="demo">
  <table>
    <tr><td>Fila 1</td></tr>
    <p>❌ Este párrafo lo escribí entre la fila 1 y la fila 2…</p>
    <tr><td>Fila 2</td></tr>
  </table>
</div>

<!-- ✅ Lo que pertenece a la tabla va dentro de una celda; lo demás, fuera de ella -->
```

# CSS

```css
/* Bordes solo para ver la tabla (las tablas se estudian en el módulo 2) */
td {
  border: 1px solid #555;
  padding: 4px 8px;
}
```

# JavaScript

```javascript
// El párrafo está ANTES de la tabla en el DOM. Fíjate también en el tbody,
// que nadie escribió: el parser lo crea siempre que una fila no está dentro de uno.
console.log(document.querySelector('#demo').innerHTML);
```
