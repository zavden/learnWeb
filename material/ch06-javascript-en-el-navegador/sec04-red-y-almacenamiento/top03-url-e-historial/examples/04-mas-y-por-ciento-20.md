---
example_description: "En la query, URLSearchParams escribe los espacios como + y encodeURIComponent como %20; mezclar las dos formas deja «+» en el texto, un + escrito a mano se lee como espacio (el +52 de un teléfono) y un & sin codificar corta el valor. Construir y leer siempre con URLSearchParams"
example_tags: "javascript|urlsearchparams|encodeuricomponent|codificacion|query|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Una búsqueda con espacios y acentos, y un teléfono con prefijo.
const params = new URLSearchParams({ q: 'café de olla', tel: '+52 55 1234 5678' });
console.log('URLSearchParams escribe →', params.toString());
console.log('encodeURIComponent escribe →', encodeURIComponent('café de olla'));

// 🐛 1. Leer con decodeURIComponent lo que escribió URLSearchParams: los +
//    no son espacios para decodeURIComponent.
const rawQ = params.toString().split('&')[0].slice('q='.length);
console.log('🐛 decodeURIComponent →', decodeURIComponent(rawQ));

// 🐛 2. Escribir la query a mano: en una query, + significa espacio.
const handMade = new URLSearchParams('tel=+52 55 1234 5678');
console.log('🐛 tel escrito a mano →', JSON.stringify(handMade.get('tel')));

// 🐛 3. Pegar un valor con & en una plantilla: el & empieza otro parámetro.
const broken = new URL(`https://tienda.example/buscar?q=${'Café & cacao'}`);
console.log('🐛 & sin codificar → q:', JSON.stringify(broken.searchParams.get('q')), '| claves:', [...broken.searchParams.keys()]);

// ✅ Construye y lee con la misma herramienta: url.searchParams.
const url = new URL('https://tienda.example/buscar');
url.searchParams.set('q', 'Café & cacao');
url.searchParams.set('tel', '+52 55 1234 5678');
console.log('✅', url.href);
console.log('✅ leído →', url.searchParams.get('q'), '|', url.searchParams.get('tel'));

// Dos codificaciones conviven: la de los formularios (application/x-www-
// form-urlencoded: espacio → +), que usa URLSearchParams, y la de las URLs
// (espacio → %20), que usan encodeURIComponent y la ruta (pathname). Las dos
// codifican el + de verdad como %2B. Lo que falla es MEZCLARLAS.
// > Desde Python: urllib.parse.quote_plus / urlencode (+) frente a quote (%20).
```
