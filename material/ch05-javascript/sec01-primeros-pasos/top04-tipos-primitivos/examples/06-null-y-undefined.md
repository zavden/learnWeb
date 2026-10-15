---
example_description: "Dos «vacíos»: undefined aparece solo (sin asignar, propiedad o argumento que falta) y null lo pones tú"
example_tags: "javascript|python|tipos|null|undefined"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Python tiene un solo «vacío» (None). JavaScript tiene dos:
// - undefined: «aquí todavía no hay valor» (normalmente lo pone el motor).
// - null: «aquí no hay valor, a propósito» (lo pones tú).

// Sitios donde aparece undefined sin que lo escribas:
let notAssigned;
console.log('1. variable sin asignar →', notAssigned);

const user = { name: 'Ada' };
console.log('2. propiedad que no existe →', user.email);    // Python: KeyError

const letters = ['a', 'b'];
console.log('3. índice fuera de rango →', letters[5]);     // Python: IndexError

function noReturn() {}
console.log('4. función sin return →', noReturn());         // Python: None

function greet(name) {
  return name;
}
console.log('5. argumento que no se pasó →', greet());     // Python: TypeError

// null lo escribes tú para decir «vacío a propósito».
let selectedItem = null; // todavía no se ha elegido nada
console.log('6. null explícito →', selectedItem);

// Son valores distintos, con typeof distinto:
console.log('typeof undefined →', typeof undefined, '| typeof null →', typeof null);
console.log('null === undefined →', null === undefined); // false
```
