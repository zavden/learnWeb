---
example_description: "Convenciones de nombres: camelCase, PascalCase y MAYÚSCULAS; los nombres distinguen mayúsculas"
example_tags: "javascript|python|nombres|convenciones"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// Convenciones de JavaScript (en Python usarías snake_case):
const firstName = 'Grace';          // variables y funciones: camelCase
const MAX_RETRIES = 3;              // constantes de configuración: MAYÚSCULAS
function calculateTotal() {         // funciones: camelCase, a ser posible con un verbo
  return 42;
}
class ShoppingCart {}               // clases: PascalCase (igual que en Python)

console.log(firstName, MAX_RETRIES, calculateTotal(), ShoppingCart.name);

// Los nombres distinguen mayúsculas: total y Total son variables distintas.
const total = 10;
const Total = 99;
console.log('total →', total, '| Total →', Total);

// $ y _ cuentan como letras (los verás en librerías y en código antiguo).
const $price = 5;
const _internal = 'privado solo por convención';
console.log('$price →', $price, '| _internal →', _internal);

// snake_case funciona, pero no es idiomático en JavaScript:
const user_name = 'funciona, pero desentona';
console.log(user_name);

// Las palabras reservadas no sirven como nombre: let, class, function, new…
// (const class = 1; sería un error de sintaxis.)
```
