---
example_description: "Un buscador con GET dentro de search: sugerencias con datalist, filtros con select, casilla y radio, y la URL que se puede compartir"
example_tags: "integracion|formularios|get|search|datalist|select|query"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<!-- Busca con los valores iniciales, luego elige «Cualquier formato» y desmarca la casilla.
     Compara las URL: un select vacío envía format= (vacío); una casilla sin marcar no envía nada. -->
<h1>Catálogo de la biblioteca</h1>

<!-- search: la región de búsqueda de la página. GET: el resultado tiene su propia URL. -->
<search>
  <form action="https://biblioteca.example/catalogo/buscar" method="get">
    <p>
      <label for="query">Título, autor o tema</label>
      <!-- enterkeyhint="search": en el móvil, la tecla Intro dice «Buscar» -->
      <input id="query" name="q" type="search" list="popular" value="huerto en casa" required enterkeyhint="search">
      <!-- Sugerencias, no una lista cerrada: se puede buscar cualquier otra cosa -->
      <datalist id="popular">
        <option value="huerto en casa"></option>
        <option value="compostaje"></option>
        <option value="plantas aromáticas"></option>
        <option value="Begoña Díaz"></option>
      </datalist>
    </p>

    <p>
      <label for="format">Formato</label>
      <select id="format" name="format">
        <option value="">Cualquier formato</option>
        <option value="book" selected>Libro en papel</option>
        <option value="ebook">Libro electrónico</option>
        <option value="audiobook">Audiolibro</option>
      </select>
    </p>

    <fieldset>
      <legend>Ordenar por</legend>
      <label><input type="radio" name="sort" value="relevance" checked> Relevancia</label>
      <label><input type="radio" name="sort" value="newest"> Más recientes</label>
    </fieldset>

    <!-- value="1": así la URL dice available=1 en vez de available=on -->
    <p><label><input type="checkbox" name="available" value="1" checked> Solo los disponibles ahora</label></p>

    <button type="submit">Buscar</button>
  </form>
</search>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  max-width: 36rem;
}

/* search todavía no tiene estilos propios en todos los navegadores (display: capítulo de CSS) */
search {
  display: block;
}

legend {
  font-weight: 700;
}

:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```
