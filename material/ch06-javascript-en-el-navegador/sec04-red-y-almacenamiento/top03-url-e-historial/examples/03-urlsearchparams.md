---
example_description: "URLSearchParams lee y escribe la query: get (primer valor o null, siempre texto), getAll para claves repetidas, has, set, append, delete, size, recorrer con for…of, crear desde un objeto y la trampa de Object.fromEntries con claves repetidas"
example_tags: "javascript|urlsearchparams|query|filtros|url"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// La query de un catálogo filtrado (con o sin «?» delante, da igual).
const params = new URLSearchParams('?categoria=cafe&tueste=medio&tueste=oscuro&precio_max=200');

console.log('get(categoria) →', params.get('categoria'));
console.log('get(tueste) → solo el primero:', params.get('tueste'));
console.log('getAll(tueste) →', params.getAll('tueste'));
console.log('get(origen) →', params.get('origen')); // no está → null
console.log('has(precio_max) →', params.has('precio_max'), '| es texto:', typeof params.get('precio_max'));

// Escribir: set sustituye, append añade otro valor, delete quita la clave.
params.set('categoria', 'cacao');
params.append('tueste', 'claro');
params.delete('precio_max');
console.log('toString() →', params.toString());
console.log('size →', params.size);
for (const [key, value] of params) {
  console.log(`  ${key} = ${value}`);
}

// Desde un objeto (los números se convierten en texto)…
const filters = { categoria: 'cafe', molido: 'fino', pagina: 2 };
console.log('desde un objeto →', new URLSearchParams(filters).toString());

// …y de vuelta a objeto con Object.fromEntries, que PIERDE los repetidos.
const repeated = new URLSearchParams('tueste=medio&tueste=oscuro');
console.log('Object.fromEntries →', Object.fromEntries(repeated), '| getAll →', repeated.getAll('tueste'));

// Los valores son SIEMPRE strings: Number(params.get('pagina')) si necesitas
// un número, y cuidado con '0' o 'false', que como texto son truthy.
// > Desde Python: parse_qs devuelve siempre listas ({'tueste': ['medio',
//   'oscuro']}); URLSearchParams separa get (el primero) y getAll (todos).
```
