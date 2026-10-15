---
example_description: "Con method=\"post\" los mismos pares viajan en el cuerpo de la petición, codificados como application/x-www-form-urlencoded"
example_tags: "html|formularios|post|cuerpo|enctype|urlencoded"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<!-- method="post": la URL no cambia; los pares van en el CUERPO de la petición.
     (onsubmit ejecuta JavaScript al enviar; los eventos llegan en el capítulo de JavaScript.) -->
<form action="https://biblioteca.example/actividades/comentarios" method="post" onsubmit="showRequest(this)">
  <p>
    <label for="author">Tu nombre</label>
    <input id="author" name="author" value="Lucía">
  </p>
  <p>
    <label for="comment">Comentario</label><br>
    <!-- textarea: un campo de varias líneas (lo verás en la lección de controles) -->
    <textarea id="comment" name="comment" rows="3" cols="40">¡Me encantó la charla! Volveré el jueves.</textarea>
  </p>
  <button type="submit">Publicar comentario</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Escribimos la petición que haría el
// navegador: la línea de petición, la cabecera Content-Type y, tras una línea en blanco, el cuerpo.
function showRequest(form) {
  console.log(`POST ${new URL(form.action).pathname} HTTP/1.1`);
  // form.enctype vale application/x-www-form-urlencoded aunque no escribas el atributo
  console.log('Content-Type:', form.enctype);
  console.log('');
  // El cuerpo usa la misma codificación que la query de un GET
  console.log(new URLSearchParams(new FormData(form)).toString());
}
```
