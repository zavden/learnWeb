---
example_description: "La página de un episodio de podcast: reproductor con dos formatos y preload=\"none\", transcripción, notas con la duración de cada parte en time, iconos de un sprite, feed RSS en el head y JSON-LD PodcastEpisode"
example_tags: "profesional|audio|podcast|transcripcion|time|sprite|rss|json-ld"
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
  <title>Ep. 18: El salterio, de las catedrales al folk · Cuerdas pulsadas</title>
  <meta name="description" content="Episodio 18 de Cuerdas pulsadas: la historia del salterio con la luthier Inés Arrieta, de los pórticos románicos a los grupos de folk actuales.">
  <link rel="canonical" href="https://cuerdaspulsadas.example/episodios/18-salterio/">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <!-- 1. El feed del podcast: así lo encuentran las aplicaciones de podcasts y los lectores RSS -->
  <link rel="alternate" type="application/rss+xml" title="Cuerdas pulsadas (RSS)" href="https://cuerdaspulsadas.example/feed.xml">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Ep. 18: El salterio, de las catedrales al folk">
  <meta property="og:url" content="https://cuerdaspulsadas.example/episodios/18-salterio/">
  <meta property="og:image" content="https://cuerdaspulsadas.example/img/ep18-portada.jpg">
  <meta property="og:audio" content="https://cuerdaspulsadas.example/audio/18-salterio.mp3">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    "episodeNumber": 18,
    "name": "El salterio, de las catedrales al folk",
    "datePublished": "2026-10-06",
    "timeRequired": "PT41M",
    "partOfSeries": { "@type": "PodcastSeries", "name": "Cuerdas pulsadas", "url": "https://cuerdaspulsadas.example/" },
    "associatedMedia": { "@type": "MediaObject", "contentUrl": "https://cuerdaspulsadas.example/audio/18-salterio.mp3" }
  }
  </script>
  <link rel="stylesheet" href="css/base.css">
  <script defer src="js/media-audit.js"></script>
</head>
<body>
  <!-- 2. El sprite de iconos: cada uno se dibuja una vez y se reutiliza con use -->
  <svg class="sprite" aria-hidden="true">
    <symbol id="icon-download" viewBox="0 0 24 24">
      <path d="M12 3 V15 M6 10 L12 16 L18 10 M4 20 H20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </symbol>
    <symbol id="icon-rss" viewBox="0 0 24 24">
      <circle cx="5" cy="19" r="2" fill="currentColor"/>
      <path d="M4 11 A9 9 0 0 1 13 20 M4 4 A16 16 0 0 1 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </symbol>
    <symbol id="icon-clock" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M12 7 V12 L15 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </symbol>
  </svg>

  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://cuerdaspulsadas.example/">Cuerdas pulsadas</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://cuerdaspulsadas.example/episodios/" aria-current="page">Episodios</a></li>
        <li><a href="https://cuerdaspulsadas.example/quienes-somos/">Quiénes somos</a></li>
        <li><a href="https://cuerdaspulsadas.example/apoyanos/">Apóyanos</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <p class="muted">Episodio 18 · <time datetime="2026-10-06">6 de octubre de 2026</time> ·
      <svg class="icon" aria-hidden="true"><use href="#icon-clock"/></svg> <time datetime="PT41M">41 minutos</time></p>
    <h1>El salterio, de las catedrales al folk</h1>
    <p class="lead">Hablamos con la luthier Inés Arrieta sobre el instrumento que tocan los ángeles de los pórticos románicos y que hoy vuelve a sonar en grupos de folk.</p>

    <!-- 3. El reproductor: la sintonía del programa, a modo de avance. preload="none": no se
         descarga nada hasta que alguien pulsa ▶. Opus primero; MP3 de respaldo. -->
    <h2>Escucha el avance</h2>
    <audio controls preload="none">
      <source src="media/melody.ogg" type="audio/ogg; codecs=opus">
      <source src="media/melody.mp3" type="audio/mpeg">
      <p>Tu navegador no reproduce audio. <a href="media/melody.mp3" download>Descarga el avance</a> (MP3, 95 KB).</p>
    </audio>
    <details>
      <summary>Transcripción del avance</summary>
      <p>Sintonía de Cuerdas pulsadas: una melodía punteada de ocho notas (do, mi, sol, do agudo, la, sol, mi, re) que suena tres veces, durante 12 segundos. No hay voz.</p>
    </details>

    <ul class="row">
      <li><a href="https://cuerdaspulsadas.example/audio/18-salterio.mp3" download><svg class="icon" aria-hidden="true"><use href="#icon-download"/></svg> Descargar el episodio completo (MP3, 38 MB)</a></li>
      <li><a href="https://cuerdaspulsadas.example/feed.xml"><svg class="icon" aria-hidden="true"><use href="#icon-rss"/></svg> Suscribirte por RSS</a></li>
    </ul>

    <!-- 4. Las partes del episodio completo: time con una duración (PT…) que las máquinas entienden -->
    <h2>En este episodio</h2>
    <ol>
      <li><time datetime="PT0M">0:00</time> · Presentación y sintonía.</li>
      <li><time datetime="PT2M30S">2:30</time> · Qué es un salterio: una caja de resonancia y muchas cuerdas.</li>
      <li><time datetime="PT11M5S">11:05</time> · Los salterios de piedra: cómo se reconstruye un instrumento a partir de una escultura.</li>
      <li><time datetime="PT24M40S">24:40</time> · En el taller de Inés: maderas, puentes y afinación.</li>
      <li><time datetime="PT35M15S">35:15</time> · El salterio en el folk de hoy y una despedida tocada en directo.</li>
    </ol>

    <h2>Transcripción completa</h2>
    <p>La transcripción completa del episodio, con quién habla en cada momento y los fragmentos musicales descritos, está en <a href="https://cuerdaspulsadas.example/episodios/18-salterio/transcripcion/">su propia página</a>.</p>

    <h2>Enlaces del episodio</h2>
    <ul>
      <li><a href="https://cuerdaspulsadas.example/invitadas/ines-arrieta/">Inés Arrieta, luthier</a></li>
      <li><a href="https://cuerdaspulsadas.example/episodios/17-zanfona/">Episodio anterior: la zanfona</a></li>
    </ul>
  </main>

  <footer class="site-footer">
    <p>Cuerdas pulsadas · Un podcast independiente sobre instrumentos de cuerda · <a href="https://cuerdaspulsadas.example/contacto/">Contacto</a></p>
  </footer>
</body>
</html>
```
