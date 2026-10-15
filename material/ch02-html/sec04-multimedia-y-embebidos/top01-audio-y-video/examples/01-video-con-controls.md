---
example_description: "Un video con controls: los botones los pone el navegador; width y height reservan el hueco, track añade subtítulos y el contenido de dentro es para quien no tiene video"
example_tags: "html|multimedia|video|controls|track|accesibilidad"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<!-- Pulsa ▶. Los botones (reproducir, tiempo, volumen, subtítulos, pantalla completa, ⋮)
     los dibuja el navegador porque el vídeo tiene el atributo booleano controls. -->
<h2>El juego de la vida</h2>

<!-- width y height: como en img, reservan el hueco (16:9) antes de que llegue el vídeo.
     crossorigin: hace falta para cargar los subtítulos dentro de las tarjetas de LearnWeb
     (te lo explica la teoría de esta lección). -->
<video src="life.webm" controls width="640" height="360" crossorigin="anonymous">
  <!-- Subtítulos para personas sordas (captions): actívalos con el botón de subtítulos -->
  <track kind="captions" src="life-captions-es.vtt" srclang="es" label="Español (CC)">

  <!-- Contenido alternativo: solo lo muestra un navegador que NO conoce el elemento video -->
  <p>Tu navegador no puede mostrar vídeos. <a href="life.webm" download>Descarga el vídeo</a> (WebM, 400 KB).</p>
</video>

<p>Doce segundos del «juego de la vida» de Conway: células cian que nacen y mueren sobre un fondo azul noche, con una melodía de fondo.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* En una vista estrecha, el vídeo se encoge sin deformarse (CSS: capítulo 3) */
video {
  max-width: 100%;
  height: auto;
}
```
