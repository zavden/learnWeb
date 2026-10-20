---
example_description: "autoplay con sonido no arranca hasta que la persona interactúa con la página; autoplay muted sí arranca siempre"
example_tags: "html|multimedia|video|autoplay|muted|politica-de-autoplay|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<!-- Mira el resultado sin pulsar nada dentro de la página. En la tarjeta de la teoría y en
     «▶ Run», el vídeo de la izquierda se queda parado. En el editor quizá arranque: allí la
     vista previa tiene permiso de autoplay y ya has pulsado en LearnWeb. Esa es la trampa:
     mientras programas, tú ya has interactuado con la página; quien llega a tu web, no. -->
<div class="pair">
  <figure>
    <!-- 🐛 autoplay con sonido: bloqueado hasta que la persona interactúa con la página -->
    <video autoplay controls width="320" height="180" crossorigin="anonymous" data-status="loud-status">
      <source src="life.webm" type="video/webm">
      <source src="life.mp4" type="video/mp4">
      <track kind="captions" src="life-captions-es.vtt" srclang="es" label="Español (CC)">
    </video>
    <figcaption>❌ <code>autoplay</code><br><output id="loud-status">…</output></figcaption>
  </figure>

  <figure>
    <!-- ✅ autoplay + muted: un vídeo sin sonido puede arrancar solo siempre.
         loop: vuelve a empezar. playsinline: en el iPhone no salta a pantalla completa. -->
    <video autoplay muted loop playsinline controls width="320" height="180" crossorigin="anonymous" data-status="quiet-status">
      <source src="life.webm" type="video/webm">
      <source src="life.mp4" type="video/mp4">
      <track kind="captions" src="life-captions-es.vtt" srclang="es" label="Español (CC)">
    </video>
    <figcaption>✅ <code>autoplay muted</code><br><output id="quiet-status">…</output></figcaption>
  </figure>
</div>

<!-- controls en los dos: si el autoplay falla, aún se puede pulsar ▶ (y entonces sí suena:
     pulsar es interactuar). Y quien no quiere movimiento puede pausar el vídeo que se repite. -->
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
// Adelanto: JavaScript se explica en su capítulo. Cada vídeo escribe su estado debajo.
function soundOf(video) {
  return video.muted ? 'sin sonido' : 'con sonido';
}

for (const video of document.querySelectorAll('video')) {
  const status = document.getElementById(video.dataset.status);
  video.addEventListener('playing', () => { status.value = `▶ reproduciéndose ${soundOf(video)}`; });
  video.addEventListener('pause', () => { status.value = '⏸ en pausa'; });

  // Si a los 2 segundos sigue parado, el navegador ha bloqueado su autoplay
  setTimeout(() => {
    if (video.paused) status.value = '⏸ bloqueado: no ha arrancado solo';
    console.log(`autoplay ${soundOf(video)} →`, video.paused ? 'bloqueado' : 'arrancó solo');
  }, 2000);
}
```
