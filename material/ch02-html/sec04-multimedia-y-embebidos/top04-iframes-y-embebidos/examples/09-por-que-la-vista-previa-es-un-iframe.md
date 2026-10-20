---
example_description: "La vista previa de LearnWeb es un iframe: este script escribe dónde corre, y da resultados distintos en una tarjeta de teoría (about:srcdoc, origen null) y en el diálogo «▶ Run» o el editor (http://localhost:3001)"
example_tags: "html|iframe|location|srcdoc|origen|vista-previa"
example_stage: intermediate
example_importance: useful
console: true
---

# HTML

```html
<!-- Los valores los escribe el script de abajo: compáralos en la tarjeta y en el diálogo. -->
<dl class="where">
  <dt>location.href</dt>
  <dd id="href"></dd>
  <dt>location.origin</dt>
  <dd id="origin"></dd>
  <dt>¿Dentro de otra página?</dt>
  <dd id="framed"></dd>
</dl>
```

# CSS

```css
.where {
  margin: 0.75rem;
  font: 14px/1.4 system-ui, sans-serif;
}

.where dt {
  font-weight: 700;
}

.where dd {
  margin: 0 0 0.5rem;
  font-family: ui-monospace, Menlo, monospace;
  overflow-wrap: anywhere;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo.
// Todo lo que ves en LearnWeb corre dentro de un <iframe>. Este script lo demuestra:
// escribe la dirección de la página, su origen y si está dentro de otra página.
const href = window.location.href;
const pageOrigin = window.location.origin;
const framed = window.top !== window.self ? 'sí, soy un iframe' : 'no, soy la pestaña';

document.querySelector('#href').textContent = href;
document.querySelector('#origin').textContent = pageOrigin;
document.querySelector('#framed').textContent = framed;

console.log('location.href →', href);
console.log('location.origin →', pageOrigin);
console.log('¿estoy dentro de otra página? →', framed);

// Compara los resultados según dónde lo veas:
//
//  • En una TARJETA de la teoría (la vista pequeña, sin consola):
//      location.href  → "about:srcdoc"      (un documento escrito en el atributo srcdoc)
//      location.origin → "null"             (origen opaco: un sandbox sin allow-same-origin)
//    Por eso, cuando un ejemplo pide subtítulos o datos de la carpeta assets/, necesita
//    crossorigin y CORS: para ese marco, todo es «de otro origen».
//
//  • En el DIÁLOGO que se abre al hacer clic en la tarjeta, o en el EDITOR:
//      location.href  → "http://localhost:3001/preview/ch02-html/.../index.html"
//      location.origin → "http://localhost:3001"
//    La vista previa es una PÁGINA DE VERDAD, servida en el puerto 3001, distinto del 5174
//    de la aplicación: así el ejemplo es de OTRO origen que el editor y no puede tocarlo,
//    pero tiene almacenamiento real, rutas a assets/ y todo lo de una web normal.
```
