---
example_description: "Solución: el vídeo de la lección con controles, tamaño, portada, dos formatos, subtítulos para sordos en dos idiomas, sin autoplay y con contenido alternativo"
example_tags: "ejercicio|solucion|video|controls|poster|source|track|captions"
example_stage: final-solution
example_importance: important
console: true
---

# HTML

```html
<h1>Lección 1: el juego de la vida</h1>
<p>Un autómata celular explicado en 12 segundos, con música de fondo.</p>

<!-- controls: botones del navegador (teclado incluido). width/height: hueco reservado.
     poster: la portada. preload="metadata": solo la duración y el primer fotograma.
     crossorigin: las tarjetas de LearnWeb piden los .vtt «de otro origen».
     Sin autoplay: un vídeo con sonido se reproduce cuando la persona lo pide. -->
<video controls width="640" height="360" poster="life-poster.jpg" preload="metadata" crossorigin="anonymous">
  <!-- El primero que el navegador sabe reproducir: WebM (más ligero) y MP4 de respaldo -->
  <source src="life.webm" type="video/webm">
  <source src="life.mp4" type="video/mp4">
  <!-- captions: transcriben lo que se dice Y los sonidos (♪), para quien no oye -->
  <track kind="captions" src="life-captions-es.vtt" srclang="es" label="Español (CC)" default>
  <track kind="captions" src="life-captions-en.vtt" srclang="en" label="English (CC)">
  <!-- Solo lo ve un navegador sin <video> -->
  <p>Tu navegador no reproduce vídeo. <a href="life.mp4" download>Descarga la lección</a> (MP4, 360 KB).</p>
</video>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  max-width: 42rem;
  padding: 0 1rem;
}

video {
  max-width: 100%;
  height: auto;
  background: #0f172a;
}
```

# JavaScript

```javascript
// Comprobaciones automáticas (bloqueadas: no hace falta tocarlas). Adelanto: JavaScript se
// explica en su capítulo.
const lessonVideo = document.querySelector('video');
const sources = [...lessonVideo.querySelectorAll('source')];
const tracks = [...lessonVideo.querySelectorAll('track')];
const hasCaptions = (lang) => tracks.some((track) => track.kind === 'captions' && track.srclang === lang && track.label.trim() !== '');

const checks = [
  ['el vídeo tiene controls', lessonVideo.hasAttribute('controls')],
  ['width="640" y height="360" reservan su hueco', lessonVideo.getAttribute('width') === '640' && lessonVideo.getAttribute('height') === '360'],
  ['tiene portada (poster)', (lessonVideo.getAttribute('poster') ?? '').endsWith('life-poster.jpg')],
  ['sin src: dos source, WebM primero y MP4 después, con su type', !lessonVideo.hasAttribute('src') && sources.length === 2
    && sources[0].type.startsWith('video/webm') && sources[1].type.startsWith('video/mp4')],
  ['subtítulos para sordos en español, activos por defecto', hasCaptions('es') && tracks.some((track) => track.srclang === 'es' && track.default)],
  ['subtítulos para sordos en inglés', hasCaptions('en')],
  ['crossorigin="anonymous"', lessonVideo.getAttribute('crossorigin') === 'anonymous'],
  ['no intenta sonar solo (sin autoplay)', !lessonVideo.hasAttribute('autoplay')],
  ['contenido alternativo con un enlace para descargar el MP4', lessonVideo.querySelector('a[download][href$="life.mp4"]') !== null],
];
for (const [label, ok] of checks) console.log(ok ? '✅' : '❌', label);
```
