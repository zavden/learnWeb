---
example_description: "Usar un objeto como diccionario convierte las claves en strings y choca con propiedades heredadas como toString o __proto__"
example_tags: "javascript|map|objetos|claves|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// 🐛 1: las claves de un objeto se convierten en string.
const counts = {};
counts[1] = 'número';
counts['1'] = 'texto';            // sobrescribe: es la MISMA clave '1'
console.log('Object.keys(counts) →', Object.keys(counts));   // ['1']

const userA = { id: 'a' };
const userB = { id: 'b' };
const lastSeen = {};
lastSeen[userA] = 'lunes';
lastSeen[userB] = 'martes';       // ambos objetos se convierten en '[object Object]'
console.log('lastSeen →', lastSeen);                          // una sola clave

// 🐛 2: el objeto ya «tiene» claves heredadas de Object.prototype.
const dictionary = {};
console.log("'toString' in dictionary →", 'toString' in dictionary);   // true: ¡sin haberla añadido!
const word = 'constructor';
console.log(`¿existe la palabra «${word}»? →`, Boolean(dictionary[word])); // true: falso positivo

// ✅ Map no tiene ninguno de los dos problemas.
const seen = new Map([[userA, 'lunes'], [userB, 'martes']]);
console.log('seen.get(userB) →', seen.get(userB));            // 'martes'
console.log("new Map().has('constructor') →", new Map().has('constructor')); // false

// Regla práctica: objeto para «registros» con nombres de campo fijos; Map para diccionarios
// cuyas claves llegan en tiempo de ejecución (ids, palabras, objetos).
```
