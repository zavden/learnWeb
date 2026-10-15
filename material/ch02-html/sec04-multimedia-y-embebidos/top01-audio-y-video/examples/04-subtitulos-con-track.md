---
example_description: "track añade subtítulos en WebVTT: uno por idioma, con srclang y label; default elige el que se ve al empezar y el reproductor deja cambiarlo"
example_tags: "html|multimedia|video|track|subtitulos|webvtt|accesibilidad"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<!-- Pulsa ▶ y mira cómo cada subtítulo cambia a la vez que el número grande de la derecha (los segundos).
     Este vídeo de prueba no tiene sonido: sus subtítulos dicen el número para que compruebes
     que van sincronizados. Cambia de idioma con el botón de subtítulos del reproductor. -->
<video controls width="640" height="360" crossorigin="anonymous">
  <source src="counter.webm" type="video/webm">
  <source src="counter.mp4" type="video/mp4">

  <!-- Un track por idioma. kind: qué contiene; srclang: su idioma; label: el nombre en el menú.
       default: el que se muestra al empezar (como mucho uno por tipo). -->
  <track kind="subtitles" src="counter-subtitles-es.vtt" srclang="es" label="Español" default>
  <track kind="subtitles" src="counter-subtitles-en.vtt" srclang="en" label="English">
</video>

<!-- crossorigin, en el video: en las tarjetas de LearnWeb los .vtt llegan «de otro origen»
     (lo explica la teoría); en una web con todo en el mismo servidor no hace falta. -->
<p>Los archivos <code>.vtt</code> están en la carpeta del tema: ábrelos con el botón «Assets».</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

video {
  max-width: 100%;
  height: auto;
}
```
