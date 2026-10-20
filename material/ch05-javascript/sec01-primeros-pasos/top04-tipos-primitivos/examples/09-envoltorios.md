---
example_description: "Por qué 'hola'.toUpperCase() funciona (envoltorios temporales) y por qué new String('hola') es una trampa"
example_tags: "javascript|tipos|envoltorios|string|bug"
example_stage: common-error
example_importance: useful
console: true
---

# JavaScript

```javascript
// Los primitivos no son objetos… y sin embargo tienen métodos:
console.log("'hola'.toUpperCase() →", 'hola'.toUpperCase());
console.log('(3.14159).toFixed(2) →', (3.14159).toFixed(2));

// Truco del motor: al pedir una propiedad a un primitivo, crea un objeto
// envoltorio temporal (String, Number, Boolean…), lo usa y lo descarta.
// Por eso un primitivo no puede guardar propiedades:
const word = 'hola';
word.color = 'rojo';  // se guarda en el envoltorio temporal… que se tira
console.log('word.color →', word.color); // undefined

// 🐛 Con new creas un envoltorio permanente: es un OBJETO, no un primitivo.
const wrapped = new String('hola');
console.log('typeof wrapped →', typeof wrapped);          // 'object'
console.log("wrapped === 'hola' →", wrapped === 'hola');  // false
console.log('wrapped →', wrapped);                        // expándelo: String {'hola'}

// ✅ Para convertir, llama a la función SIN new: devuelve un primitivo.
console.log('typeof String(42) →', typeof String(42));     // 'string'
console.log("typeof Number('42') →", typeof Number('42')); // 'number'
```
