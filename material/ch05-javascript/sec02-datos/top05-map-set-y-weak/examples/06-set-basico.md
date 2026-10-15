---
example_description: "Set guarda valores sin repetir: quitar duplicados de un array, comprobar pertenencia con has y recorrer en orden de inserción"
example_tags: "javascript|python|set|duplicados"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Set = set de Python: valores únicos, en orden de inserción.
const visited = new Set();
visited.add('/inicio').add('/blog').add('/inicio');      // el segundo '/inicio' se ignora
console.log('size →', visited.size);                       // 2
console.log("has('/blog') →", visited.has('/blog'));      // true (rápido, sin recorrer)
visited.delete('/blog');
console.log('visited →', visited);

// El uso más común: quitar duplicados de un array, conservando el primer orden de aparición.
const tags = ['css', 'html', 'css', 'js', 'html'];
const uniqueTags = [...new Set(tags)];
console.log('únicos →', uniqueTags);                       // ['css', 'html', 'js']

// Con strings, cada carácter (code point) es un elemento.
console.log("letras distintas de 'banana' →", new Set('banana').size); // 3

// Igualdad SameValueZero: 0 y -0 son el mismo valor; NaN es igual a NaN.
console.log('new Set([0, -0, NaN, NaN]) →', new Set([0, -0, NaN, NaN])); // Set(2) {0, NaN}
```
