---
example_description: "Los helpers de iteradores (filter, map, take…) son perezosos: crean una tubería que no hace nada hasta que se consume, y cada valor la atraviesa entera antes de generar el siguiente; con arrays, cada paso crea un array completo"
example_tags: "javascript|python|iterator-helpers|perezoso|generadores|itertools"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Números naturales sin fin, avisando de cada valor que se GENERA.
function* naturals() {
  let n = 1;
  while (true) {
    console.log(`  · genero ${n}`);
    yield n++;
  }
}

// Los helpers de Iterator.prototype (Chrome 122+) devuelven OTRO iterador:
// montar la tubería no ejecuta nada todavía.
const squaresOfOdds = naturals()
  .filter((n) => n % 2 === 1)
  .map((n) => n * n)
  .take(3);
console.log('tubería montada: no se ha generado ningún número');

// toArray() la consume. Se generan solo los números necesarios (del 1 al 5).
console.log('resultado →', squaresOfOdds.toArray());

// Con arrays, cada método procesa el array ENTERO y crea uno nuevo (por etapas).
// Con helpers, cada valor recorre toda la tubería antes del siguiente.
const eagerOrder = [];
[1, 2, 3]
  .filter((n) => {
    eagerOrder.push(`filter ${n}`);
    return true;
  })
  .map((n) => eagerOrder.push(`map ${n}`));
console.log('array   →', eagerOrder.join(' · '));

const lazyOrder = [];
[1, 2, 3]
  .values()
  .filter((n) => {
    lazyOrder.push(`filter ${n}`);
    return true;
  })
  .map((n) => lazyOrder.push(`map ${n}`))
  .toArray();
console.log('helpers →', lazyOrder.join(' · '));

// Los callbacks reciben (valor, contador), no (valor, índice, array):
console.log('contador →', ['oro', 'plata', 'bronce'].values().map((medal, i) => `${i + 1}.º ${medal}`).toArray());

// > Desde Python: la tubería es una expresión generadora con islice:
//   list(islice((n * n for n in count(1) if n % 2 == 1), 3))
//   Igual de perezosa, pero se lee de dentro hacia fuera; los helpers se
//   leen de izquierda a derecha, en el orden en que se aplican.
```
