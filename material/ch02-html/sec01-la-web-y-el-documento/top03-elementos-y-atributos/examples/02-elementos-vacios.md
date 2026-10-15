---
example_description: "Elementos vacíos (void): br, hr, input… no tienen contenido ni cierre"
example_tags: "html|void|br|input|sintaxis"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<!-- Los elementos vacíos (void) no pueden tener contenido, así que no llevan cierre.
     Son: area, base, br, col, embed, hr, img, input, link, meta, source, track, wbr. -->
<p id="lines">Primera línea<br>segunda línea<br />tercera línea</p>

<hr>

<p>
  <label>Nombre: <input type="text" value="Ada"></label>
</p>

<!-- La barra final de <br /> viene de XHTML: en HTML se permite y se IGNORA.
     <br> y <br /> producen exactamente lo mismo. -->
```

# JavaScript

```javascript
// innerHTML (JavaScript) enseña el contenido del párrafo tal como quedó en el DOM:
// los dos <br> son idénticos, la barra no ha llegado al documento.
console.log(document.querySelector('#lines').innerHTML);
```
