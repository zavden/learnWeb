---
example_description: "Un track kind=\"chapters\" no se dibuja: un pequeño script lee sus capítulos y salta a cada uno cambiando currentTime"
example_tags: "html|multimedia|video|track|capitulos|currenttime"
example_stage: intermediate
example_importance: useful
console: true
---

# HTML

```html
<!-- Pulsa un capítulo: el vídeo salta a ese segundo y se reproduce. -->
<video id="clip" controls width="640" height="360" crossorigin="anonymous">
  <source src="life.webm" type="video/webm">
  <source src="life.mp4" type="video/mp4">
  <track kind="captions" src="life-captions-es.vtt" srclang="es" label="Español (CC)">
  <!-- Capítulos: el reproductor de Chrome no los muestra, pero quedan disponibles para el código
       (y para otros reproductores). default: que se carguen sin que nadie los elija. -->
  <track id="chapters" kind="chapters" src="life-chapters-es.vtt" srclang="es" label="Capítulos" default>
</video>

<nav aria-label="Capítulos del vídeo">
  <ol id="chapter-list"></ol>
</nav>
<p>Segundo actual: <output id="time">0.0</output></p>
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

button:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. track.cues es la lista de capítulos del .vtt;
// currentTime (en segundos) es la posición del vídeo: se lee y también se puede cambiar.
const clip = document.getElementById('clip');
const chaptersElement = document.getElementById('chapters');

function buildChapterList() {
  const list = document.getElementById('chapter-list');
  for (const cue of chaptersElement.track.cues) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${cue.text} (${cue.startTime} s)`;
    button.onclick = () => { clip.currentTime = cue.startTime; clip.play(); };
    item.append(button);
    list.append(item);
    console.log(`capítulo ${cue.id} → empieza en el segundo ${cue.startTime}`);
  }
}

chaptersElement.track.mode = 'hidden'; // cargado, pero sin dibujarse
if (chaptersElement.readyState === 2) buildChapterList();
else chaptersElement.addEventListener('load', buildChapterList);

// timeupdate: se lanza varias veces por segundo mientras se reproduce
clip.addEventListener('timeupdate', () => {
  document.getElementById('time').value = clip.currentTime.toFixed(1);
});
```
