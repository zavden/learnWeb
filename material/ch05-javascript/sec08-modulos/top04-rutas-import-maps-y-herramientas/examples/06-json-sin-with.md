---
example_description: "Un JSON importado sin with { type: 'json' } no carga (el servidor dice application/json y un módulo sin atributo tiene que ser JavaScript), y un módulo JSON no tiene exportaciones con nombre: import { products } es un SyntaxError"
example_tags: "javascript|modulos|json|import-attributes|mime|bug"
example_stage: common-error
example_importance: useful
console: true
---

# JavaScript

```javascript
// Archivos que usa (assets/05-datos/):
//   catalog.json     → { "updatedAt": …, "products": [ … ] }
//   named-import.js  → 🐛 import { products } from './catalog.json' with { type: 'json' }

// 🐛 Sin el atributo, el navegador espera JavaScript; el servidor manda el
//    archivo como application/json y la carga se rechaza.
try {
  await import('./05-datos/catalog.json');
} catch (error) {
  // DevTools explica la causa en rojo: «…the server responded with a MIME
  // type of "application/json"».
  console.log('🐛 sin with →', error.name, '| no se cargó: el servidor lo envía como application/json');
}

// 🐛 Un módulo JSON solo tiene exportación por defecto: el objeto entero.
try {
  await import('./05-datos/named-import.js');
} catch (error) {
  console.log('🐛 import { products } →', error.name, '|', error.message);
}

// ✅ Con el atributo, y el objeto entero como default.
const { default: catalog } = await import('./05-datos/catalog.json', { with: { type: 'json' } });
const { products } = catalog; // desestructurar DESPUÉS
console.log('✅ productos →', products.length);

// ¿Por qué hace falta el atributo, si la extensión ya dice .json? Porque en
// la web manda el tipo MIME de la respuesta, no la extensión. El atributo
// es una promesa de lo que esperas: si un servidor comprometido devolviera
// JavaScript donde esperabas datos, el navegador se negaría a ejecutarlo.
```
