---
example_description: "Una misma función llamada de cinco formas: llamada simple, método, call, bind y new, y qué regla gana cuando se combinan"
example_tags: "javascript|this|reglas|bind|new|call"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Una función que dice quién es su this. 'use strict' evita que la llamada
// simple se convierta en window, para ver las reglas en limpio.
function whoAmI() {
  'use strict';
  return this?.label ?? String(this);
}

const objA = { label: 'objeto A', whoAmI };
const objB = { label: 'objeto B' };

console.log('1. llamada simple, whoAmI() →', whoAmI());           // 'undefined'
console.log('2. método, objA.whoAmI() →', objA.whoAmI());        // 'objeto A'
console.log('3. explícito, whoAmI.call(objB) →', whoAmI.call(objB)); // 'objeto B'

// bind gana a la regla del método: una función atada ignora el punto.
const boundToB = whoAmI.bind(objB);
const objC = { label: 'objeto C', whoAmI: boundToB };
console.log('4. bind gana al método, objC.whoAmI() →', objC.whoAmI()); // 'objeto B'

// new gana incluso a bind: el this es SIEMPRE el objeto recién creado.
function Badge(text) {
  this.label = text;
}
const BoundBadge = Badge.bind({ label: 'ignorado' });
console.log('5. new gana a bind, new BoundBadge(…) →', new BoundBadge('recién creado').label);

// Y una flecha ignora todas las reglas: usa el this de donde está escrita.
// (Aquí, el nivel superior del script: window.)
const arrowWhoAmI = () => (this === window ? 'window (el de fuera)' : String(this));
const objD = { label: 'objeto D', arrowWhoAmI };
console.log('6. flecha, objD.arrowWhoAmI() →', objD.arrowWhoAmI());

// Orden para decidir qué vale this:
//   ¿flecha? → el de fuera · ¿new? → objeto nuevo · ¿bind/call/apply? → el indicado
//   ¿obj.f()? → obj · si no → undefined (estricto) o window (no estricto)
```
