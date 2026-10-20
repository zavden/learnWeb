---
example_description: "La página de un evento: JSON-LD Event con lugar y precio, el programa con time, un mapa propio embebido con iframe (title, loading=\"lazy\"), el evento para el calendario (.ics) e iconos de un sprite"
example_tags: "profesional|evento|json-ld|iframe|loading|time|ics|sprite"
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
  <title>Jornada de puertas abiertas, 28 de noviembre · Huerto comunitario de Lavapiés</title>
  <meta name="description" content="Sábado 28 de noviembre, de 10:00 a 14:00: visitas guiadas al huerto, taller de semilleros y sorteo de parcelas. Entrada libre, sin inscripción.">
  <link rel="canonical" href="https://huertolavapies.example/puertas-abiertas/">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Jornada de puertas abiertas del huerto">
  <meta property="og:description" content="Sábado 28 de noviembre · 10:00 a 14:00 · Entrada libre">
  <meta property="og:url" content="https://huertolavapies.example/puertas-abiertas/">
  <meta property="og:image" content="https://huertolavapies.example/img/puertas-abiertas.jpg">
  <!-- 1. JSON-LD Event: fecha con su zona (+01:00, hora de Madrid en invierno), lugar con
       dirección postal, organizador y precio (0: gratis) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Jornada de puertas abiertas del huerto comunitario",
    "startDate": "2026-11-28T10:00:00+01:00",
    "endDate": "2026-11-28T14:00:00+01:00",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled",
    "location": {
      "@type": "Place",
      "name": "Huerto comunitario de Lavapiés",
      "address": { "@type": "PostalAddress", "streetAddress": "Calle del Olivar, 24", "postalCode": "28012", "addressLocality": "Madrid", "addressCountry": "ES" }
    },
    "organizer": { "@type": "Organization", "name": "Asociación Huerto de Lavapiés", "url": "https://huertolavapies.example/" },
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR", "availability": "https://schema.org/InStock" }
  }
  </script>
  <link rel="stylesheet" href="css/base.css">
  <script defer src="js/media-audit.js"></script>
</head>
<body>
  <svg class="sprite" aria-hidden="true">
    <symbol id="icon-calendar" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M3 10 H21 M8 3 V7 M16 3 V7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </symbol>
    <symbol id="icon-pin" viewBox="0 0 24 24">
      <path d="M12 2 C8 2 5 5 5 9 C5 14 12 22 12 22 C12 22 19 14 19 9 C19 5 16 2 12 2 Z" fill="currentColor"/>
      <circle cx="12" cy="9" r="2.5" fill="#ffffff"/>
    </symbol>
    <symbol id="icon-ticket" viewBox="0 0 24 24">
      <path d="M3 7 H21 V10 A2 2 0 0 0 21 14 V17 H3 V14 A2 2 0 0 0 3 10 Z" fill="none" stroke="currentColor" stroke-width="2"/>
    </symbol>
  </svg>

  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://huertolavapies.example/">Huerto comunitario de Lavapiés</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://huertolavapies.example/el-huerto/">El huerto</a></li>
        <li><a href="https://huertolavapies.example/agenda/" aria-current="page">Agenda</a></li>
        <li><a href="https://huertolavapies.example/parcelas/">Parcelas</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <h1>Jornada de puertas abiertas</h1>
    <p class="lead">Ven a conocer el huerto: quién lo cuida, qué se cultiva y cómo conseguir una parcela.</p>

    <!-- 2. Los datos clave, cada uno con su icono decorativo -->
    <ul class="card">
      <li><svg class="icon" aria-hidden="true"><use href="#icon-calendar"/></svg>
        <time datetime="2026-11-28T10:00+01:00">Sábado 28 de noviembre, de 10:00</time> a <time datetime="2026-11-28T14:00+01:00">14:00</time> (hora de Madrid)</li>
      <li><svg class="icon" aria-hidden="true"><use href="#icon-pin"/></svg> Calle del Olivar, 24 · Metro Lavapiés (línea 3)</li>
      <li><svg class="icon" aria-hidden="true"><use href="#icon-ticket"/></svg> Entrada libre, sin inscripción</li>
    </ul>
    <!-- 3. El evento en un archivo de calendario: se abre en Google Calendar, Outlook o Calendario -->
    <p><a class="button-link" href="open-day.ics" download>Añadir a mi calendario (.ics)</a></p>

    <h2>Programa</h2>
    <table>
      <caption>Actividades del sábado 28</caption>
      <thead><tr><th scope="col">Hora</th><th scope="col">Actividad</th><th scope="col">Dónde</th></tr></thead>
      <tbody>
        <tr><td><time datetime="10:00">10:00</time></td><td>Bienvenida y visita guiada</td><td>Entrada principal</td></tr>
        <tr><td><time datetime="11:00">11:00</time></td><td>Taller de semilleros para familias</td><td>Invernadero</td></tr>
        <tr><td><time datetime="12:30">12:30</time></td><td>Sorteo de cuatro parcelas libres</td><td>Plaza del compost</td></tr>
        <tr><td><time datetime="13:00">13:00</time></td><td>Mercado de trueque de semillas</td><td>Plaza del compost</td></tr>
      </tbody>
    </table>

    <h2>Cómo llegar</h2>
    <!-- 4. El mapa es una página propia (assets/embed/map.html): del mismo origen y de
         confianza, así que sin sandbox. title para los lectores de pantalla, width/height para
         reservar su hueco y loading="lazy" porque está al final de la página. -->
    <iframe src="embed/map.html" title="Mapa: cómo llegar al huerto comunitario"
            width="560" height="320" loading="lazy"></iframe>
    <p>El huerto está en la esquina de la calle del Olivar con la calle de la Fe, a dos minutos del metro Lavapiés. Acceso sin escalones por la calle de la Fe.</p>
  </main>

  <footer class="site-footer">
    <p>Asociación Huerto de Lavapiés · <a href="mailto:hola@huertolavapies.example">hola@huertolavapies.example</a></p>
  </footer>
</body>
</html>
```
