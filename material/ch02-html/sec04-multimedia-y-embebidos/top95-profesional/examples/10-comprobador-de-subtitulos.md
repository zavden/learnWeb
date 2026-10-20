---
example_description: "Una herramienta de un estudio de subtitulado: un vídeo de prueba con subtítulos en dos idiomas, una tabla con el estado de cada pista (load/error, número de subtítulos) generada con un template, el subtítulo activo y un selector de idioma"
example_tags: "profesional|video|track|webvtt|subtitulos|template|currenttime|herramienta"
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
  <title>Comprobador de sincronización · Subtitula, estudio de subtitulado</title>
  <meta name="description" content="Herramienta interna de Subtitula para revisar que las pistas WebVTT de un vídeo cargan y van sincronizadas, idioma por idioma.">
  <meta name="robots" content="noindex, nofollow">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <script defer src="js/media-audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://subtitula.example/panel/">Subtitula · Panel</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://subtitula.example/panel/proyectos/">Proyectos</a></li>
        <li><a href="https://subtitula.example/panel/comprobador/" aria-current="page">Comprobador</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <h1>Comprobador de sincronización</h1>
    <p class="lead">Vídeo de prueba: una carta de ajuste muda de 8 segundos con un contador. Cada subtítulo debe cambiar a la vez que el número.</p>

    <!-- 1. El vídeo con una pista por idioma (subtitles: traducen lo que se dice; aquí, el número).
         Esta página es interna: robots noindex en el head, para que no aparezca en buscadores. -->
    <video id="test-video" controls preload="metadata" width="640" height="360" crossorigin="anonymous">
      <source src="media/counter.webm" type="video/webm">
      <source src="media/counter.mp4" type="video/mp4">
      <track kind="subtitles" src="media/counter-subtitles-es.vtt" srclang="es" label="Español" default>
      <track kind="subtitles" src="media/counter-subtitles-en.vtt" srclang="en" label="English">
      <p>Tu navegador no reproduce vídeo. <a href="media/counter.mp4" download>Descarga el vídeo de prueba</a>.</p>
    </video>
    <p>Segundo: <span id="clock">0.0</span> · Subtítulo activo: «<span id="active-cue">—</span>»</p>

    <!-- 2. Qué pista se ve: un grupo de radio con su legend -->
    <fieldset>
      <legend>Subtítulos visibles</legend>
      <label><input type="radio" name="visible-track" value="es" checked> Español</label>
      <label><input type="radio" name="visible-track" value="en"> English</label>
      <label><input type="radio" name="visible-track" value="none"> Ninguno</label>
    </fieldset>

    <!-- 3. El estado de cada pista, en una tabla: una fila clonada de la plantilla por pista -->
    <h2>Estado de las pistas</h2>
    <table>
      <caption>Pistas de texto del vídeo de prueba</caption>
      <thead>
        <tr><th scope="col">Idioma</th><th scope="col">Tipo</th><th scope="col">Etiqueta</th><th scope="col">Estado</th><th scope="col" class="num">Subtítulos</th></tr>
      </thead>
      <tbody id="track-rows"></tbody>
    </table>
    <template id="track-row">
      <tr><td class="lang"></td><td class="kind"></td><td class="label"></td><td class="state"></td><td class="cues num"></td></tr>
    </template>

    <p class="note">Si una pista sale en «error», casi siempre es un archivo SRT renombrado (sin la línea <code>WEBVTT</code> y con comas en los tiempos) o un servidor de otro origen sin cabeceras CORS.</p>
  </main>

  <footer class="site-footer">
    <p>Subtitula · Herramientas internas · <a href="https://subtitula.example/panel/ayuda/">Ayuda</a></p>
  </footer>

  <script>
    // Adelanto: JavaScript se explica en su capítulo.
    const testVideo = document.getElementById('test-video');
    const trackElements = [...testVideo.querySelectorAll('track')];
    const rowTemplate = document.getElementById('track-row');
    const states = ['sin cargar', 'cargando', 'cargada', 'error'];

    // Una fila por pista; se actualiza cuando la pista termina de cargar (o falla)
    for (const trackElement of trackElements) {
      const row = rowTemplate.content.cloneNode(true).querySelector('tr');
      row.querySelector('.lang').textContent = trackElement.srclang;
      row.querySelector('.kind').textContent = trackElement.kind;
      row.querySelector('.label').textContent = trackElement.label;
      document.getElementById('track-rows').append(row);

      const update = () => {
        const cues = trackElement.track.cues ? trackElement.track.cues.length : 0;
        row.querySelector('.state').textContent = states[trackElement.readyState];
        row.querySelector('.cues').textContent = cues;
        if (trackElement.readyState >= 2) console.log(`${trackElement.srclang} → ${states[trackElement.readyState]} (${cues} subtítulos)`);
      };
      trackElement.addEventListener('load', update);
      trackElement.addEventListener('error', update);
      // Una pista sin default está desactivada y no se descarga: «hidden» la carga sin mostrarla
      if (trackElement.track.mode === 'disabled') trackElement.track.mode = 'hidden';
      update();

      // cuechange: cambia el subtítulo activo de esta pista
      trackElement.track.addEventListener('cuechange', () => {
        if (trackElement.track.mode !== 'showing') return;
        const cue = trackElement.track.activeCues[0];
        document.getElementById('active-cue').textContent = cue ? cue.text : '—';
      });
    }

    // El selector: la pista elegida pasa a «showing» y las demás a «hidden»
    for (const radio of document.querySelectorAll('input[name="visible-track"]')) {
      radio.addEventListener('change', () => {
        for (const trackElement of trackElements) {
          trackElement.track.mode = trackElement.srclang === radio.value ? 'showing' : 'hidden';
        }
        document.getElementById('active-cue').textContent = '—';
      });
    }

    testVideo.addEventListener('timeupdate', () => {
      document.getElementById('clock').textContent = testVideo.currentTime.toFixed(1);
    });
  </script>
</body>
</html>
```
