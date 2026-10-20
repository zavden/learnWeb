---
example_description: "Página de un evento: fechas y horas con time, tarjeta para redes y color del navegador"
example_tags: "profesional|evento|time|open-graph|theme-color"
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
  <title>Jornada Web a fondo 2026 · 21 de noviembre en Valencia</title>
  <meta name="description" content="Una jornada gratuita sobre cómo funciona el navegador: del parser de HTML a WebGPU. Sábado 21 de noviembre de 2026 en Valencia, con aforo limitado.">
  <link rel="canonical" href="https://webafondo.example/jornada-2026/">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="img/apple-touch-icon.png">
  <!-- Color de la barra del navegador en el móvil -->
  <meta name="theme-color" content="#1d4ed8">

  <!-- La tarjeta al compartir el enlace (módulo 4): imagen grande y textos propios -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="Jornada Web a fondo 2026">
  <meta property="og:description" content="21 de noviembre · Valencia · Entrada gratuita">
  <meta property="og:url" content="https://webafondo.example/jornada-2026/">
  <meta property="og:image" content="https://webafondo.example/jornada-2026/cartel.png">
  <meta name="twitter:card" content="summary_large_image">

  <link rel="stylesheet" href="css/base.css">
  <script defer src="js/audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <img src="img/logo.svg" alt="Web a fondo" width="200" height="48">
  </header>

  <main id="content">
    <h1>Jornada Web a fondo 2026</h1>
    <!-- datetime: la fecha y la hora exactas, con su zona horaria (+01:00 en noviembre) -->
    <p><strong><time datetime="2026-11-21T09:30+01:00">Sábado 21 de noviembre de 2026, a las 9:30</time></strong> · Centro Cultural La Rambleta, Valencia · Entrada gratuita, aforo de 120&nbsp;personas.</p>
    <p>Un día para mirar dentro del navegador: cómo lee el HTML, cómo pinta los píxeles y qué cambia cuando la GPU entra en juego. Para quien ya programa y quiere entender lo que pasa debajo.</p>
    <p><a href="mailto:jornada@webafondo.example?subject=Inscripci%C3%B3n%20Jornada%202026">Inscríbete por correo</a></p>

    <h2 id="schedule">Programa</h2>
    <ul>
      <li><time datetime="09:30">9:30</time> · Acreditaciones y café</li>
      <li><time datetime="10:00">10:00</time> · «El parser nunca falla», Marta Ibáñez</li>
      <li><time datetime="11:00">11:00</time> · «Del DOM a los píxeles», Joan Ferrer</li>
      <li><time datetime="12:30">12:30</time> · Taller: depurar con DevTools</li>
      <li><time datetime="14:00">14:00</time> · «Primeros pasos con WebGPU», Aitana Gil</li>
    </ul>

    <h2 id="accessibility">Accesibilidad</h2>
    <p>La sala es accesible en silla de ruedas y todas las charlas tendrán subtitulado en directo e intérprete de lengua de signos. Si necesitas otra adaptación, indícalo al inscribirte.</p>
  </main>

  <footer class="site-footer">
    <p>© 2026 Web a fondo · <a href="#schedule">Programa</a> · <a href="#accessibility">Accesibilidad</a></p>
  </footer>
</body>
</html>
```
