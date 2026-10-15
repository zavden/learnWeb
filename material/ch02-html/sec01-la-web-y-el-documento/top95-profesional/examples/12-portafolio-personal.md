---
example_description: "Portafolio personal: perfil verificable con rel=\"me\", retrato accesible y enlaces externos absolutos"
example_tags: "profesional|portafolio|open-graph|rel-me|img"
example_stage: professional
example_importance: useful
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Lucía Romero · Desarrolladora front-end en Bilbao</title>
  <meta name="description" content="Desarrolladora front-end especializada en accesibilidad y rendimiento web. Proyectos, charlas y contacto.">
  <link rel="canonical" href="https://luciaromero.example/">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">

  <meta property="og:type" content="profile">
  <meta property="og:title" content="Lucía Romero · Desarrolladora front-end">
  <meta property="og:url" content="https://luciaromero.example/">
  <meta property="og:image" content="https://luciaromero.example/img/retrato-1200x630.jpg">
  <!-- rel="me": «este perfil también soy yo». Las redes que lo admiten muestran el
       enlace como verificado si el perfil enlaza de vuelta a esta página. -->
  <link rel="me" href="https://social.example/@luciaromero">

  <link rel="stylesheet" href="css/base.css">
  <script defer src="js/audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p><strong>Lucía Romero</strong> · <a href="#projects">Proyectos</a> · <a href="#contact">Contacto</a></p>
  </header>

  <main id="content">
    <!-- El alt describe a la persona como lo haría alguien que la presenta, sin repetir el h1 -->
    <img src="img/portrait.svg" alt="Ilustración de Lucía Romero: una silueta sobre un círculo lila" width="240" height="240">
    <h1>Hola, soy Lucía</h1>
    <p>Desarrollo interfaces web rápidas y accesibles desde <time datetime="2017">2017</time>. Antes de escribir CSS, me aseguro de que el HTML diga exactamente lo que es cada cosa: el resto sale mucho más fácil.</p>

    <h2 id="projects">Proyectos</h2>
    <ul>
      <!-- Enlaces a otros sitios: URL absoluta y completa, con https:// -->
      <li><a href="https://biblioteca-bilbao.example/">Catálogo de la biblioteca municipal</a>: rediseño accesible, con una puntuación de accesibilidad de 100 en Lighthouse.</li>
      <li><a href="https://horarios-metro.example/">Horarios del metro</a>: una página de 40&nbsp;kB que carga en menos de 1&nbsp;s con 3G.</li>
      <li><a href="https://webafondo.example/jornada-2026/">Ponente en la Jornada Web a fondo 2026</a>: «Del DOM a los píxeles».</li>
    </ul>

    <h2 id="contact">Contacto</h2>
    <p>¿Tienes un proyecto en mente? Escríbeme a <a href="mailto:hola@luciaromero.example">hola@luciaromero.example</a> o encuéntrame en <a href="https://social.example/@luciaromero" rel="me">social.example</a>.</p>
  </main>

  <footer class="site-footer">
    <p>© 2026 Lucía Romero · Esta web no usa cookies ni rastreadores.</p>
  </footer>
</body>
</html>
```
