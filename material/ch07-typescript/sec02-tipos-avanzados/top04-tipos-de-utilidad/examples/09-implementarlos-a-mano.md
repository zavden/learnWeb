---
example_description: "Los tipos de utilidad están escritos en TypeScript con las piezas de la lección 3: MyPick, MyRecord, MyExclude, MyOmit, MyReturnType, MyParameters, MyAwaited y MyNonNullable, comprobados contra los de verdad con Expect<Equal<…>>; pick() en ejecución usa MyPick"
example_tags: "typescript|tipos-de-utilidad|tipos-mapeados|tipos-condicionales|infer|pick"
example_stage: minimal
example_importance: important
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

// Tipos mapeados (lección 3). keyof any = string | number | symbol: cualquier clave posible.
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
type MyRecord<K extends keyof any, V> = { [P in K]: V };
// Condicionales que filtran uniones (lección 3).
type MyExclude<T, U> = T extends U ? never : T;
type MyNonNullable<T> = T extends null | undefined ? never : T;
// Omit = Pick de las claves que quedan al excluir K. (K extends keyof any: por eso no comprueba.)
type MyOmit<T, K extends keyof any> = MyPick<T, MyExclude<keyof T, K>>;
// infer (lección 3); MyAwaited es recursivo: desenvuelve promesas dentro de promesas.
type MyReturnType<F extends (...args: any) => any> = F extends (...args: any) => infer R ? R : never;
type MyParameters<F extends (...args: any) => any> = F extends (...args: infer P) => any ? P : never;
type MyAwaited<T> = T extends PromiseLike<infer V> ? MyAwaited<V> : T;

type Track = { id: number; title: string; seconds: number; lyrics?: string };
const formatTrack = (track: Track, withTime: boolean): string =>
  withTime ? `${track.title} (${Math.round(track.seconds / 60)} min)` : track.title;

// Cada uno, comparado con el de la biblioteca:
type Checks = [
  Expect<Equal<MyPick<Track, 'title' | 'lyrics'>, Pick<Track, 'title' | 'lyrics'>>>,
  Expect<Equal<MyRecord<'S' | 'M', number>, Record<'S' | 'M', number>>>,
  Expect<Equal<MyExclude<'a' | 'b' | 'c', 'a'>, Exclude<'a' | 'b' | 'c', 'a'>>>,
  Expect<Equal<MyNonNullable<string | null>, NonNullable<string | null>>>,
  Expect<Equal<MyOmit<Track, 'id'>, Omit<Track, 'id'>>>,
  Expect<Equal<MyReturnType<typeof formatTrack>, ReturnType<typeof formatTrack>>>,
  Expect<Equal<MyParameters<typeof formatTrack>, Parameters<typeof formatTrack>>>,
  Expect<Equal<MyAwaited<Promise<Promise<Track>>>, Awaited<Promise<Promise<Track>>>>>,
];

// En ejecución: pick() copia unas propiedades, y su tipo de retorno es MyPick.
function pick<T, K extends keyof T>(item: T, keys: K[]): MyPick<T, K> {
  const result = {} as MyPick<T, K>; // empieza vacío; el bucle lo completa
  for (const key of keys) result[key] = item[key];
  return result;
}

const track: Track = { id: 3, title: 'Cielito lindo', seconds: 182 };
const summary = pick(track, ['title', 'seconds']); // → { title: string; seconds: number }
console.log('pick →', summary);
console.log('formato →', formatTrack(track, true));
```
