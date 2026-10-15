---
example_description: "Ejercicio: escribe el tipo ParamNames<P> que saca los parámetros de una ruta ('/museos/:museumId/salas/:roomId' → 'museumId' | 'roomId') con infer y recursión, y la función buildPath que los sustituye, codifica cada valor y lanza un RangeError si falta alguno"
example_tags: "typescript|ejercicio|template-literal-types|infer|tipos-recursivos|tipos-mapeados|rutas"
exercise: true
exercise_title: "Rutas con parámetros"
exercise_instructions: "Al abrirlo, dos comprobaciones de tipos fallan (TS2344) y cuatro comprobaciones salen ✗. Con ParamNames = never, Params<P> es {} y las llamadas aceptan cualquier objeto sin protestar || Escribe ParamNames<P> con un tipo condicional: si P encaja en `${string}:${infer Name}/${infer Rest}`, el resultado es Name más los parámetros de `/${Rest}`; si encaja en `${string}:${infer Name}`, es Name; si no, never || Cuando ParamNames sea correcto, desaparecen los errores de tipos, y una llamada con un parámetro de más o de menos ya sería un error || Escribe buildPath: sustituye cada :nombre por el valor de params, codificado con encodeURIComponent, y lanza un RangeError si a params le falta alguno || El objetivo: las cinco comprobaciones ✓ y ningún error de tipos"
exercise_hints: "La recursión es ParamNames<`/${Rest}`> dentro de la primera rama, unida con | || Para buildPath sirve pattern.replace(/:(\\w+)/g, (_match, name: string) => …) || Dentro de buildPath, guarda params en una const values: Record<string, string> para poder leer values[name]; un parámetro que falta es undefined"
exercise_solution_example: 09-ej-rutas-con-parametros-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

// TODO 1: saca los nombres de los parámetros de una ruta (infer + recursión).
type ParamNames<P extends string> = never;
type Params<P extends string> = { [K in ParamNames<P>]: string };

type Checks = [
  Expect<Equal<ParamNames<'/museos/:museumId'>, 'museumId'>>,
  Expect<Equal<ParamNames<'/museos/:museumId/salas/:roomId'>, 'museumId' | 'roomId'>>,
  Expect<Equal<ParamNames<'/tienda'>, never>>,
];

// TODO 2: sustituye cada :nombre por su valor codificado; si falta alguno, lanza un RangeError.
function buildPath<P extends string>(pattern: P, params: Params<P>): string {
  return pattern;
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description: string, compute: () => unknown, expected: unknown): void {
  let actual: unknown;
  try {
    actual = compute();
  } catch (error) {
    actual = error instanceof RangeError ? 'lanza un RangeError' : 'lanza otro error';
  }
  if (Object.is(actual, expected)) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}
check('un parámetro', () => buildPath('/museos/:museumId', { museumId: 'munal' }), '/museos/munal');
check('dos parámetros', () => buildPath('/museos/:museumId/salas/:roomId', { museumId: 'munal', roomId: '12' }), '/museos/munal/salas/12');
check('los valores se codifican', () => buildPath('/buscar/:term', { term: 'café de olla' }), '/buscar/caf%C3%A9%20de%20olla');
check('sin parámetros', () => buildPath('/tienda', {}), '/tienda');
// Unos parámetros que llegan de fuera (JSON.parse devuelve any, así que compila) sin roomId:
const incomplete = JSON.parse('{"museumId": "munal"}');
check('si falta uno, RangeError', () => buildPath('/museos/:museumId/salas/:roomId', incomplete), 'lanza un RangeError');
```
