---
example_description: "picture y source con media: una imagen distinta (encuadre horizontal o vertical) según el ancho, con img como respaldo obligatorio"
example_tags: "html|imagenes|picture|source|responsive"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<!-- «Dirección de arte»: no es la misma foto en otro tamaño, sino otro ENCUADRE.
     El navegador usa el primer <source> cuyo media se cumpla; si ninguno, el <img>. -->
<picture>
  <source media="(min-width: 700px)" srcset="scene-wide.svg">
  <img id="scene" src="scene-tall.svg" alt="Puerto pesquero al atardecer" width="600" height="800">
</picture>

<p id="report">…</p>
<p class="hint">El &lt;source&gt; solo vale desde 700px de ancho: estrecha la vista previa (o ábrela con ↗ y cambia el tamaño de la ventana) para ver el cambio de encuadre.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* El estilo y el alt van siempre en el <img>: <picture> y <source> solo eligen el archivo. */
img {
  max-width: 100%;
  height: auto;
}

.hint {
  color: #475569;
  font-size: 0.9rem;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo.
const scene = document.getElementById('scene');
function report() {
  document.getElementById('report').textContent =
    `viewport ${window.innerWidth}px → archivo: ${scene.currentSrc.split('/').pop()}`;
}
scene.complete ? report() : scene.addEventListener('load', report);
```
