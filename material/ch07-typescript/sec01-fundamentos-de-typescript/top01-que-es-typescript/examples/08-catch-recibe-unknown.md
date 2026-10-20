---
example_description: "Con strict, la variable de un catch es unknown (en JavaScript se puede lanzar cualquier valor): error.message es el error TS18046; se comprueba con instanceof Error o se convierte con String(error)"
example_tags: "typescript|strict|catch|unknown|ts18046|errores"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
function parseQuantity(text: string): number {
  const value = Number(text);
  if (!Number.isInteger(value) || value < 1) {
    throw new RangeError(`Cantidad no válida: «${text}»`);
  }
  return value;
}

try {
  parseQuantity('dos');
} catch (error) {
  // 🐛 throw admite cualquier valor (un texto, un número…), así que TypeScript
  // no sabe qué hay en error: su tipo es unknown y no deja leer .message.
  console.log('🐛', error.message); // ❌ Error TS18046 a propósito: 'error' es unknown
}

// ✅ 1. Comprueba que es un Error antes de usarlo (instanceof, del capítulo 5):
try {
  parseQuantity('0');
} catch (error) {
  if (error instanceof Error) console.log('✅', error.name, '|', error.message);
}

// ✅ 2. O conviértelo en texto, sea lo que sea lo que se lanzó:
try {
  throw 'Sin existencias'; // lanzar un string es legal en JavaScript
} catch (error) {
  console.log('✅', String(error));
}
```
