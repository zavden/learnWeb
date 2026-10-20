---
example_description: "Map: set, get, has, delete y size; recuerda el orden de inserción y se recorre con for…of"
example_tags: "javascript|python|map|diccionario"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Map es el equivalente directo del dict de Python.
const stock = new Map();

// set(clave, valor) añade o reemplaza. Devuelve el propio Map, así que se puede encadenar.
stock.set('manzana', 12).set('pera', 7).set('kiwi', 0);

console.log('get("pera") →', stock.get('pera'));        // 7
console.log('get("uva") →', stock.get('uva'));          // undefined (Python lanzaría KeyError)
console.log('has("kiwi") →', stock.has('kiwi'));        // true, aunque su valor sea 0
console.log('size →', stock.size);                      // 3 (propiedad, no método: nada de len())

stock.set('pera', 9);                                   // reemplaza: no cambia el orden
stock.delete('kiwi');                                   // true si existía

// Se recorre en orden de inserción, como un dict de Python 3.7+.
for (const [fruit, units] of stock) {
  console.log(`${fruit}: ${units} unidades`);
}

// Vistas: keys(), values() y entries() devuelven iteradores; con [...] los conviertes en arrays.
console.log('claves →', [...stock.keys()]);
console.log('valores →', [...stock.values()]);

// De objeto a Map y vuelta (Object.entries / Object.fromEntries).
const prices = new Map(Object.entries({ manzana: 0.4, pera: 0.55 }));
console.log('Map desde objeto →', prices);
console.log('objeto desde Map →', Object.fromEntries(prices));
```
