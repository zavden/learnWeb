---
example_description: "Sin width y height el texto salta cuando la imagen termina de cargar; con ellos el navegador reserva el hueco desde el principio"
example_tags: "html|imagenes|width|height|layout-shift|cls"
example_stage: common-error
example_importance: important
---

# HTML

```html
<div class="column">
  <h2>❌ Sin dimensiones</h2>
  <img id="no-size" alt="Paisaje de montaña">
  <p class="after">Este párrafo empieza arriba… y baja de golpe al llegar la imagen.</p>
</div>

<div class="column">
  <h2>✅ Con width y height</h2>
  <img id="with-size" alt="Paisaje de montaña" width="480" height="320">
  <p class="after">Este párrafo no se mueve: el hueco ya estaba reservado.</p>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.column {
  display: inline-block;
  vertical-align: top;
  width: 45%;
  margin-right: 2%;
}

/* Patrón habitual: la imagen se adapta al ancho y la altura se calcula sola.
   Con los atributos width/height, el navegador conoce la proporción (480/320)
   ANTES de descargar el archivo y reserva un hueco con esa forma. */
img {
  max-width: 100%;
  height: auto;
  background: #e2e8f0;
}

.after {
  background: #fef3c7;
  padding: 6px;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Simulamos una conexión lenta:
// las imágenes reciben su src 1,5 segundos después de cargar la página.
setTimeout(() => {
  document.getElementById('no-size').src = 'mountain-480.svg';
  document.getElementById('with-size').src = 'mountain-480.svg';
}, 1500);
```
