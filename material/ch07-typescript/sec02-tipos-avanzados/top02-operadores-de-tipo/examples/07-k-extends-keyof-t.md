---
example_description: "K extends keyof T relaciona dos parámetros de tipo: getField(song, 'seconds') devuelve number y pluck(playlist, 'title') string[], porque el retorno T[K] depende de la clave; sin genérico, el retorno es la unión de todos los tipos"
example_tags: "typescript|genericos|keyof|tipos-indexados|restricciones"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

// K extends keyof T: K es una de las claves de T. T[K]: el tipo de esa propiedad.
function getField<T, K extends keyof T>(item: T, key: K): T[K] {
  return item[key];
}
// Una columna entera de una lista.
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

type Song = { title: string; artist: string; seconds: number; explicit: boolean };
const playlist: Song[] = [
  { title: 'Bésame mucho', artist: 'Consuelo Velázquez', seconds: 198, explicit: false },
  { title: 'Sabor a mí', artist: 'Álvaro Carrillo', seconds: 167, explicit: false },
];

const firstSeconds = getField(playlist[0], 'seconds'); // K = 'seconds' → number
const titles = pluck(playlist, 'title'); // K = 'title' → string[]
// getField(playlist[0], 'year') sería un error: 'year' no es una clave de Song.

// Sin K, con key: keyof Song, el retorno es la unión de TODOS los tipos de Song.
function getFieldLoose(item: Song, key: keyof Song): Song[keyof Song] {
  return item[key];
}
const looseSeconds = getFieldLoose(playlist[0], 'seconds'); // → string | number | boolean

type Checks = [
  Expect<Equal<typeof firstSeconds, number>>,
  Expect<Equal<typeof titles, string[]>>,
  Expect<Equal<typeof looseSeconds, string | number | boolean>>,
];

console.log('primera →', firstSeconds / 60 > 3 ? 'más de 3 min' : 'menos de 3 min');
console.log('títulos →', titles.join(' · '));
console.log('minutos →', (pluck(playlist, 'seconds').reduce((sum, s) => sum + s, 0) / 60).toFixed(1));
```
