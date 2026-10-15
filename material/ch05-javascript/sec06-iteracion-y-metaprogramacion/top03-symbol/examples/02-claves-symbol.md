---
example_description: "Las claves symbol no salen en Object.keys, for…in, Object.entries ni JSON, pero sí en Object.getOwnPropertySymbols y Reflect.ownKeys; el spread las copia y structuredClone no; ocultas no es privadas"
example_tags: "javascript|symbol|propiedades|reflect|json|introspeccion"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Una librería de validación marca los objetos que ya revisó, sin ensuciar
// sus datos: la marca va en una clave symbol.
const validatedAt = Symbol('validatedAt');

const order = { id: 'P-2041', total: 870 };
order[validatedAt] = '2026-10-13T15:00:00Z'; // o en el literal: { [validatedAt]: … }

console.log('order →', order); // la consola sí la enseña, como [Symbol(validatedAt)]
console.log('order[validatedAt] →', order[validatedAt]);
console.log('validatedAt in order →', validatedAt in order);

// Invisible para todo lo que recorre claves de texto:
console.log('Object.keys →', Object.keys(order));
console.log('Object.entries →', JSON.stringify(Object.entries(order)));
const forIn = [];
for (const key in order) forIn.push(key);
console.log('for…in →', forIn);
console.log('JSON →', JSON.stringify(order));

// Visible si la buscas a propósito:
console.log('getOwnPropertySymbols →', Object.getOwnPropertySymbols(order));
console.log('Reflect.ownKeys →', Reflect.ownKeys(order)); // texto + símbolos (Reflect: lección «Proxy y Reflect»)

// Copias: el spread y Object.assign copian las claves symbol (enumerables);
// structuredClone (lección «JSON y copias») las descarta.
console.log('spread →', Object.getOwnPropertySymbols({ ...order }));
console.log('structuredClone →', Object.getOwnPropertySymbols(structuredClone(order)));

// ⚠️ Oculta no es privada: cualquiera puede encontrar el símbolo y usarlo.
const [foundKey] = Object.getOwnPropertySymbols(order);
order[foundKey] = 'falsificado';
console.log('tras «hackear» →', order[validatedAt]);
// Para privacidad de verdad están los campos #privados de las clases.
```
