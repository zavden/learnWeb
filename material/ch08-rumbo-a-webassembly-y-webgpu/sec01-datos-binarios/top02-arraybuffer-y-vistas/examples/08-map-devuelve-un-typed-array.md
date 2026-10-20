---
example_description: "map() y filter() de un typed array devuelven otro typed array del mismo tipo, así que u8.map(x => x * 2) se desborda y los decimales desaparecen; Array.from(typed, fn) da un Array normal; JSON.stringify convierte un typed array en un objeto con claves numéricas"
example_tags: "javascript|python|typed-arrays|map|array-from|json|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Lecturas de un sensor de luz, guardadas como bytes (0-255).
const readings = Uint8Array.of(90, 140, 210);

// 🐛 map devuelve OTRO Uint8Array: cada resultado se guarda en un byte.
console.log('🐛 × 2 →', readings.map((value) => value * 2));          // 280 y 420 dan la vuelta
console.log('🐛 en % →', readings.map((value) => (value / 255) * 100)); // sin decimales
// filter y slice también devuelven el mismo tipo:
console.log('filter →', readings.filter((value) => value > 100));

// ✅ Array.from(typedArray, función) aplica la función y devuelve un Array normal.
console.log('✅ × 2 →', Array.from(readings, (value) => value * 2));
console.log('✅ en % →', Array.from(readings, (value) => Math.round((value / 255) * 100)));
// ✅ O conviértelo primero: [...readings] es un Array.
console.log('✅ spread →', [...readings].map((value) => value * 2));

// 🐛 JSON no conoce los typed arrays: los guarda como un objeto con claves «0», «1»…
console.log('🐛 JSON →', JSON.stringify({ sensor: 'sala-2', readings }));
// ✅ Pásalo a Array antes de serializar:
console.log('✅ JSON →', JSON.stringify({ sensor: 'sala-2', readings: Array.from(readings) }));
// Al volver, Uint8Array.from(array) recupera el typed array.

// Una diferencia a tu favor: sort() de un typed array ordena por NÚMERO,
// no como texto (el sort de Array que viste en la lección «Arrays»).
console.log('Array sort →', [100, 25, 9].sort(), '| Uint8Array sort →', Uint8Array.of(100, 25, 9).sort());

// numpy funciona igual: (np.array([210], dtype=np.uint8) * 2) también se desborda.
```
