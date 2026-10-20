---
example_description: "Atajos al crear objetos: propiedades abreviadas ({ name, age }) y claves calculadas con [expresión]"
example_tags: "javascript|python|objetos|shorthand|claves-computadas"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Datos que llegan de un formulario, en variables sueltas:
const name = 'Carmen';
const email = 'carmen@example.com';
const age = 29;

// Forma larga: clave y variable con el mismo nombre, escritas dos veces.
const longForm = { name: name, email: email, age: age };

// ✅ Propiedades abreviadas (shorthand): si la clave se llama como la variable,
// basta con escribirla una vez. Es la forma habitual.
const user = { name, email, age };
console.log('longForm →', longForm);
console.log('user →', user);

// Claves calculadas: [expresión] usa el VALOR de la expresión como clave.
// (En Python, las claves de un dict siempre son expresiones: {field: value}.)
const field = 'email';
const errors = {
  [field]: 'El correo no es válido',
  [`${field}Checked`]: true,
};
console.log('errors →', errors); // { email: '…', emailChecked: true }

// 🐛 Sin corchetes, la clave es el TEXTO literal, no la variable.
const wrong = { field: 'El correo no es válido' };
console.log('sin corchetes →', wrong); // { field: '…' }

// Se combinan: un objeto de filtros construido desde variables.
const sortBy = 'price';
const direction = 'asc';
const query = { sortBy, direction, [`max_${sortBy}`]: 100 };
console.log('query →', query); // { sortBy: 'price', direction: 'asc', max_price: 100 }
```
