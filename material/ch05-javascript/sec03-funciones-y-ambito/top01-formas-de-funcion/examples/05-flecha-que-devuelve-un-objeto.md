---
example_description: "(city) => { label: city } devuelve undefined: las llaves se leen como bloque con una etiqueta. Con ({ … }) devuelve el objeto"
example_tags: "javascript|python|funciones|flecha|objetos|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
const cities = ['Sevilla', 'Lima', 'Bogotá'];

// 🐛 Quieres devolver un OBJETO… pero tras => una llave abre un BLOQUE.
const toOptionBug = (city) => { label: city };
console.log('🐛 toOptionBug(\'Lima\') →', toOptionBug('Lima')); // undefined
console.log('🐛 map →', cities.map(toOptionBug));            // [undefined, undefined, undefined]

// Lo que el motor ha entendido:
//   {          ← empieza el cuerpo de la función (un bloque)
//     label:   ← una ETIQUETA, como las de break/continue («Control de flujo»)
//     city     ← una expresión suelta: se evalúa y se tira
//   }          ← fin del bloque sin return → undefined
// Con DOS propiedades, (city) => { label: city, value: city } ni siquiera
// arranca: es un SyntaxError (no está aquí porque rompería todo el script).

// ✅ Envuelve el objeto entre PARÉNTESIS: ( … ) obliga a leerlo como expresión.
const toOption = (city) => ({ label: city, value: city.toLowerCase() });
console.log('✅ toOption(\'Lima\') →', toOption('Lima'));
console.table(cities.map(toOption));

// ✅ O usa cuerpo de bloque con return explícito.
const toOptionBlock = (city) => {
  return { label: city, value: city.toLowerCase() };
};
console.log('✅ con return →', toOptionBlock('Bogotá'));

// > Desde Python: lambda city: {'label': city} funciona, porque en Python
//   las llaves siempre crean un dict. En JavaScript, tras => pueden ser un bloque.
```
