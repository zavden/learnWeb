---
example_description: "Radiografía: un documento completo que se examina a sí mismo, lección a lección"
example_tags: "integracion|documento|url|parser|render"
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
  <title>Radiografía de un documento · Web a fondo</title>
  <meta name="description" content="Un documento completo que se inspecciona a sí mismo.">
  <!-- Rutas relativas: se resuelven contra la URL de este documento -->
  <link rel="stylesheet" href="css/styles.css">
  <script defer src="js/app.js"></script>
</head>
<body>
  <div class="site-header">
    <img src="img/logo.svg" alt="Web a fondo" width="160" height="60">
  </div>
  <h1>Radiografía de un documento</h1>
  <p>Este documento junta las cinco lecciones del módulo. El script del final lo examina por dentro: abre la consola.</p>
  <p class="pattern">El fondo de esta caja lo pidió el CSS, no el HTML.</p>

  <script>
    // JavaScript solo para mirar dentro (se estudia más adelante)
    console.log('— 1. La web —');
    console.log('URL del documento →', location.href);
    console.log('el logo se pidió a →', document.images[0].src);

    console.log('— 2. El documento —');
    console.log('modo / codificación / idioma →',
      document.compatMode, '/', document.characterSet, '/', document.documentElement.lang);
    console.log('título →', document.title);

    console.log('— 3. Elementos y atributos —');
    console.log('alt del logo →', document.images[0].alt);
    console.log('elementos hijos del body →', document.body.children.length);

    console.log('— 4. El parser —');
    console.log('readyState →', document.readyState, '(el parser sigue leyendo: app.js aún espera)');

    console.log('— 5. Los píxeles —');
    console.log('display del head →', getComputedStyle(document.head).display,
      '| font-size del h1 →', getComputedStyle(document.querySelector('h1')).fontSize);
  </script>
</body>
</html>
```
