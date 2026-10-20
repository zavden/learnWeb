---
example_description: "Un formulario de búsqueda completo: action dice adónde, method cómo, y cada campo con name aporta un par nombre/valor"
example_tags: "html|formularios|form|action|method|name"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<!-- Un formulario completo: action (adónde se envía), method (cómo) y un campo con name.
     Pulsa «Buscar», o Enter dentro del campo: el formulario se envía.
     En una web real, el navegador iría a la URL de action y mostraría la página de resultados
     que devolviera el servidor. La vista previa bloquea esa navegación y escribe en la consola
     lo que se habría enviado. -->
<form action="https://biblioteca.example/buscar" method="get">
  <!-- label + id: el nombre del campo (lo verás a fondo en la lección de controles) -->
  <label for="query">Buscar en el catálogo</label>
  <!-- name="q": la CLAVE con la que el servidor recibirá lo que escribas -->
  <input id="query" name="q" type="search" value="huerto urbano">
  <!-- type="submit": el botón que envía el formulario -->
  <button type="submit">Buscar</button>
</form>

<p class="hint">Cambia el texto y vuelve a enviar: el valor que viaja es el que hay escrito en ese momento, no el del atributo <code>value</code>.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.hint {
  color: #475569;
  font-size: 0.9rem;
}
```
