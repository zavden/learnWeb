---
example_description: "La trampa has decide qué responde el operador in (el __contains__ de Python) y ownKeys qué claves ven Object.keys, for…in y JSON: un horario con in y un objeto que oculta sus claves internas"
example_tags: "javascript|python|proxy|has|ownkeys|contains"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// 1. has: el operador in. Un horario de atención de 9 a 18 h que responde a
//    «¿está esta hora dentro?» sin guardar ninguna propiedad.
const businessHours = new Proxy({}, {
  has(target, key) {
    const hour = Number(key); // in convierte el número en string: llega '14'
    return Number.isInteger(hour) && hour >= 9 && hour < 18;
  },
});
console.log('14 in businessHours →', 14 in businessHours);
console.log('20 in businessHours →', 20 in businessHours);
console.log('9.5 in businessHours →', 9.5 in businessHours);

// 2. ownKeys (+ get y has): un objeto que esconde sus claves «internas» (_x).
const isInternal = (key) => typeof key === 'string' && key.startsWith('_');

const user = new Proxy(
  { name: 'Lucía Méndez', email: 'lucia@example.com', _passwordHash: 'f3a9…', _loginAttempts: 2 },
  {
    ownKeys(target) {
      return Reflect.ownKeys(target).filter((key) => !isInternal(key));
    },
    has(target, key) {
      return !isInternal(key) && key in target;
    },
    get(target, key, receiver) {
      return isInternal(key) ? undefined : Reflect.get(target, key, receiver);
    },
  },
);

console.log('Object.keys →', Object.keys(user));
console.log('JSON →', JSON.stringify(user));
const forIn = [];
for (const key in user) forIn.push(key);
console.log('for…in →', forIn);
console.log("'_passwordHash' in user →", '_passwordHash' in user);
console.log('user._passwordHash →', user._passwordHash);

// (Esto es ocultar, no proteger: quien tenga el objeto original lo ve todo.
//  Para datos privados de verdad, los #privados de las clases.)

// > Desde Python: has es __contains__ (x in obj). Python separa «x in obj»
//   (elementos) de hasattr(obj, 'x') (atributos); en JavaScript in solo
//   pregunta por propiedades, y la trampa has lo intercepta.
```
