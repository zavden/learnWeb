---
example_description: "audio con controls muestra una barra de reproducción; sin controls no se ve (display: none). La alternativa accesible del audio es una transcripción"
example_tags: "html|multimedia|audio|controls|source|transcripcion"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<h2>La melodía del vídeo</h2>

<!-- Dos formatos del mismo audio: el navegador usa el primer source que sabe reproducir.
     Opus (en un archivo .ogg) es más moderno; MP3 lo reproduce cualquier navegador. -->
<audio controls>
  <source src="melody.ogg" type="audio/ogg; codecs=opus">
  <source src="melody.mp3" type="audio/mpeg">
  <p>Tu navegador no reproduce audio. <a href="melody.mp3" download>Descarga la melodía</a> (MP3, 95 KB).</p>
</audio>

<!-- Un audio no tiene pantalla donde mostrar subtítulos: su alternativa es una transcripción -->
<details>
  <summary>Transcripción</summary>
  <p>Melodía punteada de ocho notas, de medio segundo cada una: do, mi, sol, do agudo, la, sol, mi, re. Suena tres veces seguidas (12 segundos). No hay voz.</p>
</details>

<!-- 🔇 Este segundo audio no tiene controls: la hoja de estilos del navegador lo oculta -->
<audio id="silent-audio" src="melody.mp3"></audio>
<p>Aquí arriba hay otro <code>&lt;audio&gt;</code> sin <code>controls</code>: <output id="report">…</output></p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. getComputedStyle da el estilo final.
const silentAudio = document.getElementById('silent-audio');
const display = getComputedStyle(silentAudio).display;
document.getElementById('report').value = `display: ${display}, no ocupa sitio ni se puede pulsar.`;
console.log('audio sin controls → display:', display);
```
