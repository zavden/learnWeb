---
example_description: "new URL(texto) analiza una dirección como el navegador: sus partes (protocol, host, port, pathname, search, hash, origin), la normaliza (puerto por defecto, mayúsculas, «..», espacios) y resuelve rutas relativas contra una base; asignar una parte reescribe href"
example_tags: "javascript|url|pathname|search|hash|rutas-relativas"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// new URL(texto) analiza la dirección con el mismo analizador del navegador.
const product = new URL('https://tienda.example:443/catalogo/cafe/chiapas?talla=500g&molido=fino#opiniones');
console.log('href →', product.href); // normalizada: sin el :443 por defecto
console.log('protocol →', product.protocol, '| host →', product.host, '| port →', JSON.stringify(product.port));
console.log('pathname →', product.pathname);
console.log('search →', product.search, '| hash →', product.hash);
console.log('origin →', product.origin);

// Resolver rutas relativas contra una BASE, como hace un <a href> en la página.
const base = 'https://tienda.example/catalogo/cafe/chiapas';
for (const relative of ['veracruz', '../cacao/tabasco', '/carrito', '?talla=1kg', '//cdn.tienda.example/logo.svg']) {
  console.log(`  ${relative.padEnd(30)} → ${new URL(relative, base).href}`);
}

// Asignar una parte reescribe href (y lo vuelve a normalizar).
product.pathname = '/catalogo/cafe/veracruz';
product.hash = '';
console.log('modificada →', product.href);

// Normalizar: esquema y host en minúsculas, «.» y «..» resueltos, espacios
// codificados como %20.
console.log('normalizada →', new URL('HTTPS://Tienda.Example/catalogo/./cafe/../ofertas de verano').href);

// Una URL se convierte sola en texto: sirve tal cual en fetch(url), en un
// href o en una plantilla. Es lo que antes hacías a mano con concatenaciones.
// > Desde Python: urllib.parse.urlparse(texto) separa las partes y
//   urljoin(base, relativa) resuelve; new URL(relativa, base) hace las dos.
```
