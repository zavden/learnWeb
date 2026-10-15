---
example_description: "Una lección en vídeo completa: poster, dos formatos, subtítulos para sordos en dos idiomas, capítulos leídos del .vtt y pintados con un <template>, y la posición actual con currentTime"
example_tags: "integracion|video|poster|track|captions|capitulos|template|currenttime"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<h1>Lección 1: el juego de la vida</h1>
<p>Un autómata celular de 1970: cada celda vive o muere según sus ocho vecinas. Vídeo de 12 s, con música y sin voz.</p>

<!-- poster: la portada antes de pulsar ▶. preload="metadata": solo duración y primer fotograma.
     crossorigin: las tarjetas de LearnWeb piden los .vtt «de otro origen» (lección de audio). -->
<video id="lesson" controls preload="metadata" poster="life-poster.jpg"
       width="640" height="360" crossorigin="anonymous">
  <source src="life.webm" type="video/webm">
  <source src="life.mp4" type="video/mp4">
  <!-- captions: transcriben también los sonidos (♪), para quien no oye -->
  <track kind="captions" src="life-captions-es.vtt" srclang="es" label="Español (CC)" default>
  <track kind="captions" src="life-captions-en.vtt" srclang="en" label="English (CC)">
  <track id="chapters" kind="chapters" src="life-chapters-es.vtt" srclang="es" label="Capítulos">
  <p>Tu navegador no reproduce vídeo. <a href="life.mp4" download>Descarga la lección</a> (MP4, 360 KB).</p>
</video>

<!-- Una plantilla inerte para cada capítulo: el script la clona una vez por capítulo -->
<template id="chapter-item">
  <li><button type="button"><span class="chapter-title"></span> · <span class="chapter-time"></span></button></li>
</template>

<nav aria-label="Capítulos de la lección">
  <ol id="chapter-list"></ol>
</nav>
<p>Vas por el segundo <output id="position">0.0</output>.</p>

<details>
  <summary>Descripción del vídeo</summary>
  <p>Una cuadrícula oscura en la que aparecen y desaparecen celdas de color cian siguiendo las reglas del juego de la vida. De fondo suena una melodía punteada de ocho notas que se repite tres veces.</p>
</details>
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
}

button:focus-visible,
summary:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo.
const lesson = document.getElementById('lesson');
const chaptersTrack = document.getElementById('chapters');
const chapterTemplate = document.getElementById('chapter-item');

function buildChapters() {
  const list = document.getElementById('chapter-list');
  for (const cue of chaptersTrack.track.cues) {
    // Una COPIA de la plantilla por capítulo (insertar template.content la vaciaría)
    const item = chapterTemplate.content.cloneNode(true);
    item.querySelector('.chapter-title').textContent = cue.text;
    item.querySelector('.chapter-time').textContent = `${cue.startTime} s`;
    item.querySelector('button').onclick = () => { lesson.currentTime = cue.startTime; lesson.play(); };
    list.append(item);
  }
  console.log('capítulos pintados →', list.children.length);
}

chaptersTrack.track.mode = 'hidden'; // cargado para el código, sin dibujarse
if (chaptersTrack.readyState === 2) buildChapters();
else chaptersTrack.addEventListener('load', buildChapters);

lesson.addEventListener('timeupdate', () => {
  document.getElementById('position').value = lesson.currentTime.toFixed(1);
});
```
