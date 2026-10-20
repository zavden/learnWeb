---
example_description: "Aunque no lo escribas, el parser mete tus filas en un tbody: el selector table > tr no encuentra nada"
example_tags: "html|tablas|tbody|parser|css|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<table id="prices">
  <tr><td>Café</td><td>1,40 €</td></tr>
  <tr><td>Té</td><td>1,20 €</td></tr>
</table>
<p>❌ Las filas deberían tener fondo amarillo (table &gt; tr) y no lo tienen. ✅ Con table &gt; tbody &gt; tr sí.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

td {
  padding: 4px 10px;
  border: 1px solid #94a3b8;
}

/* 🐛 No coincide con nada: en el DOM, los tr NO son hijos directos de table. */
table > tr {
  background: #fde68a;
}

/* ✅ Esto sí coincide (o simplemente `tr`, sin combinador de hijo). */
table > tbody > tr {
  outline: 2px solid #16a34a;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Mostramos el DOM que construyó el parser.
const table = document.getElementById('prices');
console.log('hijos de <table> →', [...table.children].map((child) => child.tagName));   // ['TBODY']
console.log(table.outerHTML);
```
