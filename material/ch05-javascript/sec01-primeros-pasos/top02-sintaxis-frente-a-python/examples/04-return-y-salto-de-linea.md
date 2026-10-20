---
example_description: "Un salto de línea justo después de return hace que la función devuelva undefined"
example_tags: "javascript|asi|return|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// 🐛 Después de return, un salto de línea SIEMPRE termina la sentencia.
// ASI convierte esto en «return;» y el objeto de abajo nunca se alcanza.
function createUserBroken() {
  return
  {
    name: 'Ada'
  };
}
// Ni siquiera hay error: el motor lee las líneas de abajo como un bloque { }
// con una etiqueta «name:», que es sintaxis válida (y código muerto).

// ✅ La expresión tiene que EMPEZAR en la misma línea que return.
function createUser() {
  return {
    name: 'Ada',
  };
}

console.log('roto →', createUserBroken()); // undefined
console.log('bien →', createUser());       // {name: 'Ada'}

// La misma regla se aplica a break, continue, throw y yield:
// tras esas palabras, un salto de línea cuenta como punto y coma.
```
