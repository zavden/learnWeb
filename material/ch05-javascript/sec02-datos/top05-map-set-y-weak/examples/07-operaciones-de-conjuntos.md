---
example_description: "union, intersection, difference, symmetricDifference e isSubsetOf: las operaciones de conjuntos de Python, ahora nativas en JavaScript"
example_tags: "javascript|python|set|conjuntos"
example_stage: intermediate
example_importance: useful
console: true
---

# JavaScript

```javascript
const frontend = new Set(['html', 'css', 'js', 'ts']);
const backend = new Set(['js', 'ts', 'python', 'sql']);

// Métodos nativos desde 2024 (Chrome 122+). Cada uno devuelve un Set NUEVO.
console.log('unión (a | b) →', frontend.union(backend));
console.log('intersección (a & b) →', frontend.intersection(backend));
console.log('diferencia (a - b) →', frontend.difference(backend));
console.log('diferencia simétrica (a ^ b) →', frontend.symmetricDifference(backend));
console.log('¿{js, ts} ⊆ frontend? →', new Set(['js', 'ts']).isSubsetOf(frontend));
console.log('¿disjuntos? →', frontend.isDisjointFrom(new Set(['go'])));

// En Python son operadores (a | b, a & b…). En JavaScript no: `frontend | backend`
// convierte ambos Sets a número y da 0. Hay que usar los métodos.
console.log('frontend | backend →', frontend | backend);
```
