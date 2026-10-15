---
example_description: "keyof de un tipo con firma de índice de string no es string sino string | number (en JavaScript stock[7] es stock['7']); usar la clave como texto da TS2339. keyof T & string se queda con las claves de texto"
example_tags: "typescript|python|keyof|firmas-de-indice|interseccion|ts2339|bug"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

// Existencias por SKU: una firma de índice (módulo 1, lección 3).
type Stock = { [sku: string]: number };
const stock: Stock = { 'mol-01': 12, 'caf-02': 0 };

// 🐛 keyof de una firma de índice de string NO es string: es string | number.
type StockKey = keyof Stock; // → string | number
type Checks = [Expect<Equal<StockKey, string | number>>];

// Por qué: en JavaScript las claves numéricas se convierten en texto,
// así que shelf[7] y shelf['7'] son la misma propiedad y un number también vale.
const shelf: Stock = { '7': 40 };
console.log('shelf[7] →', shelf[7], '| shelf["7"] →', shelf['7']);

function skuLabel(key: StockKey): string {
  return key.toUpperCase(); // ❌ Error TS2339 a propósito: key puede ser un number
}
try {
  console.log(skuLabel(7)); // el tipo lo permite… y falla
} catch (error) {
  console.log('🐛', String(error));
}

// ✅ & string se queda con la parte de texto: (string | number) & string → string.
function skuLabelFixed(key: keyof Stock & string): string {
  return key.toUpperCase();
}
for (const key of Object.keys(stock)) console.log('✅', skuLabelFixed(key), '→', stock[key]);
// Object.keys devuelve siempre string[], aunque las claves parezcan números:
console.log('Object.keys(shelf) →', Object.keys(shelf));
```
