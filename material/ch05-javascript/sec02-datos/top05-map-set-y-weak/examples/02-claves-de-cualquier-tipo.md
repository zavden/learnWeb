---
example_description: "Las claves de un Map pueden ser de cualquier tipo y no se convierten: 1 y '1' son claves distintas, un objeto es una clave"
example_tags: "javascript|map|claves|identidad"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
const labels = new Map();

// 1 (number) y '1' (string) son claves DISTINTAS: Map no convierte nada.
labels.set(1, 'número uno');
labels.set('1', 'texto uno');
console.log('size →', labels.size);                 // 2
console.log('get(1) →', labels.get(1));
console.log("get('1') →", labels.get('1'));

// Un objeto puede ser clave. Se compara por IDENTIDAD (la misma referencia), no por contenido.
const ana = { name: 'Ana' };
const visits = new Map([[ana, 3]]);
console.log('get(ana) →', visits.get(ana));                    // 3
console.log("get({ name: 'Ana' }) →", visits.get({ name: 'Ana' })); // undefined: es OTRO objeto

// NaN también funciona como clave (Map usa SameValueZero, para el que NaN es igual a NaN).
const results = new Map([[NaN, 'no es un número']]);
console.log('get(NaN) →', results.get(NaN));

// > Desde Python: un dict solo admite claves hashables (no listas ni dicts) y compara por ==.
//   Map admite cualquier valor y compara por identidad, como si usara `is` con los objetos.
```
