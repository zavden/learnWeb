---
example_description: "Las claves de un objeto siempre son strings: 1 y '1' son la misma, y dos objetos usados como clave chocan en '[object Object]'"
example_tags: "javascript|python|objetos|claves|coercion|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// 🐛 Las claves de un objeto literal son SIEMPRE strings (o símbolos).
// Cualquier otra cosa se convierte a string al usarla como clave.
const seats = {};
seats[1] = 'Ana';
console.log("seats['1'] →", seats['1']);                    // 'Ana': 1 y '1' son la misma clave
console.log('Object.keys(seats) →', Object.keys(seats));   // ['1']
console.log('typeof de la clave →', typeof Object.keys(seats)[0]); // 'string'
// En Python, d[1] y d['1'] son claves distintas.

seats[true] = 'Bruno';
console.log('claves →', Object.keys(seats)); // ['1', 'true']

// 🐛 Con objetos como clave es peor: TODOS se convierten en '[object Object]'.
const ana = { id: 1, name: 'Ana' };
const bruno = { id: 2, name: 'Bruno' };
const lastLogin = {};
lastLogin[ana] = '2026-10-01';
lastLogin[bruno] = '2026-10-12'; // pisa la entrada de Ana: es la misma clave
console.log('lastLogin →', lastLogin);            // { '[object Object]': '2026-10-12' }
console.log('lastLogin[ana] →', lastLogin[ana]);  // '2026-10-12' 🐛 la fecha de Bruno

// En Python, un dict como clave lanza TypeError (unhashable type), y una tupla
// funciona por valor. En JavaScript no hay error: solo datos mezclados.

// ✅ Para claves que no son texto, usa un Map (lección «Map, Set y WeakMap»).
const logins = new Map();
logins.set(ana, '2026-10-01');
logins.set(bruno, '2026-10-12');
console.log('Map.get(ana) →', logins.get(ana)); // '2026-10-01'

// ✅ O usa como clave un identificador de texto: lastLogin[user.id].
```
