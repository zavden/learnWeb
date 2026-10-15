---
example_description: "El contenido de un <template> está inerte: no se dibuja, sus imágenes no se descargan y sus scripts no se ejecutan hasta que lo clonas e insertas"
example_tags: "html|template|inerte|dom|contenido"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<h1>Una plantilla en reserva</h1>

<!-- Un <template> guarda un trozo de HTML listo para usarse, pero INERTE: el navegador lo
     parsea y lo recuerda, y nada más. No se dibuja, no pide la imagen y no corre el script. -->
<template id="card">
  <article class="card">
    <img src="parcela.png" alt="" onerror="window.imgError = true">
    <h2>Parcela</h2>
    <script>window.scriptRan = true;</script>
  </article>
</template>

<p id="after">Debajo del título no se ve nada del template: está en reserva.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  padding: 1rem;
}

h1 {
  font-size: 1.3rem;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo.
const tpl = document.getElementById('card');

// El template no se dibuja (la hoja de estilos del navegador le da display:none)
console.log('¿se ve el template en la página? →', tpl.offsetParent ? 'sí' : 'no (display:none)');
// Su contenido NO vive en el documento normal: está en una bolsa aparte, template.content
console.log('nodos dentro de template.content →', tpl.content.childElementCount);
console.log('¿cuántos <article> hay ya en la página? →', document.querySelectorAll('article').length);
// Prueba de que está inerte: ni el script corrió ni la imagen rota se intentó cargar
console.log('¿se ejecutó el <script> de dentro? →', window.scriptRan === true ? 'sí' : 'no');
console.log('¿intentó cargar la imagen rota? →', window.imgError === true ? 'sí' : 'no (ni se pidió)');
```
