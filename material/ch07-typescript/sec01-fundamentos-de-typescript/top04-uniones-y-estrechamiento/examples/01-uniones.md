---
example_description: "Una unión (string | number) admite un valor de cualquiera de sus tipos, pero solo deja usar lo que tienen TODOS: toString sí, toUpperCase no (TS2339, mensaje de varias líneas); un tipo fuera de la unión es TS2345"
example_tags: "typescript|python|uniones|ts2339|ts2345"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
// Una referencia de pedido: un número antiguo (1042) o un código nuevo ('web-2026-001').
// string | number se lee «string o number» (Python: str | int).
function formatReference(ref: string | number): string {
  return `#${ref.toString()}`; // ✅ toString existe en string Y en number
}

function shout(ref: string | number): string {
  return ref.toUpperCase(); // ❌ Error TS2339 a propósito: number no tiene toUpperCase
}

console.log(formatReference(1042), formatReference('web-2026-001'));
console.log('string →', shout('web-2026-001'));
try {
  console.log(shout(1042)); // el error de tipos avisaba de ESTE fallo
} catch (error) {
  console.log('⛔ number →', String(error));
}

// Un valor de otro tipo no cabe en la unión:
console.log(formatReference(true)); // ❌ Error TS2345 a propósito: boolean no es string ni number

// Un array puede mezclar los dos tipos:
const refs: (string | number)[] = [1042, 'web-2026-001', 1043];
console.log('refs →', refs.map(formatReference).join(' '));
```
