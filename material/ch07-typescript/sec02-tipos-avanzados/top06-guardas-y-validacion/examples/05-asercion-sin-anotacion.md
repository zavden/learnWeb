---
example_description: "Las funciones de aserción solo funcionan si el nombre con el que se llaman tiene un tipo escrito: una flecha en una const sin anotar o un método de un objeto sin tipo dan TS2775, y llamarlas con corchetes TS2776. Con function o con la const anotada, funcionan"
example_tags: "typescript|funciones-de-asercion|asserts|ts2775|ts2776|bug"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
// 🐛 Una flecha en una const SIN tipo escrito: su tipo es inferido.
const assertText = (value: unknown, field: string): asserts value is string => {
  if (typeof value !== 'string') throw new TypeError(`${field} debe ser texto`);
};

// 🐛 Lo mismo en un método de un objeto sin tipo escrito.
const checks = {
  number(value: unknown, field: string): asserts value is number {
    if (typeof value !== 'number') throw new TypeError(`${field} debe ser un número`);
  },
};

const sku: unknown = 'MOL-01';
const price: unknown = 165;
assertText(sku, 'sku'); // ❌ Error TS2775 a propósito: assertText no tiene un tipo escrito
checks.number(price, 'price'); // ❌ Error TS2775 a propósito: checks tampoco
const validators = [checks.number];
validators[0](price, 'price'); // ❌ Error TS2776 a propósito: hay que llamarla por su nombre
console.log('las aserciones se ejecutaron, pero no estrechan:', typeof sku, typeof price);

// ✅ 1. Una declaración function siempre vale.
function assertNumber(value: unknown, field: string): asserts value is number {
  if (typeof value !== 'number') throw new TypeError(`${field} debe ser un número`);
}
// ✅ 2. O una const con el tipo de función ESCRITO.
type TextAssertion = (value: unknown, field: string) => asserts value is string;
const assertTextTyped: TextAssertion = (value, field) => {
  if (typeof value !== 'string') throw new TypeError(`${field} debe ser texto`);
};

assertTextTyped(sku, 'sku');
assertNumber(price, 'price');
console.log('✅', sku.toLowerCase(), price.toFixed(2)); // estrechados: string y number
```
