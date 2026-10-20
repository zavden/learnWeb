---
example_description: "Rutas tipadas: infer dentro de una plantilla extrae los parámetros de '/museos/:museumId/salas/:roomId', y buildPath exige exactamente { museumId, roomId } (TS2353 con un nombre de más, TS2345 con uno de menos)"
example_tags: "typescript|template-literal-types|infer|rutas|tipos-recursivos|ts2353|ts2345"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

// infer dentro de una plantilla: «algo, luego :Nombre, luego /Resto».
// Si hay más parámetros en el Resto, el tipo se llama a sí mismo (recursión, lección 3).
type ParamNames<P extends string> =
  P extends `${string}:${infer Name}/${infer Rest}` ? Name | ParamNames<`/${Rest}`>
  : P extends `${string}:${infer Name}` ? Name
  : never;
type Params<P extends string> = { [K in ParamNames<P>]: string };

type Checks = [
  Expect<Equal<ParamNames<'/museos/:museumId/salas/:roomId'>, 'museumId' | 'roomId'>>,
  Expect<Equal<Params<'/productos/:sku'>, { sku: string }>>,
  Expect<Equal<Params<'/carrito'>, {}>>, // sin parámetros: objeto vacío
];

function buildPath<P extends string>(pattern: P, params: Params<P>): string {
  const values: Record<string, string> = params;
  return pattern.replace(/:(\w+)/g, (_match, name: string) => encodeURIComponent(values[name] ?? ''));
}

console.log(buildPath('/museos/:museumId/salas/:roomId', { museumId: 'munal', roomId: '12' }));
console.log(buildPath('/productos/:sku', { sku: 'café de olla' }));
console.log(buildPath('/carrito', {}));
console.log(buildPath('/museos/:museumId/salas/:roomId', { museumId: 'munal', room: '12' })); // ❌ Error TS2353 a propósito: room no es un parámetro
console.log(buildPath('/museos/:museumId/salas/:roomId', { museumId: 'munal' })); // ❌ Error TS2345 a propósito: falta roomId
```
