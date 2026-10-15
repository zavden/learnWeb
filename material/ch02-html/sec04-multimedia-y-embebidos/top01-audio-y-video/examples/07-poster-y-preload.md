---
example_description: "poster es la imagen que se ve antes de reproducir; preload=\"none\" no descarga nada (ni la duración) y preload=\"metadata\" solo lo justo para saber cuánto dura"
example_tags: "html|multimedia|video|poster|preload|rendimiento"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<!-- Compara los dos vídeos antes de reproducirlos y lee la duración que conoce cada uno. -->
<div class="pair">
  <figure>
    <!-- preload="none": no pide ni un byte hasta que se pulsa ▶.
         poster: la imagen que se muestra mientras tanto (si falta, un recuadro vacío). -->
    <video controls preload="none" poster="life-poster.jpg" width="320" height="180" crossorigin="anonymous" data-report="none-report">
      <source src="life.webm" type="video/webm">
      <source src="life.mp4" type="video/mp4">
      <track kind="captions" src="life-captions-es.vtt" srclang="es" label="Español (CC)">
    </video>
    <figcaption><code>preload="none"</code> + <code>poster</code><br><output id="none-report">…</output></figcaption>
  </figure>

  <figure>
    <!-- preload="metadata" (lo que hace Chrome por defecto): descarga el principio del archivo,
         lo justo para conocer la duración y el tamaño; sin poster, muestra el primer fotograma. -->
    <video controls preload="metadata" width="320" height="180" crossorigin="anonymous" data-report="metadata-report">
      <source src="life.webm" type="video/webm">
      <source src="life.mp4" type="video/mp4">
      <track kind="captions" src="life-captions-es.vtt" srclang="es" label="Español (CC)">
    </video>
    <figcaption><code>preload="metadata"</code>, sin poster<br><output id="metadata-report">…</output></figcaption>
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
// Adelanto: JavaScript se explica en su capítulo. Cuando la página termina de cargar,
// cada vídeo dice qué sabe de sí mismo. duration es NaN mientras no conoce los metadatos.
function report() {
  for (const video of document.querySelectorAll('video')) {
    const duration = Number.isNaN(video.duration) ? 'NaN (aún no lo sabe)' : `${video.duration.toFixed(1)} s`;
    document.getElementById(video.dataset.report).value = `duración: ${duration}`;
    console.log(`preload="${video.preload}" → duration: ${duration}`);
  }
}
// El evento load de la página: llega cuando ha cargado todo (los eventos, en su capítulo)
window.addEventListener('load', report);
```
