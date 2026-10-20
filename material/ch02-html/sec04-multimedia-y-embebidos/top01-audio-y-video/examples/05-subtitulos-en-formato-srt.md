---
example_description: "Un archivo SRT renombrado a .vtt no muestra subtítulos: sin la línea WEBVTT el navegador lo rechaza entero, sin avisar en la página"
example_tags: "html|multimedia|track|webvtt|srt|subtitulos|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<!-- Reproduce los dos vídeos. Abre counter-es-from-srt.vtt con el botón «Assets» y compáralo
     con counter-subtitles-es.vtt: los subtítulos del primero no aparecen nunca. -->
<div class="pair">
  <figure>
    <video controls width="320" height="180" crossorigin="anonymous">
      <source src="counter.webm" type="video/webm">
      <source src="counter.mp4" type="video/mp4">
      <!-- 🐛 Un .srt renombrado: no empieza por WEBVTT y sus tiempos llevan coma (00:00:01,000) -->
      <track kind="subtitles" src="counter-es-from-srt.vtt" srclang="es" label="Español" default>
    </video>
    <figcaption>❌ SRT con extensión .vtt</figcaption>
  </figure>

  <figure>
    <video controls width="320" height="180" crossorigin="anonymous">
      <source src="counter.webm" type="video/webm">
      <source src="counter.mp4" type="video/mp4">
      <!-- ✅ WebVTT de verdad: primera línea WEBVTT y tiempos con punto (00:00:01.000) -->
      <track kind="subtitles" src="counter-subtitles-es.vtt" srclang="es" label="Español" default>
    </video>
    <figcaption>✅ WebVTT</figcaption>
  </figure>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* Los dos vídeos uno al lado del otro (flexbox: capítulo de CSS) */
.pair {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

figure {
  margin: 0;
}

video {
  max-width: 100%;
  height: auto;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Un track avisa con el evento load si ha
// podido leer el archivo y con error si no. En la página no se ve nada: solo faltan los subtítulos.
const states = ['sin cargar', 'cargando', 'cargado', 'error'];
for (const trackElement of document.querySelectorAll('track')) {
  const report = () => {
    const lines = trackElement.track.cues ? trackElement.track.cues.length : 0;
    console.log(`${trackElement.getAttribute('src')} → ${states[trackElement.readyState]} (${lines} subtítulos)`);
  };
  if (trackElement.readyState >= 2) report();
  trackElement.addEventListener('load', report);
  trackElement.addEventListener('error', report);
}
```
