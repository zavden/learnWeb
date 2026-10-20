---
example_description: "En un envío GET, el navegador sustituye la query que ya tenía el action: los parámetros fijos van en campos ocultos"
example_tags: "html|formularios|get|query|hidden|bug"
example_stage: common-error
example_importance: useful
console: true
---

# HTML

```html
<!-- Envía los dos formularios y compara las URL de la consola. -->
<h2>❌ Parámetro en el action</h2>
<!-- 🐛 Con GET, la query del action (?lang=es) se SUSTITUYE por los pares del formulario -->
<form action="https://biblioteca.example/buscar?lang=es" method="get">
  <label for="query-bug">Buscar</label>
  <input id="query-bug" name="q" type="search" value="poesía">
  <button type="submit">Buscar</button>
</form>

<h2>✅ Parámetro en un campo oculto</h2>
<form action="https://biblioteca.example/buscar" method="get">
  <!-- type="hidden": no se ve ni se edita, pero viaja como cualquier otro campo.
       No es secreto: cualquiera puede verlo y cambiarlo con DevTools. -->
  <input type="hidden" name="lang" value="es">
  <label for="query-ok">Buscar</label>
  <input id="query-ok" name="q" type="search" value="poesía">
  <button type="submit">Buscar</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

h2 {
  font-size: 1.1rem;
}
```
