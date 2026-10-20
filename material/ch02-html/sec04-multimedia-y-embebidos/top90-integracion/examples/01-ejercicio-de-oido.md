---
example_description: "Un ejercicio de oído de una escuela de música: audio en dos formatos con preload, la partitura como SVG accesible, la transcripción en un details y botones que saltan a cada vuelta con currentTime"
example_tags: "integracion|audio|source|transcripcion|svg|accesibilidad|currenttime"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<h1>Ejercicio de oído n.º 3: la melodía punteada</h1>
<p>Escucha la melodía (12 segundos, tres vueltas) e intenta cantarla antes de mirar la partitura.</p>

<!-- 1. El audio: Opus en .ogg primero (más ligero) y MP3 de respaldo. preload="metadata" pide
     solo la duración: el archivo entero no se descarga hasta que alguien pulsa ▶. -->
<audio id="melody" controls preload="metadata">
  <source src="melody.ogg" type="audio/ogg; codecs=opus">
  <source src="melody.mp3" type="audio/mpeg">
  <p>Tu navegador no reproduce audio. <a href="melody.mp3" download>Descarga la melodía</a> (MP3, 95 KB).</p>
</audio>

<!-- 2. Saltar a cada vuelta (onclick: los eventos se estudian en el capítulo de JavaScript) -->
<p>
  <button type="button" onclick="playFrom(0)">1.ª vuelta</button>
  <button type="button" onclick="playFrom(4)">2.ª vuelta</button>
  <button type="button" onclick="playFrom(8)">3.ª vuelta</button>
</p>

<!-- 3. La partitura: SVG informativo → role="img", title y desc enlazados. Las notas usan
     currentColor, así que toman el color del texto de la figura. -->
<figure>
  <svg viewBox="0 0 400 100" width="400" height="100" role="img" aria-labelledby="score-title" aria-describedby="score-desc">
    <title id="score-title">Partitura de la melodía</title>
    <desc id="score-desc">Ocho negras en clave de sol: do, mi, sol, do agudo, la, sol, mi, re.</desc>
    <g stroke="#475569" stroke-width="1">
      <line x1="10" y1="30" x2="390" y2="30"/><line x1="10" y1="40" x2="390" y2="40"/>
      <line x1="10" y1="50" x2="390" y2="50"/><line x1="10" y1="60" x2="390" y2="60"/>
      <line x1="10" y1="70" x2="390" y2="70"/>
      <!-- línea adicional bajo el pentagrama para el do central -->
      <line x1="48" y1="80" x2="72" y2="80"/>
    </g>
    <g fill="currentColor" stroke="currentColor" stroke-width="1.5">
      <ellipse cx="60" cy="80" rx="6.5" ry="4.5"/><line x1="66" y1="80" x2="66" y2="50"/>
      <ellipse cx="100" cy="70" rx="6.5" ry="4.5"/><line x1="106" y1="70" x2="106" y2="40"/>
      <ellipse cx="140" cy="60" rx="6.5" ry="4.5"/><line x1="146" y1="60" x2="146" y2="30"/>
      <ellipse cx="180" cy="45" rx="6.5" ry="4.5"/><line x1="174" y1="45" x2="174" y2="75"/>
      <ellipse cx="220" cy="55" rx="6.5" ry="4.5"/><line x1="226" y1="55" x2="226" y2="25"/>
      <ellipse cx="260" cy="60" rx="6.5" ry="4.5"/><line x1="266" y1="60" x2="266" y2="30"/>
      <ellipse cx="300" cy="70" rx="6.5" ry="4.5"/><line x1="306" y1="70" x2="306" y2="40"/>
      <ellipse cx="340" cy="75" rx="6.5" ry="4.5"/><line x1="346" y1="75" x2="346" y2="45"/>
    </g>
  </svg>
  <figcaption>La melodía escrita: ocho negras de medio segundo.</figcaption>
</figure>

<!-- 4. La alternativa accesible del audio: su transcripción -->
<details>
  <summary>Transcripción del audio</summary>
  <p>Melodía punteada de ocho notas, de medio segundo cada una: do, mi, sol, do agudo, la, sol, mi, re. Suena tres veces seguidas (12 segundos). No hay voz.</p>
</details>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  max-width: 42rem;
  padding: 0 1rem;
}

/* Las notas (currentColor) toman este color */
figure {
  margin: 1rem 0;
  color: #1e3a8a;
}

svg {
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
const melody = document.getElementById('melody');

// currentTime (en segundos) mueve el audio; play() lo arranca: pulsar el botón ya es interactuar
function playFrom(seconds) {
  melody.currentTime = seconds;
  melody.play();
  console.log(`▶ desde el segundo ${seconds}`);
}

// Con preload="metadata" la duración se conoce sin descargar el archivo entero
melody.addEventListener('loadedmetadata', () => {
  console.log('duración del audio →', melody.duration.toFixed(1), 's');
});
if (melody.readyState >= 1) console.log('duración del audio →', melody.duration.toFixed(1), 's');
```
