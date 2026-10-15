---
example_description: "try/catch como el try/except de Python: atrapar un error, imprimirlo y seguir"
example_tags: "javascript|errores|try-catch"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// try/catch es el try/except de Python. Se estudia a fondo en la lección «Errores»;
// en este módulo lo usaremos para provocar errores A PROPÓSITO
// sin que el resto del ejemplo deje de ejecutarse.
console.log('1. Antes del error');

try {
  calculateTotal(); // ❌ esta función no existe
  console.log('No se imprime: el try se abandona en la línea del error');
} catch (error) {
  // error es un objeto con name (el tipo) y message (la explicación).
  console.log('2. Atrapado →', error.name, '|', error.message);
}

console.log('3. Después del try/catch: el script sigue');

// En Python:
// try:
//     calculate_total()
// except Exception as error:
//     print("Atrapado →", type(error).__name__, "|", error)
```
