---
example_description: "Asignar un objeto no lo copia: las dos variables apuntan al mismo objeto, y === compara referencias, no contenido"
example_tags: "javascript|python|referencias|objetos|igualdad"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Los primitivos se copian por valor…
let a = 10;
let b = a;
b += 1;
console.log('a, b →', a, b);   // 10 11

// …los objetos (y arrays) se comparten por referencia.
const original = { city: 'Sevilla', tags: ['sol'] };
const alias = original;         // NO es una copia: es otra flecha al mismo objeto
alias.city = 'Cádiz';
console.log('original.city →', original.city);   // 'Cádiz'
console.log('alias === original →', alias === original);   // true: el mismo objeto

// === entre objetos compara IDENTIDAD, nunca contenido.
console.log("{ x: 1 } === { x: 1 } →", { x: 1 } === { x: 1 });   // false
console.log('[1, 2] === [1, 2] →', [1, 2] === [1, 2]);             // false

// Para comparar contenido no hay operador: hay que comparar campo a campo
// (o, para datos sencillos, comparar sus JSON).
console.log('mismo JSON →', JSON.stringify({ x: 1 }) === JSON.stringify({ x: 1 }));   // true

// > Desde Python: es el mismo modelo que en Python (b = a no copia una lista).
//   La diferencia: en Python, == compara contenido y `is` identidad; en JS, === solo identidad.
```
