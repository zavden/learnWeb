---
example_description: "enctype=\"multipart/form-data\" divide el cuerpo en partes separadas por una frontera: es la única forma de enviar el contenido de un archivo"
example_tags: "html|formularios|enctype|multipart|archivos|post"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<!-- Para enviar ARCHIVOS hacen falta las dos cosas: method="post" y
     enctype="multipart/form-data". Con el enctype por defecto solo viajaría el NOMBRE del archivo.
     Envíalo sin elegir archivo y luego con un archivo de texto pequeño (.txt, .csv).
     (onsubmit ejecuta JavaScript al enviar; los eventos llegan en el capítulo de JavaScript.) -->
<form action="https://huerta.example/parcelas/adjuntos" method="post" enctype="multipart/form-data"
      onsubmit="showBody(this)">
  <p>
    <label for="title">Descripción</label>
    <input id="title" name="title" value="Plano del huerto">
  </p>
  <p>
    <label for="attachment">Archivo</label>
    <input id="attachment" name="attachment" type="file">
  </p>
  <button type="submit">Subir</button>
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
// Adelanto: JavaScript se explica en su capítulo. new Response(datos) le pide al navegador el
// cuerpo EXACTO que enviaría, con su cabecera Content-Type (Response pertenece a fetch, que
// verás en el capítulo de red). async/await espera a que el cuerpo esté listo.
async function showBody(form) {
  const prepared = new Response(new FormData(form));
  const body = await prepared.text();
  console.log('Content-Type:', prepared.headers.get('content-type'));
  // Si eliges una imagen, sus bytes saldrán como caracteres raros: recortamos el texto
  console.log(body.length > 800 ? `${body.slice(0, 800)}… (${body.length} caracteres en total)` : body);
}
```
