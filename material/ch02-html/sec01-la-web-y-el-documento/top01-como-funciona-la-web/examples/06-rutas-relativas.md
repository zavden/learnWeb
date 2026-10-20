---
example_description: "Cómo se resuelve cada forma de ruta relativa contra la URL del documento"
example_tags: "url|rutas|relativas|absolutas"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Una ruta relativa («foto.png») no es una dirección completa: el navegador la completa
// con la URL del documento que la contiene. new URL(relativa, base) hace ese mismo cálculo.
const base = 'https://ejemplo.com/blog/articulo.html';
console.log('Documento →', base);

const references = [
  'foto.png',                   // misma carpeta que el documento
  './foto.png',                 // ./ = «esta carpeta»: igual que la anterior
  'img/foto.png',               // una subcarpeta
  '../foto.png',                // ../ = «sube una carpeta»
  '/foto.png',                  // empieza por / → desde la raíz del sitio
  '//cdn.ejemplo.net/foto.png', // empieza por // → mismo esquema, otro host
  'https://otro.org/foto.png',  // absoluta: se usa tal cual
  '?page=2',                    // solo cambia la query
  '#comments',                  // solo cambia el fragmento
];

// El bucle for…of se explica en el capítulo de JavaScript: aquí recorre la lista.
for (const reference of references) {
  console.log(reference.padEnd(27), '→', new URL(reference, base).href);
}
```
