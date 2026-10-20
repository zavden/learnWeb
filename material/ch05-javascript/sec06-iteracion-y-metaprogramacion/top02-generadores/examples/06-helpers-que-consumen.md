---
example_description: "Los helpers que consumen (reduce, some, every, find, forEach, toArray) y los que transforman (drop, flatMap); some, every y find paren en cuanto saben la respuesta, incluso con un generador infinito; Iterator.from para cualquier iterable"
example_tags: "javascript|python|iterator-helpers|reduce|flatmap|iterator-from"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Lecturas del sensor de un invernadero (°C), una cada 10 minutos.
const readings = [18.5, 19.2, 21.0, 23.4, 26.1, 27.8, 25.3, 22.0];

// Helpers que CONSUMEN el iterador y devuelven un resultado:
console.log('reduce (máxima) →', readings.values().reduce((max, t) => Math.max(max, t), -Infinity));
console.log('some (¿alguna > 27?) →', readings.values().some((t) => t > 27));
console.log('every (¿todas > 15?) →', readings.values().every((t) => t > 15));
console.log('find (primera > 25) →', readings.values().find((t) => t > 25));
readings.values().take(2).forEach((t, i) => console.log(`forEach → lectura ${i}: ${t} °C`));

// Helpers que TRANSFORMAN (devuelven otro iterador perezoso):
// drop(n) se salta los n primeros (las lecturas mientras el sensor se calienta).
console.log('drop(2).take(3) →', readings.values().drop(2).take(3).toArray());

// flatMap: cada valor se convierte en un iterable, y se aplanan todos.
const shifts = [
  { name: 'mañana', staff: ['Ana', 'Luis'] },
  { name: 'tarde', staff: ['Sofía'] },
];
console.log('flatMap →', shifts.values().flatMap((shift) => shift.staff).toArray());

// some, every y find paran en cuanto conocen la respuesta (y cierran el
// generador), así que funcionan incluso con uno infinito:
function* powersOfTwo() {
  let p = 1;
  while (true) {
    yield p;
    p *= 2;
  }
}
console.log('find en un infinito →', powersOfTwo().find((p) => p > 1000));

// 🛑 reduce, toArray y forEach recorren hasta el final: en un infinito, pon
//    take(n) antes o no terminarían nunca.
console.log('suma de las 10 primeras →', powersOfTwo().take(10).reduce((a, b) => a + b));

// Iterator.from da los helpers a cualquier iterable (un Set no los tiene,
// aunque su iterador set.values() sí).
const tags = new Set(['vegano', 'picante', 'sin gluten']);
console.log('Iterator.from(set) →', Iterator.from(tags).filter((tag) => tag.includes(' ')).toArray());
console.log('set.values() →', tags.values().map((tag) => tag.length).toArray());

// > Desde Python: reduce es functools.reduce, some/every son any()/all() (que
//   también paran pronto), find es next((x for x in it if p(x)), None),
//   drop(n) es islice(it, n, None) y flatMap es chain.from_iterable(map(f, it)).
```
