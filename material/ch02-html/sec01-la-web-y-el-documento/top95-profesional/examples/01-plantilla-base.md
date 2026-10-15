---
example_description: "La plantilla base: un documento de producción con cada línea del head explicada"
example_tags: "profesional|plantilla|head|metadatos|defer"
example_stage: professional
example_importance: critical
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<!-- 1. Modo estándar. Siempre la primera línea. -->
<html lang="es">
<!-- 2. Idioma del contenido: lectores de pantalla, guiones, traducción. -->
<head>
  <meta charset="utf-8">
  <!-- 3. La codificación, lo primero del head: así cae en los primeros 1024 bytes. -->
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- 4. En el móvil, maquetar al ancho real de la pantalla (y sin bloquear el zoom). -->

  <title>Web a fondo · Curso de desarrollo web desde cero</title>
  <!-- 5. De lo concreto a lo general: es lo que se lee en la pestaña y en el buscador. -->
  <meta name="description" content="Curso en español para entender qué hace el navegador y por qué: HTML, CSS, JavaScript, TypeScript, WebAssembly y WebGPU.">
  <!-- 6. El resumen que suelen mostrar los buscadores bajo el título. -->

  <link rel="canonical" href="https://webafondo.example/">
  <!-- 7. La URL «oficial» de esta página. Absoluta: la leen otros sitios. -->
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="img/apple-touch-icon.png">
  <meta name="theme-color" content="#1d4ed8">
  <!-- 8. Icono de la pestaña, icono al guardar en la pantalla de inicio y color de la
       barra del navegador en el móvil. Pulsa ↗ en la vista previa para ver el icono. -->

  <meta property="og:type" content="website">
  <meta property="og:title" content="Web a fondo">
  <meta property="og:description" content="Entiende qué hace el navegador y por qué.">
  <meta property="og:url" content="https://webafondo.example/">
  <meta property="og:image" content="https://webafondo.example/img/og-home.png">
  <meta property="og:locale" content="es_ES">
  <!-- 9. Open Graph: la tarjeta que aparece al compartir el enlace en redes y mensajería
       (módulo 4). Sus URLs son absolutas porque las lee otro servidor, no este documento. -->

  <link rel="stylesheet" href="css/base.css">
  <!-- 10. Las hojas de estilo, en el head: el navegador no pinta hasta tenerlas. -->
  <script defer src="js/audit.js"></script>
  <!-- 11. Scripts con defer: se descargan en paralelo y se ejecutan con el DOM completo.
       (audit.js es la herramienta del curso que revisa este documento: mira la consola.) -->
</head>
<body>
  <!-- header, nav, main y footer dan nombre a cada zona de la página (los verás en el
       módulo 2). El primer enlace permite a quien usa teclado saltar directo al contenido. -->
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <!-- ./ es «la carpeta de este documento»: la portada del sitio, esté donde esté publicado -->
    <a href="./"><img src="img/logo.svg" alt="Web a fondo, inicio" width="200" height="48"></a>
  </header>

  <main id="content">
    <h1>Aprende cómo funciona la web, de verdad</h1>
    <p>Un curso para quien ya programa un poco (por ejemplo, en Python) y quiere entender qué hace el navegador con cada línea que escribe: cómo pide los archivos, cómo construye el documento y cómo lo convierte en píxeles.</p>

    <h2 id="syllabus">Qué vas a aprender</h2>
    <ul>
      <li>HTML: el documento, su significado y sus formularios.</li>
      <li>CSS y Sass: la cascada, las cajas, Flexbox, Grid y las animaciones.</li>
      <li>JavaScript y TypeScript: el lenguaje, el DOM, los eventos y la red.</li>
      <li>Rumbo a WebAssembly y WebGPU: datos binarios, workers y la GPU.</li>
    </ul>
    <p><a href="#syllabus">Ver el temario completo</a></p>
  </main>

  <footer class="site-footer">
    <p>© 2026 Web a fondo · Escríbenos a <a href="mailto:hola@webafondo.example">hola@webafondo.example</a></p>
  </footer>
</body>
</html>
```
