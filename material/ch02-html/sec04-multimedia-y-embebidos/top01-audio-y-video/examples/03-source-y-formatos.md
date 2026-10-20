---
example_description: "Varios source: el navegador usa el primero cuyo type sabe reproducir; canPlayType responde probably, maybe o una cadena vacía y currentSrc dice cuál eligió"
example_tags: "html|multimedia|video|source|formatos|codecs|canplaytype"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<!-- El mismo vídeo en dos formatos. El navegador recorre los source EN ORDEN y usa el primero
     cuyo type sabe reproducir, sin descargar los demás. Pon primero el formato más eficiente
     (WebM) y al final el más compatible (MP4 con H.264). -->
<video id="clip" controls width="640" height="360" crossorigin="anonymous">
  <source src="life.webm" type="video/webm">
  <source src="life.mp4" type="video/mp4">
  <track kind="captions" src="life-captions-es.vtt" srclang="es" label="Español (CC)">
  <p>Tu navegador no puede mostrar vídeos. <a href="life.mp4" download>Descarga el vídeo</a> (MP4, 360 KB).</p>
</video>
```

# CSS

```css
video {
  max-width: 100%;
  height: auto;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo.
// canPlayType(tipo) es la pregunta que el navegador se hace con cada type:
// 'probably' (sí), 'maybe' (quizá: falta saber el códec) o '' (no).
const clip = document.getElementById('clip');
const types = [
  'video/webm; codecs="vp9, opus"',
  'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
  'video/webm',
  'video/x-msvideo',
];
for (const type of types) {
  console.log(`${type} →`, clip.canPlayType(type) || '(vacío: no sabe reproducirlo)');
}

// currentSrc: la URL que eligió de verdad (cuando ya conoce los metadatos del vídeo)
function reportChoice() {
  console.log('Archivo elegido →', clip.currentSrc.split('/').pop());
}
if (clip.readyState >= 1) reportChoice();
else clip.addEventListener('loadedmetadata', reportChoice);
```
