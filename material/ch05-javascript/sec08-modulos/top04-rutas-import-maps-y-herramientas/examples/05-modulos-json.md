---
example_description: "Importar un archivo JSON como módulo: import catalog from './catalog.json' with { type: 'json' } (o con import() y la opción with); el JSON llega como exportación por defecto, ya convertido en objeto"
example_tags: "javascript|python|modulos|json|import-attributes"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// Archivos que usa: assets/05-datos/catalog.json y assets/05-datos/shipping.json
// «with { type: 'json' }» es un ATRIBUTO del import: le dice al navegador
// que espera datos JSON, no código (Chrome 123+).
import catalog from './05-datos/catalog.json' with { type: 'json' };

console.log('actualizado →', catalog.updatedAt);
console.log('productos →', catalog.products.map((product) => product.sku));

// Con import(), el atributo va en un segundo argumento.
const { default: shipping } = await import('./05-datos/shipping.json', { with: { type: 'json' } });
console.log('envío estándar →', shipping.standardCents, '| gratis desde →', shipping.freeFromCents);

// Es un módulo como cualquier otro: se carga una vez y el objeto es
// COMPARTIDO (y modificable) entre todos los que lo importan.
const again = await import('./05-datos/catalog.json', { with: { type: 'json' } });
console.log('¿el mismo objeto? →', again.default === catalog);

// Para datos que cambian mientras la página está abierta (una API), se usa
// fetch (capítulo 6): un módulo JSON se lee una sola vez.
// > Desde Python: json.load(open('catalog.json')) lee el archivo cada vez;
//   aquí, el JSON se convierte en un módulo más del mapa de módulos.
```
