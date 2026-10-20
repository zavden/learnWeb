---
example_description: "Ejercicio: un vídeo sin controles, sin tamaño, sin subtítulos, en un solo formato y que intenta sonar solo; conviértelo en un vídeo accesible y robusto"
example_tags: "ejercicio|video|controls|poster|source|track|captions|autoplay"
example_stage: exercise
example_importance: important
exercise: true
exercise_title: "Haz accesible el vídeo de la lección"
exercise_instructions: "Añade controls al vídeo || Reserva su hueco con width=\"640\" y height=\"360\" || Ponle la portada life-poster.jpg con poster || Cambia el src por dos source: life.webm (video/webm) primero y life.mp4 (video/mp4) después || Añade subtítulos para sordos (kind=\"captions\") en español, activos por defecto, y otros en inglés, con srclang y label || Añade crossorigin=\"anonymous\" para que las tarjetas de LearnWeb carguen los .vtt || Haz que no intente sonar solo: quita autoplay || Escribe un contenido alternativo con un enlace para descargar el MP4 || Comprueba que la consola sale toda ✅"
exercise_hints: "Los archivos están en la carpeta del tema: ábrela con el botón «Assets» || Un source por formato, cada uno con su type; el primero que el navegador sepa reproducir es el que usa || <track kind=\"captions\" src=\"life-captions-es.vtt\" srclang=\"es\" label=\"Español (CC)\" default> || El contenido alternativo va DENTRO del video, después de los track"
exercise_solution_example: 08-ej-video-accesible-solucion.md
exercise_locked_files: styles.css,script.js
console: true
---

# HTML

```html
<h1>Lección 1: el juego de la vida</h1>
<p>Un autómata celular explicado en 12 segundos, con música de fondo.</p>

<!-- TODO: este vídeo no tiene controles, ni tamaño, ni portada, ni subtítulos; solo tiene
     un formato y además intenta empezar solo CON SONIDO. Los subtítulos están en
     life-captions-es.vtt y life-captions-en.vtt. -->
<video src="life.mp4" autoplay></video>
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
