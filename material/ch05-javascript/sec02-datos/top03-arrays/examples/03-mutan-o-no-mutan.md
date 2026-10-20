---
example_description: "sort() y reverse() cambian el original y devuelven el mismo array; toSorted, toReversed, with y toSpliced devuelven copias"
example_tags: "javascript|python|arrays|sort|tosorted|inmutabilidad|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// 🐛 sort() y reverse() ordenan EN EL SITIO… y además devuelven el mismo array.
// Parece que crean uno nuevo, pero han cambiado el original.
const signups = ['Lucía', 'Bruno', 'Carmen']; // en orden de inscripción
const alphabetical = signups.sort();
console.log('alphabetical →', alphabetical);             // ['Bruno', 'Carmen', 'Lucía']
console.log('🐛 signups →', signups);                    // ¡también ordenado!
console.log('¿mismo array? →', alphabetical === signups); // true: se perdió el orden original

// En Python, lista.sort() devuelve None precisamente para que no caigas en esto,
// y sorted(lista) devuelve una lista nueva.

// ✅ Las versiones «to…» (ES2023) devuelven una COPIA y no tocan el original.
const podium = ['Lucía', 'Bruno', 'Carmen'];
console.log('toSorted() →', podium.toSorted());           // sorted(podium)
console.log('toReversed() →', podium.toReversed());       // list(reversed(podium))
console.log("with(0, 'Ana') →", podium.with(0, 'Ana'));   // copia con un elemento cambiado
console.log('toSpliced(1, 1) →', podium.toSpliced(1, 1)); // copia sin el elemento 1
console.log('podium intacto →', podium);                  // ['Lucía', 'Bruno', 'Carmen']

// with no crea huecos: con un índice fuera de rango lanza RangeError.
try {
  podium.with(5, 'Ana');
} catch (error) {
  console.log('with(5, …) →', error.name, '|', error.message);
}

// En código anterior a 2023 verás la copia hecha a mano: [...podium].sort()
// (el spread [...] se explica en el ejemplo 10).
```
