---
example_description: "symbol: valores únicos que sirven como claves de propiedad que no chocan con ninguna otra"
example_tags: "javascript|tipos|symbol"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// symbol: un valor ÚNICO que sirve de identificador. No tiene equivalente en Python.
const id1 = Symbol('id');
const id2 = Symbol('id');
console.log('typeof id1 →', typeof id1);       // 'symbol'
console.log('id1 === id2 →', id1 === id2);     // false: misma descripción, símbolos distintos
console.log('id1.description →', id1.description); // 'id' (solo sirve para depurar)

// Uso principal: claves de propiedad que no pueden chocar con ninguna otra.
const user = { name: 'Ada' };
const secretKey = Symbol('secret');
user[secretKey] = 'solo lo lee quien tenga el símbolo';

console.log('user →', user); // expándelo: verás la clave [Symbol(secret)]
console.log('user[secretKey] →', user[secretKey]);

// Object.keys lista las claves de texto (módulo «Números, texto y colecciones»):
// las claves symbol no aparecen.
console.log('Object.keys(user) →', Object.keys(user)); // ['name']

// El propio lenguaje usa símbolos «bien conocidos» para sus protocolos,
// como Symbol.iterator (módulo «Iteradores, generadores y metaprogramación»).
console.log('Symbol.iterator →', Symbol.iterator);
```
