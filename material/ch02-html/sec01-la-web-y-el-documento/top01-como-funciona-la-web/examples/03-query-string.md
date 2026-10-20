---
example_description: "La query string y la codificación porcentual con URLSearchParams"
example_tags: "url|query|urlsearchparams|codificacion"
example_stage: intermediate
example_importance: useful
console: true
---

# JavaScript

```javascript
// La query (?clave=valor&clave=valor) es texto ASCII: lo demás se codifica como %XX.
// URLSearchParams (JavaScript, se explica más adelante) la lee y la escribe por ti.

const params = new URLSearchParams('?q=canci%C3%B3n+triste&page=2&tag=rock&tag=pop');

console.log('q    →', params.get('q'));        // %C3%B3 son los 2 bytes UTF-8 de «ó»; + es un espacio
console.log('page →', params.get('page'), '| tipo:', typeof params.get('page'));  // ¡siempre texto!
console.log('tag  →', params.getAll('tag'));   // una clave puede repetirse
console.log('sort →', params.get('sort'));     // no existe → null

// Al revés: construir una URL con caracteres especiales
const search = new URL('https://ejemplo.com/buscar');
search.searchParams.set('q', 'café con leche');
search.searchParams.set('sort', 'precio&más'); // el & se codifica (%26): si no, partiría la query
console.log('URL generada →', search.href);
```
