---
example_description: "El operador ternario (a if c else b de Python) y las asignaciones lógicas ??=, ||= y &&="
example_tags: "javascript|python|operadores|ternario|asignacion-logica"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// Ternario: condición ? valorSiSí : valorSiNo   (Python: a if cond else b)
// Ojo al orden: en JavaScript la condición va PRIMERO.
const stock = 1;
const label = stock > 0 ? 'Disponible' : 'Agotado';
console.log('label →', label);

// Es una EXPRESIÓN (produce un valor): cabe dentro de otra expresión.
console.log(`Queda ${stock} ${stock === 1 ? 'unidad' : 'unidades'}`);

// Asignaciones lógicas: abreviaturas de patrones muy comunes.
const options = { retries: 0, title: '', theme: undefined };

options.theme ??= 'light';   // asigna solo si es null o undefined
options.retries ||= 3;       // asigna si es falsy (🐛 el 0 se pierde, como con ||)
options.title &&= options.title.trim(); // asigna solo si es truthy ('' no lo es)

console.log('options →', options); // {retries: 3, title: '', theme: 'light'}

// Equivalencias (la asignación solo ocurre si hace falta):
//   a ??= b   ≈   a ?? (a = b)
//   a ||= b   ≈   a || (a = b)
//   a &&= b   ≈   a && (a = b)
```
