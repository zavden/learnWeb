---
example_description: "Los genéricos de la biblioteca estándar: Array<T> es T[], ReadonlyArray<T>, Map<K, V>, Set<T> y Promise<T> («una promesa que da un T»); await desenvuelve el T y una función async siempre devuelve Promise"
example_tags: "typescript|genericos|array|promise|map|set|async"
example_stage: minimal
example_importance: important
console: true
---

# TypeScript

```typescript
// Array<T> es el nombre genérico de T[]: los dos tipos son el mismo.
const genres: Array<string> = ['bolero', 'cumbia', 'son jarocho'];
const sameGenres: string[] = genres; // ✅ sin error: mismo tipo
const frozenGenres: ReadonlyArray<string> = genres; // = readonly string[]

// Map<K, V>: claves K, valores V. Set<T>: valores T sin repetir.
const plays = new Map<string, number>([['Bésame mucho', 12], ['Sabor a mí', 7]]);
const favorites = new Set<string>(['Sabor a mí']);

// Promise<T> se lee «una promesa que, al cumplirse, da un T».
function loadPlaylist(): Promise<string[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(['Bésame mucho', 'Sabor a mí', 'Contigo aprendí']), 100);
  });
}

// Una función async SIEMPRE devuelve Promise<…>, aunque su return sea un number.
async function countSongs(): Promise<number> {
  const songs = await loadPlaylist(); // await desenvuelve: songs es string[]
  return songs.length;
}

console.log('géneros →', sameGenres.length, '| solo lectura →', frozenGenres.join(', '));
console.log('reproducciones →', plays.get('Bésame mucho'), '| ¿favorita? →', favorites.has('Sabor a mí'));
const pending = countSongs(); // Promise<number>, todavía sin valor
console.log('pending →', pending instanceof Promise);
console.log('canciones →', await pending); // 3
```
