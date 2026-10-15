---
example_description: "El esqueleto mínimo de un documento HTML, pieza a pieza"
example_tags: "html|doctype|head|body|meta"
example_stage: minimal
example_importance: critical
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<!-- 1. DOCTYPE: «esto es HTML moderno». Sin él, el navegador entra en quirks mode. -->
<html lang="es">
  <!-- 2. html: la raíz de todo. lang = idioma del contenido. -->
  <head>
    <!-- 3. head: información SOBRE el documento. Nada de lo que hay aquí se dibuja. -->
    <meta charset="utf-8">
    <!-- charset: cómo convertir los bytes del archivo en caracteres -->
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- viewport: en el móvil, «usa el ancho real de la pantalla» -->
    <title>Mi primera página</title>
    <!-- title: el texto de la pestaña, del historial y de los buscadores -->
  </head>
  <body>
    <!-- 4. body: todo lo que se ve -->
    <h1>Hola, documento</h1>
    <p>Este es el esqueleto que comparten todas las páginas HTML.</p>

    <script>
      // Unas líneas de JavaScript solo para enseñar lo que entendió el navegador
      console.log('DOCTYPE      →', document.doctype.name);
      console.log('modo         →', document.compatMode);  // CSS1Compat = modo estándar
      console.log('codificación →', document.characterSet);
      console.log('idioma       →', document.documentElement.lang);
      console.log('título       →', document.title);
    </script>
  </body>
</html>
```
