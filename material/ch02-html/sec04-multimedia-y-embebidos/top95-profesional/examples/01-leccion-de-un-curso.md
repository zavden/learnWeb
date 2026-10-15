---
example_description: "La lección de un curso en línea: vídeo con portada, subtítulos para sordos en dos idiomas y capítulos pintados desde un template, descripción del vídeo, un diagrama SVG accesible y JSON-LD VideoObject"
example_tags: "profesional|video|track|captions|capitulos|template|svg|json-ld"
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
  <title>Lección 1: el juego de la vida · Sistemas que se organizan solos · Club de Ciencia</title>
  <meta name="description" content="Primera lección del curso: qué es el juego de la vida de Conway, sus cuatro reglas y el planeador, con un vídeo subtitulado de 12 segundos.">
  <link rel="canonical" href="https://clubdeciencia.example/cursos/sistemas/juego-de-la-vida/">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <meta property="og:type" content="video.other">
  <meta property="og:title" content="Lección 1: el juego de la vida">
  <meta property="og:url" content="https://clubdeciencia.example/cursos/sistemas/juego-de-la-vida/">
  <meta property="og:image" content="https://clubdeciencia.example/cursos/sistemas/juego-de-la-vida/portada.jpg">
  <!-- 1. Datos estructurados: el vídeo y el curso al que pertenece (nunca se ejecutan) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "Lección 1: el juego de la vida",
    "description": "El autómata celular de Conway en 12 segundos, con música y subtítulos.",
    "thumbnailUrl": "https://clubdeciencia.example/cursos/sistemas/juego-de-la-vida/portada.jpg",
    "uploadDate": "2026-09-15",
    "duration": "PT12S",
    "inLanguage": "es",
    "isPartOf": { "@type": "Course", "name": "Sistemas que se organizan solos", "provider": { "@type": "Organization", "name": "Club de Ciencia" } }
  }
  </script>
  <link rel="stylesheet" href="css/base.css">
  <script defer src="js/media-audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://clubdeciencia.example/">Club de Ciencia</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://clubdeciencia.example/cursos/" aria-current="page">Cursos</a></li>
        <li><a href="https://clubdeciencia.example/talleres/">Talleres</a></li>
        <li><a href="https://clubdeciencia.example/cuenta/">Mi cuenta</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <!-- 2. Dónde estoy: una ruta de migas de pan, con la página actual marcada -->
    <nav aria-label="Ruta">
      <ol class="row">
        <li><a href="https://clubdeciencia.example/cursos/">Cursos</a> ›</li>
        <li><a href="https://clubdeciencia.example/cursos/sistemas/">Sistemas que se organizan solos</a> ›</li>
        <li><a href="https://clubdeciencia.example/cursos/sistemas/juego-de-la-vida/" aria-current="page">Lección 1</a></li>
      </ol>
    </nav>

    <h1>Lección 1: el juego de la vida</h1>
    <p class="lead">Un universo de celdas que viven o mueren según sus vecinas, inventado por John Conway en 1970. Vídeo de 12 segundos, con música y sin voz.</p>

    <!-- 3. El vídeo: portada, solo metadatos antes de pulsar ▶, dos formatos, subtítulos para
         sordos (captions: transcriben también la música) en dos idiomas y una pista de
         capítulos que lee el script. crossorigin: las tarjetas de LearnWeb piden los .vtt
         «de otro origen»; en un sitio con todo en el mismo servidor no haría falta. -->
    <video id="lesson-video" controls preload="metadata" poster="media/life-poster.jpg"
           width="640" height="360" crossorigin="anonymous">
      <source src="media/life.webm" type="video/webm">
      <source src="media/life.mp4" type="video/mp4">
      <track kind="captions" src="media/life-captions-es.vtt" srclang="es" label="Español (CC)" default>
      <track kind="captions" src="media/life-captions-en.vtt" srclang="en" label="English (CC)">
      <track id="lesson-chapters" kind="chapters" src="media/life-chapters-lesson-es.vtt" srclang="es" label="Capítulos">
      <p>Tu navegador no reproduce vídeo. <a href="media/life.mp4" download>Descarga la lección</a> (MP4, 360 KB).</p>
    </video>

    <!-- 4. El índice de capítulos: una plantilla inerte que el script clona por capítulo -->
    <template id="chapter-item">
      <li><button type="button"><span class="chapter-title"></span> <span class="muted">(<span class="chapter-time"></span>)</span></button></li>
    </template>
    <nav aria-label="Capítulos del vídeo">
      <h2>Capítulos</h2>
      <ol id="chapter-list" class="row"></ol>
    </nav>

    <!-- 5. Para quien no ve el vídeo: qué se ve y qué se oye -->
    <details>
      <summary>Descripción del vídeo</summary>
      <p>Una cuadrícula oscura en la que aparecen y desaparecen celdas de color cian, generación tras generación, siguiendo las cuatro reglas de esta lección. De fondo suena una melodía punteada de ocho notas que se repite tres veces. No hay voz.</p>
    </details>

    <h2>Las cuatro reglas</h2>
    <p>Cada celda mira a sus ocho vecinas y, en la generación siguiente:</p>
    <ol>
      <li>Si está viva y tiene menos de dos vecinas vivas, muere (por soledad).</li>
      <li>Si está viva y tiene dos o tres vecinas vivas, sigue viva.</li>
      <li>Si está viva y tiene más de tres vecinas vivas, muere (por superpoblación).</li>
      <li>Si está muerta y tiene exactamente tres vecinas vivas, nace.</li>
    </ol>

    <h2>Tu primer patrón: el planeador</h2>
    <!-- 6. Un diagrama informativo: role="img", con title y desc enlazados -->
    <figure>
      <svg viewBox="0 0 64 64" width="160" height="160" role="img" aria-labelledby="glider-title" aria-describedby="glider-desc">
        <title id="glider-title">El planeador</title>
        <desc id="glider-desc">Cinco celdas vivas en una cuadrícula de tres por tres: la del centro de la fila de arriba, la de la derecha de la fila del medio y las tres de la fila de abajo.</desc>
        <g fill="#0e7490">
          <rect x="22" y="2" width="20" height="20"/>
          <rect x="42" y="22" width="20" height="20"/>
          <rect x="2" y="42" width="20" height="20"/><rect x="22" y="42" width="20" height="20"/><rect x="42" y="42" width="20" height="20"/>
        </g>
        <g fill="none" stroke="#64748b" stroke-width="1">
          <rect x="2" y="2" width="60" height="60"/>
          <path d="M22 2 V62 M42 2 V62 M2 22 H62 M2 42 H62"/>
        </g>
      </svg>
      <figcaption>Cada cuatro generaciones recupera su forma, una celda más abajo y a la derecha: «planea» en diagonal.</figcaption>
    </figure>

    <p class="note">En la lección 2 verás patrones que nunca cambian, otros que oscilan y uno que fabrica planeadores sin parar.</p>
    <p><a class="button-link" href="https://clubdeciencia.example/cursos/sistemas/patrones/">Siguiente lección: los patrones</a></p>
  </main>

  <footer class="site-footer">
    <p>Club de Ciencia · Lecciones con licencia CC BY-SA 4.0 · <a href="https://clubdeciencia.example/accesibilidad/">Accesibilidad</a></p>
  </footer>

  <script>
    // Adelanto: JavaScript se explica en su capítulo. Lee los capítulos del .vtt y clona la
    // plantilla una vez por capítulo; cada botón salta a su segundo con currentTime.
    const lessonVideo = document.getElementById('lesson-video');
    const chapterTrack = document.getElementById('lesson-chapters');
    const chapterTemplate = document.getElementById('chapter-item');

    function buildChapters() {
      const list = document.getElementById('chapter-list');
      for (const cue of chapterTrack.track.cues) {
        const item = chapterTemplate.content.cloneNode(true);
        item.querySelector('.chapter-title').textContent = cue.text;
        item.querySelector('.chapter-time').textContent = `${cue.startTime} s`;
        item.querySelector('button').addEventListener('click', () => {
          lessonVideo.currentTime = cue.startTime;
          lessonVideo.play();
        });
        list.append(item);
      }
      console.log('capítulos →', list.children.length);
    }

    chapterTrack.track.mode = 'hidden'; // se carga para el script, sin dibujarse
    if (chapterTrack.readyState === 2) buildChapters();
    else chapterTrack.addEventListener('load', buildChapters);
  </script>
</body>
</html>
```
