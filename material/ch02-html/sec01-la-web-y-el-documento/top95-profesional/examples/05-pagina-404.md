---
example_description: "Página de error 404: por qué no puede usar rutas relativas y qué código debe enviar el servidor"
example_tags: "profesional|404|http|rutas|absolutas"
example_stage: professional
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
  <title>Página no encontrada (error 404) · Café Aroma</title>
  <meta name="description" content="La dirección que buscas no existe o ha cambiado de sitio. Desde aquí puedes volver a la tienda.">
  <!-- Que los buscadores no guarden esta página en sus resultados -->
  <meta name="robots" content="noindex">
  <!-- Desde la raíz del sitio: funciona en cualquier dirección donde se sirva la 404 -->
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">

  <!-- Una página 404 se sirve en CUALQUIER dirección que no exista: /cafes/kenia,
       /blog/2026/10/receta-borrada… Una ruta relativa se resolvería distinto en cada una
       (mira la consola), así que en producción todo va con URL absoluta o desde la raíz.
       Este documento lleva sus estilos dentro para no depender de ninguna ruta. -->
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.6; color: #1f2937; }
    main { max-width: 36rem; margin: 4rem auto; padding-inline: 1rem; }
    .status-code { margin: 0; font-size: 4rem; font-weight: 800; color: #b45309; }
    a { color: #1d4ed8; }
    :focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px; }
  </style>

  <!-- Excepción didáctica: la auditoría del curso sí usa una ruta relativa, porque la
       vista previa vive en una subcarpeta del servidor de LearnWeb. -->
  <script defer src="js/audit.js"></script>
</head>
<body>
  <!-- Recuerda: el servidor debe enviar esta página con el código 404, no con 200.
       Si responde 200 («soft 404»), los buscadores la tratan como una página normal. -->
  <main id="content">
    <p class="status-code">404</p>
    <h1>No encontramos esta página</h1>
    <p>Puede que la dirección esté mal escrita o que la página haya cambiado de sitio. Nuestros cafés siguen aquí:</p>
    <ul>
      <li><a href="https://cafe-aroma.example/">Ir a la portada de la tienda</a></li>
      <li><a href="https://cafe-aroma.example/cafes/">Ver todos los cafés</a></li>
      <li><a href="mailto:hola@cafe-aroma.example?subject=Enlace%20roto">Avisarnos del enlace roto</a></li>
    </ul>
  </main>

  <script>
    // Por qué una 404 no puede usar rutas relativas (JavaScript solo para mirar):
    // la misma ruta, resuelta en dos direcciones que no existen
    const missingPages = [
      'https://cafe-aroma.example/cafes/kenia',
      'https://cafe-aroma.example/blog/2026/10/receta-borrada',
    ];
    for (const page of missingPages) {
      console.log('404 servida en', page);
      console.log('   «css/base.css»  →', new URL('css/base.css', page).href);
      console.log('   «/css/base.css» →', new URL('/css/base.css', page).href);
    }
  </script>
</body>
</html>
```
