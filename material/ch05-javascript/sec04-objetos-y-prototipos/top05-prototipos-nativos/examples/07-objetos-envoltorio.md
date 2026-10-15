---
example_description: "new String, new Number y new Boolean crean objetos, no primitivos: typeof 'object', === falla y new Boolean(false) es verdadero. Para convertir, sin new"
example_tags: "javascript|prototipos|primitivos|wrappers|coercion|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Las constructoras String, Number y Boolean se pueden llamar con new…
// y entonces crean un OBJETO envoltorio permanente, no un primitivo.
const objectCode = new String('MX');
const primitiveCode = 'MX';

console.log('🐛 typeof new String(…) →', typeof objectCode);        // 'object'
console.log('🐛 new String(…) === "MX" →', objectCode === primitiveCode); // false: objeto frente a primitivo
console.log('new String(…) == "MX" →', objectCode == primitiveCode);     // true: == lo convierte
console.log('🐛 dos objetos iguales →', new String('MX') === new String('MX')); // false: referencias distintas

// 🐛 El peor caso: un objeto SIEMPRE es truthy, aunque envuelva false.
const isBlocked = new Boolean(false);
if (isBlocked) {
  console.log('🐛 new Boolean(false) entra en el if: el usuario queda bloqueado');
}

// La consola los distingue: los muestra como objetos.
console.log('objectCode →', objectCode);         // String {'MX'}
console.log('new Number(42) →', new Number(42)); // Number {42}

// ✅ Llamadas SIN new, String, Number y Boolean CONVIERTEN y devuelven un primitivo:
console.log('✅ String(42) →', typeof String(42), String(42));
console.log('✅ Number("42.5") →', typeof Number('42.5'), Number('42.5'));
console.log('✅ Boolean("") →', typeof Boolean(''), Boolean(''));

// Si alguna vez recibes un envoltorio, valueOf devuelve el primitivo de dentro:
console.log('✅ objectCode.valueOf() === "MX" →', objectCode.valueOf() === primitiveCode); // true

// Regla: nunca escribas new String / new Number / new Boolean. (BigInt y
// Symbol ni siquiera lo permiten: new Symbol() lanza TypeError.)
```
