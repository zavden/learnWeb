---
example_description: "Solución: ParamNames<P> con dos ramas de infer en una plantilla y recursión sobre el resto de la ruta; buildPath sustituye cada :nombre con replace, codifica con encodeURIComponent y lanza un RangeError si falta un valor; cinco comprobaciones ✓ y ningún error de tipos"
example_tags: "typescript|ejercicio|solucion|template-literal-types|infer|tipos-recursivos|rutas"
example_stage: final-solution
example_importance: important
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

type ParamNames<P extends string> =
  P extends `${string}:${infer Name}/${infer Rest}` ? Name | ParamNames<`/${Rest}`>
  : P extends `${string}:${infer Name}` ? Name
  : never;
type Params<P extends string> = { [K in ParamNames<P>]: string };

type Checks = [
  Expect<Equal<ParamNames<'/museos/:museumId'>, 'museumId'>>,
  Expect<Equal<ParamNames<'/museos/:museumId/salas/:roomId'>, 'museumId' | 'roomId'>>,
  Expect<Equal<ParamNames<'/tienda'>, never>>,
];

function buildPath<P extends string>(pattern: P, params: Params<P>): string {
  const values: Record<string, string> = params;
  return pattern.replace(/:(\w+)/g, (_match, name: string) => {
    const value = values[name];
    if (value === undefined) throw new RangeError(`Falta el parámetro «${name}» de ${pattern}`);
    return encodeURIComponent(value);
  });
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
