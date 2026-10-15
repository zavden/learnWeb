---
example_description: "La vida de una página: cada script, defer, módulo y evento en su momento exacto"
example_tags: "integracion|parser|defer|module|readystate|load"
example_stage: intermediate
example_importance: important
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>La vida de una página</title>
  <script>
    // log() apunta cada momento junto con el readyState del documento.
    // (Funciones, plantillas de texto y eventos son JavaScript que verás más adelante.)
    function log(step) {
      console.log(`${document.readyState.padEnd(11)} · ${step}`);
    }
    log('1. script en el head: el body aún no existe');
    document.addEventListener('DOMContentLoaded', () => log('6. DOMContentLoaded: DOM completo'));
    addEventListener('load', () => log('7. load: imágenes y hojas de estilo también descargadas'));
  </script>
  <link rel="stylesheet" href="css/styles.css">
  <!-- defer: se descarga ya y espera al final del HTML -->
  <script defer src="js/deferred.js"></script>
  <!-- Un módulo se comporta como defer, aunque esté escrito aquí mismo -->
  <script type="module">
    log('5. script type="module": se ejecuta como si tuviera defer');
  </script>
</head>
<body>
  <h1>La vida de una página</h1>
  <script>log('2. a mitad del body: solo existe lo que hay encima');</script>
  <img src="img/photo.svg" alt="Ilustración de unas montañas bajo el sol" width="320" height="180">
  <script>log('3. último script del body: la imagen quizá siga descargándose');</script>
</body>
</html>
```
