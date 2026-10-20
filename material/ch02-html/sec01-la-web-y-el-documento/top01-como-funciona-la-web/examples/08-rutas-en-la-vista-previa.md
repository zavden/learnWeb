---
example_description: "Imagen rota: una ruta que empieza por / se busca en la raíz del servidor"
example_tags: "url|rutas|img|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<h1>Dos imágenes, dos rutas</h1>

<!-- ✅ Relativa: se resuelve contra la URL de este documento, que vive junto a assets/ -->
<p><code>src="img/logo.svg"</code></p>
<img src="img/logo.svg" alt="Logo cargado con una ruta relativa" width="160" height="60">

<!-- ❌ Desde la raíz: /img/logo.svg se pide a http://localhost:3001/img/logo.svg,
     donde no hay nada (404). El navegador muestra el icono de imagen rota y el texto
     del atributo alt. -->
<p><code>src="/img/logo.svg"</code></p>
<img src="/img/logo.svg" alt="Logo roto: ruta desde la raíz" width="160" height="60">
```

# JavaScript

```javascript
// La propiedad src de una imagen (JavaScript) devuelve la URL YA RESUELTA:
// así ves exactamente qué pidió el navegador en cada caso.
console.log('documento →', location.href);
console.log('img 1     →', document.images[0].src);
console.log('img 2     →', document.images[1].src);
```
