---
example_description: "La misma ruta relativa apunta a sitios distintos según la URL de la página (y su barra final)"
example_tags: "url|rutas|relativas|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// 🐛 Escribimos SIEMPRE src="img/logo.svg"; lo único que cambia es la página que lo contiene.
const reference = 'img/logo.svg';

console.log('en /index.html     →', new URL(reference, 'https://ejemplo.com/index.html').href);
console.log('en /blog/post.html →', new URL(reference, 'https://ejemplo.com/blog/post.html').href);

// ❌ El caso traicionero: la barra final. Sin ella, «blog» se toma como un ARCHIVO
// dentro de la raíz; con ella, «blog/» es una CARPETA. Misma página, otra imagen.
console.log('en /blog           →', new URL(reference, 'https://ejemplo.com/blog').href);
console.log('en /blog/          →', new URL(reference, 'https://ejemplo.com/blog/').href);

// ✅ Una ruta desde la raíz (/img/logo.svg) da igual dónde esté la página…
console.log('/img/logo.svg en /blog  →', new URL('/img/logo.svg', 'https://ejemplo.com/blog').href);
console.log('/img/logo.svg en /blog/ →', new URL('/img/logo.svg', 'https://ejemplo.com/blog/').href);
// …pero solo funciona si el sitio vive en la raíz del dominio (mira el ejemplo siguiente).

// ¿Contra qué URL se resuelven las rutas relativas de ESTE documento?
console.log('base de esta vista previa →', document.baseURI);
```
