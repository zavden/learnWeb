---
example_description: "Cuatro fallos que JavaScript solo descubre al ejecutar (o nunca): una errata en una propiedad, un argumento olvidado, aritmética con texto y un método mal escrito; TypeScript los señala antes, con su código de error"
example_tags: "typescript|errores|ts2551|ts2554|ts2362|erratas"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
type Product = { title: string; cents: number };
const mug: Product = { title: 'Taza de barro', cents: 18000 };

function formatPrice(cents: number, currency: string): string {
  return `$${(cents / 100).toFixed(2)} ${currency}`;
}

// 1. Una errata en una propiedad: JavaScript devuelve undefined sin quejarse.
console.log('1 →', mug.titel); // ❌ Error TS2551 a propósito: titel no existe (¿title?)

// 2. Un argumento olvidado: JavaScript rellena currency con undefined.
console.log('2 →', formatPrice(mug.cents)); // ❌ Error TS2554 a propósito: falta currency

// 3. Aritmética con texto: JavaScript da NaN.
console.log('3 →', mug.title * 2); // ❌ Error TS2362 a propósito: un string no se multiplica

// 4. Un método mal escrito: JavaScript lanza un TypeError al ejecutar esa línea.
try {
  console.log('4 →', mug.title.toUppercase()); // ❌ Error TS2551 a propósito: es toUpperCase
} catch (error) {
  console.log('4 → ⛔', String(error));
}

// ✅ Las versiones correctas, sin rojo:
console.log('✅', mug.title.toUpperCase(), formatPrice(mug.cents, 'MXN'));
```
