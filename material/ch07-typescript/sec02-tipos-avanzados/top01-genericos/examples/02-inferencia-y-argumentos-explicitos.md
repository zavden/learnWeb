---
example_description: "TypeScript deduce los parámetros de tipo a partir de los argumentos (V del array, K de lo que devuelve la flecha); cuando no hay de dónde deducirlos se escriben entre < >. Con un solo T para dos argumentos, el primero decide (TS2345)"
example_tags: "typescript|genericos|inferencia|map|set|ts2345"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
type Album = { code: number; title: string; artist: string };

const albums: Album[] = [
  { code: 1042, title: 'Amor prohibido', artist: 'Selena' },
  { code: 1043, title: 'Re', artist: 'Café Tacvba' },
];

// Dos parámetros de tipo: V (los elementos) y K (las claves del índice).
function indexBy<V, K>(items: V[], getKey: (item: V) => K): Map<K, V> {
  const index = new Map<K, V>();
  for (const item of items) index.set(getKey(item), item);
  return index;
}

// V = Album (sale del array); K = number (sale de lo que devuelve la flecha).
const byCode = indexBy(albums, (album) => album.code); // Map<number, Album>
// Mismo código, otras claves: K = string.
const byArtist = indexBy(albums, (album) => album.artist.toLowerCase()); // Map<string, Album>
console.log('1043 →', byCode.get(1043)?.title);
console.log('selena →', byArtist.get('selena')?.title);

// Sin argumentos de los que deducir, se escribe el tipo entre < >:
const wishlist = new Set<string>(['Re']); // Set<string>
const plays = new Map<string, number>(); // Map<string, number>
plays.set('Re', 3);
console.log('deseos →', [...wishlist], '| reproducciones →', plays.get('Re'));
// Ojo: new Map() sin < > es Map<any, any>, y el any se cuela sin avisar.

// Un solo T para dos argumentos: TypeScript fija T con el primero (number).
function pair<T>(a: T, b: T): [T, T] {
  return [a, b];
}
console.log(pair(1042, 'web-7')); // ❌ Error TS2345 a propósito: T ya es number
// ✅ Si de verdad aceptas los dos, dilo explícitamente:
console.log(pair<number | string>(1042, 'web-7'));
```
