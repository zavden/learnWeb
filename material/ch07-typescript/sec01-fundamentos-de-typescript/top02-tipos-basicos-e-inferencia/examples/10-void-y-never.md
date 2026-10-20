---
example_description: "void para funciones que no devuelven nada útil (devuelven undefined) y never para las que nunca terminan normalmente (siempre lanzan): después de llamar a una función never, TypeScript sabe que el valor ya no es undefined"
example_tags: "typescript|python|void|never|noreturn|funciones"
example_stage: minimal
example_importance: important
console: true
---

# TypeScript

```typescript
// void: la función no devuelve nada útil (Python: -> None).
function logOrder(id: string): void {
  console.log('pedido registrado →', id);
}
const result = logOrder('P-2001');
console.log('lo que devuelve logOrder →', result); // undefined, como en JavaScript

// never: la función NUNCA termina con normalidad: siempre lanza un error
// (Python: -> NoReturn). Ningún valor tiene el tipo never.
function fail(message: string): never {
  throw new Error(message);
}

const prices = [45, 120, 89];

function firstAbove(limit: number): number {
  const found = prices.find((p) => p > limit); // number | undefined
  if (found === undefined) fail(`Ningún precio supera $${limit}`);
  // ✅ Aquí found es number: TypeScript sabe que fail() no vuelve nunca.
  return found;
}

console.log('primer precio > 100 →', firstAbove(100));
try {
  firstAbove(500);
} catch (error) {
  console.log('⛔', String(error));
}
// never vuelve en la lección 4: sirve para comprobar que un switch cubre todos los casos.
```
