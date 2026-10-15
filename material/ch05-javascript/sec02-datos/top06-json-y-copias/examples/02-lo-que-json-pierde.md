---
example_description: "JSON.stringify descarta undefined, funciones y símbolos, convierte NaN e Infinity en null y lanza error con BigInt"
example_tags: "javascript|json|undefined|nan|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
const profile = {
  name: 'Luis',
  nickname: undefined,          // 🐛 desaparece
  greet() { return 'hola'; },   // 🐛 desaparece (las funciones no son datos JSON)
  [Symbol('id')]: 7,            // 🐛 desaparece
  score: NaN,                   // 🐛 se convierte en null
  limit: Infinity,              // 🐛 se convierte en null
  tags: ['a', undefined, 'b'],  // 🐛 en un array, undefined pasa a null (para no mover las posiciones)
};

console.log(JSON.stringify(profile));
// {"name":"Luis","score":null,"limit":null,"tags":["a",null,"b"]}

const back = JSON.parse(JSON.stringify(profile));
console.log("'nickname' in back →", 'nickname' in back);   // false: ya no existe la clave
console.log('back.score →', back.score);                   // null, no NaN

// BigInt ni siquiera se serializa: lanza un error.
try {
  JSON.stringify({ total: 10n });
} catch (error) {
  console.log('BigInt →', error.name, '|', error.message);
}

// ✅ Si necesitas conservar un valor «vacío», usa null explícitamente: null sí es JSON.
console.log(JSON.stringify({ nickname: null }));   // {"nickname":null}
```
