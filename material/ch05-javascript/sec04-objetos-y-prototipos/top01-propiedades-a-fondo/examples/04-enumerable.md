---
example_description: "Una propiedad no enumerable se lee normalmente, pero no aparece en Object.keys, for…in, JSON.stringify ni el spread"
example_tags: "javascript|python|objetos|enumerable|json"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// enumerable decide si una propiedad aparece cuando se RECORRE el objeto.
const user = { name: 'Lucía Pérez', email: 'lucia@example.com' };
Object.defineProperty(user, 'lastLoginAt', {
  value: '2026-10-11T18:42:00Z',
  writable: true,
  enumerable: false, // ← la única diferencia con una propiedad normal
  configurable: true,
});

console.log('user.lastLoginAt →', user.lastLoginAt); // se lee sin problema
console.log("'lastLoginAt' in user →", 'lastLoginAt' in user); // true: existe

// …pero todo lo que RECORRE las propiedades enumerables se la salta:
console.log('Object.keys →', Object.keys(user));
console.log('JSON.stringify →', JSON.stringify(user));
console.log('spread →', { ...user });
for (const key in user) {
  console.log('for…in →', key);
}

// Object.getOwnPropertyNames lista TODAS las claves propias (de texto),
// enumerables o no. Y propertyIsEnumerable pregunta por una en concreto.
console.log('getOwnPropertyNames →', Object.getOwnPropertyNames(user));
console.log('propertyIsEnumerable →', user.propertyIsEnumerable('lastLoginAt')); // false

// La consola también respeta el atributo: la vista previa la omite y, al
// expandir el objeto en la consola, aparece en gris.
console.log('user →', user);

// ⚠️ No es privacidad: cualquiera puede leerla. Sirve para que los recorridos,
// las copias y el JSON ignoren datos auxiliares. Así son length en los arrays
// y los métodos que heredan todos los objetos (toString, map…).
// > Desde Python: no hay un equivalente directo; lo más parecido es que
//   json.dumps(vars(obj)) incluye todo y tú filtras a mano.
```
