---
example_description: "class Steps extends Array: los métodos propios funcionan y map/filter devuelven la subclase (Symbol.species), lo que rompe un constructor con otra firma; Symbol.species devuelve Array"
example_tags: "javascript|clases|herencia|array|symbol-species|bug"
example_stage: common-error
example_importance: useful
console: true
---

# JavaScript

```javascript
// Heredar de Array: un array de verdad (length, índices, Array.isArray) con métodos propios,
// sin tocar Array.prototype (lección «Prototipos nativos»).
class Steps extends Array {
  last() {
    return this.at(-1);
  }
}
const checkout = Steps.from(['carrito', 'envío', 'pago']);
console.log('checkout →', checkout, '| last →', checkout.last());
console.log('Array.isArray →', Array.isArray(checkout), '| JSON →', JSON.stringify(checkout));

// map, filter, slice… devuelven un Steps, no un Array: crean el resultado con
// la clase del array original (la «especie», Symbol.species).
const upper = checkout.map((step) => step.toUpperCase());
console.log('map →', upper, '| ¿Steps? →', upper instanceof Steps, '| last →', upper.last());

// 🐛 Problema: un constructor con OTRA firma. Para crear el resultado,
// filter llama a new Playlist(0) y map a new Playlist(length).
class Playlist extends Array {
  constructor(name, ...songs) {
    super(...songs);
    this.name = name;
  }
}
const trip = new Playlist('Viaje', 'Oye cómo va', 'La Bamba', 'Bésame mucho');
console.log('trip →', trip.length, 'canciones |', trip.name);
const withB = trip.filter((song) => song.startsWith('B'));
console.log('🐛 filter → name:', withB.name, '| canciones:', [...withB]);
const lengths = trip.map((song) => song.length);
console.log('🐛 map → name:', lengths.name, '| ¿Playlist? →', lengths instanceof Playlist);

// ✅ Symbol.species: un getter estático que dice qué clase usar en esos métodos.
class SafePlaylist extends Array {
  static get [Symbol.species]() {
    return Array; // los resultados de map/filter serán Array normales
  }
  constructor(name, ...songs) {
    super(...songs);
    this.name = name;
  }
}
const safe = new SafePlaylist('Viaje', 'Oye cómo va', 'La Bamba', 'Bésame mucho');
const safeB = safe.filter((song) => song.startsWith('B'));
console.log('✅ filter →', safeB, '| ¿SafePlaylist? →', safeB instanceof SafePlaylist);

// 🐛 Y una sorpresa heredada de Array: new Steps(3) crea 3 huecos, no [3].
console.log('🐛 new Steps(3) →', new Steps(3), '| ✅ Steps.of(3) →', Steps.of(3));
// Si solo necesitas unos métodos, una clase que GUARDA un array (composición,
// lección «Composición y mixins») suele dar menos sorpresas que heredar de Array.
```
