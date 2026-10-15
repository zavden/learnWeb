---
example_description: "Un iterador solo se recorre una vez: map.values() usado en dos bucles da NaN en silencio y un map.entries() guardado devuelve [] la segunda vez; pasa el iterable o convierte a array una vez"
example_tags: "javascript|python|iteradores|map|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
const prices = new Map([
  ['Café de Chiapas', 210],
  ['Pan de muerto', 45],
  ['Mole poblano', 160],
]);

// Recorre los valores DOS veces: una para el máximo y otra para la media.
function priceStats(values) {
  let max = -Infinity;
  for (const pesos of values) max = Math.max(max, pesos);
  let sum = 0;
  let count = 0;
  for (const pesos of values) {
    sum += pesos;
    count += 1;
  }
  return { max, average: sum / count };
}

// 🐛 prices.values() es un ITERADOR: el primer bucle lo gasta y el segundo
//    no ve nada (0 / 0 = NaN). Ningún error, ningún aviso.
console.log('🐛 con un iterador →', priceStats(prices.values()));

// ✅ Un array es un ITERABLE: cada for…of pide un iterador nuevo.
console.log('✅ con un array →', priceStats([...prices.values()]));

// 🐛 Lo mismo con un iterador guardado en una variable:
const entries = prices.entries();
console.log('primera vez →', [...entries].length, 'pares');
console.log('🐛 segunda vez →', [...entries].length, 'pares');

// ✅ Guarda el iterable (prices) y pide entries() cada vez que lo necesites…
console.log('✅ pidiendo otro →', [...prices.entries()].length, 'pares');

// ✅ …o, si recibes algo que podría ser un iterador, conviértelo a array UNA vez.
//    Un iterador se reconoce porque [Symbol.iterator]() se devuelve a sí mismo.
function reusable(iterable) {
  return iterable[Symbol.iterator]() === iterable ? [...iterable] : iterable;
}
console.log('✅ reusable →', priceStats(reusable(prices.values())));

// > Desde Python: cuidado con la analogía. dict.values() es una VISTA que se
//   puede recorrer muchas veces; map.values() se parece a iter(d.values()),
//   que se gasta. Los map(), zip() y generadores de Python se gastan igual.
```
