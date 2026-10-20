---
example_description: "Una lista de fragmentos de audio para practicar, generada desde un <template>: cada audio con preload=\"none\", su fragmento de tiempo (#t=inicio,fin) y su transcripción"
example_tags: "integracion|audio|preload|fragmentos-de-tiempo|template|transcripcion"
example_stage: intermediate
example_importance: useful
console: true
---

# HTML

```html
<h1>Practica la melodía por partes</h1>
<p>Cuatro fragmentos del mismo audio. Ninguno se descarga hasta que pulsas ▶: con muchos audios en una página, <code>preload="none"</code> ahorra datos.</p>

<!-- La plantilla de un fragmento. Inerte: su audio no se carga mientras está en el template. -->
<template id="fragment-item">
  <li class="fragment">
    <h2 class="fragment-title"></h2>
    <audio controls preload="none">
      <source type="audio/ogg; codecs=opus">
      <source type="audio/mpeg">
    </audio>
    <details>
      <summary>Transcripción</summary>
      <p class="fragment-notes"></p>
    </details>
  </li>
</template>

<ol id="fragments" class="fragments"></ol>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  max-width: 42rem;
  padding: 0 1rem;
}

.fragments {
  padding-left: 1.25rem;
}

.fragment {
  margin-bottom: 1.25rem;
}

.fragment h2 {
  margin: 0 0 0.25rem;
  font-size: 1.05rem;
}

summary:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo.
const fragments = [
  { title: 'La subida (0 – 2 s)', time: '0,2', notes: 'Cuatro notas que suben: do, mi, sol, do agudo.' },
  { title: 'La bajada (2 – 4 s)', time: '2,4', notes: 'Cuatro notas que bajan: la, sol, mi, re.' },
  { title: 'La melodía entera (0 – 4 s)', time: '0,4', notes: 'Las ocho notas seguidas: do, mi, sol, do agudo, la, sol, mi, re.' },
  { title: 'Las tres vueltas (0 – 12 s)', time: '0,12', notes: 'La melodía completa, tres veces seguidas. No hay voz.' },
];
const template = document.getElementById('fragment-item');
const list = document.getElementById('fragments');

for (const fragment of fragments) {
  const item = template.content.cloneNode(true); // una COPIA por fragmento
  const audio = item.querySelector('audio');
  const [ogg, mp3] = item.querySelectorAll('source');
  // #t=inicio,fin: el fragmento de tiempo empieza y se detiene donde dice la URL
  ogg.src = `melody.ogg#t=${fragment.time}`;
  mp3.src = `melody.mp3#t=${fragment.time}`;
  item.querySelector('.fragment-title').textContent = fragment.title;
  item.querySelector('.fragment-notes').textContent = fragment.notes;
  list.append(item);
  audio.load(); // tras cambiar los source, load() hace que el audio vuelva a elegir uno
  console.log(`${fragment.title} → melody.mp3#t=${fragment.time}`);
}
```
