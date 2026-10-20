---
example_description: "Con method=\"get\" los pares nombre/valor viajan en la URL, después de «?»: los espacios se codifican como + y las tildes con %"
example_tags: "html|formularios|get|query|url"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<!-- method="get": el navegador construye la URL de action + «?» + los pares codificados, y la
     pide. La consola muestra esa URL: es la que verías en la barra de direcciones.
     Cambia el formato o el texto y vuelve a enviar. -->
<form action="https://biblioteca.example/buscar" method="get">
  <p>
    <label for="query">Autor o título</label>
    <input id="query" name="q" type="search" value="Begoña Díaz">
  </p>
  <p>
    <label for="format">Formato</label>
    <select id="format" name="format">
      <option value="book">Libro en papel</option>
      <option value="ebook">Libro electrónico</option>
      <option value="audiobook">Audiolibro</option>
    </select>
  </p>
  <button type="submit">Buscar</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}
```
