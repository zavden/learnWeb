---
example_description: "input type=\"file\" con accept y multiple: el navegador da a la página el nombre, el tipo y el tamaño de cada archivo, pero nunca su ruta real"
example_tags: "html|formularios|file|accept|multiple|fakepath"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<!-- Elige una o varias imágenes y mira la consola.
     (onchange ejecuta JavaScript al elegir; los eventos llegan en el capítulo de JavaScript.) -->
<form action="https://huerta.example/galeria" method="post" enctype="multipart/form-data">
  <p>
    <label for="photos">Fotos de tu huerto (JPG, PNG o WebP)</label><br>
    <!-- accept: filtra el selector de archivos por tipo o extensión. Es una ayuda, no una
         garantía: el usuario puede elegir «Todos los archivos» y el servidor debe comprobarlo.
         multiple: permite elegir varios archivos a la vez. -->
    <input id="photos" name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple onchange="listFiles(this)">
  </p>
  <button type="submit">Subir fotos</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. input.files es la lista de archivos elegidos.
function listFiles(input) {
  // Por privacidad, la página nunca conoce la ruta real del archivo en tu disco:
  // value siempre empieza por C:\fakepath\, también en macOS y en Linux
  console.log('value →', input.value);
  for (const file of input.files) {
    console.log(`${file.name} · ${file.type} · ${file.size} bytes`);
  }
}
```
